/* ---------- seguridad: contraseña, cifrado de los datos y bloqueo automático ----------
   Los datos se guardan cifrados (AES-GCM 256) en ENC_KEY. La clave se deriva de la contraseña con PBKDF2-SHA256
   y una sal aleatoria; solo vive en memoria mientras la app está desbloqueada. Cada guardado usa un IV nuevo.
   Formato del sobre cifrado (también en los respaldos .json):
   { signo:"cifrado", v:1, kdf:"PBKDF2-SHA256", it, salt, iv, ct, z:"gzip"|"" }  (salt/iv/ct en base64) */
const ENC_KEY = "signo_consultorio_enc_v1", TRY_KEY = "signo_pin_intentos";
const PBKDF2_IT = 600000, PW_MIN = 8, LOCK_MS = 10 * 60 * 1000;
const SEC = { key: null, salt: null, it: PBKDF2_IT, locked: true, lockMs: LOCK_MS, last: Date.now(), pending: null, busy: false, chain: Promise.resolve() };
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_STANDALONE = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;

const b64e = (u8) => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const b64d = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const isEnv = (o) => !!(o && o.signo === "cifrado" && o.ct && o.iv && o.salt && o.it);
const HAS_GZ = typeof CompressionStream === "function" && typeof DecompressionStream === "function";
async function gz(u8, comp) { const st = new Blob([u8]).stream().pipeThrough(comp ? new CompressionStream("gzip") : new DecompressionStream("gzip")); return new Uint8Array(await new Response(st).arrayBuffer()); }
async function deriveKey(pin, salt, it) {
  // NFC: la «ñ» o las tildes escritas en iPhone y en Windows dan los mismos bytes
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin.normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: it }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function encText(key, salt, it, text) {
  let data = new TextEncoder().encode(text), z = "";
  if (HAS_GZ) { data = await gz(data, true); z = "gzip"; }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
  return { signo: "cifrado", v: 1, kdf: "PBKDF2-SHA256", it, salt: b64e(salt), iv: b64e(iv), ct: b64e(ct), z };
}
async function decText(key, env) { // falla (lanza error) si la clave/contraseña no es la correcta
  let data = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64d(env.iv) }, key, b64d(env.ct)));
  if (env.z === "gzip") data = await gz(data, false);
  return new TextDecoder().decode(data);
}
async function openEnv(pin, env) { const salt = b64d(env.salt), key = await deriveKey(pin, salt, env.it); const text = await decText(key, env); return { key, salt, it: env.it, text }; }
function readEnv() { try { const o = JSON.parse(localStorage.getItem(ENC_KEY)); return isEnv(o) ? o : null; } catch (e) { return null; } }
function readPlain() { try { const o = JSON.parse(localStorage.getItem(KEY)); return o && typeof o === "object" ? o : null; } catch (e) { return null; } }

/* guardar cifrado: siempre se escribe la última versión; si está bloqueado queda pendiente hasta desbloquear */
function secSave(text) {
  SEC.pending = text;
  if (!SEC.key || SEC.busy) return;
  SEC.busy = true;
  SEC.chain = (async () => {
    try { while (SEC.pending != null && SEC.key) { const t = SEC.pending; SEC.pending = null; localStorage.setItem(ENC_KEY, JSON.stringify(await encText(SEC.key, SEC.salt, SEC.it, t))); } }
    catch (e) { toast("No se pudo guardar en este navegador. Descarga un respaldo ahora."); }
    finally { SEC.busy = false; }
  })();
}
addEventListener("beforeunload", (e) => { if (SEC.busy || SEC.pending != null) { e.preventDefault(); e.returnValue = ""; } });

/* freno a intentos: 3 intentos libres; después espera de 30 s que se duplica en cada error (máximo 30 min) */
function tries() { try { return JSON.parse(localStorage.getItem(TRY_KEY)) || { n: 0, until: 0 }; } catch (e) { return { n: 0, until: 0 }; } }
function failTry() { const t = tries(); t.n++; t.until = t.n >= 3 ? Date.now() + Math.min(30 * 60e3, 30e3 * 2 ** (t.n - 3)) : 0; localStorage.setItem(TRY_KEY, JSON.stringify(t)); return t; }
function okTry() { localStorage.removeItem(TRY_KEY); }

