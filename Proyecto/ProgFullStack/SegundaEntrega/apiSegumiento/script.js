// ---------------------------
// VARIABLES GLOBALES
// ---------------------------
let cantRondas = 4;
let rondaActual = 1;
let historialMovimientos = [];
let puntajesPorRonda = {};
let estadoPorRonda = {};
let contadorEspecies = {};

let draggables = [
    { id: "tRex", img: "dinos/trex.png" },
    { id: "SPECIE_1", img: "dinos/specie1.png" },
    { id: "SPECIE_2", img: "dinos/specie2.png" },
    { id: "SPECIE_3", img: "dinos/specie3.png" },
    { id: "SPECIE_4", img: "dinos/specie4.png" },
    { id: "SPECIE_5", img: "dinos/specie5.png" }
];

// ---------------------------
// SELECTS RONDAS Y JUGADORES
// ---------------------------
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
        restaurarRonda();
        const check = document.getElementById("kingCheck");
        if (check) check.checked = false;
    });
}

// ---------------------------
// FUNCIONES DRAG & DROP
// ---------------------------
function generarDraggables() {
    const cont = document.getElementById("contenedor-dinosaurio");
    if (!cont) return;
    cont.innerHTML = "";

    draggables.forEach(d => {
        const div = document.createElement("div");
        div.className = "arrastrable";
        div.draggable = true;
        div.id = d.id;
        div.dataset.especie = d.id;
        div.innerHTML = `<img src="${d.img}">`;
        div.addEventListener("dragstart", dragStart);
        cont.appendChild(div);
        contadorEspecies[d.id] = 0;
    });
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

    if (contarDinosTablero() >= 6) { alert("Ya terminó la ronda, hay 6 dinosaurios en tablero"); return; }
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
            break;
        }
    }
    if (!puesto) alert("No hay espacio disponible en este recinto");
}

["KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER","SAME_FOREST","DIFFERENT_MEADOW"].forEach(id=>{
    const rec=document.getElementById(id);
    if(!rec) return;
    rec.addEventListener("dragover", e=>e.preventDefault());
    rec.addEventListener("drop", e=>dropRecinto(e,id));
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

        if(id==="KING"){ const check=document.getElementById("kingCheck"); if(slots.filter(s=>s.children.length>0).length===1 && check && check.checked) total+=7;}
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

    actualizarPuntaje(rondaActual,total);
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
}

function restaurarRonda(){
    historialMovimientos=[];
    const recintos=["SAME_FOREST","DIFFERENT_MEADOW","KING","TRIO_TREES","LONELY","LOVE_MEADOW","RIVER"];
    recintos.forEach(id=>{
        const rec=document.getElementById(id);
        if(!rec) return;
        const slots=Array.from(rec.querySelectorAll(".slot"));
        slots.forEach(s=>s.innerHTML='');
    });

    const estado=estadoPorRonda["Ronda "+rondaActual];
    if(estado){
        recintos.forEach(id=>{
            const rec=document.getElementById(id);
            if(!rec) return;
            if(estado[id]){
                const slots=Array.from(rec.querySelectorAll(".slot"));
                let slotIndex=0;
                estado[id].forEach(dId=>{
                    if(!dId) return;
                    const especie=draggables.find(d=>d.id===dId.replace(/_copy_\d+$/,''))?.id||dId;
                    const imgObj=draggables.find(d=>d.id===especie);
                    const div=document.createElement("div");
                    div.className="arrastrable";
                    div.draggable=true;
                    div.id=dId;
                    div.dataset.especie=especie;
                    div.innerHTML=`<img src="${imgObj?imgObj.img:'ACA VA EL LINK DE LA IMAGEN'}">`;
                    div.addEventListener("dragstart", dragStart);

                    if(slots.length>0){
                        while(slotIndex<slots.length && slots[slotIndex].children.length>0) slotIndex++;
                        if(slotIndex<slots.length) slots[slotIndex].appendChild(div);
                        else rec.appendChild(div);
                        slotIndex++;
                    } else rec.appendChild(div);
                });
            }
        });
    }
    generarDraggables();
    const check=document.getElementById("kingCheck");
    if(check) check.checked=false;
}

// ---------------------------
// FUNCIONES GUARDAR Y RESTAURAR EN DB
// ---------------------------

// ---------------------------
// FUNCIONES GUARDAR Y LISTAR PARTIDAS
// ---------------------------




async function guardarPartida() {
    guardarRonda(); // Calcula puntaje y estado

    const payload = {
        cantJugadores: parseInt(selectJugadores?.value) || 2,
        cantRondas: cantRondas,
        puntajesPorRonda,
        estado: estadoPorRonda
    };

    try {
        const res = await fetch("api/v1/partidas.php?action=guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

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
        const res = await fetch("api/v1/partidas.php?action=listar");
        const data = await res.json();

        if (!data.success) {
            alert("Error: " + data.message);
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
            div.textContent = `Partida #${p.id} - ${p.fecha} - ${p.cant_jugadores} jugadores`;

            div.addEventListener("click", () => cargarPartida(p));
            cont.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        alert("Error al cargar partidas: " + err.message);
    }
}

function cargarPartida(partida) {
    if (!partida) return;

    cantRondas = partida.cant_rondas || 4;
    puntajesPorRonda = partida.datos?.puntajesPorRonda || {};
    estadoPorRonda = partida.datos?.estado || {};
    if (selectJugadores) selectJugadores.value = partida.cant_jugadores || 2;

    actualizarRondas();
    inicializarPuntajes();
    restaurarRonda();
}








// ---------------------------
// BOTONES EN UI
// ---------------------------
document.getElementById("btnGuardarPartida")?.addEventListener("click", guardarPartida);
// document.getElementById("btnRestaurarPartida")?.addEventListener("click", restaurarPartida);
document.getElementById("btnRestaurarPartida")?.addEventListener("click", mostrarPartidas);


// ---------------------------
// INICIALIZACIÓN
// ---------------------------
generarDraggables();
inicializarPuntajes();
actualizarRondas();
