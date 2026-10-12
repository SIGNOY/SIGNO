/* ---------- SIVE-Alerta (EPI-1) y listado CIE-10 ---------- */
const SIVE_EV = __SIVEEV__;
const CIE10 = (__CIE10__).split("\n").map((l) => { const i = l.indexOf("|"); return [l.slice(0, i), l.slice(i + 1)]; });
let CIEN = null;
const nrm = (s) => String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function cieSearch(q, n) {
  if (!CIEN) CIEN = CIE10.map((x) => nrm(x[0].replace(".", "")) + " " + nrm(x[1]));
  q = nrm(q).trim(); if (q.length < 2) return [];
  const isCode = /^[A-Z]\d/.test(q), qc = q.replace(".", ""), words = q.split(/\s+/), out = [];
  for (let i = 0; i < CIE10.length && out.length < (n || 12); i++) {
    const s = CIEN[i];
    if (isCode ? s.startsWith(qc) : words.every((w) => s.includes(w))) out.push(CIE10[i]);
  }
  return out;
}
function cieName(code) { const c = String(code || "").toUpperCase().replace(/\s/g, ""); const f = CIE10.find((x) => x[0] === c || x[0].replace(".", "") === c.replace(".", "")); return f ? f[1] : ""; }
// ¿el código CIE corresponde a un evento de notificación obligatoria?
function sivePara(code) {
  const c = String(code || "").toUpperCase().replace(/[\s.]/g, ""); if (!c) return [];
  const cat = c.slice(0, 3);
  return SIVE_EV.filter((e) => e.c && e.c.split("-").length && (() => {
    const parts = e.c.replace(/\./g, "").split("-");
    if (parts.length === 2 && parts[0][0] === parts[1][0] && /^[A-Z]\d\d$/.test(parts[0].slice(0, 3)) && parts[0].length === 3 && parts[1].length === 3)
      return cat >= parts[0] && cat <= parts[1];
    return parts.some((p) => c.startsWith(p) || (p.length > 3 && p.startsWith(c) && c.length >= 3));
  })());
}
// semana epidemiológica (domingo a sábado; la semana 1 termina el primer sábado de enero con ≥ 4 días del año)
function semanaEpi(iso) {
  const d = new Date(iso + "T00:00");
  const w1 = (y) => { const j = new Date(y, 0, 1), dow = j.getDay(); const s = new Date(y, 0, 1 - dow); if (dow > 3) s.setDate(s.getDate() + 7); return s; };
  let y = d.getFullYear(), s = w1(y);
  if (d < s) { y--; s = w1(y); } else { const n = w1(y + 1); if (d >= n) { y++; s = n; } }
  return Math.floor((d - s) / (7 * 864e5)) + 1;
}

/* autocompletado CIE-10 para todos los campos de diagnóstico */
(() => {
  const box = document.createElement("div"); box.className = "ciebox"; document.body.appendChild(box);
  let tgt = null, items = [], sel = -1;
  const pair = (el) => {
    const tr = el.closest("tr"), f = el.form;
    if (el.matches("[data-dx]")) return { d: $("[data-dx=d]", tr), c: $("[data-dx=cie]", tr) };
    if (el.matches("[data-k=dx],[data-k=cie]")) return { d: $("[data-k=dx]", tr), c: $("[data-k=cie]", tr) };
    if (f && f.dx && f.cie) return { d: f.dx, c: f.cie };
    return null;
  };
  const hide = () => { box.style.display = "none"; tgt = null; sel = -1; };
  const pick = (i) => {
    const it = items[i], p = tgt && pair(tgt); if (!it || !p) return hide();
    const multi = tgt.name === "dx" || tgt.name === "cie";
    if (multi && p.d.value.includes(";")) { const dd = p.d.value.split(";").map((x) => x.trim()); dd[dd.length - 1] = it[1]; p.d.value = dd.join("; "); const cc = p.c.value.split(";").map((x) => x.trim()); cc[Math.max(0, dd.length - 1)] = it[0]; p.c.value = cc.join("; "); }
    else { p.d.value = it[1]; p.c.value = it[0]; }
    hide();
    [p.d, p.c].forEach((x) => { x.dispatchEvent(new Event("input", { bubbles: true })); x.dispatchEvent(new Event("change", { bubbles: true })); });
  };
  document.addEventListener("input", (e) => {
    const el = e.target; if (!(el instanceof HTMLInputElement) || !el.matches("[data-dx=d],[data-dx=cie],[data-k=dx],[data-k=cie],#f [name=dx],#f [name=cie]")) return;
    if (e.isTrusted === false && el !== tgt) return;
    const q = el.name === "dx" || el.name === "cie" ? el.value.split(";").pop() : el.value;
    items = cieSearch(q, 12); if (!items.length) return hide();
    tgt = el; sel = -1;
    box.innerHTML = items.map((x, i) => `<div data-i="${i}"><b>${x[0]}</b> ${esc(x[1])}</div>`).join("");
    const r = el.getBoundingClientRect(); box.style.left = (r.left + scrollX) + "px"; box.style.top = (r.bottom + scrollY + 2) + "px"; box.style.minWidth = Math.max(r.width, 360) + "px"; box.style.display = "block";
  });
  box.addEventListener("mousedown", (e) => { const d = e.target.closest("[data-i]"); if (d) { e.preventDefault(); pick(+d.dataset.i); } });
  document.addEventListener("keydown", (e) => {
    if (box.style.display !== "block" || e.target !== tgt) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; $$("div", box).forEach((d, i) => d.classList.toggle("on", i === sel)); }
    else if (e.key === "Enter" && sel >= 0) { e.preventDefault(); pick(sel); } else if (e.key === "Escape") hide();
  });
  document.addEventListener("focusout", (e) => { if (e.target === tgt) setTimeout(hide, 150); });
})();

