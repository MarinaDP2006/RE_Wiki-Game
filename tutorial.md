# Mi tutorial para crear UMBRELLA ARCHIVES

> **Nota (24-10-2026):** este tutorial es el plan inicial. El proyecto ya no usa Firebase: la web y la API se publican en Render con Node.js y los datos están en MySQL. Consulta el README y la GUIA-DESDE-CERO.

**Proyecto Final · octubre de 2026 a mayo de 2027**

Esta es mi guía de trabajo, escrita para poder seguirla sin dar nada por sabido. La idea es construir **Umbrella Archives**, una web dedicada al universo de *Resident Evil*, con sus juegos, personajes, criaturas, virus, organizaciones, lugares, películas, cronología y mapa. También quiero que los visitantes puedan buscar información, que exista una zona para usuarios registrados y que se pueda abrir la web desde una pequeña aplicación de escritorio hecha con JavaFX.

**Lo más importante:** ahora mismo tengo una **maqueta visual** en GitHub. Se ven sus páginas, imágenes y estilos, pero todavía no funciona como una aplicación completa. Mi trabajo será convertir esa maqueta en una web real, paso a paso. No tengo que reconstruir todo de golpe ni borrar los diseños que ya he hecho.

Mi repositorio es: **https://github.com/MarinaDP2006/archivos-umbrella**. Si quiero consultar cómo era el proyecto antiguo, existe la rama de respaldo `archivo-backend-previo-maqueta-2026-10`, pero **no la voy a usar como base** para este nuevo desarrollo.

---

## 1. Qué voy a construir exactamente

Al acabar quiero poder enseñar lo siguiente:

- Una **portada** de Umbrella Archives que dé acceso a la wiki, la cronología y el mapa.
- Una **wiki** con páginas de juegos, personajes, criaturas, virus, organizaciones, lugares y películas.
- **Fichas individuales** con imágenes, descripción y enlaces a otras fichas relacionadas.
- Un **buscador** que encuentre fichas por nombre y, si da tiempo, por etiquetas.
- Una **cronología** que permita seguir los acontecimientos de la saga.
- Un **mapa** con lugares relacionados con el universo de los juegos. Si no llego a hacer un mapa interactivo completo, entregaré una versión navegable más sencilla.
- Un **acceso de usuarios** con Firebase Authentication. La zona restringida será una ampliación posterior, no un obstáculo para terminar la wiki.
- Una **aplicación de escritorio JavaFX** que abra la web y tenga una presentación propia sencilla.
- Una **web publicada** y una memoria del proceso con capturas de lo que he hecho.

No necesito tenerlo todo terminado para empezar. Primero conseguiré una página que funcione; después añadiré contenido y funciones.

## 2. Dos maneras de preparar el ordenador

### Si empiezo desde cero en otro PC

1. Enciendo Windows, me conecto a internet y creo una carpeta para mis proyectos, por ejemplo `C:\Proyectos`.
2. Instalo **Git** desde https://git-scm.com/downloads para guardar cambios y recuperar mi proyecto desde GitHub.
3. Instalo **Visual Studio Code** desde https://code.visualstudio.com/ para trabajar en la web.
4. Instalo la versión **LTS de Node.js** desde https://nodejs.org/. Durante la instalación dejo las opciones normales.
5. Instalo **Google Chrome** o utilizo **Microsoft Edge** para comprobar cómo se ve la web.
6. Instalo **JDK 21**, preferiblemente Eclipse Temurin desde https://adoptium.net/, para la parte de JavaFX. Si la asignatura exige otra versión, comprobaré primero la que pide el profesor.
7. Instalo **IntelliJ IDEA Community** desde https://www.jetbrains.com/idea/ si quiero desarrollar JavaFX allí. No es obligatorio usarlo si prefiero VS Code.
8. Instalo **JavaFX Scene Builder** desde https://gluonhq.com/products/scene-builder/ para diseñar ventanas visualmente.
9. **Android Studio es opcional.** No lo necesito para hacer esta web ni para el lanzador JavaFX; solo lo instalaría si más adelante decido hacer una aplicación Android.
10. Abro una terminal nueva y compruebo los programas escribiendo estos comandos, uno por uno:

