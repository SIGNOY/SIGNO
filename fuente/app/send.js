/* ---------- envío de documentos por WhatsApp o correo ---------- */
function waNum(t) {
  let d = String(t || "").replace(/\D/g, "");
  if (d.startsWith("593")) return d;
  if (d.startsWith("0") && d.length === 10) return "593" + d.slice(1);
  if (d.length === 9 && d[0] === "9") return "593" + d;
  return d;
}
function sendInfo() {
  const s = DB.settings;
  let p, folio, tipo, fecha, extra = "", em = "emitido";
  if (PVMODE === "msp") {
    const at = PVPAGES && (PVPAGES.at || PVPAGES._at); p = at && at.patient; if (!p) return null;
    folio = at.id || ""; fecha = at.fecha || today(); tipo = "sus formularios de atención médica"; em = "emitidos";
  } else {
    if (!CUR) return null; p = CUR.patient; folio = CUR.folio; fecha = CUR.date;
    const t = CUR.type;
    tipo = t === "RX" ? "su receta médica" : t === "OL" ? "su orden de exámenes de laboratorio" : t === "CM" ? "su " + CUR.data.tipo.toLowerCase() : t === "IE" ? "su certificado médico (IESS)" : "su certificado médico";
    if (t === "RX" || t === "OL") em = "emitida";
    if (t === "RX") extra = ` La receta es válida por ${s.validezRx || 30} días desde su emisión.`;
    if (t === "OL" && CUR.data.prep) extra = " Revise las indicaciones de preparación que constan en la orden.";
  }
  const pd = DB.patients[p.cedula] || {}, nom = (p.nombre || "").split(/\s+/)[0] || "";
  const sal = p.sexo === "Masculino" ? "Estimado" : p.sexo === "Femenino" ? "Estimada" : "Estimado/a";
  const nombreCap = nom ? nom.charAt(0) + nom.slice(1).toLowerCase() : "";
  const msg = `${sal} ${nombreCap}: le envío ${tipo}${folio ? " con folio " + folio : ""}, ${em} el ${fmt(fecha)} por el ${s.nombre}.${extra} Puede verificar su autenticidad escaneando el código QR del documento o escribiendo al ${s.tel}.\nSigno · Medicina Integral`;
  return { tel: p.tel || pd.tel || "", email: pd.email || p.email || "", msg, folio, tipo, nombre: p.nombre };
}
function sendDialog(via) {
  const i = sendInfo(); if (!i) return toast("Este documento no tiene un paciente asociado.");
  const box = $("#senddlg");
  const num = waNum(i.tel);
  box.innerHTML = `<div class="sdbox"><b>${via === "wa" ? "Enviar por WhatsApp" : "Enviar por correo"}</b>
    <ol>
      <li><button class="btn s sm" id="sd1">1. Guardar PDF</button> <span class="hint">En la ventana de impresión elige «Guardar como PDF». Si va con firma electrónica, fírmalo en FirmaEC antes de enviarlo.</span></li>
      <li>${via === "wa" ? `<label>Número de WhatsApp<input id="sdnum" value="${esc(i.tel)}" placeholder="099 123 4567"></label>` : `<label>Correo del paciente<input id="sdmail" value="${esc(i.email)}" placeholder="paciente@correo.com"></label>`}
        <label>Mensaje<textarea id="sdmsg" style="min-height:96px">${esc(i.msg)}</textarea></label>
        <button class="btn p sm" id="sd2">2. ${via === "wa" ? "Abrir WhatsApp" : "Abrir correo"}</button> <span class="hint">Luego adjunta el PDF guardado${via === "wa" ? " (clip ➜ Documento)" : ""}.</span></li>
    </ol>
    ${navigator.canShare ? `<p class="hint">En el celular también puedes usar <button class="btn s sm" id="sd3">Compartir…</button> para elegir WhatsApp, correo u otra app.</p>` : ""}
    <div class="row" style="justify-content:flex-end"><button class="btn s sm" id="sdx">Cerrar</button></div></div>`;
  box.style.display = "flex";
  $("#sd1").onclick = () => $("#doprint").click();
  $("#sdx").onclick = () => (box.style.display = "none");
  $("#sd2").onclick = () => {
    const msg = $("#sdmsg").value;
    if (via === "wa") {
      const n = waNum($("#sdnum").value); if (n.length < 11) return toast("Revisa el número de WhatsApp.");
      const c = DB.patients[i.folio && CUR ? CUR.patient.cedula : ""]; if (c && !c.tel) { c.tel = $("#sdnum").value.trim(); save(); }
      window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      const m = $("#sdmail").value.trim(); if (!/^\S+@\S+\.\S+$/.test(m)) return toast("Revisa el correo del paciente.");
      const ced = PVMODE === "msp" ? (PVPAGES.at || {}).patient && PVPAGES.at.patient.cedula : CUR && CUR.patient.cedula;
      if (ced && DB.patients[ced] && DB.patients[ced].email !== m) { DB.patients[ced].email = m; save(); }
      location.href = `mailto:${encodeURIComponent(m)}?subject=${encodeURIComponent(`${i.tipo.replace(/^su /, "").replace(/^\w/, (x) => x.toUpperCase())}${i.folio ? " · " + i.folio : ""} · Signo Medicina Integral`)}&body=${encodeURIComponent(msg)}`;
    }
  };
  const s3 = $("#sd3"); if (s3) s3.onclick = () => navigator.share({ title: "Signo Medicina Integral", text: $("#sdmsg").value }).catch(() => {});
}
