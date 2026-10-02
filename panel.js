// panel.js v10 — UI desacoplada con MutationObserver
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
      'header{position:relative;z-index:1;background:rgba(2,6,14,.55);backdrop-filter:blur(4px);border:1px solid rgba(0,255,255,.30);border-radius:12px;margin:8px;padding:8px;}',
      'header h1{color:#ffb347;text-shadow:0 0 14px rgba(255,179,71,.55);letter-spacing:6px;font-size:20px;margin:2px 0;}',
      '.p-banner{background:linear-gradient(90deg,#0ff,#7ff);color:#00131a;font-weight:bold;padding:3px 10px;display:inline-block;transform:skewX(-12deg);margin-bottom:4px;font-size:13px;}',
      '.p-status{border:1px solid rgba(0,255,255,.35);color:#9ff;font-size:10px;padding:2px 8px;float:right;}',
      'main{position:relative;z-index:1;background:rgba(2,6,14,.35);border-radius:10px;}',
      '.m-ares{border:1px solid rgba(0,255,255,.35);background:rgba(6,16,34,.62);padding:8px 10px;margin:8px 4px;border-radius:8px;box-shadow:0 0 10px rgba(0,255,255,.10);}',
      '.m-tu{border:1px solid rgba(255,179,71,.45);background:rgba(30,18,2,.55);color:#ffd9a0;padding:8px 10px;margin:8px 4px 8px auto;border-radius:8px;max-width:85%;text-align:right;}',
      '.p-hora{opacity:.5;font-size:10px;display:block;margin-bottom:2px;}',
      '.p-consola{position:sticky;bottom:6px;z-index:2;display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;justify-content:flex-end;background:rgba(2,6,14,.72);border:1px solid rgba(0,255,255,.35);border-radius:10px;margin:6px 8px;padding:6px;backdrop-filter:blur(4px);}',
      '.p-consola #entrada{flex:1 1 100%;min-height:38px;max-height:96px;overflow-y:auto;background:rgba(0,0,0,.6);border:1px solid rgba(0,255,255,.4);color:#9ff;padding:9px;border-radius:6px;font:inherit;resize:none;outline:none;}',
      '.p-consola #entrada:focus{border-color:#0ff;box-shadow:0 0 8px rgba(0,255,255,.25);}',
      '#enviar{background:#0ff;color:#00131a;font-weight:bold;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;}'
    ].join('');
    document.head.appendChild(st);
    
    // Abismo Estelar
    if (!document.getElementById('p-abismo')) {
      const ab = document.createElement('div');
      ab.id = 'p-abismo';
      ab.innerHTML = '<div class="p-neb"></div><div class="p-stars"></div><div class="p-stars2"></div>';
      document.body.prepend(ab);
    }
    
    // Banner
    const h = document.querySelector('header');
    if (h && !h.querySelector('.p-banner')) {
      h.prepend(Object.assign(document.createElement('div'), { className: 'p-status', textContent: 'ARES ACTIVO' }));
      h.prepend(Object.assign(document.createElement('div'), { className: 'p-banner', textContent: 'ARES // VENTAJA COGNITIVA' }));
    }
    
    // OBSERVADOR DE DOM (La magia limpia)
    const chat = document.getElementById('chat');
    if (chat) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.tagName === 'P') {
              const strong = node.querySelector('strong');
              if (strong) {
                const quien = strong.textContent.replace(':', '').trim();
                node.classList.add(quien === 'TÚ' ? 'm-tu' : 'm-ares');
                const hora = document.createElement('span');
                hora.className = 'p-hora';
                hora.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                node.prepend(hora);
              }
            }
          });
        });
      });
      observer.observe(chat, { childList: true, subtree: false });
    }
    
    // Textarea expansible
    const ta = document.getElementById('entrada');
    if (ta) {
      ta.parentNode.className = 'p-consola';
      ta.addEventListener('input', () => {
        ta.style.height = 'auto';
        ta.style.height = Math.min(96, ta.scrollHeight) + 'px';
      });
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AresPanel.init());
} else {
  AresPanel.init();
}