```powershell
node --version
npm --version
git --version
java -version
```

Si alguno dice que no reconoce el comando, cierro y vuelvo a abrir VS Code o reinicio el ordenador. Si sigue fallando, reviso la instalación antes de continuar.

### En mi ordenador actual

**No voy a reinstalar todo.** Ya tengo Node.js, distintos JDK, VS Code, IntelliJ IDEA, Android Studio, JavaFX, Scene Builder y extensiones para Java, Maven y Angular. Lo que haré es comprobar que funcionan.

1. Abro **VS Code → Terminal → Nuevo terminal**.
2. Escribo `node --version`, `npm --version` y `git --version`.
3. Escribo `java -version` y `where.exe java`. Así veo **qué Java está usando Windows ahora**, aunque tenga varios instalados.
4. Si Java funciona, no cambio `JAVA_HOME` por cambiarlo. Para JavaFX intentaré utilizar **JDK 21** y configuraré el JDK del proyecto en IntelliJ si hace falta.
5. Abro Scene Builder para comprobar que arranca. **Scene Builder no sustituye a JavaFX**: sirve para dibujar las ventanas; el proyecto JavaFX es lo que las ejecuta.
6. Abro VS Code y miro en **Extensiones** si ya tengo lo que necesito. Si está instalado y funciona, lo dejo como está.
7. No toco Android Studio: puede quedarse instalado, pero no participa en la primera versión del proyecto.

**Importante:** mi Radeon Vega 10, el procesador Ryzen 7 3700U y los 32 GB de RAM son suficientes para trabajar con VS Code y las herramientas del proyecto, pero evitaré tener Android Studio, IntelliJ y varios servidores abiertos a la vez si noto lentitud.

### Extensiones de VS Code que sí me interesan

En VS Code abro el icono de **Extensiones** de la izquierda, escribo el nombre y pulso **Instalar** solo si no aparece como instalado:

| Extensión | Para qué me sirve |
|---|---|
| Angular Language Service | Ayuda con las plantillas y componentes de Angular |
| Extension Pack for Java (Microsoft) | Reúne herramientas para trabajar con Java |
| Maven for Java | Ayuda a abrir y ejecutar proyectos Maven |
| Debugger for Java | Permite localizar errores en Java; suele venir en el paquete anterior |
| Prettier - Code formatter | Ordena el formato del código |
| ESLint | Señala posibles problemas en el código TypeScript/JavaScript si lo configuro |
| GitLens (opcional) | Ayuda a entender el historial de cambios |
| Spanish Language Pack (opcional) | Pone VS Code en español |
| Live Server (opcional) | Sirve para mirar la maqueta HTML antigua; **no es la forma de ejecutar Angular** |

**No necesito instalar veinte extensiones parecidas.** Si tengo el paquete de Java, no hace falta buscar manualmente cada herramienta que ya incluye.

---

## 3. Recuperar mi proyecto desde GitHub

Esto vale tanto para mi PC como para otro nuevo.

1. Entro en https://github.com/MarinaDP2006/archivos-umbrella y compruebo que puedo ver el repositorio.
2. En el ordenador abro la carpeta donde guardaré el proyecto, por ejemplo `C:\Proyectos`.
3. Abro una terminal dentro de esa carpeta y escribo:

```powershell
git clone https://github.com/MarinaDP2006/archivos-umbrella.git
cd RE-InteractiveWeb
code .
```

4. En VS Code veré la carpeta `web/`, el `README.md` y otros archivos de la maqueta.
5. **No borro `web/`**. Ahí están las páginas, estilos e imágenes que usaré como referencia.
6. Si **ya tengo el repositorio descargado** en mi PC, **no vuelvo a clonarlo encima**. Abro esa carpeta y, después de comprobar que no tengo cambios sin guardar, uso `git pull` para traer las novedades.

