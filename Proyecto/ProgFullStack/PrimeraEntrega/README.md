# DRAFTOSAURUS - Documentación del Proyecto

## ÍNDICE
1. Justificación Tecnológica
2. Configuración del Entorno de Desarrollo
3. Control de Versiones

---------------------------------------------------------------------

## JUSTIFICACIÓN TECNOLÓGICA

### 1. HTML

#### a. Estándar para la estructura de páginas web
HTML5 es el estándar actual para la creación de páginas web, proporcionando una base sólida y semántica para estructurar contenido digital. Su adopción universal garantiza compatibilidad y accesibilidad.

#### b. Jerarquiza elementos del juego: tablero, cartas, botones, menús, etc.
En Draftosaurus, HTML5 se utiliza para estructurar jerárquicamente todos los elementos del juego:
- Tablero principal: <div class="contenedor-tablero">
- Recintos del zoológico: <div class="recinto">
- Dinosaurios arrastrables: <div class="arrastrable">
- Sistema de navegación: <nav class="barra-navegacion">
- Formularios de usuario: <form> con validación nativa
- Estadísticas y resultados: <section> con estructura semántica

#### c. Ventajas

i. Estructuración semántica
```html
<nav class="barra-navegacion">
    <ul>
        <li><a href="index.html">Inicio</a></li>
        <li><a href="como-jugar.html">¿Cómo jugar?</a></li>
    </ul>
</nav>

<section class="seccion-como-jugar">
    <h2>Objetivo del Juego</h2>
    <p>Coloca dinosaurios en los recintos...</p>
</section>
```

ii. Compatibilidad
- Navegadores modernos: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- Dispositivos móviles: Android 6+, iOS 12+
- Accesibilidad: Navegación por teclado, lectores de pantalla
- SEO: Estructura optimizada para motores de búsqueda

iii. Integración con otras tecnologías
- CSS3: Estilos y animaciones
- JavaScript ES6+: Interactividad y lógica de juego
- Font Awesome: Iconografía
- Drag & Drop API: Funcionalidad nativa del navegador

### 2. CSS

#### a. Estética, experiencia visual, diferencia temática
CSS3 se utiliza para crear una experiencia visual atractiva y temática que refleje el mundo de los dinosaurios y zoológicos:
- Paleta de colores: Verde (#4caf50) para naturaleza, grises para modernidad
- Tipografía: Segoe UI para legibilidad
- Animaciones: Transiciones suaves para mejor UX
- Tema visual: Fondos naturales, iconografía de dinosaurios

#### b. Ventajas

i. Personalización
```css
.barra-navegacion {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.recinto {
    background-color: rgba(255, 255, 255, 0.5);
    border: 1.5px dashed #666;
    border-radius: 1vw;
}
```

ii. Responsive
```css
@media (max-width: 576px) {
    .hamburguesa { display: flex; }
    .barra-navegacion ul { flex-direction: column; }
}

@media (min-width: 577px) {
    .hamburguesa { display: none; }
    .barra-navegacion ul { flex-direction: row; }
}
```

iii. Separación de la estructura
- HTML: Solo estructura y contenido
- CSS: Solo presentación y estilos
- Mantenibilidad: Cambios visuales sin tocar HTML
- Reutilización: Estilos modulares y componentes

### 3. JavaScript

#### a. Interactividad y lógica de juego
JavaScript ES6+ se utiliza para dotar de interactividad y lógica dinámica a la aplicación Draftosaurus:
- Navegación entre modos y secciones sin recargar la página.
- Gestión de formularios de login y registro.
- Filtros y visualización dinámica de resultados.
- Implementación de la funcionalidad Drag & Drop para mover dinosaurios en el tablero.

#### b. Ventajas

i. Experiencia de usuario mejorada
```js
// Ejemplo: Mostrar y ocultar formularios de login/registro
function mostrarFormulario(tipo) {
    // ...código...
}
```
- Permite una navegación fluida y sin recargas.
- Facilita la validación y retroalimentación inmediata en formularios.

ii. Manipulación del DOM
```js
// Ejemplo: Drag & Drop de dinosaurios
draggables.forEach(elem => {
    elem.addEventListener('dragstart', (e) => {
        // ...código...
    });
});
```
- Permite modificar la interfaz en tiempo real según las acciones del usuario.
- Hace posible la lógica de juego y la interacción con el tablero.

iii. Modularidad y escalabilidad
- El código JS está organizado en funciones reutilizables.
- Facilita la extensión de nuevas funcionalidades (más modos, validaciones, etc.).

#### c. Integración con otras tecnologías
- HTML5: Manipulación de elementos y atributos.
- CSS3: Cambios de clases para animaciones y estilos dinámicos.
- APIs nativas: Uso de Drag & Drop API para la experiencia de tablero.

---------------------------------------------------------------------

## CONFIGURACIÓN DEL ENTORNO DE DESARROLLO

### 1. Paso a paso de la instalación del IDE

#### Visual Studio Code
1. Descarga: Ve a https://code.visualstudio.com
2. Instalar: Ejecuta el instalador y sigue las instrucciones
3. Extenciones: Instala extensiones recomendadas:
   - Live Server: Para servidor de desarrollo
   - HTML CSS Support: Autocompletado
   - Auto Rename Tag: Para HTML
   - Bracket Pair Colorizer: Para mejor legibilidad
   - Prettier: Formateo de código

#### Extensiones Específicas para el Proyecto
- Live Server: Servidor local con recarga automática
- HTML Snippets: Snippets para HTML5
- CSS Peek: Navegación rápida en CSS
- GitLens: Integración avanzada con Git

---------------------------------------------------------------------

## CONTROL DE VERSIONES

### 1. Crear repositorio inicial

#### Configuración inicial de Git
```bash
git init
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"
git add .
git commit -m "feat: inicializar proyecto Draftosaurus"
git push origin main
```

### 2. Justificación de elección

#### ¿Por qué Git?
- Control de versiones distribuido: Trabajo offline y sincronización
- Historial completo: Seguimiento de todos los cambios
- Ramas: Desarrollo paralelo sin conflictos
- Colaboración: Múltiples desarrolladores en el mismo proyecto

#### ¿Por qué GitHub?
- Hosting gratuito: Repositorios públicos sin costo
- GitHub Pages: Despliegue automático de sitios web
- Comunidad: Plataforma de desarrollo colaborativo
- Integración: Herramientas y servicios adicionales

### 3. Determinar convenciones de commits

#### Convenciones de commits
```bash
git commit -m "feat: agregar sistema de navegación hamburguesa"
git commit -m "fix: corregir responsive de celular"
git commit -m "docs: actualizar documentación técnica"
git commit -m "style: CSS agregar orden CSS"
git commit -m "entregaProycto: Primer entrega del Proyecto"
```

#### Tipos de Commits
- feat: Nueva funcionalidad
- fix: Corrección de errores
- docs: Cambios en documentación
- style: Cambios de estilos CSS o reestructura de HTML
- entregaProyecto: Para entregas de proyecto 

#### Reglas de Commits
1. Mensajes en español
2. Descripción clara
3. Usar verbos en imperativo ("agregar", no "agregado")

---------------------------------------------------------------------

### Compatibilidad
- Navegadores: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- Dispositivos: Móviles, tablets, desktop
- Sistemas: Windows, macOS, Linux

---------------------------------------------------------------------

## CONTACTO

- Proyecto: Draftosaurus
- Versión: 1.0.0
- Equipo: TricoTech

---------------------------------------------------------------------

Documentación del Proyecto - Draftosaurus v1.0
Última actualización: 14/07/2025