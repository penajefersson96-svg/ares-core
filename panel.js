// panel.js v2 — Orbe como reactor detras del panel de cristal
const AresPanel = {
  init: () => {
    const st = document.createElement('style');
    st.textContent = [
      'body{background:#04060c repeating-linear-gradient(0deg,transparent 0 34px,rgba(0,255,255,.05) 34px 35px),repeating-linear-gradient(90deg,transparent 0 34px,rgba(0,255,255,.04) 34px 35px);}',
      'header canvas{position:fixed;top:4%;left:50%;transform:translateX(-50%);width:230px;height:230px;z-index:0;pointer-events:none;opacity:.9;}',
      'header{position:relative;z-index:1;background:rgba(4,10,18,.55);backdrop-filter:blur(3px);border:1px solid rgba(0,255,255,.35);border-radius:10px;margin:8px;padding:8px;}',
      'header h1{color:#ffb347;text-shadow:0 0 12px rgba(255,179,71,.6);letter-spacing:6px;font-size:20px;margin:2px 0;}',
      '.p-banner{background:#0ff;color:#00131a;font-weight:bold;padding:3px 10px;display:inline-block;transform:skewX(-12deg);margin-bottom:4px;font-size:13px;}',
      '.p-status{border:1px solid rgba(0,255,255,.4);color:#9ff;font-size:10px;padding:2px 8px;float:right;}',
      'main{position:relative;z-index:1;background:rgba(4,10,18,.35);border-radius:8px;}',
      '.m-ares{border:1px solid rgba(0,255,255,.45);background:rgba(0,20,30,.6);padding:8px 10px;margin:8px 4px;border-radius:4px;box-shadow:0 0 8px rgba(0,255,255,.15);}',
      '.m-tu{border:1px solid rgba(255,179,71,.55);background:rgba(40,25,0,.5);color:#ffd9a0;padding:8px 10px;margin:8px 4px 8px auto;border-radius:4px;max-width:85%;}',
      '.p-hora{opacity:.5;font-size:10px;display:block;}',
      '#entrada{background:rgba(0,0,0,.7);border:1px solid #0ff;color:#9ff;padding:10px;}',
      '#enviar{background:#0ff;color:#00131a;font-weight:bold;border:none;padding:10px 16px;}'
    ].join('');
    document.head.appendChild(st);
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
        original(q, m);
        const chat = document.getElementById('chat') || document.querySelector('main');
        const last = chat ? chat.lastElementChild : null;
        if (last && last.classList) {
          last.classList.add(q === 'TÚ' ? 'm-tu' : 'm-ares');
          const t = document.createElement('span');
          t.className = 'p-hora';
          t.textContent = new Date().toLocaleTimeString();
          last.prepend(t);
        }
      };
    }
    AresDiag.log('PANEL NAVE V2: reactor detras del cristal.');
  }
};
document.addEventListener('DOMContentLoaded', AresPanel.init);