### Ver la maqueta antes de empezar

Abro `web/index.html` con **Live Server** o desde el explorador de archivos. Recorro las páginas y apunto qué me gusta y qué quiero mejorar. Es una vista previa: los botones de búsqueda o inicio de sesión todavía no tienen por qué funcionar.

**Comprobación:** puedo abrir la portada y ver las imágenes de la wiki. Si alguna imagen falta, compruebo su nombre y su carpeta antes de seguir.

---

## 4. Organizar las carpetas sin perder lo que ya tengo

Quiero una carpeta principal que guarde todo el proyecto:

```text
RE-InteractiveWeb/
├── web/                  ← maqueta original: la conservo
├── angular-app/          ← aquí construiré la web nueva
├── escritorio-javafx/    ← aplicación de escritorio
├── api-node/             ← solo si más adelante necesito servidor propio
├── documentos/           ← bocetos, capturas y notas de la memoria
└── README.md
```

**No creo todas las carpetas vacías el primer día.** Las iré añadiendo cuando llegue a cada parte. Angular creará muchas carpetas automáticamente; no tengo que escribirlas a mano.

Para guardar mis avances, al terminar una sesión abro la terminal en la carpeta principal y escribo:

```powershell
git status
git add .
git commit -m "Avance de la portada de Umbrella Archives"
git push
```

Cambio el mensaje por lo que haya hecho realmente. Si `git status` dice que no hay cambios, no necesito hacer un commit. **Nunca subo contraseñas, claves privadas ni carpetas como `node_modules/`.**

---

## 5. Crear Angular desde cero

Esta es la parte que convierte la maqueta en una web que puede cambiar de página, buscar y mostrar fichas.

1. Abro la terminal en `RE-InteractiveWeb`, **no dentro de `web/`**.
2. Instalo la herramienta de Angular:

```powershell
npm install -g @angular/cli
ng version
```

3. Creo mi aplicación nueva:

```powershell
ng new angular-app --routing --style=scss --standalone --skip-git
```

4. Si Angular me hace preguntas adicionales, mantengo las opciones sencillas para una aplicación web normal. No necesito añadir funciones de servidor ni herramientas de IA para empezar.
5. Entro en la carpeta y la pongo en marcha:

```powershell
cd angular-app
npm start
```

6. Abro en el navegador la dirección que aparezca en la terminal, normalmente `http://localhost:4200`.

**Comprobación:** aparece la página inicial de Angular. Eso significa que mi proyecto nuevo funciona, aunque todavía no se parezca a Umbrella Archives.

**Si cierro el ordenador y vuelvo mañana:** abro la carpeta `angular-app`, escribo `npm start` y vuelvo a abrir la dirección local. No tengo que repetir `ng new`.

### Si Angular da un error de versiones

Leo el mensaje antes de instalar cosas al azar. Compruebo `node --version` y `ng version`. Si dice que mi Node no es compatible, instalaré una versión LTS compatible con **la versión de Angular que acabo de instalar**. No cambiaré de JDK porque Angular utiliza Node.js, no Java.

---

## 6. Construir las páginas una a una

Voy a empezar por lo que se ve y después añadiré lo que hace cada botón.

**Orden que seguiré:** portada → wiki → juegos → personajes → criaturas → virus → organizaciones → lugares → películas → fichas → cronología → mapa → buscador → acceso de usuarios.

Dentro de `angular-app`, puedo crear las primeras páginas así:

```powershell
ng generate component pages/inicio
ng generate component pages/wiki
ng generate component pages/juegos
ng generate component pages/personajes
ng generate component pages/criaturas
ng generate component pages/virus
ng generate component pages/organizaciones
ng generate component pages/lugares
ng generate component pages/peliculas
ng generate component pages/ficha
ng generate component pages/cronologia
ng generate component pages/mapa
ng generate component pages/buscar
ng generate component pages/acceso
```

