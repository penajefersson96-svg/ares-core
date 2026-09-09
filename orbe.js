// orbe.js v2 — Esfera de plasma: gira sola, late cuando habla
const AresOrbe = {
  energia: 0,
  emo: 'neutro',
  init: () => {
    const c = document.createElement('canvas');
    c.width = 160; c.height = 160;
    c.style.cssText = 'display:block;margin:6px auto;';
    document.querySelector('header').prepend(c);
    const x = c.getContext('2d');
    let t = 0;
    const fil = [0.9, 1.3, 1.7, 2.3, 2.9];
    const dibujar = () => {
      t += 0.012 + AresOrbe.energia * 0.02;
      AresOrbe.energia *= 0.95;
      if (window.speechSynthesis && window.speechSynthesis.speaking) AresOrbe.energia = Math.max(AresOrbe.energia, 0.55 + Math.abs(Math.sin(t * 7)) * 0.45);
      x.clearRect(0, 0, 160, 160);
      const R = 46 + AresOrbe.energia * 8;
      const col = AresOrbe.emo === 'alegria' ? '120,220,255' : AresOrbe.emo === 'tristeza' ? '70,110,255' : '40,120,255';
      const g = x.createRadialGradient(80, 80, 6, 80, 80, R + 26);
      g.addColorStop(0, 'rgba(190,240,255,' + (0.75 + AresOrbe.energia * 0.25) + ')');
      g.addColorStop(0.45, 'rgba(' + col + ',0.45)');
      g.addColorStop(1, 'rgba(0,0,20,0)');
      x.fillStyle = g;
      x.beginPath(); x.arc(80, 80, R + 26, 0, 7); x.fill();
      x.save();
      x.beginPath(); x.arc(80, 80, R, 0, 7); x.clip();
      x.strokeStyle = 'rgba(160,230,255,' + (0.25 + AresOrbe.energia * 0.4) + ')';
      x.lineWidth = 1.2;
      for (let i = 0; i < fil.length; i++) {
        x.beginPath();
        for (let a = 0; a <= 6.3; a += 0.22) {
          const rr = R * (0.35 + 0.6 * Math.abs(Math.sin(a * fil[i] + t * (1 + i * 0.35) + i * 2)));
          const px = 80 + Math.cos(a + t * 0.5) * rr;
          const py = 80 + Math.sin(a + t * 0.5) * rr * 0.9;
          if (a === 0) x.moveTo(px, py); else x.lineTo(px, py);
        }
        x.stroke();
      }
      x.restore();
      x.strokeStyle = 'rgba(120,200,255,' + (0.5 + AresOrbe.energia * 0.5) + ')';
      x.lineWidth = 1.5;
      x.beginPath(); x.arc(80, 80, R, 0, 7); x.stroke();
      requestAnimationFrame(dibujar);
    };
    dibujar();
    if (window.AresVoz) {
      const h = AresVoz.hablar;
      AresVoz.hablar = (txt) => { AresOrbe.energia = 1; h(txt); };
    }
  }
};
document.addEventListener('DOMContentLoaded', AresOrbe.init);