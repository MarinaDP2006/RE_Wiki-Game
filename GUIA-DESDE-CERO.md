# GUÍA DESDE CERO · UMBRELLA ARCHIVES

**Actualizada el 24 de octubre de 2026.** La web y la API se publican en Render como un Web Service de Node.js y los datos están en MySQL. Firebase ya no se usa.

Esta guía explica cómo retomar, desarrollar y entregar **Umbrella Archives**, una wiki no oficial del universo Resident Evil, desde un ordenador Windows con PowerShell y Visual Studio Code. Distingue lo que **ya existe**, lo que **es solo diseño** y lo que **todavía falta implementar**. No se debe confundir una página dibujada con una función operativa.

## 0. Situación real del proyecto

Repositorio correcto: https://github.com/MarinaDP2006/archivos-umbrella

**Lo que existe en main:**
- La web en 'web/': portada, páginas de la wiki ('web/wiki/'), estilos e imágenes ('web/img/').
- El servidor en 'servidor/': Node.js + Express. Publica 'web/' y una API en '/api' que lee y escribe en MySQL.
- La base de datos MySQL: 'servidor/bd/esquema.sql' (tablas) y 'servidor/bd/datos.sql' (239 fichas y los expedientes clasificados).
- Listados, fichas por ID ('ficha.html?c=personajes&id=leon'), buscador (consulta SQL) y cronología que leen de la base de datos.
- Registro e inicio de sesión reales en 'web/wiki/acceso.html': email y contraseña (guardada como hash bcrypt) y Google opcional. Los usuarios y las sesiones se guardan en MySQL.
- 'render.yaml' preparado para un Web Service de Node en Render.
- El cuestionario de Google Forms enlazado desde la portada y desde el centro de archivos.

**Lo que no existe:**
- 'angular-app/' y 'escritorio-javafx/' solo tienen un '.gitkeep': son fases futuras.
- Un panel de administración para editar fichas desde la web (de momento se editan con SQL).

**Maquetas todavía incompletas:**
- 'web/wiki/mapa.html' tiene etiquetas de lugares en un mapa visual, sin navegación interactiva.
- 'web/wiki/cronologia.html' tiene los hitos, pero no los filtros previstos.

## 1. Qué se pretende entregar

Una wiki de Resident Evil con diseño de archivo secreto, visualmente coherente, usable desde móvil y ordenador: portada, categorías, fichas completas y relacionadas, buscador funcional, cronología, mapa, y opcionalmente acceso de usuarios. Para un proyecto académico, además prepara documentación, capturas, decisiones técnicas y pruebas. JavaFX es la última fase; la publicación de la web no depende de JavaFX.

**Prioridad:** una wiki completa, navegable y comprobada antes de añadir tecnologías que no sean necesarias.

## 2. Instalar solo las herramientas necesarias

1. Instala Git: https://git-scm.com/downloads
2. Instala Visual Studio Code: https://code.visualstudio.com/
3. Usa Chrome, Edge o Firefox para las pruebas.
4. Node.js 22 LTS: https://nodejs.org/ (ejecuta el servidor).
5. MySQL 8: MySQL Community Server con MySQL Workbench, o XAMPP. También vale un MySQL en la nube (Aiven).
6. JDK 21, Maven y JavaFX solo cuando comience la fase de escritorio.

En VS Code, abre Terminal > Nuevo terminal y comprueba:

~~~~powershell
git --version
code --version
~~~~

Comprueba también Node:

~~~~powershell
node --version
npm --version
~~~~

No instales Angular ni JavaFX por adelantado: el servidor instala Express y el resto con 'npm install'.

## 3. Descargar la versión correcta (primera vez)

En PowerShell:

~~~~powershell
cd $HOME
New-Item -ItemType Directory -Force -Path Proyectos | Out-Null
cd Proyectos
git clone https://github.com/MarinaDP2006/archivos-umbrella.git
cd archivos-umbrella
code .
~~~~

La raíz debe contener 'web/', 'servidor/', 'README.md', 'render.yaml' y 'GUIA-DESDE-CERO.md'. Verifica:

~~~~powershell
pwd
Get-ChildItem
git status
git branch --show-current
~~~~

Si ya lo descargaste, no lo clones de nuevo encima. Antes de actualizar:

~~~~powershell
git status
git pull --ff-only origin main
~~~~

Si tienes cambios locales, guárdalos o haz commit primero. No uses 'git reset --hard' para solucionar un conflicto sin copia de seguridad.

## 4. Arrancar la web en tu ordenador

