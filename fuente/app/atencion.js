/* ---------- Atención única + formularios MSP (HCU 2021) ---------- */
const FORMS = {
  "002": "Consulta externa · anamnesis y examen físico", "053": "Referencia · derivación · contrarreferencia", "024": "Consentimiento informado",
  "007": "Interconsulta · solicitud e informe", "010A": "Laboratorio clínico · solicitud", "012A": "Imagenología · solicitud",
  "013A": "Anatomía patológica · solicitud", "001": "Admisión · alta · egreso", "008": "Emergencia",
  "003": "Hospitalización · anamnesis y examen físico", "005": "Evolución y prescripciones", "006": "Epicrisis",
  "010B": "Laboratorio clínico · informe", "012B": "Imagenología · informe", "013B": "Anatomía patológica · informe",
  "016": "Atención inmediata al recién nacido", "017": "Protocolo quirúrgico", "018": "Valoración preanestésica",
  "018A": "Registro transanestésico", "019": "Cuidados postanestésicos", "020": "Signos vitales", "022": "Administración de medicamentos",
  "028A": "Atención niño/niña menor de 2 meses", "028B": "Atención niño/niña de 2 meses a 5 años", "028C": "Atención niño/niña de 5 a 9 años",
  "118": "Solicitud de sangre", "119": "Transferencia", "122": "Transfusión sanguínea",
};
const AT_DOCS = ["002", "053", "024", "007", "010A", "012A", "013A", "020", "CURVAS", "EPI1", "001", "008", "AN7"];
FORMS["EPI1"] = "SIVE-Alerta · ficha EPI-1 de notificación y ficha de investigación";
FORMS["CURVAS"] = "Curvas de crecimiento OMS (028A1 · 028B1 · 028B2 · 028C1 · 028C2)";
FORMS["AN7"] = "Acta entrega-recepción de servicios de salud (Anexo 7, AM 00140-2023)";
const turnoDe = (h) => { const x = parseInt(String(h || "").slice(0, 2), 10); return isNaN(x) ? "AM" : x < 12 ? "AM" : x < 19 ? "PM" : "HS"; };
const MESES_UP = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
const UP = (s) => String(s || "").toUpperCase();

function splitName(n) {
  const w = String(n || "").trim().split(/\s+/).filter(Boolean);
  if (w.length >= 4) return { n1: w[0], n2: w.slice(1, w.length - 2).join(" "), ap1: w[w.length - 2], ap2: w[w.length - 1] };
  if (w.length === 3) return { n1: w[0], n2: "", ap1: w[1], ap2: w[2] };
  return { n1: w[0] || "", n2: "", ap1: w[1] || "", ap2: "" };
}
function condEdad(nac, ref) {
  if (!nac) return "A";
  const a = new Date(nac + "T00:00"), b = new Date((ref || today()) + "T00:00"), d = (b - a) / 864e5;
  if (d < 1) return "H"; if (d < 30) return "D"; if (d < 365) return "M"; return "A";
}
function edadNum(nac, ref, cond) {
  const a = new Date(nac + "T00:00"), b = new Date((ref || today()) + "T00:00"), d = (b - a) / 864e5;
  if (cond === "D") return Math.floor(d); if (cond === "M") return Math.floor(d / 30.44); if (cond === "H") return Math.floor(d * 24);
  return edad(nac, ref);
}
let CHK = null; // casillas extraídas de los formularios oficiales
function chkLists() {
  if (CHK) return CHK;
  const g = (c, re) => MSP.checks(c, re);
  CHK = {
    antp: g("002", /ANTECEDENTES PATOLOGICOS PERSONALES/), antf: g("002", /FAMILIARES/),
    rev: g("002", /REVISION ACTUAL/), exf: g("002", /EXAMEN FISICO/),
    mot053: g("053", /^A\./).filter((x) => /^\D/.test(x.label) && !/TELEFONO|^REFERENCIA$|^DERIVACION$/.test(MSP.norm(x.label))),
    lab: g("010A", /./).filter((x) => !(x.si === 0 && /^[AB]\./.test(x.sec)) && !/PROFESIONAL/.test(x.sec) && !/^(SI|NO|URGENTE|RUTINA)$/.test(MSP.norm(x.label))),
    img: g("012A", /ESTUDIO/).filter((x) => !/^(SI|NO)$/.test(MSP.norm(x.label))),
  };
  return CHK;
}
const chkHTML = (key, list, sel, cols) => `<div class="chks" style="--cols:${cols || 5}">${list.map((x) => `<label class="chk"><input type="checkbox" data-g="${key}" value="${x.si}:${x.a}"${sel && sel[x.si + ":" + x.a] ? " checked" : ""}>${esc(x.label)}</label>`).join("")}</div>`;

