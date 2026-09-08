// oidos.js — Fase 5: los oidos de Ares
const AresOidos = {
  activo: false,
  soportado: ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window),
  init: () => {
    if (!AresOidos.soportado) { AresDiag.log('⚠️ Este visor no tiene oidos. Usa Chrome.'); return; }
    const b = document.createElement('button');
    b.textContent = '🎙';
    b.style.cssText = 'background:transparent;border:1px solid #0ff;color:#0ff;padding:10px;font-size:16px';
    const ok = document.getElementById('enviar');
    ok.parentNode.insertBefore(b, ok);
    b.onclick = () => AresOidos.escuchar(b);
    AresDiag.log('👂 Oidos instalados. Toca el microfono y habla.');
  },
  escuchar: (b) => {
    if (AresOidos.activo) return;
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new R();
    r.lang = 'es-ES';
    r.interimResults = false;
    r.maxAlternatives = 1;
    AresOidos.activo = true;
    b.textContent = '🔴';
    r.onresult = (e) => {
      document.getElementById('entrada').value = e.results[0][0].transcript;
      AresCerebro.enviar();
    };
    r.onend = () => { AresOidos.activo = false; b.textContent = '🎙'; };
    r.onerror = (e) => {
      AresOidos.activo = false;
      b.textContent = '🎙';
      AresDiag.log('⚠️ Oidos: ' + e.error + ' (si dice not-allowed, activa el permiso de microfono en Chrome)');
    };
    r.start();
  }
};
document.addEventListener('DOMContentLoaded', AresOidos.init);