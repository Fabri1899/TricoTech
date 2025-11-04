// ---------------------------
// VARIABLES GLOBALES
// ---------------------------

let cantRondas = 4;
let rondaActual = 1;
let historialMovimientos = [];
let puntajesPorRonda = {};
let estadoPorRonda = {};
let kingPorRonda = {};
let contadorEspecies = {};

let selectedDino = null;

let draggables = [
    { id: "tRex", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/tRex.png" },
    { id: "SPECIE_1", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie1.png" },
    { id: "SPECIE_2", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie2.png" },
    { id: "SPECIE_3", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie3.png" },
    { id: "SPECIE_4", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie4.png" },
    { id: "SPECIE_5", img: "http://localhost:8012/Tricosaurus/frontend/assets/images/dinos/specie5.png" }
];

// Bolsa de dinosaurios por ronda (10 de cada especie = 60 total)
let bolsaRonda = [];

// ---------------------------
// SELECTS RONDAS Y JUGADORES
// --------------------------

const selectRonda = document.getElementById("selectRonda");
const selectJugadores = document.getElementById("selectJugadores");

// ---------------------------
// PUNTAJES (UI dinámica)
// ---------------------------

function inicializarPuntajes() {
    const cont = document.getElementById("puntajes");
    if (!cont) return;
    cont.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Puntajes";
    cont.appendChild(title);

    for (let i = 1; i <= cantRondas; i++) {
        const key = "Ronda " + i;
        if (puntajesPorRonda[key] === undefined) puntajesPorRonda[key] = 0;

        const div = document.createElement("div");
        div.className = "puntaje-item";
        div.id = `puntaje-ronda-${i}`;
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.innerHTML = `<span>Ronda ${i}:</span> <span>${puntajesPorRonda[key]}</span>`;
        cont.appendChild(div);
    }

    const sep = document.createElement("hr");
    cont.appendChild(sep);

    const totalDiv = document.createElement("div");
    totalDiv.id = "puntaje-total";
    totalDiv.style.display = "flex";
    totalDiv.style.justifyContent = "space-between";
    totalDiv.style.fontWeight = "bold";
    totalDiv.innerHTML = `<span>Total:</span> <span>${calcularTotalPuntajes()}</span>`;
    cont.appendChild(totalDiv);
}

function calcularTotalPuntajes() {
    let total = 0;
    for (let i = 1; i <= cantRondas; i++) {
        const key = "Ronda " + i;
        total += Number(puntajesPorRonda[key] ?? 0);
    }
    return total;
}

function actualizarPuntaje(ronda, puntos) {
    const key = "Ronda " + ronda;
    puntajesPorRonda[key] = puntos;

    const rondaDiv = document.getElementById(`puntaje-ronda-${ronda}`);
    if (rondaDiv) {
        rondaDiv.querySelector("span:last-child").textContent = puntos;
    } else {
        inicializarPuntajes();
    }

    const totalElem = document.querySelector("#puntaje-total span:last-child");
    if (totalElem) totalElem.textContent = calcularTotalPuntajes();
}

// ---------------------------
// FUNCIONES DE RONDAS
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
    // Crear bolsa para la ronda 1 si no existe estado guardado
    if (!estadoPorRonda["Ronda "+rondaActual]) {
        crearBolsaRonda();
    }
    restaurarRonda();
    inicializarPuntajes();
}

if (selectJugadores) {
    selectJugadores.addEventListener("change", e => {
        const jugadores = parseInt(e.target.value);
        cantRondas = (jugadores === 2) ? 4 : 2;
        actualizarRondas();
    });
}

if (selectRonda) {
    selectRonda.addEventListener("change", e => {
        rondaActual = parseInt(e.target.value);
        // Crear nueva bolsa para la nueva ronda si no existe estado guardado
        if (!estadoPorRonda["Ronda "+rondaActual]) {
            crearBolsaRonda();
        }
        restaurarRonda();
        const check = document.getElementById("kingCheck");
        if (check) check.checked = false;
    });
}

// ---------------------------
// FUNCIONES DRAG & DROP
// ---------------------------

// Crear bolsa de dinosaurios para la ronda (10 de cada especie)
function crearBolsaRonda() {
    bolsaRonda = [];
    draggables.forEach(dino => {
        for (let i = 0; i < 10; i++) {
            bolsaRonda.push(dino.id);
        }
    });
    // Mezclar aleatoriamente
    for (let i = bolsaRonda.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bolsaRonda[i], bolsaRonda[j]] = [bolsaRonda[j], bolsaRonda[i]];
    }
}

// Mostrar solo un dinosaurio aleatorio de la bolsa
function mostrarDinosaurioAleatorio() {
    const cont = document.getElementById("contenedor-dinosaurio");
    if (!cont) return;
    
    // Si no hay dinosaurios en la bolsa, no mostrar nada
    if (bolsaRonda.length === 0) {
        cont.innerHTML = "";
        return;
    }
    
    // Seleccionar un dinosaurio aleatorio de la bolsa
    const indiceAleatorio = Math.floor(Math.random() * bolsaRonda.length);
    const dinoId = bolsaRonda[indiceAleatorio];
    const dino = draggables.find(d => d.id === dinoId);
    
    if (!dino) {
        cont.innerHTML = "";
        return;
    }
    
    // Limpiar contenedor y mostrar solo este dinosaurio
    cont.innerHTML = "";
    
    const div = document.createElement("div");
    div.className = "arrastrable";
    div.draggable = true;
    div.id = dino.id;
    div.dataset.especie = dino.id;
    div.dataset.indiceBolsa = indiceAleatorio; // Guardar índice para eliminarlo después
    div.innerHTML = `<img src="${dino.img}">`;
    div.addEventListener("dragstart", dragStart);
    
    // Agregar manejo de click/touch para selección
    div.addEventListener("click", handleDinoClick);
    div.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleDinoClick(e);
    });
    
    cont.appendChild(div);
}

function generarDraggables() {
    // Si no hay bolsa creada, crearla
    if (bolsaRonda.length === 0) {
        crearBolsaRonda();
    }
    
    // Inicializar contadores de especies
    draggables.forEach(d => {
        contadorEspecies[d.id] = 0;
    });
    
    // Mostrar un dinosaurio aleatorio
    mostrarDinosaurioAleatorio();
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

function dragStart(e) {
    const target = e.target.closest(".arrastrable");
    if (!target) return;
    e.dataTransfer.setData("text/plain", target.id);
    if (e.dataTransfer.setDragImage) {
        const img = target.querySelector("img");
        if (img) e.dataTransfer.setDragImage(img, img.width/2, img.height/2);
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

function dropRecinto(e, recintoId) {
    e.preventDefault();
    const origId = e.dataTransfer.getData("text/plain");
    const orig = document.getElementById(origId);
    if (!orig) return;
    const especie = orig.dataset.especie;

    // Ya no mostrar alerta, solo prevenir colocación si ya hay 6 dinosaurios
    if (contarDinosTablero() >= 6) { 
        mostrarMensajeSeguimiento("Ya terminó la ronda, hay 6 dinosaurios en tablero", "info");
        return; 
    }
    if (!contadorEspecies[especie]) contadorEspecies[especie] = 0;
    if (contadorEspecies[especie] >= 10) { alert("Ya se sacaron todos los dinosaurios de esta especie"); return; }

    const rec = document.getElementById(recintoId);
    if (!rec) return;
    const slots = Array.from(rec.querySelectorAll(".slot"));

    if (recintoId === "SAME_FOREST") {
        const primerDino = slots.find(s => s.children.length>0)?.children[0];
        if (primerDino && primerDino.dataset.especie !== especie) { alert("Esta mal colocado, lee las reglas"); return; }
    }
    if (recintoId === "DIFFERENT_MEADOW") {
        const especiesActuales = slots.map(s=>s.children[0]?.dataset.especie).filter(Boolean);
        if (especiesActuales.includes(especie)) { alert("Esta mal colocado, lee las reglas"); return; }
    }

    let puesto = false;
    for (let slot of slots) {
        if (slot.children.length === 0) {
            const clone = orig.cloneNode(true);
            clone.id = orig.id+"_copy_"+(contadorEspecies[especie]+1);
            clone.dataset.isClone="true";
            clone.dataset.especie=especie;
            clone.innerHTML=`<img src="${orig.querySelector("img").src}">`;
            clone.draggable = true;
            clone.addEventListener("dragstart", dragStart);

            slot.appendChild(clone);
            historialMovimientos.push({draggable: clone, slot:slot});
            contadorEspecies[especie]++;
            puesto=true;
            
            // Eliminar el dinosaurio de la bolsa
            eliminarDinosaurioDeBolsa(orig);
            
            // Verificar si se completaron 6 dinosaurios y guardar automáticamente la ronda
            const totalDinos = contarDinosTablero();
            if (totalDinos >= 6) {
                guardarRonda();
                // Guardar automáticamente en la base de datos
                guardarRondaEnBD();
            }
            
            break;
        }
    }
    if (!puesto) alert("No hay espacio disponible en este recinto");
}

// Eliminar dinosaurio de la bolsa y mostrar uno nuevo
function eliminarDinosaurioDeBolsa(orig) {
    // Obtener el índice del dinosaurio en la bolsa
    const indiceBolsa = orig.dataset.indiceBolsa;
    if (indiceBolsa !== undefined && indiceBolsa !== null) {
        // Eliminar de la bolsa
        bolsaRonda.splice(parseInt(indiceBolsa), 1);
    } else {
        // Si no tiene índice, buscar por especie y eliminar el primero que encuentre
        const especie = orig.dataset.especie;
        const indice = bolsaRonda.indexOf(especie);
        if (indice !== -1) {
            bolsaRonda.splice(indice, 1);
        }
    }
    
    // Deseleccionar
    selectedDino = null;
    
    // Mostrar un nuevo dinosaurio aleatorio
    mostrarDinosaurioAleatorio();
}

function handleRecintoClick(e, recintoId) {
    if (!selectedDino) return;

    const orig = document.getElementById(selectedDino);
    if (!orig) return;
    
    // Crear un evento de transferencia simulado para reutilizar la lógica existente
    const simulatedEvent = {
        preventDefault: () => {},
        dataTransfer: {
            getData: () => selectedDino
        }
    };

    // Usar la misma función dropRecinto que maneja el guardado automático
    dropRecinto(simulatedEvent, recintoId);
    
    // Deseleccionar después de colocar (ya se hace en eliminarDinosaurioDeBolsa)
    document.querySelectorAll(".arrastrable").forEach(el => {
        el.classList.remove("selected");
    });
}

["KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER","SAME_FOREST","DIFFERENT_MEADOW"].forEach(id=>{
    const rec=document.getElementById(id);
    if(!rec) return;
    rec.addEventListener("dragover", e=>e.preventDefault());
    rec.addEventListener("drop", e=>dropRecinto(e,id));
    
    // Agregar manejo de click/touch para colocación
    rec.addEventListener("click", (e) => handleRecintoClick(e, id));
    rec.addEventListener("touchend", (e) => {
        e.preventDefault();
        handleRecintoClick(e, id);
    });
});

// ---------------------------
// FUNCIONES DE PUNTOS
// ---------------------------

function guardarRonda() {
    const totalDinos = contarDinosTablero();
    if(totalDinos<6){ alert("No se puede guardar la ronda, faltan dinosaurios"); return; }

    let total=0;
    let estado={};
    const recintos=["SAME_FOREST","DIFFERENT_MEADOW","KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER"];
    recintos.forEach(id=>{
        const rec=document.getElementById(id);
        if(!rec){ estado[id]=[]; return; }
        const slots = Array.from(rec.querySelectorAll(".slot"));
        estado[id]=slots.map(s=>s.children[0]?.id||null);

        if(id==="KING"){ const kingOn = !!kingPorRonda["Ronda "+rondaActual]; if(slots.filter(s=>s.children.length>0).length===1 && kingOn) total+=7;}
        else if(id==="LONELY"){ if(slots.filter(s=>s.children.length>0).length===1) total+=7; }
        else if(id==="TRIO_TREES"){ if(slots.filter(s=>s.children.length>0).length===3) total+=7; }
        else if(id==="LOVE_MEADOW"){ const especiesCount={}; slots.forEach(s=>{ if(s.children.length>0){ const e=s.children[0].dataset.especie; especiesCount[e]=(especiesCount[e]||0)+1;} }); Object.values(especiesCount).forEach(v=>{total+=Math.floor(v/2)*5});}
        else if(id==="RIVER"){ total+=slots.filter(s=>s.children.length>0).length; }
        else if(id==="SAME_FOREST" || id==="DIFFERENT_MEADOW"){ let ultima=0; slots.forEach(s=>{if(s.children.length>0 && s.dataset.valor) ultima=parseInt(s.dataset.valor)}); total+=ultima; }

        const countSpecie1 = slots.filter(s=>s.children.length===1 && s.children[0].dataset.especie==="tRex").length;
        if(countSpecie1===1) total+=1;
    });

    puntajesPorRonda["Ronda "+rondaActual]=total;
    estadoPorRonda["Ronda "+rondaActual]=estado;
    const check=document.getElementById("kingCheck");
    kingPorRonda["Ronda "+rondaActual] = !!(check && check.checked);

    actualizarPuntaje(rondaActual,total);
}

// Función para guardar automáticamente la ronda en la base de datos
async function guardarRondaEnBD() {
    try {
        // Usar la misma función de guardar partida pero solo para actualizar la ronda actual
        const payload = {
            cantJugadores: parseInt(selectJugadores?.value) || 2,
            cantRondas: cantRondas,
            puntajesPorRonda,    // Ej: {"Ronda 1": 12, "Ronda 2": 8}
            estado: estadoPorRonda,  // Ej: {"Ronda 1": {"KING": ["tRex_copy_1"], "RIVER": [...]}}
            kingPorRonda         // Ej: {"Ronda 1": true, "Ronda 2": false}
        };
        
        const res = await fetch("http://localhost:8012/Tricosaurus/backend/src/controllers/PartidaController.php?action=guardar", {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();

        if (!data.success) {
            console.error("Error al guardar ronda automáticamente: " + data.message);
            return;
        }

        mostrarMensajeSeguimiento(`Ronda ${rondaActual} guardada automáticamente`, "success");
        
        // Verificar si todas las rondas están completas
        verificarTodasLasRondasCompletas();
    } catch (err) {
        console.error("Error al guardar ronda automáticamente:", err);
    }
}

// Función para verificar si todas las rondas están completas
function verificarTodasLasRondasCompletas() {
    let todasCompletas = true;
    for (let i = 1; i <= cantRondas; i++) {
        const key = "Ronda " + i;
        // Una ronda está completa si tiene puntaje guardado (incluso si es 0)
        // El puntaje se guarda solo cuando se completa con 6 dinosaurios
        if (puntajesPorRonda[key] === undefined || puntajesPorRonda[key] === null) {
            // Si es la ronda actual y tiene 6 dinosaurios, aún no se ha guardado el puntaje
            if (i === rondaActual && contarDinosTablero() >= 6) {
                // La ronda está completa pero el puntaje se guardará en guardarRonda()
                continue;
            }
            todasCompletas = false;
            break;
        }
    }
    
    if (todasCompletas) {
        // Pequeño delay para asegurar que el mensaje se muestre después de guardar
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

// Función para mostrar mensajes en el modo seguimiento
function mostrarMensajeSeguimiento(mensaje, tipo = "info") {
    const mensajeEl = document.getElementById("seguimiento-message");
    if (!mensajeEl) return;
    
    mensajeEl.textContent = mensaje;
    mensajeEl.className = `seguimiento-message ${tipo}`;
    mensajeEl.style.display = "block";
    
    setTimeout(() => {
        mensajeEl.style.display = "none";
    }, 3000);
}

// ---------------------------
// DESHACER Y RESTAURAR
// ---------------------------

function deshacerCambio(){
    const ultimo=historialMovimientos.pop();
    if(!ultimo) return;
    const especie=ultimo.draggable.dataset.especie;
    if(ultimo.draggable.parentNode) ultimo.draggable.parentNode.removeChild(ultimo.draggable);
    if(contadorEspecies[especie]>0) contadorEspecies[especie]--;
    
    // Devolver el dinosaurio a la bolsa
    bolsaRonda.push(especie);
    
    // Mostrar un nuevo dinosaurio aleatorio
    mostrarDinosaurioAleatorio();
}

function restaurarRonda(){
    console.log("restaurarRonda llamada - Ronda actual:", rondaActual);
    console.log("estadoPorRonda:", estadoPorRonda);
    
    historialMovimientos=[];
    const recintos=["SAME_FOREST","DIFFERENT_MEADOW","KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER"];
    recintos.forEach(id=>{
        const rec=document.getElementById(id);
        if(!rec) {
            console.warn(`No se encontró el recinto ${id}`);
            return;
        }
        const slots=Array.from(rec.querySelectorAll(".slot"));
        slots.forEach(s=>s.innerHTML='');
    });

    // Recrear la bolsa para esta ronda (siempre crear la bolsa completa)
    crearBolsaRonda();
    
    // Recalcular contadores de especies basados en el estado guardado
    draggables.forEach(d => {
        contadorEspecies[d.id] = 0;
    });
    
    const keyRonda = "Ronda "+rondaActual;
    const estado=estadoPorRonda[keyRonda];
    
    console.log("Buscando estado para:", keyRonda, "Estado encontrado:", estado);
    
    if(estado){
        recintos.forEach(id=>{
            const rec=document.getElementById(id);
            if(!rec) {
                console.warn(`No se encontró el recinto ${id} para restaurar`);
                return;
            }
            if(estado[id]){
                const slots=Array.from(rec.querySelectorAll(".slot"));
                let slotIndex=0;
                console.log(`Restaurando recinto ${id} con ${estado[id].length} dinosaurios`);
                
                estado[id].forEach((dId, idx) => {
                    if(!dId) {
                        console.log(`Slot ${idx} vacío en ${id}`);
                        return;
                    }
                    
                    const especie=draggables.find(d=>d.id===dId.replace(/_copy_\d+$/,''))?.id||dId.replace(/_copy_\d+$/, '');
                    
                    if (!especie) {
                        console.warn(`No se encontró especie para ${dId}`);
                        return;
                    }
                    
                    // Incrementar contador de especie
                    if (!contadorEspecies[especie]) contadorEspecies[especie] = 0;
                    contadorEspecies[especie]++;
                    
                    // Eliminar de la bolsa (ya que está en el tablero)
                    const indice = bolsaRonda.indexOf(especie);
                    if (indice !== -1) {
                        bolsaRonda.splice(indice, 1);
                    }
                    
                    const imgObj=draggables.find(d=>d.id===especie);
                    if (!imgObj) {
                        console.warn(`No se encontró imagen para especie ${especie}`);
                        return;
                    }
                    
                    const div=document.createElement("div");
                    div.className="arrastrable";
                    div.draggable=true;
                    div.id=dId;
                    div.dataset.especie=especie;
                    div.innerHTML=`<img src="${imgObj.img}">`;
                    div.addEventListener("dragstart", dragStart);

                    if(slots.length>0){
                        while(slotIndex<slots.length && slots[slotIndex].children.length>0) slotIndex++;
                        if(slotIndex<slots.length) {
                            slots[slotIndex].appendChild(div);
                            console.log(`Dinosaurio ${especie} colocado en slot ${slotIndex} de ${id}`);
                        } else {
                            rec.appendChild(div);
                            console.log(`Dinosaurio ${especie} colocado directamente en ${id}`);
                        }
                        slotIndex++;
                    } else {
                        rec.appendChild(div);
                    }
                });
            } else {
                console.log(`No hay estado guardado para recinto ${id}`);
            }
        });
    } else {
        console.log("No hay estado guardado para la ronda actual");
    }
    
    // Mostrar un dinosaurio aleatorio de la bolsa restante
    mostrarDinosaurioAleatorio();
    
    const check=document.getElementById("kingCheck");
    if(check) check.checked = !!kingPorRonda[keyRonda];
}


// ---------------------------
// FUNCIONES GUARDAR Y LISTAR PARTIDAS
// ---------------------------


async function guardarPartida() {
    guardarRonda(); // Calcula puntaje y estado

    // Los datos se envían en el formato original, pero el backend los procesará
    // y los guardará en tablas separadas en lugar de JSON
    const payload = {
        cantJugadores: parseInt(selectJugadores?.value) || 2,
        cantRondas: cantRondas,
        puntajesPorRonda,    // Ej: {"Ronda 1": 12, "Ronda 2": 8}
        estado: estadoPorRonda,  // Ej: {"Ronda 1": {"KING": ["tRex_copy_1"], "RIVER": [...]}}
        kingPorRonda         // Ej: {"Ronda 1": true, "Ronda 2": false}
    };
    
    try {
        const res = await fetch("http://localhost:8012/Tricosaurus/backend/src/controllers/PartidaController.php?action=guardar", {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();

        if (!data.success) {
            alert("Error: " + data.message);
            return;
        }

        alert("Partida guardada correctamente");
        mostrarPartidas(); // refresca lista
    } catch (err) {
        console.error(err);
        alert("Error al guardar partida");
    }
}

async function mostrarPartidas() {
    try {
    const res = await fetch("http://localhost:8012/Tricosaurus/backend/src/controllers/PartidaController.php?action=listar", { credentials: 'include' });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        // Intentar parsear JSON de forma segura
        let data;
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (parseErr) {
            console.error('Respuesta no-JSON del servidor al listar partidas:', text);
            throw new Error('Respuesta no válida del servidor (no-JSON)');
        }

        if (!data.success) {
            // Mensaje más explícito si es problema de sesión
            if (data.message && data.message.toLowerCase().includes('usuario no logueado')) {
                alert('No estás logueado. Por favor inicia sesión antes de cargar partidas.');
            } else {
                alert("Error: " + data.message);
            }
            return;
        }

        const cont = document.getElementById("partidasDisponibles");
        cont.innerHTML = "";

        data.data.forEach(p => {
            const div = document.createElement("div");
            div.className = "partida-item";
            div.dataset.id = p.id;
            div.style.border = "1px solid #ccc";
            div.style.margin = "5px";
            div.style.padding = "5px";
            div.style.cursor = "pointer";
            const tipoPartida = p.tipo === 'juego' ? ' (Juego)' : ' (Seguimiento)';
            div.textContent = `Partida #${p.id} - ${p.fecha} - ${p.cant_jugadores} jugadores${tipoPartida}`;

            div.addEventListener("click", async () => {
                // Si es tipo juego, cargar datos completos desde el backend
                if (p.tipo === 'juego') {
                    try {
                        const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
                        const response = await fetch(`${API_URL}?path=partidas/obtener&id=${p.id}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include'
                        });
                        const text = await response.text();
                        const data = JSON.parse(text);
                        if (data.success && data.data) {
                            const partida = data.data;
                            if (typeof partida.datos === 'string') {
                                partida.datos = JSON.parse(partida.datos);
                            }
                            cargarPartida(partida);
                        } else {
                            alert('Error al cargar la partida: ' + (data.message || 'Error desconocido'));
                        }
                    } catch (error) {
                        console.error('Error al cargar partida:', error);
                        alert('Error al cargar la partida: ' + error.message);
                    }
                } else {
                    cargarPartida(p);
                }
            });
            cont.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        alert("Error al cargar partidas: " + err.message);
    }
}

// Variables para partidas cargadas
let partidaCargada = null;
let esPartidaJuego = false;

function cargarPartida(partida) {
    if (!partida) {
        console.error("cargarPartida: partida es null o undefined");
        return;
    }

    console.log("cargarPartida llamada con:", partida);
    
    partidaCargada = partida;
    esPartidaJuego = partida.tipo === 'juego';
    cantRondas = partida.cant_rondas || 4;
    
    console.log("Tipo de partida:", partida.tipo, "esPartidaJuego:", esPartidaJuego);
    console.log("Datos de partida:", partida.datos);
    
    // Verificar si tiene datos de rondas (formato juego)
    const tieneRondas = partida.datos?.rondas || (partida.datos && typeof partida.datos === 'object' && 'rondas' in partida.datos);
    
    if (esPartidaJuego && tieneRondas) {
        console.log("Mostrando vista de partida cargada (juego)");
        // Es una partida de tipo juego con múltiples jugadores
        mostrarVistaPartidaCargada(partida);
    } else {
        console.log("Mostrando vista normal (seguimiento)");
        // Es una partida de tipo seguimiento (un solo jugador)
        puntajesPorRonda = partida.datos?.puntajesPorRonda || {};
        estadoPorRonda = partida.datos?.estado || {};
        kingPorRonda = partida.datos?.kingPorRonda || {};
        if (selectJugadores) selectJugadores.value = partida.cant_jugadores || 2;

        actualizarRondas();
        inicializarPuntajes();
        restaurarRonda();
        
        // Mostrar vista normal
        const vistaNormal = document.getElementById("vista-normal");
        const vistaPartidaCargada = document.getElementById("vista-partida-cargada");
        const selectorRonda = document.getElementById("selector-ronda-cargada");
        
        if (vistaNormal) vistaNormal.style.display = "block";
        if (vistaPartidaCargada) vistaPartidaCargada.style.display = "none";
        if (selectorRonda) selectorRonda.style.display = "none";
    }
}

function mostrarVistaPartidaCargada(partida) {
    console.log("mostrarVistaPartidaCargada llamada con:", partida);
    
    // Ocultar vista normal
    const vistaNormal = document.getElementById("vista-normal");
    const vistaPartidaCargada = document.getElementById("vista-partida-cargada");
    const selectorRonda = document.getElementById("selector-ronda-cargada");
    
    if (!vistaNormal || !vistaPartidaCargada || !selectorRonda) {
        console.error("No se encontraron los elementos del DOM necesarios");
        return;
    }
    
    vistaNormal.style.display = "none";
    vistaPartidaCargada.style.display = "block";
    selectorRonda.style.display = "block";
    
    // Configurar selector de ronda
    const selectRondaCargada = document.getElementById("selectRondaCargada");
    if (!selectRondaCargada) {
        console.error("No se encontró selectRondaCargada");
        return;
    }
    
    selectRondaCargada.innerHTML = "";
    for (let i = 1; i <= cantRondas; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Ronda ${i}`;
        selectRondaCargada.appendChild(opt);
    }
    
    // Cargar ronda inicial
    const rondaInicial = 1;
    selectRondaCargada.value = rondaInicial;
    
    // Remover listeners anteriores si existen y agregar uno nuevo
    const nuevoSelect = selectRondaCargada.cloneNode(true);
    selectRondaCargada.parentNode.replaceChild(nuevoSelect, selectRondaCargada);
    nuevoSelect.addEventListener("change", (e) => {
        const ronda = parseInt(e.target.value);
        console.log("Cambiando a ronda:", ronda);
        mostrarTablerosRonda(partida, ronda);
    });
    
    // Mostrar tableros de la ronda inicial
    mostrarTablerosRonda(partida, rondaInicial);
}

function mostrarTablerosRonda(partida, numeroRonda) {
    console.log("mostrarTablerosRonda llamada - Ronda:", numeroRonda, "Partida:", partida);
    
    const contenedor = document.getElementById("tableros-jugadores");
    if (!contenedor) {
        console.error("No se encontró el contenedor tableros-jugadores");
        return;
    }
    
    contenedor.innerHTML = "";
    
    // Verificar estructura de datos
    let datosRondas = null;
    if (partida.datos) {
        if (typeof partida.datos === 'string') {
            datosRondas = JSON.parse(partida.datos);
        } else if (partida.datos.rondas) {
            datosRondas = partida.datos;
        } else {
            datosRondas = partida.datos;
        }
    }
    
    console.log("Datos de rondas:", datosRondas);
    
    if (!datosRondas?.rondas || !datosRondas.rondas[numeroRonda]) {
        console.warn("No hay datos para la ronda:", numeroRonda);
        contenedor.innerHTML = `<p>No hay datos para la ronda ${numeroRonda}</p>`;
        return;
    }
    
    const ronda = datosRondas.rondas[numeroRonda];
    console.log("Datos de la ronda:", ronda);
    
    const jugadores = ronda.jugadores || {};
    const cantJugadores = partida.cant_jugadores || Object.keys(jugadores).length || 1;
    
    console.log("Cantidad de jugadores:", cantJugadores, "Jugadores:", jugadores);
    
    // Renderizar tablero para cada jugador
    for (let jug = 1; jug <= cantJugadores; jug++) {
        const jugData = jugadores[jug] || { puntaje: 0, esRey: false, posiciones: {} };
        
        console.log(`Jugador ${jug} datos:`, jugData);
        
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
        renderizarTableroJugadorCargado(tablero, jugData.posiciones || {});
    }
}

function renderizarTableroJugadorCargado(tablero, posiciones) {
    console.log("renderizarTableroJugadorCargado - Posiciones:", posiciones);
    
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
    recintos.forEach(id => {
        const rec = document.getElementById(`${id}_${tablero.id}`);
        if (!rec) return;
        
        const posicionesRecinto = posiciones[id] || [];
        if (!Array.isArray(posicionesRecinto) || posicionesRecinto.length === 0) return;
        
        const slots = Array.from(rec.querySelectorAll(".slot"));
        posicionesRecinto.forEach((dinoId, index) => {
            if (!dinoId || index >= slots.length) return;
            
            // El dinoId puede venir en formato "tRex_copy_1" o solo "tRex"
            const especie = typeof dinoId === 'string' ? dinoId.replace(/_copy_\d+$/, '') : dinoId;
            const dino = draggables.find(d => d.id === especie);
            if (!dino) {
                console.warn(`No se encontró dinosaurio con id: ${especie}`);
                return;
            }
            
            const div = document.createElement("div");
            div.className = "arrastrable";
            div.draggable = false; // No se puede arrastrar en vista de solo lectura
            div.id = typeof dinoId === 'string' ? dinoId : `${especie}_copy_${index + 1}`;
            div.dataset.especie = especie;
            div.innerHTML = `<img src="${dino.img}">`;
            
            slots[index].appendChild(div);
        });
    });
    
    // Aplicar layout
    setTimeout(() => {
        aplicarLayoutTablero(tablero);
    }, 50);
}

function aplicarLayoutTablero(tablero) {
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
// BOTONES EN UI
// ---------------------------
document.getElementById("btnGuardarPartida")?.addEventListener("click", guardarPartida);
// document.getElementById("btnRestaurarPartida")?.addEventListener("click", restaurarPartida);
document.getElementById("btnRestaurarPartida")?.addEventListener("click", mostrarPartidas);

// Sincroniza checkbox con estado guardado por ronda
const kingCheckEl = document.getElementById("kingCheck");
if (kingCheckEl) {
    kingCheckEl.addEventListener("change", () => {
        kingPorRonda["Ronda "+rondaActual] = !!kingCheckEl.checked;
    });
}


// ---------------------------
// INICIALIZACIÓN
// ---------------------------
// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM cargado, inicializando...");
        inicializarModoSeguimiento();
    });
} else {
    console.log("DOM ya cargado, inicializando...");
    inicializarModoSeguimiento();
}

function inicializarModoSeguimiento() {
    generarDraggables();
    inicializarPuntajes();
    actualizarRondas();
    
    // Verificar que el tablero existe
    const tablero = document.getElementById('tablero');
    if (!tablero) {
        console.error("No se encontró el elemento tablero con id 'tablero'");
        // Esperar un poco más y volver a intentar
        setTimeout(() => {
            const tableroRetry = document.getElementById('tablero');
            if (tableroRetry) {
                console.log("Tablero encontrado en segundo intento");
            } else {
                console.error("Tablero aún no encontrado después del segundo intento");
            }
        }, 500);
    } else {
        console.log("Tablero encontrado correctamente");
    }
}

// ---------------------------
// CARGAR PARTIDA DESDE URL
// ---------------------------
(async function cargarPartidaDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const partidaId = urlParams.get('partida');
    
    if (partidaId) {
        try {
            const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
            const response = await fetch(`${API_URL}?path=partidas/obtener&id=${partidaId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error('Respuesta no-JSON:', text);
                throw new Error('Respuesta no válida del servidor');
            }

            if (data.success && data.data) {
                // Cargar la partida automáticamente
                const partida = data.data;
                console.log('Partida recibida desde URL:', partida);
                
                // Si es tipo juego, asegurarse de que los datos están en el formato correcto
                if (partida.tipo === 'juego') {
                    if (typeof partida.datos === 'string') {
                        try {
                            partida.datos = JSON.parse(partida.datos);
                        } catch (e) {
                            console.error('Error al parsear datos de partida:', e);
                        }
                    }
                    // Si datos.rondas no existe directamente, verificar estructura
                    if (!partida.datos?.rondas && partida.datos) {
                        console.log('Estructura de datos recibida:', partida.datos);
                    }
                }
                
                cargarPartida(partida);
                console.log('Partida cargada automáticamente:', partida);
            } else {
                console.error('Error al cargar partida:', data.message);
                alert('Error al cargar la partida: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al cargar partida desde URL:', error);
            alert('Error al cargar la partida: ' + error.message);
        }
    }
})();

// ---------------------------
// RENDER DINÁMICO DE TABLERO Y RECINTOS
// ---------------------------

(function renderizarTablero(){
    const tablero = document.getElementById('tablero') || document.querySelector('.contenedor-tablero');
    if(!tablero) return;
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
    });
})();

// ---------------------------
// APLICAR LAYOUT JSON (posiciones y tamaños) EN TABLERO GENERAL
// ---------------------------

(function aplicarLayoutDesdeJSON(){
    const tablero = document.querySelector('.contenedor-tablero');
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
})();