V.atencion = (at) => {
  const s = DB.settings, A = at || { fecha: today(), docs: { "002": 1 }, vit: {}, dx: [], checks: {}, d053: {}, d024: {}, d007: {}, d010: {}, d012: {}, manual: {} };
  const L = chkLists(), ck = (g) => (A.checks && A.checks[g]) || {};
  const opts = Object.values(DB.patients).map((p) => `<option value="${esc(p.cedula)}">${esc(p.nombre)}</option>`).join("");
  const v = (k, o) => esc((o || A)[k] ?? "");
  const P = A.patient || {};
  const sel = (name, list, val) => `<select name="${name}">${list.map((x) => `<option${x === val ? " selected" : ""}>${x}</option>`).join("")}</select>`;
  const dxRows = [0, 1, 2, 3, 4, 5].map((i) => { const d = A.dx[i] || {}; return `<tr><td>${i + 1}</td><td><input data-dx="d" value="${esc(d.d || "")}"></td><td><input data-dx="cie" value="${esc(d.cie || "")}"></td><td><select data-dx="t"><option${d.t !== "DEF" ? " selected" : ""}>PRE</option><option${d.t === "DEF" ? " selected" : ""}>DEF</option></select></td></tr>`; }).join("");
  const D3 = A.d053 || {}, D4 = A.d024 || {}, D7 = A.d007 || {}, D10 = A.d010 || {}, D12 = A.d012 || {};
  $("#main").innerHTML = `<h1>Atención médica</h1><p class="sub">Llena esta página una sola vez. Con estos datos se generan los formularios oficiales del MSP (HCU 2021) y, si los necesitas, la receta y los certificados.${A.id ? ` Editando <span class="tag">${A.id}</span>.` : ""}</p>
  ${!Object.keys(DB.patients).length && !DB.atenciones.length ? `<div class="banner"><b>¿Ya tenías datos en otra computadora o en el celular?</b> Ve a «Ajustes y respaldo» → «Restaurar respaldo» (si este equipo está vacío) o «Combinar respaldo» (para sumar los de ambos).</div>` : ""}
  <form id="fa" autocomplete="off">
  <div class="card"><h2>Paciente</h2><div class="grid g6">
    <label>Cédula<input name="cedula" list="pl" value="${v("cedula", P)}" required><span class="hint" id="cedmsg">Si ya está registrado, sus datos se llenan solos.</span></label>
    <label>Primer apellido<input name="ap1" value="${v("ap1", P)}" required></label><label>Segundo apellido<input name="ap2" value="${v("ap2", P)}"></label>
    <label>Primer nombre<input name="n1" value="${v("n1", P)}" required></label><label>Segundo nombre<input name="n2" value="${v("n2", P)}"></label>
    <label>Sexo<select name="sexo"><option${P.sexo !== "Masculino" ? " selected" : ""}>Femenino</option><option${P.sexo === "Masculino" ? " selected" : ""}>Masculino</option></select></label>
    <label>Fecha de nacimiento<input type="date" name="nac" value="${v("nac", P)}"></label><label>Edad<input name="edad" value="${v("edad", P)}" placeholder="Se calcula sola"></label>
    <label>Teléfono<input name="tel" value="${v("tel", P)}"></label><label class="span2">Correo<input name="email" type="email" value="${v("email", P)}"></label><label>Ocupación<input name="ocupacion" value="${v("ocupacion", P)}"></label>
    <label class="span2">Empresa o institución<input name="empresa" value="${v("empresa", P)}"></label>
    <label>Provincia<input name="prov" value="${v("prov", P) || "GUAYAS"}"></label><label>Cantón<input name="canton" value="${v("canton", P) || "GUAYAQUIL"}"></label><label>Parroquia<input name="parroq" value="${v("parroq", P)}"></label>
    <label class="span3">Domicilio<input name="domicilio" value="${v("domicilio", P)}"></label>
    <label>N.º historia clínica<input name="hcu" value="${v("hcu", P)}" placeholder="La cédula"></label><label>N.º archivo<input name="archivo" value="${v("archivo", P)}" placeholder="La cédula"></label>
    <label class="span4">Alergias<input name="alergias" value="${v("alergias", P)}" placeholder="Niega, o detalla"></label>
  </div><datalist id="pl">${opts}</datalist></div>

  <div class="card"><h2>Consulta</h2><div class="grid g6">
    <label>Fecha<input type="date" name="fecha" value="${v("fecha")}"></label><label>Hora<input type="time" name="hora" value="${v("hora") || new Date().toTimeString().slice(0, 5)}"></label>
    <label>Consulta${sel("tipo", ["Primera", "Subsecuente"], A.tipo)}</label>
    <label>Servicio${sel("servicio", ["Consulta externa", "Emergencia", "Hospitalización"], A.servicio)}</label>
    <label class="span2">Especialidad<input name="especialidad" value="${v("especialidad") || "MEDICINA GENERAL"}"></label>
    <label class="span6">B. Motivo de consulta<input name="motivo" value="${v("motivo")}"></label>
    <label class="span6">E. Enfermedad o problema actual <span class="hint">cronología, localización, características, intensidad, frecuencia, factores agravantes</span><textarea name="enf">${v("enf")}</textarea></label>
  </div></div>

  <div class="card"><h2>Antecedentes</h2>
    <p class="hint">C. Personales (marca lo que presenta y describe: clínicos, quirúrgicos, obstétricos, alérgicos)</p>${chkHTML("antp", L.antp, ck("antp"))}
    <textarea name="antp" style="margin-top:8px">${v("antp")}</textarea>
    <p class="hint" style="margin-top:14px">D. Familiares</p>${chkHTML("antf", L.antf, ck("antf"))}
    <textarea name="antf" style="margin-top:8px">${v("antf")}</textarea>
  </div>

  <div class="card"><h2>F. Constantes vitales y antropometría</h2><div class="grid g6">
    <label>Temperatura °C<input name="v_t" value="${v("t", A.vit)}"></label><label>Presión arterial<input name="v_pa" value="${v("pa", A.vit)}" placeholder="120/80"></label>
    <label>Pulso /min<input name="v_fc" value="${v("fc", A.vit)}"></label><label>Frec. respiratoria /min<input name="v_fr" value="${v("fr", A.vit)}"></label>
    <label>Saturación O₂ %<input name="v_sat" value="${v("sat", A.vit)}"></label><label>Glucosa capilar mg/dl<input name="v_glu" value="${v("glu", A.vit)}"></label>
    <label>Peso kg<input name="v_peso" value="${v("peso", A.vit)}"></label><label>Talla cm<input name="v_talla" value="${v("talla", A.vit)}"></label>
    <label>IMC<input name="v_imc" value="${v("imc", A.vit)}" placeholder="Se calcula solo"></label><label>Perímetro abdominal cm<input name="v_pabd" value="${v("pabd", A.vit)}"></label>
    <label>Hemoglobina capilar g/dl<input name="v_hb" value="${v("hb", A.vit)}"></label><label>Perímetro cefálico cm<input name="v_pc" value="${v("pc", A.vit)}" placeholder="Niños"></label>
  </div></div>

  <div class="card"><h2>G. Revisión actual de órganos y sistemas</h2><p class="hint">Marca cuando presenta patología y descríbela.</p>${chkHTML("rev", L.rev, ck("rev"))}
    <textarea name="rev" style="margin-top:8px">${v("rev")}</textarea></div>
  <div class="card"><h2>H. Examen físico</h2><p class="hint">Marca cuando presenta patología (R regional · S sistémico) y describe.</p>${chkHTML("exf", L.exf, ck("exf"))}
    <textarea name="exf" style="margin-top:8px;min-height:100px">${v("exf")}</textarea></div>

  <div class="card"><h2>I. Diagnósticos</h2><p class="hint">Escribe el nombre o el código: aparece la lista CIE-10 del MSP para elegir.</p><div id="sivealert" class="banner" style="display:none"></div><table class="t"><thead><tr><th style="width:3%">#</th><th>Diagnóstico</th><th style="width:16%">CIE-10</th><th style="width:12%">PRE / DEF</th></tr></thead><tbody id="dxb">${dxRows}</tbody></table></div>
  <div class="card"><h2>J. Plan de tratamiento</h2><p class="hint">Diagnóstico, terapéutico y educacional.</p><textarea name="plan" style="min-height:110px">${v("plan")}</textarea>
    <label style="margin-top:12px">Hallazgos relevantes de exámenes y procedimientos <span class="hint">se usa en la referencia y la interconsulta</span><textarea name="hall">${v("hall")}</textarea></label></div>

  <div class="card"><h2>Formularios a generar</h2><div class="chks" style="--cols:3">
    ${AT_DOCS.map((c) => `<label class="chk"><input type="checkbox" data-doc="${c}"${A.docs && A.docs[c] ? " checked" : ""}><b>${c}</b>&nbsp;${FORMS[c]}</label>`).join("")}</div>
    <p class="hint" style="margin-top:10px">Los demás formularios (hospitalización, quirúrgicos, pediatría, sangre) están en «Formularios MSP», con los datos del paciente ya puestos.</p></div>

  <div class="card dsec" data-for="053"><h2>053 · Referencia / derivación</h2><div class="grid g6">
    <label>Tipo${sel("r_tipo", ["Referencia", "Derivación"], D3.tipo)}</label>
    <label class="span2">Institución del sistema (destino)<input name="r_inst" value="${v("inst", D3) || "MSP"}"></label>
    <label class="span3">Establecimiento de salud (destino)<input name="r_estab" value="${v("estab", D3)}"></label>
    <label class="span3">Servicio<input name="r_serv" value="${v("serv", D3)}"></label><label class="span3">Especialidad<input name="r_esp" value="${v("esp", D3)}"></label>
  </div><p class="hint" style="margin-top:10px">Motivo</p>${chkHTML("mot053", L.mot053, ck("mot053"), 3)}</div>

  <div class="card dsec" data-for="024"><h2>024 · Consentimiento informado</h2><div class="grid g6">
    <label class="span3">Consentimiento informado para<input name="c_para" value="${v("para", D4)}"></label>
    <label class="span2">Servicio<input name="c_serv" value="${v("serv", D4) || "CONSULTA EXTERNA"}"></label>
    <label>Tipo de atención${sel("c_tipo", ["Ambulatorio", "Hospitalización"], D4.tipo)}</label>
    <label class="span6">Nombre del procedimiento recomendado<input name="c_proc" value="${v("proc", D4)}"></label>
    <label class="span3">En qué consiste<textarea name="c_cons">${v("cons", D4)}</textarea></label><label class="span3">Cómo se realiza<textarea name="c_como">${v("como", D4)}</textarea></label>
    <label class="span2">Duración estimada<input name="c_dur" value="${v("dur", D4)}"></label><label class="span4">Beneficios<input name="c_ben" value="${v("ben", D4)}"></label>
    <label class="span3">Riesgos frecuentes (poco graves)<input name="c_rf" value="${v("rf", D4)}"></label><label class="span3">Riesgos poco frecuentes (graves)<input name="c_rg" value="${v("rg", D4)}"></label>
    <label class="span6">Riesgos específicos del paciente (edad, estado de salud, creencias, valores)<textarea name="c_re">${v("re", D4)}</textarea></label>
    <label class="span2">Alternativas<input name="c_alt" value="${v("alt", D4)}"></label><label class="span2">Manejo posterior<input name="c_post" value="${v("post", D4)}"></label><label class="span2">Consecuencias si no se realiza<input name="c_noh" value="${v("noh", D4)}"></label>
    <label class="span3">Representante legal (si aplica)<input name="c_rep" value="${v("rep", D4)}"></label><label>Cédula representante<input name="c_repci" value="${v("repci", D4)}"></label><label class="span2">Parentesco<input name="c_par" value="${v("par", D4)}"></label>
  </div></div>

  <div class="card dsec" data-for="007"><h2>007 · Interconsulta (solicitud)</h2><div class="grid g6">
    <label class="span3">Especialidad consultada<input name="i_esp" value="${v("esp", D7)}"></label><label>Urgente${sel("i_urg", ["NO", "SI"], D7.urg)}</label>
    <label class="span6">Motivo o pregunta para el especialista<input name="i_mot" value="${v("mot", D7)}"></label>
  </div></div>

  <div class="card dsec" data-for="010A"><h2>010A · Laboratorio clínico</h2><div class="grid g6"><label>Prioridad${sel("l_pri", ["Rutina", "Urgente"], D10.pri)}</label><input name="l_q" placeholder="Buscar examen…" class="span5" style="align-self:end"></div>
    <div id="labl" style="margin-top:10px">${chkHTML("lab", L.lab, ck("lab"), 4)}</div></div>

  <div class="card dsec" data-for="012A"><h2>012A · Imagenología</h2>${chkHTML("img", L.img, ck("img"), 4)}<div class="grid g6" style="margin-top:10px">
    <label>Prioridad${sel("m_pri", ["Rutina", "Urgente", "Control"], D12.pri)}</label><label>Sedación${sel("m_sed", ["NO", "SI"], D12.sed)}</label><label>FUM<input type="date" name="m_fum" value="${v("fum", D12)}"></label>
    <label class="span6">Descripción del estudio (región, proyecciones)<input name="m_desc" value="${v("desc", D12)}"></label>
    <label class="span6">Motivo de la solicitud<textarea name="m_mot">${v("mot", D12)}</textarea></label>
  </div></div>

  <div class="card dsec" data-for="EPI1"><h2>EPI-1 · Notificación SIVE-Alerta</h2><div class="grid g6">
    <label class="span4">Evento de notificación obligatoria<select name="e_ev"><option value="">— Elegir —</option>${[...new Set(SIVE_EV.map((e) => e.g))].map((g) => `<optgroup label="${esc(g)}">${SIVE_EV.map((e, i) => e.g === g ? `<option value="${i}"${String((A.dEPI || {}).ev) === String(i) ? " selected" : ""}>${esc(e.e)}${e.c ? " · " + e.c : ""}</option>` : "").join("")}</optgroup>`).join("")}</select><span class="hint" id="evinfo"></span></label>
    <label class="span2">Fecha de inicio de síntomas<input type="date" name="e_ini" value="${v("ini", A.dEPI || {})}"></label>
    <label class="span3">Diagnóstico inicial (sindrómico o enfermedad)<input name="e_dxi" value="${v("dxi", A.dEPI || {})}" placeholder="Se llena con el evento elegido"></label>
    <label class="span3">Lugar probable de infección<input name="e_lugar" value="${v("lugar", A.dEPI || {})}"></label>
    <label>Embarazada${sel("e_emb", ["—", "NO", "SI"], (A.dEPI || {}).emb)}</label><label>Semanas de gestación<input name="e_sem" value="${v("sem", A.dEPI || {})}"></label>
    <label>Muestra de laboratorio${sel("e_mue", ["—", "SI", "NO"], (A.dEPI || {}).mue)}</label>
    <label>Nacionalidad<input name="e_nac" value="${v("nac", A.dEPI || {}) || "ECUATORIANA"}"></label><label>Etnia<input name="e_etnia" value="${v("etnia", A.dEPI || {})}" placeholder="Mestizo, indígena…"></label>
    <label>Barrio / localidad<input name="e_barrio" value="${v("barrio", A.dEPI || {})}"></label>
  </div><p class="hint" style="margin-top:8px">Salen las dos hojas: notificación y cierre de caso (EPI-1) y ficha de investigación clínico-epidemiológica. Lo que falte (laboratorio, cierre, contactos) se completa en la vista previa.</p></div>

  <div class="card dsec" data-for="AN7"><h2>Acta entrega-recepción · Anexo 7 (AM 00140-2023)</h2><div class="grid g6">
    <label class="span2">Código de validación (RPC)<input name="a_cod" value="${v("cod", A.dAN7 || {})}"></label>
    <label class="span4">Tipo de servicio entregado<input name="a_serv" value="${v("serv", A.dAN7 || {}) || "CONSULTA EXTERNA - MEDICINA GENERAL"}"></label>
    <label class="span6">Observaciones<input name="a_obs" value="${v("obs", A.dAN7 || {})}"></label>
  </div><p class="hint" style="margin-top:8px">Solo para atenciones a pacientes derivados por la red pública (IESS, MSP, ISSFA, ISSPOL) o SPPAT: el acta y el código de validación son requisito para el pago (art. 73).</p></div>

  <div class="row" style="position:sticky;bottom:0;background:var(--bg);padding:12px 0;border-top:1px solid var(--line)">
    <button class="btn p">Guardar y ver formularios</button>
    <button type="button" class="btn s" data-go="receta">Receta con estos datos</button>
    <button type="button" class="btn s" data-go="iess">Certificado IESS</button>
    <button type="button" class="btn s" data-go="general">Otro certificado</button>
    <button type="button" class="btn s" data-go="mental">Salud mental</button>
    <button type="button" class="btn s" data-go="lab">Orden de laboratorio</button>
  </div></form>
  <div class="card" style="margin-top:18px"><h2>Atenciones guardadas</h2><input id="aq" placeholder="Buscar por nombre o cédula" style="width:100%"><div id="atl" style="margin-top:10px"></div></div>`;

  const f = $("#fa");
  // paciente
  const ced = f.cedula, msg = $("#cedmsg");
  const fillP = () => {
    const c = ced.value.replace(/\D/g, ""), p = DB.patients[c];
    if (p) {
      const sp = p.ap1 ? p : Object.assign({}, p, splitName(p.nombre));
      ["ap1", "ap2", "n1", "n2", "nac", "sexo", "tel", "email", "ocupacion", "empresa", "domicilio", "prov", "canton", "parroq", "alergias", "hcu", "archivo"].forEach((k) => { if (f[k] && sp[k] != null && sp[k] !== "") f[k].value = sp[k]; });
      f.nac.dispatchEvent(new Event("change")); msg.textContent = "Paciente encontrado: datos cargados."; msg.className = "hint";
    } else if (c.length === 10) { msg.textContent = cedulaOk(c) ? "Cédula válida. Paciente nuevo." : "Revisa la cédula: el dígito verificador no coincide."; msg.className = cedulaOk(c) ? "hint" : "hint warnt"; }
  };
  ced.addEventListener("change", fillP); ced.addEventListener("input", () => { if (ced.value.replace(/\D/g, "").length === 10) fillP(); });
  f.nac.addEventListener("change", () => { const e = edad(f.nac.value, f.fecha.value); if (e !== "") f.edad.value = e + " años"; });
  // IMC
  const imc = () => { const p = parseFloat(String(f.v_peso.value).replace(",", ".")), t = parseFloat(String(f.v_talla.value).replace(",", ".")) / 100; if (p > 0 && t > 0) f.v_imc.value = (p / (t * t)).toFixed(1); };
  f.v_peso.oninput = imc; f.v_talla.oninput = imc;
  // secciones de cada formulario
  const vis = () => $$(".dsec", f).forEach((d) => (d.style.display = $(`[data-doc="${d.dataset.for}"]`, f).checked ? "" : "none"));
  $$("[data-doc]", f).forEach((c) => (c.onchange = vis)); vis();
  // eventos de notificación obligatoria según los CIE-10 de los diagnósticos
  const evInfo = () => { const e = SIVE_EV[+f.e_ev.value]; $("#evinfo").textContent = f.e_ev.value === "" ? "" : `Diagnóstico: ${e.dx}. Requiere ficha de investigación.`; if (e && !f.e_dxi.value) f.e_dxi.placeholder = e.e; };
  f.e_ev.onchange = evInfo; evInfo();
  const chkSive = () => {
    const hits = []; $$("#dxb [data-dx=cie]").forEach((i) => sivePara(i.value).forEach((e) => { if (!hits.includes(e)) hits.push(e); }));
    const b = $("#sivealert"), key = hits.map((e) => e.e).join("|");
    if (b._k === key) return; b._k = key;
    if (!hits.length) { b.style.display = "none"; return; }
    b.style.display = ""; b.innerHTML = `<b>Evento de notificación obligatoria (SIVE-Alerta):</b> ${hits.map((e) => esc(e.e) + " (" + e.c + ")").join(", ")}. <button type="button" class="btn s sm" id="sivego">Generar ficha EPI-1</button>`;
    $("#sivego").onclick = () => { $('[data-doc="EPI1"]', f).checked = true; vis(); f.e_ev.value = String(SIVE_EV.indexOf(hits[0])); evInfo(); $('[data-for="EPI1"]', f).scrollIntoView({ behavior: "smooth", block: "center" }); };
  };
  $("#dxb").addEventListener("input", chkSive); $("#dxb").addEventListener("change", chkSive); chkSive();
  f.l_q.oninput = () => { const q = MSP.norm(f.l_q.value); $$("#labl .chk").forEach((l) => (l.style.display = !q || MSP.norm(l.textContent).includes(q) || l.querySelector("input").checked ? "" : "none")); };

  const read = () => {
    const c = ced.value.replace(/\D/g, "");
    const p = { cedula: c, ap1: UP(f.ap1.value.trim()), ap2: UP(f.ap2.value.trim()), n1: UP(f.n1.value.trim()), n2: UP(f.n2.value.trim()), sexo: f.sexo.value, nac: f.nac.value,
      edad: f.edad.value.trim(), tel: f.tel.value.trim(), email: f.email.value.trim(), ocupacion: f.ocupacion.value.trim(), empresa: f.empresa.value.trim(), domicilio: f.domicilio.value.trim(),
      prov: UP(f.prov.value.trim()), canton: UP(f.canton.value.trim()), parroq: UP(f.parroq.value.trim()), alergias: f.alergias.value.trim(), hcu: f.hcu.value.trim(), archivo: f.archivo.value.trim() };
    p.nombre = [p.n1, p.n2, p.ap1, p.ap2].filter(Boolean).join(" ");
    const g = (k) => Object.fromEntries($$(`[data-g="${k}"]:checked`, f).map((i) => [i.value, "X"]));
    const at = Object.assign({}, A, {
      patient: p, fecha: f.fecha.value || today(), hora: f.hora.value, tipo: f.tipo.value, servicio: f.servicio.value, especialidad: UP(f.especialidad.value.trim()),
      motivo: f.motivo.value.trim(), enf: f.enf.value.trim(), antp: f.antp.value.trim(), antf: f.antf.value.trim(), rev: f.rev.value.trim(), exf: f.exf.value.trim(),
      plan: f.plan.value.trim(), hall: f.hall.value.trim(),
      vit: Object.fromEntries(["t", "pa", "fc", "fr", "sat", "glu", "peso", "talla", "imc", "pabd", "hb", "pc"].map((k) => [k, f["v_" + k].value.trim()])),
      dx: $$("#dxb tr").map((r) => ({ d: $("[data-dx=d]", r).value.trim(), cie: UP($("[data-dx=cie]", r).value.trim()), t: $("[data-dx=t]", r).value })),
      checks: { antp: g("antp"), antf: g("antf"), rev: g("rev"), exf: g("exf"), mot053: g("mot053"), lab: g("lab"), img: g("img") },
      docs: Object.fromEntries($$("[data-doc]:checked", f).map((i) => [i.dataset.doc, 1])),
      d053: { tipo: f.r_tipo.value, inst: UP(f.r_inst.value.trim()), estab: UP(f.r_estab.value.trim()), serv: UP(f.r_serv.value.trim()), esp: UP(f.r_esp.value.trim()) },
      d024: Object.fromEntries(["para", "serv", "tipo", "proc", "cons", "como", "dur", "ben", "rf", "rg", "re", "alt", "post", "noh", "rep", "repci", "par"].map((k) => [k, f["c_" + k].value.trim()])),
      d007: { esp: UP(f.i_esp.value.trim()), urg: f.i_urg.value, mot: f.i_mot.value.trim() },
      d010: { pri: f.l_pri.value }, dEPI: { ev: f.e_ev.value, ini: f.e_ini.value, dxi: f.e_dxi.value.trim(), lugar: f.e_lugar.value.trim(), emb: f.e_emb.value, sem: f.e_sem.value.trim(), mue: f.e_mue.value, nac: f.e_nac.value.trim(), etnia: f.e_etnia.value.trim(), barrio: f.e_barrio.value.trim() }, dAN7: { cod: f.a_cod.value.trim(), serv: UP(f.a_serv.value.trim()), obs: f.a_obs.value.trim() }, d012: { pri: f.m_pri.value, sed: f.m_sed.value, fum: f.m_fum.value, desc: f.m_desc.value.trim(), mot: f.m_mot.value.trim() },
    });
    at.dx = at.dx.filter((d) => d.d);
    return at;
  };
  const persist = (at) => {
    if (!at.patient.cedula || !at.patient.ap1 || !at.patient.n1) { toast("Faltan la cédula, el primer apellido o el primer nombre del paciente."); return null; }
    storePatient(at.patient);
    if (!at.id) { const y = new Date().getFullYear(); DB.atCount = DB.atCount && DB.atCount.year === y ? DB.atCount : { year: y, next: 1 }; at.id = `AT-${y}-${String(DB.atCount.next++).padStart(4, "0")}`; at.created = today(); }
    const i = DB.atenciones.findIndex((x) => x.id === at.id); if (i >= 0) DB.atenciones[i] = at; else DB.atenciones.unshift(at);
    save(); Object.assign(A, at); return at;
  };
  f.onsubmit = (e) => {
    e.preventDefault(); const at = persist(read()); if (!at) return;
    const codes = AT_DOCS.filter((c) => at.docs[c]); if (!codes.length) return toast("Elige al menos un formulario.");
    openForms(codes, at); toast(`Atención ${at.id} guardada.`);
    const h = $("p.sub", $("#main")); if (h && !h.querySelector(".tag")) h.insertAdjacentHTML("beforeend", ` Editando <span class="tag">${at.id}</span>.`);
  };
  // receta y certificados con estos datos
  $$("[data-go]", f).forEach((b) => (b.onclick = () => {
    const at = persist(read()); if (!at) return;
    const p = at.patient, d0 = at.dx[0] || {};
    if (b.dataset.go === "lab") {
      go("lab"); const L2 = chkLists().lab, sel2 = (at.checks && at.checks.lab) || {};
      V.lab({ cedula: p.cedula, dx: at.dx.map((d) => d.d).join("; "), cie: at.dx.map((d) => d.cie).filter(Boolean).join("; "), clin: at.motivo || "", ex: L2.filter((x) => sel2[x.si + ":" + x.a]).map((x) => x.label) });
      toast("Datos del paciente, diagnóstico y exámenes marcados en el 010A cargados."); return;
    }
    go(b.dataset.go); const g = $("#f");
    g.cedula.value = p.cedula; g.cedula.dispatchEvent(new Event("change"));
    if (g.dx) g.dx.value = at.dx.map((d) => d.d).join("; "); if (g.cie) g.cie.value = at.dx.map((d) => d.cie).filter(Boolean).join("; ");
    if (b.dataset.go === "iess") {
      const tb = $("#dxs tbody"); tb.innerHTML = ""; (at.dx.length ? at.dx : [{}]).forEach((d) => { $("#adddx").click(); const r = tb.lastElementChild; $("[data-k=dx]", r).value = d.d || ""; $("[data-k=cie]", r).value = d.cie || ""; });
      g.cuadro.value = at.enf || at.motivo || ""; g.feval.value = at.fecha;
    }
    if (g.feval && b.dataset.go === "general") g.feval.value = at.fecha;
    toast("Datos del paciente y diagnóstico cargados.");
  }));
  // lista de atenciones
  const drawL = () => {
    const q = $("#aq").value.toLowerCase();
    const L2 = DB.atenciones.filter((a) => !q || (a.patient.nombre + a.patient.cedula + a.id).toLowerCase().includes(q)).slice(0, 40);
    $("#atl").innerHTML = L2.length ? `<table class="t"><thead><tr><th>Atención</th><th>Fecha</th><th>Paciente</th><th>Diagnóstico</th><th></th></tr></thead><tbody>${L2.map((a) => `<tr><td class="tag">${a.id}</td><td>${fmt(a.fecha)}</td><td>${esc(a.patient.nombre)}</td><td>${esc((a.dx[0] || {}).d || "")}</td><td class="row"><button class="btn s sm" data-o="${a.id}">Abrir</button><button class="btn s sm" data-p="${a.id}">Formularios</button></td></tr>`).join("")}</tbody></table>` : `<p class="hint">Aún no hay atenciones guardadas.</p>`;
    $$("[data-o]", $("#atl")).forEach((b) => (b.onclick = () => { V.atencion(JSON.parse(JSON.stringify(DB.atenciones.find((a) => a.id === b.dataset.o)))); window.scrollTo(0, 0); }));
    $$("[data-p]", $("#atl")).forEach((b) => (b.onclick = () => { const a = DB.atenciones.find((x) => x.id === b.dataset.p); openForms(AT_DOCS.filter((c) => a.docs[c]), a); }));
  };
  $("#aq").oninput = drawL; drawL();
};

