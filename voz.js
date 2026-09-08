// voz.js — La boca de Ares (Fase 4, a prueba de choques)
const AresVoz = {
  activada: true,
  soportada: ('speechSynthesis' in window),

  hablar: (texto) => {
    if (!AresVoz.activada || !AresVoz.soportada) return;
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES';
    u.rate = 1;
    u.pitch = 0.9;
    const v = s.getVoices().find(v => v.lang.startsWith('es'));
    if (v) u.voice = v;
    s.speak(u);
  },

  init: () => {
    const original = AresCerebro.mostrar;
    AresCerebro.mostrar = (quien, msg) => {
      original(quien, msg);
      if (quien === 'ARES') AresVoz.hablar(msg);
    };

    const b = document.createElement('button');
    b.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99;width:42px;height:42px;border-radius:50%;background:#000;border:1px solid #0ff;color:#0ff;font-size:18px';
    b.textContent = AresVoz.soportada ? '🔊' : '⚠️';
    b.onclick = () => {
      if (!AresVoz.soportada) {
        AresDiag.log('⚠️ Este visor no tiene motor de voz. Abre Ares en Chrome.');
        return;
      }
      AresVoz.activada = !AresVoz.activada;
      b.textContent = AresVoz.activada ? '🔊' : '🔇';
      if (!AresVoz.activada) window.speechSynthesis.cancel();
    };
    document.body.appendChild(b);

    AresDiag.log(AresVoz.soportada
      ? '🎙️ Módulo de voz activado.'
      : '⚠️ Voz no disponible en este visor. Prueba en Chrome.');
  }
};
document.addEventListener('DOMContentLoaded', AresVoz.init);