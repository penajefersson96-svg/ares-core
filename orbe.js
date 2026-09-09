// orbe.js — Corazón visual de Ares
const AresOrbe = {
  energia: 0,
  init: () => {
    const c = document.createElement('canvas');
    c.width = 140; c.height = 140;
    c.style.cssText = 'display:block;margin:6px auto;';
    document.querySelector('header').prepend(c);
    const x = c.getContext('2d');
    let t = 0;
    const dibujar = () => {
      t += 0.02;
      AresOrbe.energia *= 0.96;
      if (window.speechSynthesis.speaking) AresOrbe.energia = 0.6 + Math.abs(Math.sin(t * 6)) * 0.4;
      x.clearRect(0, 0, 140, 140);
      const r = 26 + AresOrbe.energia * 10 + Math.sin(t * 2) * 2;
      const g = x.createRadialGradient(70, 70, 4, 70, 70, r + 26);
      g.addColorStop(0, 'rgba(0,255,255,' + (0.7 + AresOrbe.energia * 0.3) + ')');
      g.addColorStop(0.4, 'rgba(0,180,255,0.35)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g;
      x.beginPath(); x.arc(70, 70, r + 26, 0, 7); x.fill();
      x.fillStyle = '#bffcff';
      x.beginPath(); x.arc(70, 70, r * 0.45, 0, 7); x.fill();
      x.strokeStyle = 'rgba(0,255,255,0.8)';
      x.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        x.beginPath();
        x.ellipse(70, 70, r + 8 + i * 7, (r + 8 + i * 7) * 0.35, t * (i % 2 ? -1 : 1) + i, 0, 7);
        x.stroke();
      }
      requestAnimationFrame(dibujar);
    };
    dibujar();
    const h = AresVoz.hablar;
    AresVoz.hablar = (txt) => { AresOrbe.energia = 1; h(txt); };
    
  }
};
document.addEventListener('DOMContentLoaded', AresOrbe.init);