/* contexto común que entiende el motor MSP */
function mspCtx(at) {
  const s = DB.settings, p = (at && at.patient) || {}, fecha = (at && at.fecha) || today();
  const cond = p.nac ? condEdad(p.nac, fecha) : "A";
  return {
    inst: UP(s.inst), unicodigo: s.unicodigo, estab: UP(s.estab), tipologia: UP(s.tipologia),
    hcu: p.hcu || p.cedula, archivo: p.archivo || p.cedula, ap1: p.ap1, ap2: p.ap2, n1: p.n1, n2: p.n2,
    sexo: p.sexo ? (p.sexo === "Masculino" ? "M" : "F") : "", fnac: p.nac || "", cond: p.cedula ? cond : "",
    edad: p.nac ? String(edadNum(p.nac, fecha, cond)) : String(p.edad || "").replace(/\D/g, ""), cedula: p.cedula, tel: p.tel,
    fecha: at ? fecha : "", hora: (at && at.hora) || "", pn1: UP(s.pn1), pa1: UP(s.pa1), pa2: UP(s.pa2), pdoc: s.ci,
    motivo: at && at.motivo, enf: at && at.enf, antp: at && at.antp, antf: at && at.antf, rev: at && at.rev, exf: at && at.exf,
    hall: at && at.hall, plan: at && at.plan, vit: at && at.vit, dx: at && at.dx,
  };
}
/* valores propios de cada formulario (celdas oficiales) */
function mspMap(code, at) {
  const o = {}, X = "X", ln = (si, addrs, text) => { if (text) { const a = addrs.slice(); a._text = text; o[si + ":" + addrs[0] + "~"] = a; } };
  const chk = (g) => Object.assign(o, (at.checks && at.checks[g]) || {});
  const serv = at.servicio || "Consulta externa", d0 = at.dx[0] || {}, d1 = at.dx[1] || {};
  if (code === "002") {
    o["0:" + (at.tipo === "Subsecuente" ? "BI7" : "AS7")] = X;
    ["antp", "antf", "rev", "exf"].forEach(chk);
  }
  if (code === "053") {
    const d = at.d053 || {}, p = at.patient;
    o["0:" + (d.tipo === "Derivación" ? "BH7" : "AU7")] = X;
    Object.assign(o, { "0:A12": p.prov, "0:M12": p.canton, "0:X12": p.parroq, "0:A17": d.inst, "0:S17": d.estab, "0:AM17": d.serv, "0:BF17": d.esp });
    chk("mot053");
  }
  if (code === "024") {
    const d = at.d024 || {}, p = at.patient, s = DB.settings;
    Object.assign(o, { "0:S10": UP(d.para), "0:G11": UP(d.serv), ["0:" + (d.tipo === "Hospitalización" ? "BM11" : "AZ11")]: X,
      "0:I12": at.dx.map((x) => x.d).join("; "), "0:BE12": at.dx.map((x) => x.cie).filter(Boolean).join("; "), "0:X13": UP(d.proc),
      "0:V35": d.dur, "0:V36": d.ben, "0:V37": d.rf, "0:V38": d.rg, "0:V42": d.alt, "0:V43": d.post, "0:V44": d.noh,
      "1:L2": at.fecha, "1:AY2": at.hora, "1:A11": p.nombre, "1:AG11": p.cedula, "1:A14": UP(s.nombre),
      "1:A20": UP(d.rep), "1:AG20": d.repci, "1:A23": d.par });
    ln(0, ["L14", "A15"], d.cons); ln(0, ["L16", "A17"], d.como); ln(0, ["A40", "A41"], d.re);
  }
  if (code === "007") {
    const d = at.d007 || {};
    o["0:" + (serv === "Emergencia" ? "C10" : serv === "Hospitalización" ? "J10" : "G10")] = X;
    Object.assign(o, { "0:K10": at.especialidad, "0:F11": d.esp, "0:F12": d.mot ? "Motivo: " + d.mot : "", ["0:" + (d.urg === "SI" ? "X10" : "Z10")]: X });
  }
  if (code === "010A") {
    o["0:" + (serv === "Emergencia" ? "AW9" : serv === "Hospitalización" ? "AW11" : "AW10")] = X;
    Object.assign(o, { "0:BF9": at.especialidad, "0:B10": d0.d, "0:AG10": d0.cie, "0:B11": d1.d, "0:AG11": d1.cie, ["0:" + ((at.d010 || {}).pri === "Urgente" ? "BU10" : "BU11")]: X });
    chk("lab");
  }
  if (code === "EPI1") Object.assign(o, mapEPI1(at));
  if (code === "012A") {
    const d = at.d012 || {};
    o["0:" + (serv === "Emergencia" ? "F10" : serv === "Hospitalización" ? "X10" : "O10")] = X;
    Object.assign(o, { "0:Z10": at.especialidad, ["0:" + (d.pri === "Urgente" ? "BG10" : d.pri === "Control" ? "BR10" : "BL10")]: X,
      ["0:" + (d.sed === "SI" ? "BN13" : "BR13")]: X, "0:K19": d.fum });
    ln(0, ["I14", "A15", "A16"], d.desc); ln(0, ["A20", "A21", "A22"], d.mot);
    chk("img");
  }
  return o;
}