Angular puede crear archivos llamados `inicio.ts`, `inicio.html` y `inicio.scss`, según su versión. **Usaré los nombres reales que genere mi instalación**; no copiaré instrucciones de versiones antiguas que hablan siempre de `.component.ts`.

### Cómo haré cada página, sin saltarme pasos

1. Abro la página equivalente de la **maqueta** en `web/`.
2. Me fijo en los colores, el menú, las imágenes y la colocación de los elementos.
3. Copio **el contenido visual que necesite** al HTML del componente Angular correspondiente. No copio una página HTML completa con `<html>`, `<head>` y `<body>` dentro de un componente.
4. Paso los estilos poco a poco a los archivos `.scss` de Angular. Empiezo por colores y tipografías generales.
5. Copio las imágenes que necesite desde `web/img/` a la carpeta pública de Angular, por ejemplo `angular-app/public/img/`, manteniendo sus nombres. Así puedo usarlas con rutas como `/img/logo.svg`.
6. En `angular-app/src/app/app.routes.ts` relaciono cada dirección con su página. Primero hago que **Inicio** y **Wiki** funcionen; después añado las demás.
7. Abro el navegador y pruebo los enlaces. Corrijo una página antes de pasar a la siguiente.

**Mi primera meta real:** abrir `http://localhost:4200` y reconocer mi portada de Umbrella Archives. La segunda: poder pulsar **Wiki** y llegar a la wiki nueva sin errores.

### Cómo evitar que todas las páginas sean distintas

Crearé una cabecera y un pie compartidos para que el menú, el logo y los colores sean iguales. No repetiré el mismo menú escrito a mano en quince páginas.

---

## 7. Preparar la información de la wiki

Primero decidiré **qué información va en cada ficha**. No tengo que escribir cientos de biografías antes de que la web funcione.

Empezaré con **tres fichas completas por sección**. Por ejemplo, tres juegos y tres personajes. Cada ficha tendrá:

- Nombre.
- Imagen.
- Descripción breve escrita por mí.
- Datos importantes según el tipo de ficha.
- Relación con otras fichas, cuando corresponda.
- Fuente de la información y crédito de las imágenes.

Para practicar Angular puedo comenzar con unos pocos datos de ejemplo dentro del proyecto. Más adelante decidiré cuáles conviene guardar en **Firestore**. No necesito crear un servidor Java ni escribir decenas de JSON a mano como proponía el tutorial antiguo.

**Comprobación:** entro en Personajes, veo tres tarjetas, pulso una y se abre su ficha. Si eso funciona, podré añadir el resto de contenido sin cambiar la idea principal.

---

## 8. Añadir el buscador, la cronología y el mapa

### Buscador

1. Pongo un cuadro de búsqueda en la cabecera o en la página Buscar.
2. Empiezo buscando **por nombre** entre las fichas que ya se muestran.
3. Compruebo que escribir `Jill` o `Wesker` devuelve el resultado correcto.
4. Después añado filtros por sección y etiquetas si tengo tiempo.

### Cronología

1. Hago una lista de acontecimientos con fecha, nombre y descripción.
2. Los ordeno de más antiguo a más reciente.
3. Diseño una línea temporal clara que también se pueda leer desde el móvil.
4. Enlazo los acontecimientos con las fichas correspondientes.

### Mapa

1. Decido qué lugares voy a representar y cuáles son ficticios.
2. Empiezo con una lista o plano visual con lugares seleccionables.
3. Si el calendario lo permite, añado interacción con una biblioteca de mapas como Leaflet. No invento coordenadas reales para lugares ficticios.
4. Compruebo que se puede utilizar con ratón, teclado y pantalla pequeña.

