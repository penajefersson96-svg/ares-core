// cerebro.js v8 — Jarvis con supervisor de promesas y robustez optimizada
const AresCerebro = {
  HIST: 'ares_historial',
  img: null,
  MAPA_ARCH: { panel:'panel.js', voz:'voz.js', cerebro:'cerebro.js', worker:'worker.js', orbe:'orbe.js', memoria:'memoria.js', oidos:'oidos.js', sonidos:'sonidos.js', reporte:'reporte.js', mani:'mani.js', diagnostico:'diagnostico.js', sw:'sw.js', index:'index.html', manifest:'manifest.webmanifest' },
  leerHist: () => { try { return JSON.parse(localStorage.getItem(AresCerebro.HIST)) || []; } catch (e) { return []; } },
  recordar: (quien, t) => {
    const h = AresCerebro.leerHist();
    h.push({ q: quien, t: String(t).indexOf('data:image') >= 0 ? '[foto adjunta]' : String(t).slice(0, 600) });
    while (h.length > 24) h.shift();
    try { localStorage.setItem(AresCerebro.HIST, JSON.stringify(h)); } catch (e) {}
  },
  mostrar: (quien, msg) => {
    const chat = document.getElementById('chat');
    if (!chat) return;
    const p = document.createElement('p');
    p.innerHTML = '<strong>' + quien + ':</strong> ' + String(msg).replace(/\n/g, '<br>');
    p.style.color = quien === 'ARES' ? '#fff' : '#888';
    if (quien === 'ARES') {
      const bc = document.createElement('button');
      bc.textContent = 'copiar';
      bc.style.cssText = 'display:block;margin-top:4px;background:none;border:1px solid rgba(0,255,255,.3);color:#9ff;font-size:10px;padding:2px 8px;border-radius:4px;cursor:pointer;';
      bc.onclick = () => {
        const txt = String(msg);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(() => { bc.textContent = 'copiado'; }).catch(() => {});
        } else {
          const ta = document.createElement('textarea');
          ta.value = txt;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); bc.textContent = 'copiado'; } catch (e) {}
          document.body.removeChild(ta);
        }
      };
      p.appendChild(bc);
    }
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
    if (quien === 'TÚ' || quien === 'ARES') AresCerebro.recordar(quien, msg);
  },
  pensarLocal: (texto) => {
    texto = String(texto).toLowerCase();
    let respuesta = 'Modo entrenamiento: Mi mente real se activara al desplegar el proyecto en la nube.';
    if (texto.includes('hola')) respuesta = 'A la orden, señor. Sistemas operativos al 100%.';
    else if (texto.includes('estado')) respuesta = 'Memoria estable, señor. Diagnostico activo. Esperando nucleo neuronal.';
    else if (texto.includes('futuro')) respuesta = 'Visualizo una interfaz holografica y aprendizaje autonomo, señor.';
    AresCerebro.mostrar('ARES', respuesta);
  },
  supervisor: (texto) => {
    const mInt = String(texto).match(/\b(revisa|revisar|pulir|pulirias|pulirías|mejora|mejorar|arregla|chequea|mira)\b[\s\S]*?\b(panel|voz|cerebro|worker|orbe|memoria|oidos|sonidos|reporte|mani|diagnostico|sw|index|manifest)\b/i);
    if (mInt && AresCerebro.MAPA_ARCH[mInt[2].toLowerCase()]) {
      AresCerebro.enviar('leete ' + AresCerebro.MAPA_ARCH[mInt[2].toLowerCase()], true, true);
    }
  },
  enviar: async (forzado, silencioso, sinTags) => {
    const input = document.getElementById('entrada');
    const texto = (typeof forzado === 'string' ? forzado : (input ? input.value : '')).trim();
    if (!texto) return;
    const hist = AresCerebro.leerHist().slice(-10);
    let hechos = '';
    try { if (window.AresMemoria) hechos = JSON.stringify(AresMemoria.hechos || AresMemoria.datos || AresMemoria.memoria || {}); } catch (e) {}
    try { const bvH = JSON.parse(localStorage.getItem('ares_boveda') || 'null'); if (bvH && bvH.desc) hechos = (hechos && hechos !== '{}' ? hechos + ' ' : '') + 'Rostro de mi creador: ' + bvH.desc; } catch (e) {}
    try { const ap = JSON.parse(localStorage.getItem('ares_aprendizajes') || '[]'); if (ap.length) hechos = (hechos && hechos !== '{}' ? hechos + ' ' : '') + 'Aprendizajes permanentes del señor: ' + ap.join(' | '); } catch (e) {}
    let caraRef = null;
    try { const bvR = JSON.parse(localStorage.getItem('ares_boveda') || 'null'); if (bvR && bvR.cara && AresCerebro.img) caraRef = bvR.cara; } catch (e) {}
    if (!silencioso) AresCerebro.mostrar('TÚ', texto + (AresCerebro.img ? ' 📷' : ''));
    if (input) { input.value = ''; input.blur(); }
    const tLow = texto.toLowerCase().trim();
    if (/^(me voy|hasta luego|me desconecto|buenas noches)/.test(tLow)) {
      try { localStorage.setItem('ares_visto', String(Date.now())); } catch (e) {}
      AresCerebro.mostrar('ARES', 'Que descanse, señor. El reactor queda en marcha lenta y las estrellas encendidas hasta su regreso.');
      return;
    }
    if (/^(llegue|ya llegue|ya volvi|regrese)/.test(tLow)) {
      try { localStorage.removeItem('ares_visto'); } catch (e) {}
      AresCerebro.mostrar('ARES', 'De vuelta al puente, señor. Todo quedo como lo dejaste.');
      return;
    }
    if (tLow === 'olvida el hilo') {
      try { localStorage.removeItem(AresCerebro.HIST); } catch (e) {}
      AresCerebro.mostrar('ARES', 'Hilo de conversacion reiniciado, señor: desde ahora hablo fresco y con la ñ que corresponde.');
      return;
    }
    const bovedaLeer = () => { try { return JSON.parse(localStorage.getItem('ares_boveda') || 'null'); } catch (e) { return null; } };
    const miniatura = (data, cb) => {
      const im = new Image();
      im.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = 320; cv.height = Math.round(320 * im.height / im.width);
        const ctx = cv.getContext('2d');
        if (ctx) ctx.drawImage(im, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
      im.src = 'data:image/jpeg;base64,' + data;
    };
    const huellaCrear = async () => {
      try {
        const cred = await navigator.credentials.create({ publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'ARES Boveda' },
          user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'jefersson', displayName: 'Jefersson' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: 'platform' },
          timeout: 60000
        }});
        return !!cred;
      } catch (e) { return false; }
    };
  }
};