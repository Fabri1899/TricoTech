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

let draggables = [
    { id: "tRex", img: "http://localhost:8012/Tricosaurus/assets/images/dinos/tRex.png" },
    { id: "SPECIE_1", img: "http://localhost:8012/Tricosaurus/assets/images/dinos/specie1.png" },
    { id: "SPECIE_2", img: "http://localhost:8012/Tricosaurus/assets/images/dinos/specie2.png" },
    { id: "SPECIE_3", img: "http://localhost:8012/Tricosaurus/assets/images/dinos/specie3.png" },
    { id: "SPECIE_4", img: "http://localhost:8012/Tricosaurus/assets/images/dinos/specie4.png" },
    { id: "SPECIE_5", img: "http://localhost:8012/Tricosaurus/assets/images/dinos/specie5.png" }
];

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
    if(check) check.checked = !!kingPorRonda["Ronda "+rondaActual];
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
        const res = await fetch("http://localhost:8012/Tricosaurus/src/controllers/PartidaController.php?action=guardar", {
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
    const res = await fetch("http://localhost:8012/Tricosaurus/src/controllers/PartidaController.php?action=listar", { credentials: 'include' });
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
    kingPorRonda = partida.datos?.kingPorRonda || {};
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
generarDraggables();
inicializarPuntajes();
actualizarRondas();

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