**Comprobación:** puedo encontrar una ficha, recorrer los acontecimientos y abrir al menos un lugar desde el mapa.

---

## 9. Crear el acceso de usuarios con Firebase

Firebase me permitirá añadir usuarios sin tener que construir y mantener un servidor propio desde el primer día.

1. Entro en https://console.firebase.google.com/ con mi cuenta.
2. Pulso **Crear proyecto** y le doy un nombre identificable, por ejemplo `umbrella-archives` si está disponible.
3. Registro una **aplicación web** dentro del proyecto Firebase.
4. Activo **Authentication** y empiezo con el método **Correo electrónico/contraseña**. El acceso con Google lo puedo añadir después.
5. Si necesito guardar perfiles o fichas, activo **Cloud Firestore** y reviso el plan gratuito y sus límites antes de crear recursos.
6. Instalo las herramientas necesarias **dentro de `angular-app`**:

```powershell
npm install firebase @angular/fire
```

7. Conecto Angular con la configuración de mi aplicación Firebase, siguiendo la guía de la versión de AngularFire instalada. Los nombres exactos de los archivos de configuración pueden variar.
8. Creo una pantalla sencilla con **Registrarse**, **Entrar** y **Salir**.
9. Pruebo con una cuenta de prueba y verifico que puedo cerrar sesión.
10. Configuro las **reglas de seguridad** de Firestore para que una persona no pueda modificar los datos de otra.

**Importante:** que una ficha se vea con un candado **no la protege por sí solo**. Si hay contenido privado, las reglas de seguridad deben impedir que alguien sin permiso lo descargue. Para la primera entrega puedo dejar las fichas públicas y reservar el área privada a funciones sencillas de usuario.

**No voy a subir contraseñas ni credenciales de administrador a GitHub.** La configuración pública de Firebase para la aplicación web no equivale a una clave de administrador, pero igualmente debo proteger los datos con reglas correctas.

---

## 10. ¿Necesito Node.js como servidor?

**Node.js ya lo estoy utilizando para Angular.** Eso no significa que tenga que crear también una API con Express.

Mi decisión inicial será: **Angular para la web + Firebase para usuarios y datos**. Así reduzco trabajo y gastos.

Solo si más adelante necesito una función que deba ejecutarse en un servidor propio crearé `api-node/`. En ese caso, primero escribiré qué problema resuelve y lo consultaré con mi tutor. **No voy a programar un backend por obligación** si Firebase ya cubre las necesidades del proyecto.

---

## 11. Crear mi aplicación de escritorio con JavaFX

La versión de escritorio será **un pequeño lanzador de Umbrella Archives**, no una segunda wiki entera. Esto es más realista para llegar a mayo con un producto terminado.

1. Compruebo que tengo un **JDK compatible**, preferiblemente Java 21, y que IntelliJ IDEA y Scene Builder abren correctamente.
2. Creo en IntelliJ un proyecto **JavaFX con Maven**, o utilizo el asistente disponible para JavaFX. Lo guardo en `escritorio-javafx/` dentro del repositorio.
3. Si IntelliJ no muestra JavaFX, utilizo el proyecto de ejemplo oficial de OpenJFX y sigo sus instrucciones: https://openjfx.io/openjfx-docs/.
4. Creo una ventana con el nombre **Umbrella Archives**, el logo y dos botones: **Abrir la web** y **Salir**.
5. Puedo diseñar la ventana en Scene Builder y guardar el archivo `.fxml` dentro del proyecto JavaFX.
6. Programo el botón **Abrir la web** para que abra la dirección pública de mi web en el navegador predeterminado.
7. Ejecuto el programa desde IntelliJ y compruebo que el botón funciona.
8. Cuando esté terminado, preparo una versión distribuible para Windows con las herramientas de empaquetado de Java. **No prometo un `.exe` hasta haber probado su creación y apertura en Windows**.

**No necesito Android Studio para esta parte.** IntelliJ + JDK + Maven + JavaFX + Scene Builder son suficientes.

