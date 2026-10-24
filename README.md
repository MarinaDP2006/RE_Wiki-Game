# UMBRELLA ARCHIVES · Resident Evil

Wiki no oficial de la saga Resident Evil (TFG de 2º de DAM). Tiene juegos, películas, personajes, bestiario, virus, organizaciones, lugares, cronología, buscador y una zona de miembros con archivos clasificados.

## Arquitectura

```text
Navegador ──► Render (Web Service, Node.js + Express) ──► MySQL
               ├── /            web/ (HTML, CSS, imágenes)
               └── /api/...     API REST de la wiki y de los usuarios
```

- **Frontend**: HTML, CSS y JavaScript sin frameworks (`web/`). Las páginas piden los datos a la API con `fetch` desde `web/comun/api.js`.
- **Backend**: Node.js 22 + Express 5 (`servidor/`). Publica la web y la API en el mismo dominio, así que la cookie de sesión funciona sin configurar CORS.
- **Base de datos**: MySQL 8 (`servidor/bd/esquema.sql` y `servidor/bd/datos.sql`).
- **Usuarios**: registro e inicio de sesión con email y contraseña (hash bcrypt) o con Google (Google Identity Services). Las sesiones se guardan en MySQL.
- **Publicación**: Render (`render.yaml`).

## Estructura
```text
archivos-umbrella/
├── web/                     # La web que ve el usuario
│   ├── index.html           # Portada
│   ├── comun/api.js         # Llamadas a la API y pintado de tarjetas
│   ├── comun/estilos.css
│   ├── wiki/                # Páginas de la wiki, ficha, buscador y acceso
│   └── img/                 # Retratos, escenarios e ilustraciones
├── servidor/                # Backend Node.js
│   ├── index.js             # Express: web estática + API
│   ├── bd.js                # Conexión con MySQL
│   ├── bd/esquema.sql       # Tablas
│   ├── bd/datos.sql         # Datos de la wiki (239 fichas + expedientes)
│   ├── bd/crear.js          # Ejecuta esquema.sql y datos.sql
│   └── .env.example         # Variables de entorno de ejemplo
├── render.yaml              # Blueprint de Render
├── GUIA-DESDE-CERO.md       # Tutorial completo
└── README.md
```

## Probarlo en tu ordenador
Requisitos: Git, Node.js 22 LTS y un MySQL 8 (MySQL Community Server, XAMPP/MariaDB o uno en la nube).

```powershell
git clone https://github.com/MarinaDP2006/archivos-umbrella.git
cd archivos-umbrella\servidor
npm install
copy .env.example .env      # y rellena los datos de tu MySQL
```

La base de datos se llama `umbrella` y usa **utf8mb4** con cotejamiento **utf8mb4_general_ci**. `esquema.sql` ya la crea así (`CREATE DATABASE IF NOT EXISTS umbrella ...`), así que no hace falta crearla a mano. Hay dos formas de cargarla:

**Con XAMPP y phpMyAdmin**
1. Abre el panel de XAMPP y pulsa *Start* en **Apache** y **MySQL**.
2. Entra en http://localhost/phpmyadmin → pestaña **Importar** → elige `servidor/bd/esquema.sql` → **Importar**.
3. Repite con `servidor/bd/datos.sql`.
4. En `servidor/.env` deja `MYSQL_HOST=localhost`, `MYSQL_USER=root`, `MYSQL_PASSWORD=` (vacía en XAMPP) y `MYSQL_DATABASE=umbrella`.

**Con la terminal** (hace lo mismo que los pasos 2 y 3, con la base de datos del `.env`):
```powershell
npm run bd:crear   # crea las tablas y carga los datos (¡borra lo que hubiera!)
```

Después arranca la web:
```powershell
npm run dev        # arranca el servidor y se reinicia al guardar cambios
```

Abre http://localhost:3000. Si ves `{"ok":true,"bd":true}` en http://localhost:3000/api/estado, el servidor está conectado a MySQL.

## Publicar en Render con MySQL
Render no ofrece MySQL gestionado (solo PostgreSQL), así que la base de datos va en un proveedor de MySQL y el servidor en Render.

1. **MySQL gratis en Aiven**: crea una cuenta en https://aiven.io, crea un servicio *MySQL* con el plan **Free** y espera a que esté *Running*. En *Overview* copia la **Service URI** (`mysql://avnadmin:...@...:PUERTO/defaultdb?ssl-mode=REQUIRED`) y descarga el **CA certificate**.
2. **Cargar los datos**: en tu `servidor/.env` pon `DATABASE_URL=` con esa URI y `MYSQL_CA_FILE=` con la ruta del certificado. Después ejecuta `npm run bd:crear` desde tu ordenador.
3. **Render**: *New → Blueprint*, elige este repositorio y Render leerá `render.yaml`. Crea un **Web Service** llamado `umbrella-archives`. El antiguo *Static Site* no puede ejecutar Node, así que bórralo cuando el nuevo funcione.
4. En el servicio, *Environment*:
   - `DATABASE_URL`: la Service URI de Aiven.
   - `MYSQL_CA`: el contenido completo del certificado CA (desde `-----BEGIN CERTIFICATE-----` hasta `END`).
   - `GOOGLE_CLIENT_ID`: opcional, mira el apartado de Google.
   - `SESSION_SECRET` lo genera Render solo.
5. *Manual Deploy → Deploy latest commit*. Comprueba `https://TU-SERVICIO.onrender.com/api/estado`.

El plan gratuito de Render se duerme tras 15 minutos sin visitas: la primera carga después tarda unos 30-60 segundos.

