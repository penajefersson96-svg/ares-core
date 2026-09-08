// oidos.js v5 — Conversacion fluida + comprension con carino
const AresOidos = {
  activo: false,
  centinela: false,
  dormido: null,
  wake: null,
  r: null,
  b2: null,
  soportado: ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window),

  init: () => {
    if (!AresOidos.soportado) { AresDiag.log('⚠️ Este visor no tiene oidos. Usa Chrome.'); return; }
    const ok = document.getElementById('enviar');
    const estilo = 'background:transparent;border:1px solid #0ff;color:#0ff;padding:10px;font-size:16px';
    const b1 = document.createElement('button');
    b1.textContent = '🎙'; b1.style.cssText = estilo;
    b1.onclick = () => AresOidos.unaVez(b1);
    ok.parentNode.insertBefore(b1, ok);
    const b2 = document.createElement('button');
    b2.textContent = '🛡️'; b2.style.cssText = estilo;
    b2.onclick = () => AresOidos.centinelaToggle(b2);
    ok.parentNode.insertBefore(b2, ok);
    AresDiag.log('👂 Oidos v5: 🟢 = conversacion libre.');
  },

  nuevo: () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new R();
    r.lang = 'es-ES';
    r.interimResults = false;
    return r;
  },

  limpiar: (t) => {
    let s = t.toLowerCase().trim();
    if (/a\s*res/.test(s)) s = s.replace(/.*a\s*res/, '');
    let prev;
    do { prev = s; s = s.replace(/\b(\w+)\s+\1\b/g, '$1'); } while (s !== prev);
    return s.replace(/\s+/g, ' ').trim();
  },

  renovar: () => {
    clearTimeout(AresOidos.dormido);
    AresOidos.dormido = setTimeout(() => AresOidos.centinelaToggle(AresOidos.b2), 300000);
  },

  unaVez: (b) => {
    if (AresOidos.activo) return;
    AresOidos.activo = true;
    b.textContent = '🔴';
    const r = AresOidos.nuevo();
    r.onresult = (e) => {
      const limpio = AresOidos.limpiar(e.results[0][0].transcript);
      document.getElementById('entrada').value = limpio;
      AresCerebro.enviar();
    };
    r.onend = () => { AresOidos.activo = false; b.textContent = '🎙'; };
    r.onerror = (e) => { AresOidos.activo = false; b.textContent = '🎙'; AresDiag.log('⚠️ Oidos: ' + e.error); };
    r.start();
  },

  centinelaToggle: (b) => {
    if (AresOidos.centinela) {
      AresOidos.centinela = false;
      b.textContent = '🛡️';
      if (AresOidos.r) AresOidos.r.stop();
      if (AresOidos.wake) AresOidos.wake.release();
      clearTimeout(AresOidos.dormido);
      AresDiag.log('😴 Centinela dormido.');
      return;
    }
    AresOidos.centinela = true;
    AresOidos.b2 = b;
    b.textContent = '🟢';
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { AresOidos.wake = w; }).catch(() => {});
    AresOidos.renovar();
    AresDiag.log('💂 Centinela v5: habla libre, te escucho y respondo.');
    AresOidos.vigilar(b);
  },

  vigilar: (b) => {
    if (!AresOidos.centinela) return;
    const r = AresOidos.nuevo();
    AresOidos.r = r;
    let hecho = false;
    r.onresult = (e) => {
      if (window.speechSynthesis.speaking) return;
      const ult = e.results[e.results.length - 1];
      const t = ult[0].transcript.toLowerCase();
      AresDiag.log('👂 Oí: ' + t);
      const limpio = AresOidos.limpiar(t);
      if (limpio.length < 2) {
        if (/a\s*res/.test(t)) AresVoz.hablar('¿Sí, socio?');
        return;
      }
      hecho = true;
      AresOidos.renovar();
      document.getElementById('entrada').value = limpio;
      AresCerebro.enviar();
      setTimeout(() => { r.stop(); AresOidos.vigilar(b); }, 6000);
    };
    r.onend = () => {
      if (!hecho && AresOidos.centinela) setTimeout(() => AresOidos.vigilar(b), 400);
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed') { AresDiag.log('⚠️ Microfono denegado: centinela dormido.'); AresOidos.centinelaToggle(b); }
    };
    r.start();
  }
};
document.addEventListener('DOMContentLoaded', AresOidos.init);