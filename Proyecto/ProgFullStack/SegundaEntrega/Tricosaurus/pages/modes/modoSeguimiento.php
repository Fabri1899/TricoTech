<?php
$pageTitle = "Modo Seguimiento - Draftosaurus";
$customCSS = 'seguimiento.css';
include '../../inc/templates/header.php';
include '../../inc/templates/nav.php';
?>

<main class="contenedor">

        <h3>Seleccione Cant.Jugadores</h3>
        <label for="selectJugadores">Cantidad de jugadores:</label>
        <select id="selectJugadores">
            <option value="2">2 jugadores</option>
            <option value="3">3 jugadores</option>
            <option value="4">4 jugadores</option>
            <option value="5">5 jugadores</option>
        </select>


        <h3>Opciones de Ronda</h3>
        <select id="selectRonda"></select>
        <div>
            <button onclick="guardarRonda()">Guardar Ronda</button>
            <button onclick="deshacerCambio()">Deshacer</button>
            <button onclick="restaurarRonda()">Restaurar</button>
        </div>

        <h5>Dinosaurios disponibles</h5>
        <div id="contenedor-dinosaurio"></div>

        <div class="contenedor-tablero seguimiento-tablero" id="tablero"></div>
        <div class="king-check">
            <label>
                <input type="checkbox" id="kingCheck"> ¿Tienes al rey de la selva?
            </label>
        </div>

        <h3>Puntajes</h3>
        <div id="puntajes" class="puntajes-container"></div>

        <h3>GUARDAR Y CARGAR PARTIDA</h3>
        <button id="btnGuardarPartida">Guardar partida</button>
        <button id="btnRestaurarPartida">Cargar partida</button>


        <div id="partidasDisponibles"></div>

        <script src="../../assets/js/scriptSeguimiento.js"></script>

</main>