La web necesita el servidor para tener datos y sesión. En PowerShell, desde la raíz del proyecto:

~~~~powershell
cd servidor
npm install
copy .env.example .env
~~~~

Abre 'servidor/.env' y pon los datos de tu MySQL. Con XAMPP son: MYSQL_HOST=localhost, MYSQL_USER=root, MYSQL_PASSWORD vacía y MYSQL_DATABASE=umbrella.

Para crear la base de datos (utf8mb4 con cotejamiento utf8mb4_general_ci) tienes dos opciones:

- **phpMyAdmin**: arranca Apache y MySQL en XAMPP, abre http://localhost/phpmyadmin, ve a *Importar* y sube primero 'servidor/bd/esquema.sql' y después 'servidor/bd/datos.sql'. El primero crea la base 'umbrella' y sus tablas; el segundo mete las fichas.
- **Terminal**: 'npm run bd:crear' hace lo mismo en la base de datos que pongas en el .env.

Después arranca la web:

~~~~powershell
npm run dev
~~~~

Visita http://localhost:3000/. 'npm run bd:crear' borra y vuelve a crear todas las tablas: úsalo solo para instalar o reiniciar la base de datos.

## 5. Conocer las carpetas antes de editar

~~~~text
archivos-umbrella/
├── web/
│   ├── index.html                Portada real
│   ├── 404.html
│   ├── comun/estilos.css         Estilos globales
│   ├── comun/api.js              Llamadas a la API (datos, búsqueda, sesión)
│   ├── img/                      Imágenes servidas en la web
│   └── wiki/
│       ├── index.html            Inicio de la wiki y cuestionario
│       ├── juegos.html, personajes.html, criaturas.html...  Listados desde MySQL
│       ├── ficha.html            Ficha por ID (?c=sección&id=ficha)
│       ├── buscar.html           Buscador (consulta SQL)
│       ├── acceso.html           Registro, inicio de sesión y expedientes
│       ├── cronologia.html       Cronología desde MySQL
│       ├── mapa.html             Mapa de ejemplo
│       ├── wiki.css
│       └── estilos-archivos.css
├── servidor/
│   ├── index.js                  Express: publica web/ y la API /api
│   ├── bd.js                     Conexión con MySQL
│   ├── bd/esquema.sql            Tablas
│   ├── bd/datos.sql              Datos de la wiki
│   ├── bd/crear.js               npm run bd:crear
│   └── .env.example              Variables de entorno de ejemplo
├── src/img/                     Colección adicional de arte
├── render.yaml                  Web Service de Node en Render
├── README.md
├── tutorial.md                   Documento histórico: verificar rutas
└── GUIA-DESDE-CERO.md            Esta guía
~~~~

Para que una imagen cargue en Render tiene que estar dentro de 'web/' (o copiarse allí mediante un proceso explícito). Los archivos de 'src/img/' NO se publican: el servidor solo sirve la carpeta 'web/'. No borres ni muevas las imágenes originales hasta verificar todas sus referencias.

## 6. Primera fase: estabilizar la maqueta

Antes de añadir grandes funciones:
1. Recorre todas las páginas con el navegador y anota qué funciona, qué no enlaza y qué es solo un ejemplo.
2. Comprueba desde móvil o con las herramientas responsive de Chrome que menús, textos y tarjetas caben en pantalla.
3. Corrige enlaces rotos, textos de relleno, rutas a imágenes inexistentes, contrastes y navegación por teclado.
4. Haz que cada tarjeta importante sea un enlace accesible real; no basta con que parezca pulsable.
5. Conserva el estilo Umbrella Archives y el aviso de proyecto de fans.

**Resultado esperado:** navegación coherente y diseño estable, incluso aunque las fichas sigan siendo estáticas.

## 7. Segunda fase: preparar los datos reales de la wiki

Se recomienda empezar con **un único catálogo estructurado** (JSON o módulos JavaScript) para evitar copiar información en docenas de páginas. No es obligatorio adoptar Angular para hacer esto.

Ejemplo de esquema de contenido:

~~~~json
{
  "id": "leon-s-kennedy",
  "tipo": "personaje",
  "nombre": "Leon S. Kennedy",
  "resumen": "Descripción revisada y documentada",
  "imagen": "../img/retratos/leon.webp",
  "relacionados": ["resident-evil-2"],
  "fuentes": []
}
~~~~

