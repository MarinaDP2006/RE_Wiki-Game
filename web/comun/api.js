// Acceso a la API del servidor (servidor/index.js), que lee y escribe en MySQL.
// Todas las páginas importan este módulo en lugar de hablar con la base de datos.
//
// Si la API no responde (por ejemplo, al abrir los HTML sin el servidor),
// las funciones de lectura devuelven listas vacías y la página conserva
// las tarjetas de muestra que ya trae su HTML.

// La API está en el mismo dominio que la web: /api/...
async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(`/api${ruta}`, {
    credentials: "same-origin", // envía la cookie de sesión
    ...opciones,
    headers: { "Content-Type": "application/json", ...opciones.headers }
  });
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new Error(datos?.error || `Error ${respuesta.status}`);
  return datos;
}

const enviar = (ruta, cuerpo) => pedir(ruta, { method: "POST", body: JSON.stringify(cuerpo || {}) });

// Secciones públicas de la wiki: nombre en la API (y tabla de MySQL) → título visible.
export const COLECCIONES = {
  juegos: "Juegos",
  personajes: "Personajes",
  criaturas: "Bestiario",
  virus: "Virus y parásitos",
  organizaciones: "Organizaciones",
  lugares: "Ubicaciones",
  peliculas: "Películas y series",
  cronologia: "Cronología"
};

// Etiquetas de los campos propios de cada sección (se muestran en la ficha).
export const CAMPOS = {
  juegos: { categoria: "Categoría", anio: "Año", plataforma: "Plataforma original", protagonistas: "Protagonistas", ambientacion: "Ambientación" },
  personajes: { primeraAparicion: "Primera aparición", afiliacion: "Afiliación", estado: "Estado", nacimiento: "Nacimiento" },
  criaturas: { origen: "Origen", primeraAparicion: "Primera aparición", peligrosidad: "Peligrosidad (1-5)" },
  virus: { tipo: "Tipo", creador: "Creador", primeraAparicion: "Primera aparición" },
  organizaciones: { tipo: "Tipo", fundacion: "Fundación", lider: "Figuras clave", estado: "Estado" },
  lugares: { region: "Región", primeraAparicion: "Primera aparición", anio: "Año de los hechos" },
  peliculas: { anio: "Estreno", formato: "Formato", protagonistas: "Protagonistas" },
  cronologia: { periodo: "Periodo", juego: "Juego" }
};

// ---------- Lectura de la wiki ----------

// Fichas de una sección ordenadas por "orden".
export async function leerColeccion(nombre) {
  try {
    return await pedir(`/wiki/${encodeURIComponent(nombre)}`);
  } catch (error) {
    console.warn(`[API] No se pudo leer "${nombre}".`, error);
    return [];
  }
}

// Una ficha, o null si no existe o la API no responde.
export async function leerDocumento(nombre, id) {
  try {
    return await pedir(`/wiki/${encodeURIComponent(nombre)}/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

// Búsqueda en todas las secciones (la hace MySQL con LIKE).
export const buscar = termino => pedir(`/buscar?q=${encodeURIComponent(termino)}`);

// Expedientes clasificados: el servidor responde 401 si no hay sesión.
export const leerExpedientes = () => pedir("/expedientes");

// ---------- Usuarios y sesión ----------
// La sesión es una cookie httpOnly que crea el servidor: el JavaScript
// de la página no puede leerla, solo preguntar quién es el usuario.

export const usuarioActual = () => pedir("/auth/yo").catch(() => null);
export const registrarConEmail = (email, password) => enviar("/auth/registro", { email, password });
export const entrarConEmail = (email, password) => enviar("/auth/login", { email, password });
export const entrarConGoogle = credential => enviar("/auth/google", { credential });
export const salir = () => enviar("/auth/salir");
export const leerConfiguracion = () => pedir("/config").catch(() => ({ googleClientId: "" }));

// ---------- Pintado en las páginas ----------

// Las rutas de imagen se guardan desde web/ ("img/..."); las páginas están en web/wiki/.
export const rutaImagen = ruta => (ruta ? `../${ruta}` : "../img/escenarios/re2_vestibulo.webp");

export function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// Tarjeta con el mismo marcado que las de la maqueta (.proto-card).
export function tarjeta(item, coleccion, etiqueta) {
  const art = crear("article", "proto-card");
  const img = crear("div", "proto-img");
  img.style.setProperty("--img", `url('${rutaImagen(item.imagen)}')`);
  img.setAttribute("role", "img");
  img.setAttribute("aria-label", item.nombre);
  const copia = crear("div", "proto-copy");
  const h3 = crear("h3");
  const enlace = crear("a", "", item.nombre);
  enlace.href = `ficha.html?c=${encodeURIComponent(coleccion)}&id=${encodeURIComponent(item.id)}`;
  enlace.style.cssText = "color:inherit;text-decoration:none";
  h3.append(enlace);
  copia.append(crear("span", "proto-tag", etiqueta), h3, crear("p", "", item.resumen));
  art.append(img, copia);
  return art;
}

// Sustituye las tarjetas de muestra de una página por las de la colección.
export async function pintarColeccion(nombre, contenedor = document.querySelector(".proto-grid")) {
  if (!contenedor) return;
  const items = await leerColeccion(nombre);
  if (!items.length) return;
  contenedor.replaceChildren(...items.map((item, i) => tarjeta(item, nombre, `ARCHIVO ${String(i + 1).padStart(3, "0")}`)));
}
