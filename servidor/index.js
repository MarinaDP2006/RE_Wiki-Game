// ============================================================
// UMBRELLA ARCHIVES · Servidor
// Un único servicio de Render que:
//   1) publica la web (carpeta web/) tal cual, y
//   2) ofrece una API en /api que lee y escribe en MySQL.
// Arranque local (desde servidor/):  npm run dev
// ============================================================
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import crearAlmacenMySQL from "express-mysql-session";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { pool } from "./bd.js";

const PUERTO = process.env.PORT || 3000;
const PRODUCCION = process.env.NODE_ENV === "production";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CARPETA_WEB = fileURLToPath(new URL("../web/", import.meta.url));

if (!process.env.SESSION_SECRET) {
  if (PRODUCCION) throw new Error("Falta la variable de entorno SESSION_SECRET.");
  console.warn("[Sesiones] SESSION_SECRET no definida: se usa una de desarrollo.");
}

// ---------- Secciones de la wiki ----------
// Nombre en la URL → tabla de MySQL. "lista" son las tablas hijas (1 a N)
// que se devuelven como un array dentro de la ficha.
const SECCIONES = {
  juegos: { lista: { campo: "protagonistas", tabla: "juego_protagonistas", clave: "juego_id", valor: "nombre" } },
  personajes: { lista: { campo: "galeria", tabla: "personaje_imagenes", clave: "personaje_id", valor: "imagen" } },
  criaturas: { lista: { campo: "galeria", tabla: "criatura_imagenes", clave: "criatura_id", valor: "imagen" } },
  virus: {},
  organizaciones: {},
  lugares: {},
  peliculas: { lista: { campo: "protagonistas", tabla: "pelicula_protagonistas", clave: "pelicula_id", valor: "nombre" } },
  cronologia: {}
};

// primera_aparicion (MySQL) → primeraAparicion (JavaScript)
const aCamel = fila => Object.fromEntries(Object.entries(fila).map(([k, v]) => [k.replace(/_(\w)/g, (_, l) => l.toUpperCase()), v]));

async function leerFichas(seccion, id) {
  const { lista } = SECCIONES[seccion];
  // El nombre de la tabla sale de SECCIONES (lista cerrada), nunca del usuario;
  // los valores sí pueden venir del usuario, por eso van siempre con "?".
  const [filas] = id
    ? await pool.query(`SELECT * FROM ${seccion} WHERE id = ?`, [id])
    : await pool.query(`SELECT * FROM ${seccion} ORDER BY orden`);
  const fichas = filas.map(aCamel);
  if (lista && fichas.length) {
    const [hijas] = await pool.query(
      `SELECT ${lista.clave} AS ficha, ${lista.valor} AS valor FROM ${lista.tabla} WHERE ${lista.clave} IN (?) ORDER BY orden`,
      [fichas.map(f => f.id)]
    );
    for (const f of fichas) f[lista.campo] = hijas.filter(h => h.ficha === f.id).map(h => h.valor);
  }
  return fichas;
}

// ---------- Aplicación ----------
const app = express();
app.set("trust proxy", 1); // Render pasa las peticiones por un proxy HTTPS
app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY" });
  next();
});

const MySQLStore = crearAlmacenMySQL(session);
app.use(session({
  name: "umbrella.sid",
  secret: process.env.SESSION_SECRET || "solo-para-desarrollo",
  store: new MySQLStore({ createDatabaseTable: false, schema: { tableName: "sesiones" } }, pool),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: PRODUCCION, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

const api = express.Router();
app.use("/api", api);

// Envuelve cada ruta para que un error de MySQL acabe en el manejador de errores.
const ruta = fn => (req, res, next) => fn(req, res, next).catch(next);

// ---------- Wiki pública ----------
// Render lo consulta para saber si el servicio está vivo. Responde 200 aunque
// MySQL falle, para que el despliegue no se bloquee; "bd" indica si hay conexión.
api.get("/estado", async (req, res) => {
  const bd = await pool.query("SELECT 1").then(() => true, () => false);
  res.json({ ok: true, bd });
});

api.get("/config", (req, res) => res.json({ googleClientId: GOOGLE_CLIENT_ID }));

api.get("/wiki/:seccion", ruta(async (req, res) => {
  if (!(req.params.seccion in SECCIONES)) return res.status(404).json({ error: "Sección desconocida." });
  res.json(await leerFichas(req.params.seccion));
}));

api.get("/wiki/:seccion/:id", ruta(async (req, res) => {
  if (!(req.params.seccion in SECCIONES)) return res.status(404).json({ error: "Sección desconocida." });
  const [ficha] = await leerFichas(req.params.seccion, req.params.id);
  if (!ficha) return res.status(404).json({ error: "Expediente no encontrado." });
  res.json(ficha);
}));

// Búsqueda en todas las secciones con LIKE. El cotejamiento utf8mb4_general_ci
// ignora mayúsculas y tildes: "nemesis" encuentra "Némesis".
api.get("/buscar", ruta(async (req, res) => {
  const termino = String(req.query.q || "").trim().slice(0, 60);
  if (!termino) return res.json([]);
  const patron = `%${termino.replace(/[\\%_]/g, c => "\\" + c)}%`;
  const consultas = Object.keys(SECCIONES).map((seccion, i) =>
    `SELECT '${seccion}' AS seccion, ${i} AS posicion, id, nombre, resumen, imagen, orden FROM ${seccion}
     WHERE nombre LIKE ? OR resumen LIKE ? OR descripcion LIKE ?`);
  const [filas] = await pool.query(
    consultas.join(" UNION ALL ") + " ORDER BY posicion, orden LIMIT 100",
    Object.keys(SECCIONES).flatMap(() => [patron, patron, patron])
  );
  res.json(filas.map(({ posicion, ...f }) => f));
}));

// ---------- Usuarios y sesión ----------
const limiteAcceso = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { error: "Demasiados intentos. Espera unos minutos." } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATOS_PUBLICOS = "id, email, nombre, foto, proveedor, rol";

// Inicia la sesión: regenerate() cambia el identificador de la cookie para
// que nadie pueda reutilizar uno anterior (fijación de sesión).
function abrirSesion(req, usuarioId) {
  return new Promise((resolver, rechazar) =>
    req.session.regenerate(error => {
      if (error) return rechazar(error);
      req.session.usuarioId = usuarioId;
      req.session.save(e => (e ? rechazar(e) : resolver()));
    }));
}

async function usuarioPorId(id) {
  await pool.query("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?", [id]);
  const [[usuario]] = await pool.query(`SELECT ${DATOS_PUBLICOS} FROM usuarios WHERE id = ?`, [id]);
  return usuario;
}

api.post("/auth/registro", limiteAcceso, ruta(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!EMAIL.test(email) || email.length > 190) return res.status(400).json({ error: "El correo no tiene un formato válido." });
  if (password.length < 6 || password.length > 72) return res.status(400).json({ error: "La contraseña debe tener entre 6 y 72 caracteres." });

  const hash = await bcrypt.hash(password, 10);
  try {
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (email, nombre, proveedor, password_hash) VALUES (?, ?, 'email', ?)",
      [email, email.split("@")[0].slice(0, 100), hash]
    );
    await abrirSesion(req, resultado.insertId);
    res.status(201).json(await usuarioPorId(resultado.insertId));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ya hay una cuenta con ese correo. Pulsa «Iniciar sesión con email»." });
    throw error;
  }
}));

