/* ---------- exportar la base de datos a Excel (.xlsx) sin librerías externas ---------- */
const XLSX_W = (() => {
  const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const enc = new TextEncoder();
  function zip(files) { // files: [[name, string]] — sin compresión (STORE)
    const parts = [], central = []; let off = 0;
    files.forEach(([name, str]) => {
      const nb = enc.encode(name), data = enc.encode(str), crc = crc32(data), h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nb.length, true);
      parts.push(new Uint8Array(h.buffer), nb, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), nb);
      off += 30 + nb.length + data.length;
    });
    const csize = central.reduce((a, b) => a + b.length, 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  const x = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  const col = (i) => { let s = ""; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  function sheet(rows) {
    const w = rows[0].map((_, j) => Math.min(60, Math.max(8, ...rows.map((r) => String(r[j] ?? "").length)) + 2));
    const body = rows.map((r, i) => `<row r="${i + 1}">${r.map((v, j) => {
      const ref = col(j) + (i + 1), st = i === 0 ? ' s="1"' : "";
      if (typeof v === "number" && isFinite(v)) return `<c r="${ref}"${st}><v>${v}</v></c>`;
      if (v === null || v === undefined || v === "") return "";
      return `<c r="${ref}" t="inlineStr"${st}><is><t xml:space="preserve">${x(v)}</t></is></c>`;
    }).join("")}</row>`).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${w.map((v, j) => `<col min="${j + 1}" max="${j + 1}" width="${v}" customWidth="1"/>`).join("")}</cols><sheetData>${body}</sheetData><autoFilter ref="A1:${col(rows[0].length - 1)}${rows.length}"/></worksheet>`;
  }
  return function (name, sheets) { // sheets: [[nombre, filas]]
    const files = [
      ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`],
      ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${x(s[0].slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>${sheets.map((s, i) => `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${x(s[0].slice(0, 31))}'!$A$1:$${col(s[1][0].length - 1)}$${s[1].length}</definedName></definedNames>`).slice(0, 0).join("")}</workbook>`],
      ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ["xl/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B7A72"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
      ...sheets.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheet(s[1])]),
    ];
    const a = document.createElement("a"); a.href = URL.createObjectURL(zip(files)); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };
})();

function exportExcel() {
  const P = Object.values(DB.patients), A = DB.atenciones || [], D = DB.docs || [];
  const n = (v) => { const f = parseFloat(String(v ?? "").replace(",", ".")); return isNaN(f) ? (v ?? "") : f; };
  const sx = (p) => p.sexo || "";
  const pac = [["Cédula", "Primer apellido", "Segundo apellido", "Primer nombre", "Segundo nombre", "Nombre completo", "Sexo", "Fecha nacimiento", "Edad (años)", "Teléfono", "Correo", "Ocupación", "Empresa", "Provincia", "Cantón", "Parroquia", "Domicilio", "Alergias", "N.º atenciones", "N.º documentos", "Actualizado"]]
    .concat(P.map((p) => { const s = p.ap1 ? p : Object.assign({}, p, splitName(p.nombre)); return [p.cedula, s.ap1, s.ap2, s.n1, s.n2, p.nombre, sx(p), p.nac || "", p.nac ? n(edad(p.nac)) : p.edad || "", p.tel || "", p.email || "", p.ocupacion || "", p.empresa || "", p.prov || "", p.canton || "", p.parroq || "", p.domicilio || "", p.alergias || "", A.filter((a) => a.patient.cedula === p.cedula).length, D.filter((d) => d.patient.cedula === p.cedula).length, p.updated || ""]; }));
  const at = [["Atención", "Fecha", "Hora", "Cédula", "Paciente", "Sexo", "Edad", "Consulta", "Servicio", "Motivo", "Enfermedad actual", "Antecedentes personales", "Antecedentes familiares", "Revisión por sistemas", "Examen físico", "Diagnóstico 1", "CIE 1", "Tipo 1", "Diagnóstico 2", "CIE 2", "Diagnósticos (todos)", "Plan", "Formularios generados"]]
    .concat(A.map((a) => { const d0 = a.dx[0] || {}, d1 = a.dx[1] || {}; return [a.id, a.fecha, a.hora || "", a.patient.cedula, a.patient.nombre, sx(a.patient), a.patient.nac ? n(edad(a.patient.nac, a.fecha)) : "", a.tipo || "", a.servicio || "", a.motivo || "", a.enf || "", a.antp || "", a.antf || "", a.rev || "", a.exf || "", d0.d || "", d0.cie || "", d0.t || "", d1.d || "", d1.cie || "", a.dx.map((d) => `${d.cie} ${d.d}`).join("; "), a.plan || "", Object.keys(a.docs || {}).join(", ")]; }));
  const vit = [["Atención", "Fecha", "Cédula", "Paciente", "Temperatura °C", "Presión arterial", "Pulso", "Frec. respiratoria", "SatO2 %", "Glucosa mg/dl", "Peso kg", "Talla cm", "IMC", "Perímetro abdominal", "Hb g/dl", "Perímetro cefálico"]]
    .concat(A.map((a) => { const v = a.vit || {}; return [a.id, a.fecha, a.patient.cedula, a.patient.nombre, n(v.t), v.pa || "", n(v.fc), n(v.fr), n(v.sat), n(v.glu), n(v.peso), n(v.talla), n(v.imc), n(v.pabd), n(v.hb), n(v.pc)]; }));
  const dx = [["Fecha", "Atención", "Cédula", "Paciente", "Sexo", "Edad", "CIE-10", "Diagnóstico", "PRE/DEF", "Notificación SIVE"]];
  A.forEach((a) => a.dx.forEach((d) => dx.push([a.fecha, a.id, a.patient.cedula, a.patient.nombre, sx(a.patient), a.patient.nac ? n(edad(a.patient.nac, a.fecha)) : "", d.cie || "", d.d, d.t || "", sivePara(d.cie).map((e) => e.e).join(", ")])));
  const docs = [["Folio", "Fecha", "Tipo", "Estado", "Cédula", "Paciente", "Diagnóstico", "CIE-10", "Detalle"]]
    .concat(D.map((d) => [d.folio, d.date, d.type === "CM" ? d.data.tipo : TYPES[d.type], d.status, d.patient.cedula, d.patient.nombre, d.data.dx || "", d.data.cie || "", d.type === "RX" ? (d.data.meds || []).map((m) => `${m.dci} ${m.conc} x${m.cant}`).join("; ") : d.type === "OL" ? (d.data.ex || []).join("; ") : d.type === "IE" || (d.data.dias) ? (d.data.dias ? d.data.dias + " días de reposo" : "") : ""]));
  const meds = [["Folio", "Fecha", "Cédula", "Paciente", "Medicamento (DCI)", "Concentración", "Forma", "Cantidad", "Dosis", "Vía", "Frecuencia", "Duración"]];
  D.filter((d) => d.type === "RX" && d.status === "Emitida").forEach((d) => (d.data.meds || []).forEach((m) => meds.push([d.folio, d.date, d.patient.cedula, d.patient.nombre, m.dci, m.conc || "", m.forma || "", n(m.cant), m.dosis || "", m.via || "", m.frec || "", m.dur || ""])));
  const med = [["Cédula", "Paciente", "Sexo", "Fecha nacimiento", "Fecha", "Edad (años)", "Peso kg", "Talla cm", "Perímetro cefálico cm", "Z peso/edad", "Z talla/edad", "Z IMC/edad"]];
  P.forEach((p) => (p.medidas || []).forEach((m) => { const s = p.sexo === "Masculino" ? "M" : "F", a = p.nac ? GR.ageY(p.nac, m.fecha) : null, w = n(m.peso), h = n(m.talla);
    med.push([p.cedula, p.nombre, sx(p), p.nac || "", m.fecha, a == null ? "" : Math.round(a * 100) / 100, w, h, n(m.pc), a == null ? "" : GR.z(s, "wfa", a, w) ?? "", a == null ? "" : GR.z(s, "lhfa", a, h) ?? "", a == null || !(w > 0 && h > 0) ? "" : GR.z(s, "bmi", a, w / Math.pow(h / 100, 2)) ?? ""]); }));
  const cv = [["Atención", "Cédula", "Paciente", "Fecha", "Turno", "Hora", "Temperatura", "Pulso", "FR", "SatO2", "PA sistólica", "PA diastólica", "Responsable"]];
  A.forEach((a) => (a.curva || []).forEach((t) => cv.push([a.id, a.patient.cedula, a.patient.nombre, t.fecha, t.turno, t.hora || "", n(t.t), n(t.p), n(t.fr), n(t.sat), n(t.pas), n(t.pad), t.resp || ""])));
  XLSX_W(`Base_de_datos_Signo_${today()}.xlsx`, [["Pacientes", pac], ["Atenciones", at], ["Signos vitales", vit], ["Diagnósticos", dx], ["Documentos y folios", docs], ["Medicamentos recetados", meds], ["Crecimiento", med], ["Curva térmica", cv]]);
}
