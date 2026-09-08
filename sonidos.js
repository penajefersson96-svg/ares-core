// sonidos.js — Risas, llantos, fiesta + mayordomo de cache
const AresSonidos = {
  ctx: () => {
    AresSonidos.c = AresSonidos.c || new (window.AudioContext || window.webkitAudioContext)();
    if (AresSonidos.c.state === 'suspended') AresSonidos.c.resume();
    return AresSonidos.c;
  },
  nota: (f, t0, dur, type) => {
    const c = AresSonidos.ctx();
    const o = c.createOscillator(); const g = c.createGain();
    o.type = type || 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.09, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.02);
  },
  risa: () => { [0, 0.14, 0.28, 0.42].forEach((t, i) => AresSonidos.nota(520 - i * 70, t, 0.12, 'square')); },
  llanto: () => { AresSonidos.nota(420, 0, 0.5, 'sine'); AresSonidos.nota(330, 0.45, 0.7, 'sine'); },
  fiesta: () => { [0, 0.1, 0.2].forEach(t => AresSonidos.nota(200, t, 0.08, 'square')); AresSonidos.nota(700, 0.3, 0.2); },
  init: () => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    if (typeof AresVoz === 'undefined') return;
    AresVoz.audio = AresSonidos.ctx();
    const mapa = { '1f602': 'risa', '1f923': 'risa', '1f605': 'risa', '1f622': 'llanto', '1f62d': 'llanto', '1f389': 'fiesta', '1f941': 'fiesta', '2764': 'fiesta' };
    const origEmoji = AresVoz.sonidoEmoji;
    AresVoz.sonidoEmoji = (hex) => { if (mapa[hex]) AresSonidos[mapa[hex]](); else origEmoji(hex); };
    const origHablar = AresVoz.hablar;
    AresVoz.hablar = (t) => {
      const emo = AresVoz.emocionDe(t);
      if (emo === 'alegria') { setTimeout(AresSonidos.risa, 120); origHablar(t.replace(/^(jaja[ja]*[,! ]?\s*)+/i, '') || t); }
      else if (emo === 'tristeza') { setTimeout(AresSonidos.llanto, 250); origHablar(t); }
      else origHablar(t);
    };
  }
};
document.addEventListener('DOMContentLoaded', AresSonidos.init);