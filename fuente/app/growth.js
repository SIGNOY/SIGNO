/* ---------- Curvas de crecimiento OMS (028A1 · 028B1 · 028B2 · 028C1 · 028C2) ----------
   Datos: Patrones de Crecimiento Infantil OMS 2006 (0–5 años) y Referencia OMS 2007 (5–19 años), tablas LMS oficiales. */
const GROWTH = __GROWTH__;
const GR = (() => {
  const RANGES = {
    r1: { t: "0 a 6 meses", x0: 0, x1: 0.5, unit: "m", forms: "028A1 · 028B1/B2", ind: ["wfa", "lhfa", "hc"] },
    r2: { t: "6 meses a 2 años", x0: 0.5, x1: 2, unit: "m", forms: "028B1/B2", ind: ["wfa", "lhfa", "hc", "wfl"] },
    r3: { t: "2 a 5 años", x0: 2, x1: 5, unit: "y", forms: "028B1/B2", ind: ["wfa", "lhfa", "wfh", "bmi"] },
    r4: { t: "5 a 10 años", x0: 5, x1: 10, unit: "y", forms: "028C1/C2", ind: ["wfa", "lhfa", "bmi"] },
  };
  const NAME = {
    wfa: "Peso para la edad", lhfa: (r) => (r.x1 <= 2 ? "Longitud para la edad" : "Talla para la edad"), hc: "Perímetro cefálico para la edad",
    wfl: "Peso para la longitud", wfh: "Peso para la talla", bmi: "IMC para la edad",
  };
  const UNIT = { wfa: "kg", lhfa: "cm", hc: "cm", wfl: "kg", wfh: "kg", bmi: "kg/m²" };
  const lms = (tab, x) => {
    if (x <= tab[0][0]) return tab[0].slice(1);
    for (let i = 1; i < tab.length; i++) if (tab[i][0] >= x) {
      const a = tab[i - 1], b = tab[i], f = (x - a[0]) / (b[0] - a[0]);
      return [a[1] + f * (b[1] - a[1]), a[2] + f * (b[2] - a[2]), a[3] + f * (b[3] - a[3])];
    }
    return tab[tab.length - 1].slice(1);
  };
  const val = (L, M, S, z) => (L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L));
  function z(sex, ind, x, y) {
    const tab = GROWTH[sex] && GROWTH[sex][ind]; if (!tab || !(y > 0)) return null;
    if (x < tab[0][0] - 1e-6 || x > tab[tab.length - 1][0] + 1e-6) return null;
    const [L, M, S] = lms(tab, x);
    let zz = L === 0 ? Math.log(y / M) / S : (Math.pow(y / M, L) - 1) / (L * S);
    if (ind !== "lhfa" && ind !== "hc") { // ajuste OMS para |z| > 3
      const sd3 = val(L, M, S, 3), sd2 = val(L, M, S, 2), sd_3 = val(L, M, S, -3), sd_2 = val(L, M, S, -2);
      if (zz > 3) zz = 3 + (y - sd3) / (sd3 - sd2);
      else if (zz < -3) zz = -3 + (y - sd_3) / (sd_2 - sd_3);
    }
    return Math.round(zz * 100) / 100;
  }
  function interp(ind, zz, age) {
    if (zz == null) return "";
    if (ind === "wfa") return zz < -3 ? "Bajo peso severo" : zz < -2 ? "Bajo peso" : zz > 2 ? "Peso elevado para la edad (valorar IMC o P/T)" : "Normal";
    if (ind === "lhfa") return zz < -3 ? "Baja talla severa" : zz < -2 ? "Baja talla" : zz > 3 ? "Muy alto para la edad" : "Normal";
    if (ind === "hc") return zz < -2 ? "Perímetro cefálico bajo (< −2 DE)" : zz > 2 ? "Perímetro cefálico alto (> +2 DE)" : "Normal";
    if (ind === "bmi" && age >= 5) return zz < -3 ? "Delgadez severa" : zz < -2 ? "Delgadez" : zz > 2 ? "Obesidad" : zz > 1 ? "Sobrepeso" : "Normal";
    return zz < -3 ? "Emaciación severa" : zz < -2 ? "Emaciación" : zz > 3 ? "Obesidad" : zz > 2 ? "Sobrepeso" : zz > 1 ? "Posible riesgo de sobrepeso" : "Normal";
  }
  const ageY = (nac, f) => (new Date(f + "T00:00") - new Date(nac + "T00:00")) / (365.25 * 864e5);
  const ageTxt = (a) => { const m = Math.floor(a * 12 + 1e-6), d = Math.round((a * 365.25) - m * 30.4375); return a < 2 ? `${m} m${d > 0 ? " " + d + " d" : ""}` : `${Math.floor(a)} a ${m % 12} m`; };
  function rangeFor(a) { return a < 0.5 ? "r1" : a < 2 ? "r2" : a < 5 ? "r3" : "r4"; }
  // puntos del paciente para un indicador
  function points(ind, sex, nac, med, r) {
    const out = [];
    (med || []).forEach((m) => {
      if (!m.fecha || !nac) return;
      const a = ageY(nac, m.fecha), w = parseFloat(String(m.peso || "").replace(",", ".")), h = parseFloat(String(m.talla || "").replace(",", ".")), pc = parseFloat(String(m.pc || "").replace(",", "."));
      let x, y;
      if (ind === "wfa") { x = a; y = w; } else if (ind === "lhfa") { x = a; y = h; } else if (ind === "hc") { x = a; y = pc; }
      else if (ind === "bmi") { x = a; y = w > 0 && h > 0 ? w / Math.pow(h / 100, 2) : NaN; }
      else if (ind === "wfl" || ind === "wfh") { x = h; y = w; if (!(a >= r.x0 - 0.01 && a <= r.x1 + 0.01)) return; }
      if (!(y > 0) || !(x >= 0)) return;
      if (ind !== "wfl" && ind !== "wfh" && (a < r.x0 - 0.01 || a > r.x1 + 0.01)) return;
      out.push({ x, y: Math.round(y * 100) / 100, a, fecha: m.fecha, z: z(sex, ind, x, y) });
    });
    return out;
  }
  const nice = (lo, hi, n) => { const raw = (hi - lo) / n, p = Math.pow(10, Math.floor(Math.log10(raw))), st = [1, 2, 2.5, 5, 10].map((k) => k * p).find((k) => k >= raw); return st; };
  // gráfico SVG de un indicador
  function chart(ind, sex, r, pts, W, H) {
    const tab = GROWTH[sex][ind], isLen = ind === "wfl" || ind === "wfh";
    let x0 = r.x0, x1 = r.x1;
    if (isLen) { x0 = ind === "wfl" ? (r.x0 >= 0.5 ? 60 : 45) : 65; x1 = ind === "wfl" ? (r.x0 >= 0.5 ? 95 : 70) : 120; }
    const Z = [-3, -2, -1, 0, 1, 2, 3], col = { "-3": "#000", "-2": "#c62828", "-1": "#e0a000", "0": "#2e7d32", "1": "#e0a000", "2": "#c62828", "3": "#000" };
    const lines = Z.map((zz) => { const a = []; const n = 120; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; if (x < tab[0][0] - 1e-6 || x > tab[tab.length - 1][0] + 1e-6) continue; const [L, M, S] = lms(tab, x); a.push([x, val(L, M, S, zz)]); } return [zz, a]; });
    let ylo = Infinity, yhi = -Infinity;
    lines.forEach(([, a]) => a.forEach((q) => { ylo = Math.min(ylo, q[1]); yhi = Math.max(yhi, q[1]); }));
    pts.forEach((p) => { ylo = Math.min(ylo, p.y); yhi = Math.max(yhi, p.y); });
    const ys = nice(ylo, yhi, 10); ylo = Math.floor(ylo / ys) * ys; yhi = Math.ceil(yhi / ys) * ys;
    const ml = 46, mr = 40, mt = 10, mb = 34, pw = W - ml - mr, ph = H - mt - mb;
    const X = (x) => ml + (x - x0) / (x1 - x0) * pw, Y = (y) => mt + ph - (y - ylo) / (yhi - ylo) * ph;
    let g = `<rect x="${ml}" y="${mt}" width="${pw}" height="${ph}" fill="#fff" stroke="#555" stroke-width="1"/>`;
    // cuadrícula
    const ysm = ys / 5;
    for (let y = ylo; y <= yhi + 1e-9; y += ysm) { const major = Math.abs(y / ys - Math.round(y / ys)) < 1e-6; g += `<line x1="${ml}" x2="${ml + pw}" y1="${Y(y).toFixed(1)}" y2="${Y(y).toFixed(1)}" stroke="${major ? "#b8c4cc" : "#e6ecef"}" stroke-width="${major ? 0.8 : 0.5}"/>`; if (major) g += `<text x="${ml - 5}" y="${(Y(y) + 3).toFixed(1)}" text-anchor="end" font-size="9">${+y.toFixed(1)}</text><text x="${ml + pw + 5}" y="${(Y(y) + 3).toFixed(1)}" font-size="9">${+y.toFixed(1)}</text>`; }
    let ticks = [];
    if (isLen) { for (let x = x0; x <= x1 + 1e-9; x += 1) ticks.push([x, x % 5 === 0, x % 5 === 0 ? String(x) : ""]); }
    else if (r.unit === "m") { const m0 = Math.round(x0 * 12), m1 = Math.round(x1 * 12); const step = m1 - m0 <= 6 ? 1 / 4.348 / 12 : 1 / 12; for (let x = x0; x <= x1 + 1e-9; x += step) { const mm = x * 12, isM = Math.abs(mm - Math.round(mm)) < 0.02; ticks.push([x, isM, isM ? String(Math.round(mm)) : ""]); } }
    else { for (let mm = Math.round(x0 * 12); mm <= Math.round(x1 * 12); mm++) { const x = mm / 12; ticks.push([x, mm % 12 === 0, mm % 12 === 0 ? `${mm / 12} años` : mm % 6 === 0 ? "6m" : ""]); } }
    ticks.forEach(([x, major, lab]) => { g += `<line x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" y1="${mt}" y2="${mt + ph}" stroke="${major ? "#b8c4cc" : "#eef2f4"}" stroke-width="${major ? 0.8 : 0.5}"/>`; if (lab) g += `<text x="${X(x).toFixed(1)}" y="${mt + ph + 12}" text-anchor="middle" font-size="9">${lab}</text>`; });
    const xl = isLen ? (ind === "wfl" ? "Longitud (cm)" : "Talla (cm)") : r.unit === "m" ? "Edad (meses cumplidos)" : "Edad (años y meses cumplidos)";
    g += `<text x="${ml + pw / 2}" y="${H - 6}" text-anchor="middle" font-size="10" font-weight="700">${xl}</text>`;
    g += `<text transform="translate(11 ${mt + ph / 2}) rotate(-90)" text-anchor="middle" font-size="10" font-weight="700">${NAME[ind] === NAME.bmi ? "IMC (kg/m²)" : ind === "lhfa" || ind === "hc" ? (ind === "hc" ? "Perímetro cefálico (cm)" : (r.x1 <= 2 ? "Longitud (cm)" : "Talla (cm)")) : "Peso (kg)"}</text>`;
    // curvas z
    lines.forEach(([zz, a]) => { if (!a.length) return; g += `<polyline fill="none" stroke="${col[zz]}" stroke-width="${zz === 0 ? 1.6 : Math.abs(zz) === 1 ? 0.9 : 1.3}"${Math.abs(zz) === 1 ? ' stroke-dasharray="4 3"' : ""} points="${a.map((q) => X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1)).join(" ")}"/>`;
      const q = a[a.length - 1]; g += `<text x="${(X(q[0]) - 3).toFixed(1)}" y="${(Y(q[1]) - 3).toFixed(1)}" text-anchor="end" font-size="8.5" font-weight="700" fill="${col[zz]}">${zz > 0 ? "+" + zz : zz}</text>`; });
    // puntos del paciente
    const P = pts.filter((p) => p.x >= x0 - 1e-6 && p.x <= x1 + 1e-6).sort((a, b) => a.x - b.x);
    if (P.length > 1 && !isLen) g += `<polyline fill="none" stroke="#0b3d91" stroke-width="1.6" points="${P.map((p) => X(p.x).toFixed(1) + "," + Y(p.y).toFixed(1)).join(" ")}"/>`;
    P.forEach((p) => { g += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.4" fill="#0b3d91" stroke="#fff" stroke-width="1"/>`; });
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Arial,Helvetica,sans-serif" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
  }
  // páginas A4 (dos gráficos por hoja)
  function pages(p, med, rk, opts) {
    opts = opts || {};
    const sex = p.sexo === "Masculino" ? "M" : "F", r = RANGES[rk], col = sex === "M" ? "#1f6fb2" : "#c2185b", bg = sex === "M" ? "#e3f0fb" : "#fde7f0";
    const out = [], ind = r.ind.slice();
    for (let i = 0; i < ind.length; i += 2) {
      const pg = document.createElement("div"); pg.className = "mspp grpage"; pg.setAttribute("data-orient", "portrait"); pg.setAttribute("data-code", "CURVAS");
      pg.style.width = (210 * 96 / 25.4) + "px"; pg.style.height = (297 * 96 / 25.4) + "px";
      const blocks = ind.slice(i, i + 2).map((k) => {
        const pts = points(k, sex, p.nac, med, r), nm = typeof NAME[k] === "function" ? NAME[k](r) : NAME[k];
        const rows = pts.slice(-6).map((q) => `<tr><td>${fmt(q.fecha)}</td><td>${ageTxt(q.a)}</td><td>${k === "wfl" || k === "wfh" ? q.x + " cm → " : ""}${q.y} ${UNIT[k]}</td><td><b>${q.z == null ? "—" : (q.z > 0 ? "+" : "") + q.z.toFixed(2)}</b></td><td>${interp(k, q.z, q.a)}</td></tr>`).join("");
        return `<div class="grb"><div class="grt" style="background:${col}">${nm.toUpperCase()} · ${sex === "M" ? "NIÑOS" : "NIÑAS"} · ${r.t.toUpperCase()} <span>puntuación z</span></div>
          ${chart(k, sex, r, pts, 700, 330)}
          <table class="grtab"><thead><tr><th>Fecha</th><th>Edad</th><th>Medida</th><th>Z</th><th>Interpretación</th></tr></thead><tbody>${rows || `<tr><td colspan="5" style="text-align:center;color:#777">Sin medidas en este rango de edad</td></tr>`}</tbody></table></div>`;
      }).join("");
      const ed = p.nac ? ageTxt(ageY(p.nac, opts.fecha || today())) : "";
      pg.innerHTML = `<div class="grin">
        <table class="grhd" style="--c:${col};--b:${bg}"><tr><th colspan="6">A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE</th></tr>
          <tr><td><small>ESTABLECIMIENTO</small>${esc(UP(DB.settings.estab))}</td><td><small>APELLIDOS</small>${esc([p.ap1, p.ap2].filter(Boolean).join(" "))}</td><td><small>NOMBRES</small>${esc([p.n1, p.n2].filter(Boolean).join(" "))}</td>
          <td><small>N.º HISTORIA CLÍNICA</small>${esc(p.hcu || p.cedula || "")}</td><td><small>FECHA NACIMIENTO</small>${esc(p.nac ? fmt(p.nac) : "")}</td><td><small>EDAD</small>${esc(ed)}</td></tr></table>
        <div class="grttl" style="color:${col}">CURVAS DE CRECIMIENTO · ${sex === "M" ? "NIÑOS" : "NIÑAS"} DE ${r.t.toUpperCase()}</div>
        ${blocks}
        <div class="grft"><span>SNS-MSP/HCU-form.${r.forms}/2021 · Patrones de Crecimiento Infantil OMS 2006${r.x0 >= 5 ? " / Referencia OMS 2007" : ""}</span><span>0 mediana (verde) · ±1 DE punteado · ±2 DE rojo · ±3 DE negro</span></div></div>`;
      out.push(pg);
    }
    return out;
  }
  return { RANGES, z, pages, rangeFor, ageY, interp };
})();

