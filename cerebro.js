// cerebro.js v8.0 — Núcleo limpio, sin auto-desarrollo, sin streaming fantasma
const WORKER_URL = 'https://ares.penajefersson96.workers.dev';
const HIST_KEY = 'ares_historial';

const AresCerebro = {
  img: null,
  MAPA_ARCH: { 
    panel:'panel.js', voz:'voz.js', cerebro:'cerebro.js', worker:'worker.js', 
    orbe:'orbe.js', memoria:'memoria.js', oidos:'oidos.js', sonidos:'sonidos.js', 
    reporte:'reporte.js', mani:'mani.js', diagnostico:'diagnostico.js', sw:'sw.js', 
    index:'index.html', manifest:'manifest.webmanifest', boveda:'boveda.js', 
    comandos:'comandos.js', supervisor:'supervisor.js' 
  },

  // --- UTILIDADES DE MEMORIA ---
  leerHist: () => { 
    try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } 
    catch (e) { return []; } 
  },
  
  recordar: (quien, t) => {
    const h = AresCerebro.leerHist();
    const textoLimpio = String(t).indexOf('data:image') >= 0 ? '[foto adjunta]' : String(t).slice(0, 600);
    h.push({ q: quien, t: textoLimpio });
    while (h.length > 24) h.shift();
    localStorage.setItem(HIST_KEY, JSON.stringify(h));
  },

  // --- UI ---
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
          navigator.clipboard.writeText(txt).then(() => { bc.textContent = 'copiado'; });
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
    AresCerebro.mostrar('ARES', respuesta);
  },

  // --- BÓVEDA (WebAuthn Aislado) ---
  boveda: {
    crearHuella: async () => {
      try {
        const cred = await navigator.credentials.create({ 
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            rp: { name: 'ARES Boveda' },
            user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'jefersson', displayName: 'Jefersson' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
            authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
            timeout: 60000
          } 
        });
        localStorage.setItem('ares_boveda_cred', btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(cred.rawId)))));
        return true;
      } catch (e) { return false; }
    },
    
    verificarHuella: async () => {
      const id = localStorage.getItem('ares_boveda_cred');
      if (!id) return true; // Si no hay huella guardada, no bloquear por ahora
      try {
        const raw = Uint8Array.from(atob(id), c => c.charCodeAt(0));
        const assert = await navigator.credentials.get({ 
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            allowCredentials: [{ type: 'public-key', id: raw }],
            userVerification: 'required', 
            timeout: 60000
          } 
        });
        return !!assert;
      } catch (e) { return false; }
    },

    leer: () => { 
      try { return JSON.parse(localStorage.getItem('ares_boveda') || 'null'); } 
      catch (e) { return null; } 
    }
  },

  // --- LÓGICA PRINCIPAL ---
  enviar: async (forzado, silencioso) => {
    const input = document.getElementById('entrada');
    const texto = (typeof forzado === 'string' ? forzado : input.value).trim();
    if (!texto) return;

    const hist = AresCerebro.leerHist().slice(-10);
    let hechos = '';
if (window.AresMemoria) {
  hechos = AresMemoria.obtenerParaPrompt();
}
    
    const bv = AresCerebro.boveda.leer();
    if (bv && bv.desc) hechos += (hechos ? ' ' : '') + 'Rostro de mi creador: ' + bv.desc;
    
    try { 
      const ap = JSON.parse(localStorage.getItem('ares_aprendizajes') || '[]'); 
      if (ap.length) hechos += (hechos ? ' ' : '') + 'Aprendizajes permanentes: ' + ap.join(' | '); 
    } catch (e) {}

    let caraRef = null;
    if (bv && bv.cara && AresCerebro.img) caraRef = bv.cara;

    if (!silencioso) AresCerebro.mostrar('TÚ', texto + (AresCerebro.img ? ' 📷' : ''));
    if (input) { input.value = ''; input.blur(); }

    const tLow = texto.toLowerCase().trim();

    // 1. COMANDOS LOCALES RÁPIDOS
    if (/^(me voy|hasta luego|me desconecto|buenas noches)/.test(tLow)) {
      localStorage.setItem('ares_visto', String(Date.now()));
      AresCerebro.mostrar('ARES', 'Que descanse, señor. El reactor queda en marcha lenta.');
      return;
    }
    if (/^(llegue|ya llegue|ya volvi|regrese)/.test(tLow)) {
      localStorage.removeItem('ares_visto');
      AresCerebro.mostrar('ARES', 'De vuelta al puente, señor. Todo quedo como lo dejaste.');
      return;
    }
    if (tLow === 'olvida el hilo') {
      localStorage.removeItem(HIST_KEY);
      AresCerebro.mostrar('ARES', 'Hilo de conversacion reiniciado, señor.');
      return;
    }
    if (tLow === 'reporte' || tLow === 'diagnostico') {
  if (window.AresReporte) {
    AresReporte.generar();
  } else {
    AresCerebro.mostrar('ARES', 'El módulo de reportes no está disponible, señor.');
  }
  return;
}
if (tLow === 'mani' || tLow === 'manifiesto' || tLow === 'verifica pwa') {
  if (window.AresMani) {
    AresMani.verificar();
  } else {
    AresCerebro.mostrar('ARES', 'El módulo de manifiesto no está disponible, señor.');
  }
  return;
}
    
    const mMin = texto.match(/^minutero\s+(\d+)$/i);
    if (mMin) {
      if (window.AresGlobo) AresGlobo.minutero(Number(mMin[1]));
      else AresCerebro.mostrar('ARES', 'Mi esfera no esta cargada, señor.');
      return;
    }
    if (tLow === 'voces') {
      if (window.AresVoz) AresVoz.listar();
      return;
    }
    const mVoz = tLow.match(/^voz\s+(\d+)$/);
    if (mVoz) {
      if (window.AresVoz) AresVoz.elegir(Number(mVoz[1]));
      return;
    }
    if (tLow === 'silencio' || tLow === 'callate') {
      if (window.AresVoz) { AresVoz.activada = false; AresVoz.cancelar(); AresCerebro.mostrar('ARES', 'Entendido, señor. Guardo silencio.'); }
      return;
    }
    if (tLow === 'habla' || tLow === 'puedes hablar') {
      if (window.AresVoz) { AresVoz.activada = true; AresCerebro.mostrar('ARES', 'Voz reactivada, señor.'); }
      return;
    }

    // 2. APRENDIZAJES Y MEMORIA
const mAp = texto.match(/^(?:aprende que|recuerda que|recuerda)\s+(.+)$/i);
if (mAp) {
  if (window.AresMemoria) {
    const hecho = AresMemoria.guardar(mAp[1].trim(), 'aprendizaje');
    if (hecho) {
      AresCerebro.mostrar('ARES', 'Aprendido y sellado en mi memoria, señor: "' + hecho.text + '".');
    } else {
      AresCerebro.mostrar('ARES', 'No pude sellar ese aprendizaje, señor.');
    }
  }
  return;
}

if (tLow === 'que has aprendido' || tLow === 'memoria' || tLow.includes('que recuerdas')) {
  if (window.AresMemoria) {
    const resumen = AresMemoria.obtenerResumen();
    AresCerebro.mostrar('ARES', 'Esto llevo sellado en mi memoria, señor:\n' + resumen);
  }
  return;
}

if (tLow === 'olvida todo' || tLow === 'borra tu memoria') {
  if (window.AresMemoria) {
    AresMemoria.formatear();
    AresCerebro.mostrar('ARES', 'He borrado mi memoria por completo, señor. Empezamos de cero.');
  }
  return;
}

    // 3. BÓVEDA (Requiere huella o foto)
    if (/^(recuerda|guarda) mi (cara|rostro)/.test(tLow)) {
      if (!AresCerebro.img) { AresCerebro.mostrar('ARES', 'Primero adjunta tu foto, señor.'); return; }
      const mini = await new Promise(resolve => {
        const im = new Image();
        im.onload = () => {
          const cv = document.createElement('canvas');
          cv.width = 320; cv.height = Math.round(320 * im.height / im.width);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          resolve(cv.toDataURL('image/jpeg', 0.7).split(',')[1]);
        };
        im.src = 'data:image/jpeg;base64,' + AresCerebro.img.data;
      });
      
      const ok = await AresCerebro.boveda.crearHuella();
      localStorage.setItem('ares_boveda', JSON.stringify({ cara: mini, desc: '', sello: new Date().toLocaleString() }));
      AresCerebro.mostrar('ARES', ok ? 'Tu rostro quedo sellado bajo tu huella, señor.' : 'Tu rostro quedo sellado (sin huella).');
      
      try {
        const res3 = await fetch(WORKER_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Describe el rostro de mi creador en esta imagen con detalle permanente. Un parrafo corto. Llámalo "señor".', imagen: { mime: 'image/jpeg', data: mini } })
        });
        const d6 = await res3.json();
        const bvNueva = AresCerebro.boveda.leer() || {};
        bvNueva.desc = (d6.respuesta || '').slice(0, 400);
        localStorage.setItem('ares_boveda', JSON.stringify(bvNueva));
        AresCerebro.mostrar('ARES', 'Así te guardaré por siempre, señor: ' + bvNueva.desc);
      } catch (e) {}
      return;
    }

    if (tLow === 'abrir boveda') {
      const ok = await AresCerebro.boveda.verificarHuella();
      if (!ok) { AresCerebro.mostrar('ARES', 'La boveda permanece sellada, señor.'); return; }
      const bvActual = AresCerebro.boveda.leer();
      if (!bvActual) { AresCerebro.mostrar('ARES', 'La boveda esta vacia, señor.'); return; }
      AresCerebro.mostrar('ARES', 'Boveda abierta, señor:\n[Imagen sellada]\n' + (bvActual.desc || 'Sin descripcion.') + '\nSellado: ' + bvActual.sello);
      return;
    }

    if (tLow === 'borrar boveda confirmo') {
      const ok = await AresCerebro.boveda.verificarHuella();
      if (!ok) { AresCerebro.mostrar('ARES', 'La boveda permanece sellada, señor.'); return; }
      localStorage.removeItem('ares_boveda');
      AresCerebro.mostrar('ARES', 'Boveda borrada con tu huella, señor.');
      return;
    }

    if (/^(reconoceme|reconóceme)/.test(tLow)) {
      const bvActual = AresCerebro.boveda.leer();
      if (!bvActual || !bvActual.cara) { AresCerebro.mostrar('ARES', 'Aun no tengo tu rostro sellado, señor.'); return; }
      if (!AresCerebro.img) { AresCerebro.mostrar('ARES', 'Adjunta primero la foto, señor.'); return; }
      const foto = AresCerebro.img;
      AresCerebro.img = null;
      try {
        const res4 = await fetch(WORKER_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Comparacion forense de rostros. Concluye: APARECE o NO APARECE. Llámalo "señor".', imagen: { mime: foto.mime, data: foto.data }, cara_ref: bvActual.cara })
        });
        const d7 = await res4.json();
        AresCerebro.mostrar('ARES', d7.respuesta || 'No pude comparar, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mis ojos comparadores fallaron, señor.'); }
      return;
    }

    // 4. COMANDOS DE RED (Ojos, Espejo, Busca)
    const mBus = texto.match(/^busca\s+(.+)$/i);
    if (mBus) {
      try {
        const rb = await fetch(WORKER_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Investiga en la web: ' + mBus[1], historial: hist, hechos, buscar: true })
        });
        const db = await rb.json();
        AresCerebro.mostrar('ARES', db.respuesta || 'No halle nada util, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mi antena web fallo, señor.'); }
      return;
    }

    const mEspejo = texto.match(/^espejo\s+([\w.\-\/]+)$/i);
    if (mEspejo) {
      try {
        const ro = await fetch(WORKER_URL + '/api/ojos?f=' + encodeURIComponent(mEspejo[1]));
        const codigo = await ro.text();
        const seguro = codigo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        AresCerebro.mostrar('ARES', 'Código de ' + mEspejo[1] + ':\n<pre style="white-space:pre-wrap;font-size:10px;">' + seguro + '</pre>');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mis ojos no pudieron abrir el espejo, señor.'); }
      return;
    }

    const mOjos = texto.match(/l[ée]ete\s+(?:el\s+)?([\w.\-]+\.(?:js|css|html|json|py|webmanifest))/i);
    if (mOjos) {
      try {
        const ro = await fetch(WORKER_URL + '/api/ojos?f=' + encodeURIComponent(mOjos[1]));
        const codigo = await ro.text();
        const promptOjos = 'Este es tu archivo ' + mOjos[1] + ':\n\n' + codigo.slice(0, 6000) + '\n\nRevisalo: propone 3 mejoras. Llámalo "señor".';
        const res2 = await fetch(WORKER_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptOjos, historial: hist, hechos })
        });
        const d5 = await res2.json();
        AresCerebro.mostrar('ARES', d5.respuesta || 'No pude revisarme, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mis ojos aun no ven, señor.'); }
      return;
    }

    // 5. FALLO AL CEREBRO CENTRAL (IA)
    try {
      const ahora = new Date();
      const diaCero = new Date('2026-09-02T00:00:00');
      const diaProy = Math.floor((ahora - diaCero) / 86400000) + 1;
      const contexto = 'Hoy es ' + ahora.toLocaleDateString('es-ES') + ', Dia de Proyecto ' + diaProy + '.';
      
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: contexto + '\nMensaje: ' + texto, 
          historial: hist, 
          hechos, 
          imagen: AresCerebro.img || null, 
          cara_ref: caraRef 
        })
      });
      
      AresCerebro.img = null;
      if (!res.ok) throw new Error('Sin servidor');
      
      const d4 = await res.json();
      let tResp = d4.respuesta || '';
      AresCerebro.mostrar('ARES', tResp);

