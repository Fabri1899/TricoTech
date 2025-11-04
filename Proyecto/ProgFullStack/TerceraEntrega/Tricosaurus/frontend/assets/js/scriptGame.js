// ---------------------------
// VARIABLES GLOBALES - MODO JUEGO
// ---------------------------

let cantRondas = 4;
let rondaActual = 1;
let cantJugadores = 2;
let jugadorActual = 1;
let historialMovimientos = [];
let puntajesPorJugadorPorRonda = {}; // { "Jugador1_Ronda1": 10, ... }
let estadoPorJugadorPorRonda = {}; // { "Jugador1_Ronda1": {...}, ... }
let kingPorJugadorPorRonda = {}; // { "Jugador1_Ronda1": true, ... }
let contadorEspecies = {};

// Bolsas
let bolsaGrandeRonda = []; // Bolsa grande de la ronda actual
let bolsasJugadoresRonda = {}; // { "1": [...], "2": [...], ... }

// Jugadores logueados
let jugadoresLogueados = {}; // { "1": { id: 1, username: "...", token: "..." }, ... }

// Estado de la partida
let partidaIniciada = false;
let partidaIdActual = null; // ID de la partida actual en la base de datos
let ordenTurnos = []; // Array con el orden de los jugadores para esta ronda
let indiceTurnoActual = 0; // Índice en ordenTurnos
let dinosauriosColocadosRonda = {}; // { "1": 0, "2": 0, ... } cuántos dinosaurios ha colocado cada jugador en esta ronda

let selectedDino = null;

