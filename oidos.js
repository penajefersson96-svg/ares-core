// oidos.js v4 — Centinela sereno (microfono estable)
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
    AresDiag.log('👂 Oidos listos: 🎙 una vez, 🛡️ centinela.');
  },

  nuevo: (continuo) => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new R();
    r.lang = 'es-ES';
    r.interimResults = false;
    if (continuo) r.continuous = true;
    return r;
  },

  renovar: () => {
    clearTimeout(AresOidos.dormido);
    AresOidos.dormido = setTimeout(() => AresOidos.centinelaToggle(AresOidos.b2), 300000);
  },

  unaVez: (b) => {
    if (AresOidos.activo) return;
    AresOidos.activo = true;
    b.textContent = '🔴';
    const r = AresOidos.nuevo(false);
    r.onresult = (e) => {
      document.getElementById('entrada').value = e.results[0][0].transcript;
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
    AresDiag.log('💂 Centinela activo: se dormira tras 5 min de silencio.');
    AresOidos.vigilar(b);
  },

  vigilar: (b) => {
    if (!AresOidos.centinela) return;
    const r = AresOidos.nuevo(true);
    AresOidos.r = r;
    let hecho = false;
    r.onresult = (e) => {
      if (window.speechSynthesis.speaking) return;
      const ult = e.results[e.results.length - 1];
      const t = ult[0].transcript.toLowerCase();
      if (!t.includes('ares')) return;
      hecho = true;
      const resto = t.replace(/.*ares/, '').trim();
      if (resto.length > 2) {
        AresOidos.renovar();
        document.getElementById('entrada').value = resto;
        AresCerebro.enviar();
        setTimeout(() => { r.stop(); AresOidos.vigilar(b); }, 6000);
      } else {
        AresOidos.renovar();
        r.stop();
        AresVoz.hablar('¿Sí, Jefersson?');
        AresOidos.unaVezCentinela(b);
      }
    };
    r.onend = () => {
      if (!hecho && AresOidos.centinela) setTimeout(() => AresOidos.vigilar(b), 400);
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed') { AresDiag.log('⚠️ Microfono denegado: centinela dormido.'); AresOidos.centinelaToggle(b); }
    };
    r.start();
  },

  unaVezCentinela: (b) => {
    const r = AresOidos.nuevo(false);
    let hecho = false;
    r.onresult = (e) => {
      hecho = true;
      AresOidos.renovar();
      document.getElementById('entrada').value = e.results[0][0].transcript;
      AresCerebro.enviar();
      setTimeout(() => AresOidos.vigilar(b), 6000);
    };
    r.onend = () => {
      if (!hecho && AresOidos.centinela) AresOidos.vigilar(b);
    };
    r.start();
  }
};
document.addEventListener('DOMContentLoaded', AresOidos.init);