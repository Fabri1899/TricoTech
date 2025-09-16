'use strict'



// =============================
// FORMULARIOS DE LOGIN Y REGISTRO
// =============================

function mostrarFormulario(tipo) {
    const loginForm = document.getElementById('formulario-login');
    const registroForm = document.getElementById('formulario-registro');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (tipo === 'login') {
        loginForm.style.display = 'block';
        registroForm.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registroForm.style.display = 'block';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

async function login() {
    const API_URL = 'http://localhost:8000/api/v1/user_access.php'; 

    const identifier = document.getElementById('login_identifier').value;
    const password = document.getElementById('login_password').value;
    const messageDiv = document.getElementById('message');

    const response = await fetch(API_URL + '?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
    });

    const result = await response.json();
    messageDiv.textContent = result.message;
    if (result && result.success) {
        window.location.href = '../../index.php';
    }
}

async function register() {
    const API_URL = 'http://localhost:8000/api/v1/user_access.php'; 

    const username = document.getElementById('register_username').value;
    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;
    const messageDiv = document.getElementById('message');

    const response = await fetch(API_URL + '?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    messageDiv.textContent = result.message;
}

 // =============================
 // NAVEGACIÓN ENTRE MODOS DE JUEGO
 // =============================

function mostrarModosJuego() {
    document.getElementById('contenido-bienvenida').style.display = 'none';
    document.getElementById('modos-juego').style.display = 'block';
}


function volverInicio() {
    document.getElementById('contenido-bienvenida').style.display = 'block';
    document.getElementById('modos-juego').style.display = 'none';
}


function seleccionarModo(modo) {
    if (modo === 'game') {
        window.location.href = '../../pages/modes/game.php';
    } else if (modo === 'tracing') {
        window.location.href = '../../pages/modes/modoSeguimiento.php';
    }
}



// // =============================
// // RESULTADOS Y FILTROS
// // =============================

// function mostrarResultados(tipo) {
//     document.getElementById('contenido-resultados').style.display = 'none';
    
//     if (tipo === 'juego') {
//         document.getElementById('resultados-juego').style.display = 'block';
//         document.getElementById('resultados-seguimiento').style.display = 'none';
//     } else {
//         document.getElementById('resultados-juego').style.display = 'none';
//         document.getElementById('resultados-seguimiento').style.display = 'block';
//     }
// }

// function volverResultados() {
//     document.getElementById('contenido-resultados').style.display = 'block';
//     document.getElementById('resultados-juego').style.display = 'none';
//     document.getElementById('resultados-seguimiento').style.display = 'none';
// }

// // Filtra los resultados según el tipo y el filtro seleccionado
// function filtrarResultados(tipo) {
//     const filtro = document.getElementById(`filtro-${tipo}`).value;
//     const lista = document.getElementById(`lista-${tipo}`);
//     const items = lista.querySelectorAll('.item-resultado');
    
//     items.forEach((item, index) => {
//         let mostrar = true;
        
//         if (tipo === 'juego') {
//             const estado = item.querySelector('.estado').textContent.toLowerCase();
//             if (filtro === 'ganadas' && !estado.includes('ganada')) {
//                 mostrar = false;
//             } else if (filtro === 'perdidas' && !estado.includes('perdida')) {
//                 mostrar = false;
//             } else if (filtro === 'recientes' && index >= 3) {
//                 mostrar = false;
//             }
//         } else {
//             if (filtro === 'hoy') {
//                 const fecha = item.querySelector('.fecha').textContent;
//                 const hoy = new Date().toLocaleDateString('es-ES');
//                 if (fecha !== hoy) mostrar = false;
//             } else if (filtro === 'semana' && index >= 7) {
//                 mostrar = false;
//             } else if (filtro === 'mes' && index >= 30) {
//                 mostrar = false;
//             }
//         }
//         item.style.display = mostrar ? 'block' : 'none';
//     });
// }

// // =============================
// // MENÚ HAMBURGUESA (CELULAR)
// // =============================

// function cerrarMenuHamburguesa() {
//     const toggleHamburguesa = document.querySelector('.toggle-hamburguesa');
//     if (toggleHamburguesa && toggleHamburguesa.checked) {
//         toggleHamburguesa.checked = false;
//     }
// }
// // Cierra el menú hamburguesa al hacer clic en un enlace de navegación
// document.addEventListener('DOMContentLoaded', function() {
//     const navLinks = document.querySelectorAll('.barra-navegacion a');
//     navLinks.forEach(link => {
//         link.addEventListener('click', cerrarMenuHamburguesa);
//     });
// }); 

// // =============================
// // ZONA DE DROP Y DRAG & DROP DEL TABLERO
// // =============================

// const draggables = document.querySelectorAll('.arrastrable');
// const dropTargets = document.querySelectorAll('.drop-target');

// // Habilita el arrastre de los elementos del dinosaurio
// // Solo permite arrastrar si no está deshabilitado
// // Al iniciar el drag, guarda el id del elemento
// // Si está deshabilitado, previene el arrastre

// draggables.forEach(elem => {
//     elem.addEventListener('dragstart', (e) => {
//         if (!elem.classList.contains('disabled')) {
//             e.dataTransfer.setData('text/plain', e.target.id);
//         } else {
//             e.preventDefault();
//         }
//     });
// });

// // ZONA DE DROP: PERMITE SOLTAR Y VALIDA EL LÍMITE DE DINOSAURIOS
// // Si el recinto ya tiene el máximo, muestra alerta
// // Si no, añade el dinosaurio y lo deshabilita para que no se mueva más

// dropTargets.forEach(target => {
//     target.addEventListener('dragover', (e) => {
//         e.preventDefault();
//     });

//     target.addEventListener('drop', (e) => {
//         e.preventDefault();
//         const id = e.dataTransfer.getData('text/plain');
//         const draggedElement = document.getElementById(id);

//         // Validación de máximo de dinosaurios por recinto
//         const max = parseInt(target.getAttribute('data-max'), 10);
//         const currentCount = target.querySelectorAll('.draggable').length;

//         if (currentCount < max) {
//             target.appendChild(draggedElement);
//             // Desactiva el drag para que no se pueda volver a mover
//             draggedElement.setAttribute('draggable', 'false');
//             draggedElement.classList.add('deshabilitado');
//         } else {
//             alert(`Este recinto ya tiene el máximo de ${max} cuadrado(s).`);
//         }
//     });
// }); 


//     // RECINTOS

// const recintos = [
//   { clase: "EPDLI", max: 6, top: "18%", left: "22%", etiqueta: "A" },
//   { clase: "ETDLB", max: 3, top: "48%", left: "19%", etiqueta: "B" },
//   { clase: "LPDA", max: 6, top: "79%", left: "25%", etiqueta: "C" },
//   { clase: "ERDLS", max: 1, top: "16%", left: "50%", etiqueta: "D" },
//   { clase: "LLDLD", max: 6, top: "50%", left: "76%", etiqueta: "E" },
//   { clase: "LIS", max: 1, top: "75%", left: "83%", etiqueta: "F" },
//   { clase: "ER", max: 6, top: "86%", left: "55%", etiqueta: "G" }
// ];

// const tablero = document.getElementById("tablero");

// recintos.forEach(r => {
//   const recinto = document.createElement("div");
//   recinto.className = `recinto ${r.clase} drop-target`;
//   recinto.setAttribute("data-max", r.max);
//   recinto.style.top = r.top;
//   recinto.style.left = r.left;

//   const span = document.createElement("span");
//   span.className = "etiqueta-recinto";
//   span.textContent = r.etiqueta;

//   recinto.appendChild(span);
//   tablero.appendChild(recinto);
// });