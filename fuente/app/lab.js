/* ---------- Órdenes de exámenes de laboratorio (folio SIG-OL) ---------- */
const LAB_CAT = [
  ["Hematología", ["Biometría hemática completa", "Hemoglobina y hematocrito", "Plaquetas", "Reticulocitos", "Velocidad de sedimentación globular (VSG)", "Frotis de sangre periférica", "Grupo sanguíneo y factor Rh", "Ferritina", "Hierro sérico", "Transferrina / % saturación"]],
  ["Coagulación", ["Tiempo de protrombina (TP) e INR", "Tiempo de tromboplastina parcial (TTP)", "Fibrinógeno", "Dímero D"]],
  ["Química sanguínea", ["Glucosa en ayunas", "Glucosa postprandial (2 horas)", "Curva de tolerancia a la glucosa (75 g)", "Hemoglobina glicosilada (HbA1c)", "Urea / BUN", "Creatinina", "Ácido úrico", "Colesterol total", "HDL colesterol", "LDL colesterol", "Triglicéridos", "TGO (AST)", "TGP (ALT)", "Gamma GT", "Fosfatasa alcalina", "Bilirrubinas (total, directa e indirecta)", "Proteínas totales y albúmina", "Amilasa", "Lipasa", "LDH", "CPK total", "CK-MB", "Troponina", "Sodio, potasio y cloro (electrolitos)", "Calcio", "Magnesio", "Fósforo", "PCR cuantitativa", "Procalcitonina", "Vitamina D (25-OH)", "Vitamina B12", "Ácido fólico"]],
  ["Hormonas", ["TSH", "T4 libre", "T3", "Prueba de embarazo en sangre (β-HCG cuantitativa)", "Insulina basal", "Prolactina", "FSH", "LH", "Estradiol", "Progesterona", "Testosterona total", "Cortisol", "PSA total", "PSA libre"]],
  ["Inmunología y serología", ["VIH 1 y 2 (prueba de 4.ª generación)", "VDRL / RPR", "Hepatitis B (HBsAg)", "Anti-HBs", "Hepatitis C (anti-HCV)", "Hepatitis A (IgM)", "Toxoplasma IgG e IgM", "Rubéola IgG e IgM", "Citomegalovirus IgG e IgM", "Dengue NS1", "Dengue IgG e IgM", "Factor reumatoideo", "Antiestreptolisinas (ASTO)", "Anticuerpos antinucleares (ANA)", "Reacciones febriles (Widal, Huddleson, Weil-Felix)", "Helicobacter pylori (antígeno en heces)", "Helicobacter pylori IgG", "SARS-CoV-2 (antígeno)"]],
  ["Orina", ["Examen elemental y microscópico de orina (EMO)", "Urocultivo y antibiograma", "Prueba de embarazo en orina", "Microalbuminuria", "Depuración de creatinina en orina de 24 horas", "Proteinuria en orina de 24 horas"]],
  ["Heces", ["Coproparasitario", "Coproparasitario seriado (3 muestras)", "Sangre oculta en heces", "Coprocultivo", "Rotavirus / adenovirus"]],
  ["Microbiología", ["Cultivo y antibiograma de secreción", "Hisopado faríngeo (cultivo)", "Baciloscopía (BK) en esputo", "Gram y fresco de secreción vaginal", "KOH (hongos)"]],
  ["Toxicología y ocupacional", ["Colinesterasa", "Plomo en sangre", "Drogas de abuso en orina (panel)", "Alcohol en sangre"]],
];
const LAB_PERF = {
  "Chequeo general": ["Biometría hemática completa", "Glucosa en ayunas", "Urea / BUN", "Creatinina", "Ácido úrico", "Colesterol total", "HDL colesterol", "LDL colesterol", "Triglicéridos", "Examen elemental y microscópico de orina (EMO)", "Coproparasitario"],
  "Preocupacional / ocupacional": ["Biometría hemática completa", "Grupo sanguíneo y factor Rh", "Glucosa en ayunas", "Creatinina", "Colesterol total", "Triglicéridos", "VDRL / RPR", "VIH 1 y 2 (prueba de 4.ª generación)", "Examen elemental y microscópico de orina (EMO)", "Coproparasitario"],
  "Perfil lipídico": ["Colesterol total", "HDL colesterol", "LDL colesterol", "Triglicéridos"],
  "Perfil hepático": ["TGO (AST)", "TGP (ALT)", "Gamma GT", "Fosfatasa alcalina", "Bilirrubinas (total, directa e indirecta)", "Proteínas totales y albúmina"],
  "Perfil renal": ["Urea / BUN", "Creatinina", "Ácido úrico", "Sodio, potasio y cloro (electrolitos)", "Examen elemental y microscópico de orina (EMO)"],
  "Perfil tiroideo": ["TSH", "T4 libre", "T3"],
  "Diabetes (control)": ["Glucosa en ayunas", "Hemoglobina glicosilada (HbA1c)", "Creatinina", "Microalbuminuria", "Colesterol total", "Triglicéridos"],
  "Control prenatal": ["Biometría hemática completa", "Grupo sanguíneo y factor Rh", "Glucosa en ayunas", "VDRL / RPR", "VIH 1 y 2 (prueba de 4.ª generación)", "Hepatitis B (HBsAg)", "Toxoplasma IgG e IgM", "Rubéola IgG e IgM", "Examen elemental y microscópico de orina (EMO)", "Urocultivo y antibiograma"],
  "Síndrome febril": ["Biometría hemática completa", "PCR cuantitativa", "Dengue NS1", "Dengue IgG e IgM", "Reacciones febriles (Widal, Huddleson, Weil-Felix)", "Examen elemental y microscópico de orina (EMO)"],
  "Infección urinaria": ["Examen elemental y microscópico de orina (EMO)", "Urocultivo y antibiograma", "Biometría hemática completa", "Creatinina"],
};
const LAB_ALL = LAB_CAT.flatMap(([g, l]) => l.map((e) => [g, e]));
// indicaciones de preparación según los exámenes elegidos
function labPrep(ex) {
  const has = (re) => ex.some((e) => re.test(e)), o = [];
  if (has(/Glucosa en ayunas|Colesterol|HDL|LDL|Triglic|Insulina|Hierro|Curva de tolerancia|Ácido úrico|Urea|Perfil/)) o.push("Acudir en ayunas de 8 a 12 horas (puede tomar agua). No consumir alcohol 24 horas antes.");
  if (has(/postprandial/)) o.push("Glucosa postprandial: tomar la muestra 2 horas después de iniciado el desayuno habitual.");
  if (has(/Curva de tolerancia/)) o.push("Curva de tolerancia: dura unas 2 a 3 horas; permanecer en reposo en el laboratorio durante la prueba.");
  if (has(/orina \(EMO\)|Urocultivo|Prueba de embarazo en orina|Microalbuminuria/)) o.push("Orina: primera orina de la mañana, previo aseo genital, recoger el chorro medio en frasco estéril; llevarla al laboratorio en menos de 2 horas.");
  if (has(/24 horas/)) o.push("Orina de 24 horas: desechar la primera orina del día y recolectar todas las siguientes hasta la primera del día siguiente, en recipiente refrigerado.");
  if (has(/Copro|Sangre oculta|heces|Rotavirus/)) o.push("Heces: muestra fresca en frasco limpio, sin contacto con orina ni agua del inodoro; entregar el mismo día.");
  if (has(/Sangre oculta/)) o.push("Sangre oculta: 3 días antes evitar carnes rojas, hierro oral y antiinflamatorios, si su médico lo autoriza.");
  if (has(/PSA/)) o.push("PSA: no tener relaciones sexuales ni andar en bicicleta o moto en las 48 horas previas.");
  if (has(/Cortisol/)) o.push("Cortisol: tomar la muestra entre las 7 y 9 de la mañana.");
  if (has(/Prolactina/)) o.push("Prolactina: reposo de 20 minutos antes de la toma; no realizar ejercicio el día anterior.");
  if (has(/TSH|T4|T3/)) o.push("Hormonas tiroideas: si toma levotiroxina, hacerse la muestra antes de la dosis del día.");
  if (has(/Baciloscopía/)) o.push("Baciloscopía: esputo de la primera expectoración de la mañana (no saliva), en frasco estéril.");
  if (has(/secreción vaginal/)) o.push("Secreción vaginal: no usar óvulos ni duchas vaginales y evitar relaciones sexuales 48 horas antes.");
  return o;
}

