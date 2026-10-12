/* ---------- Ficha clínica del paciente: todo su historial en una pantalla ---------- */
function historial(ced) {
  const A = (DB.atenciones || []).filter((a) => a.patient && a.patient.cedula === ced).sort((a, b) => (a.fecha + (a.hora || "") < b.fecha + (b.hora || "") ? 1 : -1));
  const D = (DB.docs || []).filter((d) => d.patient && d.patient.cedula === ced);
  return { A, D };
}
function miniChart(title, unit, series, dates) {
  // series: [{name, color, vals:[num|null]}] alineadas con dates (ascendente)
  const W = 320, H = 150, ml = 34, mr = 10, mt = 22, mb = 26, pw = W - ml - mr, ph = H - mt - mb;
  const all = series.flatMap((s) => s.vals).filter((v) => v != null);
  if (!all.length) return "";
  let lo = Math.min(...all), hi = Math.max(...all); if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
  const n = dates.length, X = (i) => ml + (n === 1 ? pw / 2 : (i / (n - 1)) * pw), Y = (v) => mt + ph - ((v - lo) / (hi - lo)) * ph;
  let g = `<text x="${ml}" y="14" font-size="12" font-weight="700" fill="#12263A">${esc(title)} <tspan font-weight="400" fill="#4A5B6B">${esc(unit)}</tspan></text>`;
  [lo, (lo + hi) / 2, hi].forEach((v) => { g += `<line x1="${ml}" x2="${ml + pw}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="#E2EAEC"/><text x="${ml - 4}" y="${(Y(v) + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="#4A5B6B">${Math.round(v * 10) / 10}</text>`; });
  const step = Math.max(1, Math.ceil(n / 5));
  dates.forEach((d, i) => { if (i % step === 0 || i === n - 1) g += `<text x="${X(i).toFixed(1)}" y="${H - 8}" font-size="9" text-anchor="${n > 1 && i === n - 1 ? "end" : n > 1 && i === 0 ? "start" : "middle"}" fill="#4A5B6B">${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(2, 4)}</text>`; });
  series.forEach((s) => {
    const pts = s.vals.map((v, i) => (v == null ? null : [X(i), Y(v), v])).filter(Boolean);
    if (pts.length > 1) g += `<polyline fill="none" stroke="${s.color}" stroke-width="2" points="${pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}"/>`;
    pts.forEach((p) => { g += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${s.color}"><title>${s.name}: ${p[2]}</title></circle>`; });
    const last = pts[pts.length - 1]; if (last) g += `<text x="${Math.min(last[0] + 5, W - 4)}" y="${(last[1] - 6).toFixed(1)}" font-size="10" font-weight="700" fill="${s.color}" text-anchor="${last[0] > W - 40 ? "end" : "start"}">${last[2]}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="mchart" role="img" aria-label="${esc(title)}">${g}</svg>`;
}
V.ficha = (ced) => {
  const p = DB.patients[ced]; if (!p) return go("pacientes");
  const { A, D } = historial(ced), s = p.ap1 ? p : Object.assign({}, p, splitName(p.nombre));
  const asc = A.slice().reverse().filter((a) => a.vit && Object.values(a.vit).some((v) => v));
  const dates = asc.map((a) => a.fecha), num = (v) => { const f = parseFloat(String(v ?? "").replace(",", ".")); return isNaN(f) ? null : f; };
  const pa = asc.map((a) => String(a.vit.pa || "").split("/").map(num));
  const charts = [
    miniChart("Presión arterial", "mmHg", [{ name: "Sistólica", color: "#C0392B", vals: pa.map((x) => x[0] ?? null) }, { name: "Diastólica", color: "#0B7A72", vals: pa.map((x) => x[1] ?? null) }], dates),
    miniChart("Peso", "kg", [{ name: "Peso", color: "#12263A", vals: asc.map((a) => num(a.vit.peso)) }], dates),
    miniChart("IMC", "kg/m²", [{ name: "IMC", color: "#7B4FB5", vals: asc.map((a) => num(a.vit.imc)) }], dates),
    miniChart("Glucosa capilar", "mg/dl", [{ name: "Glucosa", color: "#D9822B", vals: asc.map((a) => num(a.vit.glu)) }], dates),
    miniChart("Pulso", "lpm", [{ name: "Pulso", color: "#2E86C1", vals: asc.map((a) => num(a.vit.fc)) }], dates),
    miniChart("Saturación", "%", [{ name: "SatO₂", color: "#16A085", vals: asc.map((a) => num(a.vit.sat)) }], dates),
  ].filter(Boolean);
  // diagnósticos frecuentes
  const dxc = {}; A.forEach((a) => (a.dx || []).forEach((d) => { const k = (d.cie ? d.cie + " · " : "") + d.d; dxc[k] = (dxc[k] || 0) + 1; }));
  const dxs = Object.entries(dxc).sort((a, b) => b[1] - a[1]);
  // línea de tiempo: atenciones y documentos
  const items = A.map((a) => ({ f: a.fecha + " " + (a.hora || ""), t: "AT", a })).concat(D.map((d) => ({ f: d.date + " 99", t: "DOC", d }))).sort((x, y) => (x.f < y.f ? 1 : -1));
  const vit = (v) => [["PA", v.pa, ""], ["FC", v.fc, ""], ["T", v.t, " °C"], ["SatO₂", v.sat, "%"], ["Peso", v.peso, " kg"], ["IMC", v.imc, ""], ["Glucosa", v.glu, ""]].filter((x) => x[1]).map((x) => `${x[0]} <b>${esc(x[1])}${x[2]}</b>`).join(" · ");
  const docName = (d) => (d.type === "CM" ? d.data.tipo : TYPES[d.type]);
  const docDet = (d) => d.type === "RX" ? (d.data.meds || []).map((m) => `${m.dci}${m.conc ? " " + m.conc : ""}`).join(", ") : d.type === "OL" ? (d.data.ex || []).slice(0, 8).join(", ") + ((d.data.ex || []).length > 8 ? "…" : "") : d.data.dx || "";
  $("#main").innerHTML = `<div class="row" style="justify-content:space-between;align-items:flex-start">
      <div><h1>${esc(p.nombre)}</h1><p class="sub" style="margin-bottom:10px">C.I. ${fmtCed(p.cedula)} · ${p.nac ? edad(p.nac) + " años · " : ""}${esc(p.sexo || "")}${p.tel ? " · " + esc(p.tel) : ""}${p.email ? " · " + esc(p.email) : ""}</p></div>
      <div class="row"><button class="btn p" id="fnew">Nueva atención</button><button class="btn s" data-q="receta">Receta</button><button class="btn s" data-q="lab">Orden de laboratorio</button><button class="btn s" data-q="general">Certificado</button></div></div>
    <div class="fgrid">
      <div class="card"><h2>Resumen</h2>
        <p><b>${A.length}</b> atención(es) · <b>${D.filter((d) => d.status === "Emitida").length}</b> documento(s)${A[0] ? ` · última consulta <b>${fmt(A[0].fecha)}</b>` : ""}${A.length > 1 ? ` · primera <b>${fmt(A[A.length - 1].fecha)}</b>` : ""}</p>
        <p><span class="hint">Alergias:</span> <b class="${p.alergias && !/niega|no refiere/i.test(p.alergias) ? "warnt" : ""}">${esc(p.alergias || "No registradas")}</b></p>
        ${s.ocupacion || p.ocupacion ? `<p><span class="hint">Ocupación:</span> ${esc(p.ocupacion)}${p.empresa ? " · " + esc(p.empresa) : ""}</p>` : ""}
        ${A[0] && A[0].antp ? `<p><span class="hint">Antecedentes personales:</span> ${esc(A[0].antp)}</p>` : ""}
        ${A[0] && A[0].antf ? `<p><span class="hint">Antecedentes familiares:</span> ${esc(A[0].antf)}</p>` : ""}
        ${dxs.length ? `<p class="hint" style="margin-bottom:4px">Diagnósticos registrados</p><div class="dxtags">${dxs.slice(0, 12).map(([k, n]) => `<span>${esc(k)}${n > 1 ? ` <b>×${n}</b>` : ""}</span>`).join("")}</div>` : ""}
      </div>
      <div class="card"><h2>Evolución de signos vitales</h2>${charts.length ? `<div class="mcharts">${charts.join("")}</div>${asc.length < 2 ? '<p class="hint">Con dos o más consultas se dibuja la tendencia.</p>' : ""}` : '<p class="hint">Aún no hay signos vitales registrados en las atenciones.</p>'}</div>
    </div>
    <div class="card"><h2>Historial</h2>${items.length ? `<div class="tl">${items.map((it) => it.t === "AT" ? `<div class="tli at"><div class="tld">${fmt(it.a.fecha)}${it.a.hora ? "<br><small>" + esc(it.a.hora) + "</small>" : ""}</div><div class="tlb">
        <div class="row" style="justify-content:space-between"><b>Atención ${esc(it.a.tipo || "")} <span class="tag" style="font-weight:400">${it.a.id}</span></b><span class="row"><button class="btn s sm" data-o="${it.a.id}">Abrir</button><button class="btn s sm" data-p="${it.a.id}">Formularios</button></span></div>
        ${it.a.motivo ? `<div><span class="hint">Motivo:</span> ${esc(it.a.motivo)}</div>` : ""}
        ${(it.a.dx || []).length ? `<div><span class="hint">Dx:</span> ${it.a.dx.map((d) => `${esc(d.d)}${d.cie ? ` <span class="tag">${esc(d.cie)}</span>` : ""}${d.t ? ` <small>${d.t}</small>` : ""}`).join("; ")}</div>` : ""}
        ${it.a.vit && vit(it.a.vit) ? `<div class="hint">${vit(it.a.vit)}</div>` : ""}
        ${it.a.plan ? `<details><summary class="hint">Plan</summary><div style="white-space:pre-wrap">${esc(it.a.plan)}</div></details>` : ""}
      </div></div>` : `<div class="tli doc"><div class="tld">${fmt(it.d.date)}</div><div class="tlb"><div class="row" style="justify-content:space-between"><b>${esc(docName(it.d))} <span class="tag" style="font-weight:400">${it.d.folio}</span>${it.d.status === "Anulada" ? ' <span class="pill no">Anulada</span>' : ""}</b><button class="btn s sm" data-v="${it.d.folio}">Ver / imprimir</button></div>${docDet(it.d) ? `<div class="hint">${esc(docDet(it.d))}</div>` : ""}</div></div>`).join("")}</div>` : '<p class="hint">Todavía no hay atenciones ni documentos para este paciente.</p>'}</div>`;
  $$("[data-o]").forEach((b) => (b.onclick = () => { go("atencion"); V.atencion(JSON.parse(JSON.stringify(DB.atenciones.find((a) => a.id === b.dataset.o)))); window.scrollTo(0, 0); }));
  $$("[data-p]").forEach((b) => (b.onclick = () => { const a = DB.atenciones.find((x) => x.id === b.dataset.p); openForms(AT_DOCS.filter((c) => a.docs[c]), a); }));
  $$("[data-v]", $("#main")).forEach((b) => (b.onclick = () => openDoc(DB.docs.find((d) => d.folio === b.dataset.v))));
  $("#fnew").onclick = () => { go("atencion"); const f = $("#fa"); f.cedula.value = ced; f.cedula.dispatchEvent(new Event("change")); };
  $$("[data-q]").forEach((b) => (b.onclick = () => { go(b.dataset.q); const f = $("#f"); if (f && f.cedula) { f.cedula.value = ced; f.cedula.dispatchEvent(new Event("change")); } }));
};