### Acceso con Google (opcional)
1. https://console.cloud.google.com → crea un proyecto → *APIs y servicios → Pantalla de consentimiento de OAuth* (tipo Externo).
2. *Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web*.
3. En **Orígenes de JavaScript autorizados** añade `http://localhost:3000` y `https://TU-SERVICIO.onrender.com`.
4. Copia el **Client ID** en `GOOGLE_CLIENT_ID` (en `.env` y en Render). Sin él, el botón de Google no aparece y funciona solo el email.

## Base de datos

### Modelo
| Tabla | Clave | Columnas propias | Relación |
|---|---|---|---|
| `juegos` | `id` (p. ej. `re2-remake`) | `categoria` (ENUM), `anio`, `plataforma`, `ambientacion` | 1:N con `juego_protagonistas` |
| `personajes` | `id` (`leon`) | `primera_aparicion`, `afiliacion`, `estado`, `nacimiento` | 1:N con `personaje_imagenes` |
| `criaturas` | `id` (`licker`) | `origen`, `primera_aparicion`, `peligrosidad` (1-5, CHECK) | 1:N con `criatura_imagenes` |
| `virus` | `id` (`virus-t`) | `tipo` (ENUM), `creador`, `primera_aparicion` | |
| `organizaciones` | `id` (`umbrella`) | `tipo`, `fundacion`, `lider`, `estado` | |
| `lugares` | `id` (`raccoon-city`) | `region`, `primera_aparicion`, `anio` | |
| `peliculas` | `id` (`vendetta`) | `anio`, `formato` | 1:N con `pelicula_protagonistas` |
| `cronologia` | `id` (`raccoon-1998`) | `periodo`, `anio`, `juego` | |
| `expedientes` | `id` | `titulo`, `nivel`, `resumen`, `texto`, `imagen`, `orden` | solo con sesión |
| `usuarios` | `id` AUTO_INCREMENT | `email` UNIQUE, `nombre`, `foto`, `proveedor` (ENUM), `password_hash`, `google_id` UNIQUE, `rol` (ENUM), `creado`, `ultimo_acceso` | |
| `sesiones` | `session_id` | `expires`, `data` | la gestiona express-mysql-session |

Todas las tablas son InnoDB con `utf8mb4` y `utf8mb4_general_ci`, igual que la base de datos. Funciona en MySQL 8 y en el MariaDB de XAMPP.

Todas las tablas de la wiki comparten `nombre`, `resumen`, `descripcion`, `imagen` (ruta desde `web/`) y `orden`.

Decisiones:
- **Una tabla por sección**, porque cada tipo de ficha tiene columnas distintas.
- **Las listas van en tablas hijas** (protagonistas, galería de imágenes) con `FOREIGN KEY ... ON DELETE CASCADE`, y no como texto separado por comas. Así se respeta la primera forma normal.
- **Ids legibles** (`leon`, `virus-t`) para que las URL sean claras: `ficha.html?c=personajes&id=leon`.
- **Búsqueda con `LIKE`**: el cotejamiento `utf8mb4_general_ci` no distingue mayúsculas ni tildes, así que `nemesis` encuentra «Némesis».

### API
| Método y ruta | Qué hace |
|---|---|
| `GET /api/wiki/:seccion` | Fichas de una sección ordenadas |
| `GET /api/wiki/:seccion/:id` | Una ficha (404 si no existe) |
| `GET /api/buscar?q=texto` | Busca en todas las secciones |
| `POST /api/auth/registro` | Crea una cuenta con email y contraseña |
| `POST /api/auth/login` | Inicia sesión con email y contraseña |
| `POST /api/auth/google` | Inicia sesión con el token de Google |
| `GET /api/auth/yo` | Usuario de la sesión actual o `null` |
| `POST /api/auth/salir` | Cierra la sesión |
| `GET /api/expedientes` | Archivos clasificados (401 sin sesión) |
| `GET /api/estado` | Comprobación de salud para Render |

### Seguridad
- **Contraseñas**: solo se guarda su hash bcrypt (coste 10); nunca la contraseña.
- **Inyección SQL**: todas las consultas usan parámetros `?` de mysql2. Los nombres de tabla salen de una lista cerrada del servidor, nunca de la petición.
- **Sesión**: cookie `httpOnly` (el JavaScript no puede leerla), `sameSite=lax` y `secure` en producción. Se regenera al iniciar sesión para evitar la fijación de sesión.
- **Fuerza bruta**: las rutas de acceso admiten como mucho 30 intentos cada 15 minutos por IP (express-rate-limit).
- **Google**: el servidor verifica la firma del token y que sea para nuestro Client ID antes de crear la sesión.
- **Mensajes neutros**: el login responde igual si el correo no existe o si la contraseña es incorrecta.
- **XSS**: los textos de la base de datos se pintan con `textContent`, nunca con `innerHTML`.
- **Secretos fuera de GitHub**: `.env` está en `.gitignore`; en Render van en *Environment*.

Para dar rol de administración a una cuenta (reservado para futuras funciones):
```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@correo.com';
```

## Cuestionario de Resident Evil
El cuestionario de Google Forms está enlazado desde la portada y desde el centro de archivos (`web/wiki/index.html#cuestionario-saga`): https://forms.gle/uJMFdMTQGWCvDZzJ8

## Siguientes etapas
Panel de administración para editar fichas desde la web, pruebas automáticas de la API y revisión de accesibilidad.

**Tutorial detallado:** [GUIA-DESDE-CERO.md](GUIA-DESDE-CERO.md)