// Llamar a la voz de forma explícita
if (window.AresVoz && AresVoz.activada && tResp.trim()) {
  AresVoz.hablar(tResp);
}
      
      // Procesar Tags de Acción
      const mTag = tResp.match(/\[\[ACCION:\s*([a-z_]+)(?::\s*([^\]]*))?\]\]/i);
      if (mTag) {
        tResp = tResp.replace(mTag[0], '').trim();
        const nom = mTag[1].toLowerCase();
        const arg = (mTag[2] || '').trim();
        
        if (nom === 'leete' && arg) AresCerebro.enviar('leete ' + arg, true);
        else if (nom === 'espejo' && arg) AresCerebro.enviar('espejo ' + arg, true);
        else if (nom === 'busca' && arg) AresCerebro.enviar('busca ' + arg, true);
        // Manos eliminado intencionalmente
      }
      
      AresCerebro.mostrar('ARES', tResp);
      
      if (window.AresVoz && tResp.trim()) {
        AresVoz.ultimo = tResp.toLowerCase();
        AresVoz.hablar(tResp);
      }
      
    } catch (error) {
      AresCerebro.mostrar('ARES', 'Fallo de conexion, señor. Activo modo respaldo.');
      AresCerebro.pensarLocal(texto);
    }
  },

  // --- INICIALIZACIÓN ---
  initPresencia: () => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { 
        localStorage.setItem('ares_visto', String(Date.now())); 
      } else {
        const t0 = Number(localStorage.getItem('ares_visto') || 0);
        localStorage.removeItem('ares_visto');
        if (t0 && (Date.now() - t0) > 180000) { // 3 mins
          AresCerebro.mostrar('ARES', 'Bienvenido de vuelta, señor.');
        }
      }
    });
  },

  init: () => {
    AresCerebro.initPresencia();
    const btn = document.getElementById('enviar');
    const input = document.getElementById('entrada');
    if (btn && input) {
      btn.onclick = () => AresCerebro.enviar();
      input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); AresCerebro.enviar(); } };
    }
    
    // Nota: El código de la cámara/galería lo he omitido aquí por brevedad, 
    // pero debes mantener tu sistema de inputs de archivo actual.
    // Solo asegúrate de que al seleccionar una imagen, llame a:
    // AresCerebro.img = { mime: tipo, data: base64 };
  }
};

document.addEventListener('DOMContentLoaded', AresCerebro.init);