let PVMODE = "doc", PVPAGES = null;
function openForms(codes, at, opts) {
  opts = opts || {};
  PVMODE = "msp"; CUR = null;
  const pv = $("#pv"); pv.innerHTML = "";
  $("#mtitle").textContent = at && at.patient ? `${at.id || "Formularios"} · ${at.patient.nombre}` : "Formularios MSP";
  $("#mhint").textContent = "Haz clic en cualquier casilla para escribir; las casillas pequeñas se marcan con X. " + (at && at.id ? "Lo que escribas aquí se guarda con la atención." : "Lo que escribas aquí se imprime, pero no se guarda.");
  $("#sigwrap").style.display = "none";
  $("#modal").style.display = "block";
  const ctx = mspCtx(at && at.patient ? at : null);
  PVPAGES = [];
  codes.forEach((code) => {
    const head = document.createElement("div"); head.className = "pvh"; head.textContent = `SNS-MSP/HCU-form.${code} · ${FORMS[code] || ""}`; pv.appendChild(head);
    if (code === "CURVAS") { const gp = growthPanel(at); pv.appendChild(gp); pv.appendChild(gp._host); gp._draw(); PVPAGES.push({ code, pages: [], growth: gp }); return; }
    if (code === "AN7") { const pg = actaPage(at); pv.appendChild(pg); PVPAGES.push({ code, pages: [], acta: pg }); return; }
    const pages = MSP.render(code, { edit: true, sheets: code === "007" && at && at.dx ? [0] : undefined });
    let panel = null;
    if (code === "020") { panel = curvePanel(at); pv.appendChild(panel); }
    pages.forEach((p) => pv.appendChild(p)); MSP.layout(pages);
    if (panel) panel._pages = pages;
    if (code !== "EPI1") MSP.smart(pages, ctx);
    if (at && at.dx) MSP.fill(pages, mspMap(code, at));
    else if (at && at.patient && code === "EPI1") MSP.fill(pages, mapEPI1(Object.assign({ fecha: today() }, at)));
    const base = MSP.read(pages);
    const man = at && at.manual && at.manual[code]; if (man) MSP.fill(pages, man);
    if (panel) panel._draw();
    MSP.fit(pages);
    PVPAGES.push({ code, pages, base, panel });
  });
  PVPAGES.at = at && at.id ? at : null; PVPAGES._at = at;
  fitPreview();
}
function captureManual() {
  (PVPAGES || []).forEach((x) => x.growth && x.growth._save());
  const at = PVPAGES && PVPAGES.at; if (!at) return;
  at.manual = at.manual || {};
  PVPAGES.forEach(({ code, pages, base, panel, acta, growth }) => {
    if (growth) return;
    if (acta) { at.manual[code] = Object.fromEntries($$("[data-k]", acta).map((e) => [e.dataset.k, e.innerText.trim()])); return; }
    if (panel) at.curva = panel._read();
    const cv = new Set(); pages.forEach((p) => p.querySelectorAll("td[data-cv]").forEach((td) => cv.add(p._si + ":" + td.getAttribute("data-a"))));
    const cur = MSP.read(pages), d = {};
    cv.forEach((k) => { delete cur[k]; delete base[k]; });
    Object.keys(cur).forEach((k) => { if (cur[k] !== base[k]) d[k] = cur[k]; });
    Object.keys(base).forEach((k) => { if (!(k in cur)) d[k] = ""; });
    at.manual[code] = d;
  });
  const i = DB.atenciones.findIndex((x) => x.id === at.id); if (i >= 0) DB.atenciones[i] = at; save();
}

