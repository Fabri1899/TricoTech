<?php
$pageTitle = "Bienvenido - Draftosaurus";
include 'inc/templates/header.php';
include 'inc/templates/nav.php';
?>

<main>

    <div class="contenedor">
        <div id="contenido-bienvenida">
            <h1>Bienvenido a Draftosaurus!</h1>
            <p>Preparate para jugar y divertirte</p>
            <button onclick="mostrarModosJuego()">Comenzar Juego</button>
        </div>

        <div id="modos-juego" style="display: none;">
            <h2>Elegir modo de juego</h2>
            <div class="botones-modos">
                <button class="btn-modo" onclick="seleccionarModo('game')">Modo Juego</button>
                <button class="btn-modo" onclick="seleccionarModo('tracing')">Modo Seguimiento</button>
            </div>
            <button class="btn-volver" onclick="volverInicio()">Volver</button>
        </div>
    </div>

    <script src="assets/js/script.js?v=<?php echo time(); ?>"></script>


</main>

</body>

</html>


// Cambiar los .php a index, separar front y back