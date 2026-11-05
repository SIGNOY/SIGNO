/* ---------- Medicina ocupacional · Acuerdo Ministerial 00025-2025 (MSP) ----------
   Formulario de Evaluación Médica Ocupacional (FEMO, SNS-MSP/HCU-form.123/2025) y sus anexos, que se aplican
   en este orden (Disposición General Primera): i) Acuerdo de confidencialidad, ii) Autorización para el
   tratamiento de datos personales, iii) Certificado de Evaluación Médica Ocupacional (SNS-MSP/Form.HCU081/2025). */
FORMS.FEMO = "Formulario de Evaluación Médica Ocupacional (FEMO · AM 00025-2025)";
FORMS.CEMO = "Certificado de Evaluación Médica Ocupacional (AM 00025-2025)";
FORMS.OCCONF = "Acuerdo de confidencialidad de la evaluación ocupacional (Anexo 4, AM 00025-2025)";
FORMS.OCAUT = "Autorización del tratamiento de datos en salud ocupacional (Anexo 5, AM 00025-2025)";
const OC_HEAD = { FEMO: "SNS-MSP/HCU-form.123/2025", CEMO: "SNS-MSP/Form.HCU081/2025", OCCONF: "Anexo 4 · AM 00025-2025", OCAUT: "Anexo 5 · AM 00025-2025" };
const OC_TIPOS = [["INGRESO", "Inicio (ingreso)"], ["PERIODICO", "Periódica"], ["REINTEGRO", "Reintegro"], ["RETIRO", "Retiro"]];
const OC_TIPO_TXT = { INGRESO: "Ingreso", PERIODICO: "Periódica", REINTEGRO: "Reintegro", RETIRO: "Retiro" };
const OC_APT = ["APTO", "APTO EN OBSERVACIÓN", "APTO CON LIMITACIONES", "NO APTO"];
const OC_APT_INFO = {
  "APTO": "Puede desempeñar su tarea habitual sin ninguna restricción física ni laboral.",
  "APTO EN OBSERVACIÓN": "Desempeña sus funciones habituales bajo vigilancia médica, hasta determinar su aptitud definitiva.",
  "APTO CON LIMITACIONES": "Desempeña su tarea con limitaciones personales y/o laborales (adaptativas o restrictivas).",
  "NO APTO": "El desempeño de la tarea implica problemas serios para su salud o esta le imposibilita realizarla.",
};
// filas de la hoja 2 (bloque G) · [título, clave, [[fila, factor]], fila «Otros»]
const OC_RISK = [
  ["Físico", "fis", [[6, "Temperaturas altas"], [7, "Temperaturas bajas"], [8, "Radiación ionizante"], [9, "Radiación no ionizante"], [10, "Ruido"], [11, "Vibración"], [12, "Iluminación"], [13, "Ventilación"], [14, "Fluido eléctrico"]], 15],
  ["De seguridad", "seg", [[16, "Locativos: falta de señalización, aseo, desorden"], [17, "Atrapamiento entre máquinas y/o superficies"], [18, "Atrapamiento entre objetos"], [19, "Caída de objetos"], [20, "Caídas al mismo nivel"], [21, "Caídas a diferente nivel"], [22, "Pinchazos"], [23, "Cortes"], [24, "Choques / colisión vehicular"], [25, "Atropellamientos por vehículos"], [26, "Proyección de fluidos"], [27, "Proyección de partículas – fragmentos"], [28, "Contacto con superficies de trabajo"], [29, "Eléctricos: contacto eléctrico"]], 30],
  ["Químico", "qui", [[31, "Polvos"], [32, "Sólidos"], [33, "Humos"], [34, "Líquidos"], [35, "Vapores"], [36, "Aerosoles"], [37, "Neblinas"], [38, "Gaseosos"]], 39],
  ["Biológico", "bio", [[40, "Virus"], [41, "Hongos"], [42, "Bacterias"], [43, "Parásitos"], [44, "Exposición a vectores"], [45, "Exposición a animales selváticos"]], 46],
  ["Ergonómico", "erg", [[47, "Manejo manual de cargas"], [48, "Movimientos repetitivos"], [49, "Posturas forzadas"], [50, "Trabajo con PVD (pantallas)"], [51, "Diseño inadecuado del puesto"]], 52],
  ["Psicosocial", "psi", [[53, "Monotonía del trabajo"], [54, "Sobrecarga laboral"], [55, "Minuciosidad de la tarea"], [56, "Alta responsabilidad"], [57, "Autonomía en la toma de decisiones"], [58, "Supervisión y estilos de dirección deficiente"], [59, "Conflicto de rol"], [60, "Falta de claridad en las funciones"], [61, "Incorrecta distribución del trabajo"], [62, "Turnos rotativos"], [63, "Relaciones interpersonales"], [64, "Inestabilidad laboral"], [65, "Amenaza delincuencial"]], 66],
];
const OC_ACOL = ["G", "I", "K", "M", "N", "O", "P"]; // columnas de las actividades 1 a 7 (hoja 2)
// bloque F · examen físico regional: [región, [[celda, hallazgo]]]
const OC_EXF = [
  ["1. Piel", [["H60", "a. Cicatrices"], ["H62", "b. Piel y faneras"]]],
  ["2. Ojos", [["H64", "a. Párpados"], ["H65", "b. Conjuntivas"], ["H66", "c. Pupilas"], ["H67", "d. Córnea"], ["H69", "e. Motilidad"]]],
  ["3. Oído", [["T60", "a. C. auditivo externo"], ["T61", "b. Pabellón"], ["T63", "c. Tímpanos"]]],
  ["4. Orofaringe", [["T64", "a. Labios"], ["T65", "b. Lengua"], ["T66", "c. Faringe"], ["T67", "d. Amígdalas"], ["T69", "e. Dentadura"]]],
  ["5. Nariz", [["AC60", "a. Tabique"], ["AC61", "b. Cornetes"], ["AC63", "c. Mucosas"], ["AC64", "d. Senos paranasales"]]],
  ["6. Cuello", [["AC65", "a. Tiroides / masas"], ["AC66", "b. Movilidad"]]],
  ["7. Tórax", [["AC67", "a. Mamas"], ["AC70", "b. Corazón"]]],
  ["8. Tórax", [["AJ60", "a. Pulmones"], ["AJ61", "b. Corazón"], ["AJ62", "c. Parrilla costal"]]],
  ["9. Abdomen", [["AJ63", "a. Vísceras"], ["AJ64", "b. Pared abdominal"]]],
  ["10. Columna", [["AJ65", "a. Flexibilidad"], ["AJ67", "b. Desviación"], ["AJ69", "c. Dolor"]]],
  ["11. Pelvis", [["BF60", "a. Pelvis"], ["BF61", "b. Genitales"]]],
  ["12. Extremidades", [["BF63", "a. Vascular"], ["BF64", "b. Miembros superiores"], ["BF65", "c. Miembros inferiores"]]],
  ["13. Neurológico", [["BF66", "a. Fuerza"], ["BF67", "b. Sensibilidad"], ["BF68", "c. Marcha"], ["BF69", "d. Reflejos"]]],
];
const OC_CARGOS = ["el médico", "la médica", "el enfermero", "la enfermera", "el psicólogo", "la psicóloga", "el odontólogo", "la odontóloga", "el trabajador social", "la trabajadora social"];
const OC_SANGRE = ["", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const ymd = (iso) => (iso ? String(iso).replace(/-/g, "/") : "");
const ocEmpKey = (e) => (e && (String(e.ruc || "").replace(/\D/g, "") || UP(e.nombre || "").trim())) || "";
function ocInit() { DB.ocup = DB.ocup || []; DB.empresas = DB.empresas || {}; }
const ocNew = () => ({ kind: "ocup", tipo: "INGRESO", fecha: today(), emp: {}, patient: {}, prior: {}, vit: {}, exf: {}, rg: {}, rgo: {}, acts: [], med7: [], hist: [], extra: [], exams: [], dx: [], go: { ex: [] }, rm: { ex: [] }, cons: {}, af: [], meds: [], ret: {}, conf: {}, cert: { copias: 2 }, manual: {} });

/* ---------- llenado de las celdas oficiales ---------- */
function ocMap(code, ev) {
  const o = {}, X = "X", p = ev.patient || {}, e = ev.emp || {}, s = DB.settings;
  const prof = s.nombre.replace(/^Dr(a)?\.?\s*/i, ""), cod = s.acess || s.senescyt;
  if (code === "FEMO") {
    const nac = (p.nac || "").split("-"), g = ev.go || {}, m = ev.rm || {}, c = ev.cons || {};
    Object.assign(o, {
      "0:B5": UP(e.inst), "0:Q5": e.ruc, "0:Z5": e.ciiu, "0:AC5": UP(e.nombre), "0:AP5": p.hcu || p.cedula, "0:BB5": p.archivo || "",
      "0:B8": p.ap1, "0:S8": p.ap2, "0:AH8": p.n1, "0:AR8": p.n2,
      "0:Z13": nac[0], "0:AC13": nac[1], "0:AE13": nac[2], "0:AF13": p.nac ? String(edad(p.nac, ev.fecha)) : "", "0:AH13": ev.sangre, "0:AP13": UP(ev.lat),
      "0:J16": ev.puesto, "0:AH16": ymd(ev.fecha),
      "0:B18": ev.tipo === "INGRESO" ? ymd(ev.fIng) : "", "0:AD18": ev.tipo === "REINTEGRO" ? ymd(ev.fRei) : "", "0:AM18": ev.tipo === "RETIRO" ? ymd(ev.fSal) : "",
      ["0:" + { INGRESO: "G20", PERIODICO: "Z20", REINTEGRO: "AI20", RETIRO: "BA20" }[ev.tipo]]: X,
      ["0:" + (p.sexo === "Masculino" ? "U13" : "X13")]: p.sexo ? X : "",
    });
    if (ev.prior.emb) o["0:B13"] = X; if (ev.prior.disc) o["0:G13"] = X; if (ev.prior.cat) o["0:K13"] = X; if (ev.prior.am) o["0:N13"] = X;
    if (ev.transf) o["0:" + (ev.transf === "SI" ? "O30" : "S30")] = X;
    if (ev.horm) { o["0:" + (ev.horm === "SI" ? "AH30" : "BE30")] = X; if (ev.horm === "SI") o["0:AL30"] = ev.hormCual; }
    if (p.sexo !== "Masculino") {
      Object.assign(o, { "0:B34": ymd(g.fum), "0:X34": g.gestas, "0:AB34": g.partos, "0:AE34": g.ces, "0:AH34": +g.abortos > 0 ? X : "" });
      if (g.plan) o["0:" + { SI: "AL34", NO: "AV34", NR: "AZ34" }[g.plan]] = X; if (g.plan === "SI") o["0:AN34"] = g.planCual;
      (g.ex || []).slice(0, 2).forEach((x, i) => Object.assign(o, { ["0:B" + (36 + i)]: x.ex, ["0:L" + (36 + i)]: x.t, ["0:U" + (36 + i)]: x.res }));
    } else {
      (m.ex || []).slice(0, 2).forEach((x, i) => Object.assign(o, { ["0:B" + (41 + i)]: x.ex, ["0:O" + (41 + i)]: x.t, ["0:U" + (41 + i)]: x.res }));
      if (m.plan) o["0:" + { SI: "AE41", NO: "AP41", NR: "AY41" }[m.plan]] = X; if (m.plan === "SI") o["0:AF41"] = m.planCual;
    }
    [["tab", 45], ["alc", 46], ["otr", 47]].forEach(([k, r]) => { const x = c[k] || {}; if (x.no) o["0:AB" + r] = X; else Object.assign(o, { ["0:N" + r]: x.t, ["0:S" + r]: x.ex ? X : "", ["0:X" + r]: x.abs }); });
    (ev.af || []).slice(0, 3).forEach((x, i) => Object.assign(o, { ["0:AI" + (45 + i)]: x.cual, ["0:AL" + (45 + i)]: x.t }));
    (ev.meds || []).slice(0, 3).forEach((x, i) => Object.assign(o, { ["0:AU" + (45 + i)]: x.cual, ["0:BC" + (45 + i)]: x.cant }));
    const v = ev.vit || {};
    Object.assign(o, { "0:B56": v.t, "0:I56": v.pa, "0:P56": v.fc, "0:W56": v.fr, "0:AC56": v.sat, "0:AG56": v.peso, "0:AI56": v.talla, "0:AM56": v.imc, "0:AS56": v.pabd });
    Object.keys(ev.exf || {}).forEach((a) => { if (ev.exf[a]) o["0:" + a] = X; });

    // G · factores de riesgo
    o["1:G2"] = ev.puesto;
    (ev.acts || []).forEach((t, i) => { if (t) o["1:" + OC_ACOL[i] + "5"] = t; });
    Object.keys(ev.rg || {}).forEach((r) => String(ev.rg[r]).split("").forEach((b, i) => { if (b === "1") o["1:" + OC_ACOL[i] + r] = X; }));

    // H · historia laboral
    (ev.hist || []).slice(0, 19).forEach((h, i) => {
      const r = 7 + i;
      Object.assign(o, { ["2:B" + r]: h.centro, ["2:J" + r]: h.act, ["2:W" + r]: h.cuando === "ANT" ? X : "", ["2:Y" + r]: h.cuando === "ACT" ? X : "", ["2:AA" + r]: h.tiempo,
        ["2:AC" + r]: h.ev === "INC" ? X : "", ["2:AE" + r]: h.ev === "ACC" ? X : "", ["2:AH" + r]: h.ev === "EP" ? X : "",
        ["2:AK" + r]: h.cal === "SI" ? X : "", ["2:AM" + r]: h.cal === "NO" ? X : "", ["2:AO" + r]: ymd(h.fecha), ["2:AR" + r]: h.esp, ["2:BE" + r]: h.obs });
    });
    (ev.extra || []).slice(1, 3).forEach((x, i) => Object.assign(o, { ["2:A" + (30 + i)]: x.d, ["2:BA" + (30 + i)]: ymd(x.f) }));
    if (ev.extra && ev.extra[0]) o["2:BA29"] = ymd(ev.extra[0].f);
    (ev.exams || []).slice(0, 5).forEach((x, i) => Object.assign(o, { ["2:B" + (36 + i)]: x.n, ["2:M" + (36 + i)]: ymd(x.f), ["2:T" + (36 + i)]: x.r }));
    (ev.dx || []).slice(0, 6).forEach((d, i) => Object.assign(o, { ["2:Q" + (45 + i)]: d.d, ["2:" + (d.t === "DEF" ? "BJ" : "BE") + (45 + i)]: X }));
    if (ev.tipo !== "RETIRO" && ev.apt) o["2:" + { "APTO": "P53", "APTO EN OBSERVACIÓN": "AE53", "APTO CON LIMITACIONES": "AS53", "NO APTO": "BA53" }[ev.apt]] = X;

    if (ev.tipo === "RETIRO") {
      const r = ev.ret || {};
      if (r.se) o["2:" + (r.se === "SI" ? "AG65" : "AW65")] = X;
      if (r.rel) o["2:" + (r.rel === "SI" ? "AG66" : "AW66")] = X;
    }
    Object.assign(o, { "2:K73": UP(prof), "2:AB73": cod });
  }
  if (code === "CEMO") {
    const f = (ev.cert && ev.cert.fecha) || ev.fecha, [y, mo, d] = f.split("-");
    Object.assign(o, {
      "0:A4": UP(e.inst), "0:L4": e.ruc, "0:R4": e.ciiu, "0:V4": UP(e.nombre), "0:AC4": p.hcu || p.cedula, "0:AI4": p.archivo || "",
      "0:A6": p.ap1, "0:J6": p.ap2, "0:Q6": p.n1, "0:X6": p.n2, "0:AD6": p.sexo ? (p.sexo === "Masculino" ? "H" : "M") : "", "0:AG6": ev.puesto,
      "0:K10": y, "0:M10": mo[0], "0:N10": mo[1], "0:O10": d[0], "0:P10": d[1],
      ["0:" + { INGRESO: "L12", PERIODICO: "U12", REINTEGRO: "AC12", RETIRO: "AI12" }[ev.tipo]]: X,
      "0:E33": UP(prof), "0:O33": cod,
    });
    if (ev.tipo !== "RETIRO" && ev.apt) o["0:" + { "APTO": "I17", "APTO EN OBSERVACIÓN": "S17", "APTO CON LIMITACIONES": "AC17", "NO APTO": "AK17" }[ev.apt]] = X;

  }
  return o;
}
/* nombre del profesional con sus títulos y registros (bloque O del FEMO y E del certificado) */
function ocProf() {
  const s = DB.settings;
  const t4 = s.tit4 || "", c4 = t4.replace(/^Máster en /i, "Máster ").replace(/Prevención de /i, "Prev. ");
  return { nom: UP(s.nombre.replace(/^Dr(a)?\.?\s*/i, "")), l1: `Médico · Reg. SENESCYT ${s.senescyt}${s.acess ? " · ACESS " + s.acess : ""}`, l2: t4 ? `${t4}${s.reg4 ? " · Reg. " + s.reg4 : ""}` : "",
    f1: `Médico · Reg. ${s.senescyt}`, f2: t4 ? `${c4}${s.reg4 ? " · Reg. " + s.reg4 : ""}` : "" };
}
function ocRich(pages, si, addr, html) {
  for (const p of pages) {
    if (p._si !== si) continue; const td = p.querySelector('td[data-a="' + addr + '"]'); if (!td) continue;
    const d = td.firstChild; td.classList.add("f"); d.classList.add("w"); d.style.display = "block"; d.style.textAlign = "left"; d.style.lineHeight = "1.12"; d.innerHTML = html;
    let fs = (p._fs || 8) * 0.9; d.style.fontSize = fs + "pt";
    while (fs > 4.5 && (d.scrollHeight > d.clientHeight + 1 || d.scrollWidth > d.clientWidth + 1)) { fs -= 0.5; d.style.fontSize = fs + "pt"; }
    d.removeAttribute("contenteditable"); return;
  }
}
function ocCells(pages, si, addrs) { return addrs.map((a) => { for (const p of pages) if (p._si === si) { const td = p.querySelector('td[data-a="' + a + '"]'); if (td) return td; } return null; }).filter(Boolean); }
function ocFlow(tds, text, k0) {
  if (!tds.length || !text) return;
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
  let k = 0;
  tds.forEach((td, i) => {
    const d = td.firstChild, pg = td.closest(".mspp"), base = ((pg && pg._fs) || 8) * (k0 || 1);
    td.classList.add("f"); d.classList.remove("ln"); d.classList.add("w"); d.setAttribute("data-nofit", "1");
    d.style.display = "block"; d.style.textAlign = "left"; d.style.whiteSpace = "normal"; d.style.overflow = "hidden"; d.style.lineHeight = "1.1";
    d.style.fontSize = Math.min(base, Math.max(4.5, Math.floor(((td._h - 2) / 1.333 / 1.12) * 2) / 2)) + "pt";
    d.textContent = "";
    if (k >= words.length) return;
    if (i === tds.length - 1) { // última casilla: todo lo que queda, achicando si hace falta
      d.textContent = words.slice(k).join(" "); k = words.length; let fs = parseFloat(d.style.fontSize);
      while (fs > 4.5 && d.scrollHeight > d.clientHeight + 1) { fs -= 0.5; d.style.fontSize = fs + "pt"; }
      return;
    }
    let line = "";
    while (k < words.length) { const t = line ? line + " " + words[k] : words[k]; d.textContent = t; if (d.scrollHeight > d.clientHeight + 1 && line) { d.textContent = line; break; } line = t; k++; }
  });
}
/* texto escrito a continuación de una etiqueta oficial («Descripción», «Observación:», «Otros ____»…) */
function ocLabel(pages, si, addr, text, more) {
  if (!text) return;
  const cell = (a) => { for (const p of pages) if (p._si === si) { const td = p.querySelector('td[data-a="' + a + '"]'); if (td) return td; } return null; };
  const td = cell(addr); if (!td) return;
  const d = td.firstChild, lab = d.innerHTML.replace(/_{3,}/g, "").replace(/\s+$/, "");
  const span = (t) => `${lab} <span class="oct">${esc(t)}</span>`;
  const rest = (more || []).map(cell).filter(Boolean);
  d.style.overflow = "hidden"; d.style.display = "block"; d.style.textAlign = "left";
  if (!rest.length) { // un solo renglón: ajustar el tamaño de letra
    d.classList.add("w"); d.style.whiteSpace = "normal"; d.innerHTML = span(text);
    const sp = d.querySelector(".oct"); let fs = (td.closest(".mspp") || {})._fs || 8; sp.style.fontSize = fs + "pt";
    while (fs > 4.5 && (d.scrollHeight > d.clientHeight + 1 || d.scrollWidth > d.clientWidth + 1)) { fs -= 0.5; sp.style.fontSize = fs + "pt"; }
    return;
  }
  // primer renglón junto a la etiqueta; el resto, en los renglones de abajo
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
  d.style.whiteSpace = "nowrap"; let k = 0, line = "";
  while (k < words.length) { const t = line ? line + " " + words[k] : words[k]; d.innerHTML = span(t); if (d.scrollWidth > d.clientWidth + 1 && line) break; line = t; k++; }
  d.innerHTML = span(line);
  if (k < words.length) ocFlow(rest, words.slice(k).join(" "));
}
function ocPost(code, pages, ev) {
  if (!ev || ev.kind !== "ocup") return;
  if (code === "FEMO") {
    const c = ev.cons || {};
    ocLabel(pages, 0, "B21", [ev.tipo === "REINTEGRO" && ev.reiMot ? "Reintegro por " + ev.reiMot.toLowerCase() + "." : "", ev.obsB].filter(Boolean).join(" "));
    ocLabel(pages, 0, "B25", ev.antCQ);
    ocLabel(pages, 0, "B27", ev.antFam);
    if (c.otr && c.otr.cual) ocLabel(pages, 0, "B47", c.otr.cual);
    ocLabel(pages, 0, "B48", ev.consObs);
    ocLabel(pages, 0, "B51", ev.enf, ["B52", "B53"]);
    OC_RISK.forEach(([, k, , r]) => { if ((ev.rgo || {})[k]) ocLabel(pages, 1, "D" + r, ev.rgo[k]); });
    if (ev.extra && ev.extra[0]) ocLabel(pages, 2, "B29", ev.extra[0].d);
    ocLabel(pages, 2, "B41", ev.examObs, ["B42"]);
    (ev.dx || []).slice(0, 6).forEach((d, i) => { if (d.cie) ocLabel(pages, 2, "B" + (45 + i), d.cie); });
    if (ev.tipo !== "RETIRO") ocLabel(pages, 2, "B56", ev.aptObs, ["B57"]);
    ocLabel(pages, 2, "B59", ev.rec, ["B60", "B61", "B62", "B63"]);
    if (ev.tipo === "RETIRO") ocLabel(pages, 2, "B67", (ev.ret || {}).obs, ["B68", "B69", "B70", "B71"]);
    ocFlow(ocCells(pages, 0, ["B72"]), ev.exfObs);
    (ev.med7 || []).forEach((t, i) => ocFlow(ocCells(pages, 1, [OC_ACOL[i] + "67", OC_ACOL[i] + "69", OC_ACOL[i] + "71"]), t, 0.7));
    if (ev.tipo !== "RETIRO") ocFlow(ocCells(pages, 2, ["B54", "B55"]), ev.lim);
    const pr = ocProf(); ocRich(pages, 2, "K73", `<b>${esc(pr.nom)}</b><br>${esc(pr.f1)}${pr.f2 ? "<br>" + esc(pr.f2) : ""}`);
  }
  if (code === "CEMO") {
    const ct = ev.cert || {};
    ["K10", "M10", "N10", "O10", "P10"].forEach((a) => { for (const p of pages) { const td = p.querySelector(`td[data-a="${a}"]`); if (td) { td.firstChild.style.textAlign = "center"; td.firstChild.style.fontWeight = "700"; } } });
    ocLabel(pages, 0, "A24", ct.rec);
    ocLabel(pages, 0, "A25", ct.obs, ["A26"]);
    ocFlow(ocCells(pages, 0, ["A19", "A20", "A21"]), ct.det);
    const pr = ocProf(); ocRich(pages, 0, "E33", `<b>${esc(pr.nom)}</b><br>${esc(pr.f1)}${pr.f2 ? "<br>" + esc(pr.f2) : ""}`);
  }
}

/* ---------- anexos 4 y 5: textos oficiales, paginados en A4 ---------- */
function ocLegal(code, ev, pv) {
  const s = DB.settings, e = (ev && ev.emp) || {}, p = (ev && ev.patient) || {}, cf = (ev && ev.conf) || {}, man = (ev && ev.manual && ev.manual[code]) || {};
  const f = (ev && ((code === "OCCONF" && cf.fecha) || ev.fecha)) || today(), [yy, mm, dd] = f.split("-");
  const F = (k, v, w) => `<span class="af" data-k="${k}" contenteditable="true" spellcheck="false"${w ? ` style="min-width:${w}mm"` : ""}>${esc(man[k] != null ? man[k] : (v || ""))}</span>`;
  const cargo = cf.cargo || "el médico", art = cargo.split(" ")[0], cn = cargo.slice(art.length + 1);
  const EL = (cap) => (cap ? art[0].toUpperCase() + art.slice(1) : art) + " " + cn;
  const emp = UP(e.nombre), ciu = s.ciudad || "Guayaquil";
  const hd = `<div class="ochd"><img src="${LOGO}" alt=""><span>${esc(UP(s.estab))}</span></div>`;
  let title, blocks;
  if (code === "OCCONF") {
    title = "ACUERDO DE CONFIDENCIALIDAD DE LA INFORMACIÓN MANEJADA DURANTE LA EVALUACION OCUPACIONAL.";
    const Q = (t) => `<p class="q">${t}</p>`;
    blocks = [
      `<p class="h">COMPARECIENTES:</p>`,
      `<p>El/la señor/a NOMBRE FUNCIONARIO/A, SERVIDOR/A EL/LA TRABAJADOR/A ${F("nom", UP(cf.nombre || s.nombre.replace(/^Dr(a)?\.?\s*/i, "")), 60)} con cargo de ${F("cargo", cn, 25)} y con cédula de identidad y/o ciudadanía No. ${F("ci", cf.ci || s.ci, 28)} y para los efectos jurídicos del presente instrumento, se denominará Médico Ocupacional de manera libre y voluntaria, y en el uso de sus capacidades, suscribo el presente Acuerdo de Confidencialidad, al tenor de las siguientes cláusulas:</p>`,
      `<p class="h">CLÁUSULA PRIMERA. - ANTECEDENTES:</p>`,
      `<p>1. Constitución de la República del Ecuador manda:</p>`,
      Q(`“Art. 66.- Se reconoce y garantizará a las personas: (…)<br>19. El derecho a la protección de datos de carácter personal, que incluye el acceso y la decisión sobre información y datos de este carácter, así como su correspondiente protección. La recolección, archivo, procesamiento, distribución o difusión de estos datos o información requerirán la autorización del titular o el mandato de la ley.”`),
      Q(`“Art. 198.- La Fiscalía General del Estado dirigirá el sistema nacional de protección y asistencia a víctimas, testigos y otros participantes en el proceso penal, para lo cual coordinará la obligatoria participación de las entidades públicas afines a los intereses y objetivos del sistema y articulará la participación de organizaciones de la sociedad civil.<br>El sistema se regirá por los principios de accesibilidad, responsabilidad, complementariedad, oportunidad, eficacia y eficiencia”.`),
      Q(`“Art. 362.- (...) Los servicios de salud serán seguros, de calidad y calidez, y garantizarán el consentimiento informado, el acceso a la información y la confidencialidad de la información de los pacientes (…)”.`),
      `<p>2. Código Orgánico Integral Penal tipifica:</p>`,
      Q(`“Art. 178.- Violación a la intimidad. - La persona que, sin contar con el consentimiento o la autorización legal, acceda, intercepte, examine, retenga, grabe, reproduzca, difunda o publique datos personales, mensajes de datos, voz, audio y vídeo, objetos postales, información contenida en soportes informáticos, comunicaciones privadas o reservadas de otra persona por cualquier medio, será sancionada con pena privativa de libertad de uno a tres años. (…)”.`),
      Q(`“Art. 179.- Revelación de secreto o información personal de terceros. - La persona que, teniendo conocimiento por razón de su estado u oficio, empleo, profesión o arte, de un secreto cuya divulgación cause daño a otra persona y lo revele, será sancionada con pena privativa de libertad de seis meses a un año. (…)”.`),
      Q(`“Art. 445.- Organización. - La Fiscalía dirige el Sistema nacional de protección y asistencia de víctimas, testigos y otros participantes en el proceso, a través del cual todos los partícipes en la investigación preprocesal o en cualquier etapa del proceso, podrán acogerse a las medidas especializadas de protección y asistencia para precautelar su integridad y no revictimización, cuando se encuentren en peligro”.`),
      `<p>3. Ley Orgánica del Sistema Nacional de Registro de Datos Públicos ordena:</p>`,
      Q(`“Art. 4.- Responsabilidad de la información. - Las instituciones del sector público y privado y las personas naturales que actualmente o en el futuro administren bases o registros públicos, son responsables de la integridad, protección y control de los registros y bases de datos a su cargo. Dichas instituciones responderán por la veracidad, autenticidad, custodia y debida conservación de los registros. La responsabilidad sobre la veracidad y autenticidad de los datos registrados, es exclusiva de la o el declarante cuando esta o este provee toda la información. (…)”.`),
      `<p>4. Ley Orgánica de protección de datos personales manda:</p>`,
      Q(`“Art. 4.- Términos y definiciones. - Para los efectos de la aplicación de la presente Ley se establecen las siguientes definiciones:<br>“(…) Dato personal: Dato que identifica o hace identificable a una persona natural, directa o indirectamente. (…)<br>Datos relativos a la salud: datos personales relativos a la salud física o mental de una persona, incluida la prestación de servicios de atención sanitaria, que revelen información sobre su estado de salud.” (…)<br>Destinatario: Persona natural o jurídica que ha sido comunicada con datos personales (…)<br>Encargado del tratamiento de datos personales: Persona natural o jurídica, pública o privada, autoridad pública, u otro organismo que solo o conjuntamente con otros trate datos personales a nombre y por cuenta de un responsable de tratamiento de datos personales (…)`),
      Q(`“Art. 10.- Principios. - Sin perjuicio de otros principios establecidos en la Constitución de la República, los instrumentos internacionales ratificados por el Estado u otras normas jurídicas, la presente Ley se regirá por los principios de: (…)`),
      Q(`d) Finalidad. - Las finalidades del tratamiento deberán ser determinadas, explícitas, legítimas y comunicadas al titular: no podrán tratarse datos personales con fines distintos para los cuales fueron recopilados, a menos que concurra una de las causales que habiliten un nuevo tratamiento conforme los supuestos de tratamiento legítimo señalados en esta Ley (…)”.`),
      Q(`g) Confidencialidad. - El tratamiento de datos personales debe concebirse sobre la base del debido sigilo y secreto, es decir, no debe tratarse o comunicarse para un fin distinto para el cual fueron recogidos, a menos que concurra una de las causales que habiliten un nuevo tratamiento conforme los supuestos de tratamiento legítimo señalados en esta Ley. (…)”.`),
      Q(`Art. 31.-Tratamiento de datos relativos a la salud. -Todo tratamiento de datos relativos a la salud deberá cumplir con los siguientes parámetros mínimos y aquellos que determine la Autoridad de Protección de Datos Personales en la normativa emitida para el efecto:`),
      Q(`1. Los datos relativos a la salud generados en establecimientos de salud públicos o privados, serán tratados cumpliendo los principios de confidencialidad y secreto profesional. El titular de la información deberá brindar su consentimiento previo conforme lo determina esta Ley (…)”.<br>2. Los datos relativos a la salud que se traten, siempre que sea posible, deberán ser previamente anonimizados o seudonimizados, evitando la posibilidad de identificar a los titulares de los mismos”.`),
      `<p>5. Ley Orgánica de Transparencia y Acceso a la Información Pública ordena:</p>`,
      Q(`Art. 4.- Definiciones. Para la aplicación de la presente Ley, se tomarán en cuenta las siguientes definiciones: (…)`),
      Q(`5. Información Confidencial: Información o documentación, en cualquier formato, final o preparatoria, haya sido o no generada por el sujeto obligado, derivada de los derechos personalísimos y fundamentales, y requiere expresa autorización de su titular para su divulgación, que contiene datos que al revelarse (…).`),
      Q(`6. Información Pública: Todo tipo de dato en documentos de cualquier formato, final o preparatoria, haya sido o no generada por el sujeto obligado, que se encuentre en poder de los sujetos obligados por esta Ley, contenidos, creados u obtenidos por ellos, que se encuentren bajo su responsabilidad y custodio o que se hayan producido con recursos del Estado.`),
      `<p class="h">CLÁUSULA SEGUNDA. - OBJETO:</p>`,
      `<p>En virtud de las disposiciones legales constantes en la cláusula anterior y de aquellas disposiciones legales que forman parte del marco normativo vigente ecuatoriano, EL/LA FUNCIONARIO/A, SERVIDOR/A EL/LA TRABAJADOR/A con cargo de Médico de Salud Ocupacional se compromete a guardar el debido sigilo y reserva respecto del caso respecto a la información y documentación que en razón de sus funciones maneje en ${F("emp", emp, 50)}.</p>`,
      `<p class="h">CLÁUSULA TERCERA. - OBLIGACIONES:</p>`,
      `<p>${EL(1)} ha sido informado y acepta que en atención a la naturaleza de la información y a los riesgos que el mal uso y/o divulgación de la misma implican para el Centro de Trabajo, mantendrá el sigilo y secreto de toda la información a la que por razones de sus actividades tendrá acceso, únicamente compartirá la información en datos estadísticos y/o numéricos y no de forma individual y/o revelando la identidad del trabajador.</p>`,
      `<p>${EL(1)} se obliga a abstenerse de usar, disponer, divulgar y/o publicar por cualquier medio, ya sea verbal o escrito, y en general, aprovecharse de la información y la documentación que generen en virtud de esta Evaluación Médica, o utilizarla para fines ajenos a los objetivos y necesidades de prevención y fomento en el ámbito ocupacional.</p>`,
      `<p>${EL(1)}, en razón del cargo que desempeña, puede tener acceso a información confidencial, cuya divulgación puede afectar a usuarios, pacientes, en general a los administrados, e inclusive a la propia entidad o área médica, por lo que resulta indispensable precautelar el manejo adecuado y reservado de tal información.</p>`,
      `<p class="h">CLÁUSULA CUARTA. - RESPONSABILIDAD:</p>`,
      `<p>${EL(1)} se obliga a entregar al Área de Salud Ocupacional toda documentación generada como resultado de las Evaluaciones Medicas Ocupacionales aplicadas a los trabajadores, sin reserva de copias de los expedientes que constituyan información amparada por el deber de confidencialidad objeto del presente Acuerdo en el supuesto de que cese la relación entre las partes por cualquier motivo.</p>`,
      `<p class="h">CLÁUSULA QUINTA. - SANCIONES:</p>`,
      `<p>${EL(1)} se encuentra sometido a la normativa que regula el uso de información pública y confidencial, principalmente, queda advertido de las responsabilidades administrativas, civiles y penales que la autoridad competente determinare por el incumplimiento de la normativa legal vigente relacionada con la materia y lo establecido en el presente Acuerdo, sin perjuicio de las acciones penales respectivas.</p>`,
      `<p class="h">CLÁUSULA SEXTA. - DECLARACIÓN DE CONFIDENCIALIDAD:</p>`,
      `<p>${EL(1)} declara que la información que genere, maneje o conozca en virtud del ejercicio de su cargo será utilizada única y exclusivamente para el eficiente desarrollo de sus funciones, en el ámbito laboral, debiendo mantener toda información de manera reservada en virtud de la protección de que gozan las y los trabajadores en el marco de la aplicación y ejercicio de las competencias derivadas de la Constitución y la Ley.</p>`,
      `<p>${EL(1)} declara conocer la normativa constante en este acuerdo a más de la que rige el ordenamiento jurídico dentro de la República del Ecuador respecto de la protección y confidencialidad de la información en todas sus formas, en especial aquellas de la Constitución de la República del Ecuador, el Código Orgánico Integral Penal, Ley Orgánica del Servicio Público, Ley Orgánica de Transparencia y Acceso a la Información Pública; así como la normativa interna del Centro de trabajo y del Ministerio de Salud Pública.</p>`,
      `<p>${EL(1)} declara que no podrá reproducir, modificar, hacer pública, divulgar o utilizar por cualquier medio a terceros o para su propio beneficio o para beneficio de cualquier otra persona natural o jurídica, la información objeto del presente Acuerdo sin previa autorización expresa de su titular o por orden de la Autoridad Competente.</p>`,
      `<p class="h">CLÁUSULA SEPTIMA. - PLAZO:</p>`,
      `<p>${EL(1)} vinculado con el Centro de Trabajo acuerda y se compromete a mantener bajo confidencialidad la información generada y conocida en virtud de la función que desempeñe en el Centro de Trabajo mientras dure su relación laboral y después de la misma en estricto respeto a la normativa legal vigente, en razón de la sensibilidad de la información y las competencias.</p>`,
      `<p class="h">CLÁUSULA OCTAVA. - ACEPTACIÓN DE LAS PARTES:</p>`,
      `<p>${EL(1)} acepta el contenido de todas y cada una de las cláusulas del presente Acuerdo y en consecuencia se compromete a cumplirlas en toda su extensión, en fe y garantía de lo cual, y para los fines legales correspondientes, suscribe en la ciudad de ${F("ciu", ciu, 30)} al ${F("dia", String(+dd), 8)} de ${F("mes", MESES[+mm - 1], 22)} de ${F("anio", yy, 12)}.</p>`,
      `<div class="ocsg"><p><b>FIRMA DEL SERVIDOR:</b></p><div class="ocln"></div><p>${F("nom2", UP(cf.nombre || s.nombre.replace(/^Dr(a)?\.?\s*/i, "")), 60)}<br>C.I. ${F("ci2", cf.ci || s.ci, 30)}${!cf.ci || cf.ci === s.ci ? `<br>${F("tt1", ocProf().l1, 60)}${ocProf().l2 ? `<br>${F("tt2", ocProf().l2, 60)}` : ""}` : ""}</p></div>`,
    ];
  } else {
    title = "AUTORIZACION DEL TRATAMIENTO DE LA INFORMACION EN SALUD OCUPACIONAL Y DE LA PRACTICA MEDICA ASISTENCIAL OCUPACIONAL";
    blocks = [
      `<p class="h">CLÁUSULA PRIMERA. – FINALIDAD:</p>`,
      `<p>En cumplimiento de lo dispuesto en la Ley Orgánica de Protección de Datos Personales, el titular de los datos personales otorga su consentimiento libre, específico, informado e inequívoca para el tratamiento de su información con la finalidad de dar cumplimiento a las normativas aplicables en materia de salud ocupacional y al proceso de vigilancia de salud del trabajador, siempre que su uso sea únicamente en el ámbito ocupacional para prevención y garantía de ambientes saludables del trabajo.</p>`,
      `<p>El tratamiento de los datos personales se realizará exclusivamente en el ámbito ocupacional, con el objeto de prevenir riesgos laborales y garantizar condicionales laborales seguras y saludables, con el propósito de verificar la aptitud del trabajador para desempeñar sus funciones. Dicho tratamiento se regirá por los principios de licitud, transparencia, proporcionalidad y seguridad, asegurando en todo momento la confidencialidad e integridad de la información conforme a la normativa legal vigente.</p>`,
      `<p>El titular de los datos podrá ejercer, en cualquier momento, su derecho de acceso, rectificación, cancelación, eliminación, oposición, portabilidad y suspensión del tratamiento, conforme a los procedimientos establecidos en la Ley.</p>`,
      `<p class="h">CLAUSULA SEGUNDA. - BASE LEGAL</p>`,
      `<p><b>Constitución de la República del Ecuador</b></p>`,
      `<p>El artículo 20, establece que el Estado garantizará la cláusula de conciencia a toda persona, y el secreto profesional y la reserva de la fuente a quienes informen, emitan sus opiniones a través de los medios u otras formas de comunicación, o laboren en cualquier actividad de comunicación.</p>`,
      `<p>En el artículo 66 numeral 19 reconoce y garantizará a las personas: “El derecho a la protección de datos de carácter personal, que incluye el acceso y la decisión sobre información y datos de este carácter, así como su correspondiente protección. La recolección, archivo, procesamiento, distribución o difusión de estos datos o información requerirán la autorización del titular o el mandato de la ley”.</p>`,
      `<p>En el artículo 362 ordena: "La atención de salud como servicio público se prestará a través de las entidades estatales, privadas, autónomas, comunitarias y aquellas que ejerzan las medicinas ancestrales, alternativas y complementarias. Los servicios de salud serán seguros, de calidad y calidez, y garantizarán el consentimiento informado, el acceso a la información y la confidencialidad de la información de los pacientes (...)";</p>`,
      `<p><b>Ley Orgánica de Salud</b></p>`,
      `<p>Toda persona, sin discriminación por motivo alguno, tiene en relación a la salud, los siguientes derechos: artículo 7, manda:"(…) f) Tener una historia clínica única redactada en términos precisos, comprensibles y completos; así como la confidencialidad respecto de la información en ella / contenida (...);</p>`,
      `<p>h) Ejercer la autonomía de su voluntad a través del consentimiento por escrito y tomar decisiones respecto a su estado de salud y procedimientos de diagnóstico y tratamiento, salvo en los casos de urgencia, emergencia o riesgo para la vida de las personas y para la salud pública.</p>`,
      `<p><b>Ley Orgánica de protección de datos personales</b></p>`,
      `<p>“Art. 7.- Tratamiento legítimo de datos personas. - El tratamiento será legítimo y lícito si se cumple con alguna de las siguientes condiciones: 1) Por consentimiento del titular para el tratamiento de sus datos personales, para una o varias finalidades específicas”.</p>`,
      `<p>“Art. 8.- Consentimiento. - Se podrá tratar y comunicar datos personales cuando se cuente con la manifestación de la voluntad del titular para hacerlo. El consentimiento será válido, cuando la manifestación de la voluntad sea: (…) 3) Informada, de modo que cumpla con el principio de transparencia y efectivice el derecho a la transparencia”.</p>`,
      `<p class="h">CLÁUSULA TERCERA. - DATOS TRATADOS:</p>`,
      `<p>El suscrito declara haber sido debidamente informado y acepta la aplicación del Formulario de Evaluaciones Médicas Ocupacionales, así como el tratamiento de sus datos personales recolectados en dicho contexto, cuya finalidad principal es la protección de su salud, bienestar y la de la población trabajadora, en el marco del cumplimiento de las obligaciones legales en materia de salud ocupacional.</p>`,
      `<p class="h">CLÁUSULA CUARTA. - RESPONSABILIDAD:</p>`,
      `<p>El titular de los datos reconoce y acepta que es de su exclusiva responsabilidad informar de forma oportuna y veraz cualquier síntoma, condición médica o cambio relevante en su estado de salud que pueda tener implicaciones en el ámbito laboral, con el fin de permitir una adecuada vigilancia de la salud ocupacional y la implementación de medidas preventivas necesarias.</p>`,
      `<p class="h">CLÁUSULA QUINTA. – AUTORIZACION DEL TITULAR:</p>`,
      `<p>Yo, ${F("nom", p.nombre ? UP([p.n1, p.n2, p.ap1, p.ap2].filter(Boolean).join(" ")) : "", 60)}, portador(a) de la cédula de ciudadanía No. ${F("ci", p.cedula, 28)}, otorgo mi consentimiento libre, previo, informado, específico e inequívoco a la Empresa/Institución ${F("emp", emp, 50)} y al profesional médico correspondiente, para la realización del examen clínico ocupacional, de conformidad con los signos o síntomas identificados.</p>`,
      `<p>Asimismo, autorizo el tratamiento de mis datos personales con carácter estadístico y/o numérico, relacionados con la Medicina Ocupacional, que incluyen, sin limitarse a ello, mis antecedentes médicos, resultados de evaluaciones clínicas y cualquier otra información necesaria para cumplir con los objetivos de la vigilancia de la salud laboral y la garantía de un entorno de trabajo seguro y saludable.</p>`,
      `<p>Declaro haber sido debidamente informado(a) de que los datos personales y médicos obtenidos a través del Formulario de Evaluaciones Médicas Ocupacionales serán tratados conforme a los principios de confidencialidad, seguridad, minimización y necesidad, y que serán utilizados exclusivamente para la identificación, prevención y gestión de riesgos laborales inherentes a mi actividad, garantizando en todo momento el resguardo de mi privacidad y el anonimato en los reportes generados.</p>`,
      `<p>Manifiesto, además, que esta autorización se otorga de forma libre, voluntaria y con pleno conocimiento de causa, y que su alcance se limita estrictamente a los fines anteriormente señalados. El tratamiento de mi información deberá realizarse en cumplimiento de la Ley Orgánica de Protección de Datos Personales y demás normativa aplicable.</p>`,
      `<p class="h">CLÁUSULA SEXTA. - PLAZO:</p>`,
      `<p>La presente autorización tendrá vigencia durante el ejercicio de mis actividades en la empresa ${F("emp2", emp, 50)}.</p>`,
      `<p class="h">CLÁUSULA SEPTIMA. - ACEPTACIÓN DE LAS PARTES:</p>`,
      `<p>El incumplimiento de las disposiciones establecidas en el presente documento dará lugar a la adopción de las medidas correspondientes en los ámbitos administrativo y penal, conforme a la normativa vigente.</p>`,
      `<p>En la ciudad de ${F("ciu", ciu, 30)} al ${F("dia", String(+dd), 8)} de ${F("mes", MESES[+mm - 1], 22)} de ${F("anio", yy, 12)}.</p>`,
      `<div class="ocsg ocsg2"><div class="ocln"></div><p>Firma o Huella del Trabajador<br>${F("nom2", p.nombre ? UP([p.n1, p.n2, p.ap1, p.ap2].filter(Boolean).join(" ")) : "", 60)}<br>C.I. ${F("ci2", p.cedula, 30)}</p></div>`,
    ];
  }
  const pages = [];
  const page = () => {
    const pg = document.createElement("div"); pg.className = "mspp edit ocd"; pg.setAttribute("data-orient", "portrait"); pg.setAttribute("data-code", code);
    pg.style.width = (210 * 96 / 25.4) + "px"; pg.style.height = (297 * 96 / 25.4) + "px";
    pg.innerHTML = `<div class="ocin">${hd}${pages.length ? "" : `<div class="octt">${title}</div>`}<div class="ocbd"></div></div><div class="ocft"><span>${OC_HEAD[code]}</span><span class="pgn"></span></div>`;
    pv.appendChild(pg); pages.push(pg); return pg;
  };
  // un título de cláusula va siempre con su primer párrafo, y la firma con el último
  const grp = [];
  blocks.forEach((b, i) => { if (i && (/class="h"/.test(blocks[i - 1]) || /ocsg/.test(b))) grp[grp.length - 1] += b; else grp.push(b); });
  blocks = grp.map((b) => `<div class="ocb">${b}</div>`);
  let pg = page();
  blocks.forEach((b) => {
    const bd = $(".ocbd", pg), inn = $(".ocin", pg); bd.insertAdjacentHTML("beforeend", b);
    if (inn.scrollHeight > inn.clientHeight + 1 && bd.children.length > 1) { const el = bd.lastElementChild; el.remove(); pg = page(); $(".ocbd", pg).appendChild(el); }
  });
  pages.forEach((x, i) => ($(".pgn", x).textContent = `Página ${i + 1} de ${pages.length}`));
  return pages;
}

/* ---------- pantalla del apartado ---------- */
V.ocupacional = (ev0) => {
  ocInit();
  const s = DB.settings, E = ev0 || ocNew(), P = E.patient || {}, EM = E.emp || {};
  const v = (k, o) => esc((o || E)[k] ?? "");
  const pats = Object.values(DB.patients).map((p) => `<option value="${esc(p.cedula)}">${esc(p.nombre)}</option>`).join("");
  const emps = Object.values(DB.empresas).map((e) => `<option value="${esc(e.nombre)}">${esc(e.ruc || "")}</option>`).join("");
  const rad = (name, list, val) => `<div class="ocrad">${list.map(([k, t]) => `<label class="chk"><input type="radio" name="${name}" value="${k}"${val === k ? " checked" : ""}>${t}</label>`).join("")}</div>`;
  const SN = [["SI", "Sí"], ["NO", "No"]];
  const row3 = (arr, n, cols) => Array.from({ length: n }, (_, i) => arr[i] || {}).map((x, i) => `<tr>${cols.map(([k, ph, w, t]) => `<td${w ? ` style="width:${w}"` : ""}><input data-r="${i}" data-k="${k}"${t ? ` type="${t}"` : ""} value="${esc(x[k] || "")}" placeholder="${ph || ""}"></td>`).join("")}</tr>`).join("");
  const C = E.cons || {}, G = E.go || {}, M = E.rm || {};
  const consRow = (k, lab) => { const x = C[k] || {}; return `<tr data-c="${k}"><td><b>${lab}</b>${k === "otr" ? `<input data-x="cual" value="${esc(x.cual || "")}" placeholder="¿Cuál?">` : ""}</td><td><input data-x="t" value="${esc(x.t || "")}" placeholder="p. ej. 5 años"></td><td style="text-align:center"><input type="checkbox" data-x="ex"${x.ex ? " checked" : ""}></td><td><input data-x="abs" value="${esc(x.abs || "")}" placeholder="meses"></td><td style="text-align:center"><input type="checkbox" data-x="no"${x.no ? " checked" : ""}></td></tr>`; };
  const riskRows = OC_RISK.map(([t, k, rows, ro]) => `<tr class="ocg"><th colspan="8">${t}</th></tr>` + rows.concat([[ro, "Otros"]]).map(([r, lab]) => {
    const bits = String((E.rg || {})[r] || "0000000");
    return `<tr><td>${lab === "Otros" ? `<input data-ro="${k}" value="${esc((E.rgo || {})[k] || "")}" placeholder="Otros (especifique)">` : esc(lab)}</td>${OC_ACOL.map((_, i) => `<td class="occ"><input type="checkbox" data-rg="${r}" data-i="${i}"${bits[i] === "1" ? " checked" : ""} aria-label="${esc(lab)} · actividad ${i + 1}"></td>`).join("")}</tr>`;
  }).join("")).join("");
  const histRow = (h, i) => `<tr data-h="${i}"><td><input data-k="centro" value="${esc(h.centro || "")}"></td><td><input data-k="act" value="${esc(h.act || "")}"></td>
    <td><select data-k="cuando"><option value=""></option><option value="ANT"${h.cuando === "ANT" ? " selected" : ""}>Anterior</option><option value="ACT"${h.cuando === "ACT" ? " selected" : ""}>Actual</option></select></td>
    <td><input data-k="tiempo" value="${esc(h.tiempo || "")}" placeholder="6 m · 4 a"></td>
    <td><select data-k="ev"><option value="">Ninguno</option><option value="INC"${h.ev === "INC" ? " selected" : ""}>Incidente</option><option value="ACC"${h.ev === "ACC" ? " selected" : ""}>Accidente</option><option value="EP"${h.ev === "EP" ? " selected" : ""}>Enfermedad profesional</option></select></td>
    <td><select data-k="cal"><option value=""></option><option${h.cal === "SI" ? " selected" : ""}>SI</option><option${h.cal === "NO" ? " selected" : ""}>NO</option></select></td>
    <td><input type="date" data-k="fecha" value="${esc(h.fecha || "")}"></td><td><input data-k="esp" value="${esc(h.esp || "")}" placeholder="IESS, ISSFA, ISSPOL…"></td><td><input data-k="obs" value="${esc(h.obs || "")}" placeholder="Lesión, días, secuelas, CIE-10"></td>
    <td><button type="button" class="btn d sm" data-del aria-label="Quitar">✕</button></td></tr>`;
  const dxRows = [0, 1, 2, 3, 4, 5].map((i) => { const d = (E.dx || [])[i] || {}; return `<tr><td>${i + 1}</td><td><input data-dx="d" value="${esc(d.d || "")}"></td><td><input data-dx="cie" value="${esc(d.cie || "")}"></td><td><select data-dx="t"><option value="PRE"${d.t !== "DEF" ? " selected" : ""}>PRE</option><option value="DEF"${d.t === "DEF" ? " selected" : ""}>DEF</option></select></td></tr>`; }).join("");
  const CF = E.conf || {}, CT = E.cert || {};
  $("#main").innerHTML = `<h1>Medicina ocupacional</h1>
  <p class="sub">Evaluación médica ocupacional según el <b>Acuerdo Ministerial 00025-2025</b> del MSP: formulario FEMO y sus anexos, que se imprimen en el orden que exige el acuerdo: 1) acuerdo de confidencialidad, 2) autorización de datos, 3) formulario y 4) certificado.${E.id ? ` Editando <span class="tag">${E.id}</span>.` : ""}</p>
  <div class="row octop"><button type="button" class="btn s sm" id="ocnuevo">Nueva evaluación</button><button type="button" class="btn s sm" id="occonfp">Acuerdo de confidencialidad del personal</button><button type="button" class="btn s sm" id="ocstat">Estadística sin datos nominales (Excel)</button><a class="btn s sm" href="#oclist">Evaluaciones guardadas</a></div>
  <form id="fo" autocomplete="off">
  <div class="card"><h2>Tipo de evaluación</h2>${rad("tipo", OC_TIPOS, E.tipo)}
    <div class="grid g6" style="margin-top:12px"><label class="span2">Fecha de atención<input type="date" name="fecha" value="${v("fecha")}"></label>
    <label class="span2 ocrei">Motivo del reintegro<select name="reiMot">${["", "Ausencia por motivos de salud", "Cambio de ocupación", "Reubicación"].map((x) => `<option${E.reiMot === x ? " selected" : ""}>${x}</option>`).join("")}</select></label></div>
    <p class="hint" id="ocinfo" style="margin-top:8px"></p></div>

  <div class="card"><h2>A. Establecimiento / centro de trabajo</h2><div class="grid g6">
    <label class="span3">Empresa o institución<input name="e_nombre" list="oce" value="${v("nombre", EM)}" required><span class="hint">Las empresas guardadas se completan solas.</span></label>
    <label>RUC<input name="e_ruc" value="${v("ruc", EM)}" inputmode="numeric"></label><label>CIIU<input name="e_ciiu" value="${v("ciiu", EM)}" placeholder="p. ej. 861"></label>
    <label>Institución del sistema<input name="e_inst" value="${v("inst", EM)}" placeholder="Solo IESS, ISSFA, ISSPOL o MSP"></label>
  </div><datalist id="oce">${emps}</datalist></div>

  <div class="card"><h2>A. Datos del trabajador</h2><div class="grid g6">
    <label>Cédula<input name="cedula" list="ocp" value="${v("cedula", P)}" required><span class="hint" id="occedmsg">Si ya es paciente, sus datos se llenan solos.</span></label>
    <label>Primer apellido<input name="ap1" value="${v("ap1", P)}" required></label><label>Segundo apellido<input name="ap2" value="${v("ap2", P)}"></label>
    <label>Primer nombre<input name="n1" value="${v("n1", P)}" required></label><label>Segundo nombre<input name="n2" value="${v("n2", P)}"></label>
    <label>Sexo<select name="sexo"><option value="Femenino"${P.sexo !== "Masculino" ? " selected" : ""}>Mujer</option><option value="Masculino"${P.sexo === "Masculino" ? " selected" : ""}>Hombre</option></select></label>
    <label>Fecha de nacimiento<input type="date" name="nac" value="${v("nac", P)}"></label><label>Edad<input name="edad" readonly placeholder="Se calcula sola"></label>
    <label>Grupo sanguíneo<select name="sangre">${OC_SANGRE.map((x) => `<option${E.sangre === x ? " selected" : ""}>${x}</option>`).join("")}</select><span class="hint">Solo con carné de tipificación vigente.</span></label>
    <label>Lateralidad<select name="lat">${["", "Diestro", "Zurdo", "Ambidiestro"].map((x) => `<option${E.lat === x ? " selected" : ""}>${x}</option>`).join("")}</select></label>
    <label>Teléfono<input name="tel" value="${v("tel", P)}"></label><label>Correo<input name="email" type="email" value="${v("email", P)}"></label>
    <label>N.º historia clínica<input name="hcu" value="${v("hcu", P)}" placeholder="La cédula"></label><label>N.º de archivo<input name="archivo" value="${v("archivo", P)}"></label>
  </div>
  <p class="hint" style="margin-top:10px">Grupo de atención prioritaria</p>
  <div class="chks" style="--cols:4">${[["emb", "Embarazada"], ["disc", "Persona con discapacidad"], ["cat", "Enfermedad catastrófica"], ["am", "Adulto mayor (65 años o más)"]].map(([k, t]) => `<label class="chk"><input type="checkbox" data-pr="${k}"${E.prior[k] ? " checked" : ""}>${t}</label>`).join("")}</div>
  <div id="ocprev"></div><datalist id="ocp">${pats}</datalist></div>

  <div class="card"><h2>B. Motivo de consulta</h2><div class="grid g6">
    <label class="span3">Puesto de trabajo (CIUO)<input name="puesto" value="${v("puesto")}" placeholder="Ej.: Enfermera (2221.01.02)"><span class="hint">Nombre del puesto y su código CIUO entre paréntesis.</span></label>
    <label class="span1 ocing">Fecha de ingreso al trabajo<input type="date" name="fIng" value="${v("fIng")}"></label>
    <label class="span1 ocrei">Fecha de reintegro<input type="date" name="fRei" value="${v("fRei")}"></label>
    <label class="span1 ocret">Último día laboral / salida<input type="date" name="fSal" value="${v("fSal")}"></label>
    <label class="span6">Observación<input name="obsB" value="${v("obsB")}"></label>
  </div></div>

  <div class="card"><h2>C. Antecedentes personales</h2><div class="grid g6">
    <label class="span3">Antecedentes clínicos y quirúrgicos <span class="hint">enfermedades, alergias, traumatismos, cirugías</span><textarea name="antCQ">${v("antCQ")}</textarea></label>
    <label class="span3">Antecedentes familiares <span class="hint">parentesco y patología (cardiovascular, metabólica, neurológica, oncológica, infecciosa, hereditaria, congénita, discapacidad)</span><textarea name="antFam">${v("antFam")}</textarea></label>
  </div>
  <p class="hint" style="margin:12px 0 6px">Condición especial para atenciones de urgencia, emergencia y tratamiento médico (referido por el trabajador)</p>
  <div class="grid g6"><label class="span2">En caso de requerir transfusiones autoriza${rad("transf", SN, E.transf)}</label>
    <label class="span2">¿Se encuentra bajo algún tratamiento hormonal?${rad("horm", SN, E.horm)}</label><label class="span2">¿Cuál?<input name="hormCual" value="${v("hormCual")}"></label></div>
  <div class="ocfem"><h3>Antecedentes gineco-obstétricos</h3><p class="hint">Regístralos solo si tienen relación directa con la actividad laboral y la exposición al riesgo.</p><div class="grid g6">
    <label>Fecha última menstruación<input type="date" name="g_fum" value="${v("fum", G)}"></label><label>Gestas<input name="g_gestas" inputmode="numeric" value="${v("gestas", G)}"></label><label>Partos<input name="g_partos" inputmode="numeric" value="${v("partos", G)}"></label><label>Cesáreas<input name="g_ces" inputmode="numeric" value="${v("ces", G)}"></label><label>Abortos<input name="g_abortos" inputmode="numeric" value="${v("abortos", G)}"></label><span></span>
    <label class="span3">Método de planificación familiar${rad("g_plan", [["SI", "Sí"], ["NO", "No"], ["NR", "No responde"]], G.plan)}</label><label class="span3">¿Cuál?<input name="g_planCual" value="${v("planCual", G)}"></label></div>
    <table class="t" style="margin-top:8px"><thead><tr><th>Exámenes realizados (Papanicolaou, colposcopia, eco mamario, mamografía…)</th><th style="width:16%">Año</th><th>Resultado (solo si interfiere con la actividad laboral y con autorización)</th></tr></thead><tbody id="ocgx">${row3(G.ex || [], 2, [["ex"], ["t", "aaaa"], ["res"]])}</tbody></table></div>
  <div class="ocmas"><h3>Antecedentes reproductivos masculinos</h3><p class="hint">Regístralos solo si tienen relación directa con la actividad laboral y la exposición al riesgo.</p>
    <table class="t"><thead><tr><th>Exámenes realizados</th><th style="width:16%">Año</th><th>Resultado (solo si interfiere con la actividad laboral y con autorización)</th></tr></thead><tbody id="ocmx">${row3(M.ex || [], 2, [["ex"], ["t", "aaaa"], ["res"]])}</tbody></table>
    <div class="grid g6" style="margin-top:8px"><label class="span3">Método de planificación familiar${rad("m_plan", [["SI", "Sí"], ["NO", "No"], ["NR", "No responde"]], M.plan)}</label><label class="span3">¿Cuál?<input name="m_planCual" value="${v("planCual", M)}"></label></div></div>
  <h3 style="margin-top:14px">Consumo de sustancias</h3>
  <div class="ocmw"><table class="t" id="occons" style="min-width:520px"><thead><tr><th style="width:28%"></th><th>Tiempo de consumo</th><th style="width:12%">Ex consumidor</th><th>Tiempo de abstinencia (meses)</th><th style="width:12%">No consume</th></tr></thead><tbody>${consRow("tab", "Tabaco")}${consRow("alc", "Alcohol")}${consRow("otr", "Otras")}</tbody></table></div>
  <p class="hint">Cantidad semanal en «Tiempo de consumo» si aplica (p. ej. «3 años · 1 tabaco/día»). Se considera abstinencia desde 3 meses sin consumir.</p>
  <label style="margin-top:6px">Observación<input name="consObs" value="${v("consObs")}"></label>
  <div class="grid" style="margin-top:12px;grid-template-columns:1fr 1fr;gap:14px">
    <div><h3>Estilo de vida · actividad física</h3><table class="t"><thead><tr><th>¿Cuál?</th><th style="width:40%">Tiempo (horas por semana)</th></tr></thead><tbody id="ocaf">${row3(E.af || [], 3, [["cual"], ["t", "3 h/semana"]])}</tbody></table></div>
    <div><h3>Condición preexistente · medicación habitual</h3><table class="t"><thead><tr><th>¿Cuál? (nombre genérico)</th><th style="width:40%">Cantidad</th></tr></thead><tbody id="ocmed">${row3(E.meds || [], 3, [["cual"], ["cant", "1 cápsula QD"]])}</tbody></table></div>
  </div></div>

  <div class="card"><h2>D. Enfermedad o problema actual</h2><textarea name="enf" placeholder="Origen, evolución cronológica, características de síntomas y signos, tratamientos efectuados">${v("enf")}</textarea></div>

  <div class="card"><h2>E. Constantes vitales y antropometría</h2><div class="grid g6">
    <label>Temperatura °C<input name="v_t" value="${v("t", E.vit)}"></label><label>Presión arterial mmHg<input name="v_pa" value="${v("pa", E.vit)}" placeholder="120/80"></label>
    <label>Frec. cardiaca lat/min<input name="v_fc" value="${v("fc", E.vit)}"></label><label>Frec. respiratoria /min<input name="v_fr" value="${v("fr", E.vit)}"></label>
    <label>Saturación O₂ %<input name="v_sat" value="${v("sat", E.vit)}"></label><label>Peso kg<input name="v_peso" value="${v("peso", E.vit)}"></label>
    <label>Talla cm<input name="v_talla" value="${v("talla", E.vit)}"></label><label>IMC kg/m²<input name="v_imc" value="${v("imc", E.vit)}" placeholder="Se calcula solo"></label><label>Perímetro abdominal cm<input name="v_pabd" value="${v("pabd", E.vit)}"></label>
  </div></div>

  <div class="card"><h2>F. Examen físico regional</h2><p class="hint">Marca solo los hallazgos patológicos y descríbelos abajo indicando el numeral (p. ej. «2b: conjuntivas hiperémicas»).</p>
    <div class="ocexf">${OC_EXF.map(([t, L]) => `<div><b>${t}</b>${L.map(([a, l]) => `<label class="chk"><input type="checkbox" data-exf="${a}"${E.exf[a] ? " checked" : ""}>${l}</label>`).join("")}</div>`).join("")}</div>
    <label style="margin-top:10px">Descripción de los hallazgos<textarea name="exfObs">${v("exfObs")}</textarea></label></div>

  <div class="card"><h2>G. Factores de riesgo del trabajo actual</h2>
    <p class="hint">Escribe las actividades importantes de la jornada (no es obligatorio llenar las 7) y marca a qué factores expone cada una. Ejemplo: Enfermera → «Manejo de cortopunzantes» → Seguridad: cortes y pinchazos.</p>
    <div class="ocacts">${OC_ACOL.map((_, i) => `<label>Actividad ${i + 1}<input data-act="${i}" value="${esc((E.acts || [])[i] || "")}"></label>`).join("")}</div>
    <div class="ocmw"><table class="t ocm"><thead><tr><th>Factor de riesgo</th>${OC_ACOL.map((_, i) => `<th class="occ" data-ah="${i}">${i + 1}</th>`).join("")}</tr></thead><tbody>${riskRows}</tbody></table></div>
    <h3 style="margin-top:12px">Medidas preventivas por actividad</h3>
    <div class="ocacts">${OC_ACOL.map((_, i) => `<label>Actividad ${i + 1}<textarea data-mp="${i}" style="min-height:60px">${esc((E.med7 || [])[i] || "")}</textarea></label>`).join("")}</div></div>

  <div class="card"><h2>H. Actividad laboral · incidentes, accidentes y enfermedades ocupacionales</h2><p class="hint">Antecedentes de empleos anteriores y del trabajo actual. Si refiere un accidente no calificado por la entidad, marca «NO» en calificado y anótalo en observaciones.</p>
    <div class="ocmw"><table class="t" style="min-width:980px"><thead><tr><th>Centro de trabajo</th><th>Actividades que desempeña(ba)</th><th style="width:8%">Trabajo</th><th style="width:8%">Tiempo</th><th style="width:11%">Evento</th><th style="width:7%">Calificado</th><th style="width:11%">Fecha calificación</th><th>Especificar entidad</th><th>Observaciones</th><th></th></tr></thead><tbody id="ochist">${(E.hist.length ? E.hist : [{}]).map(histRow).join("")}</tbody></table></div>
    <button type="button" class="btn s sm" id="ochadd" style="margin-top:8px">+ Agregar empleo</button></div>

  <div class="card"><h2>I. Actividades extralaborales</h2><p class="hint">Sindicales, domésticas, deportes, pasatiempos, voluntariado u otras ocupaciones con esfuerzo físico o exposición a riesgos.</p>
    <table class="t"><thead><tr><th>Tipo de actividad · descripción</th><th style="width:22%">Fecha de inicio</th></tr></thead><tbody id="ocext">${row3(E.extra || [], 3, [["d"], ["f", "", "", "date"]])}</tbody></table></div>

  <div class="card"><h2>J. Resultados de exámenes generales y específicos según riesgo y puesto</h2><p class="hint">Imagen, laboratorio y otros. En resultados anota solo los parámetros alterados o relevantes. Anexa los informes a la evaluación.</p>
    <table class="t"><thead><tr><th>Nombre del examen</th><th style="width:18%">Fecha</th><th>Resultados</th></tr></thead><tbody id="ocex">${row3(E.exams || [], 5, [["n"], ["f", "", "", "date"], ["r"]])}</tbody></table>
    <label style="margin-top:8px">Observaciones <span class="hint">si todo está en rango normal, escribe «Normal»</span><input name="examObs" value="${v("examObs")}"></label></div>

  <div class="card"><h2>K. Diagnóstico</h2><p class="hint">Escribe el nombre o el código CIE-10. Una enfermedad profesional es definitiva solo cuando la califica la institución competente.</p>
    <table class="t"><thead><tr><th style="width:4%">#</th><th>Descripción</th><th style="width:16%">CIE-10</th><th style="width:14%">PRE / DEF</th></tr></thead><tbody id="ocdx">${dxRows}</tbody></table></div>

  <div class="card ocapt"><h2>L. Aptitud médica para el trabajo</h2>${rad("apt", OC_APT.map((x) => [x, x.charAt(0) + x.slice(1).toLowerCase()]), E.apt)}<p class="hint" id="ocaptinfo"></p>
    <div class="grid g6"><label class="span3">Limitaciones <span class="hint">personales y/o laborales (adaptativas o restrictivas)</span><textarea name="lim">${v("lim")}</textarea></label>
    <label class="span3">Observaciones <span class="hint">solo con fines de uso médico</span><textarea name="aptObs">${v("aptObs")}</textarea></label></div></div>

  <div class="card"><h2>M. Recomendaciones y/o tratamiento</h2><textarea name="rec" placeholder="Tratamiento farmacológico y no farmacológico, terapias, restricciones, adaptaciones y medidas para preservar la salud del trabajador">${v("rec")}</textarea></div>

  <div class="card ocretc"><h2>N. Retiro (evaluación)</h2><div class="grid g6">
    <label class="span3">¿Se realiza la evaluación?${rad("r_se", SN, (E.ret || {}).se)}</label><label class="span3">¿La condición de salud está relacionada con el trabajo?${rad("r_rel", SN, (E.ret || {}).rel)}</label>
    <label class="span6">Observación <span class="hint">si no se realizó, anota el motivo</span><textarea name="r_obs">${esc((E.ret || {}).obs || "")}</textarea></label></div></div>

  <div class="card"><h2>Certificado de evaluación médica ocupacional</h2>
    <p class="hint">El certificado se entrega al trabajador y puede llegar al empleador: no escribas diagnósticos, solo lo necesario para la aptitud. Se emite en dos originales: uno para el archivo y otro para el trabajador.</p>
    <div class="grid g6"><label class="span2">Fecha de emisión<input type="date" name="c_fecha" value="${esc(CT.fecha || "")}" placeholder="La de la atención"></label>
    <label class="span2" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" name="c_copias"${CT.copias === 1 ? "" : " checked"} style="width:18px;min-height:0"> Imprimir dos originales</label><span class="span2"></span>
    <label class="span6">C. Detalle de observaciones de la aptitud<textarea name="c_det">${esc(CT.det || "")}</textarea></label>
    <label class="span3">D. Recomendaciones (descripción)<textarea name="c_rec">${esc(CT.rec || "")}</textarea><button type="button" class="btn s sm" id="ocrecm" style="margin-top:6px;align-self:flex-start">Copiar de «M. Recomendaciones»</button></label>
    <label class="span3">D. Observación<textarea name="c_obs">${esc(CT.obs || "")}</textarea></label></div></div>

  <div class="card"><h2>Acuerdo de confidencialidad · profesional que suscribe</h2><p class="hint">Lo firma todo el personal con acceso a la información de salud de los trabajadores (Anexo 4).</p><div class="grid g6">
    <label class="span3">Nombres y apellidos<input name="cf_nombre" value="${esc(CF.nombre || s.nombre.replace(/^Dr(a)?\.?\s*/i, ""))}"></label>
    <label>Cédula<input name="cf_ci" value="${esc(CF.ci || s.ci)}"></label><label class="span2">Cargo<select name="cf_cargo">${OC_CARGOS.map((x) => `<option${(CF.cargo || "el médico") === x ? " selected" : ""}>${x}</option>`).join("")}</select></label></div></div>

  <div class="card"><h2>Documentos a imprimir</h2><div class="chks" style="--cols:2">
    ${[["OCCONF", "1. Acuerdo de confidencialidad (Anexo 4)"], ["OCAUT", "2. Autorización del tratamiento de datos (Anexo 5)"], ["FEMO", "3. Formulario de evaluación médica ocupacional (FEMO)"], ["CEMO", "4. Certificado de evaluación médica ocupacional"]].map(([k, t]) => `<label class="chk"><input type="checkbox" data-odoc="${k}"${!E.docs || E.docs[k] ? " checked" : ""}>${t}</label>`).join("")}</div>
    <p class="hint" style="margin-top:8px">Firmas: el trabajador firma o pone su huella en la autorización, el formulario y el certificado; el profesional firma el acuerdo, el formulario y el certificado.</p></div>

  <div class="row" style="position:sticky;bottom:0;background:var(--bg);padding:12px 0;border-top:1px solid var(--line)">
    <button class="btn p">Guardar y ver documentos</button><button type="button" class="btn s" id="occert">Guardar y ver solo el certificado</button>
  </div></form>
  <div class="card" id="oclist" style="margin-top:18px"><h2>Evaluaciones guardadas</h2><div class="row"><input id="ocq" placeholder="Buscar por trabajador, cédula, empresa o puesto" style="flex:1;min-width:220px"><select id="ocft"><option value="">Todos los tipos</option>${OC_TIPOS.map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select></div><div id="ocl" class="ocmw" style="margin-top:10px"></div></div>`;

  const f = $("#fo");
  const tipo = () => (f.querySelector("[name=tipo]:checked") || {}).value || "INGRESO";
  const vis = () => {
    const t = tipo(), fem = f.sexo.value !== "Masculino";
    $$(".ocing", f).forEach((x) => (x.style.display = t === "INGRESO" ? "" : "none"));
    $$(".ocrei", f).forEach((x) => (x.style.display = t === "REINTEGRO" ? "" : "none"));
    $$(".ocret", f).forEach((x) => (x.style.display = t === "RETIRO" ? "" : "none"));
    $(".ocapt", f).style.display = t === "RETIRO" ? "none" : ""; $(".ocretc", f).style.display = t === "RETIRO" ? "" : "none";
    $(".ocfem", f).style.display = fem ? "" : "none"; $(".ocmas", f).style.display = fem ? "none" : "";
    $("#ocinfo").textContent = { INGRESO: "Determina la aptitud al inicio de la relación laboral según los riesgos del puesto. Anota la fecha de ingreso.", PERIODICO: "Monitorea los efectos de la exposición; al menos una vez al año o según el riesgo.", REINTEGRO: "Tras una ausencia (generalmente por salud), por cambio de ocupación o por reubicación. Anota la fecha de reintegro.", RETIRO: "Registra el estado de salud al terminar la relación laboral. No lleva aptitud (bloque L); llena el bloque N." }[t];
    const a = (f.querySelector("[name=apt]:checked") || {}).value; $("#ocaptinfo").textContent = a ? OC_APT_INFO[a] : "";
    OC_ACOL.forEach((_, i) => { const on = !!$(`[data-act="${i}"]`, f).value.trim(); $$(`[data-i="${i}"]`, f).forEach((c) => (c.closest("td").classList.toggle("off", !on))); const h = $(`[data-ah="${i}"]`, f); h.textContent = on ? `${i + 1}` : `${i + 1}`; h.title = $(`[data-act="${i}"]`, f).value; });
  };
  f.addEventListener("change", vis); f.addEventListener("input", (e) => { if (e.target.dataset.act != null) vis(); });
  // edad y adulto mayor
  const age = () => { const e = edad(f.nac.value, f.fecha.value); f.edad.value = e === "" ? "" : e + " años"; if (e !== "" && e >= 65) $('[data-pr="am"]', f).checked = true; };
  f.nac.addEventListener("change", age); f.fecha.addEventListener("change", age); age();
  // IMC
  const imc = () => { const p = parseFloat(String(f.v_peso.value).replace(",", ".")), t = parseFloat(String(f.v_talla.value).replace(",", ".")) / 100; if (p > 0 && t > 0) f.v_imc.value = (p / (t * t)).toFixed(1); };
  f.v_peso.oninput = imc; f.v_talla.oninput = imc;
  // empresa guardada
  f.e_nombre.addEventListener("change", () => { const e = Object.values(DB.empresas).find((x) => UP(x.nombre) === UP(f.e_nombre.value.trim())); if (e) { f.e_ruc.value = e.ruc || ""; f.e_ciiu.value = e.ciiu || ""; f.e_inst.value = e.inst || ""; } });
  // trabajador: datos del paciente y evaluación anterior
  const msg = $("#occedmsg");
  const fillP = () => {
    const c = f.cedula.value.replace(/\D/g, ""), p = DB.patients[c];
    if (p) {
      const sp = p.ap1 ? p : Object.assign({}, p, splitName(p.nombre));
      ["ap1", "ap2", "n1", "n2", "nac", "sexo", "tel", "email", "hcu", "archivo"].forEach((k) => { if (f[k] && sp[k] != null && sp[k] !== "") f[k].value = sp[k]; });
      age(); vis(); msg.textContent = "Trabajador encontrado: datos cargados."; msg.className = "hint";
    } else if (c.length === 10) { msg.textContent = cedulaOk(c) ? "Cédula válida. Trabajador nuevo." : "Revisa la cédula: el dígito verificador no coincide."; msg.className = cedulaOk(c) ? "hint" : "hint warnt"; }
    const prev = DB.ocup.filter((x) => x.patient.cedula === c && x.id !== E.id).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    const box = $("#ocprev");
    if (box._for === c) return; box._for = c; // no redibujar (se perdería el clic del botón)
    if (!prev.length || E.id) { box.innerHTML = ""; return; }
    const L = prev[0];
    box.innerHTML = `<div class="prevat"><b>Tiene ${prev.length} evaluación(es) ocupacional(es) anterior(es).</b> Última: <b>${fmt(L.fecha)}</b> · ${OC_TIPO_TXT[L.tipo]} · ${esc(L.emp.nombre || "")}${L.apt ? " · " + esc(L.apt) : ""}<br>
      <button type="button" class="btn s sm" id="occopy">Copiar antecedentes, puesto, riesgos e historia laboral</button> <span class="hint">Útil en la evaluación periódica, de reintegro o de retiro.</span></div>`;
    $("#occopy").onclick = () => {
      const keep = read(); ["emp", "puesto", "sangre", "lat", "antCQ", "antFam", "transf", "horm", "hormCual", "go", "rm", "cons", "consObs", "af", "meds", "acts", "rg", "rgo", "med7", "hist", "extra"].forEach((k) => { if (L[k] != null) keep[k] = JSON.parse(JSON.stringify(L[k])); });
      if (keep.tipo === "INGRESO") keep.tipo = "PERIODICO";
      V.ocupacional(keep); toast("Datos copiados de la evaluación del " + fmt(L.fecha) + ". Revísalos y actualiza lo que cambió.");
    };
  };
  f.cedula.addEventListener("change", fillP); f.cedula.addEventListener("input", () => { if (f.cedula.value.replace(/\D/g, "").length === 10) fillP(); });
  // historia laboral
  const wireH = (tr) => { $("[data-del]", tr).onclick = () => { if ($$("#ochist tr").length > 1) tr.remove(); else $$("input,select", tr).forEach((i) => (i.value = "")); }; };
  $$("#ochist tr").forEach(wireH);
  $("#ochadd").onclick = () => { if ($$("#ochist tr").length >= 19) return toast("El formulario tiene espacio para 19 empleos."); $("#ochist").insertAdjacentHTML("beforeend", histRow({}, $$("#ochist tr").length)); wireH($("#ochist").lastElementChild); };
  $("#ocrecm").onclick = () => { f.c_rec.value = f.rec.value; };
  // consumo: «no consume» limpia la fila
  $$("#occons tr[data-c]").forEach((tr) => { const no = $("[data-x=no]", tr); no.addEventListener("change", () => { if (no.checked) $$("[data-x]", tr).forEach((i) => { if (i !== no && i.dataset.x !== "cual") { if (i.type === "checkbox") i.checked = false; else i.value = ""; } }); }); });
  vis(); if (P.cedula && !E.id) fillP();

  const rows = (id, keys) => $$(`#${id} tr`).map((tr) => Object.fromEntries(keys.map((k) => [k, ($(`[data-k="${k}"]`, tr) || {}).value?.trim() || ""]))).filter((x) => Object.values(x).some(Boolean));
  const read = () => {
    const c = f.cedula.value.replace(/\D/g, "");
    const p = Object.assign({}, DB.patients[c] || {}, { cedula: c, ap1: UP(f.ap1.value.trim()), ap2: UP(f.ap2.value.trim()), n1: UP(f.n1.value.trim()), n2: UP(f.n2.value.trim()), sexo: f.sexo.value, nac: f.nac.value,
      tel: f.tel.value.trim(), email: f.email.value.trim(), hcu: f.hcu.value.trim(), archivo: f.archivo.value.trim() });
    p.nombre = [p.n1, p.n2, p.ap1, p.ap2].filter(Boolean).join(" ");
    const rd = (n) => (f.querySelector(`[name="${n}"]:checked`) || {}).value || "";
    const cons = Object.fromEntries($$("#occons tr[data-c]").map((tr) => [tr.dataset.c, Object.fromEntries($$("[data-x]", tr).map((i) => [i.dataset.x, i.type === "checkbox" ? i.checked : i.value.trim()]))]));
    const rg = {};
    OC_RISK.forEach(([, , L, ro]) => L.map((x) => x[0]).concat([ro]).forEach((r) => { const b = OC_ACOL.map((_, i) => ($(`[data-rg="${r}"][data-i="${i}"]`, f).checked ? "1" : "0")).join(""); if (b.includes("1")) rg[r] = b; }));
    const t = tipo();
    return Object.assign({}, E, {
      kind: "ocup", tipo: t, fecha: f.fecha.value || today(), reiMot: t === "REINTEGRO" ? f.reiMot.value : "",
      emp: { nombre: f.e_nombre.value.trim(), ruc: f.e_ruc.value.replace(/\D/g, ""), ciiu: f.e_ciiu.value.trim(), inst: UP(f.e_inst.value.trim()) },
      patient: p, prior: Object.fromEntries($$("[data-pr]", f).map((i) => [i.dataset.pr, i.checked])), sangre: f.sangre.value, lat: f.lat.value,
      puesto: f.puesto.value.trim(), fIng: f.fIng.value, fRei: f.fRei.value, fSal: f.fSal.value, obsB: f.obsB.value.trim(),
      antCQ: f.antCQ.value.trim(), antFam: f.antFam.value.trim(), transf: rd("transf"), horm: rd("horm"), hormCual: f.hormCual.value.trim(),
      go: { fum: f.g_fum.value, gestas: f.g_gestas.value.trim(), partos: f.g_partos.value.trim(), ces: f.g_ces.value.trim(), abortos: f.g_abortos.value.trim(), plan: rd("g_plan"), planCual: f.g_planCual.value.trim(), ex: rows("ocgx", ["ex", "t", "res"]) },
      rm: { plan: rd("m_plan"), planCual: f.m_planCual.value.trim(), ex: rows("ocmx", ["ex", "t", "res"]) },
      cons, consObs: f.consObs.value.trim(), af: rows("ocaf", ["cual", "t"]), meds: rows("ocmed", ["cual", "cant"]),
      enf: f.enf.value.trim(), vit: Object.fromEntries(["t", "pa", "fc", "fr", "sat", "peso", "talla", "imc", "pabd"].map((k) => [k, f["v_" + k].value.trim()])),
      exf: Object.fromEntries($$("[data-exf]:checked", f).map((i) => [i.dataset.exf, 1])), exfObs: f.exfObs.value.trim(),
      acts: OC_ACOL.map((_, i) => $(`[data-act="${i}"]`, f).value.trim()), rg, rgo: Object.fromEntries($$("[data-ro]", f).map((i) => [i.dataset.ro, i.value.trim()]).filter((x) => x[1])),
      med7: OC_ACOL.map((_, i) => $(`[data-mp="${i}"]`, f).value.trim()),
      hist: $$("#ochist tr").map((tr) => Object.fromEntries($$("[data-k]", tr).map((i) => [i.dataset.k, i.value.trim()]))).filter((h) => Object.values(h).some(Boolean)),
      extra: rows("ocext", ["d", "f"]), exams: rows("ocex", ["n", "f", "r"]), examObs: f.examObs.value.trim(),
      dx: $$("#ocdx tr").map((r) => ({ d: $("[data-dx=d]", r).value.trim(), cie: UP($("[data-dx=cie]", r).value.trim()), t: $("[data-dx=t]", r).value })).filter((d) => d.d || d.cie),
      apt: t === "RETIRO" ? "" : rd("apt"), lim: f.lim.value.trim(), aptObs: f.aptObs.value.trim(), rec: f.rec.value.trim(),
      ret: t === "RETIRO" ? { se: rd("r_se"), rel: rd("r_rel"), obs: f.r_obs.value.trim() } : {},
      cert: { fecha: f.c_fecha.value, copias: f.c_copias.checked ? 2 : 1, det: f.c_det.value.trim(), rec: f.c_rec.value.trim(), obs: f.c_obs.value.trim() },
      conf: { nombre: UP(f.cf_nombre.value.trim()), ci: f.cf_ci.value.trim(), cargo: f.cf_cargo.value, fecha: f.fecha.value || today() },
      docs: Object.fromEntries($$("[data-odoc]:checked", f).map((i) => [i.dataset.odoc, 1])),
    });
  };
  const persist = (ev) => {
    const p = ev.patient;
    if (!p.cedula || !p.ap1 || !p.n1) { toast("Faltan la cédula, el primer apellido o el primer nombre del trabajador."); return null; }
    if (!ev.emp.nombre) { toast("Falta el nombre de la empresa o centro de trabajo."); return null; }
    if (ev.tipo !== "RETIRO" && !ev.apt) { toast("Marca la aptitud médica para el trabajo (bloque L)."); $(".ocapt", f).scrollIntoView({ behavior: "smooth", block: "center" }); return null; }
    const pd = Object.assign({}, p, { ocupacion: ev.puesto || p.ocupacion || "", empresa: ev.emp.nombre }); delete pd.edad; storePatient(pd);
    const k = ocEmpKey(ev.emp); if (k) DB.empresas[k] = Object.assign({}, DB.empresas[k] || {}, ev.emp, { updated: today() });
    if (!ev.id) { const y = new Date().getFullYear(); DB.ocCount = DB.ocCount && DB.ocCount.year === y ? DB.ocCount : { year: y, next: 1 }; ev.id = `EMO-${y}-${String(DB.ocCount.next++).padStart(4, "0")}`; ev.created = today(); }
    ev.updated = today();
    const i = DB.ocup.findIndex((x) => x.id === ev.id); if (i >= 0) DB.ocup[i] = ev; else DB.ocup.unshift(ev);
    save(); Object.assign(E, ev); return ev;
  };
  f.onsubmit = (e) => {
    e.preventDefault(); const ev = persist(read()); if (!ev) return;
    const codes = ocCodes(ev); if (!codes.length) return toast("Elige al menos un documento.");
    toast(`Evaluación ${ev.id} guardada.`); V.ocupacional(ev); openForms(codes, ev);
  };
  $("#occert").onclick = () => { const ev = persist(read()); if (!ev) return; toast(`Evaluación ${ev.id} guardada.`); V.ocupacional(ev); openForms(ocCodes(ev, ["CEMO"]), ev); };
  $("#ocnuevo").onclick = () => V.ocupacional();
  $("#occonfp").onclick = ocStaffDialog;
  $("#ocstat").onclick = ocStats;
  // lista
  const drawL = () => {
    const q = MSP.norm($("#ocq").value), ft = $("#ocft").value;
    const L = DB.ocup.filter((x) => (!ft || x.tipo === ft) && (!q || MSP.norm([x.id, x.patient.nombre, x.patient.cedula, x.emp.nombre, x.puesto].join(" ")).includes(q))).slice(0, 80);
    $("#ocl").innerHTML = L.length ? `<table class="t" style="min-width:720px"><thead><tr><th>Evaluación</th><th>Fecha</th><th>Trabajador</th><th>Empresa</th><th>Tipo</th><th>Aptitud</th><th></th></tr></thead><tbody>${L.map((x) => `<tr><td class="tag">${x.id}</td><td>${fmt(x.fecha)}</td><td>${esc(x.patient.nombre)}<br><small class="hint">${esc(x.puesto || "")}</small></td><td>${esc(x.emp.nombre || "")}</td><td>${OC_TIPO_TXT[x.tipo]}</td><td>${x.apt ? `<span class="pill ${x.apt === "APTO" ? "ok" : "no"}">${esc(x.apt)}</span>` : "—"}</td><td class="row"><button class="btn s sm" data-oo="${x.id}">Abrir</button><button class="btn s sm" data-od="${x.id}">Documentos</button><button class="btn s sm" data-oc="${x.id}">Certificado</button></td></tr>`).join("")}</tbody></table>` : `<p class="hint">Aún no hay evaluaciones ocupacionales${q || ft ? " con ese filtro" : ""}.</p>`;
    const get = (id) => DB.ocup.find((x) => x.id === id);
    $$("[data-oo]", $("#ocl")).forEach((b) => (b.onclick = () => { V.ocupacional(JSON.parse(JSON.stringify(get(b.dataset.oo)))); window.scrollTo(0, 0); }));
    $$("[data-od]", $("#ocl")).forEach((b) => (b.onclick = () => { const x = get(b.dataset.od); openForms(ocCodes(x), x); }));
    $$("[data-oc]", $("#ocl")).forEach((b) => (b.onclick = () => { const x = get(b.dataset.oc); openForms(ocCodes(x, ["CEMO"]), x); }));
  };
  $("#ocq").oninput = drawL; $("#ocft").onchange = drawL; drawL();
};
// documentos en el orden de la Disposición General Primera; el certificado, en dos originales
function ocCodes(ev, only) {
  const want = only || ["OCCONF", "OCAUT", "FEMO", "CEMO"].filter((k) => !ev.docs || ev.docs[k]);
  return want.flatMap((k) => (k === "CEMO" && (!ev.cert || ev.cert.copias !== 1) ? ["CEMO", "CEMO"] : [k]));
}

/* acuerdo de confidencialidad para otro miembro del personal (enfermera, psicólogo…) */
function ocStaffDialog() {
  ocInit();
  const box = $("#senddlg"), s = DB.settings, emps = Object.values(DB.empresas).map((e) => `<option value="${esc(e.nombre)}">`).join("");
  box.innerHTML = `<div class="sdbox"><b>Acuerdo de confidencialidad del personal</b><p class="hint">Para cada persona con acceso a la información de salud de los trabajadores (Anexo 4).</p>
    <label>Nombres y apellidos<input id="cfn"></label><label>Cédula<input id="cfc"></label>
    <label>Cargo<select id="cfr">${OC_CARGOS.map((x) => `<option>${x}</option>`).join("")}</select></label>
    <label>Centro de trabajo<input id="cfe" list="cfel"><datalist id="cfel">${emps}</datalist></label><label>Fecha<input type="date" id="cff" value="${today()}"></label>
    <div class="row" style="margin-top:10px"><button class="btn p sm" id="cfgo">Ver acuerdo</button><button class="btn s sm" id="cfx">Cerrar</button></div></div>`;
  box.style.display = "flex";
  $("#cfx").onclick = () => (box.style.display = "none");
  $("#cfgo").onclick = () => {
    const ev = { kind: "ocup", fecha: $("#cff").value || today(), emp: { nombre: $("#cfe").value.trim() }, patient: {}, conf: { nombre: UP($("#cfn").value.trim()), ci: $("#cfc").value.trim(), cargo: $("#cfr").value, fecha: $("#cff").value || today() } };
    box.style.display = "none"; openForms(["OCCONF"], ev);
  };
}

/* Disposición General Segunda: información estadística sin datos nominales */
function ocStats() {
  ocInit();
  const L = DB.ocup; if (!L.length) return toast("Aún no hay evaluaciones ocupacionales.");
  const n = (v) => { const x = parseFloat(String(v ?? "").replace(",", ".")); return isNaN(x) ? "" : x; };
  const riskTxt = (x) => OC_RISK.filter(([, , rows, ro]) => rows.map((r) => r[0]).concat([ro]).some((r) => (x.rg || {})[r])).map((r) => r[0]).join(", ");
  const ev = [["Código evaluación", "Fecha", "Año", "Mes", "Empresa", "RUC", "CIIU", "Puesto (CIUO)", "Tipo de evaluación", "Sexo", "Edad (años)", "Grupo prioritario", "Aptitud", "Retiro: relacionada con el trabajo", "Riesgos identificados", "N.º diagnósticos", "CIE-10", "IMC", "Consumo de tabaco", "Consumo de alcohol", "Actividad física", "Accidentes o enf. profesionales referidos"]]
    .concat(L.map((x) => [x.id, x.fecha, +x.fecha.slice(0, 4), +x.fecha.slice(5, 7), x.emp.nombre || "", x.emp.ruc || "", x.emp.ciiu || "", x.puesto || "", OC_TIPO_TXT[x.tipo], x.patient.sexo === "Masculino" ? "H" : "M", x.patient.nac ? n(edad(x.patient.nac, x.fecha)) : "",
      Object.keys(x.prior || {}).filter((k) => x.prior[k]).map((k) => ({ emb: "Embarazada", disc: "Discapacidad", cat: "Enf. catastrófica", am: "Adulto mayor" }[k])).join(", "), x.apt || "", (x.ret || {}).rel || "", riskTxt(x), (x.dx || []).length, (x.dx || []).map((d) => d.cie).filter(Boolean).join(", "), n((x.vit || {}).imc),
      ((x.cons || {}).tab || {}).no ? "No" : ((x.cons || {}).tab || {}).t ? "Sí" : "", ((x.cons || {}).alc || {}).no ? "No" : ((x.cons || {}).alc || {}).t ? "Sí" : "", (x.af || []).length ? "Sí" : "", (x.hist || []).filter((h) => h.ev === "ACC" || h.ev === "EP").length]));
  const cnt = (f) => { const m = {}; L.forEach((x) => [].concat(f(x)).forEach((k) => { if (k) m[k] = (m[k] || 0) + 1; })); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const byEmp = {}; L.forEach((x) => { const k = x.emp.nombre || "(sin empresa)"; const o = byEmp[k] = byEmp[k] || { t: 0, INGRESO: 0, PERIODICO: 0, REINTEGRO: 0, RETIRO: 0, "APTO": 0, "APTO EN OBSERVACIÓN": 0, "APTO CON LIMITACIONES": 0, "NO APTO": 0 }; o.t++; o[x.tipo]++; if (x.apt) o[x.apt]++; });
  const emp = [["Empresa", "Evaluaciones", "Ingreso", "Periódica", "Reintegro", "Retiro", "Apto", "Apto en observación", "Apto con limitaciones", "No apto"]].concat(Object.entries(byEmp).map(([k, o]) => [k, o.t, o.INGRESO, o.PERIODICO, o.REINTEGRO, o.RETIRO, o["APTO"], o["APTO EN OBSERVACIÓN"], o["APTO CON LIMITACIONES"], o["NO APTO"]]));
  const dx = [["CIE-10", "Diagnóstico", "Casos"]].concat(cnt((x) => (x.dx || []).map((d) => (d.cie || "") + "|" + (d.d || ""))).map(([k, c]) => [k.split("|")[0], k.split("|")[1], c]));
  const rk = [["Tipo de riesgo", "Factor", "Trabajadores expuestos"]];
  OC_RISK.forEach(([t, k, rows, ro]) => rows.concat([[ro, "Otros"]]).forEach(([r, lab]) => { const c = L.filter((x) => (x.rg || {})[r]).length; if (c) rk.push([t, lab === "Otros" ? "Otros" : lab, c]); }));
  XLSX_W(`Estadistica_ocupacional_${today()}.xlsx`, [["Evaluaciones (anónimas)", ev], ["Por empresa", emp], ["Diagnósticos", dx], ["Factores de riesgo", rk]]);
  toast("Estadística descargada: no incluye nombres ni cédulas (AM 00025-2025, Disposición General Segunda).");
}