V.lab = (pre) => {
  const opts = Object.values(DB.patients).map((p) => `<option value="${esc(p.cedula)}">${esc(p.nombre)}</option>`).join("");
  $("#main").innerHTML = `<h1>Orden de exámenes de laboratorio</h1><p class="sub">Folio que se asignará: <span class="tag">${nextFolio("OL", true)}</span>. Para el laboratorio privado o de la empresa. Si el paciente va a la red pública, usa el formulario MSP 010A desde la atención.</p>
  <form id="f">${patientFields(`<label class="span2">Ocupación<input name="ocupacion"></label>`)}
  <div class="card"><h2>Solicitud</h2><div class="grid">
    <label>Fecha<input type="date" name="fecha" value="${today()}"></label>
    <label class="span2">Diagnóstico presuntivo<input name="dx"></label><label>CIE-10<input name="cie"></label>
    <label>Prioridad<select name="pri"><option>Rutina</option><option>Urgente</option></select></label>
    <label class="span3">Laboratorio (opcional)<input name="labn" placeholder="Nombre del laboratorio al que se envía"></label>
  </div></div>
  <div class="card"><h2>Exámenes</h2>
    <div class="row" style="margin-bottom:10px"><span class="hint">Perfiles:</span>${Object.keys(LAB_PERF).map((k) => `<button type="button" class="btn s sm" data-pf="${esc(k)}">${esc(k)}</button>`).join("")}<button type="button" class="btn d sm" id="labclr">Limpiar</button></div>
    <input id="labq" placeholder="Buscar examen…" style="width:100%;margin-bottom:10px">
    ${LAB_CAT.map(([g, l]) => `<div class="labg"><p class="hint" style="margin:10px 0 6px;font-weight:700;color:var(--teal)">${g}</p><div class="chks" style="--cols:3">${l.map((e) => `<label class="chk"><input type="checkbox" data-ex="${esc(e)}">${esc(e)}</label>`).join("")}</div></div>`).join("")}
    <label style="margin-top:12px">Otros exámenes (uno por línea)<textarea name="otros"></textarea></label>
    <p class="hint" id="labn" style="margin-top:8px"></p>
  </div>
  <div class="card"><h2>Indicaciones para el paciente</h2><p class="hint">Se arman solas según los exámenes; puedes editarlas.</p><textarea name="prep" style="min-height:110px"></textarea>
    <label style="margin-top:10px">Datos clínicos para el laboratorio (opcional)<input name="clin" placeholder="Ej.: fiebre de 3 días, toma metformina 850 mg"></label></div>
  <div class="row"><button class="btn p">Emitir orden y ver documento</button><span class="hint">Al emitir se asigna el folio y se guarda en el registro.</span></div></form>`;
  const f = $("#f"); wirePatient(f);
  let prepTouched = false; f.prep.addEventListener("input", () => (prepTouched = true));
  const sel = () => $$("[data-ex]:checked", f).map((i) => i.dataset.ex).concat(f.otros.value.split("\n").map((x) => x.trim()).filter(Boolean));
  const upd = () => { const ex = sel(); $("#labn").textContent = ex.length ? `${ex.length} examen(es) seleccionado(s).` : ""; if (!prepTouched) f.prep.value = labPrep(ex).join("\n"); };
  f.addEventListener("change", (e) => { if (e.target.matches("[data-ex]") || e.target.name === "otros") upd(); });
  f.otros.addEventListener("input", upd);
  $$("[data-pf]", f).forEach((b) => (b.onclick = () => { LAB_PERF[b.dataset.pf].forEach((e) => { const i = $(`[data-ex="${CSS.escape(e)}"]`, f); if (i) i.checked = true; }); upd(); }));
  $("#labclr").onclick = () => { $$("[data-ex]", f).forEach((i) => (i.checked = false)); f.otros.value = ""; prepTouched = false; upd(); };
  $("#labq").oninput = () => { const q = MSP.norm($("#labq").value); $$(".labg", f).forEach((g) => { let any = false; $$(".chk", g).forEach((l) => { const ok = !q || MSP.norm(l.textContent).includes(q) || l.querySelector("input").checked; l.style.display = ok ? "" : "none"; any = any || ok; }); g.style.display = any ? "" : "none"; }); };
  if (pre) {
    if (pre.cedula) { f.cedula.value = pre.cedula; f.cedula.dispatchEvent(new Event("change")); }
    if (pre.dx) f.dx.value = pre.dx; if (pre.cie) f.cie.value = pre.cie; if (pre.clin) f.clin.value = pre.clin;
    const otros = [];
    (pre.ex || []).forEach((name) => { const n = MSP.norm(name), hit = LAB_ALL.find(([, e]) => MSP.norm(e) === n || MSP.norm(e).startsWith(n) || n.startsWith(MSP.norm(e))); const i = hit && $(`[data-ex="${CSS.escape(hit[1])}"]`, f); if (i) i.checked = true; else otros.push(name); });
    f.otros.value = otros.join("\n"); upd();
  }
  f.onsubmit = (e) => {
    e.preventDefault(); const p = readPatient(f); if (!p.cedula || !p.nombre) return toast("Falta la cédula o el nombre del paciente.");
    const chosen = $$("[data-ex]:checked", f).map((i) => i.dataset.ex), otros = f.otros.value.split("\n").map((x) => x.trim()).filter(Boolean);
    if (!chosen.length && !otros.length) return toast("Elige al menos un examen.");
    const grupos = LAB_CAT.map(([g, l]) => [g, l.filter((x) => chosen.includes(x))]).filter(([, l]) => l.length);
    if (otros.length) grupos.push(["Otros", otros]);
    const doc = { folio: nextFolio("OL"), type: "OL", date: f.fecha.value || today(), status: "Emitida", patient: p,
      data: { dx: f.dx.value.trim(), cie: f.cie.value.trim(), pri: f.pri.value, labn: f.labn.value.trim(), grupos, ex: grupos.flatMap(([, l]) => l), prep: f.prep.value.trim(), clin: f.clin.value.trim() } };
    storePatient(p); DB.docs.unshift(doc); save(); openDoc(doc); toast(`Orden ${doc.folio} emitida y guardada.`); V.lab();
  };
  upd();
};

