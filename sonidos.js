// sonidos.js v4.0 — Efectos de sonido desacoplados
const AresSonidos = {
  audioCtx: null,
  
  // Inicializar AudioContext (requiere interacción del usuario)
  initContext: () => {
    if (!AresSonidos.audioCtx) {
      AresSonidos.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (AresSonidos.audioCtx.state === 'suspended') {
      AresSonidos.audioCtx.resume();
    }
    return AresSonidos.audioCtx;
  },
  
  // Tocar una nota individual
  nota: (freq, startTime, duration, type = 'triangle') => {
    const ctx = AresSonidos.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration + 0.02);
  },
  
  // Efectos predefinidos
  risa: () => {
    [0, 0.14, 0.28, 0.42].forEach((t, i) => {
      AresSonidos.nota(520 - i * 70, t, 0.12, 'square');
    });
  },
  
  llanto: () => {
    AresSonidos.nota(420, 0, 0.5, 'sine');
    AresSonidos.nota(330, 0.45, 0.7, 'sine');
  },
  
  fiesta: () => {
    [0, 0.1, 0.2].forEach(t => AresSonidos.nota(200, t, 0.08, 'square'));
    AresSonidos.nota(700, 0.3, 0.2, 'square');
  },
  
  desbloqueo: () => {
    AresSonidos.nota(600, 0, 0.1, 'sine');
    AresSonidos.nota(800, 0.1, 0.1, 'sine');
  },
  
  confirmacion: () => {
    AresSonidos.nota(500, 0, 0.08, 'triangle');
    AresSonidos.nota(700, 0.08, 0.08, 'triangle');
  },
  
  error: () => {
    AresSonidos.nota(300, 0, 0.15, 'sawtooth');
    AresSonidos.nota(200, 0.15, 0.15, 'sawtooth');
  },
  
  // Mapeo de emojis a sonidos
  emojiASonido: (hex) => {
    const mapa = {
      '1f602': 'risa', '1f923': 'risa', '1f605': 'risa',
      '1f622': 'llanto', '1f62d': 'llanto',
      '1f389': 'fiesta', '1f941': 'fiesta', '2764': 'fiesta',
      '1f512': 'desbloqueo', '1f513': 'desbloqueo',
      '2705': 'confirmacion', '1f44d': 'confirmacion',
      '274c': 'error', '26a0': 'error'
    };
    
    const sonido = mapa[hex];
    if (sonido && typeof AresSonidos[sonido] === 'function') {
      AresSonidos[sonido]();
    }
  },
  
  init: () => {
    // Desbloquear AudioContext con la primera interacción del usuario
    const desbloquear = () => {
      AresSonidos.initContext();
      document.removeEventListener('click', desbloquear);
      document.removeEventListener('touchstart', desbloquear);
      document.removeEventListener('keydown', desbloquear);
    };
    
    document.addEventListener('click', desbloquear);
    document.addEventListener('touchstart', desbloquear);
    document.addEventListener('keydown', desbloquear);
    
    console.log('[Sonidos] Módulo de audio cargado');
  }
};

document.addEventListener('DOMContentLoaded', AresSonidos.init);