/* panel de medidas del paciente para las curvas */
function growthPanel(at) {
  const el = document.createElement("div"); el.className = "cvp";
  const p0 = (at && at.patient) || {};
  const stored = p0.cedula && DB.patients[p0.cedula] && DB.patients[p0.cedula].medidas;
  let med = JSON.parse(JSON.stringify(stored || []));
  if (at && at.id && at.vit && (at.vit.peso || at.vit.talla || at.vit.pc) && !med.some((m) => m.fecha === at.fecha)) med.push({ fecha: at.fecha, peso: at.vit.peso, talla: at.vit.talla, pc: at.vit.pc || "" });
  med.sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const age = p0.nac ? GR.ageY(p0.nac, (at && at.fecha) || today()) : 1;
  const row = (m) => `<tr><td><input type="date" data-c="fecha" value="${esc(m.fecha || "")}"></td><td><input data-c="peso" value="${esc(m.peso || "")}" placeholder="kg"></td><td><input data-c="talla" value="${esc(m.talla || "")}" placeholder="cm"></td><td><input data-c="pc" value="${esc(m.pc || "")}" placeholder="cm"></td><td><button type="button" class="btn d sm" aria-label="Quitar">✕</button></td></tr>`;
  el.innerHTML = `<div class="row" style="justify-content:space-between"><b>Curvas de crecimiento OMS · medidas del paciente</b><span class="hint">Las medidas se guardan en la ficha del paciente y se acumulan en cada control.</span></div>
    <div class="row" style="margin:8px 0">
      <label style="flex-direction:row;align-items:center;gap:6px">Sexo<select data-sx><option${p0.sexo !== "Masculino" ? " selected" : ""}>Femenino</option><option${p0.sexo === "Masculino" ? " selected" : ""}>Masculino</option></select></label>
      <label style="flex-direction:row;align-items:center;gap:6px">Nacimiento<input type="date" data-nac value="${esc(p0.nac || "")}"></label>
      <label style="flex-direction:row;align-items:center;gap:6px">Curvas<select data-rg>${Object.entries(GR.RANGES).map(([k, r]) => `<option value="${k}"${GR.rangeFor(age) === k ? " selected" : ""}>${r.t}</option>`).join("")}<option value="all">Todas</option></select></label></div>
    <table class="t cvt"><thead><tr><th>Fecha</th><th>Peso (kg)</th><th>Longitud / talla (cm)</th><th>Perímetro cefálico (cm)</th><th></th></tr></thead><tbody>${med.map(row).join("")}</tbody></table>
    <div class="row" style="margin-top:8px"><button type="button" class="btn s sm" data-add>+ Agregar medida</button>${age >= 10 ? '<span class="hint warnt">El paciente tiene 10 años o más: las curvas OMS de este formulario llegan a los 10 años.</span>' : ""}</div>`;
  const tb = $("tbody", el), host = document.createElement("div"); el._host = host;
  el._read = () => $$("tr", tb).map((r) => Object.fromEntries($$("[data-c]", r).map((i) => [i.dataset.c, i.value.trim()]))).filter((m) => m.fecha && (m.peso || m.talla || m.pc));
  el._patient = () => Object.assign({}, p0, { sexo: $("[data-sx]", el).value, nac: $("[data-nac]", el).value });
  el._draw = () => {
    const p = el._patient(), rg = $("[data-rg]", el).value, med2 = el._read();
    host.innerHTML = "";
    (rg === "all" ? Object.keys(GR.RANGES) : [rg]).forEach((k) => GR.pages(p, med2, k, { fecha: (at && at.fecha) || today() }).forEach((pg) => host.appendChild(pg)));
  };
  const wire = (r) => { $("button", r).onclick = () => { r.remove(); el._draw(); }; };
  $$("tr", tb).forEach(wire);
  el.addEventListener("input", el._draw); el.addEventListener("change", el._draw);
  $("[data-add]", el).onclick = () => { tb.insertAdjacentHTML("beforeend", row({ fecha: today() })); wire(tb.lastElementChild); $("[data-c=peso]", tb.lastElementChild).focus(); };
  el._save = () => { const p = el._patient(); if (p.cedula && DB.patients[p.cedula]) { DB.patients[p.cedula].medidas = el._read(); if (!DB.patients[p.cedula].nac && p.nac) DB.patients[p.cedula].nac = p.nac; save(); } };
  return el;
}