api.post("/auth/login", limiteAcceso, ruta(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const [[usuario]] = await pool.query("SELECT id, password_hash FROM usuarios WHERE email = ?", [email]);
  if (usuario && !usuario.password_hash) return res.status(400).json({ error: "Esta cuenta se creó con Google. Pulsa «Continuar con Google»." });
  // Mismo mensaje si el correo no existe o la contraseña falla: así no se revela qué correos están registrados.
  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  await abrirSesion(req, usuario.id);
  res.json(await usuarioPorId(usuario.id));
}));

// Google Identity Services envía un "credential" (token JWT firmado por Google).
// El servidor comprueba la firma y que el token es para nuestro Client ID.
const clienteGoogle = new OAuth2Client();
api.post("/auth/google", limiteAcceso, ruta(async (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.status(503).json({ error: "El acceso con Google no está configurado (falta GOOGLE_CLIENT_ID)." });
  let datos;
  try {
    const ticket = await clienteGoogle.verifyIdToken({ idToken: String(req.body.credential || ""), audience: GOOGLE_CLIENT_ID });
    datos = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "No se pudo verificar la cuenta de Google." });
  }
  if (!datos.email_verified) return res.status(401).json({ error: "Tu correo de Google no está verificado." });

  const email = datos.email.toLowerCase();
  const [[existente]] = await pool.query("SELECT id FROM usuarios WHERE google_id = ? OR email = ? LIMIT 1", [datos.sub, email]);
  let id = existente?.id;
  if (id) {
    // Si ya existía con email y contraseña, se vincula también a Google.
    await pool.query("UPDATE usuarios SET google_id = ?, foto = ? WHERE id = ?", [datos.sub, datos.picture || null, id]);
  } else {
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (email, nombre, foto, proveedor, google_id) VALUES (?, ?, ?, 'google', ?)",
      [email, (datos.name || email.split("@")[0]).slice(0, 100), datos.picture || null, datos.sub]
    );
    id = resultado.insertId;
  }
  await abrirSesion(req, id);
  res.json(await usuarioPorId(id));
}));

api.get("/auth/yo", ruta(async (req, res) => {
  if (!req.session.usuarioId) return res.json(null);
  const [[usuario]] = await pool.query(`SELECT ${DATOS_PUBLICOS} FROM usuarios WHERE id = ?`, [req.session.usuarioId]);
  res.json(usuario || null);
}));

api.post("/auth/salir", (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);
    res.clearCookie("umbrella.sid");
    res.json({ ok: true });
  });
});

// ---------- Contenido restringido ----------
function requiereSesion(req, res, next) {
  if (!req.session.usuarioId) return res.status(401).json({ error: "Inicia sesión para ver los archivos clasificados." });
  next();
}

api.get("/expedientes", requiereSesion, ruta(async (req, res) => {
  const [filas] = await pool.query("SELECT * FROM expedientes ORDER BY orden");
  res.json(filas.map(aCamel));
}));

api.use((req, res) => res.status(404).json({ error: "Ruta de la API desconocida." }));

// ---------- Web estática ----------
app.use(express.static(CARPETA_WEB));
app.use((req, res) => res.status(404).sendFile("404.html", { root: CARPETA_WEB }));

// ---------- Errores ----------
app.use((error, req, res, next) => {
  console.error(error);
  const sinBD = ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ER_NO_SUCH_TABLE"].includes(error.code);
  res.status(sinBD ? 503 : 500).json({ error: sinBD ? "La base de datos no está disponible." : "Error interno del servidor." });
});

app.listen(PUERTO, () => console.log(`Umbrella Archives en http://localhost:${PUERTO}`));