**Comprobación:** abro el lanzador, pulso el botón y aparece Umbrella Archives en el navegador.

---

## 12. Publicar la web sin pagar de entrada

No voy a utilizar el antiguo servidor Docker/Java de Render para publicar esta nueva versión. El repositorio actual es una maqueta estática y Angular generará una web distinta.

Mi primera opción será **Firebase Hosting** o **Cloudflare Pages**, comprobando antes las condiciones y los límites gratuitos vigentes.

Cuando Angular funcione:

1. Guardo todos los cambios en GitHub.
2. Ejecuto la preparación de la web para publicar:

```powershell
cd angular-app
npm run build
```

3. Compruebo que la compilación termina sin errores.
4. Elijo un servicio de publicación y sigo su asistente oficial para conectar el repositorio o subir la carpeta generada.
5. Configuro que las rutas de Angular funcionen al recargar una página interna.
6. Abro la dirección pública desde mi móvil y desde otro navegador.
7. Anoto la URL definitiva para usarla en el botón de JavaFX y en la memoria.

**Los planes gratuitos tienen límites y pueden cambiar.** Antes de activar un servicio que pida tarjeta o facturación, lo consultaré con mi tutor y revisaré si realmente es necesario.

---

## 13. Cómo repartir el trabajo hasta mayo de 2027

Me propongo **cuatro sesiones de tres horas a la semana**, adaptándolas a exámenes, vacaciones y entregas. Es una planificación, no una obligación de completar exactamente el mismo número de sesiones cada semana.

| Cuándo | Lo que haré yo | Cómo sabré que he avanzado |
|---|---|---|
| Finales de octubre | Revisar herramientas, propuesta y repositorio | Puedo abrir la maqueta y GitHub |
| Noviembre, semanas 1–2 | Crear Angular y organizar las carpetas | Angular se abre en el navegador |
| Noviembre, semanas 3–4 | Pasar portada, menú y estilos | La nueva portada se parece a mi diseño |
| Diciembre, semanas 1–2 | Páginas de juegos y personajes | Puedo navegar entre ambas |
| Diciembre, semanas 3–4 | Fichas iniciales y contenidos | Se abren fichas con imagen y texto |
| Enero, semanas 1–2 | Criaturas, virus y organizaciones | Tengo más secciones funcionales |
| Enero, semanas 3–4 | Lugares, películas y relaciones | Los enlaces entre fichas funcionan |
| Febrero, semanas 1–2 | Buscador y filtros básicos | Encuentro una ficha por nombre |
| Febrero, semanas 3–4 | Cronología y mapa | Puedo recorrer acontecimientos y lugares |
| Marzo, semanas 1–2 | Firebase y acceso de usuarios | Puedo registrarme y cerrar sesión |
| Marzo, semanas 3–4 | JavaFX y Scene Builder | El lanzador abre la web |
| Abril, semanas 1–2 | Publicación y pruebas en otros dispositivos | Tengo una URL pública que funciona |
| Abril, semanas 3–4 | Corregir errores y redactar memoria | Tengo capturas y pruebas documentadas |
| Mayo | Memoria, presupuesto real, presentación y defensa | Puedo mostrar el proyecto de principio a fin |

Si me retraso, **priorizaré una web funcional con secciones y fichas** antes que efectos visuales, cuentas avanzadas o mapas muy complejos. La entrega debe funcionar, aunque deje mejoras para el futuro.

---

## 14. Presupuesto y sesiones que voy a registrar

Para justificar el presupuesto anotaré las sesiones reales, el material que utilizo y cualquier gasto que aparezca. Si mantengo el ritmo de cuatro sesiones semanales durante unas 26 semanas efectivas, serían **aproximadamente 104 sesiones de 3 horas, es decir, 312 horas**. Revisaré esa cifra al final según mi calendario real.

### Mi tabla de seguimiento

