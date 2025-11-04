/* Selectores */
const $ = id => document.getElementById(id);
const kIn = $('k'), dLIn = $('dL'), mIn = $('m'), hIn = $('h'), gIn = $('g'), dtIn = $('dt');
const btnCalcular = $('calcular'), btnAnimar = $('animar'), salida = $('salida'), nota = $('nota');
const canvas = $('lienzo'), ctx = canvas.getContext('2d');

/* Lectura y cálculo */
function leerEntradas() {
    const k = parseFloat(kIn.value), dL = parseFloat(dLIn.value), m = parseFloat(mIn.value);
    const h = parseFloat(hIn.value), g = parseFloat(gIn.value), dt = parseFloat(dtIn.value);
    if ([k, dL, m, h, g, dt].some(x => !isFinite(x) || x < 0)) return null;
    return { k, dL, m, h, g, dt };
}
function calcularResultados(ins) {
    // Energías
    const E_el = 0.5 * ins.k * ins.dL * ins.dL; // energía elástica ½ k ΔL²
    const E_g = ins.m * ins.g * ins.h;         // energía potencial gravitatoria m g h
    const E_mec = E_el + E_g;                  // energía mecánica inicial

    // velocidad si toda la energía mecánica se convierte en cinética al liberar
    const v = Math.sqrt(2 * E_mec / ins.m);

    // tiempo y alcance (trayectoria desde la altura h con componente horizontal v)
    const tVuelo = Math.sqrt(2 * ins.h / ins.g);
    const alcance = v * tVuelo;

    // energía cinética calculada con v
    const Ec = 0.5 * ins.m * v * v;

    // fuerza máxima de compresión (k·ΔL)
    const Fmax = ins.k * ins.dL;

    return { E_el, E_g, E_mec, v, tVuelo, alcance, Ec, Fmax };
}

function fmt(n, d = 4) { return Number(n).toFixed(d).replace(/\.?0+$/, ''); }

/* Dibujo base */
function limpiar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#eaf6ff'); grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function dibujarSuelo() {
    ctx.fillStyle = '#f3f7f9';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.strokeStyle = '#d7e2ea'; ctx.beginPath(); ctx.moveTo(0, canvas.height - 80); ctx.lineTo(canvas.width, canvas.height - 80); ctx.stroke();
}
function rectRedondeado(x, y, w, h, r, relleno = true, contorno = false) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); if (relleno) ctx.fill(); if (contorno) ctx.stroke();
}
function dibujarResorte(x1, y1, x2, y2, vueltas = 8, ancho = 6) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux, paso = len / (vueltas * 2);
    ctx.lineWidth = ancho; ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(x1, y1);
    let signo = 1;
    for (let i = 1; i <= vueltas * 2; i++) { const t = i * paso; const cx = x1 + ux * t + nx * (signo * 12); const cy = y1 + uy * t + ny * (signo * 12); ctx.lineTo(cx, cy); signo *= -1; }
    ctx.lineTo(x2, y2); ctx.stroke();
    ctx.fillStyle = '#777'; ctx.beginPath(); ctx.arc(x1, y1, 6, 0, 2 * Math.PI); ctx.fill(); ctx.beginPath(); ctx.arc(x2, y2, 6, 0, 2 * Math.PI); ctx.fill();
}
function dibujarDado(cx, cy, tam, angulo = 0) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angulo);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 2; rectRedondeado(-tam / 2, -tam / 2, tam, tam, 8, true, true);
    ctx.fillStyle = '#111'; const gap = tam * 0.28;
    const pip = (x, y) => { ctx.beginPath(); ctx.arc(x, y, tam * 0.06, 0, 2 * Math.PI); ctx.fill(); };
    pip(-gap, -gap); pip(-gap, 0); pip(-gap, gap); pip(gap, -gap); pip(gap, 0); pip(gap, gap);
    ctx.restore();
}

/* Trayectoria relativa al extremo del resorte */
function generarTrayectoria(vx, vy0, h, g, dt) {
    const puntos = []; let t = 0;
    while (true) {
        const x = vx * t;
        const y = h + vy0 * t - 0.5 * g * t * t;
        puntos.push({ t, x, y });
        if (y <= 0 && t > 0) break;
        t += dt; if (t > 1000) break;
    }
    if (puntos.length >= 2) {
        const a = puntos[puntos.length - 2], b = puntos[puntos.length - 1];
        const alpha = a.y === b.y ? 1 : (a.y / (a.y - b.y));
        const xt = a.x + alpha * (b.x - a.x);
        puntos[puntos.length - 1] = { t: a.t + alpha * (b.t - a.t), x: xt, y: 0 };
    }
    return puntos;
}

