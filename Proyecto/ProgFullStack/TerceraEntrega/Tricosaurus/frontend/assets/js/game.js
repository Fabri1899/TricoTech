'use strict';

// Funciones de navegación entre modos de juego
function mostrarModosJuego() {
    const contenidoBienvenida = document.getElementById('contenido-bienvenida');
    const modosJuego = document.getElementById('modos-juego');
    
    if (contenidoBienvenida && modosJuego) {
        contenidoBienvenida.style.display = 'none';
        modosJuego.style.display = 'block';
    }
}

function volverInicio() {
    const contenidoBienvenida = document.getElementById('contenido-bienvenida');
    const modosJuego = document.getElementById('modos-juego');
    
    if (contenidoBienvenida && modosJuego) {
        contenidoBienvenida.style.display = 'block';
        modosJuego.style.display = 'none';
    }
}

function seleccionarModo(modo) {
    if (modo === 'game') {
        window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/modes/game.html';
    } else if (modo === 'tracing') {
        window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/modes/modoSeguimiento.html';
    }
}