| Fecha | Qué hice | Horas | Problemas o decisiones |
|---|---|---:|---|
| Ejemplo: 05/11/2026 | Instalé Angular y abrí la primera página | 3 | Revisé la versión de Node |
| | | | |
| | | | |

### Qué gastos voy a considerar

- **Ordenador propio:** no significa coste cero. Para el presupuesto académico calcularé su **amortización proporcional** a los días utilizados.
- **Software:** VS Code, Git, Node.js, Angular y las ediciones gratuitas que utilice no tienen coste de licencia para este trabajo.
- **Servicios web:** estimaré 0 € mientras permanezca dentro de un plan gratuito, indicando que está sujeto a límites.
- **Dominio propio:** opcional; puedo usar una dirección gratuita del alojamiento.
- **Impresiones, almacenamiento o materiales:** los incluiré solo si realmente los necesito.

**Fórmula para el equipo:** `coste de compra ÷ días de vida útil estimada × días de uso en el proyecto`.

Ejemplo **solo orientativo**, que debo sustituir por mis datos: ordenador de 800 €, vida útil de 5 años (1.825 días) y 80 días de uso para el proyecto: `800 ÷ 1.825 × 80 = 35,07 €` de amortización. No significa que vaya a pagar otra vez ese dinero.

---

## 15. Qué pruebas tengo que hacer antes de entregar

- [ ] La portada y el menú se ven bien en ordenador y móvil.
- [ ] Todas las secciones principales se abren.
- [ ] Las fichas tienen imágenes, texto y enlaces correctos.
- [ ] El buscador devuelve resultados.
- [ ] La cronología se entiende y el mapa es utilizable.
- [ ] El acceso de usuarios funciona si lo incluyo en la entrega.
- [ ] Las reglas de Firebase no permiten leer o cambiar datos privados sin permiso.
- [ ] El programa JavaFX abre la web publicada.
- [ ] La web funciona al entrar directamente en una página interna.
- [ ] He probado al menos dos navegadores y un teléfono.
- [ ] He revisado faltas de ortografía, fuentes y créditos de imágenes.
- [ ] El repositorio está actualizado y no contiene contraseñas.
- [ ] Tengo capturas de las fases del proyecto y de los problemas resueltos.

---

## 16. Preparar la memoria y la presentación

Durante el proyecto guardaré capturas en `documentos/` con nombres fáciles de entender, por ejemplo `01-maqueta`, `02-angular-inicial`, `03-fichas`, `04-buscador`, `05-firebase`, `06-javafx` y `07-web-publicada`.

En la memoria explicaré **por qué elegí el proyecto, qué quería conseguir, cómo organicé el trabajo, qué diseñé, qué programas utilicé, qué problemas tuve y cómo los solucioné**. Incluiré los antecedentes y referentes de la propuesta, el calendario previsto y el real, el presupuesto, las pruebas, las conclusiones y los créditos.

Para la defensa prepararé una presentación sencilla: enseñar la portada, abrir una sección, mostrar una ficha, usar el buscador, recorrer la cronología y abrir el lanzador JavaFX. Tendré capturas o un vídeo breve por si falla internet.

### Mis tres primeras sesiones

**Sesión 1:** comprobar versiones, abrir mi repositorio y recorrer la maqueta. Anotar qué páginas están ya diseñadas.

**Sesión 2:** crear `angular-app`, ejecutar `npm start` y conseguir que Angular abra en el navegador. Guardar una captura.

**Sesión 3:** pasar el logo, los colores y la estructura de la portada a Angular. Hacer que el enlace a Wiki funcione.

**No necesito entenderlo todo el primer día.** Cada sesión debe dejar una mejora que pueda ver y comprobar. Así podré explicar el Proyecto Final con mis propias palabras, porque realmente habré seguido y documentado cada paso.

---

*Umbrella Archives · Guía personal de desarrollo · versión revisada, octubre de 2026.*
