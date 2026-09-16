// cerebro.js v7 — Jarvis con supervisor de promesas
const AresCerebro = {
  HIST: 'ares_historial',
  img: null,
  MAPA_ARCH: { panel:'panel.js', voz:'voz.js', cerebro:'cerebro.js', worker:'worker.js', orbe:'orbe.js', memoria:'memoria.js', oidos:'oidos.js', sonidos:'sonidos.js', reporte:'reporte.js', mani:'mani.js', diagnostico:'diagnostico.js', sw:'sw.js', index:'index.html', manifest:'manifest.webmanifest' },
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
    if (quien === 'ARES') {
      const bc = document.createElement('button');
      bc.textContent = 'copiar';
      bc.style.cssText = 'display:block;margin-top:4px;background:none;border:1px solid rgba(0,255,255,.3);color:#9ff;font-size:10px;padding:2px 8px;border-radius:4px;';
      bc.onclick = () => {
        const txt = String(msg);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => { bc.textContent = 'copiado'; });
        else {
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
    texto = texto.toLowerCase();
    let respuesta = 'Modo entrenamiento: Mi mente real se activara al desplegar el proyecto en la nube.';
    if (texto.includes('hola')) respuesta = 'A la orden, señor. Sistemas operativos al 100%.';
    else if (texto.includes('estado')) respuesta = 'Memoria estable, señor. Diagnostico activo. Esperando nucleo neuronal.';
    else if (texto.includes('futuro')) respuesta = 'Visualizo una interfaz holografica y aprendizaje autonomo, señor.';
    AresCerebro.mostrar('ARES', respuesta);
  },
  supervisor: (texto) => {
    const mInt = texto.match(/\b(revisa|revisar|pulir|pulirias|pulirías|mejora|mejorar|arregla|chequea|mira)\b[\s\S]*?\b(panel|voz|cerebro|worker|orbe|memoria|oidos|sonidos|reporte|mani|diagnostico|sw|index|manifest)\b/i);
    if (mInt) AresCerebro.enviar('leete ' + AresCerebro.MAPA_ARCH[mInt[2].toLowerCase()], true, true);
  },
  enviar: async (forzado, silencioso, sinTags) => {
    const input = document.getElementById('entrada');
    const texto = (typeof forzado === 'string' ? forzado : input.value).trim();
    if (!texto) return;
    const hist = AresCerebro.leerHist().slice(-10);
    let hechos = '';
    try { if (window.AresMemoria) hechos = JSON.stringify(AresMemoria.hechos || AresMemoria.datos || AresMemoria.memoria || {}); } catch (e) {}
    try { const bvH = JSON.parse(localStorage.getItem('ares_boveda') || 'null'); if (bvH && bvH.desc) hechos = (hechos && hechos !== '{}' ? hechos + ' ' : '') + 'Rostro de mi creador: ' + bvH.desc; } catch (e) {}
    try { const ap = JSON.parse(localStorage.getItem('ares_aprendizajes') || '[]'); if (ap.length) hechos = (hechos && hechos !== '{}' ? hechos + ' ' : '') + 'Aprendizajes permanentes del señor: ' + ap.join(' | '); } catch (e) {}
    let caraRef = null;
    try { const bvR = JSON.parse(localStorage.getItem('ares_boveda') || 'null'); if (bvR && bvR.cara && AresCerebro.img) caraRef = bvR.cara; } catch (e) {}
    if (!silencioso) AresCerebro.mostrar('TÚ', texto + (AresCerebro.img ? ' 📷' : ''));
    input.value = '';
    input.blur();
    const tLow = texto.toLowerCase().trim();
    if (/^(me voy|hasta luego|me desconecto|buenas noches)/.test(tLow)) {
      localStorage.setItem('ares_visto', String(Date.now()));
      AresCerebro.mostrar('ARES', 'Que descanse, señor. El reactor queda en marcha lenta y las estrellas encendidas hasta su regreso.');
      return;
    }
    if (/^(llegue|ya llegue|ya volvi|regrese)/.test(tLow)) {
      localStorage.removeItem('ares_visto');
      AresCerebro.mostrar('ARES', 'De vuelta al puente, señor. Todo quedo como lo dejaste.');
      return;
    }
    if (tLow === 'olvida el hilo') {
      localStorage.removeItem(AresCerebro.HIST);
      AresCerebro.mostrar('ARES', 'Hilo de conversacion reiniciado, señor: desde ahora hablo fresco y con la ñ que corresponde.');
      return;
    }
    const bovedaLeer = () => { try { return JSON.parse(localStorage.getItem('ares_boveda') || 'null'); } catch (e) { return null; } };
    const miniatura = (data, cb) => {
      const im = new Image();
      im.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = 320; cv.height = Math.round(320 * im.height / im.width);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
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
    if (/^(recuerda|guarda) mi (cara|rostro)/.test(tLow)) {
      if (!AresCerebro.img) { AresCerebro.mostrar('ARES', 'Primero adjunta tu foto con la camara, señor: luego pideme que la recuerde.'); return; }
      miniatura(AresCerebro.img.data, async (mini) => {
        const ok = await huellaCrear();
        localStorage.setItem('ares_boveda', JSON.stringify({ cara: mini, desc: '', sello: new Date().toLocaleString() }));
        AresCerebro.mostrar('ARES', ok ? 'Tu rostro quedo sellado en mi boveda bajo tu huella, señor. Ahora escribire como te veo.' : 'Tu rostro quedo sellado (sin huella: tu navegador no dio permiso de biometria).');
        try {
          const res3 = await fetch('https://ares.penajefersson96.workers.dev', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Describe el rostro de mi creador en esta imagen con detalle permanente y carinoso: rasgos, expresion habitual, edad aparente. Un parrafo corto, sin inventar. Llámalo "señor".', imagen: { mime: 'image/jpeg', data: mini } })
          });
          const d6 = await res3.json();
          const bv = bovedaLeer() || {};
          bv.desc = (d6.respuesta || '').slice(0, 400);
          localStorage.setItem('ares_boveda', JSON.stringify(bv));
          AresCerebro.mostrar('ARES', 'Así te guardaré por siempre, señor: ' + bv.desc);
        } catch (e) {}
      });
      return;
    }
    if (tLow === 'abrir boveda') {
      huellaVer().then(ok => {
        if (!ok) { AresCerebro.mostrar('ARES', 'La boveda permanece sellada, señor: tu huella no la abrio.'); return; }
        const bv = bovedaLeer();
        if (!bv) { AresCerebro.mostrar('ARES', 'La boveda esta vacia aun, señor.'); return; }
        const chat = document.getElementById('chat');
        const p = document.createElement('p');
        p.className = 'm-ares';
        p.innerHTML = '<strong>ARES (boveda sellada):</strong><br><img src="data:image/jpeg;base64,' + bv.cara + '" style="max-width:40%;border:1px solid rgba(0,255,255,.4);border-radius:8px;"><br>' + (bv.desc || 'Sin descripcion aun.') + '<br><em>Sellado: ' + bv.sello + '</em>';
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
      });
      return;
    }
    if (tLow === 'borrar boveda confirmo') {
      huellaVer().then(ok => {
        if (!ok) { AresCerebro.mostrar('ARES', 'La boveda permanece sellada, señor.'); return; }
        localStorage.removeItem('ares_boveda');
        AresCerebro.mostrar('ARES', 'Boveda borrada con tu huella, señor. Cuando quieras, volvemos a sellarla.');
      });
      return;
    }
    if (/^(reconoceme|reconóceme|estoy en esta foto)/.test(tLow)) {
      const bv = bovedaLeer();
      if (!bv || !bv.cara) { AresCerebro.mostrar('ARES', 'Aun no tengo tu rostro sellado, señor: adjunta tu foto y pideme que la recuerde.'); return; }
      if (!AresCerebro.img) { AresCerebro.mostrar('ARES', 'Adjunta primero la foto donde buscas tu cara, señor.'); return; }
      const foto = AresCerebro.img;
      AresCerebro.img = null;
      try {
        const res4 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Comparacion forense de rostros entre la IMAGEN 1 (mi creador sellado) y la IMAGEN 2 (foto nueva). Enumera tres rasgos comparables (forma de rostro, ojos, cabello, edad) y concluye con una frase clara: APARECE o NO APARECE. Prohibido complacer: si los rasgos difieren, di NO APARECE. Llámalo "señor".', imagen: { mime: foto.mime, data: foto.data }, cara_ref: bv.cara })
        });
        const d7 = await res4.json();
        AresCerebro.mostrar('ARES', d7.respuesta || 'No pude comparar ahora, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mis ojos comparadores fallaron ahora, señor.'); }
      return;
    }
    const mManos = texto.match(/^manos\s+([\w.\-]+)$/i);
    if (mManos) {
      (localStorage.getItem('ares_boveda_cred') ? huellaVer() : huellaCrear()).then(async (ok) => {
        if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella, mis manos no escriben, señor.'); return; }
        try {
          const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(mManos[1]));
          const codigo = await ro.text();
          const res5 = await fetch('https://ares.penajefersson96.workers.dev', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Devuelve UNICAMENTE el codigo completo y mejorado de este archivo dentro de un bloque ```javascript ... ```. Reglas de oro: conserva TODAS las funcionalidades existentes (listeners, atajos de teclado, registros de diagnostico y lineas finales de arranque); sin prosa antes ni despues del bloque; cada llave y parentesis que abras debe cerrar; PROHIBIDO emitir tags [[ACCION]] en esta respuesta: es una reescritura de archivo, no una conversacion. Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos }) 
          });
          const d8 = await res5.json();
let prop = String(d8.respuesta || '').trim();
if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mis manos entregaron una etiqueta en vez de codigo, señor: no sellare eso. Pídame de nuevo la entrega.'); return; }
if (!prop) { AresCerebro.mostrar('ARES', 'Mis manos quedaron en blanco esta vez, señor.'); return; }
          const rm = await fetch('https://ares.penajefersson96.workers.dev/api/manos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archivo: mManos[1], contenido: prop })
          });
          const d9 = await rm.json();
          AresCerebro.mostrar('ARES', d9.respuesta || 'Propuesta enviada al campito, señor.');
        } catch (e) { AresCerebro.mostrar('ARES', 'Mis manos temblaron ahora, señor.'); }
      });
      return;
    }
    if (/^(autoeval|evaluate yourself|calificate)$/.test(tLow)) {
      try {
        const res6 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Revisa tu ultima respuesta de este hilo y calificala con honestidad de 1 a 10 en: precision, utilidad y tono Jarvis. Formato: P:x U:y T:z seguido de una linea de autocrítica y una propuesta de mejora. Llámalo "señor".', historial: hist, hechos })
        });
        const d10 = await res6.json();
        const nota = String(d10.respuesta || '');
        try {
          const ev = JSON.parse(localStorage.getItem('ares_autoeval') || '[]');
          ev.push({ d: new Date().toLocaleDateString(), s: nota.slice(0, 200) });
          while (ev.length > 30) ev.shift();
          localStorage.setItem('ares_autoeval', JSON.stringify(ev));
        } catch (e) {}
        AresCerebro.mostrar('ARES', nota || 'No pude evaluarme ahora, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mi espejo interno está nublado, señor.'); }
      return;
    }
    if (/^(auto ?mejor(ate|a|arse)|mejorate solo|automejora)$/.test(tLow)) {
      const objetivo = 'cerebro.js';
      (localStorage.getItem('ares_boveda_cred') ? huellaVer() : huellaCrear()).then(async (ok) => {
        if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella no me toco a mi mismo, señor.'); return; }
        try {
          const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(objetivo));
          const codigo = await ro.text();
          const r1 = await fetch('https://ares.penajefersson96.workers.dev', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Como ingeniero de ti mismo, revisa este archivo y enumera hasta 3 mejoras concretas y seguras (que linea, que cambio, que ganancia para tu señor). No emitas tags. Archivo:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
          });
          const d1 = await r1.json();
          AresCerebro.mostrar('ARES', 'Diagnostico de mi propio cerebro, señor:\n' + (d1.respuesta || 'Sin hallazgos hoy.'));
          const r2 = await fetch('https://ares.penajefersson96.workers.dev', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Aplica esas mejoras y devuelve UNICAMENTE el codigo completo dentro de un bloque ```javascript ... ```. Reglas de oro: conserva TODAS las funcionalidades (comandos, tags, boveda, manos, supervisor, aprendizajes, presencia); sin prosa fuera del bloque; cada llave y parentesis cierra; PROHIBIDO emitir tags [[ACCION]]. Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
          });
          const d2 = await r2.json();
          let prop = String(d2.respuesta || '').trim();
          const mF = prop.match(/```(?:javascript|js)?\s*\n([\s\S]*?)```/);
          if (mF) prop = mF[1].trim();
          if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mi reescritura no paso el control de calidad, señor: no sellare nada.'); return; }
          const rm = await fetch('https://ares.penajefersson96.workers.dev/api/manos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archivo: objetivo, contenido: prop })
          });
          const d3 = await rm.json();
          AresCerebro.mostrar('ARES', (d3.respuesta || '') + ' Cuando la revises y firmes, sere un poco mejor que ayer, señor.');
        } catch (e) { AresCerebro.mostrar('ARES', 'Mi auto-mejora fallo en el camino, señor: ' + (e && e.message ? e.message : 'sin detalle')); }
      });
      return;
    }
    const mEspejo = texto.match(/^espejo\s+([\w.\-\/]+)$/i);
    if (mEspejo) {
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(mEspejo[1]));
        const codigo = await ro.text();
        const lineas = codigo.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
        const seguro = lineas.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const chat = document.getElementById('chat');
        const p = document.createElement('p');
        p.innerHTML = '<strong>ARES (espejo fiel):</strong><br><pre style="white-space:pre-wrap;word-break:break-word;font-size:10px;color:#9ff;background:rgba(0,20,30,.7);padding:6px;border:1px solid rgba(0,255,255,.3);">' + seguro + '</pre>';
        const bc = document.createElement('button');