/* celdas de la ficha EPI-1 (notificación) y de la ficha de investigación */
function mapEPI1(at) {
  const s = DB.settings, p = at.patient, d = at.dEPI || {}, o = {}, X = "X";
  const f = at.fecha, [y, m, dd] = f.split("-");
  const ev = SIVE_EV[+d.ev] || null, dxi = d.dxi || (ev ? ev.e + (ev.c ? " (" + ev.c + ")" : "") : "");
  const age = p.nac ? (() => { const a = new Date(p.nac + "T00:00"), b = new Date(f + "T00:00"); let yy = b.getFullYear() - a.getFullYear(), mm = b.getMonth() - a.getMonth(), da = b.getDate() - a.getDate(); if (da < 0) { mm--; da += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); } if (mm < 0) { yy--; mm += 12; } return [yy, mm, da]; })() : null;
  Object.assign(o, {
    "0:AE5": String(semanaEpi(f)), "0:N8": X, "0:Z7!": UP(s.estab), "0:J10!": UP(s.estProv), "0:R10!": UP(s.estCanton), "0:Z10": UP(s.estParroq),
    "0:I13": dd, "0:K13": m, "0:M13": y, "0:Y13": UP(s.nombre),
    "0:G16": p.ap1, "0:J16": p.ap2, "0:M16": p.n1, "0:P16": p.n2, "0:L19": p.hcu || p.cedula, "0:Z19!": UP(d.nac || "ECUATORIANA"),
    ["0:" + (p.sexo === "Masculino" ? "F21" : "H21")]: X, "0:N21": UP(p.ocupacion), "0:Z21": UP(d.etnia),
    "0:I27": p.prov, "0:P27": p.canton, "0:X27": p.parroq, "0:H30": UP(p.domicilio), "0:AA30": p.tel, "0:H31!": UP(d.barrio), "0:H33": UP(d.lugar),
    "0:Z36": UP(dxi),
  });
  String(p.cedula || "").replace(/\D/g, "").split("").slice(0, 10).forEach((ch, i) => (o["0:" + ["AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ"][i] + "16"] = ch));
  if (p.nac) { const [ny, nm, nd] = p.nac.split("-"); Object.assign(o, { "0:J24": nd, "0:L24": nm, "0:N24": ny }); }
  if (age) Object.assign(o, { "0:X24": String(age[0]), "0:Z24": String(age[1]), "0:AB24": String(age[2]) });
  if (d.ini) { const [iy, im, id] = d.ini.split("-"); Object.assign(o, { "0:J36": id, "0:L36": im, "0:N36": iy }); }
  if (d.emb === "SI") o["0:K39"] = X; else if (d.emb === "NO") o["0:N39"] = X;
  if (d.sem) o["0:Z39!"] = d.sem;
  if (d.mue === "SI") o["0:K41"] = X; else if (d.mue === "NO") o["0:N41"] = X;
  // ficha de investigación
  Object.assign(o, {
    "1:AB4": UP(dxi), "1:T6": UP(s.estab), "1:AS6": dd, "1:AV6": m, "1:BB6": y, "1:O8": UP(s.estProv), "1:Z8": UP(s.estCanton), "1:AM8": UP(s.estParroq),
    "1:J10": p.ap1, "1:T10": p.ap2, "1:AC10": p.n1, "1:AM10": p.n2, "1:AX10": p.sexo === "Masculino" ? "H" : "M",
    "1:AI13": UP(d.etnia), "1:K15": UP(p.ocupacion), "1:AQ15": p.tel, "1:N17": p.prov, "1:AA17": p.canton, "1:AO17": p.parroq, "1:AU17": UP(d.barrio), "1:T19": UP(p.domicilio),
  });
  if (age) Object.assign(o, { "1:I13": String(age[0]), "1:L13": String(age[1]), "1:O13": String(age[2]) });
  return o;
}