V.formularios = () => {
  const opts = Object.values(DB.patients).map((p) => `<option value="${esc(p.cedula)}">${esc(p.nombre)}</option>`).join("");
  $("#main").innerHTML = `<h1>Formularios MSP</h1><p class="sub">Los ${Object.keys(FORMS).length} formularios de la historia clínica única (SNS-MSP/HCU 2021), con el mismo diseño del original. Elige un paciente para que salgan con sus datos, o imprímelos en blanco.</p>
  <div class="card"><div class="grid"><label class="span2">Paciente (cédula)<input id="fp" list="pl2" placeholder="Opcional"><span class="hint" id="fpm">Sin paciente: el formulario sale con los datos del establecimiento y del profesional.</span></label></div><datalist id="pl2">${opts}</datalist></div>
  <div class="card"><table class="t"><thead><tr><th style="width:9%">Código</th><th>Formulario</th><th style="width:18%"></th></tr></thead><tbody>
  ${Object.keys(FORMS).sort().map((c) => `<tr><td class="tag">${c}</td><td>${FORMS[c]}</td><td><button class="btn s sm" data-f="${c}">Abrir</button></td></tr>`).join("")}
  </tbody></table><p class="hint" style="margin-top:10px">Las curvas de crecimiento (028A1, 028B1, 028B2, 028C1, 028C2) se dibujan con los patrones OMS y las medidas del paciente: ábrelas en «CURVAS».</p></div>`;
  const pat = () => { const p = DB.patients[$("#fp").value.replace(/\D/g, "")]; $("#fpm").textContent = p ? "Paciente: " + p.nombre : "Sin paciente: el formulario sale con los datos del establecimiento y del profesional."; return p; };
  $("#fp").oninput = pat;
  $$("[data-f]").forEach((b) => (b.onclick = () => {
    const p = pat(); const pp = p ? Object.assign({}, p, p.ap1 ? {} : splitName(p.nombre)) : null;
    if (pp) ["ap1", "ap2", "n1", "n2"].forEach((k) => (pp[k] = UP(pp[k])));
    openForms([b.dataset.f], pp ? { patient: pp, fecha: today(), hora: new Date().toTimeString().slice(0, 5) } : null);
  }));
};