El ejemplo es orientativo: antes de usar esa ruta comprueba si el archivo existe exactamente en 'web/img/'. Define IDs únicos, campos obligatorios, fuentes de información y categoría para juegos, personajes, criaturas, virus, organizaciones, ubicaciones y películas. Diferencia juegos, adaptaciones audiovisuales y líneas temporales; no mezcles canon sin explicarlo.

Empieza por unas pocas fichas reales para validar el formato; después amplía el catálogo por secciones. Si reutilizas recursos oficiales, ten en cuenta los derechos de autor y mantén el carácter no oficial.

## 8. Tercera fase: convertir las páginas de muestra en funciones reales

**Fichas:** 'ficha.html' debe leer un ID (por ejemplo mediante un parámetro de URL), buscarlo en el catálogo, mostrar descripción, imagen, fuentes y relacionados. Si el ID no existe, mostrar un error comprensible y un enlace para volver.

**Buscador:** sustituir el texto de ejemplo en 'buscar.html' por un campo real que filtre el catálogo por nombre, alias, tipo y, opcionalmente, etiquetas. Permitir limpiar filtros, manejar cero resultados y funcionar con teclado.

**Categorías:** leer el mismo catálogo y enlazar cada tarjeta a su ficha, sin duplicar sus datos.

**Cronología:** convertir los acontecimientos de ejemplo en registros con fechas, referencias y filtros por juego, año o tipo de suceso. Indicar las fechas aproximadas.

**Mapa:** convertir los puntos decorativos en enlaces o controles accesibles asociados a fichas de ubicaciones; después implementar filtros, zoom y controles táctiles si el tiempo lo permite.

**Acceso:** ya funciona contra la API: 'POST /api/auth/registro', '/api/auth/login' y '/api/auth/google'. Las contraseñas se guardan como hash bcrypt en la tabla 'usuarios', nunca en texto plano ni en localStorage. Para Google hace falta un Client ID de Google Cloud en la variable 'GOOGLE_CLIENT_ID' (ver README). Prueba siempre con 'npm run dev' y http://localhost:3000, no abriendo el HTML con doble clic: sin el servidor no hay datos ni sesión.

**Comprobación:** cada ficha se encuentra desde el buscador, se abre desde su categoría, y enlaza a otras fichas sin errores.

## 9. Arquitectura elegida

**Web + API en Node.js + MySQL.** La wiki necesita cuentas de usuario y contenido privado (los expedientes clasificados), así que hace falta un servidor que compruebe la sesión antes de devolver esos datos. Express publica la web y la API en el mismo dominio, y MySQL guarda la wiki, los usuarios y las sesiones.

En la memoria, justifica: por qué una tabla por sección, por qué las listas van en tablas hijas con claves ajenas, por qué bcrypt para las contraseñas y por qué las consultas usan parámetros '?' (inyección SQL). El README lo resume.

## 10. Autenticación y zona restringida

Ocultar botones en el navegador **no protege** datos: lo que protege los expedientes es que el servidor responde 401 a 'GET /api/expedientes' si no hay sesión. La sesión es una cookie 'httpOnly' que crea el servidor y que se guarda en la tabla 'sesiones'. No publiques el archivo '.env', contraseñas de MySQL ni 'SESSION_SECRET' en GitHub.

## 11. Publicar en Render

Render ejecuta el servidor de Node ('render.yaml'): instala las dependencias con 'cd servidor && npm ci' y arranca con 'npm start'. Render no tiene MySQL propio, así que la base de datos va en un proveedor de MySQL (recomendado: el plan gratuito de Aiven). Los pasos detallados están en el README, apartado «Publicar en Render con MySQL». En resumen:

1. Crea el MySQL gratuito en Aiven y copia la **Service URI** y el **certificado CA**.
2. Desde tu ordenador, con esos datos en 'servidor/.env', ejecuta 'npm run bd:crear'.
3. En Render: *New → Blueprint* con este repositorio. Rellena 'DATABASE_URL', 'MYSQL_CA' y, si quieres Google, 'GOOGLE_CLIENT_ID'.
4. Despliega y abre '/api/estado': debe responder '{"ok":true,"bd":true}'.
5. Prueba la portada, un listado, una ficha, el buscador, el registro y los expedientes en el **dominio real**.
6. Cuando el nuevo servicio funcione, borra el antiguo *Static Site*: un sitio estático no puede ejecutar Node.

## 12. Guardar cambios sin perder nada

Desde la raíz del repositorio:

~~~~powershell
git status
git add web GUIA-DESDE-CERO.md README.md
git commit -m "Actualizar wiki y documentacion"
git push origin main
~~~~

