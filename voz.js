// voz.js v9 — parche 2.5: sonidos reales, sin acotaciones habladas
const AresVoz = {
  activada: true,
  saltar: false,
  ultimo: '',
  soportada: ('speechSynthesis' in window),
  audio: null,

  vozGuardada: () => {
    const nombre = localStorage.getItem('ares_voz');
    if (!nombre) return null;
    return window.speechSynthesis.getVoices().find(v => v.name === nombre) || null;
  },

  emocionDe: (t) => {
    if (/\b(jaja|chiste|broma)\b/.test(t) || /que risa/.test(t)) return 'alegria';
    if (/\b(triste|llor|lamento|pena|duelo|perdio|muerte|extrana|corazon|abrazo)\b/.test(t) || /lo siento|perdon/.test(t)) return 'tristeza';
    if (/\b(increible|genial|emocion|victoria|logramos)\b/.test(t)) return 'emocion';
    return 'neutro';
  },

  emojiNombre: { '1faa8': 'piedra', '1f48e': 'diamante', '1f31f': 'estrella', '1f30d': 'mundo', '1f4a1': 'idea', '1f525': 'fuego', '1f680': 'cohete', '1f9e0': 'cerebro', '1f4bb': 'computadora', '1f4f1': 'telefono', '1f3e0': 'casa', '1f512': 'candado', '1f511': 'llave', '2699': 'engranaje' },

  frag: (t) => {
    if (!AresVoz.activada || !AresVoz.soportada) return;
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'es-ES';
    const emo = AresVoz.emocionDe(t);
    u.pitch = emo === 'alegria' ? 1.25 : emo === 'tristeza' ? 0.75 : 1;
    u.rate = emo === 'alegria' ? 1.08 : emo === 'tristeza' ? 0.85 : 1;
    window.speechSynthesis.speak(u);
  },

  sonidoEmoji: (hex) => {
    try {
      if (!AresVoz.audio || AresVoz.audio.state === 'closed') {
        AresVoz.audio = new (window.AudioContext || window.webkitAudioContext)();
      }
      const c = AresVoz.audio;
      if (c.state === 'suspended') c.resume();
      const mapa = {
        '1f602': [600, 500, 400],
        '1f923': [650, 520, 420],
        '1f941': [200, 150],
        '1f605': [500, 450],
        '2764': [700, 900],
        '1f389': [500, 700, 900],
        '26a1': [900, 600],
        '1f622': [400, 300],
        '1f62d': [380, 300, 240],
        '1f916': [300, 300, 300]
      };
      const notas = mapa[hex] || [520];
      notas.forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.frequency.value = f;
        o.type = 'triangle';
        g.gain.setValueAtTime(0.08, c.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.11);
        o.connect(g); g.connect(c.destination);
        o.start(c.currentTime + i * 0.12);
        o.stop(c.currentTime + i * 0.12 + 0.12);
      });
    } catch (e) {}
  },

  hablar: (texto) => {
    if (!AresVoz.activada || !AresVoz.soportada) return;
    const s = window.speechSynthesis;
    if (s.getVoices().length === 0) {
      s.addEventListener('voiceschanged', () => AresVoz.hablar(texto), { once: true });
      return;
    }
    const emojis = texto.match(/[\u{1F300}-\u{1FAFF}]/gu) || [];
    const vistos = [];
    emojis.forEach(em => {
      if (!vistos.includes(em)) {
        vistos.push(em);
        const hex = em.codePointAt(0).toString(16);
        setTimeout(() => AresVoz.sonidoEmoji(hex), 200 + vistos.length * 350);
      }
    });
    texto = texto.replace(/jefersson/gi, 'Yefersson');
    texto = texto.replace(/\*[^*]+\*/g, ' ');
    texto = texto.replace(/[*_#`]/g, '');
    texto = texto.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, (em) => { const n = AresVoz.emojiNombre[em.codePointAt(0).toString(16)]; return n ? ' ' + n + ' ' : ''; });
    texto = texto.replace(/\u2026|\.{2,}/g, ', ');
    AresVoz.ultimo = texto.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/gi, '');
    s.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    const v = AresVoz.vozGuardada() || s.getVoices().find(x => x.name === 'español Estados Unidos') || s.getVoices().find(x => x.lang.startsWith('es'));
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'es-ES'; }
    const emo = AresVoz.emocionDe(texto);
    if (emo === 'alegria') { u.pitch = 1.15; u.rate = 1.05; }
    else if (emo === 'tristeza') { u.pitch = 0.75; u.rate = 0.85; }
    else if (emo === 'emocion') { u.pitch = 1.05; u.rate = 1.1; }
    else { u.pitch = 0.9; u.rate = 1; }
    if (emo === 'alegria') setTimeout(() => AresVoz.sonidoEmoji('1f602'), 150);
    if (emo === 'tristeza') setTimeout(() => AresVoz.sonidoEmoji('1f622'), 200);
    if (emo === 'emocion') setTimeout(() => AresVoz.sonidoEmoji('1f389'), 150);
    s.speak(u);
  },

  listar: () => {
    const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    if (!vs.length) { AresVoz.hablar('Aun no cargo mis voces. Intenta de nuevo en unos segundos.'); return; }
    AresDiag.log('Voces: ' + vs.map((v, i) => (i + 1) + ': ' + v.name).join(' | '));
    AresVoz.hablar('Tengo estas voces: ' + vs.map((v, i) => (i + 1) + ': ' + v.name).join(', ') + '. Dime voz y el numero.');
  },

  elegir: (n) => {
    const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    const v = vs[n - 1];
    if (!v) { AresVoz.hablar('Ese numero no existe, socio.'); return; }
    localStorage.setItem('ares_voz', v.name);
    AresVoz.hablar('Perfecto. Desde ahora hablare con la voz ' + v.name);
  },

  init: () => {
    if (AresVoz.soportada) { const s = window.speechSynthesis; s.getVoices(); s.onvoiceschanged = () => s.getVoices(); }
    if (AresVoz.soportada) { const w = new SpeechSynthesisUtterance(' '); w.volume = 0; w.rate = 2; window.speechSynthesis.speak(w); }
    const original = AresCerebro.mostrar;
    AresCerebro.mostrar = (quien, msg) => {
      try {
        original(quien, msg);
        if (quien === 'TÚ') {
          const t = msg.toLowerCase().trim();
          if (t === 'voces') { AresVoz.saltar = true; AresVoz.listar(); }
          const m = t.match(/^voz (\d+)$/);
          if (m) { AresVoz.saltar = true; AresVoz.elegir(Number(m[1])); }
          if (t === 'silencio') { AresVoz.activada = false; window.speechSynthesis.cancel(); }
          if (t === 'habla') { AresVoz.activada = true; }
        }
        if (quien === 'ARES') {
          if (AresVoz.saltar) { AresVoz.saltar = false; } else { AresVoz.hablar(msg); }
        }
      } catch (e) {}
    };
  }
};
document.addEventListener('DOMContentLoaded', AresVoz.init);
// FIN VOZ V9