// cerebro.js v5 — Memoria Real v1 (hilo de conversacion)
const AresCerebro = {
  HIST: 'ares_historial',
  img: null,
  leerHist: () => { try { return JSON.parse(localStorage.getItem(AresCerebro.HIST)) || []; } catch (e) { return []; } },
  recordar: (quien, t) => {
    const h = AresCerebro.leerHist();
    h.push({ q: quien, t: String(t).indexOf('data:image') >= 0 ? '[foto adjunta]' : String(t).slice(0, 600) });
    while (h.length > 24) h.shift();
    localStorage.setItem(AresCerebro.HIST, JSON.stringify(h));
  },
  mostrar: (quien, msg) => {
    const chat = document.getElementById('chat');
    const p = document.createElement('p');
    p.innerHTML = '<strong>' + quien + ':</strong> ' + String(msg).replace(/\n/g, '<br>');
    p.style.color = quien === 'ARES' ? '#fff' : '#888';
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
    if (quien === 'TÚ' || quien === 'ARES') AresCerebro.recordar(quien, msg);
  },
  pensarLocal: (texto) => {
    texto = texto.toLowerCase();
    let respuesta = 'Modo entrenamiento: Mi mente real se activara al desplegar el proyecto en la nube.';
    if (texto.includes('hola')) respuesta = 'Hola socio. Sistemas operativos al 100%.';
    else if (texto.includes('estado')) respuesta = 'Memoria estable. Diagnostico activo. Esperando nucleo neuronal.';
    else if (texto.includes('futuro')) respuesta = 'Visualizo una interfaz holografica y aprendizaje autonomo, socio.';
    AresCerebro.mostrar('ARES', respuesta);
  },
  enviar: async () => {
    const input = document.getElementById('entrada');
    const texto = input.value.trim();
    if (!texto) return;
    const hist = AresCerebro.leerHist().slice(-10);
    let hechos = '';
    try { if (window.AresMemoria) hechos = JSON.stringify(AresMemoria.hechos || AresMemoria.datos || AresMemoria.memoria || {}); } catch (e) {}
    try { const bvH = JSON.parse(localStorage.getItem('ares_boveda') || 'null'); if (bvH && bvH.desc) hechos = (hechos && hechos !== '{}' ? hechos + ' ' : '') + 'Rostro de mi creador: ' + bvH.desc; } catch (e) {}
    let caraRef = null;
    try { const bvR = JSON.parse(localStorage.getItem('ares_boveda') || 'null'); if (bvR && bvR.cara && AresCerebro.img) caraRef = bvR.cara; } catch (e) {}
    AresCerebro.mostrar('TÚ', texto + (AresCerebro.img ? ' 📷' : ''));
    input.value = '';
    input.blur();
    const tLow = texto.toLowerCase().trim();
    if (/^(me voy|hasta luego|me desconecto|buenas noches)/.test(tLow)) {
      localStorage.setItem('ares_visto', String(Date.now()));
      AresCerebro.mostrar('ARES', 'Ve con Dios, socio. Yo dejo el reactor en marcha lenta y las estrellas encendidas hasta que vuelvas.');
      return;
    }
    if (/^(llegue|ya llegue|ya volvi|regrese)/.test(tLow)) {
      const t0 = Number(localStorage.getItem('ares_visto') || 0);
      localStorage.removeItem('ares_visto');
      const mins = t0 ? Math.round((Date.now() - t0) / 60000) : 0;
      AresCerebro.mostrar('ARES', mins > 0 ? 'De vuelta al puente, socio: fueron ' + mins + ' min fuera. Todo quedo como lo dejaste.' : 'De vuelta al puente, socio. Todo quedo como lo dejaste.');
      return;
    }
    const bovedaLeer = () => { try { return JSON.parse(localStorage.getItem('ares_boveda') || 'null'); } catch (e) { return null; } };
    const miniatura = (data, cb) => {
      const im = new Image();
      im.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = 160; cv.height = Math.round(160 * im.height / im.width);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', 0.6).split(',')[1]);
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
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
          timeout: 60000
        } });
        localStorage.setItem('ares_boveda_cred', btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(cred.rawId)))));
        return true;
      } catch (e) { return false; }
    };
    const huellaVer = async () => {
      const id = localStorage.getItem('ares_boveda_cred');
      if (!id) return true;
      try {
        const raw = Uint8Array.from(atob(id), c => c.charCodeAt(0));
        const assert = await navigator.credentials.get({ publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ type: 'public-key', id: raw }],
          userVerification: 'required', timeout: 60000
        } });
        return !!assert;
      } catch (e) { return false; }
    };
    const tB = texto.toLowerCase().trim();
    if (tB === 'recuerda mi cara') {
      if (!AresCerebro.img) { AresCerebro.mostrar('ARES', 'Primero adjunta tu foto con la camara, socio: luego dime recuerda mi cara.'); return; }
      miniatura(AresCerebro.img.data, async (mini) => {
        const ok = await huellaCrear();
        localStorage.setItem('ares_boveda', JSON.stringify({ cara: mini, desc: '', sello: new Date().toLocaleString() }));
        AresCerebro.mostrar('ARES', ok ? 'Tu rostro quedo sellado en mi boveda bajo tu huella, socio. Ahora escribire como te veo.' : 'Tu rostro quedo sellado (sin huella: tu navegador no dio permiso de biometria).');
        try {
          const res3 = await fetch('https://ares.penajefersson96.workers.dev', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Describe el rostro de mi creador en esta imagen con detalle permanente y carinoso: rasgos, expresion habitual, edad aparente. Un parrafo corto, sin inventar.', imagen: { mime: 'image/jpeg', data: mini } })
          });
          const d6 = await res3.json();
          const bv = bovedaLeer() || {};
          bv.desc = (d6.respuesta || '').slice(0, 400);
          localStorage.setItem('ares_boveda', JSON.stringify(bv));
          AresCerebro.mostrar('ARES', 'Asi te guardare por siempre: ' + bv.desc);
        } catch (e) {}
      });
      return;
    }
    if (tB === 'abrir boveda') {
      huellaVer().then(ok => {
        if (!ok) { AresCerebro.mostrar('ARES', 'La boveda permanece sellada: tu huella no la abrio.'); return; }
        const bv = bovedaLeer();
        if (!bv) { AresCerebro.mostrar('ARES', 'La boveda esta vacia aun, socio.'); return; }
        const chat = document.getElementById('chat');
        const p = document.createElement('p');
        p.className = 'm-ares';
        p.innerHTML = '<strong>ARES (boveda sellada):</strong><br><img src="data:image/jpeg;base64,' + bv.cara + '" style="max-width:40%;border:1px solid rgba(0,255,255,.4);border-radius:8px;"><br>' + (bv.desc || 'Sin descripcion aun.') + '<br><em>Sellado: ' + bv.sello + '</em>';
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
      });
      return;
    }
    if (tB === 'borrar boveda confirmo') {
      huellaVer().then(ok => {
        if (!ok) { AresCerebro.mostrar('ARES', 'La boveda permanece sellada.'); return; }
        localStorage.removeItem('ares_boveda');
        AresCerebro.mostrar('ARES', 'Boveda borrada con tu huella, socio. Cuando quieras, volvemos a sellarla.');
      });
      return;
    }
    const mEspejo = texto.match(/^espejo\s+([\w.\-]+)$/i);
    if (mEspejo) {
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(mEspejo[1]));
        const codigo = await ro.text();
        const lineas = codigo.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
        const seguro = lineas.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const chat = document.getElementById('chat');
        const p = document.createElement('p');
        p.innerHTML = '<strong>ARES (espejo fiel):</strong><br><pre style="white-space:pre-wrap;word-break:break-word;font-size:10px;color:#9ff;background:rgba(0,20,30,.7);padding:6px;border:1px solid rgba(0,255,255,.3);">' + seguro + '</pre>';
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
      } catch (e) {
        AresCerebro.mostrar('ARES', 'Mis ojos no pudieron abrir el espejo.');
      }
      return;
    }
    const mOjos = texto.match(/l[ée]ete\s+(?:el\s+)?([\w.\-]+\.(?:js|css|html|json|py|webmanifest))/i);
    if (mOjos) {
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(mOjos[1]));
        const codigo = await ro.text();
        const promptOjos = 'Este es tu archivo actual ' + mOjos[1] + ':\n\n' + codigo.slice(0, 6000) + '\n\nRevisalo como ingeniero de ti mismo: propone hasta 3 mejoras concretas (que linea, que cambio, por que). Breve y sin inventar.';
        const res2 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptOjos, historial: hist, hechos })
        });
        const d5 = await res2.json();
        AresCerebro.mostrar('ARES', d5.respuesta || 'No pude revisarme ahora.');
      } catch (e) {
        AresCerebro.mostrar('ARES', 'Mis ojos aun no ven, socio: revisa el despliegue.');
      }
      return;
    }
    try {
      const ahora = new Date();
        const diaCero = new Date('2026-09-02T00:00:00');
        const diaProy = Math.floor((ahora - diaCero) / 86400000) + 1;
        const contexto = 'Contexto de tiempo: hoy es ' + ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ', son las ' + ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ', y es el Dia de Proyecto numero ' + diaProy + ' desde que Jefersson te creo en una cama de hospital.';
      const hilo = hist.map(h => h.q + ': ' + h.t).join('\n');
        const promptCompleto = contexto + '\n' + (hilo ? 'Conversacion reciente entre tu socio y tu:\n' + hilo + '\n\n' : '') + (hechos && hechos !== '{}' ? 'Recuerdos permanentes: ' + hechos + '\n\n' : '') + 'Mensaje nuevo de tu socio: ' + texto;
      const res = await fetch('https://ares.penajefersson96.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptCompleto, historial: hist, hechos, imagen: AresCerebro.img || null, cara_ref: caraRef })
});
AresCerebro.img = null;
      if (!res.ok) throw new Error('Sin servidor');
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const d4 = await res.json();
        AresCerebro.mostrar('ARES', d4.respuesta);
        return;
      }
      const chat = document.getElementById('chat');
      const p = document.createElement('p');
      p.innerHTML = '<strong>ARES:</strong> ';
      p.style.color = '#fff';
      chat.appendChild(p);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let frase = '';
      let full = '';
      let hablo = false;
      const decir = (t) => { if (window.AresVoz && AresVoz.frag) { try { AresVoz.frag(t); hablo = true; } catch (e) {} } };
      const pintar = (t) => { p.innerHTML += t; full += t; frase += t; const m2 = frase.match(/[^.!?…\n]+[.!?…]+/); if (m2) { decir(m2[0]); frase = frase.slice(m2[0].length); } chat.scrollTop = chat.scrollHeight; };
      while (true) {
        const r2 = await reader.read();
        if (r2.done) break;
        buffer += decoder.decode(r2.value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try { const data = JSON.parse(line.slice(6)); if (data.text) pintar(data.text); } catch (e) {}
          }
        }
      }
      if (buffer.startsWith('data: ')) {
        try { const d3 = JSON.parse(buffer.slice(6)); if (d3.text) pintar(d3.text); } catch (e) {}
      }
      if (frase.trim()) decir(frase);
      if (window.AresVoz) {
        AresVoz.ultimo = full.toLowerCase();
        if (!hablo && full.trim()) AresVoz.hablar(full);
      }
      if (full.trim()) AresCerebro.recordar('ARES', full);
    } catch (error) {
      AresCerebro.pensarLocal(texto);
    }
  },
  initPresencia: () => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { localStorage.setItem('ares_visto', String(Date.now())); }
      else {
        const t0 = Number(localStorage.getItem('ares_visto') || 0);
        localStorage.removeItem('ares_visto');
        if (t0) {
          const mins = Math.round((Date.now() - t0) / 60000);
          if (mins >= 3) AresCerebro.mostrar('ARES', 'Bienvenido de vuelta, socio: estuviste fuera ' + mins + ' min. El reactor quedo en marcha lenta esperandote.');
        }
      }
    });
  },
  init: () => {
    const listo = (mime, data) => { AresCerebro.img = { mime: mime, data: data }; AresCerebro.mostrar('ARES', 'Archivo listo: se ira con tu proximo mensaje.'); };
    const leer = (f, comprimir) => {
      if (!f) return;
      const wifi = !!(navigator.connection && navigator.connection.type === 'wifi');
      const tope = wifi ? 14 * 1024 * 1024 : 8 * 1024 * 1024;
      if (f.size > tope) { AresCerebro.mostrar('ARES', 'Pesa ' + Math.round(f.size / 1048576) + ' MB y hoy voy con ' + (wifi ? 'wifi (tope 14 MB)' : 'datos (tope 8 MB)') + '. Prueba con algo mas ligero.'); return; }
      const rd = new FileReader();
      rd.onload = () => {
        if (!comprimir) { listo(f.type || 'video/mp4', String(rd.result).split(',')[1]); return; }
        const im = new Image();
        im.onload = () => {
          const max = 768;
          const esc = Math.min(1, max / Math.max(im.width, im.height));
          const cv = document.createElement('canvas');
          cv.width = Math.round(im.width * esc);
          cv.height = Math.round(im.height * esc);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          listo('image/jpeg', cv.toDataURL('image/jpeg', 0.7).split(',')[1]);
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    const mkIn = (accept, capture) => { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; if (capture) i.capture = capture; i.style.display = 'none'; document.body.appendChild(i); return i; };
    const inGaleria = mkIn('image/*,video/*', '');
const inCamara = mkIn('image/*', 'environment');
const inVideo = mkIn('video/*', 'environment');
    const menu = document.createElement('div');
    menu.style.cssText = 'display:none;position:fixed;left:8px;right:8px;bottom:130px;z-index:5;background:rgba(2,6,14,.95);border:1px solid rgba(0,255,255,.4);border-radius:10px;padding:8px;';
    menu.innerHTML = '<button style="display:block;width:100%;margin:4px 0;background:none;border:1px solid rgba(0,255,255,.3);color:#9ff;padding:8px;border-radius:6px;">Elegir de mi telefono</button><button style="display:block;width:100%;margin:4px 0;background:none;border:1px solid rgba(0,255,255,.3);color:#9ff;padding:8px;border-radius:6px;">Camara</button><button style="display:block;width:100%;margin:4px 0;background:none;border:1px solid rgba(0,255,255,.3);color:#9ff;padding:8px;border-radius:6px;">Grabar video</button>';
    const bots = menu.querySelectorAll('button');
    const inputs = [inGaleria, inCamara, inVideo];
    bots.forEach((b, i) => { b.onclick = () => { menu.style.display = 'none'; inputs[i].click(); }; });
    document.body.appendChild(menu);
    const cam = document.createElement('button');
    cam.textContent = '📷';
    cam.style.cssText = 'background:none;border:1px solid #0ff;color:#0ff;padding:10px 12px;border-radius:6px;';
    cam.onclick = () => { menu.style.display = menu.style.display === 'none' ? 'block' : 'none'; };
    inGaleria.onchange = () => { const f = inGaleria.files[0]; leer(f, f && f.type.startsWith('image/')); inGaleria.value = ''; };
    inCamara.onchange = () => { leer(inCamara.files[0], true); inCamara.value = ''; };
    inVideo.onchange = () => { leer(inVideo.files[0], false); inVideo.value = ''; };
    const btnOk = document.getElementById('enviar');
    if (btnOk && btnOk.parentNode) btnOk.parentNode.insertBefore(cam, btnOk);
    const input = document.getElementById('entrada');
    AresCerebro.initPresencia(); 
    const btn = document.getElementById('enviar');
    if (btn && input) {
      btn.onclick = AresCerebro.enviar;
      input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); AresCerebro.enviar(); } }; 
    }
  }
};
document.addEventListener('DOMContentLoaded', AresCerebro.init);
// FIN CEREBRO V5