Añade solo los archivos que hayas editado. Si colaboras con Claude, Copilot u otras personas, lo más seguro es crear una rama por tarea y revisar una Pull Request antes de fusionar. No editéis simultáneamente el mismo archivo sin sincronizar las ramas. No subas contraseñas, tokens, 'node_modules/', archivos '.env' ni materiales privados.

## 13. Pruebas y requisitos de entrega

Para cada fase, anota **fecha, archivo cambiado, qué se ha probado, resultado y captura**. Comprueba al menos:
- Portada y navegación entre todas las categorías.
- Enlaces a fichas, imágenes reales y páginas de error.
- Búsqueda sin resultados, búsqueda con tildes y nombres alternativos.
- Móvil, tableta y escritorio, teclado y lector de pantalla en los flujos críticos.
- Carga sin errores 404, accesibilidad básica (contraste, etiquetas, foco) y tiempos razonables.
- Publicación después de cada cambio significativo.
- Seguridad y permisos si finalmente hay cuentas.

No marques una característica como 'completa' por la mera presencia de una página HTML; demuestra el comportamiento.

## 14. JavaFX (solo al final)

**No existe todavía 'escritorio-javafx/' en main.** Cuando la web esté funcional y publicada:
1. Instala JDK 21 y Maven y verifica 'java -version' y 'mvn -version'.
2. Crea un proyecto JavaFX/OpenJFX separado en 'escritorio-javafx/'.
3. Haz una ventana sencilla, con identidad visual Umbrella Archives y un botón para abrir la URL pública en el navegador predeterminado.
4. Implementa estado, ayuda y empaquetado con 'jpackage' solo si los necesitas para la entrega.
5. Prueba el ejecutable en Windows y documenta requisitos e instalación.

Un lanzador JavaFX no reemplaza la web; es un complemento. No lo uses para ocultar funcionalidades pendientes.

## 15. Plan de trabajo recomendado (en orden)

| Fase | Situación actual | Qué hay que terminar |
| --- | --- | --- |
| Recuperación del proyecto | Web, servidor y base de datos presentes | Clonar, 'npm install', 'npm run bd:crear' y validar rutas |
| Diseño / navegación | Portada y páginas HTML presentes | Corregir enlaces, móvil y accesibilidad |
| Catálogo de la wiki | 239 fichas en MySQL y fichas por ID | Revisar datos y enlazar fichas entre sí |
| Buscador | Búsqueda SQL en todas las secciones | Filtros por sección |
| Cronología | Acontecimientos de ejemplo | Datos contrastados, navegación y filtros |
| Mapa | Puntos visuales | Controles interactivos y fichas asociadas |
| Usuarios | Registro, login (email y Google) y expedientes privados | Panel de administración |
| Publicación | 'render.yaml' de Web Service | Crear MySQL en Aiven, desplegar y verificar el dominio real |
| Pruebas / memoria | Documentación inicial | Capturas, pruebas, incidencias y conclusiones |
| JavaFX | No iniciado | Crear al final y empaquetar |

## 16. Problemas frecuentes

- **'npm run dev' dice que no encuentra '.env':** copia 'servidor/.env.example' como 'servidor/.env' y rellénalo.
- **'/api/estado' responde '"bd":false' o las páginas salen con las tarjetas de ejemplo:** el servidor no conecta con MySQL. Revisa 'DATABASE_URL' o 'MYSQL_HOST/USER/PASSWORD/DATABASE', y que la base de datos exista y tenga las tablas ('npm run bd:crear').
- **Error de SSL o certificado con Aiven:** falta 'MYSQL_CA' (en Render) o 'MYSQL_CA_FILE' (en local).
- **No aparece el botón de Google:** falta 'GOOGLE_CLIENT_ID'. Si aparece pero da error, añade el dominio en *Orígenes de JavaScript autorizados* de Google Cloud.
- **La web tarda en cargar la primera vez en Render:** el plan gratuito se duerme tras 15 minutos sin visitas.
- **La página abierta con doble clic no tiene datos:** hay que entrar por el servidor (http://localhost:3000).
- **Render muestra una web antigua:** verifica servicio, rama, commit y el registro de despliegue.
- **Git rechaza 'push':** actualiza tu rama, revisa el conflicto y evita sobrescribir el trabajo de otra persona.

## 17. Regla para continuar

Antes de empezar cada tarea: **verificar lo que existe → definir comportamiento → implementar → probar localmente → revisar en GitHub → desplegar → registrar resultado**. Mantén los diseños originales hasta que su sustituto esté probado. No presentes Angular ni JavaFX como terminados: actualmente son objetivos futuros.