// Mismos dinosaurios que modo seguimiento
let draggables = [
    { id: "tRex", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/tRex.png" },
    { id: "SPECIE_1", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie1.png" },
    { id: "SPECIE_2", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie2.png" },
    { id: "SPECIE_3", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie3.png" },
    { id: "SPECIE_4", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie4.png" },
    { id: "SPECIE_5", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie5.png" }
];

// ---------------------------
// SELECTS
// --------------------------

const selectRonda = document.getElementById("selectRonda");
const selectJugadores = document.getElementById("selectJugadores");
const selectJugador = document.getElementById("selectJugador");

// ---------------------------
// LOCALSTORAGE - PERSISTENCIA DE JUGADORES
// ---------------------------

function guardarJugadoresEnLocalStorage() {
    try {
        localStorage.setItem('jugadoresLogueados', JSON.stringify(jugadoresLogueados));
        localStorage.setItem('cantJugadores', JSON.stringify(cantJugadores));
    } catch (e) {
        console.error('Error al guardar jugadores en localStorage:', e);
    }
}

async function verificarSesionActiva() {
    try {
        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
        const response = await fetch(`${API_URL}?path=auth/session`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.success && data.authenticated;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        return false;
    }
}

// Obtiene los datos del usuario de la sesión actual (o null si no hay sesión)
async function obtenerUsuarioSesion() {
    try {
        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
        const response = await fetch(`${API_URL}?path=auth/session`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) return null;
        const data = await response.json();
        if (data && data.success && data.authenticated && data.user) {
            return {
                id: data.user.id,
                username: data.user.username,
                email: data.user.email || ''
            };
        }
        return null;
    } catch (error) {
        console.error('Error al obtener usuario de sesión:', error);
        return null;
    }
}

async function cargarJugadoresDesdeLocalStorage() {
    try {
        const jugadoresGuardados = localStorage.getItem('jugadoresLogueados');
        const cantJugadoresGuardada = localStorage.getItem('cantJugadores');
        
        if (cantJugadoresGuardada) {
            cantJugadores = parseInt(JSON.parse(cantJugadoresGuardada));
            // Ajustar cantRondas según la cantidad de jugadores cargada
            cantRondas = (cantJugadores === 2) ? 4 : 2;
            if (selectJugadores) {
                selectJugadores.value = cantJugadores;
            }
        } else {
            // Si no hay guardado, usar valores por defecto
            cantRondas = (cantJugadores === 2) ? 4 : 2;
        }
        
        if (jugadoresGuardados) {
            const jugadoresCargados = JSON.parse(jugadoresGuardados);
            
            // Limpiar jugadores primero
            jugadoresLogueados = {};
            
            // Verificar si hay una sesión activa en el servidor
            const sesionActiva = await verificarSesionActiva();
            
            if (sesionActiva && Object.keys(jugadoresCargados).length > 0) {
                // Si hay sesión activa, cargar los jugadores
                jugadoresLogueados = jugadoresCargados;
                // Asegurar que si hay alguien logueado sea Jugador 1
                asegurarJugadorUno();
                console.log('Jugadores cargados desde localStorage (sesión activa):', jugadoresLogueados);
            } else if (sesionActiva && Object.keys(jugadoresCargados).length === 0) {
                // No hay jugadores guardados, pero hay sesión → usar usuario de sesión como Jugador 1
                const usuarioSesion = await obtenerUsuarioSesion();
                if (usuarioSesion) {
                    jugadoresLogueados[1] = usuarioSesion;
                    guardarJugadoresEnLocalStorage();
                    console.log('Usuario de sesión asignado automáticamente a Jugador 1:', usuarioSesion);
                } else {
                    jugadoresLogueados = {};
                    localStorage.removeItem('jugadoresLogueados');
                    console.log('Sesión activa pero sin usuario válido');
                }
            } else {
                // Si no hay sesión activa, limpiar jugadores
                jugadoresLogueados = {};
                localStorage.removeItem('jugadoresLogueados');
                console.log('Sesión no activa, jugadores limpiados');
            }
        } else {
            // No había jugadores guardados. Si hay sesión, autocompletar Jugador 1 con el usuario de sesión
            const sesionActiva = await verificarSesionActiva();
            if (sesionActiva) {
                const usuarioSesion = await obtenerUsuarioSesion();
                if (usuarioSesion) {
                    jugadoresLogueados[1] = usuarioSesion;
                    guardarJugadoresEnLocalStorage();
                    console.log('Usuario de sesión asignado automáticamente a Jugador 1 (sin storage previo):', usuarioSesion);
                }
            }
        }
    } catch (e) {
        console.error('Error al cargar jugadores desde localStorage:', e);
        jugadoresLogueados = {};
    }
}

// Garantiza que, si existe al menos un usuario logueado, esté asignado al Jugador 1
function asegurarJugadorUno() {
    if (!jugadoresLogueados || Object.keys(jugadoresLogueados).length === 0) return;
    if (jugadoresLogueados[1]) return; // Ya es jugador 1

    // Tomar el primer jugador logueado y moverlo a la posición 1
    const primeraClave = Object.keys(jugadoresLogueados)[0];
    const datos = jugadoresLogueados[primeraClave];
    delete jugadoresLogueados[primeraClave];
    jugadoresLogueados[1] = datos;
}

// ---------------------------
// INICIALIZACIÓN
// ---------------------------

document.addEventListener('DOMContentLoaded', async function() {
    // Cargar jugadores guardados antes de inicializar
    await cargarJugadoresDesdeLocalStorage();
    // Asegurar que si hay alguien logueado sea Jugador 1
    asegurarJugadorUno();
    
    inicializarControles();
    actualizarRondas();
    mostrarFormulariosLogin();
    inicializarBotonCrearPartida();
    cargarPartidaDesdeURL();
    
    // Verificar todos los jugadores después de cargar (con verificación de sesión)
    await verificarTodosLogueados();
    
    // Guardar jugadores cuando cambien (menos frecuente)
    setInterval(() => {
        guardarJugadoresEnLocalStorage();
    }, 5000); // Reducido a cada 5 segundos
});

function inicializarControles() {
    if (selectJugadores) {
        selectJugadores.addEventListener("change", e => {
            cantJugadores = parseInt(e.target.value);
            // 2 jugadores = 4 rondas, 3-5 jugadores = 2 rondas
            cantRondas = (cantJugadores === 2) ? 4 : 2;
            jugadorActual = 1;
            
            // No limpiar jugadores si ya están logueados (persistencia)
            // Solo limpiar si hay más jugadores que los permitidos
            const jugadoresActuales = Object.keys(jugadoresLogueados).map(k => parseInt(k));
            const maxJugador = Math.max(...jugadoresActuales, 0);
            if (maxJugador > cantJugadores) {
                // Eliminar jugadores que exceden la cantidad
                for (let i = cantJugadores + 1; i <= maxJugador; i++) {
                    delete jugadoresLogueados[i];
                }
            }
            
            // Guardar cambios
            guardarJugadoresEnLocalStorage();
            
            // Mostrar formularios de login
            mostrarFormulariosLogin();
            
            // Actualizar controles
            actualizarJugadores();
            actualizarRondas();
        });
    }

    if (selectRonda) {
        selectRonda.addEventListener("change", e => {
            rondaActual = parseInt(e.target.value);
            restaurarRonda();
            actualizarBolsaGrande();
            actualizarBolsasJugadores();
        });
    }

    if (selectJugador) {
        selectJugador.addEventListener("change", e => {
            jugadorActual = parseInt(e.target.value);
            actualizarJugadorActivo();
        });
    }
}

function actualizarJugadores() {
    if (!selectJugador) return;
    selectJugador.innerHTML = "";
    for (let i = 1; i <= cantJugadores; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = "Jugador " + i;
        selectJugador.appendChild(opt);
    }
    jugadorActual = 1;
    actualizarJugadorActivo();
}

function actualizarJugadorActivo() {
    // Actualizar clase active en tableros y bolsas
    document.querySelectorAll('.tablero-jugador').forEach((tab, idx) => {
        tab.classList.toggle('active', idx + 1 === jugadorActual);
    });
    document.querySelectorAll('.bolsa-jugador').forEach((bol, idx) => {
        bol.classList.toggle('active', idx + 1 === jugadorActual);
    });
}

// ---------------------------
// BOLSAS
// ---------------------------

function crearBolsaRonda() {
    // Crear bolsa grande según número de jugadores
    // - 5 jugadores: 10 de cada especie = 60 total
    // - 4 jugadores: retirar 2 de cada especie = 8 de cada especie = 48 total
    // - 3 jugadores: retirar 4 de cada especie = 6 de cada especie = 36 total
    // - 2 jugadores: retirar 2 de cada especie = 8 de cada especie = 48 total
    bolsaGrandeRonda = [];
    
    let dinosPorEspecie = 10;
    if (cantJugadores === 4 || cantJugadores === 2) {
        dinosPorEspecie = 8; // Retirar 2 de cada especie
    } else if (cantJugadores === 3) {
        dinosPorEspecie = 6; // Retirar 4 de cada especie
    }
    // Si son 5 jugadores, dinosPorEspecie = 10 (por defecto)
    
    draggables.forEach(dino => {
        for (let i = 0; i < dinosPorEspecie; i++) {
            bolsaGrandeRonda.push(dino.id);
        }
    });

    // Mezclar aleatoriamente
    bolsaGrandeRonda = mezclarArray([...bolsaGrandeRonda]);
    
    actualizarBolsaGrande();
    mostrarMensaje(`Bolsa grande creada con ${bolsaGrandeRonda.length} dinosaurios (${dinosPorEspecie} de cada especie)`, "success");
}

function mezclarArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function distribuirBolsas() {
    if (bolsaGrandeRonda.length === 0) {
        mostrarMensaje("Primero debes crear la bolsa grande", "error");
        return;
    }

    // Cada jugador recibe exactamente 6 dinosaurios aleatorios
    const dinosPorJugador = 6;
    bolsasJugadoresRonda = {};
    
    // Crear una copia de la bolsa grande para no modificar la original
    const bolsaDisponible = [...bolsaGrandeRonda];

    for (let jug = 1; jug <= cantJugadores; jug++) {
        bolsasJugadoresRonda[jug] = [];
        
        // Repartir 6 dinosaurios aleatorios a cada jugador
        for (let i = 0; i < dinosPorJugador && bolsaDisponible.length > 0; i++) {
            const indiceAleatorio = Math.floor(Math.random() * bolsaDisponible.length);
            const dinoSeleccionado = bolsaDisponible.splice(indiceAleatorio, 1)[0];
            bolsasJugadoresRonda[jug].push(dinoSeleccionado);
        }
    }

    actualizarBolsasJugadores();
    mostrarMensaje("Se repartieron 6 dinosaurios aleatorios a cada jugador", "success");
}

function actualizarBolsaGrande() {
    // Temporalmente deshabilitado
    return;
    
    /*
    const cont = document.getElementById("bolsaGrande");
    if (!cont) return;
    cont.innerHTML = "";

    const key = `Ronda${rondaActual}`;
    if (bolsaGrandeRonda.length === 0 && window.bolsasGuardadas?.[key]) {
        bolsaGrandeRonda = window.bolsasGuardadas[key] || [];
    }

    bolsaGrandeRonda.forEach((dinoId, idx) => {
        const dino = draggables.find(d => d.id === dinoId);
        if (!dino) return;

        const div = document.createElement("div");
        div.className = "arrastrable";
        div.draggable = true;
        div.id = `bolsa-grande-${dino.id}-${idx}`;
        div.dataset.especie = dino.id;
        div.innerHTML = `<img src="${dino.img}" alt="${dino.id}">`;
        div.addEventListener("dragstart", dragStart);
        div.addEventListener("click", handleDinoClick);
        cont.appendChild(div);
    });

    document.getElementById("ronda-bolsa").textContent = rondaActual;
    */
}

function actualizarBolsasJugadores() {
    // Temporalmente deshabilitado
    return;
    
    /*
    const cont = document.getElementById("bolsasJugadores");
    if (!cont) return;
    cont.innerHTML = "";

    const key = `Ronda${rondaActual}`;
    if (Object.keys(bolsasJugadoresRonda).length === 0 && window.bolsasJugadoresGuardadas?.[key]) {
        bolsasJugadoresRonda = window.bolsasJugadoresGuardadas[key] || {};
    }

    for (let jug = 1; jug <= cantJugadores; jug++) {
        const bolsaDiv = document.createElement("div");
        bolsaDiv.className = `bolsa-jugador ${jug === jugadorActual ? 'active' : ''}`;
        bolsaDiv.id = `bolsa-jugador-${jug}`;

        const h4 = document.createElement("h4");
        h4.textContent = `Jugador ${jug}`;
        bolsaDiv.appendChild(h4);

        const itemsDiv = document.createElement("div");
        itemsDiv.className = "bolsa-jugador-items";
        itemsDiv.id = `bolsa-items-${jug}`;

        const bolsa = bolsasJugadoresRonda[jug] || [];
        bolsa.forEach((dinoId, idx) => {
            const dino = draggables.find(d => d.id === dinoId);
            if (!dino) return;

            const div = document.createElement("div");
            div.className = "arrastrable";
            div.draggable = true;
            div.id = `jugador-${jug}-${dino.id}-${idx}`;
            div.dataset.especie = dino.id;
            div.innerHTML = `<img src="${dino.img}" alt="${dino.id}">`;
            div.addEventListener("dragstart", dragStart);
            div.addEventListener("click", handleDinoClick);
            itemsDiv.appendChild(div);
        });

        bolsaDiv.appendChild(itemsDiv);
        cont.appendChild(bolsaDiv);
    }
    */
}

function reiniciarBolsas() {
    // Temporalmente deshabilitado
    return;
    
    /*
    bolsaGrandeRonda = [];
    bolsasJugadoresRonda = {};
    actualizarBolsaGrande();
    actualizarBolsasJugadores();
    */
}

// ---------------------------
// TABLEROS POR JUGADOR (Eliminado - funcionalidad no utilizada)
// ---------------------------

// ---------------------------
// DRAG & DROP
// ---------------------------

function dragStart(e) {
    const target = e.target.closest(".arrastrable");
    if (!target) return;
    e.dataTransfer.setData("text/plain", target.id);
    selectedDino = target.id;
    if (e.dataTransfer.setDragImage) {
        const img = target.querySelector("img");
        if (img) e.dataTransfer.setDragImage(img, img.width/2, img.height/2);
    }
}

function handleDinoClick(e) {
    const target = e.target.closest(".arrastrable");
    if (!target) return;

    // Remover selección previa si existe
    document.querySelectorAll(".arrastrable").forEach(el => {
        el.classList.remove("selected");
    });

    // Si se hace click en el mismo dinosaurio, deseleccionar
    if (selectedDino === target.id) {
        selectedDino = null;
        return;
    }

    // Seleccionar nuevo dinosaurio
    selectedDino = target.id;
    target.classList.add("selected");
}

function dropRecintoJugador(e, recintoId, jugadorNum) {
    e.preventDefault();
    const origId = e.dataTransfer.getData("text/plain");
    const orig = document.getElementById(origId);
    if (!orig) return;
    const especie = orig.dataset.especie;

    if (contarDinosTableroJugador(jugadorNum) >= 6) {
        mostrarMensaje("Ya terminó la ronda para este jugador, hay 6 dinosaurios en tablero", "error");
        return;
    }

    const rec = document.getElementById(`${recintoId}_J${jugadorNum}`);
    if (!rec) return;
    const slots = Array.from(rec.querySelectorAll(".slot"));

    // Validaciones de reglas
    if (recintoId === "SAME_FOREST") {
        const primerDino = slots.find(s => s.children.length > 0)?.children[0];
        if (primerDino && primerDino.dataset.especie !== especie) {
            mostrarMensaje("Todos los dinosaurios deben ser de la misma especie", "error");
            return;
        }
    }
    if (recintoId === "DIFFERENT_MEADOW") {
        const especiesActuales = slots.map(s => s.children[0]?.dataset.especie).filter(Boolean);
        if (especiesActuales.includes(especie)) {
            mostrarMensaje("Todos los dinosaurios deben ser de especies diferentes", "error");
            return;
        }
    }

    let puesto = false;
    for (let slot of slots) {
        if (slot.children.length === 0) {
            const clone = orig.cloneNode(true);
            clone.id = `${orig.id}_copy_${Date.now()}_J${jugadorNum}`;
            clone.dataset.isClone = "true";
            clone.dataset.especie = especie;
            clone.dataset.jugador = jugadorNum;
            clone.innerHTML = `<img src="${orig.querySelector("img").src}">`;
            clone.draggable = true;
            clone.addEventListener("dragstart", dragStart);

            slot.appendChild(clone);
            historialMovimientos.push({ draggable: clone, slot: slot, jugador: jugadorNum });

            // Remover de la bolsa del jugador si viene de ahí
            if (orig.id.startsWith(`jugador-${jugadorNum}-`)) {
                orig.remove();
                const bolsa = bolsasJugadoresRonda[jugadorNum] || [];
                const idx = bolsa.indexOf(especie);
                if (idx !== -1) bolsa.splice(idx, 1);
                bolsasJugadoresRonda[jugadorNum] = bolsa;
                actualizarBolsasJugadores();
            }

            puesto = true;
            break;
        }
    }
    if (!puesto) {
        mostrarMensaje("No hay espacio disponible en este recinto", "error");
    } else {
        document.querySelectorAll(".arrastrable").forEach(el => {
            el.classList.remove("selected");
        });
        selectedDino = null;
    }
}

function handleRecintoClickJugador(e, recintoId, jugadorNum) {
    if (!selectedDino) return;
    const simulatedEvent = {
        preventDefault: () => {},
        dataTransfer: {
            getData: () => selectedDino
        }
    };
    dropRecintoJugador(simulatedEvent, recintoId, jugadorNum);
}

function contarDinosTableroJugador(jugadorNum) {
    const tablero = document.getElementById(`tablero-${jugadorNum}`);
    if (!tablero) return 0;
    return tablero.querySelectorAll(".arrastrable[data-is-clone='true']").length;
}

// ---------------------------
// PUNTAJES
// ---------------------------

function inicializarPuntajes() {
    const cont = document.getElementById("puntajes");
    if (!cont) return;
    cont.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Puntajes";
    cont.appendChild(title);

    for (let jug = 1; jug <= cantJugadores; jug++) {
        const jugDiv = document.createElement("div");
        jugDiv.className = "puntaje-jugador";
        jugDiv.innerHTML = `<strong>Jugador ${jug}:</strong>`;
        cont.appendChild(jugDiv);

        let totalJugador = 0;
        for (let i = 1; i <= cantRondas; i++) {
            const key = `Jugador${jug}_Ronda${i}`;
            const puntos = puntajesPorJugadorPorRonda[key] || 0;
            totalJugador += puntos;

            const div = document.createElement("div");
            div.className = "puntaje-item";
            div.innerHTML = `<span>Ronda ${i}:</span> <span>${puntos}</span>`;
            jugDiv.appendChild(div);
        }

        const totalDiv = document.createElement("div");
        totalDiv.className = "puntaje-total";
        totalDiv.innerHTML = `<span>Total:</span> <span>${totalJugador}</span>`;
        jugDiv.appendChild(totalDiv);
    }
}

function guardarRonda() {
    for (let jug = 1; jug <= cantJugadores; jug++) {
        const totalDinos = contarDinosTableroJugador(jug);
        if (totalDinos < 6) {
            mostrarMensaje(`No se puede guardar la ronda: Jugador ${jug} tiene solo ${totalDinos} dinosaurios`, "error");
            return;
        }

        let total = 0;
        let estado = {};
        const recintos = ["SAME_FOREST", "DIFFERENT_MEADOW", "KING", "TRIO_TREES", "LONELY", "LOVE_MEADOW", "RIVER"];

        recintos.forEach(id => {
            const rec = document.getElementById(`${id}_J${jug}`);
            if (!rec) {
                estado[id] = [];
                return;
            }
            const slots = Array.from(rec.querySelectorAll(".slot"));
            // Guardar el estado como objeto con índices para mantener las posiciones exactas
            estado[id] = {};
            slots.forEach((slot, index) => {
                const dino = slot.children[0];
                if (dino && dino.id) {
                    estado[id][index] = dino.id;
                }
            });

            // Cálculo de puntajes (misma lógica que modo seguimiento)
            if (id === "KING") {
                // Si hay un dinosaurio en el recinto KING, automáticamente tiene el rey
                const slotsOcupados = slots.filter(s => s.children.length > 0).length;
                const kingOn = slotsOcupados === 1;
                if (slotsOcupados === 1 && kingOn) total += 7;
                // Guardar automáticamente el estado del rey
                const keyKing = `Jugador${jug}_Ronda${rondaActual}`;
                kingPorJugadorPorRonda[keyKing] = kingOn;
            } else if (id === "LONELY") {
                if (slots.filter(s => s.children.length > 0).length === 1) total += 7;
            } else if (id === "TRIO_TREES") {
                if (slots.filter(s => s.children.length > 0).length === 3) total += 7;
            } else if (id === "LOVE_MEADOW") {
                const especiesCount = {};
                slots.forEach(s => {
                    if (s.children.length > 0) {
                        const e = s.children[0].dataset.especie;
                        especiesCount[e] = (especiesCount[e] || 0) + 1;
                    }
                });
                Object.values(especiesCount).forEach(v => {
                    total += Math.floor(v / 2) * 5;
                });
            } else if (id === "RIVER") {
                total += slots.filter(s => s.children.length > 0).length;
            } else if (id === "SAME_FOREST" || id === "DIFFERENT_MEADOW") {
                let ultima = 0;
                slots.forEach(s => {
                    if (s.children.length > 0 && s.dataset.valor) {
                        ultima = parseInt(s.dataset.valor);
                    }
                });
                total += ultima;
            }

            const countSpecie1 = slots.filter(s => s.children.length === 1 && s.children[0].dataset.especie === "tRex").length;
            if (countSpecie1 === 1) total += 1;
        });

        const key = `Jugador${jug}_Ronda${rondaActual}`;
        puntajesPorJugadorPorRonda[key] = total;
        estadoPorJugadorPorRonda[key] = estado;

        // El rey se calcula automáticamente cuando hay un dinosaurio en el recinto KING
        // No necesitamos checkbox
    }

    inicializarPuntajes();
    mostrarMensaje("Ronda guardada para todos los jugadores", "success");
}

// ---------------------------
// RONDAS
// ---------------------------

function actualizarRondas() {
    if (selectRonda) selectRonda.innerHTML = "";
    for (let i = 1; i <= cantRondas; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = "Ronda " + i;
        if (selectRonda) selectRonda.appendChild(opt);
    }
    rondaActual = 1;
    restaurarRonda();
    inicializarPuntajes();
}

function restaurarRonda() {
    historialMovimientos = [];

    for (let jug = 1; jug <= cantJugadores; jug++) {
        const recintos = ["SAME_FOREST", "DIFFERENT_MEADOW", "KING", "TRIO_TREES", "LONELY", "LOVE_MEADOW", "RIVER"];
        recintos.forEach(id => {
            const rec = document.getElementById(`${id}_J${jug}`);
            if (!rec) return;
            const slots = Array.from(rec.querySelectorAll(".slot"));
            slots.forEach(s => s.innerHTML = '');
        });

        const key = `Jugador${jug}_Ronda${rondaActual}`;
        const estado = estadoPorJugadorPorRonda[key];
        if (estado) {
            recintos.forEach(id => {
                const rec = document.getElementById(`${id}_J${jug}`);
                if (!rec) return;
                if (estado[id]) {
                    const slots = Array.from(rec.querySelectorAll(".slot"));
                    let slotIndex = 0;
                    estado[id].forEach(dId => {
                        if (!dId) return;
                        const especie = dId.replace(/.*_J\d+.*/, '').replace(/_copy_\d+.*$/, '');
                        const dinoObj = draggables.find(d => d.id === especie);
                        if (!dinoObj) return;

                        const div = document.createElement("div");
                        div.className = "arrastrable";
                        div.draggable = true;
                        div.id = dId;
                        div.dataset.especie = especie;
                        div.dataset.jugador = jug;
                        div.innerHTML = `<img src="${dinoObj.img}">`;
                        div.addEventListener("dragstart", dragStart);

                        if (slotIndex < slots.length) {
                            slots[slotIndex].appendChild(div);
                            slotIndex++;
                        }
                    });
                }
            });
        }
    }

    // El rey se calcula automáticamente cuando hay un dinosaurio en el recinto KING
    // No necesitamos actualizar ningún checkbox
}

function deshacerCambio() {
    const ultimo = historialMovimientos.pop();
    if (!ultimo) return;
    const especie = ultimo.especie || ultimo.draggable?.dataset.especie;
    if (ultimo.draggable && ultimo.draggable.parentNode) {
        ultimo.draggable.parentNode.removeChild(ultimo.draggable);
    }
    
    // Si venía de la bolsa, devolverlo
    if (ultimo.jugador && especie) {
        const bolsa = bolsasJugadoresRonda[ultimo.jugador] || [];
        if (!bolsa.includes(especie)) {
            bolsa.push(especie);
            bolsasJugadoresRonda[ultimo.jugador] = bolsa;
            dinosauriosColocadosRonda[ultimo.jugador] = Math.max(0, (dinosauriosColocadosRonda[ultimo.jugador] || 0) - 1);
            actualizarBolsaJugadorActivo();
            actualizarInfoPartida();
        }
    }
}

// ---------------------------
// GUARDAR Y CARGAR PARTIDAS
// ---------------------------

// Función para guardar automáticamente la ronda en la base de datos
async function guardarRondaEnBD() {
    try {
        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
        const datos = {
            tipo: 'juego',
            cant_jugadores: cantJugadores,
            cant_rondas: cantRondas,
            rondas: {}
        };

        // Cargar bolsas guardadas de cada ronda
        for (let r = 1; r <= cantRondas; r++) {
            const keyRonda = `Ronda${r}`;
            datos.rondas[r] = {
                bolsaGrande: window.bolsasGuardadas?.[keyRonda] || bolsaGrandeRonda,
                bolsasJugadores: {},
                jugadores: {}
            };

            // Cargar bolsas de jugadores de la ronda guardada o usar la actual
            const bolsasGuardadas = window.bolsasJugadoresGuardadas?.[keyRonda] || {};
            for (let jug = 1; jug <= cantJugadores; jug++) {
                const key = `Jugador${jug}_Ronda${r}`;
                datos.rondas[r].bolsasJugadores[jug] = bolsasGuardadas[jug] || bolsasJugadoresRonda[jug] || [];
                datos.rondas[r].jugadores[jug] = {
                    puntaje: puntajesPorJugadorPorRonda[key] || 0,
                    esRey: kingPorJugadorPorRonda[key] || false,
                    posiciones: estadoPorJugadorPorRonda[key] || {}
                };
            }
        }

        // Si hay una partida existente, actualizarla; si no, crear una nueva
        const url = partidaIdActual 
            ? `${API_URL}?path=partidas/actualizar&id=${partidaIdActual}`
            : `${API_URL}?path=partidas`;
        const method = partidaIdActual ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(datos)
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            // Guardar el ID de la partida si es la primera vez
            if (!partidaIdActual && data.partida_id) {
                partidaIdActual = data.partida_id;
            }
            mostrarMensaje(`Ronda ${rondaActual} guardada automáticamente`, "success");
        } else {
            console.error("Error al guardar ronda automáticamente: " + data.message);
        }
    } catch (error) {
        console.error("Error al guardar ronda automáticamente:", error);
    }
}

async function guardarPartida() {
    guardarRonda();

    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    const datos = {
        tipo: 'juego',
        cant_jugadores: cantJugadores,
        cant_rondas: cantRondas,
        rondas: {}
    };

    // Cargar bolsas guardadas de cada ronda
    for (let r = 1; r <= cantRondas; r++) {
        const keyRonda = `Ronda${r}`;
        datos.rondas[r] = {
            bolsaGrande: window.bolsasGuardadas?.[keyRonda] || bolsaGrandeRonda,
            bolsasJugadores: {},
            jugadores: {}
        };

        // Cargar bolsas de jugadores de la ronda guardada o usar la actual
        const bolsasGuardadas = window.bolsasJugadoresGuardadas?.[keyRonda] || {};
        for (let jug = 1; jug <= cantJugadores; jug++) {
            const key = `Jugador${jug}_Ronda${r}`;
            datos.rondas[r].bolsasJugadores[jug] = bolsasGuardadas[jug] || bolsasJugadoresRonda[jug] || [];
            datos.rondas[r].jugadores[jug] = {
                puntaje: puntajesPorJugadorPorRonda[key] || 0,
                esRey: kingPorJugadorPorRonda[key] || false,
                posiciones: estadoPorJugadorPorRonda[key] || {}
            };
        }
    }

    try {
        // Si hay una partida existente, actualizarla; si no, crear una nueva
        const url = partidaIdActual 
            ? `${API_URL}?path=partidas/actualizar&id=${partidaIdActual}`
            : `${API_URL}?path=partidas`;
        const method = partidaIdActual ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(datos)
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            // Guardar el ID de la partida si es la primera vez
            if (!partidaIdActual && data.partida_id) {
                partidaIdActual = data.partida_id;
            }
            mostrarMensaje("Partida guardada correctamente", "success");
        } else {
            mostrarMensaje("Error al guardar: " + data.message, "error");
        }
    } catch (error) {
        console.error("Error al guardar partida:", error);
        mostrarMensaje("Error al guardar partida", "error");
    }
}

async function mostrarPartidas() {
    try {
        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
        const response = await fetch(`${API_URL}?path=partidas`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (!data.success) {
            mostrarMensaje("Error: " + data.message, "error");
            return;
        }

        const cont = document.getElementById("partidasDisponibles");
        if (!cont) return;
        cont.innerHTML = "";

        // Filtrar solo partidas de tipo juego
        const partidasJuego = (data.data || []).filter(p => p.tipo === 'juego' || !p.tipo);

        if (partidasJuego.length === 0) {
            cont.innerHTML = '<div class="no-partidas">No hay partidas guardadas</div>';
            return;
        }

        partidasJuego.forEach(p => {
            const div = document.createElement("div");
            div.className = "partida-item";
            div.dataset.id = p.id;
            const fecha = p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : 'Sin fecha';
            div.innerHTML = `<strong>Partida #${p.id}</strong><br>${fecha} - ${p.cant_jugadores} jugadores`;
            div.style.cursor = "pointer";
            div.addEventListener("click", () => cargarPartida(p.id));
            cont.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar partidas:", error);
        mostrarMensaje("Error al cargar partidas", "error");
    }
}

async function cargarPartida(partidaId) {
    try {
        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
        const response = await fetch(`${API_URL}?path=partidas/obtener&id=${partidaId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success && data.data) {
            const partida = data.data;
            cantJugadores = partida.cant_jugadores;
            cantRondas = partida.cant_rondas;
            
            // Guardar el ID de la partida cargada
            partidaIdActual = partida.id;
            
            // Marcar que la partida está iniciada
            partidaIniciada = true;
            
            // Actualizar select de jugadores si existe
            if (selectJugadores) {
                selectJugadores.value = cantJugadores;
            }

            // Restaurar datos
            let datos = null;
            if (partida.datos) {
                datos = typeof partida.datos === 'string' ? JSON.parse(partida.datos) : partida.datos;
                if (datos.rondas) {
                    for (let rStr in datos.rondas) {
                        const r = parseInt(rStr);
                        const ronda = datos.rondas[r];
                        if (ronda.bolsaGrande) {
                            const key = `Ronda${r}`;
                            if (!window.bolsasGuardadas) window.bolsasGuardadas = {};
                            window.bolsasGuardadas[key] = ronda.bolsaGrande;
                        }
                        if (ronda.bolsasJugadores) {
                            const key = `Ronda${r}`;
                            if (!window.bolsasJugadoresGuardadas) window.bolsasJugadoresGuardadas = {};
                            window.bolsasJugadoresGuardadas[key] = ronda.bolsasJugadores;
                        }
                        if (ronda.jugadores) {
                            for (let jug in ronda.jugadores) {
                                const jugNum = parseInt(jug);
                                const rNum = parseInt(r);
                                const key = `Jugador${jugNum}_Ronda${rNum}`;
                                const jugData = ronda.jugadores[jugNum];
                                puntajesPorJugadorPorRonda[key] = jugData.puntaje || 0;
                                estadoPorJugadorPorRonda[key] = jugData.posiciones || {};
                                kingPorJugadorPorRonda[key] = jugData.esRey || false;
                            }
                        }
                    }
                }
            }

            // Siempre mostrar vista de revisión al restaurar
            console.log("Datos cargados:", datos);
            console.log("Puntajes por jugador por ronda:", puntajesPorJugadorPorRonda);
            console.log("Estados por jugador por ronda:", estadoPorJugadorPorRonda);
            mostrarVistaRevisionPartida(partida, datos);

            mostrarMensaje("Partida cargada correctamente", "success");
        } else {
            mostrarMensaje("Error al cargar la partida", "error");
        }
    } catch (error) {
        console.error("Error al cargar partida:", error);
        mostrarMensaje("Error al cargar partida: " + error.message, "error");
    }
}

function continuarPartida(partida, datos) {
    // Ocultar placeholder y mostrar juego
    const placeholder = document.getElementById("game-content-placeholder");
    if (placeholder) placeholder.style.display = "none";
    
    const infoPanel = document.getElementById("game-info-panel");
    const tableroPanel = document.getElementById("tablero-jugador-activo-panel");
    const vistaRevision = document.getElementById("vista-partida-cargada");
    const selectorRonda = document.getElementById("selector-ronda-cargada");
    
    if (infoPanel) infoPanel.style.display = "flex";
    if (tableroPanel) tableroPanel.style.display = "block";
    if (vistaRevision) vistaRevision.style.display = "none";
    if (selectorRonda) selectorRonda.style.display = "none";
    
    // Ocultar elementos de login
    ocultarElementosLogin();
    
    // Ocultar botón crear partida
    const crearPartidaBtn = document.getElementById("crear-partida-container");
    if (crearPartidaBtn) crearPartidaBtn.style.display = "none";
    
    // Inicializar botones de acción
    inicializarBotonesAccion();
    
    // Determinar la ronda actual (la última ronda con datos)
    let ultimaRondaConDatos = 1;
    if (datos && datos.rondas) {
        const rondasConDatos = Object.keys(datos.rondas).map(r => parseInt(r));
        if (rondasConDatos.length > 0) {
            ultimaRondaConDatos = Math.max(...rondasConDatos);
            // Verificar si la ronda está completa o en progreso
            const rondaData = datos.rondas[ultimaRondaConDatos];
            const todosTerminaron = datos.rondas && Object.keys(datos.rondas).some(r => {
                const rNum = parseInt(r);
                return rNum > ultimaRondaConDatos;
            });
            if (!todosTerminaron && ultimaRondaConDatos < cantRondas) {
                // La ronda está en progreso, usar esa
                rondaActual = ultimaRondaConDatos;
            } else if (ultimaRondaConDatos >= cantRondas) {
                // Todas las rondas están completas
                rondaActual = cantRondas;
            } else {
                // Usar la última ronda con datos
                rondaActual = ultimaRondaConDatos;
            }
        }
    }
    
    // Restaurar bolsas de la ronda actual
    if (window.bolsasGuardadas && window.bolsasGuardadas[`Ronda${rondaActual}`]) {
        bolsaGrandeRonda = window.bolsasGuardadas[`Ronda${rondaActual}`];
    }
    if (window.bolsasJugadoresGuardadas && window.bolsasJugadoresGuardadas[`Ronda${rondaActual}`]) {
        bolsasJugadoresRonda = window.bolsasJugadoresGuardadas[`Ronda${rondaActual}`];
    }
    
    // Inicializar contadores de dinosaurios colocados
    for (let i = 1; i <= cantJugadores; i++) {
        const keyEstado = `Jugador${i}_Ronda${rondaActual}`;
        const estado = estadoPorJugadorPorRonda[keyEstado] || {};
        let contador = 0;
        Object.keys(estado).forEach(recinto => {
            Object.keys(estado[recinto] || {}).forEach(() => {
                contador++;
            });
        });
        dinosauriosColocadosRonda[i] = contador;
    }
    
    // Elegir orden de turnos (si no hay bolsas, significa que todos terminaron)
    elegirOrdenTurnos();
    
    // Restaurar estado del juego
    actualizarJugadores();
    actualizarRondas();
    
    // Inicializar tablero y comenzar turno
    renderizarTableroActivo();
    
    // Cargar estado de la ronda actual
    actualizarTableroJugadorActivo();
    actualizarPuntajes();
    
    // Comenzar el turno del jugador actual
    comenzarTurno();
}

function mostrarVistaRevisionPartida(partida, datos) {
    console.log("Mostrando vista de revisión de partida:", partida);
    console.log("Datos recibidos:", datos);
    console.log("Puntajes cargados:", puntajesPorJugadorPorRonda);
    console.log("Estados cargados:", estadoPorJugadorPorRonda);
    
    // Ocultar elementos de juego normal
    const placeholder = document.getElementById("game-content-placeholder");
    const infoPanel = document.getElementById("game-info-panel");
    const tableroPanel = document.getElementById("tablero-jugador-activo-panel");
    const vistaRevision = document.getElementById("vista-partida-cargada");
    const selectorRonda = document.getElementById("selector-ronda-cargada");
    
    if (placeholder) placeholder.style.display = "none";
    if (infoPanel) infoPanel.style.display = "none";
    if (tableroPanel) tableroPanel.style.display = "none";
    if (vistaRevision) vistaRevision.style.display = "block";
    if (selectorRonda) selectorRonda.style.display = "block";
    
    // Configurar selector de ronda
    const selectRondaCargada = document.getElementById("selectRondaCargada");
    if (selectRondaCargada) {
        selectRondaCargada.innerHTML = "";
        for (let i = 1; i <= cantRondas; i++) {
            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = `Ronda ${i}`;
            selectRondaCargada.appendChild(opt);
        }
        
        // Remover listeners anteriores
        const nuevoSelectRonda = selectRondaCargada.cloneNode(true);
        selectRondaCargada.parentNode.replaceChild(nuevoSelectRonda, selectRondaCargada);
        nuevoSelectRonda.addEventListener("change", (e) => {
            const ronda = parseInt(e.target.value);
            const jugadorSeleccionado = document.getElementById("selectJugadorCargado")?.value || "todos";
            mostrarTablerosRondaJuego(partida, datos, ronda, jugadorSeleccionado);
        });
        
        // Mostrar ronda inicial
        nuevoSelectRonda.value = 1;
    }
    
    // Configurar selector de jugador
    const selectJugadorCargado = document.getElementById("selectJugadorCargado");
    if (selectJugadorCargado) {
        selectJugadorCargado.innerHTML = '<option value="todos">Todos los Jugadores</option>';
        for (let i = 1; i <= cantJugadores; i++) {
            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = `Jugador ${i}`;
            selectJugadorCargado.appendChild(opt);
        }
        
        // Remover listeners anteriores
        const nuevoSelectJugador = selectJugadorCargado.cloneNode(true);
        selectJugadorCargado.parentNode.replaceChild(nuevoSelectJugador, selectJugadorCargado);
        nuevoSelectJugador.addEventListener("change", (e) => {
            const jugador = e.target.value;
            const rondaSeleccionada = parseInt(document.getElementById("selectRondaCargada")?.value || 1);
            mostrarTablerosRondaJuego(partida, datos, rondaSeleccionada, jugador);
        });
        
        nuevoSelectJugador.value = "todos";
    }
    
    // Mostrar tableros iniciales
    const rondaInicial = parseInt(selectRondaCargada?.value || 1);
    mostrarTablerosRondaJuego(partida, datos, rondaInicial, "todos");
    
    // Botón volver a jugar
    const btnVolver = document.getElementById("btnVolverAJugar");
    if (btnVolver) {
        btnVolver.onclick = () => {
            continuarPartida(partida, datos);
        };
    }
}

function mostrarTablerosRondaJuego(partida, datos, numeroRonda, jugadorSeleccionado = "todos") {
    console.log("Mostrando tableros para ronda:", numeroRonda, "Jugador:", jugadorSeleccionado);
    
    const contenedor = document.getElementById("tableros-jugadores");
    if (!contenedor) {
        console.error("No se encontró contenedor tableros-jugadores");
        return;
    }
    
    contenedor.innerHTML = "";
    
    // Obtener datos de la ronda desde datos.rondas o desde las variables globales
    let ronda = null;
    let jugadores = {};
    
    if (datos?.rondas && datos.rondas[numeroRonda]) {
        ronda = datos.rondas[numeroRonda];
        jugadores = ronda.jugadores || {};
    } else {
        // Si no hay datos en datos.rondas, construirlos desde las variables globales
        console.log("Construyendo datos desde variables globales");
        jugadores = {};
        for (let jug = 1; jug <= cantJugadores; jug++) {
            const key = `Jugador${jug}_Ronda${numeroRonda}`;
            jugadores[jug] = {
                puntaje: puntajesPorJugadorPorRonda[key] || 0,
                esRey: kingPorJugadorPorRonda[key] || false,
                posiciones: estadoPorJugadorPorRonda[key] || {}
            };
        }
    }
    
    console.log("Jugadores para la ronda:", jugadores);
    
    // Determinar qué jugadores mostrar
    const jugadoresAMostrar = jugadorSeleccionado === "todos" 
        ? Array.from({length: cantJugadores}, (_, i) => i + 1)
        : [parseInt(jugadorSeleccionado)];
    
    // Renderizar tablero para cada jugador seleccionado
    for (let jug of jugadoresAMostrar) {
        const jugData = jugadores[jug] || { puntaje: 0, esRey: false, posiciones: {} };
        
        console.log(`Datos del jugador ${jug}:`, jugData);
        
        // Crear contenedor del tablero del jugador
        const tableroDiv = document.createElement("div");
        tableroDiv.className = "tablero-jugador-item";
        
        // Título del jugador
        const titulo = document.createElement("h4");
        titulo.textContent = `Jugador ${jug}`;
        tableroDiv.appendChild(titulo);
        
        // Información de puntaje
        const puntajeInfo = document.createElement("div");
        puntajeInfo.className = "puntaje-info";
        puntajeInfo.textContent = `Puntaje: ${jugData.puntaje || 0}`;
        tableroDiv.appendChild(puntajeInfo);
        
        // Información del rey
        if (jugData.esRey) {
            const kingInfo = document.createElement("div");
            kingInfo.className = "king-info";
            kingInfo.textContent = "👑 Tiene al rey";
            tableroDiv.appendChild(kingInfo);
        }
        
        // Tablero
        const tablero = document.createElement("div");
        tablero.className = "contenedor-tablero seguimiento-tablero";
        tablero.id = `tablero-jugador-${jug}-ronda-${numeroRonda}`;
        tableroDiv.appendChild(tablero);
        
        contenedor.appendChild(tableroDiv);
        
        // Renderizar el tablero con las posiciones guardadas
        console.log(`Renderizando tablero para jugador ${jug} con posiciones:`, jugData.posiciones);
        renderizarTableroJugadorCargadoJuego(tablero, jugData.posiciones || {});
    }
}

function renderizarTableroJugadorCargadoJuego(tablero, posiciones) {
    // Limpiar tablero
    tablero.innerHTML = "";
    
    // Renderizar estructura del tablero
    const definicion = [
        { id: 'LOVE_MEADOW', tipo: 'recinto', slots: 6, valores: [] },
        { id: 'LONELY', tipo: 'recinto', slots: 1, valores: [] },
        { id: 'TRIO_TREES', tipo: 'recinto', slots: 3, valores: [] },
        { id: 'DIFFERENT_MEADOW', tipo: 'subrecinto', slots: 6, valores: [1,3,6,10,15,21] },
        { id: 'SAME_FOREST', tipo: 'subrecinto', slots: 6, valores: [2,4,8,12,18,24] },
        { id: 'KING', tipo: 'recinto', slots: 1, valores: [] },
        { id: 'RIVER', tipo: 'recinto', slots: 6, valores: [] }
    ];
    
    const draggables = [
        { id: "tRex", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/tRex.png" },
        { id: "SPECIE_1", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie1.png" },
        { id: "SPECIE_2", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie2.png" },
        { id: "SPECIE_3", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie3.png" },
        { id: "SPECIE_4", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie4.png" },
        { id: "SPECIE_5", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie5.png" }
    ];
    
    definicion.forEach(def => {
        const el = document.createElement('div');
        el.className = def.tipo;
        el.id = `${def.id}_${tablero.id}`;
        for (let i = 0; i < def.slots; i++) {
            const s = document.createElement('div');
            s.className = 'slot';
            if (def.valores[i] !== undefined) {
                s.dataset.valor = String(def.valores[i]);
            }
            el.appendChild(s);
        }
        tablero.appendChild(el);
    });
    
    // Cargar posiciones guardadas
    const recintos = ["SAME_FOREST", "DIFFERENT_MEADOW", "KING", "TRIO_TREES", "LONELY", "LOVE_MEADOW", "RIVER"];
    console.log("Posiciones a cargar:", posiciones);
    
    recintos.forEach(id => {
        const rec = document.getElementById(`${id}_${tablero.id}`);
        if (!rec) {
            console.warn(`No se encontró recinto ${id}_${tablero.id}`);
            return;
        }
        
        const slots = Array.from(rec.querySelectorAll(".slot"));
        let posicionesRecinto = posiciones[id];
        
        if (!posicionesRecinto) {
            console.log(`No hay posiciones para recinto ${id}`);
            return;
        }
        
        // Las posiciones pueden venir como array o como objeto
        // Si es un objeto, convertirlo a array ordenado por índice
        if (typeof posicionesRecinto === 'object' && !Array.isArray(posicionesRecinto)) {
            // Convertir objeto a array, ordenando por las claves numéricas
            const keys = Object.keys(posicionesRecinto).map(k => parseInt(k)).sort((a, b) => a - b);
            const maxKey = Math.max(...keys, -1);
            if (maxKey >= 0) {
                // Crear array con el tamaño correcto
                const arr = new Array(maxKey + 1).fill(null);
                keys.forEach(k => {
                    const val = posicionesRecinto[k];
                    if (val && val !== null && val !== undefined && val !== '' && val !== 0 && val !== '0') {
                        arr[k] = val;
                    }
                });
                posicionesRecinto = arr;
            } else {
                posicionesRecinto = [];
            }
        }
        
        if (!Array.isArray(posicionesRecinto) || posicionesRecinto.length === 0) {
            console.log(`No hay posiciones válidas para recinto ${id}`);
            return;
        }
        
        // Colocar los dinosaurios en sus posiciones correctas
        posicionesRecinto.forEach((dinoId, index) => {
            if (index >= slots.length) return;
            
            // Ignorar valores nulos, vacíos o 0
            if (!dinoId || dinoId === null || dinoId === undefined || dinoId === '' || dinoId === 0 || dinoId === '0') {
                return;
            }
            
            // El dinoId puede venir como string completo (ej: "tRex_copy_1") o solo la especie
            const especie = typeof dinoId === 'string' ? dinoId.replace(/_copy_\d+$/, '') : dinoId;
            const dino = draggables.find(d => d.id === especie);
            
            if (!dino) {
                console.warn(`No se encontró dinosaurio con id: ${especie} (dinoId original: ${dinoId})`);
                return;
            }
            
            console.log(`Colocando ${especie} en slot ${index} del recinto ${id}`);
            
            const div = document.createElement("div");
            div.className = "arrastrable";
            div.draggable = false;
            div.id = typeof dinoId === 'string' ? dinoId : `${especie}_copy_${index + 1}`;
            div.dataset.especie = especie;
            div.innerHTML = `<img src="${dino.img}">`;
            
            slots[index].appendChild(div);
        });
    });
    
    // Aplicar layout
    setTimeout(() => {
        aplicarLayoutTableroJuego(tablero);
    }, 50);
}

function aplicarLayoutTableroJuego(tablero) {
    const layout = {
        "LOVE_MEADOW": {"topPercent":546.992,"leftPercent":147.988,"widthPercent":25.428571428571427,"heightPercent":23,"slotSizePx":45,"gapPx":8},
        "LONELY": {"topPercent":528.145,"leftPercent":570.352,"widthPercent":15.285714285714286,"heightPercent":14.285714285714285,"slotSizePx":60,"gapPx":8},
        "TRIO_TREES": {"topPercent":338.34,"leftPercent":128.984,"widthPercent":21.714285714285715,"heightPercent":21.857142857142858,"slotSizePx":60,"gapPx":8},
        "DIFFERENT_MEADOW": {"topPercent":321.992,"leftPercent":533.594,"widthPercent":37.42857142857143,"heightPercent":10.571428571428571,"slotSizePx":35,"gapPx":10},
        "SAME_FOREST": {"topPercent":118.965,"leftPercent":156.992,"widthPercent":35.85714285714286,"heightPercent":10,"slotSizePx":31,"gapPx":8},
        "KING": {"topPercent":106.211,"leftPercent":427.051,"widthPercent":10.571428571428571,"heightPercent":12.285714285714286,"slotSizePx":60,"gapPx":8},
        "RIVER": {"topPercent":599.785,"leftPercent":369.199,"widthPercent":24.571428571428573,"heightPercent":19.28571428571429,"slotSizePx":45,"gapPx":8}
    };
    
    tablero.classList.add('layout-applied');
    const rect = tablero.getBoundingClientRect();
    const ids = Object.keys(layout);
    
    ids.forEach(id => {
        const el = document.getElementById(`${id}_${tablero.id}`);
        if (!el) return;
        
        const conf = layout[id];
        el.style.position = 'absolute';
        el.style.transform = 'translate(-50%, -50%)';
        const leftPct = (conf.leftPercent / rect.width) * 100;
        const topPct = (conf.topPercent / rect.height) * 100;
        el.style.left = leftPct + '%';
        el.style.top = topPct + '%';
        el.style.width = conf.widthPercent + '%';
        el.style.height = conf.heightPercent + '%';
        el.style.setProperty('--slot-size', (conf.slotSizePx||60) + 'px');
        el.style.setProperty('--gap', (conf.gapPx||8) + 'px');
        
        if (id === "SAME_FOREST" || id === "DIFFERENT_MEADOW") {
            el.style.display = 'inline-flex';
            el.style.flexWrap = 'nowrap';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.gap = '8px';
            el.style.overflow = 'hidden';
        } else if (id === "LOVE_MEADOW" || id === "RIVER") {
            el.style.display = 'grid';
            el.style.gridTemplateColumns = 'repeat(3, 1fr)';
            el.style.gridAutoRows = '1fr';
            el.style.gap = '8px';
            Array.from(el.querySelectorAll('.slot')).forEach(s => {
                s.style.width = '100%';
                s.style.height = 'auto';
                s.style.aspectRatio = '1 / 1';
            });
        } else {
            el.style.display = 'flex';
            el.style.flexWrap = 'wrap';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
        }
    });
}

// ---------------------------
// CARGAR PARTIDA DESDE URL
// ---------------------------

async function cargarPartidaDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const partidaId = urlParams.get('partida');

    if (partidaId) {
        await cargarPartida(partidaId);
    }
}

// Función para reanudar la última partida guardada
async function reanudarPartida() {
    try {
        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
        const response = await fetch(`${API_URL}?path=partidas`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (!data.success) {
            mostrarMensaje("Error: " + data.message, "error");
            return;
        }

        // Filtrar solo partidas de tipo juego
        const partidasJuego = (data.data || []).filter(p => p.tipo === 'juego' || !p.tipo);

        if (partidasJuego.length === 0) {
            mostrarMensaje("No hay partidas guardadas para reanudar", "error");
            return;
        }

        // Ordenar por fecha (más reciente primero) y tomar la primera
        partidasJuego.sort((a, b) => {
            const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return fechaB - fechaA;
        });

        const ultimaPartida = partidasJuego[0];
        await cargarPartida(ultimaPartida.id);
        mostrarMensaje("Partida reanudada correctamente", "success");
    } catch (error) {
        console.error("Error al reanudar partida:", error);
        mostrarMensaje("Error al reanudar partida", "error");
    }
}

// Función para restaurar partida (mostrar selector de partidas)
// Función restaurarPartida() eliminada - no se utiliza, se usa mostrarPartidas() en su lugar

// ---------------------------
// EVENT LISTENERS
// ---------------------------

document.getElementById("btnGuardarPartida")?.addEventListener("click", guardarPartida);
document.getElementById("btnRestaurarPartida")?.addEventListener("click", mostrarPartidas);

// ---------------------------
// LOGIN DE JUGADORES
// ---------------------------

function mostrarFormulariosLogin() {
    const container = document.getElementById("jugadores-login-forms");
    if (!container) return;
    
    container.innerHTML = "";
    
    // Actualizar resumen después de mostrar formularios
    setTimeout(() => actualizarResumenJugadores(), 100);
    
    for (let i = 1; i <= cantJugadores; i++) {
        const formDiv = document.createElement("div");
        formDiv.className = `jugador-login-form ${jugadoresLogueados[i] ? 'logged-in' : ''}`;
        formDiv.id = `login-form-jugador-${i}`;
        
        const h4 = document.createElement("h4");
        h4.textContent = `Jugador ${i}`;
        formDiv.appendChild(h4);
        
        if (jugadoresLogueados[i]) {
            // Jugador ya logueado
            const statusDiv = document.createElement("div");
            statusDiv.className = "jugador-login-status success";
            statusDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> Logueado: <strong>${jugadoresLogueados[i].username}</strong>`;
            formDiv.appendChild(statusDiv);
            
            const logoutBtn = document.createElement("button");
            logoutBtn.textContent = "Cerrar Sesión";
            logoutBtn.style.background = "#f44336";
            logoutBtn.onclick = () => cerrarSesionJugador(i);
            formDiv.appendChild(logoutBtn);
        } else {
            // Formulario de login
            const identifierGroup = document.createElement("div");
            identifierGroup.className = "form-group";
            identifierGroup.innerHTML = `
                <label for="identifier-jugador-${i}">Usuario o Email</label>
                <input type="text" id="identifier-jugador-${i}" placeholder="Usuario o email">
            `;
            formDiv.appendChild(identifierGroup);
            
            const passwordGroup = document.createElement("div");
            passwordGroup.className = "form-group";
            passwordGroup.innerHTML = `
                <label for="password-jugador-${i}">Contraseña</label>
                <input type="password" id="password-jugador-${i}" placeholder="Contraseña">
            `;
            formDiv.appendChild(passwordGroup);
            
            const loginBtn = document.createElement("button");
            loginBtn.textContent = "Iniciar Sesión";
            loginBtn.onclick = () => loginJugador(i);
            formDiv.appendChild(loginBtn);
            
            const statusDiv = document.createElement("div");
            statusDiv.className = "jugador-login-status";
            statusDiv.id = `status-jugador-${i}`;
            statusDiv.style.display = "none";
            formDiv.appendChild(statusDiv);
        }
        
        container.appendChild(formDiv);
    }
}

async function loginJugador(numeroJugador) {
    const identifier = document.getElementById(`identifier-jugador-${numeroJugador}`).value.trim();
    const password = document.getElementById(`password-jugador-${numeroJugador}`).value;
    const statusDiv = document.getElementById(`status-jugador-${numeroJugador}`);
    
    if (!identifier || !password) {
        mostrarStatusJugador(numeroJugador, "Por favor completa todos los campos", "error");
        return;
    }
    
    // Verificar si este usuario ya está logueado en otro jugador
    const usuarioYaEnUso = Object.values(jugadoresLogueados).find(j => 
        j.username === identifier || j.email === identifier
    );
    
    if (usuarioYaEnUso) {
        mostrarStatusJugador(numeroJugador, "Este usuario ya está logueado en otro jugador", "error");
        return;
    }
    
    try {
        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
        const response = await fetch(`${API_URL}?path=auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ identifier, password })
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            mostrarStatusJugador(numeroJugador, "Error: respuesta del servidor no válida", "error");
            return;
        }

        if (data.success && data.user) {
            // Guardar datos del jugador logueado (solo info, no token porque compartimos sesión HTTP)
            jugadoresLogueados[numeroJugador] = {
                id: data.user.id,
                username: data.user.username,
                email: data.user.email || ''
            };
            
            // Guardar en localStorage
            guardarJugadoresEnLocalStorage();
            
            mostrarStatusJugador(numeroJugador, "Login exitoso", "success");
            
            // Limpiar campos del formulario
            document.getElementById(`identifier-jugador-${numeroJugador}`).value = '';
            document.getElementById(`password-jugador-${numeroJugador}`).value = '';
            
            setTimeout(() => {
                mostrarFormulariosLogin(); // Refrescar formularios después de un momento
            }, 1500);
            
            // Verificar si todos los jugadores están logueados
            await verificarTodosLogueados();
        } else {
            mostrarStatusJugador(numeroJugador, data.message || "Credenciales inválidas", "error");
        }
    } catch (error) {
        console.error("Error al hacer login del jugador:", error);
        mostrarStatusJugador(numeroJugador, "Error de conexión", "error");
    }
}

async function cerrarSesionJugador(numeroJugador) {
    delete jugadoresLogueados[numeroJugador];
    guardarJugadoresEnLocalStorage();
    mostrarFormulariosLogin();
    await verificarTodosLogueados();
}

function mostrarStatusJugador(numeroJugador, mensaje, tipo) {
    const statusDiv = document.getElementById(`status-jugador-${numeroJugador}`);
    if (!statusDiv) return;
    
    statusDiv.textContent = mensaje;
    statusDiv.className = `jugador-login-status ${tipo}`;
    statusDiv.style.display = "block";
    
    if (tipo === "success") {
        setTimeout(() => {
            statusDiv.style.display = "none";
        }, 2000);
    }
}

async function verificarTodosLogueados() {
    // Verificar sesión antes de verificar jugadores
    const sesionActiva = await verificarSesionActiva();
    if (!sesionActiva) {
        // Limpiar jugadores si no hay sesión
        jugadoresLogueados = {};
        localStorage.removeItem('jugadoresLogueados');
    }
    
    // Reasignar automáticamente Jugador 1 si hay alguno logueado
    asegurarJugadorUno();

    const todosLogueados = Object.keys(jugadoresLogueados).length === cantJugadores && 
                           Object.keys(jugadoresLogueados).length > 0 &&
                           sesionActiva;
    
    // Actualizar resumen de jugadores
    actualizarResumenJugadores();
    
    if (todosLogueados && !partidaIniciada) {
        // Solo mostrar mensaje si realmente están todos logueados
        const crearPartidaBtn = document.getElementById("crear-partida-container");
        if (crearPartidaBtn) {
            crearPartidaBtn.style.display = "block";
        }
    } else {
        // Ocultar botón si no todos están logueados o la partida ya está iniciada
        const crearPartidaBtn = document.getElementById("crear-partida-container");
        if (crearPartidaBtn) {
            crearPartidaBtn.style.display = "none";
        }
        
        // Si había jugadores pero no están todos, limpiar
        if (Object.keys(jugadoresLogueados).length > 0 && !sesionActiva) {
            mostrarFormulariosLogin();
        }
    }
}

// Función para ocultar elementos de login después de que todos los jugadores se logueen
function ocultarElementosLogin() {
    // Ocultar select de cantidad de jugadores (buscar el control-group que contiene el select)
    const selectJugadores = document.getElementById("selectJugadores");
    if (selectJugadores) {
        const selectJugadoresGroup = selectJugadores.closest('.control-group');
        if (selectJugadoresGroup) {
            selectJugadoresGroup.style.display = 'none';
        }
    }
    
    // Ocultar contenedor de login de jugadores
    const loginContainer = document.getElementById("jugadores-login-container");
    if (loginContainer) {
        loginContainer.style.display = 'none';
    }
}

function inicializarBotonCrearPartida() {
    const btnCrearPartida = document.getElementById("btnCrearPartida");
    if (btnCrearPartida) {
        btnCrearPartida.addEventListener("click", crearPartida);
    }
    
    const btnReanudarPartida = document.getElementById("btnReanudarPartida");
    if (btnReanudarPartida) {
        btnReanudarPartida.addEventListener("click", reanudarPartida);
    }
    
    const btnRestaurarPartida = document.getElementById("btnRestaurarPartida");
    if (btnRestaurarPartida) {
        btnRestaurarPartida.addEventListener("click", restaurarPartida);
    }
}

function actualizarResumenJugadores() {
    const resumenDiv = document.getElementById("jugadores-resumen");
    const listaDiv = document.getElementById("jugadores-resumen-lista");
    
    if (!resumenDiv || !listaDiv) return;
    
    const cantidadLogueados = Object.keys(jugadoresLogueados).length;
    
    if (cantidadLogueados > 0) {
        resumenDiv.style.display = "block";
        listaDiv.innerHTML = "";
        
        for (let i = 1; i <= cantJugadores; i++) {
            const jugador = jugadoresLogueados[i];
            const item = document.createElement("div");
            item.style.padding = "5px 0";
            
            if (jugador) {
                item.innerHTML = `<i class="fa-solid fa-check-circle" style="color: #4CAF50;"></i> Jugador ${i}: <strong>${jugador.username}</strong>`;
            } else {
                item.innerHTML = `<i class="fa-solid fa-times-circle" style="color: #999;"></i> Jugador ${i}: <span style="color: #999;">Pendiente</span>`;
            }
            
            listaDiv.appendChild(item);
        }
    } else {
        resumenDiv.style.display = "none";
    }
}

// ---------------------------
// CREAR PARTIDA
// ---------------------------

async function crearPartida() {
    // Verificar que todos los jugadores estén logueados
    if (Object.keys(jugadoresLogueados).length !== cantJugadores) {
        mostrarMensaje("Todos los jugadores deben estar logueados", "error");
        await verificarTodosLogueados(); // Forzar actualización
        return;
    }
    
    // Verificar sesión antes de crear partida
    const sesionActiva = await verificarSesionActiva();
    if (!sesionActiva) {
        mostrarMensaje("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión", "error");
        // Limpiar jugadores
        jugadoresLogueados = {};
        localStorage.removeItem('jugadoresLogueados');
        mostrarFormulariosLogin();
        await verificarTodosLogueados();
        return;
    }

    // Inicializar estado de la partida
    partidaIniciada = true;
    rondaActual = 1;
    jugadorActual = 1;
    historialMovimientos = [];
    puntajesPorJugadorPorRonda = {};
    estadoPorJugadorPorRonda = {};
    kingPorJugadorPorRonda = {};
    dinosauriosColocadosRonda = {};
    
    // Inicializar contadores de dinosaurios por jugador
    for (let i = 1; i <= cantJugadores; i++) {
        dinosauriosColocadosRonda[i] = 0;
    }

    // Crear primera bolsa y distribuir
    crearBolsaRonda();
    distribuirBolsas();
    
    // Elegir orden aleatorio para esta ronda
    elegirOrdenTurnos();
    
    // Ocultar placeholder y mostrar juego
    const placeholder = document.getElementById("game-content-placeholder");
    if (placeholder) placeholder.style.display = "none";
    
    const infoPanel = document.getElementById("game-info-panel");
    const tableroPanel = document.getElementById("tablero-jugador-activo-panel");
    
    if (infoPanel) infoPanel.style.display = "flex";
    // El panel de bolsa está oculto por CSS, no se muestra
    if (tableroPanel) tableroPanel.style.display = "block";
    
    // Inicializar listener del botón guardar partida
    inicializarBotonesAccion();
    
    // Ocultar botón crear partida
    const crearPartidaBtn = document.getElementById("crear-partida-container");
    if (crearPartidaBtn) crearPartidaBtn.style.display = "none";
    
    // Ocultar elementos de login y selección DESPUÉS de crear la partida
    ocultarElementosLogin();
    
    // Inicializar tablero y comenzar turno
    renderizarTableroActivo();
    comenzarTurno();
    
    mostrarMensaje("¡Partida creada! Comienza la ronda 1", "success");
}

// Función para inicializar los botones de acción
function inicializarBotonesAccion() {
    const btnGuardarPartida = document.getElementById("btnGuardarPartida");
    if (btnGuardarPartida) {
        btnGuardarPartida.addEventListener("click", async () => {
            await guardarPartida();
        });
    }
}

function elegirOrdenTurnos() {
    // Crear array con números de jugadores y mezclar
    ordenTurnos = [];
    for (let i = 1; i <= cantJugadores; i++) {
        ordenTurnos.push(i);
    }
    
    // Mezclar array (algoritmo Fisher-Yates)
    for (let i = ordenTurnos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordenTurnos[i], ordenTurnos[j]] = [ordenTurnos[j], ordenTurnos[i]];
    }
    
    indiceTurnoActual = 0;
    jugadorActual = ordenTurnos[0];
    
    console.log("Orden de turnos:", ordenTurnos);
}

function comenzarTurno() {
    jugadorActual = ordenTurnos[indiceTurnoActual];
    
    // Actualizar UI
    actualizarInfoPartida();
    actualizarBolsaJugadorActivo();
    actualizarTableroJugadorActivo();
    actualizarPuntajes();
    
    // Los dinosaurios se reparten automáticamente, pero el jugador los coloca manualmente
    // No se coloca automáticamente
}

// Funciones colocarDinosaurioAutomatico() y colocarDinosaurioEnSlot() eliminadas - no se utilizan

function siguienteTurno() {
    // Verificar si todos los jugadores han terminado su turno
    const todosTerminaron = ordenTurnos.every(jug => 
        !bolsasJugadoresRonda[jug] || bolsasJugadoresRonda[jug].length === 0 ||
        dinosauriosColocadosRonda[jug] >= 6 // Máximo 6 dinosaurios por ronda
    );
    
    if (todosTerminaron) {
        // Terminar ronda
        terminarRonda();
        return;
    }
    
    // Pasar al siguiente jugador
    indiceTurnoActual = (indiceTurnoActual + 1) % ordenTurnos.length;
    
    // Si volvimos al inicio, verificar si todos han jugado
    if (indiceTurnoActual === 0) {
        // Verificar si todos terminaron
        const todosTerminaron = ordenTurnos.every(jug => 
            !bolsasJugadoresRonda[jug] || bolsasJugadoresRonda[jug].length === 0 ||
            dinosauriosColocadosRonda[jug] >= 6
        );
        
        if (todosTerminaron) {
            terminarRonda();
            return;
        }
    }
    
    comenzarTurno();
}

function terminarRonda() {
    // Calcular puntajes finales de la ronda
    for (let jug = 1; jug <= cantJugadores; jug++) {
        calcularPuntajeJugadorRonda(jug, rondaActual);
    }
    
    // Guardar automáticamente la ronda en la base de datos
    guardarRondaEnBD();
    
    // Verificar si hay más rondas
    if (rondaActual < cantRondas) {
        rondaActual++;
        
        // Crear nueva bolsa y distribuir
        crearBolsaRonda();
        distribuirBolsas();
        
        // Elegir nuevo orden de turnos
        elegirOrdenTurnos();
        
        // Reiniciar contadores
        for (let i = 1; i <= cantJugadores; i++) {
            dinosauriosColocadosRonda[i] = 0;
        }
        
        // Reiniciar tableros de todos los jugadores
        reiniciarTablerosRonda();
        
        mostrarMensaje(`¡Ronda ${rondaActual} iniciada!`, "success");
        comenzarTurno();
    } else {
        // Partida terminada
        mostrarMensaje("¡Partida terminada! Calculando puntajes finales...", "success");
        mostrarPuntajesFinales();
        
        // Verificar si todas las rondas están completas y mostrar opción de guardar
        setTimeout(() => {
            verificarTodasLasRondasCompletas();
        }, 1000);
    }
}

// Función para verificar si todas las rondas están completas
function verificarTodasLasRondasCompletas() {
    // Verificar que todas las rondas tengan puntajes guardados
    let todasCompletas = true;
    for (let r = 1; r <= cantRondas; r++) {
        let rondaCompleta = true;
        for (let jug = 1; jug <= cantJugadores; jug++) {
            const key = `Jugador${jug}_Ronda${r}`;
            if (puntajesPorJugadorPorRonda[key] === undefined || puntajesPorJugadorPorRonda[key] === null) {
                rondaCompleta = false;
                break;
            }
        }
        if (!rondaCompleta) {
            todasCompletas = false;
            break;
        }
    }
    
    if (todasCompletas) {
        setTimeout(() => {
            mostrarOpcionGuardarPartida();
        }, 500);
    }
}

// Función para mostrar opción de guardar partida cuando todas las rondas están completas
function mostrarOpcionGuardarPartida() {
    // Verificar si ya se mostró el mensaje
    const mensajeExistente = document.getElementById("mensaje-guardar-partida");
    if (mensajeExistente) return;
    
    // Crear overlay de fondo oscuro
    const overlay = document.createElement("div");
    overlay.id = "overlay-guardar-partida";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;
    
    const mensaje = document.createElement("div");
    mensaje.id = "mensaje-guardar-partida";
    mensaje.innerHTML = `
        <h3 style="margin-top: 0;">¡Todas las rondas completadas!</h3>
        <p>¿Deseas guardar la partida completa?</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button id="btn-si-guardar" class="btn primary" style="padding: 10px 20px;">Sí, guardar</button>
            <button id="btn-no-guardar" class="btn" style="padding: 10px 20px;">Ahora no</button>
        </div>
    `;
    
    const cerrarModal = () => {
        overlay.remove();
        mensaje.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(mensaje);
    
    // Cerrar al hacer click en el overlay
    overlay.addEventListener("click", cerrarModal);
    
    document.getElementById("btn-si-guardar").addEventListener("click", async () => {
        cerrarModal();
        await guardarPartida();
    });
    
    document.getElementById("btn-no-guardar").addEventListener("click", cerrarModal);
}

function reiniciarTablerosRonda() {
    // Limpiar el tablero activo para prepararlo para el siguiente jugador
    const tablero = document.getElementById("tablero-activo");
    if (tablero) {
        const slots = tablero.querySelectorAll(".slot");
        slots.forEach(slot => {
            slot.innerHTML = "";
        });
    }
}

function terminarTurno() {
    // Función manual para terminar turno (si el usuario quiere)
    siguienteTurno();
}

// ---------------------------
// ACTUALIZACIÓN DE UI
// ---------------------------

function actualizarInfoPartida() {
    const infoRonda = document.getElementById("info-ronda");
    const infoJugador = document.getElementById("info-jugador-activo");
    const infoDinos = document.getElementById("info-dinos-tablero");
    
    if (infoRonda) infoRonda.textContent = rondaActual;
    
    if (infoJugador && jugadoresLogueados[jugadorActual]) {
        infoJugador.textContent = jugadoresLogueados[jugadorActual].username;
    }
    
    if (infoDinos) {
        const colocados = dinosauriosColocadosRonda[jugadorActual] || 0;
        infoDinos.textContent = `${colocados}/6`;
    }
}

function actualizarBolsaJugadorActivo() {
    const cont = document.getElementById("bolsaJugadorActivo");
    const nombre = document.getElementById("bolsa-jugador-nombre");
    
    if (!cont) return;
    
    if (nombre && jugadoresLogueados[jugadorActual]) {
        nombre.textContent = jugadoresLogueados[jugadorActual].username;
    }
    
    cont.innerHTML = "";
    
    const bolsa = bolsasJugadoresRonda[jugadorActual] || [];
    bolsa.forEach((dinoId, idx) => {
        const dino = draggables.find(d => d.id === dinoId);
        if (!dino) return;
        
        const div = document.createElement("div");
        div.className = "arrastrable";
        div.draggable = true;
        div.id = `bolsa-activa-${dino.id}-${idx}`;
        div.dataset.especie = dino.id;
        div.innerHTML = `<img src="${dino.img}" alt="${dino.id}">`;
        div.addEventListener("dragstart", dragStart);
        div.addEventListener("click", handleDinoClick);
        div.addEventListener("touchstart", (e) => {
            e.preventDefault();
            handleDinoClick(e);
        });
        cont.appendChild(div);
    });
    
    // También actualizar el contenedor-dinosaurio
    actualizarContenedorDinosaurios();
}

function actualizarTableroJugadorActivo() {
    // Limpiar y renderizar tablero desde cero para mostrar el tablero del jugador actual
    const tablero = document.getElementById("tablero-activo");
    if (!tablero) return;
    
    // Limpiar completamente el tablero antes de renderizar
    tablero.innerHTML = '';
    
    // Renderizar el tablero desde cero
    renderizarTableroActivo();
    
    // Cargar estado guardado del jugador actual para esta ronda
    const keyEstado = `Jugador${jugadorActual}_Ronda${rondaActual}`;
    if (estadoPorJugadorPorRonda[keyEstado]) {
        // Esperar un poco para que el tablero se renderice completamente
        setTimeout(() => {
            cargarEstadoTablero(tablero, estadoPorJugadorPorRonda[keyEstado]);
            // Re-aplicar layout después de cargar estado
            setTimeout(() => aplicarLayoutDesdeJSON(), 100);
        }, 50);
    } else {
        // Si no hay estado guardado, solo aplicar el layout
        setTimeout(() => aplicarLayoutDesdeJSON(), 50);
    }
    
    // Actualizar también el contenedor-dinosaurio con los dinosaurios de la bolsa
    actualizarContenedorDinosaurios();
    
    // El rey se calcula automáticamente cuando hay un dinosaurio en el recinto KING
    // No necesitamos actualizar ningún checkbox
}

function actualizarContenedorDinosaurios() {
    // Mostrar todos los dinosaurios de la mano del jugador (los 6 dinosaurios)
    const cont = document.getElementById("contenedor-dinosaurio");
    if (!cont) return;
    
    cont.innerHTML = "";
    
    const bolsa = bolsasJugadoresRonda[jugadorActual] || [];
    
    // Mostrar cada dinosaurio individual de la bolsa (mano del jugador)
    bolsa.forEach((dinoId, idx) => {
        const dino = draggables.find(d => d.id === dinoId);
        if (!dino) return;
        
        const div = document.createElement("div");
        div.className = "arrastrable";
        div.draggable = true;
        div.id = `mano-${dino.id}-${idx}`;
        div.dataset.especie = dino.id;
        div.dataset.indiceBolsa = idx; // Guardar índice para eliminarlo después
        div.innerHTML = `<img src="${dino.img}">`;
        div.addEventListener("dragstart", dragStart);
        div.addEventListener("click", handleDinoClick);
        div.addEventListener("touchstart", (e) => {
            e.preventDefault();
            handleDinoClick(e);
        });
        cont.appendChild(div);
    });
}

// Función simplificada de drop para el tablero activo
function dropRecinto(e, recintoId) {
    e.preventDefault();
    const origId = e.dataTransfer ? e.dataTransfer.getData("text/plain") : selectedDino;
    let orig = document.getElementById(origId);
    let especie = orig ? (orig.dataset.especie || origId) : origId;

    // Verificar si el origen es válido
    if (!orig) {
        mostrarMensaje("Error: No se pudo encontrar el dinosaurio", "error");
        return;
    }
    
    // Obtener la especie del elemento
    especie = orig.dataset.especie || origId;
    
    // Si no tiene especie, buscar por el ID
    if (!especie) {
        const bolsa = bolsasJugadoresRonda[jugadorActual] || [];
        const idx = bolsa.indexOf(origId);
        if (idx === -1) {
            mostrarMensaje("No hay dinosaurios de esta especie disponibles en tu bolsa", "error");
            return;
        }
        especie = origId;
    }

    if (contarDinosTablero() >= 6) { 
        mostrarMensaje("Ya terminó la ronda, hay 6 dinosaurios en tablero", "error"); 
        return; 
    }

    const rec = document.getElementById(recintoId);
    if (!rec) return;
    const slots = Array.from(rec.querySelectorAll(".slot"));

    // Validaciones de reglas (igual que modo seguimiento)
    if (recintoId === "SAME_FOREST") {
        const primerDino = slots.find(s => s.children.length>0)?.children[0];
        if (primerDino && primerDino.dataset.especie !== especie) { 
            mostrarMensaje("Esta mal colocado, lee las reglas", "error"); 
            return; 
        }
    }
    if (recintoId === "DIFFERENT_MEADOW") {
        const especiesActuales = slots.map(s=>s.children[0]?.dataset.especie).filter(Boolean);
        if (especiesActuales.includes(especie)) { 
            mostrarMensaje("Esta mal colocado, lee las reglas", "error"); 
            return; 
        }
    }

    let puesto = false;
    for (let slot of slots) {
        if (slot.children.length === 0) {
            const clone = orig.cloneNode(true);
            const timestamp = Date.now();
            clone.id = especie+"_copy_"+timestamp;
            clone.dataset.isClone="true";
            clone.dataset.especie=especie;
            clone.innerHTML=`<img src="${orig.querySelector("img").src}">`;
            clone.draggable = true;
            clone.addEventListener("dragstart", dragStart);

            slot.appendChild(clone);
            historialMovimientos.push({draggable: clone, slot:slot, jugador: jugadorActual, especie: especie});
            const slotIndex = slots.indexOf(slot);
            
            // Actualizar estado
            const keyEstado = `Jugador${jugadorActual}_Ronda${rondaActual}`;
            if (!estadoPorJugadorPorRonda[keyEstado]) {
                estadoPorJugadorPorRonda[keyEstado] = {};
            }
            if (!estadoPorJugadorPorRonda[keyEstado][recintoId]) {
                estadoPorJugadorPorRonda[keyEstado][recintoId] = {};
            }
            // Guardar el ID completo del dinosaurio, no solo la especie
            estadoPorJugadorPorRonda[keyEstado][recintoId][slotIndex] = clone.id;
            
            // Si se colocó en el recinto KING, actualizar automáticamente el estado del rey
            if (recintoId === "KING") {
                const keyKing = `Jugador${jugadorActual}_Ronda${rondaActual}`;
                kingPorJugadorPorRonda[keyKing] = true;
            }

            // Remover de la bolsa del jugador
            const bolsa = bolsasJugadoresRonda[jugadorActual] || [];
            let idx = -1;
            
            // Si el elemento tiene un índice guardado, usarlo
            if (orig.dataset.indiceBolsa !== undefined && orig.dataset.indiceBolsa !== null) {
                idx = parseInt(orig.dataset.indiceBolsa);
                // Verificar que el índice sea válido y que la especie coincida
                if (idx >= 0 && idx < bolsa.length && bolsa[idx] === especie) {
                    bolsa.splice(idx, 1);
                } else {
                    // Si el índice no coincide, buscar por especie
                    idx = bolsa.indexOf(especie);
                    if (idx !== -1) {
                        bolsa.splice(idx, 1);
                    }
                }
            } else {
                // Buscar por especie
                idx = bolsa.indexOf(especie);
                if (idx !== -1) {
                    bolsa.splice(idx, 1);
                }
            }
            
            if (idx !== -1) {
                bolsasJugadoresRonda[jugadorActual] = bolsa;
                dinosauriosColocadosRonda[jugadorActual]++;
                actualizarBolsaJugadorActivo();
                actualizarInfoPartida();
            }

            // Calcular puntajes
            calcularPuntajeJugadorRonda(jugadorActual, rondaActual);
            actualizarPuntajes();

            puesto = true;
            
            // Pasar automáticamente al siguiente turno después de colocar el dinosaurio
            setTimeout(() => {
                siguienteTurno();
            }, 500);
            
            break;
        }
    }
    if (!puesto) {
        mostrarMensaje("No hay espacio disponible en este recinto", "error");
    } else {
        document.querySelectorAll(".arrastrable").forEach(el => {
            el.classList.remove("selected");
        });
        selectedDino = null;
    }
}

function contarDinosTablero() {
    const recintos = ["KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER","SAME_FOREST","DIFFERENT_MEADOW"];
    let total = 0;
    recintos.forEach(id => {
        const rec = document.getElementById(id);
        if (!rec) return;
        const slots = Array.from(rec.querySelectorAll(".slot"));
        total += slots.filter(s => s.children.length > 0).length;
    });
    return total;
}

function calcularPuntajeJugadorRonda(jugador, ronda) {
    const keyEstado = `Jugador${jugador}_Ronda${ronda}`;
    const estado = estadoPorJugadorPorRonda[keyEstado] || {};
    let total = 0;
    
    const recintos = ["SAME_FOREST","DIFFERENT_MEADOW","KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER"];
    
    recintos.forEach(id => {
        if (!estado[id]) return;
        
        // Contar slots ocupados
        const slotsOcupados = Object.keys(estado[id]).length;
        
        // Cálculo según tipo de recinto (igual que modo seguimiento)
        if (id === "KING") {
            // Si hay un dinosaurio en el recinto KING, automáticamente tiene el rey
            const kingOn = slotsOcupados === 1;
            if (slotsOcupados === 1 && kingOn) total += 7;
            // Guardar automáticamente el estado del rey
            kingPorJugadorPorRonda[keyEstado] = kingOn;
        } else if (id === "LONELY") {
            if (slotsOcupados === 1) total += 7;
        } else if (id === "TRIO_TREES") {
            if (slotsOcupados === 3) total += 7;
        } else if (id === "LOVE_MEADOW") {
            const especiesCount = {};
            Object.values(estado[id]).forEach(e => {
                especiesCount[e] = (especiesCount[e] || 0) + 1;
            });
            Object.values(especiesCount).forEach(v => {
                total += Math.floor(v / 2) * 5;
            });
        } else if (id === "RIVER") {
            total += slotsOcupados; // +1 por cada dinosaurio
        } else if (id === "SAME_FOREST" || id === "DIFFERENT_MEADOW") {
            // Para estos, usar el valor del último slot ocupado
            const rec = document.getElementById(id);
            if (rec) {
                const slots = Array.from(rec.querySelectorAll(".slot"));
                let ultima = 0;
                slots.forEach(s => {
                    if (s.children.length > 0 && s.dataset.valor) {
                        ultima = parseInt(s.dataset.valor);
                    }
                });
                total += ultima;
            }
        }
        
        // Bonus por T-Rex: +1 punto si hay un T-Rex en este recinto
        const tieneTrex = Object.values(estado[id]).some(especie => especie === "tRex");
        if (tieneTrex) {
            total += 1;
        }
    });
    
    puntajesPorJugadorPorRonda[keyEstado] = total;
    return total;
}

function renderizarTableroActivo() {
    const tablero = document.getElementById("tablero-activo") || document.querySelector('.contenedor-tablero');
    if (!tablero) return;
    // Regenerar recintos siempre para garantizar estructura completa
    tablero.innerHTML = '';

    const definicion = [
        { id: 'LOVE_MEADOW', tipo: 'recinto', slots: 6, valores: [] },
        { id: 'LONELY', tipo: 'recinto', slots: 1, valores: [] },
        { id: 'TRIO_TREES', tipo: 'recinto', slots: 3, valores: [] },
        { id: 'DIFFERENT_MEADOW', tipo: 'subrecinto', slots: 6, valores: [1,3,6,10,15,21] },
        { id: 'SAME_FOREST', tipo: 'subrecinto', slots: 6, valores: [2,4,8,12,18,24] },
        { id: 'KING', tipo: 'recinto', slots: 1, valores: [] },
        { id: 'RIVER', tipo: 'recinto', slots: 6, valores: [] }
    ];

    definicion.forEach(def=>{
        const el = document.createElement('div');
        el.className = def.tipo;
        el.id = def.id;
        for(let i=0;i<def.slots;i++){
            const s = document.createElement('div');
            s.className = 'slot';
            if(def.valores[i] !== undefined){ s.dataset.valor = String(def.valores[i]); }
            el.appendChild(s);
        }
        tablero.appendChild(el);
    });
    
    // Reenlazar zonas de drop después de render dinámico
    ["KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER","SAME_FOREST","DIFFERENT_MEADOW"].forEach(id=>{
        const rec=document.getElementById(id);
        if(!rec) return;
        rec.addEventListener("dragover", e=>e.preventDefault());
        rec.addEventListener("drop", e=>dropRecinto(e,id));
        
        // Agregar manejo de click/touch para colocación (igual que seguimiento)
        rec.addEventListener("click", (e) => handleRecintoClick(e, id));
        rec.addEventListener("touchend", (e) => {
            e.preventDefault();
            handleRecintoClick(e, id);
        });
    });
    
    // Aplicar layout JSON igual que en modo seguimiento
    aplicarLayoutDesdeJSON();
}

function handleRecintoClick(e, recintoId) {
    if (!selectedDino) return;

    // Crear un evento de transferencia simulado para reutilizar la lógica existente
    const simulatedEvent = {
        preventDefault: () => {},
        dataTransfer: {
            getData: () => selectedDino
        }
    };

    dropRecinto(simulatedEvent, recintoId);
    
    // Deseleccionar después de colocar
    document.querySelectorAll(".arrastrable").forEach(el => {
        el.classList.remove("selected");
    });
    selectedDino = null;
}

// ---------------------------
// APLICAR LAYOUT JSON (posiciones y tamaños) EN TABLERO GENERAL
// ---------------------------

function aplicarLayoutDesdeJSON(){
    const tablero = document.getElementById("tablero-activo") || document.querySelector('.contenedor-tablero');
    if(!tablero) return;
    // Marca para permitir posicionamiento absoluto del layout en CSS
    tablero.classList.add('layout-applied');

    const layout = {
      "LOVE_MEADOW": {"topPercent":546.992,"leftPercent":147.988,"widthPercent":25.428571428571427,"heightPercent":23,"slotSizePx":45,"gapPx":8},
      "LONELY": {"topPercent":528.145,"leftPercent":570.352,"widthPercent":15.285714285714286,"heightPercent":14.285714285714285,"slotSizePx":60,"gapPx":8},
      "TRIO_TREES": {"topPercent":338.34,"leftPercent":128.984,"widthPercent":21.714285714285715,"heightPercent":21.857142857142858,"slotSizePx":60,"gapPx":8},
      "DIFFERENT_MEADOW": {"topPercent":321.992,"leftPercent":533.594,"widthPercent":37.42857142857143,"heightPercent":10.571428571428571,"slotSizePx":35,"gapPx":10},
      "SAME_FOREST": {"topPercent":118.965,"leftPercent":156.992,"widthPercent":35.85714285714286,"heightPercent":10,"slotSizePx":31,"gapPx":8},
      "KING": {"topPercent":106.211,"leftPercent":427.051,"widthPercent":10.571428571428571,"heightPercent":12.285714285714286,"slotSizePx":60,"gapPx":8},
      "RIVER": {"topPercent":599.785,"leftPercent":369.199,"widthPercent":24.571428571428573,"heightPercent":19.28571428571429,"slotSizePx":45,"gapPx":8}
    };

    const rect = tablero.getBoundingClientRect();
    const ids = Object.keys(layout);
    ids.forEach(id=>{
        let el = document.getElementById(id);
        // Crear recinto si no existe y agregar slots adecuados
        if(!el){
            el = document.createElement('div');
            el.id = id;
            el.className = (id==="SAME_FOREST" || id==="DIFFERENT_MEADOW") ? 'subrecinto' : 'recinto';
            const valoresSame = [2,4,8,12,18,24];
            const valoresDifferent = [1,3,6,10,15,21];
            let slotsCount = 0;
            if(id==="LONELY" || id==="KING") slotsCount = 1;
            else if(id==="TRIO_TREES") slotsCount = 3;
            else if(id==="RIVER") slotsCount = 6;
            else if(id==="SAME_FOREST" || id==="DIFFERENT_MEADOW") slotsCount = 6;
            else slotsCount = 6;
            for(let i=0;i<slotsCount;i++){
                const s = document.createElement('div');
                s.className = 'slot';
                if(id==="SAME_FOREST") s.dataset.valor = String(valoresSame[i]);
                if(id==="DIFFERENT_MEADOW") s.dataset.valor = String(valoresDifferent[i]);
                el.appendChild(s);
            }
            tablero.appendChild(el);
        }
        // Reparentar: convertir en hijo directo del tablero para usar coordenadas absolutas desde el borde del tablero
        if(el.parentElement !== tablero){
            el.parentElement && el.parentElement.removeChild(el);
            tablero.appendChild(el);
        }
        const conf = layout[id];
        // Estilos absolutos relativos al contenedor
        el.style.position = 'absolute';
        el.style.transform = 'translate(-50%, -50%)';
        // JSON trae top/left en píxeles del editor → convertir a % del tablero actual
        const leftPct = (conf.leftPercent / rect.width) * 100;
        const topPct = (conf.topPercent / rect.height) * 100;
        el.style.left = leftPct + '%';
        el.style.top = topPct + '%';
        // width/height vienen como porcentaje del tablero → usar % directamente
        el.style.width = conf.widthPercent + '%';
        el.style.height = conf.heightPercent + '%';
        el.style.setProperty('--slot-size', (conf.slotSizePx||60) + 'px');
        el.style.setProperty('--gap', (conf.gapPx||8) + 'px');

        // Disposición interna según lo solicitado: SAME/DIFFERENT en fila; LOVE_MEADOW y RIVER en 3x2
        if(id==="SAME_FOREST" || id==="DIFFERENT_MEADOW"){
            el.style.display = 'inline-flex';
            el.style.flexWrap = 'nowrap';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.gap = '8px';
            el.style.overflow = 'hidden';
        } else if(id==="LOVE_MEADOW" || id==="RIVER"){
            el.style.display = 'grid';
            el.style.gridTemplateColumns = 'repeat(3, 1fr)';
            el.style.gridAutoRows = '1fr';
            el.style.gap = '8px';
            Array.from(el.querySelectorAll('.slot')).forEach(s=>{
                s.style.width = '100%';
                s.style.height = 'auto';
                s.style.aspectRatio = '1 / 1';
            });
        } else {
            el.style.display = 'flex';
            el.style.flexWrap = 'wrap';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
        }
    });

    // Posiciones y tamaños ya están en %, escalan automáticamente con el tablero
}

function cargarEstadoTablero(tablero, estado) {
    Object.keys(estado).forEach(recintoId => {
        const recinto = document.getElementById(recintoId);
        if (!recinto) return;
        
        const slots = recinto.querySelectorAll(".slot");
        const recintoEstado = estado[recintoId];
        
        Object.keys(recintoEstado).forEach(slotIndex => {
            const dinoId = recintoEstado[slotIndex];
            const slot = slots[parseInt(slotIndex)];
            if (!slot || slot.hasChildNodes()) return;
            
            const dino = draggables.find(d => d.id === dinoId);
            if (!dino) return;
            
            const dinoEl = document.createElement("div");
            dinoEl.className = "arrastrable";
            dinoEl.draggable = true;
            dinoEl.id = `dino-${dinoId}-${Date.now()}`;
            dinoEl.dataset.especie = dinoId;
            dinoEl.innerHTML = `<img src="${dino.img}" alt="${dinoId}">`;
            slot.appendChild(dinoEl);
        });
    });
}

function actualizarPuntajes() {
    const cont = document.getElementById("puntajes");
    if (!cont) return;
    
    cont.innerHTML = "";
    
    for (let jug = 1; jug <= cantJugadores; jug++) {
        const jugadorDiv = document.createElement("div");
        jugadorDiv.className = "puntaje-jugador";
        
        const nombre = jugadoresLogueados[jug] ? jugadoresLogueados[jug].username : `Jugador ${jug}`;
        const h4 = document.createElement("h4");
        h4.textContent = nombre;
        jugadorDiv.appendChild(h4);
        
        let totalJugador = 0;
        for (let ronda = 1; ronda <= cantRondas; ronda++) {
            const key = `Jugador${jug}_Ronda${ronda}`;
            const puntos = puntajesPorJugadorPorRonda[key] || 0;
            totalJugador += puntos;
            
            const rondaDiv = document.createElement("div");
            rondaDiv.className = "puntaje-item";
            rondaDiv.innerHTML = `<span>Ronda ${ronda}:</span> <span>${puntos}</span>`;
            jugadorDiv.appendChild(rondaDiv);
        }
        
        const totalDiv = document.createElement("div");
        totalDiv.className = "puntaje-total";
        totalDiv.innerHTML = `<strong>Total: ${totalJugador}</strong>`;
        jugadorDiv.appendChild(totalDiv);
        
        cont.appendChild(jugadorDiv);
    }
}

function mostrarPuntajesFinales() {
    actualizarPuntajes();
    mostrarMensaje("Partida finalizada. Revisa los puntajes finales.", "success");
}

// ---------------------------
// UTILIDADES
// ---------------------------

function mostrarMensaje(texto, tipo = "success") {
    const msg = document.getElementById("game-message");
    if (!msg) return;

    msg.textContent = texto;
    msg.className = `game-message ${tipo} show`;

    setTimeout(() => {
        msg.classList.remove("show");
    }, 3000);
}

