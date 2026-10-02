// orbe.js v3.0 — Núcleo de plasma vivo con física de resortes y ruido orgánico
const AresOrbe = {
  canvas: null,
  ctx: null,
  energia: 0.1, // Energía actual (0 a 1)
  objetivo: 0.1, // Energía a la que tiende
  t: 0,
  DPR: window.devicePixelRatio || 1,
  SIZE: 220, // Tamaño lógico en pantalla
  
  init: () => {
    // Crear o reutilizar canvas
    AresOrbe.canvas = document.getElementById('ares-orbe-canvas') || document.createElement('canvas');
    AresOrbe.canvas.id = 'ares-orbe-canvas';
    // El CSS lo posiciona fijo en el centro, detrás del chat
    AresOrbe.canvas.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:' + AresOrbe.SIZE + 'px;height:' + AresOrbe.SIZE + 'px;z-index:0;pointer-events:none;filter:drop-shadow(0 0 20px rgba(0,150,255,0.4));';
    if (!document.getElementById('ares-orbe-canvas')) document.body.prepend(AresOrbe.canvas);
    
    // Ajustar resolución real para pantallas de alta densidad
    AresOrbe.canvas.width = AresOrbe.SIZE * AresOrbe.DPR;
    AresOrbe.canvas.height = AresOrbe.SIZE * AresOrbe.DPR;
    AresOrbe.ctx = AresOrbe.canvas.getContext('2d');
    AresOrbe.ctx.scale(AresOrbe.DPR, AresOrbe.DPR);
    
    AresOrbe.animar();
  },
  
  // Método público para que la voz le avise cuando está hablando
  setHablando: (bool) => {
    AresOrbe.objetivo = bool ? 0.85 : 0.15;
  },
  
  animar: () => {
    const ctx = AresOrbe.ctx;
    const W = AresOrbe.SIZE;
    const cx = W / 2;
    const cy = W / 2;
    
    AresOrbe.t += 0.015;
    
    // Física de resorte suave (interpolación)
    AresOrbe.energia += (AresOrbe.objetivo - AresOrbe.energia) * 0.08;
    
    // Fallback de seguridad si la voz local está hablando
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      AresOrbe.objetivo = Math.max(AresOrbe.objetivo, 0.7);
    }
    
    ctx.clearRect(0, 0, W, W);
    
    const R = 55 + AresOrbe.energia * 12;
    const puntos = 90; // Resolución del polígono
    
    // 1. HALO EXTERIOR (Glow ambiental)
    const glowR = R + 35 + AresOrbe.energia * 20;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, glowR);
    glow.addColorStop(0, `rgba(60, 180, 255, ${0.15 + AresOrbe.energia * 0.3})`);
    glow.addColorStop(0.6, `rgba(20, 80, 200, ${0.05 + AresOrbe.energia * 0.1})`);
    glow.addColorStop(1, 'rgba(0, 10, 30, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. NÚCLEO DE PLASMA (Contorno deforme por ruido)
    ctx.beginPath();
    for (let i = 0; i <= puntos; i++) {
      const ang = (i / puntos) * Math.PI * 2;
      
      // Ruido orgánico: suma de ondas con frecuencias no enteras (caóticas)
      const ruido = 
        Math.sin(ang * 3.1 + AresOrbe.t * 1.2) * 0.45 +
        Math.sin(ang * 5.7 - AresOrbe.t * 0.8) * 0.35 +
        Math.sin(ang * 8.3 + AresOrbe.t * 1.5) * 0.25 +
        Math.sin(ang * 13.1 - AresOrbe.t * 2.2) * 0.15;
      
      const deformacion = ruido * (3 + AresOrbe.energia * 14);
      const rActual = R + deformacion;
      
      const px = cx + Math.cos(ang) * rActual;
      const py = cy + Math.sin(ang) * rActual;
      
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    // Relleno del núcleo (Gradiente radial con punto de luz superior)
    const coreGrad = ctx.createRadialGradient(cx - 15, cy - 15, 5, cx, cy, R + 10);
    coreGrad.addColorStop(0, `rgba(230, 250, 255, ${0.9 + AresOrbe.energia * 0.1})`);
    coreGrad.addColorStop(0.3, `rgba(90, 200, 255, ${0.75 + AresOrbe.energia * 0.25})`);
    coreGrad.addColorStop(0.7, `rgba(20, 90, 220, 0.85)`);
    coreGrad.addColorStop(1, `rgba(5, 20, 80, 0.9)`);
    ctx.fillStyle = coreGrad;
    ctx.fill();
    
    // Borde brillante (Tensión superficial del plasma)
    ctx.strokeStyle = `rgba(180, 240, 255, ${0.5 + AresOrbe.energia * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 3. FILAMENTOS INTERNOS (Energía rotando dentro)
    ctx.save();
    ctx.clip(); // Recorta todo lo siguiente a la forma deforme del plasma
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + AresOrbe.energia * 0.35})`;
    ctx.lineWidth = 1.2;
    
    for (let f = 0; f < 4; f++) {
      ctx.beginPath();
      for (let i = 0; i <= puntos; i++) {
        const ang = (i / puntos) * Math.PI * 2;
        const ruidoInt = Math.sin(ang * (4.5 + f * 1.2) + AresOrbe.t * (1.2 + f * 0.4)) * 0.6;
        const rInt = R * (0.3 + f * 0.12) + ruidoInt * 12;
        const dir = f % 2 === 0 ? 1 : -1;
        const px = cx + Math.cos(ang + AresOrbe.t * 0.3 * dir) * rInt;
        const py = cy + Math.sin(ang + AresOrbe.t * 0.3 * dir) * rInt;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
    
    requestAnimationFrame(AresOrbe.animar);
  }
};

document.addEventListener('DOMContentLoaded', AresOrbe.init);