function renderOL(doc, mode) {
  const c = chrome(doc, "p"), d = doc.data, p = doc.patient;
  const n = d.ex.length, cols = n > 14 ? 2 : 1;
  return `<div class="page a4p">${c.wm}<div class="z">${c.head("ORDEN DE EXÁMENES", "de laboratorio clínico")}
    ${ptable(p, [["Diagnóstico presuntivo", d.dx || "", "CIE-10", d.cie || ""], ["Prioridad", d.pri, "Laboratorio", d.labn || "—"]])}
    ${d.clin ? `<div class="sm" style="margin:-2px 0 6px"><b>Datos clínicos:</b> ${esc(d.clin)}</div>` : ""}
    <div class="sec"><em>01</em>EXÁMENES SOLICITADOS <span class="sm" style="font-weight:400;letter-spacing:0">(${n})</span></div>
    <div class="olx" style="column-count:${cols}">${d.grupos.map(([g, l]) => `<div class="olg"><b>${esc(g)}</b><ul>${l.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>`).join("")}</div>
    ${d.prep ? `<div class="sec"><em>02</em>INDICACIONES PARA EL PACIENTE</div><div class="concl" style="font-size:8.8pt">${esc(d.prep).split("\n").map((x) => "• " + x).join("<br>")}</div>` : ""}
    <div class="sig" style="margin-top:12mm"><div class="sm">Fecha de emisión: <b>${fmt(doc.date)}</b><br>Válida por 30 días.</div>${c.sig(mode)}</div>
    </div>${c.foot}</div>`;
}
