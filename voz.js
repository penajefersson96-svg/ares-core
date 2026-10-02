// voz.js v12.2 — Garganta con conexión al orbe e integración con sonidos
const AresVoz = {
  activada: true,
  ultimo: '',
  soportada: ('speechSynthesis' in window),
  audioCtx: null,
  hablando: false,
  cola: [],
  elevenActivo: true,

  vozActual: () => {
    const s = window.speechSynthesis;
    const guardada = localStorage.getItem('ares_voz');
    if (guardada) {
      const v = s.getVoices().find(v => v.name === guardada);
      if (v) return v;
    }
    return s.getVoices().find(x => x.lang === 'es-MX') || 
           s.getVoices().find(x => x.lang === 'es-419') || 
           s.getVoices().find(x => x.lang === 'es-US') || 
           s.getVoices().find(x => x.lang.startsWith('es')) || null;
  },

  emocionDe: (t) => {
    if (/\b(jaja|chiste|broma|risa)\b/.test(t)) return 'alegria';
    if (/\b(triste|llor|lamento|pena|duelo|perdio|muerte|extrana|corazon|abrazo|perdon)\b/.test(t)) return 'tristeza';
    if (/\b(increible|genial|emocion|victoria|logramos)\b/.test(t)) return 'emocion';
    return 'neutro';
  },

  sonidoEmoji: (hex) => {
    if (window.AresSonidos) {
      AresSonidos.emojiASonido(hex);
    }
  },

  encolar: (t, emo, usarEleven) => {
    AresVoz.cola.push({ t, emo, usarEleven });
    if (!AresVoz.hablando) AresVoz.procesar();
  },

  procesar: async () => {
    if (!AresVoz.cola.length) { AresVoz.hablando = false; return; }
    AresVoz.hablando = true;
    const item = AresVoz.cola.shift();
    
    if (window.AresOrbe) AresOrbe.setHablando(true);
    
    if (AresVoz.elevenActivo && item.usarEleven) {
      try {
        const r = await fetch('https://ares.penajefersson96.workers.dev/api/voz', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: item.t })
        });
        if (r.ok) {
          const blob = await r.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          
          audio.onended = () => { 
            URL.revokeObjectURL(url); 
            if (window.AresOrbe) AresOrbe.setHablando(false);
            setTimeout(() => AresVoz.procesar(), 100); 
          };
          audio.onerror = () => { 
            URL.revokeObjectURL(url); 
            if (window.AresOrbe) AresOrbe.setHablando(false);
            AresVoz.hablarLocal(item); 
          };
          await audio.play(); 
          return;
        }
      } catch (e) { 
        console.warn('ElevenLabs falló, usando fallback:', e); 
        if (window.AresOrbe) AresOrbe.setHablando(false);
      }
    }
    AresVoz.hablarLocal(item);
  },

  hablarLocal: (item) => {
    const s = window.speechSynthesis;
    const v = AresVoz.vozActual();
    const u = new SpeechSynthesisUtterance(item.t);
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'es-ES'; }
    if (item.emo === 'alegria') { u.pitch = 1.15; u.rate = 1.05; }
    else if (item.emo === 'tristeza') { u.pitch = 0.75; u.rate = 0.85; }
    else if (item.emo === 'emocion') { u.pitch = 1.05; u.rate = 1.1; }
    else { u.pitch = 0.9; u.rate = 1; }
    
    u.onend = () => { 
      if (window.AresOrbe) AresOrbe.setHablando(false);
      setTimeout(() => AresVoz.procesar(), 100); 
    };
    u.onerror = () => { 
      if (window.AresOrbe) AresOrbe.setHablando(false);
      setTimeout(() => AresVoz.procesar(), 100); 
    };
    s.speak(u);
  },

  hablar: (texto) => {
    if (!AresVoz.activada || !texto.trim()) return;
    const s = window.speechSynthesis;
    if (s.getVoices().length === 0) {
      s.addEventListener('voiceschanged', () => AresVoz.hablar(texto), { once: true }); 
      return;
    }
    
    let t = texto.replace(/jefersson/gi, 'Yefersson')
                 .replace(/\*[^*]+\*/g, ' ')
                 .replace(/[*_#`]/g, '')
                 .replace(/\u2026|\.{2,}/g, ', ');
                 
    const emo = AresVoz.emocionDe(t);
    
    // --- INTEGRACIÓN CON SONIDOS: Reproducir emoción antes de hablar ---
    if (window.AresSonidos) {
      if (emo === 'alegria') setTimeout(() => AresSonidos.risa(), 120);
      else if (emo === 'tristeza') setTimeout(() => AresSonidos.llanto(), 250);
      else if (emo === 'emocion') setTimeout(() => AresSonidos.fiesta(), 150);
    }
    
    // --- SONIDOS DE EMOJIS ---
    const emojis = texto.match(/[\u{1F300}-\u{1FAFF}]/gu) || [];
    const vistos = [];
    emojis.forEach(em => {
      if (!vistos.includes(em)) {
        vistos.push(em);
        const hex = em.codePointAt(0).toString(16);
        setTimeout(() => AresVoz.sonidoEmoji(hex), 200 + vistos.length * 350);
      }
    });
    
    // Limpieza de texto para TTS
    const textoLimpio = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '');
    
    const frases = textoLimpio.match(/[^.!?…]+[.!?…]*/g) || [textoLimpio];
    let trozo = '';
    const partes = [];
    frases.forEach(f => {
      if ((trozo + f).length > 180) { 
        if (trozo) partes.push(trozo); 
        trozo = f.trim(); 
      }
      else trozo += f;
    });
    if (trozo.trim()) partes.push(trozo);
    partes.forEach(pz => AresVoz.encolar(pz, emo, true));
  },

  cancelar: () => { 
    window.speechSynthesis.cancel(); 
    AresVoz.hablando = false; 
    AresVoz.cola = []; 
    if (window.AresOrbe) AresOrbe.setHablando(false);
  },

  listar: () => {
    const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    if (!vs.length) { 
      AresCerebro.mostrar('ARES', 'Aun no cargo mis voces, señor.'); 
      return; 
    }
    AresCerebro.mostrar('ARES', 'Tengo estas voces:\n' + vs.map((v, i) => (i + 1) + '. ' + v.name).join('\n'));
  },

  elegir: (n) => {
    const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    const v = vs[n - 1];
    if (!v) { 
      AresCerebro.mostrar('ARES', 'Ese numero no existe, señor.'); 
      return; 
    }
    localStorage.setItem('ares_voz', v.name);
    AresCerebro.mostrar('ARES', 'Perfecto, señor. Desde ahora hablare con la voz ' + v.name);
  },

  init: () => {
    if (AresVoz.soportada) { 
      window.speechSynthesis.getVoices(); 
    }
  }
};
document.addEventListener('DOMContentLoaded', AresVoz.init);