/* ---------- curva térmica: tomas de constantes que se grafican en el 020 ---------- */
function curvePanel(at) {
  const el = document.createElement("div"); el.className = "cvp";
  let tomas = (at && at.curva) ? JSON.parse(JSON.stringify(at.curva)) : [];
  if (!tomas.length && at && at.vit && (at.vit.t || at.vit.fc)) {
    const [pas, pad] = String(at.vit.pa || "").split("/");
    tomas.push({ fecha: at.fecha, turno: turnoDe(at.hora), hora: at.hora, t: at.vit.t, p: at.vit.fc, fr: at.vit.fr, sat: at.vit.sat, pas: (pas || "").trim(), pad: (pad || "").trim(), resp: "" });
  }
  const row = (x) => `<tr><td><input type="date" data-c="fecha" value="${esc(x.fecha || "")}"></td><td><select data-c="turno">${["AM", "PM", "HS"].map((t) => `<option${x.turno === t ? " selected" : ""}>${t}</option>`).join("")}</select></td>
    <td><input type="time" data-c="hora" value="${esc(x.hora || "")}"></td><td><input data-c="t" value="${esc(x.t || "")}" placeholder="37.0"></td><td><input data-c="p" value="${esc(x.p || "")}" placeholder="80"></td>
    <td><input data-c="fr" value="${esc(x.fr || "")}"></td><td><input data-c="sat" value="${esc(x.sat || "")}"></td><td><input data-c="pas" value="${esc(x.pas || "")}"></td><td><input data-c="pad" value="${esc(x.pad || "")}"></td>
    <td><input data-c="resp" value="${esc(x.resp || "")}" placeholder="Iniciales"></td><td><button type="button" class="btn d sm" aria-label="Quitar">✕</button></td></tr>`;
  el.innerHTML = `<div class="row" style="justify-content:space-between"><b>Curva térmica · tomas de constantes vitales</b><span class="hint">Temperatura <b style="color:#0b3d91">● azul</b> · pulso <b style="color:#d0021b">○ rojo</b>. Se grafica al escribir. Hasta 14 días (2 hojas), 3 tomas por día: AM, PM y HS.</span></div>
    <table class="t cvt"><thead><tr><th>Fecha</th><th>Turno</th><th>Hora</th><th>T °C</th><th>Pulso</th><th>FR</th><th>SatO₂ %</th><th>PA sist.</th><th>PA diast.</th><th>Responsable</th><th></th></tr></thead><tbody>${tomas.map(row).join("")}</tbody></table>
    <div class="row" style="margin-top:8px"><button type="button" class="btn s sm" data-add>+ Agregar toma</button></div>`;
  const tb = $("tbody", el);
  el._read = () => $$("tr", tb).map((r) => Object.fromEntries($$("[data-c]", r).map((i) => [i.dataset.c, i.value.trim()]))).filter((x) => x.fecha && (x.t || x.p || x.fr || x.sat || x.pas));
  el._draw = () => { if (el._pages) { MSP.curve(el._pages, el._read()); MSP.fit(el._pages); } };
  const wire = (r) => { $("button", r).onclick = () => { r.remove(); el._draw(); }; };
  $$("tr", tb).forEach(wire);
  el.addEventListener("input", el._draw); el.addEventListener("change", el._draw);
  $("[data-add]", el).onclick = () => {
    const L = el._read(), last = L[L.length - 1]; let nx = { fecha: today(), turno: "AM" };
    if (last) { const i = ["AM", "PM", "HS"].indexOf(last.turno); if (i < 2) nx = { fecha: last.fecha, turno: ["AM", "PM", "HS"][i + 1] }; else { const d = new Date(last.fecha + "T00:00"); d.setDate(d.getDate() + 1); nx = { fecha: d.toISOString().slice(0, 10), turno: "AM" }; } }
    tb.insertAdjacentHTML("beforeend", row(nx)); wire(tb.lastElementChild); $("[data-c=t]", tb.lastElementChild).focus();
  };
  return el;
}