/* Dibujo estático: resorte ubicado en la altura de salida h */
function dibujarEstatico(ins, res) {
    limpiar(); dibujarSuelo();
    const margen = 60;
    const baseYSuelo = canvas.height - 80;
    // escala px/m
    const maxXm = Math.max(res.alcance, 0.1);
    const maxYm = Math.max(ins.h, 0.1);
    const escalaX = (canvas.width - margen * 2) / maxXm;
    const escalaY = (canvas.height - margen * 2 - 80) / (maxYm + 0.1);
    const escala = Math.min(escalaX, escalaY);

    // calcular coordenadas del resorte en pixeles según h (resorte a la altura de salida)
    const baseX = margen + 20;
    const ySalidaPx = baseYSuelo - ins.h * escala; // aquí subo el resorte a la altura h
    const largoResorteReposoPx = 90;
    const compPx = largoResorteReposoPx - ins.dL * escala * 0.95;
    const inicioResorte = { x: baseX + 10, y: ySalidaPx };
    const extremoResorte = { x: baseX + 10 + compPx, y: ySalidaPx };

    // plataforma (flotante) y resorte
    ctx.fillStyle = '#ddeaf6'; ctx.fillRect(baseX - 20, ySalidaPx + 10, 220, 10);
    ctx.strokeStyle = '#c5d5e6'; ctx.strokeRect(baseX - 20, ySalidaPx + 10, 220, 10);
    dibujarResorte(inicioResorte.x, inicioResorte.y, extremoResorte.x, extremoResorte.y, 9, 6);

    // dado apoyado en extremo del resorte
    const tamDado = 36;
    const dadoCx = extremoResorte.x + tamDado / 2 + 6;
    const dadoCy = ySalidaPx - tamDado / 2;
    dibujarDado(dadoCx, dadoCy, tamDado, -0.15);

    // trayectoria relativa al extremoResorte
    const puntos = generarTrayectoria(res.v, 0, ins.h, ins.g, ins.dt);
    ctx.beginPath(); ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.strokeStyle = '#2b6dad';
    for (let i = 0; i < puntos.length; i++) {
        const px = extremoResorte.x + puntos[i].x * escala;
        const py = canvas.height - 80 - puntos[i].y * escala;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // marcador de caída
    const ultimo = puntos[puntos.length - 1];
    const fx = extremoResorte.x + ultimo.x * escala;
    ctx.fillStyle = '#0b7'; ctx.beginPath(); ctx.arc(fx, canvas.height - 80 - 6, 6, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = '#223'; ctx.font = '13px Inter';
    ctx.fillText(`Alcance ≈ ${fmt(res.alcance, 3)} m`, fx + 8, canvas.height - 80 - 10);
    nota.textContent = `Resorte colocado a la altura h=${ins.h} m. Escala ≈ ${fmt(escala, 3)} px/m. ΔL=${ins.dL} m`;
}

/* Animación: resorte en la altura de salida y lanzamiento desde ahí */
let raf = null;
function animarLanzamiento(ins, res) {
    cancelAnimationFrame(raf);
    limpiar(); dibujarSuelo();
    const margen = 60;
    const baseYSuelo = canvas.height - 80;
    const maxXm = Math.max(res.alcance, 0.1);
    const maxYm = Math.max(ins.h, 0.1);
    const escalaX = (canvas.width - margen * 2) / maxXm;
    const escalaY = (canvas.height - margen * 2 - 80) / (maxYm + 0.1);
    const escala = Math.min(escalaX, escalaY);

    const baseX = margen + 20;
    const ySalidaPx = baseYSuelo - ins.h * escala;
    const largoResorteReposoPx = 90;
    const compPxFinal = largoResorteReposoPx - ins.dL * escala * 0.95;
    const inicioResorte = { x: baseX + 10, y: ySalidaPx };

    const tiempoCompresion = 450;
    const tiempoMantener = 200;
    const tiempoLiberar = tiempoCompresion + tiempoMantener;

    const puntosTray = generarTrayectoria(res.v, 0, ins.h, ins.g, ins.dt);
    const inicio = performance.now();

    function cuadro(now) {
        const t = now - inicio;
        // compresión easing
        let compPxActual;
        if (t < tiempoCompresion) {
            const p = t / tiempoCompresion;
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            compPxActual = largoResorteReposoPx - ease * (largoResorteReposoPx - compPxFinal);
        } else compPxActual = compPxFinal;
        const extremoResorte = { x: inicioResorte.x + compPxActual, y: inicioResorte.y };

        limpiar(); dibujarSuelo();
        // plataforma a la altura de salida
        ctx.fillStyle = '#ddeaf6'; ctx.fillRect(baseX - 20, ySalidaPx + 10, 220, 10);
        ctx.strokeStyle = '#c5d5e6'; ctx.strokeRect(baseX - 20, ySalidaPx + 10, 220, 10);
        dibujarResorte(inicioResorte.x, inicioResorte.y, extremoResorte.x, extremoResorte.y, 9, 6);

        // determinar tiempo de vuelo desde liberación
        let tiempoVuelo = 0;
        if (t > tiempoLiberar) tiempoVuelo = (t - tiempoLiberar) / 1000;

        // posición del dado
        let cx = extremoResorte.x + 20;
        let cy = ySalidaPx - 18;
        let ang = -0.15;
        if (tiempoVuelo > 0) {
            let idx = 0;
            while (idx < puntosTray.length && puntosTray[idx].t < tiempoVuelo) idx++;
            idx = Math.min(idx, puntosTray.length - 1);
            const p = puntosTray[idx];
            cx = extremoResorte.x + p.x * escala;
            cy = canvas.height - 80 - p.y * escala - 18;
            ang = -0.15 + tiempoVuelo * 6;
        }

        dibujarDado(cx, cy, 36, ang);

        // traza parcial
        ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = '#2b6dad';
        for (let i = 0; i < puntosTray.length; i++) {
            if (puntosTray[i].t > tiempoVuelo) break;
            const px = extremoResorte.x + puntosTray[i].x * escala;
            const py = canvas.height - 80 - puntosTray[i].y * escala;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // marcador de caída final
        const ultimo = puntosTray[puntosTray.length - 1];
        const fx = extremoResorte.x + ultimo.x * escala;
        ctx.fillStyle = '#0b7'; ctx.beginPath(); ctx.arc(fx, canvas.height - 80 - 6, 6, 0, 2 * Math.PI); ctx.fill();

        ctx.fillStyle = '#0b1220'; ctx.font = '13px Inter';
        ctx.fillText(`Tiempo de Vuelo Estimado ${fmt(res.tVuelo, 3)} s`, 12, 20);

        if (t < tiempoLiberar + res.tVuelo * 1000 + 400) raf = requestAnimationFrame(cuadro);
        else nota.textContent = `Animación completa. Alcance ≈ ${fmt(res.alcance, 3)} m`;
    }

    raf = requestAnimationFrame(cuadro);
}

/* Eventos UI */
btnCalcular.addEventListener('click', () => {
    const ins = leerEntradas();
    if (!ins) { salida.innerHTML = '<b>Error:</b> revisa entradas numéricas positivas.'; return; }
    const res = calcularResultados(ins);

    salida.innerHTML = `
  <b>Resultados</b><br>
  Energía potencial elástica: E<sub>el</sub> = ${fmt(res.E_el)} J<br>
  Energía potencial gravitatoria: E<sub>g</sub> = ${fmt(res.E_g)} J<br>
  Energía mecánica inicial: E<sub>mec</sub> = ${fmt(res.E_mec)} J<br>
  Energía cinética del dado al liberarse (teórica): E<sub>c</sub> = ½·m·v² = ${fmt(res.Ec)} J<br>
  Velocidad inicial del dado: v₀ = ${fmt(res.v)} m/s<br>
  Fuerza máxima aplicada por el resorte (estimada): F = ${fmt(res.Fmax)} N<br>
  Tiempo de vuelo desde altura h: t = ${fmt(res.tVuelo)} s<br>
  Distancia horizontal alcanzada: d ≈ ${fmt(res.alcance)} m`;

    dibujarEstatico(ins, res);
});

btnAnimar.addEventListener('click', () => {
    const ins = leerEntradas();
    if (!ins) { salida.innerHTML = '<b>Error:</b> revisa entradas numéricas positivas.'; return; }
    const res = calcularResultados(ins);
    salida.innerHTML = `<b>Animando lanzamiento del dado</b><br>
Velocidad inicial: v₀ = ${fmt(res.v)} m/s<br>
Alcance aproximado: d ≈ ${fmt(res.alcance)} m`;

    animarLanzamiento(ins, res);
});

/* inicio */
btnCalcular.click();