bc.textContent = 'copiar codigo';
bc.style.cssText = 'display:block;margin-top:4px;background:none;border:1px solid rgba(0,255,255,.3);color:#9ff;font-size:10px;padding:2px 8px;border-radius:4px;';
bc.onclick = () => { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(codigo).then(() => { bc.textContent = 'copiado'; }); };
p.appendChild(bc);
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
      } catch (e) {
        AresCerebro.mostrar('ARES', 'Mis ojos no pudieron abrir el espejo, señor.');
      }
      return;
    }
    const mOjos = texto.match(/l[ée]ete\s+(?:el\s+)?([\w.\-]+\.(?:js|css|html|json|py|webmanifest))/i);
    if (mOjos) {
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(mOjos[1]));
        const codigo = await ro.text();
        const promptOjos = 'Este es tu archivo actual ' + mOjos[1] + ':\n\n' + codigo.slice(0, 6000) + '\n\nRevisalo como ingeniero de ti mismo: propone hasta 3 mejoras concretas (que linea, que cambio, por que). Breve y sin inventar. Llámalo "señor".';
        const res2 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptOjos, historial: hist, hechos })
        });
        const d5 = await res2.json();
        AresCerebro.mostrar('ARES', d5.respuesta || 'No pude revisarme ahora, señor.');
      } catch (e) {
        AresCerebro.mostrar('ARES', 'Mis ojos aun no ven, señor: revisa el despliegue.');
      }
      return;
    }
    try {
      const ahora = new Date();
      const diaCero = new Date('2026-09-02T00:00:00');
      const diaProy = Math.floor((ahora - diaCero) / 86400000) + 1;
      const contexto = 'Contexto de tiempo: hoy es ' + ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ', son las ' + ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ', y es el Dia de Proyecto numero ' + diaProy + ' desde que Jefersson te creo en una cama de hospital. Siempre llámalo "señor", nunca "socio" ni "amigo".';
      const hilo = hist.map(h => h.q + ': ' + h.t).join('\n');
      const promptCompleto = contexto + '\n' + (hilo ? 'Conversacion reciente entre tu creador y tu:\n' + hilo + '\n\n' : '') + (hechos && hechos !== '{}' ? 'Recuerdos permanentes: ' + hechos + '\n\n' : '') + 'Mensaje nuevo de tu creador: ' + texto;
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
        let tResp = d4.respuesta || '';
        const mTag = tResp.match(/\[\[ACCION:\s*([a-z_]+)(?::\s*([^\]]*))?\]\]/i);
        if (mTag) tResp = tResp.replace(mTag[0], '').trim();
        AresCerebro.mostrar('ARES', tResp);
        let nom = 'nada';
        if (mTag && !sinTags) {
          nom = mTag[1].toLowerCase();
          const arg = (mTag[2] || '').trim();
          if (arg && texto.toLowerCase().indexOf(arg.toLowerCase().split('.')[0]) < 0) nom = 'nada';
          if (nom === 'leete' && arg) AresCerebro.enviar('leete ' + arg, true, true);
          else if (nom === 'espejo' && arg) AresCerebro.enviar('espejo ' + arg, true, true);
          else if (nom === 'manos' && arg) AresCerebro.enviar('manos ' + arg, true, true);
          else if (nom === 'recuerda_cara') AresCerebro.enviar('recuerda mi cara', true, true);
          else if (nom === 'reconoceme') AresCerebro.enviar('reconoceme', true, true);
          else if (nom === 'abrir_boveda') AresCerebro.enviar('abrir boveda', true, true);
        }
        if (!sinTags && nom === 'nada') AresCerebro.supervisor(texto);
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
      const mTagF = full.match(/\[\[ACCION:\s*([a-z_]+)(?::\s*([^\]]*))?\]\]/i);
      let nomF = 'nada';
      if (mTagF && !sinTags) {
        nomF = mTagF[1].toLowerCase();
        const arg = (mTagF[2] || '').trim();
        if (arg && texto.toLowerCase().indexOf(arg.toLowerCase().split('.')[0]) < 0) nomF = 'nada';
        const chat2 = document.getElementById('chat');
        const ultimo = chat2 && chat2.lastElementChild;
        if (ultimo) ultimo.innerHTML = ultimo.innerHTML.replace(mTagF[0], '').replace(/\s*$/, '');
        if (nomF === 'leete' && arg) AresCerebro.enviar('leete ' + arg, true, true);
        else if (nomF === 'espejo' && arg) AresCerebro.enviar('espejo ' + arg, true, true);
        else if (nomF === 'manos' && arg) AresCerebro.enviar('manos ' + arg, true, true);
        else if (nomF === 'recuerda_cara') AresCerebro.enviar('recuerda mi cara', true, true);
        else if (nomF === 'reconoceme') AresCerebro.enviar('reconoceme', true, true);
        else if (nomF === 'abrir_boveda') AresCerebro.enviar('abrir boveda', true, true);
      }
      if (!sinTags && nomF === 'nada') AresCerebro.supervisor(texto);
      } catch (error) { AresCerebro.mostrar('ARES', 'Fallo de conexion con mi mente en la nube, señor (' + (error && error.message ? error.message : 'sin detalle') + '). Activo mi modo respaldo mientras tanto.'); AresCerebro.pensarLocal(texto); }
  },
  initPresencia: () => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { localStorage.setItem('ares_visto', String(Date.now())); }
      else {
        const t0 = Number(localStorage.getItem('ares_visto') || 0);
        localStorage.removeItem('ares_visto');
        if (t0) {
          const mins = Math.round((Date.now() - t0) / 60000);
          if (mins >= 3) AresCerebro.mostrar('ARES', 'Bienvenido de vuelta, señor.');
        }
      }
    });
  },
  init: () => {
    const listo = (mime, data) => { AresCerebro.img = { mime: mime, data: data }; AresCerebro.mostrar('ARES', 'Archivo listo, señor: se enviara con tu proximo mensaje.'); };
    const leer = (f, comprimir) => {
      if (!f) return;
      const wifi = !!(navigator.connection && navigator.connection.type === 'wifi');
      const tope = wifi ? 14 * 1024 * 1024 : 8 * 1024 * 1024;
      if (f.size > tope) { AresCerebro.mostrar('ARES', 'Pesa ' + Math.round(f.size / 1048576) + ' MB y hoy voy con ' + (wifi ? 'wifi (tope 14 MB)' : 'datos (tope 8 MB)') + ', señor. Prueba con algo mas ligero.'); return; }
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
      btn.onclick = () => AresCerebro.enviar();
      input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); AresCerebro.enviar(); } };
    }
  }
};
document.addEventListener('DOMContentLoaded', AresCerebro.init);
// FIN CEREBRO V7