/* ---------- Anexo 7: acta entrega-recepción de servicios de salud ---------- */
function actaPage(at) {
  const s = DB.settings, p = (at && at.patient) || {}, d = (at && at.dAN7) || {}, man = (at && at.manual && at.manual.AN7) || {};
  const f = (at && at.fecha) || today(), [yy, mm, dd] = f.split("-");
  const val = (k, v) => esc(man[k] != null ? man[k] : (v || ""));
  const F = (k, v, cls) => `<span class="af${cls ? " " + cls : ""}" data-k="${k}" contenteditable="true" spellcheck="false">${val(k, v)}</span>`;
  const pg = document.createElement("div"); pg.className = "mspp edit acta"; pg.setAttribute("data-orient", "portrait"); pg.setAttribute("data-code", "AN7");
  pg.style.width = (210 * 96 / 25.4) + "px"; pg.style.height = (297 * 96 / 25.4) + "px";
  pg.innerHTML = `<div class="ain">
    <div class="ahd"><img src="${LOGO}" alt="Signo"><div>${F("razon", UP(s.estab))}<small>${esc(s.dir)}</small></div></div>
    <div class="atl">ACTA ENTREGA RECEPCIÓN DE SERVICIOS DE SALUD</div>
    <table class="atb">
      <tr><td colspan="2">Prestador: ${F("prest", UP(s.estab) + " – " + UP(s.nombre))}</td></tr>
      <tr><td colspan="2">Persona de contacto: ${F("cont", UP(s.nombre))}</td></tr>
      <tr><td>Teléfono: ${F("tel", s.tel)}</td><td>E-mail: ${F("mail", s.email)}</td></tr>
      <tr><td>Mes y año de prestación: ${F("mes", MESES_UP[+mm - 1] + " " + yy)}</td><td>Código CIE 10: ${F("cie", at && at.dx ? at.dx.map((x) => x.cie).filter(Boolean).join(", ") : "")}</td></tr>
      <tr><td colspan="2">Código de validación /RPC: ${F("cod", d.cod)}</td></tr>
      <tr><td>Número de historia clínica:</td><td>${F("hcu", p.hcu || p.cedula)}</td></tr>
      <tr><td colspan="2">Tipo de servicio entregado: ${F("serv", d.serv)}</td></tr>
    </table>
    <table class="atb">
      <tr><td style="width:46%">Nombre del beneficiario (dos apellidos y dos nombres)</td><td>${F("benef", [p.ap1, p.ap2, p.n1, p.n2].filter(Boolean).join(" "))}</td></tr>
      <tr><td>No. Documento de identificación</td><td>${F("ci", p.cedula)}</td></tr>
    </table>
    <div class="ast">ACUSE ENTREGA DEL SERVICIO</div>
    <div class="abx">OBSERVACIONES: ${F("obs", d.obs)}<br><i>(Si tuviera alguna observación llene este campo, caso contrario deje en blanco)</i></div>
    <p class="asm">Como prestador de la RPIS, conozco el cumplimiento obligatorio del TPSNS y sus procedimientos que están regulados en el presente Reglamento de relacionamiento.<br>Además, tengo conocimiento el acápite que refiere a la Coordinación de pagos y tarifas que indica textualmente:</p>
    <div class="abx asm">“En caso de objeción o débito, el prestador no podrá requerir el pago al usuario/paciente, familiares o acompañante. Cualquier cobro en este sentido será motivo de la sanción que la Ley prevea”</div>
    <div class="asg"><div class="aln"></div>(firma)<br><i>Nombre y Apellido de la máxima autoridad o su delegado (Prestador):</i> ${F("aut", UP(s.nombre))}<br><i>Número de Documento de Identidad:</i> ${F("autci", s.ci)}</div>
    <div class="ast">ACUSE RECEPCIÓN DEL SERVICIO</div>
    <p>Ciudad de ${F("ciu", UP(s.ciudad), "u")} a los ${F("dia", String(+dd), "u")} días del mes de ${F("mesl", MESES_UP[+mm - 1].toLowerCase(), "u")} del año ${F("anio", yy, "u")}</p>
    <div class="asg"><div class="aln"></div>(firma)<br><i>Nombre y apellido del usuario/paciente:</i> ${F("pac", p.nombre)}</div>
    <div class="abx"><b>Observaciones:</b> Yo ${F("rep", "", "u")} en mi calidad de ${F("cal", "", "u")} y/o representante o acompañante, del usuario/paciente ${F("pac2", "", "u")} certifico que el usuario/paciente recibió el servicio registrado en la presente acta.
      <div class="asg" style="margin-top:7mm"><div class="aln"></div><i>Firma del Representante / Acompañante</i><br><b><i>(Utilizar este campo solo cuando el usuario/paciente no pueda registrar su firma)</i></b></div></div>
    <div class="ast" style="text-align:left">CERTIFICACIÓN DE FIRMAS (sello institucional)</div>
    <p class="asm">En mi calidad de prestador de servicios, certifico que las firmas constantes en el presente documento, corresponden a la firma del usuario/paciente o su representante, misma que fue receptada en esta casa de salud; por lo tanto, me responsabilizo por el contenido de dicho certificado, asumiendo toda la responsabilidad tanto administrativa, civil o penal por la veracidad de la información entregada.</p>
    <div class="afoot">Anexo 7 · Acuerdo Ministerial 00140-2023 · Reglamento de relacionamiento RPIS–RPC–SPPAT</div>
  </div>`;
  return pg;
}