const pwWeak = (p) => /^(.)\1+$/.test(p) || "0123456789012345678909876543210987654321abcdefghijklmnopqrstuvwxyz".includes(p.toLowerCase()) || /^(contrase[ñn]a|password|qwerty|asdf|signo|consultorio|medicina|doctor)\d*$/i.test(p);
const pinOk = (p) => p.length >= PW_MIN;
const pinInput = (id, ph) => `<span class="pwrap"><input type="password" id="${id}" class="pin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="128" placeholder="${ph || ""}"><button type="button" class="btn s sm pweye" aria-label="Mostrar u ocultar la contraseña">Mostrar</button></span>`;
// botón Mostrar/Ocultar de cada campo de contraseña
document.addEventListener("click", (e) => { const b = e.target.closest(".pweye"); if (!b) return; e.preventDefault(); const i = b.previousElementSibling, show = i.type === "password"; i.type = show ? "text" : "password"; b.textContent = show ? "Ocultar" : "Mostrar"; i.focus(); });
const lockBrand = () => `<img src="${LOGO}" alt="Signo" class="lklogo">`;
const IOS_TXT = `<b>En iPhone, instala Signo en la pantalla de inicio.</b> En Safari toca el botón Compartir (cuadro con flecha ↑) y elige «Agregar a inicio». Si la usas solo como página de Safari, el iPhone puede borrar los datos cuando pasan unos 7 días sin abrirla. <i>Ojo: la app instalada guarda sus datos aparte de Safari; si ya tienes datos aquí, descarga un respaldo y luego restáuralo dentro de la app instalada.</i>`;

