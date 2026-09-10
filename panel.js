// panel.js v8 — consola unificada expansiva
const AresPanel = {
  init: () => {
    const st = document.createElement('style');
    st.textContent = [
      '@keyframes p-titilar{0%,100%{opacity:.9}50%{opacity:.35}}',
      '@keyframes p-nebulosa{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.12)}}',
      'body{background:#020205;}',
      '#p-abismo{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}',
      '#p-abismo .p-neb{position:absolute;top:50%;left:50%;width:340px;height:340px;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(40,60,140,.20),rgba(80,40,120,.10) 45%,transparent 70%);animation:p-nebulosa 14s ease-in-out infinite;}',
      '#p-abismo .p-stars{position:absolute;top:0;left:0;width:2px;height:2px;border-radius:50%;background:#fff;animation:p-titilar 5s ease-in-out infinite;}',
      '#p-abismo .p-stars2{position:absolute;top:0;left:0;width:1px;height:1px;border-radius:50%;background:#9ff;animation:p-titilar 7s ease-in-out infinite;}',
      'canvas{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:240px;height:240px;z-index:0;pointer-events:none;opacity:.9;filter:drop-shadow(0 0 22px rgba(0,255,255,.35));}',
      'header{position:relative;z-index:1;background:rgba(2,6,14,.55);backdrop-filter:blur(4px);border:1px solid rgba(0,255,255,.30);border-radius:12px;margin:8px;padding:8px;box-shadow:0 0 18px rgba(0,255,255,.08);}',
      'header h1{color:#ffb347;text-shadow:0 0 14px rgba(255,179,71,.55);letter-spacing:6px;font-size:20px;margin:2px 0;}',
      '.p-banner{background:linear-gradient(90deg,#0ff,#7ff);color:#00131a;font-weight:bold;padding:3px 10px;display:inline-block;transform:skewX(-12deg);margin-bottom:4px;font-size:13px;}',
      '.p-status{border:1px solid rgba(0,255,255,.35);color:#9ff;font-size:10px;padding:2px 8px;float:right;}',
      'main{position:relative;z-index:1;background:rgba(2,6,14,.35);border-radius:10px;}',
      '.m-ares{border:1px solid rgba(0,255,255,.35);background:rgba(6,16,34,.62);padding:8px 10px;margin:8px 4px;border-radius:8px;box-shadow:0 0 10px rgba(0,255,255,.10);}',
      '.m-tu{border:1px solid rgba(255,179,71,.45);background:rgba(30,18,2,.55);color:#ffd9a0;padding:8px 10px;margin:8px 4px 8px auto;border-radius:8px;max-width:85%;}',
      '.p-hora{opacity:.5;font-size:10px;display:block;}',
      '.p-consola{position:relative;z-index:1;display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;background:rgba(2,6,14,.72);border:1px solid rgba(0,255,255,.35);border-radius:10px;margin:6px 8px;padding:6px;backdrop-filter:blur(4px);}',
      '.p-consola #entrada{flex:1 1 140px;min-height:38px;max-height:120px;overflow-y:auto;background:rgba(0,0,0,.6);border:1px solid rgba(0,255,255,.4);color:#9ff;padding:9px;border-radius:6px;font:inherit;resize:none;}',
      '.p-consola button{flex:0 0 auto;}',
      '#enviar{background:#0ff;color:#00131a;font-weight:bold;border:none;padding:10px 16px;border-radius:6px;}'
    ].join('');
    document.head.appendChild(st);
    if (!document.getElementById('p-abismo')) {
      const ab = document.createElement('div');
      ab.id = 'p-abismo';
      const neb = document.createElement('div');
      neb.className = 'p-neb';
      ab.appendChild(neb);
      const s1 = document.createElement('div');
      s1.className = 'p-stars';
      const s2 = document.createElement('div');
      s2.className = 'p-stars2';
      const sombras1 = Array.from({length: 40}, () => Math.floor(Math.random() * 100) + 'vw ' + Math.floor(Math.random() * 100) + 'vh 0 rgba(255,255,255,' + (0.4 + Math.random() * 0.6).toFixed(2) + ')');
      const sombras2 = Array.from({length: 60}, () => Math.floor(Math.random() * 100) + 'vw ' + Math.floor(Math.random() * 100) + 'vh 0 rgba(150,255,255,' + (0.3 + Math.random() * 0.5).toFixed(2) + ')');
      s1.style.boxShadow = sombras1.join(',');
      s2.style.boxShadow = sombras2.join(',');
      ab.appendChild(s1);
      ab.appendChild(s2);
      document.body.prepend(ab);
    }
    const h = document.querySelector('header');
    if (h && !h.querySelector('.p-banner')) {
      const s = document.createElement('div');
      s.className = 'p-status';
      s.textContent = 'ARES ACTIVO / CIFRADO HABILITADO';
      h.prepend(s);
      const b = document.createElement('div');
      b.className = 'p-banner';
      b.textContent = 'ARES // VENTAJA COGNITIVA';
      h.prepend(b);
    }
    if (typeof AresCerebro !== 'undefined') {
      const original = AresCerebro.mostrar;
      AresCerebro.mostrar = (q, m) => {
        try {
          original(q, m);
          const chat = document.getElementById('chat') || document.querySelector('main');
          if (!chat || !chat.lastElementChild) return;
          const last = chat.lastElementChild;
          if (last.classList) {
            last.classList.add(q === 'TÚ' ? 'm-tu' : 'm-ares');
            const t = document.createElement('span');
            t.className = 'p-hora';
            t.textContent = new Date().toLocaleTimeString();
            last.prepend(t);
          }
        } catch (e) {
          if (typeof AresDiag !== 'undefined') AresDiag.log('AresPanel error: ' + e.message);
        }
      };
    }
    const viejo = document.getElementById('entrada');
    if (viejo && viejo.tagName !== 'TEXTAREA') {
      const ta = document.createElement('textarea');
      ta.id = 'entrada';
      ta.placeholder = viejo.placeholder || 'Habla con Ares...';
      ta.rows = 1;
      viejo.parentNode.replaceChild(ta, viejo);
    }
    const ta3 = document.getElementById('entrada');
    if (ta3) {
      const fila = ta3.parentNode;
      if (fila) fila.className = 'p-consola';
      ta3.addEventListener('input', () => { ta3.style.height = 'auto'; ta3.style.height = Math.min(120, ta3.scrollHeight) + 'px'; });
      if (typeof AresCerebro !== 'undefined') {
        ta3.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); AresCerebro.enviar(); } };
      }
    }
    const avisar = () => { if (typeof AresDiag !== 'undefined') AresDiag.log('PANEL NAVE V8: consola unificada y expansiva.'); else setTimeout(avisar, 300); };
    avisar();
  }
};
document.addEventListener('DOMContentLoaded', AresPanel.init);
// FIN PANEL V8