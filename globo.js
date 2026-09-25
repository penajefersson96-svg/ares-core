// globo.js v1 — esfera de particulas, reloj HUD y minutero estilo Jarvis
const AresGlobo = {
  cv: null, ctx: null, pts: [], ang: 0, fin: 0,
  init: () => {
    const cv = document.createElement('canvas');
    cv.id = 'g-lienzo';
    cv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:260px;height:260px;z-index:0;pointer-events:none;';
    cv.width = 260; cv.height = 260;
    document.body.appendChild(cv);
    AresGlobo.cv = cv; AresGlobo.ctx = cv.getContext('2d');
    for (let i = 0; i < 220; i++) {
      const t = Math.random() * Math.PI * 2;
      const f = Math.acos(2 * Math.random() - 1);
      AresGlobo.pts.push([Math.sin(f) * Math.cos(t), Math.cos(f), Math.sin(f) * Math.sin(t)]);
    }
    const hud = document.createElement('div');
    hud.id = 'g-hud';
    hud.style.cssText = 'position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:3;font-size:11px;color:#9ff;border:1px solid rgba(0,255,255,.4);background:rgba(2,6,14,.6);padding:2px 10px;border-radius:4px;letter-spacing:2px;';
    document.body.appendChild(hud);
    setInterval(() => {
      const a = new Date();
      hud.textContent = a.toLocaleTimeString('es-ES') + ' // ' + a.toLocaleDateString('es-ES');
    }, 1000);
    setInterval(AresGlobo.dibujar, 66);
  },
  minutero: (mins) => {
    AresGlobo.fin = Date.now() + mins * 60000;
    if (window.AresCerebro) AresCerebro.mostrar('ARES', 'Minutero de ' + mins + ' minuto(s) girando sobre mi esfera, señor.');
  },
  dibujar: () => {
    const c = AresGlobo.ctx;
    if (!c) return;
    c.clearRect(0, 0, 260, 260);
    AresGlobo.ang += 0.004;
    const R = 110, cx = 130, cy = 130;
    const cos = Math.cos(AresGlobo.ang), sin = Math.sin(AresGlobo.ang);
    c.fillStyle = 'rgba(120,220,255,.85)';
    AresGlobo.pts.forEach(p => {
      const x = p[0] * cos - p[2] * sin;
      const z = p[0] * sin + p[2] * cos;
      const esc = 1 / (1.6 - z * 0.6);
      c.globalAlpha = 0.2 + (z + 1) * 0.32;
      c.fillRect(cx + x * R * esc, cy + p[1] * R * esc, 1.6, 1.6);
    });
    c.globalAlpha = 1;
    if (AresGlobo.fin > 0) {
      const s = Math.max(0, Math.ceil((AresGlobo.fin - Date.now()) / 1000));
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      c.font = 'bold 44px monospace';
      c.textAlign = 'center';
      c.fillStyle = s <= 10 ? '#ffd24a' : '#7ff';
      c.shadowColor = c.fillStyle; c.shadowBlur = 18;
      c.fillText(mm + ':' + ss, cx, cy + 14);
      c.shadowBlur = 0;
      if (s === 0) {
        AresGlobo.fin = 0;
        try { AresVoz.sonidoEmoji('1f389'); } catch (e) {}
        if (window.AresVoz) AresVoz.hablar('Tiempo cumplido, señor.');
        if (window.AresCerebro) AresCerebro.mostrar('ARES', 'Tiempo cumplido, señor. Su minutero ha terminado.');
      }
    }
  }
};
window.AresGlobo = AresGlobo;
document.addEventListener('DOMContentLoaded', AresGlobo.init);
// FIN GLOBO V1