function setLockedUI(on) {
  document.body.classList.toggle("locked", on);
  [...document.body.children].forEach((el) => { if (el.id !== "lock" && el.tagName !== "SCRIPT") { if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
}

/* pantalla de crear la contraseña (primera vez) */
function showCreate() {
  const pl = readPlain(), np = pl ? Object.keys(pl.patients || {}).length : 0, nd = pl ? (pl.docs || []).length + (pl.atenciones || []).length + (pl.ocup || []).length : 0;
  setLockedUI(true);
  $("#lock").innerHTML = `<div class="lk">${lockBrand()}<h2>Protege los datos de tus pacientes</h2>
    <p>Crea una contraseña. Se pedirá cada vez que abras la app y después de 10 minutos sin uso. Los datos quedan <b>cifrados</b> en este equipo.</p>
    ${pl ? `<p class="lkok">Se van a cifrar los datos que ya tienes (${np} pacientes, ${nd} documentos y atenciones). No se pierde nada.</p>
    <p><b>Antes de seguir, descarga un respaldo por seguridad.</b> Este archivo sale <b>sin cifrar</b>: guárdalo en un lugar seguro y bórralo cuando ya tengas un respaldo nuevo cifrado.</p>
    <button class="btn s" id="pnbk" type="button">Descargar respaldo antes (recomendado)</button>` : ""}
    <ul class="lkrules"><li>Mínimo <b>${PW_MIN} caracteres</b>. Mejor una <b>frase larga</b> que puedas recordar, por ejemplo cuatro palabras con algún número o símbolo.</li><li>Puedes usar letras, números y símbolos. Distingue mayúsculas de minúsculas.</li><li>No uses tu cédula, tu teléfono, tu nombre ni fechas (cumpleaños, aniversarios).</li></ul>
    <label>Nueva contraseña${pinInput("pn1", "Mínimo 8 caracteres")}</label>
    <label>Repite la contraseña${pinInput("pn2")}</label>
    <div class="lkwarn"><b>⚠ IMPORTANTE: si olvidas la contraseña, los datos NO se pueden recuperar.</b> Nadie puede abrirlos sin ella, ni siquiera el programador. Anótala en papel y guárdala en un lugar seguro.</div>
    <label class="chk lkchk"><input type="checkbox" id="pnok"> Entiendo que si olvido la contraseña pierdo los datos.</label>
    ${IS_IOS && !IS_STANDALONE() ? `<div class="lkios">${IOS_TXT}</div>` : ""}
    <div class="lkerr" id="pnerr"></div>
    <button class="btn p lkbtn" id="pngo">Crear contraseña y cifrar los datos</button></div>`;
  $("#pn1").focus();
  const go2 = async () => {
    const a = $("#pn1").value, b = $("#pn2").value, er = $("#pnerr");
    if (!pinOk(a)) return (er.textContent = `La contraseña debe tener al menos ${PW_MIN} caracteres.`);
    if (a !== b) return (er.textContent = "Las dos contraseñas no coinciden. Escríbelas de nuevo.");
    if (pwWeak(a)) return (er.textContent = "Esa contraseña es demasiado fácil de adivinar. Elige otra más larga o menos común.");
    if (!$("#pnok").checked) return (er.textContent = "Marca la casilla para confirmar que entiendes el aviso.");
    er.textContent = ""; $("#pngo").disabled = true; $("#pngo").textContent = "Cifrando…";
    try {
      load(pl);
      const salt = crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(a, salt, PBKDF2_IT), text = JSON.stringify(DB);
      const env = await encText(key, salt, PBKDF2_IT, text);
      if ((await decText(key, env)) !== text) throw new Error("verificación");
      localStorage.setItem(ENC_KEY, JSON.stringify(env));
      if (readEnv() === null) throw new Error("no se guardó");
      localStorage.removeItem(KEY); // se borra la copia sin cifrar
      Object.assign(SEC, { key, salt, it: PBKDF2_IT }); okTry(); afterUnlock(true);
      toast("Contraseña creada. Tus datos están cifrados.");
    } catch (e) { er.textContent = "No se pudo cifrar en este navegador. Tus datos siguen como estaban. (" + (e.message || e) + ")"; $("#pngo").disabled = false; $("#pngo").textContent = "Crear contraseña y cifrar los datos"; }
  };
  if ($("#pnbk")) $("#pnbk").onclick = () => { download(JSON.stringify(pl, null, 1), `Respaldo_Signo_${today()}_antes_de_cifrar.json`, "application/json"); $("#pnbk").textContent = "✓ Respaldo descargado"; };
  $("#pngo").onclick = go2; $("#pn2").onkeydown = (e) => { if (e.key === "Enter") go2(); };
}

/* pantalla de contraseña (al abrir y tras bloqueo) */
function showUnlock(again) {
  setLockedUI(true);
  $("#lock").innerHTML = `<div class="lk">${lockBrand()}<h2>${again ? "App bloqueada" : "Signo Consultorio"}</h2>
    <p>${again ? "Se bloqueó para proteger los datos. Lo que estabas escribiendo sigue ahí." : "Escribe tu contraseña para abrir los datos."}</p>
    <label>Contraseña${pinInput("pin")}</label><div class="lkerr" id="pnerr"></div>
    <button class="btn p lkbtn" id="pngo">Abrir</button>
    <button class="lklink" id="pnforgot" type="button">¿Olvidaste la contraseña?</button></div>`;
  const inp = $("#pin"), btn = $("#pngo"), er = $("#pnerr");
  let tick;
  const wait = () => {
    clearInterval(tick); const t = tries();
    const left = () => Math.ceil((t.until - Date.now()) / 1000);
    if (left() > 0) {
      inp.disabled = btn.disabled = true;
      const show = () => { const s = left(); if (s <= 0) { clearInterval(tick); inp.disabled = btn.disabled = false; er.textContent = `Contraseña incorrecta ${t.n} veces. Ya puedes intentar otra vez.`; inp.focus(); return; }
        er.textContent = `Contraseña incorrecta ${t.n} veces. Espera ${s >= 60 ? Math.floor(s / 60) + " min " + (s % 60) + " s" : s + " s"} para volver a intentar.`; };
      show(); tick = setInterval(show, 1000);
    } else inp.focus();
  };
  const go2 = async () => {
    if (btn.disabled) return; const pin = inp.value; if (!pin) return;
    const env = readEnv(); if (!env) return showCreate();
    btn.disabled = true; btn.textContent = "Abriendo…"; er.textContent = "";
    try {
      const t0 = performance.now(), r = await openEnv(pin, env); SEC.lastDeriveMs = Math.round(performance.now() - t0);
      okTry(); clearInterval(tick); Object.assign(SEC, { key: r.key, salt: r.salt, it: r.it });
      if (!again) load(JSON.parse(r.text));
      afterUnlock(!again);
    } catch (e) {
      const t = failTry(); inp.value = ""; btn.textContent = "Abrir"; btn.disabled = false;
      er.textContent = `Contraseña incorrecta.${t.n < 3 ? (3 - t.n === 1 ? " Te queda 1 intento antes de tener que esperar." : ` Te quedan ${3 - t.n} intentos antes de tener que esperar.`) : ""}`; wait();
    }
  };
  btn.onclick = go2; inp.onkeydown = (e) => { if (e.key === "Enter") go2(); };
  $("#pnforgot").onclick = forgotPin;
  wait();
}

function forgotPin() {
  alert("Sin la contraseña no hay forma de abrir los datos cifrados: nadie puede recuperarlos.\n\nSi tienes un respaldo y recuerdas la contraseña con la que lo descargaste (o es un respaldo antiguo sin cifrar), puedes empezar de cero y restaurarlo en «Ajustes y respaldo».");
  const w = prompt("Para BORRAR los datos cifrados de este equipo y empezar de cero, escribe BORRAR.\n(Antes se descargará una copia cifrada, por si recuerdas la contraseña más adelante.)");
  if (w !== "BORRAR") return;
  const raw = localStorage.getItem(ENC_KEY);
  if (raw) download(raw, `Copia_cifrada_Signo_${today()}.json`, "application/json");
  setTimeout(() => { localStorage.removeItem(ENC_KEY); okTry(); location.reload(); }, 800);
}

let STARTED = false;
function afterUnlock(first) {
  SEC.locked = false; SEC.last = Date.now(); setLockedUI(false); $("#lock").innerHTML = "";
  if (SEC.pending != null) secSave(SEC.pending);
  if (first) {
    // si quedó una copia sin cifrar (por ejemplo, de una versión vieja usada sin internet), se combina y se borra
    const pl = readPlain();
    if (pl && pl.docs && pl.settings) { const n = mergeDB(pl); localStorage.removeItem(KEY); toast(`Se cifraron datos que estaban sin protección (${n.p} pacientes, ${n.d} documentos).`); }
    else if (pl) localStorage.removeItem(KEY);
    if (!STARTED) { STARTED = true; go("atencion"); }
  }
  drawWarns();
}

async function lockApp() {
  if (SEC.locked || !SEC.key) return;
  SEC.locked = true; showUnlock(true);
  try { await SEC.chain; } catch (e) {}
  if (SEC.pending != null && SEC.key) { secSave(SEC.pending); try { await SEC.chain; } catch (e) {} }
  if (SEC.locked) SEC.key = null; // la clave se borra de la memoria
}
["pointerdown", "pointermove", "keydown", "touchstart", "wheel", "scroll", "input"].forEach((ev) => addEventListener(ev, () => { if (!SEC.locked) SEC.last = Date.now(); }, { passive: true, capture: true }));
const idleCheck = () => { if (!SEC.locked && SEC.key && Date.now() - SEC.last > SEC.lockMs) lockApp(); };
setInterval(idleCheck, 5000);
document.addEventListener("visibilitychange", idleCheck); addEventListener("pageshow", idleCheck); addEventListener("focus", idleCheck);

/* diálogo para pedir una o más contraseñas (cambio de contraseña, respaldos) */
function pinDialog(title, msg, labels, okTxt) {
  return new Promise((res) => {
    const d = document.createElement("div"); d.className = "pindlg";
    d.innerHTML = `<div class="lk"><h2>${title}</h2>${msg ? `<p>${msg}</p>` : ""}${labels.map((l, i) => `<label>${l}${pinInput("pd" + i)}</label>`).join("")}
      <div class="lkerr"></div><div class="row"><button class="btn p" data-ok>${okTxt || "Aceptar"}</button><button class="btn s" data-no>Cancelar</button></div></div>`;
    document.body.appendChild(d);
    const ins = $$("input", d), er = $(".lkerr", d);
    const close = (v) => { d.remove(); res(v); };
    d.err = (m) => (er.textContent = m);
    $("[data-no]", d).onclick = () => close(null);
    const ok = () => close({ values: ins.map((i) => i.value), dlg: d });
    $("[data-ok]", d).onclick = ok; ins.forEach((i) => (i.onkeydown = (e) => { if (e.key === "Enter") ok(); if (e.key === "Escape") close(null); }));
    ins[0].focus();
  });
}

async function changePin() {
  let err = "";
  for (;;) {
    const r = await pinDialog("Cambiar contraseña", (err ? `<b class="warnt">${err}</b><br>` : "") + `Mínimo ${PW_MIN} caracteres; mejor una frase larga. No uses cédula, teléfono, tu nombre ni fechas.<br><b class="warnt">Si olvidas la contraseña nueva, los datos no se recuperan.</b> Los respaldos que ya descargaste siguen abriéndose con la contraseña anterior.`, ["Contraseña actual", "Contraseña nueva", "Repite la contraseña nueva"], "Cambiar contraseña");
    if (!r) return;
    const [cur, a, b] = r.values;
    try { await openEnv(cur, readEnv()); } catch (e) { failTry(); err = "La contraseña actual no es correcta."; continue; }
    if (!pinOk(a)) { err = `La contraseña nueva debe tener al menos ${PW_MIN} caracteres.`; continue; }
    if (a !== b) { err = "Las dos contraseñas nuevas no coinciden."; continue; }
    if (pwWeak(a)) { err = "Esa contraseña es demasiado fácil de adivinar."; continue; }
    okTry();
    try {
      await SEC.chain;
      const salt = crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(a, salt, PBKDF2_IT), text = JSON.stringify(DB);
      const env = await encText(key, salt, PBKDF2_IT, text);
      if ((await decText(key, env)) !== text) throw new Error("verificación");
      localStorage.setItem(ENC_KEY, JSON.stringify(env));
      Object.assign(SEC, { key, salt, it: PBKDF2_IT });
      toast("Contraseña cambiada. Descarga un respaldo nuevo: se cifrará con la contraseña nueva.");
    } catch (e) { toast("No se pudo cambiar la contraseña. Sigue valiendo la anterior."); }
    return;
  }
}

/* respaldos cifrados con la contraseña actual */
async function backupEncrypted() {
  await SEC.chain;
  const env = await encText(SEC.key, SEC.salt, SEC.it, JSON.stringify(DB));
  env.tipo = "respaldo"; env.fecha = new Date().toISOString();
  download(JSON.stringify(env), `Respaldo_Signo_${today()}.json`, "application/json");
}
/* lee un archivo de respaldo: cifrado (pide la contraseña si no es la actual) o antiguo sin cifrar. Devuelve los datos o null */
async function readBackupFile(file) {
  let o; try { o = JSON.parse(await file.text()); } catch (e) { toast("Ese archivo no es un respaldo válido de Signo."); return null; }
  if (isEnv(o)) {
    if (SEC.key && SEC.salt && o.salt === b64e(SEC.salt)) { try { return JSON.parse(await decText(SEC.key, o)); } catch (e) {} }
    let err = "";
    for (;;) {
      const r = await pinDialog("Contraseña del respaldo", (err ? `<b class="warnt">${err}</b><br>` : "") + "Este respaldo está cifrado. Escribe la contraseña que tenías cuando lo descargaste.", ["Contraseña del respaldo"], "Abrir respaldo");
      if (!r) return null;
      try { return JSON.parse((await openEnv(r.values[0], o)).text); } catch (e) { err = "Esa contraseña no abre este respaldo."; }
    }
  }
  if (o && o.docs && o.settings) return o;
  toast("Ese archivo no es un respaldo válido de Signo."); return null;
}

/* avisos arriba de cada pantalla: respaldo atrasado e instalación en iPhone */
function drawWarns() {
  const w = $("#warns"); if (!w) return; let h = "";
  const hasData = Object.keys(DB.patients || {}).length || (DB.docs || []).length || (DB.atenciones || []).length || (DB.ocup || []).length;
  if (hasData && (!DB.lastBackup || Date.now() - DB.lastBackup > 7 * 864e5))
    h += `<div class="banner row" style="justify-content:space-between"><span><b>Haz un respaldo.</b> ${DB.lastBackup ? "El último fue el " + new Date(DB.lastBackup).toLocaleDateString("es-EC") + " (hace más de 7 días)." : "Aún no has hecho ninguno."} Si se borran los datos del navegador, solo el respaldo los salva.</span><button class="btn p sm" id="wbk">Descargar respaldo ahora</button></div>`;
  let iosOff = false; try { iosOff = sessionStorage.getItem("signo_ios_ok") === "1"; } catch (e) {}
  if (IS_IOS && !IS_STANDALONE() && !iosOff) h += `<div class="banner row" style="justify-content:space-between"><span>${IOS_TXT}</span><button class="btn s sm" id="wios">Entendido</button></div>`;
  w.innerHTML = h;
  if ($("#wbk")) $("#wbk").onclick = () => doBackup();
  if ($("#wios")) $("#wios").onclick = () => { try { sessionStorage.setItem("signo_ios_ok", "1"); } catch (e) {} drawWarns(); };
}
async function doBackup() {
  try { DB.lastBackup = Date.now(); save(); await backupEncrypted(); toast("Respaldo cifrado descargado. Para abrirlo hará falta tu contraseña actual."); }
  catch (e) { toast("No se pudo crear el respaldo."); }
  drawWarns(); if ($("#bk")) V.ajustes();
}
/* aviso antes de descargar archivos que salen sin cifrar */
const plainOk = (que) => confirm(`⚠ ${que} sale SIN PROTECCIÓN: cualquiera que abra el archivo puede leer los datos de tus pacientes.\n\nGuárdalo en un lugar seguro, no lo envíes por WhatsApp ni correo, y bórralo cuando ya no lo necesites.\n\n¿Descargar de todos modos?`);

function secStart() {
  if (!(window.crypto && crypto.subtle)) {
    setLockedUI(true);
    $("#lock").innerHTML = `<div class="lk">${lockBrand()}<h2>No se puede abrir aquí</h2><p>Este navegador no permite cifrar los datos en esta dirección. Abre la app desde <b>https://signoy.github.io/SIGNO/</b> (o la app instalada).</p></div>`;
    return;
  }
  if (readEnv()) showUnlock(false); else showCreate();
}
