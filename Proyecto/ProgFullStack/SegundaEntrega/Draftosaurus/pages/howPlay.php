<?php
$pageTitle = "Cuenta - Draftosaurus";
include '../inc/templates/header.php';
include '../inc/templates/nav.php';
?>

<main>

    <div class="contenedor-como-jugar">
        <header class="encabezado-como-jugar">
            <h1>Draftosaurus - ¿Cómo se juega?</h1>
        </header>

        <section class="seccion-como-jugar">
            <h2>Objetivo</h2>
            <p>Coloca dinosaurios en los recintos de tu zoológico para conseguir la mayor cantidad de puntos posible.
            </p>
        </section>

        <section class="seccion-como-jugar">
            <h2>Paso a paso</h2>
            <ul>
                <li>El juego se juega en <strong>2 rondas de 6 turnos</strong> cada una.</li>
                <li>Al inicio de cada ronda, cada jugador toma <strong>6 dinosaurios al azar</strong> y elige uno para
                    colocar en su tablero.</li>
                <li>Los dinosaurios restantes se pasan al jugador de la izquierda.</li>
                <li>El <strong>jugador inicial lanza un dado</strong> que impone una restricción de colocación (solo
                    para los demás jugadores).</li>
                <li>Si no puedes o no quieres colocar un dinosaurio, puedes descartarlo en el <strong>río</strong>.</li>
                <li>Después de la segunda ronda, se suman los puntos.</li>
            </ul>
        </section>

        <section class="seccion-como-jugar">
            <h2>Tipos de recintos</h2>
            <ul>
                <li><strong>Bosque de la Semejanza:</strong> solo permite dinosaurios de la <em>misma especie</em>.</li>
                <li><strong>Prado de la Diferencia:</strong> no permite repetir especies.</li>
                <li><strong>Pradera del Amor:</strong> permite <em>parejas</em> de la misma especie, hasta 6
                    dinosaurios.</li>
                <li><strong>Trío Frondoso:</strong> solo puntúa si colocas exactamente <strong>3 dinosaurios</strong>
                    (de cualquier especie).</li>
                <li><strong>Rey de la Selva:</strong> da 7 puntos si tienes la mayoría de una especie específica entre
                    todos los jugadores.</li>
                <li><strong>Isla Solitaria:</strong> solo puntúa si ese dinosaurio <strong>no se repite en otro
                        recinto</strong> de tu parque.</li>
                <li><strong>Río:</strong> cada dinosaurio aquí vale <strong>1 punto</strong>.</li>
            </ul>
            <p class="nota-como-jugar">Cada recinto con un <strong>T-Rex</strong> otorga <strong>+1 punto
                    adicional</strong>.</p>
        </section>

        <section class="seccion-como-jugar">
            <h2>Restricciones del dado</h2>
            <ul>
                <li>Zona del <strong>bosque</strong> (parte superior del tablero).</li>
                <li>Zona de <strong>llanura</strong> (parte inferior).</li>
                <li>Zona <strong>derecha del río</strong> (baños) o <strong>izquierda</strong> (cafetería).</li>
                <li>Recinto <strong>vacío</strong> o sin <strong>T-Rex</strong>.</li>
            </ul>
            <p class="nota-como-jugar">El jugador que lanza el dado no tiene que cumplir con su restricción.</p>
        </section>

        <section class="seccion-como-jugar">
            <h2>Fin de la partida</h2>
            <p>La partida termina tras dos rondas (12 dinosaurios por jugador). El jugador con más puntos gana.</p>
            <p class="nota-como-jugar">En caso de empate, gana quien tenga menos T-Rex.</p>
        </section>

        <footer class="pie-como-jugar">
            Página de reglas | Draftosaurus © TricoTech
        </footer>
    </div>

    <script src="../../assets/js/script.js"></script>


</main>

</body>

</html>