/* Motor de formularios MSP (HCU 2021): dibuja la hoja oficial a partir de MSPDATA (generado desde los xlsx),
   la llena con los datos de la atención y permite completar a mano cualquier casilla antes de imprimir. */
var MSP = (function () {
  var CSS_BASE =
    "@page msplan{size:A4 landscape;margin:0}@page msppor{size:A4 portrait;margin:0}" +
    ".mspp{position:relative;background:#fff;overflow:hidden;box-sizing:border-box;break-after:page;page-break-after:always}" +
    ".mspp[data-orient=landscape]{page:msplan}.mspp[data-orient=portrait]{page:msppor}" +
    ".mspp:last-child{break-after:auto;page-break-after:auto}" +
    ".mspp .sc{position:absolute}" +
    ".msp{border-collapse:collapse;table-layout:fixed;font-family:Arial,Helvetica,sans-serif;color:#000}" +
    ".msp td{padding:0;overflow:visible;vertical-align:top}" +
    ".msp .c{display:flex;flex-direction:column;justify-content:flex-end;overflow:visible;white-space:nowrap;line-height:1.08;padding:0 1px;box-sizing:border-box;font-size:10pt}" +
    ".msp .c.w{white-space:normal;overflow:hidden;word-break:break-word}" +
    ".msp .c.r90{writing-mode:vertical-rl;transform:rotate(180deg);white-space:normal;align-items:center;justify-content:center}" +
    ".msp .c.r270{writing-mode:vertical-rl;white-space:normal;align-items:center;justify-content:center}" +
    ".msp .c.rv{writing-mode:vertical-rl;text-orientation:upright;align-items:center;justify-content:center}" +
    ".msp td.f .c{font-size:8pt;font-weight:400;font-style:normal;color:#0b1f3a;white-space:normal;overflow:hidden;justify-content:center;text-align:left;text-decoration:none}" +
    ".msp td.f .c.ln{white-space:nowrap;padding-left:3px}" +
    ".msp td.f .c.x{text-align:center;font-weight:700;font-size:8pt}" +
    ".msp td.f.cb .c{text-align:center;font-weight:700}" +
    ".mspp.edit td.f .c{outline:none;cursor:text}" +
    ".mspp.edit td.f.cb .c{cursor:pointer}" +
    ".mspp.edit td.f:hover{box-shadow:inset 0 0 0 1.5px #2bb3a6}" +
    ".mspp.edit td.f .c:focus{background:#e3f6f3}" +
    "@media print{.mspp.edit td.f:hover{box-shadow:none}.mspp.edit td.f .c:focus{background:none}}";

  var inited = false;
  function init() {
    if (inited) return; inited = true;
    var st = document.createElement("style");
    st.textContent = CSS_BASE + "\n" + MSPDATA.css;
    document.head.appendChild(st);
  }
  var MM = 96 / 25.4;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); }
  function norm(s) { return String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim(); }

  function buildTable(sheet, page) {
    var cw = sheet.cw, ncol = cw.length, W = 0, i, r;
    for (i = 0; i < ncol; i++) W += cw[i];
    var rows = page.rows, nrow = rows.length, H = 0;
    for (r = 0; r < nrow; r++) H += rows[r][1];
    var t = document.createElement("table");
    t.className = "msp"; t.style.width = W + "px";
    var cg = document.createElement("colgroup");
    for (i = 0; i < ncol; i++) { var col = document.createElement("col"); col.style.width = cw[i] + "px"; cg.appendChild(col); }
    t.appendChild(cg);
    var tb = document.createElement("tbody"); t.appendChild(tb);
    var grid = [];
    for (r = 0; r < nrow; r++) grid.push(new Array(ncol));
    var cells = [];
    for (r = 0; r < nrow; r++) {
      var row = rows[r], rn = row[0], tr = document.createElement("tr");
      tr.style.height = row[1] + "px";
      var byc = {};
      row[2].forEach(function (x) { byc[x[0]] = x; });
      for (var c = 0; c < ncol; c++) {
        if (grid[r][c]) continue;
        var x = byc[c] || [c, 1, 1, 0, 1, 0, ""];
        var rs = x[1] || 1, cs = x[2] || 1, fl = x[5] || 0, txt = x[6] || "";
        if (rs > nrow - r) rs = nrow - r;
        if (cs > ncol - c) cs = ncol - c;
        var w = 0, h = 0, a, b;
        for (b = 0; b < cs; b++) w += cw[c + b];
        for (a = 0; a < rs; a++) h += rows[r + a][1];
        var td = document.createElement("td");
        for (a = 0; a < rs; a++) for (b = 0; b < cs; b++) grid[r + a][c + b] = td;
        if (rs > 1) td.rowSpan = rs;
        if (cs > 1) td.colSpan = cs;
        td.className = "k" + (x[3] || 0) + (txt ? "" : " f");
        td.setAttribute("data-a", sheet.cols[c] + rn);
        td._r = r; td._c = c; td._rs = rs; td._cs = cs; td._w = w; td._h = h; td._t = txt ? norm(txt) : "";
        var d = document.createElement("div");
        d.className = "c k" + (x[4] || 0) + (fl & 1 ? " w" : "") + (fl & 2 ? " r90" : "") + (fl & 4 ? " r270" : "") + (fl & 8 ? " rv" : "");
        d.style.width = (w - 1) + "px"; d.style.height = Math.max(h - 2, 1) + "px";
        if (txt) d.innerHTML = esc(txt).replace(/\n/g, "<br>");
        td.appendChild(d); tr.appendChild(td); cells.push(td);
      }
      tb.appendChild(tr);
    }
    return { el: t, W: W, H: H, grid: grid, cells: cells, nrow: nrow, ncol: ncol };
  }

  // Devuelve un array de elementos .mspp (una por página A4)
  function render(code, opts) {
    init(); opts = opts || {};
    var sheets = MSPDATA.forms[code], out = [];
    if (!sheets) return out;
    sheets.forEach(function (sh, si) {
      if (opts.sheets && opts.sheets.indexOf(si) < 0) return;
      var land = sh.orient === "landscape";
      var PW = (land ? 297 : 210) * MM, PH = (land ? 210 : 297) * MM;
      var m = sh.margins.map(function (v) { return Math.min(Math.max(v || 0.4, 0.3), 0.75) * 96; });
      var aw = PW - m[1] - m[3], ah = PH - m[0] - m[2];
      sh.pages.forEach(function (pg, pi) {
        var tb = buildTable(sh, pg);
        var s = Math.min(aw / tb.W, ah / tb.H, 1.6);
        var p = document.createElement("div");
        p.className = "mspp" + (opts.edit ? " edit" : "");
        p.style.width = PW + "px"; p.style.height = PH + "px";
        p.setAttribute("data-orient", land ? "landscape" : "portrait");
        p.setAttribute("data-code", code);
        var sc = document.createElement("div"); sc.className = "sc";
        sc.style.left = (m[3] + (aw - tb.W * s) / 2) + "px"; sc.style.top = m[0] + "px";
        tb.el.style.zoom = s;
        sc.appendChild(tb.el); p.appendChild(sc);
        p._g = { aw: aw, ah: ah, m: m }; p._t = tb; p._si = si;
        p.setAttribute("data-sheet", si);
        tb.cells.forEach(function (td) {
          // casillas pequeñas: se marcan con X al hacer clic
          if (!td._t && td._rs === 1 && td._w <= 34 && td._h <= 30) td.classList.add("cb");
        });
        out.push(p);
      });
    });
    if (opts.edit) out.forEach(function (p) {
      p.querySelectorAll("td.f").forEach(function (td) {
        var d = td.firstChild;
        if (td.classList.contains("cb")) {
          td.addEventListener("click", function () { d.textContent = d.textContent ? "" : "X"; });
        } else { d.contentEditable = "true"; d.spellcheck = false; }
      });
    });
    return out;
  }

  // Reajusta la escala con el tamaño real ya dibujado (llamar tras insertar en el documento)
  function layout(pages) {
    pages.forEach(function (p) {
      var g = p._g, t = p.querySelector("table.msp"), sc = p.firstChild;
      if (!g || !t) return;
      t.style.zoom = 1;
      var W = t.offsetWidth, H = t.offsetHeight; if (!W || !H) return;
      var s = Math.min(g.aw / W, g.ah / H, 1.6);
      t.style.zoom = s;
      sc.style.left = (g.m[3] + (g.aw - W * s) / 2) + "px";
    });
  }

  function put(td, v) {
    if (!td || v === undefined || v === null || v === "") return false;
    td.classList.add("f");
    var d = td.firstChild; d.classList.remove("ln");
    d.textContent = String(v);
    if (/^[xX]$/.test(String(v))) d.classList.add("x"); else d.classList.remove("x");
    return true;
  }
  function cellByAddr(pages, si, a) {
    for (var i = 0; i < pages.length; i++) {
      if (pages[i]._si !== si) continue;
      var td = pages[i].querySelector('td[data-a="' + a + '"]');
      if (td) return td;
    }
    return null;
  }
  // vals = {"0:B12": "texto"} (hoja:celda) o {"B12": ...} para la hoja 0
  function fill(pages, vals) {
    Object.keys(vals || {}).forEach(function (k) {
      var si = 0, a = k;
      if (k.indexOf(":") > 0) { si = +k.split(":")[0]; a = k.split(":")[1]; }
      var v = vals[k];
      if (v === "") { var tc = cellByAddr(pages, si, a); if (tc && tc.classList.contains("f")) tc.firstChild.textContent = ""; return; }
      if (Array.isArray(v)) { lines(v.map(function (x) { return cellByAddr(pages, si, x); }).filter(Boolean), v._text); return; }
      var over = /!$/.test(a); if (over) a = a.slice(0, -1);
      var tdx = cellByAddr(pages, si, a);
      if (put(tdx, v) && over) { var dv = tdx.firstChild; dv.classList.add("ln"); dv.style.overflow = "visible"; dv.style.whiteSpace = "nowrap"; dv.style.position = "relative"; dv.style.zIndex = "1"; }
    });
  }

  // Reparte un texto largo en varias celdas-renglón
  function lines(tds, text) {
    if (!tds.length || !text) return;
    var tall = tds.filter(function (td) { return td._h > 34; });
    if (tall.length) { // recuadro grande: texto completo con ajuste de línea, arriba a la izquierda
      var t0 = tall[0], d0 = t0.firstChild; t0.classList.add("f");
      d0.textContent = String(text); d0.style.justifyContent = "flex-start"; d0.style.whiteSpace = "pre-wrap"; d0.style.paddingTop = "2px";
      return;
    }
    var paras = String(text).replace(/\r/g, "").split("\n");
    var words = [];
    paras.forEach(function (p, i) { if (i) words.push("\n"); p.split(/\s+/).forEach(function (w) { if (w) words.push(w); }); });
    var k = 0;
    for (var i = 0; i < tds.length && k < words.length; i++) {
      var td = tds[i], d = td.firstChild;
      td.classList.add("f"); d.classList.add("ln"); d.textContent = "";
      if (i === tds.length - 1) { // último renglón: todo lo que queda
        d.classList.remove("ln");
        d.textContent = words.slice(k).join(" ").replace(/ ?\n ?/g, " · ");
        k = words.length; break;
      }
      var line = "";
      while (k < words.length) {
        if (words[k] === "\n") { k++; if (line) break; else continue; }
        var test = line ? line + " " + words[k] : words[k];
        d.textContent = test;
        if (d.scrollWidth > d.clientWidth + 1 && line) { d.textContent = line; break; }
        line = test; k++;
      }
    }
  }

  // Reduce la letra de los campos que no caben
  function fit(pages) {
    pages.forEach(function (p) {
      p.querySelectorAll("td.f .c").forEach(function (d) {
        if (!d.textContent || d.classList.contains("ln")) return;
        var fs = 8; d.style.fontSize = "";
        while (fs > 4.5 && (d.scrollHeight > d.clientHeight + 1 || d.scrollWidth > d.clientWidth + 1)) { fs -= 0.5; d.style.fontSize = fs + "pt"; }
      });
    });
  }

  // Lee todas las casillas rellenables con contenido: {"hoja:celda": texto}
  function read(pages) {
    var o = {};
    pages.forEach(function (p) {
      p.querySelectorAll("td.f").forEach(function (td) {
        var t = td.firstChild.innerText.replace(/\s+$/, "");
        if (t) o[p._si + ":" + td.getAttribute("data-a")] = t;
      });
    });
    return o;
  }
  /* ---------- llenado inteligente por etiquetas y secciones ---------- */
  function isHeader(td) { return /^[A-Z]\. ?[A-Z]{2,}/.test(td._t) && td._c === 0; }
  function isGuide(td) { return td && /^(REGISTRAR|EN ESTE BLOQUE|REGISTRE)/.test(td._t); }
  function isField(td) { return !!td && (!td._t || td.classList.contains("f") || isGuide(td)); }
  function below(T, td) { var r = td._r + td._rs; return r < T.nrow ? T.grid[r][td._c] : null; }
  function right(T, td) { var c = td._c + td._cs; return c < T.ncol ? T.grid[td._r][c] : null; }
  function rowCells(T, r) { var o = []; for (var c = 0; c < T.ncol; c++) { var td = T.grid[r][c]; if (td && td._r === r && td._c === c) o.push(td); } return o; }

  // Secciones (A., B., ...) de una página: [{t, r0, r1, td}]
  function sections(T) {
    var S = [];
    for (var r = 0; r < T.nrow; r++) {
      var td = T.grid[r][0];
      if (td && td._r === r && isHeader(td)) S.push({ t: td._t, r0: r, td: td });
    }
    S.forEach(function (s, i) { s.r1 = i + 1 < S.length ? S[i + 1].r0 - 1 : T.nrow - 1; });
    return S;
  }
  // Renglones de escritura libre de una sección: filas con una sola celda ancha vacía
  function sectionLines(T, s) {
    var out = [], started = false;
    for (var r = s.r0 + 1; r <= s.r1; r++) {
      var rc = rowCells(T, r).filter(function (td) { return td._t || td._w > 6; });
      var wide = rc.length === 1 && rc[0]._cs >= T.ncol * 0.6;
      if (wide && (!rc[0]._t || isGuide(rc[0]))) {
        if (isGuide(rc[0]) && !started && r + 1 <= s.r1) {
          var nx = rowCells(T, r + 1); if (nx.length === 1 && !nx[0]._t) continue; // fila de instrucciones
        }
        out.push(rc[0]); started = true;
      } else if (started) break;
    }
    return out;
  }
  function findSec(pages, re) {
    for (var i = 0; i < pages.length; i++) {
      var S = sections(pages[i]._t);
      for (var j = 0; j < S.length; j++) if (re.test(S[j].t)) return { p: pages[i], T: pages[i]._t, s: S[j] };
    }
    return null;
  }
  function labelIn(T, r0, r1, re) {
    for (var r = r0; r <= r1; r++) {
      var rc = rowCells(T, r);
      for (var i = 0; i < rc.length; i++) if (rc[i]._t && re.test(rc[i]._t)) return rc[i];
    }
    return null;
  }
  function belowField(T, lab) { if (!lab) return null; var b = below(T, lab); return isField(b) ? b : null; }
  function rightField(T, lab) { if (!lab) return null; var b = right(T, lab); while (b && !b._t && b._w <= 6) b = right(T, b); return isField(b) ? b : null; }

  var PAT = [
    ["inst", /^INSTITUCION DEL SISTEMA/], ["unicodigo", /^UNICODIGO/], ["estab", /^ESTABLECIMIENTO DE SALUD/],
    ["tipologia", /^TIPOLOGIA/], ["hcu", /^N(UMERO|O\.?) DE HISTORIA CLINICA/], ["archivo", /^N(UMERO|O\.?) DE ARCHIVO/],
    ["hoja", /^NO\. ?HOJA/], ["ap1", /^PRIMER APELLIDO/], ["ap2", /^SEGUNDO APELLIDO/], ["n1", /^PRIMER NOMBRE/],
    ["n2", /^SEGUNDO NOMBRE/], ["sexo", /^SEXO$/], ["fnac", /^FECHA (DE )?NACIMIENTO/], ["edad", /^EDAD/],
    ["cedula", /^(NUMERO DE )?CEDULA|^N(UMERO|O\.?) DE (DOCUMENTO|IDENTIFICACION)/], ["tel", /TELEFONO/],
  ];
  var PROF = [["fecha", /^FECHA( \(AAAA|$)/], ["hora", /^HORA( \(HH|$)/], ["pn1", /^PRIMER NOMBRE/], ["pa1", /^PRIMER APELLIDO/],
    ["pa2", /^SEGUNDO APELLIDO/], ["pdoc", /^NUMERO DE DOCUMENTO/]];

  // ctx: datos de la atención (ver app). Devuelve nada; escribe en las páginas.
  function smart(pages, ctx) {
    var done = {};
    pages.forEach(function (p) {
      var T = p._t, si = p._si, S = sections(T);
      var profSec = S.filter(function (s) { return /PROFESIONAL/.test(s.t); })[0];
      var stop = profSec ? profSec.r0 - 1 : T.nrow - 1;
      var key = function (k) { return si + ":" + k; };
      // datos del establecimiento y del paciente: primera aparición de cada etiqueta en la hoja
      PAT.forEach(function (pt) {
        if (done[key(pt[0])]) return;
        var lab = labelIn(T, 0, Math.min(stop, 30), pt[1]); if (!lab) return;
        var v = ctx[pt[0]]; if (pt[0] === "hoja") v = "1";
        var f = belowField(T, lab) || (pt[0] === "tel" || pt[0] === "cedula" ? rightField(T, lab) : null);
        if (f && put(f, v)) done[key(pt[0])] = 1;
      });
      // condición de edad: H D M A
      if (!done[key("cond")] && ctx.cond) {
        var cl = labelIn(T, 0, Math.min(stop, 30), /^CONDICION EDAD/);
        if (cl) {
          var rr = cl._r + cl._rs;
          if (rr < T.nrow) rowCells(T, rr).forEach(function (td) {
            if (td._c >= cl._c && td._c < cl._c + cl._cs && td._t === ctx.cond) { put(belowField(T, td), "X"); done[key("cond")] = 1; }
          });
        }
      }
      // profesional responsable (solo el primer bloque de la hoja)
      if (profSec && !done[key("prof")]) {
        PROF.forEach(function (pt) { put(belowField(T, labelIn(T, profSec.r0, profSec.r1, pt[1])), ctx[pt[0]]); });
        done[key("prof")] = 1;
      }
      // constantes vitales
      var vs = S.filter(function (s) { return /CONSTANTES VITALES|SIGNOS VITALES/.test(s.t); })[0];
      if (vs && ctx.vit && !done[key("vit")] && p.getAttribute("data-code") !== "020") {
        var VP = [["fecha", /^FECHA/], ["hora", /^HORA/], ["t", /^TEMPERATURA/], ["pa", /^PRESION ARTERIAL/], ["fc", /^PULSO|^FRECUENCIA CARDIACA/],
          ["fr", /^FRECUENCIA RESPIRATORIA/], ["peso", /^PESO/], ["talla", /^TALLA/], ["imc", /^IMC/], ["pabd", /^PERIMETRO ABDOMINAL/],
          ["hb", /^HEMOGLOBINA CAPILAR/], ["glu", /^GLUCOSA CAPILAR/], ["sat", /^PULSIOXIMETRIA|^SATURACION/]];
        VP.forEach(function (pt) { put(belowField(T, labelIn(T, vs.r0, vs.r1, pt[1])), pt[0] === "fecha" ? ctx.fecha : pt[0] === "hora" ? ctx.hora : ctx.vit[pt[0]]); });
        done[key("vit")] = 1;
      }
      // diagnósticos: filas "1." ... "6." dentro de la primera sección de diagnóstico
      var ds = S.filter(function (s) { return /^[A-Z]{1,2}\. ?DIAGNOSTICO/.test(s.t); })[0];
      if (ds && ctx.dx && ctx.dx.length && !done[key("dx")]) {
        for (var r = ds.r0; r <= ds.r1; r++) rowCells(T, r).forEach(function (td) {
          var m = /^([1-6])\.$/.exec(td._t); if (!m) return;
          var dx = ctx.dx[+m[1] - 1]; if (!dx || !dx.d) return;
          var d1 = right(T, td); if (!isField(d1)) return; put(d1, dx.d);
          var c1 = right(T, d1); if (!isField(c1)) return; put(c1, dx.cie);
          var c2 = right(T, c1), c3 = c2 ? right(T, c2) : null;
          if (isField(c2) && isField(c3) && c2._r === td._r) { if (dx.t === "DEF") put(c3, "X"); else put(c2, "X"); }
        });
        done[key("dx")] = 1;
      }
    });
    // textos libres por sección (primera aparición en el formulario)
    var TX = [["motivo", /MOTIVO DE CONSULTA/], ["enf", /ENFERMEDAD O PROBLEMA ACTUAL|ENFERMEDAD ACTUAL|CUADRO CLINICO ACTUAL|RESUMEN DEL CUADRO CLINICO|RESUMEN CLINICO/],
      ["antp", /ANTECEDENTES PATOLOGICOS PERSONALES|ANTECEDENTES PERSONALES/], ["antf", /ANTECEDENTES PATOLOGICOS FAMILIARES|ANTECEDENTES FAMILIARES/],
      ["rev", /REVISION (ACTUAL )?DE ORGANOS/], ["exf", /EXAMEN FISICO/], ["hall", /HALLAZGOS RELEVANTES|RESULTADOS DE EXAMENES/],
      ["plan", /PLAN DE TRATAMIENTO|PLAN TERAPEUTICO/]];
    TX.forEach(function (x) {
      if (!ctx[x[0]]) return;
      var f = findSec(pages, x[1]); if (!f) return;
      lines(sectionLines(f.T, f.s), ctx[x[0]]);
    });
  }

  // Casillas de verificación de una sección: [{label, si, a}]
  function checks(code, secRe) {
    var pages = render(code), out = [], tmp = document.createElement("div");
    tmp.style.cssText = "position:absolute;left:-99999px;top:0";
    document.body.appendChild(tmp); pages.forEach(function (p) { tmp.appendChild(p); });
    var boxed = function (td) { var cs = getComputedStyle(td); return cs.borderLeftStyle !== "none" && cs.borderRightStyle !== "none"; };
    pages.forEach(function (p) {
      var T = p._t;
      sections(T).forEach(function (s) {
        if (!secRe.test(s.t)) return;
        for (var r = s.r0 + 1; r <= s.r1; r++) rowCells(T, r).forEach(function (td) {
          if (!td._t || /^\d+[RS]?\.?$/.test(td._t)) return;
          var b = right(T, td);
          if (b && !b._t && !boxed(b)) { var b2 = right(T, b); if (b2 && !b2._t && boxed(b2)) b = b2; }
          if (b && !b._t && b._rs === 1 && b._w <= 34 && b._h <= 30 && b._r === td._r)
            out.push({ label: td.firstChild.textContent.replace(/^\d+[RS]?\.?\s*/, "").trim(), si: p._si, a: b.getAttribute("data-a"), sec: s.t });
        });
      });
    });
    tmp.remove();
    return out;
  }


  /* ---------- curva térmica (form. 020 y similares) ----------
     tomas: [{fecha:"2026-10-11", turno:"AM"|"PM"|"HS", hora, t, p, fr, sat, pas, pad, resp}]
     Dibuja temperatura (azul, puntos llenos) y pulso (rojo, círculos) sobre la cuadrícula oficial
     y escribe fecha, hora, FR, saturación y presión en sus casillas. */
  function curve(pages, tomas) {
    var days = [];
    (tomas || []).forEach(function (x) { if (x.fecha && days.indexOf(x.fecha) < 0) days.push(x.fecha); });
    days.sort();
    pages.forEach(function (p) {
      var T = p._t, tbl = p.querySelector("table.msp"), sc = p.firstChild;
      if (!tbl.getBoundingClientRect().width) return; // oculto: conservar lo dibujado
      // limpiar lo dibujado antes
      p.querySelectorAll("td[data-cv]").forEach(function (td) { td.firstChild.textContent = ""; td.removeAttribute("data-cv"); });
      var old = sc.querySelector(".cvsvg"); if (old) old.remove();
      // escalas
      var tr = tbl.getBoundingClientRect(), k = tr.width / T.W;
      var pos = function (td) { var r = td.getBoundingClientRect(); return { x: (r.left - tr.left) / k, y: (r.top - tr.top) / k, w: r.width / k, h: r.height / k }; };
      var pul = [], tem = [];
      T.cells.forEach(function (td) {
        if (!/^\d{2,3}$/.test(td._t)) return;
        var v = +td._t, b = pos(td), yc = b.y + b.h / 2;
        if (td._c === 0 && v >= 30 && v <= 200) pul.push([v, yc]);
        if (td._c === 2 && v >= 30 && v <= 45) tem.push([v, yc]);
      });
      if (pul.length < 2 || tem.length < 2) return;
      var lin = function (sc2) { // ajuste lineal valor → y
        var n = sc2.length, mx = 0, my = 0, sxy = 0, sxx = 0;
        sc2.forEach(function (q) { mx += q[0]; my += q[1]; }); mx /= n; my /= n;
        sc2.forEach(function (q) { sxy += (q[0] - mx) * (q[1] - my); sxx += (q[0] - mx) * (q[0] - mx); });
        var m = sxy / sxx; return function (v) { return my + m * (v - mx); };
      };
      var yP = lin(pul), yT = lin(tem);
      // turnos (AM / PM / HS) en orden
      var hdr = T.cells.filter(function (td) { return /^(AM|PM|HS)$/.test(td._t); }).sort(function (a, b) { return a._c - b._c; });
      if (!hdr.length) return;
      var row0 = hdr[0]._r;
      hdr = hdr.filter(function (td) { return td._r === row0; });
      var top = pos(hdr[0]), gridTop = top.y + top.h, gridBot = yP(pul.reduce(function (a, q) { return Math.min(a, q[0]); }, 999)) + 12;
      var lab = function (re) { for (var i = 0; i < T.cells.length; i++) if (T.cells[i]._c === 0 && re.test(T.cells[i]._t)) return T.cells[i]; return null; };
      var at = function (labTd, c) { if (!labTd) return null; var td = T.grid[labTd._r][c]; return td && !td._t ? td : null; };
      var LF = lab(/^FECHA/), LH = T.cells.filter(function (td) { return td._t === "HORA"; })[0];
      var LFR = lab(/^F\. ?RESPIRATORIA|^FRECUENCIA RESPIRATORIA/), LS = lab(/^PULSIOXIMETRIA|^SATURACION/),
        LPS = lab(/^PRESION SISTOLICA/), LPD = lab(/^PRESION DIASTOLICA/), LR = lab(/^RESPONSABLE/);
      var w = function (td, v) { if (td && v !== undefined && v !== null && v !== "") { td.classList.add("f"); td.firstChild.textContent = String(v); td.setAttribute("data-cv", "1"); } };
      var off = p._si * 7, ptsT = [], ptsP = [];
      var nd = Math.floor(hdr.length / 3);
      for (var d = 0; d < nd; d++) {
        var fecha = days[off + d]; if (!fecha) continue;
        w(at(LF, hdr[d * 3]._c), fecha);
        ["AM", "PM", "HS"].forEach(function (tn, j) {
          var h = hdr[d * 3 + j], x = (tomas || []).filter(function (q) { return q.fecha === fecha && q.turno === tn; })[0];
          if (!h || !x) return;
          var b = pos(h), cx = b.x + b.w / 2;
          if (LH) { var hc = T.grid[LH._r][h._c]; if (hc && !hc._t) w(hc, x.hora); }
          w(at(LFR, h._c), x.fr); w(at(LS, h._c), x.sat); w(at(LPS, h._c), x.pas); w(at(LPD, h._c), x.pad); w(at(LR, h._c), x.resp);
          var t = parseFloat(String(x.t || "").replace(",", ".")), pu = parseFloat(String(x.p || "").replace(",", "."));
          if (t > 0) ptsT.push([cx, Math.max(gridTop, Math.min(gridBot, yT(t)))]);
          if (pu > 0) ptsP.push([cx, Math.max(gridTop, Math.min(gridBot, yP(pu)))]);
        });
      }
      if (!ptsT.length && !ptsP.length) return;
      var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "cvsvg"); svg.setAttribute("width", T.W); svg.setAttribute("height", T.H);
      svg.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;overflow:visible;zoom:" + (tbl.style.zoom || 1);
      var draw = function (pts, col, fillc) {
        if (pts.length > 1) { var pl = document.createElementNS(NS, "polyline"); pl.setAttribute("points", pts.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ")); pl.setAttribute("fill", "none"); pl.setAttribute("stroke", col); pl.setAttribute("stroke-width", "1.6"); svg.appendChild(pl); }
        pts.forEach(function (q) { var c = document.createElementNS(NS, "circle"); c.setAttribute("cx", q[0]); c.setAttribute("cy", q[1]); c.setAttribute("r", "3"); c.setAttribute("fill", fillc); c.setAttribute("stroke", col); c.setAttribute("stroke-width", "1.4"); svg.appendChild(c); });
      };
      draw(ptsP, "#d0021b", "#fff"); draw(ptsT, "#0b3d91", "#0b3d91");
      sc.appendChild(svg);
    });
  }

  function list() { return Object.keys(MSPDATA.forms); }

  return { curve: curve, render: render, layout: layout, fill: fill, fit: fit, read: read, smart: smart, checks: checks, lines: lines, list: list, norm: norm };
})();
