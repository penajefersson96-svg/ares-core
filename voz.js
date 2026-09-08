// voz.js — La boca de Ares (Fase 4, con selector y memoria de voz)
const AresVoz = {
  activada: true,
  saltar: false,
  soportada: ('speechSynthesis' in window),

  vozGuardada: () => {
    const nombre = localStorage.getItem('ares_voz');
    if (!nombre) return null;
    return window.speechSynthesis.getVoices().find(v => v.name === nombre) || null;
  },

  hablar: (texto) => {
    if (!AresVoz.activada || !AresVoz.soportada) return;
    const s = window.speechSynthesis;
    s.cancel();
    texto = texto.replace(/jefersson/gi, 'Jefersón'); 
     texto = texto.replace(/jefersson/gi, 'Yefersson'); 
     const u = new SpeechSynthesisUtterance(texto);
    const v = AresVoz.vozGuardada() || s.getVoices().find(x => x.name === 'español Estados Unidos') || s.getVoices().find(x => x.lang.startsWith('es')); 
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'es-ES'; }
    u.rate = 1;
    u.pitch = 0.8;
    s.speak(u);
  },

  listar: () => {
    const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    if (!vs.length) { AresVoz.hablar('Aun no cargo mis voces. Intenta de nuevo en unos segundos.'); return; }
    AresDiag.log('🎙️ Voces en español → ' + vs.map((v, i) => (i + 1) + ': ' + v.name).join('  |  '));
    AresVoz.hablar('Tengo estas voces: ' + vs.map((v, i) => (i + 1) + ': ' + v.name).join(', ') + '. Dime voz y el numero que quieras.');
  },

  elegir: (n) => {
    const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    const v = vs[n - 1];
    if (!v) { AresVoz.hablar('Ese numero no existe, socio.'); return; }
    localStorage.setItem('ares_voz', v.name);
    AresVoz.hablar('Perfecto. Desde ahora hablare con la voz ' + v.name);
  },

  init: () => {
    const original = AresCerebro.mostrar;
    AresCerebro.mostrar = (quien, msg) => {
      original(quien, msg);
      if (quien === 'TÚ') {
        const t = msg.toLowerCase().trim();
        if (t === 'voces') { AresVoz.saltar = true; AresVoz.listar(); }
        const m = t.match(/^voz (\d+)$/);
        if (m) { AresVoz.saltar = true; AresVoz.elegir(Number(m[1])); }
      }
      if (quien === 'ARES') {
        if (AresVoz.saltar) { AresVoz.saltar = false; } else { AresVoz.hablar(msg); }
      }
    };

    const b = document.createElement('button');
    b.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99;width:42px;height:42px;border-radius:50%;background:#000;border:1px solid #0ff;color:#0ff;font-size:18px';
    b.textContent = AresVoz.soportada ? '🔊' : '️';
    b.onclick = () => {
      if (!AresVoz.soportada) { AresDiag.log('⚠️ Este visor no tiene motor de voz. Abre Ares en Chrome.'); return; }
      AresVoz.activada = !AresVoz.activada;
      b.textContent = AresVoz.activada ? '🔊' : '🔇';
      if (!AresVoz.activada) window.speechSynthesis.cancel();
    };
    document.body.appendChild(b);

    AresDiag.log(AresVoz.soportada ? '🎙️ Módulo de voz activado.' : '⚠️ Voz no disponible en este visor.');
  }
};
document.addEventListener('DOMContentLoaded', AresVoz.init);