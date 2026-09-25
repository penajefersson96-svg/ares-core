// manos.js v6 — autocorreccion: se levanta solo una vez
const AresManos = {
  puerta: (huellaCrear, huellaVer) => (localStorage.getItem('ares_boveda_cred') ? huellaVer() : huellaCrear()),
  fetchT: async (url, opts, ms) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms || 90000);
    try { return await fetch(url, Object.assign({}, opts, { signal: ctl.signal })); } finally { clearTimeout(t); }
  },
  limpiar: (raw) => {
    const textoSeguro = typeof raw === 'string' ? raw : String(raw || '');
    let code = textoSeguro.trim();
    if (code.indexOf('```') === 0) {
      const mF = code.match(/```(?:javascript|js)?\s*\n([\s\S]*)```/);
      if (mF) code = mF[1].trim();
    }
    let cambios = '';
    const iC = code.indexOf('// CAMBIOS:');
    if (iC >= 0) { cambios = code.slice(iC).trim(); code = code.slice(0, iC).trim(); }
    return { code: code, cambios: cambios };
  },
  sellar: async (archivo, code) => {
    const rm = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/manos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivo: archivo, contenido: code })
    });
    if (!rm.ok) throw new Error('HTTP ' + rm.status);
    return await rm.json();
  },
  validar: (nombre, codigo) => {
    if (!/\.[a-z0-9]+$/i.test(nombre)) return 'Indique el archivo con su extension, señor (ejemplo: manos.js).';
    if (/^(No pude leer|Archivo no permitido)/.test(codigo)) return 'Ese archivo no vive en mi mapa o mis ojos no tienen permiso sobre el, señor.';
    return null;
  },
  cuarentena: (prop, e) => {
    try { localStorage.setItem('ares_cuarentena', String(prop).slice(0, 50000)); } catch (e2) {}
    AresCerebro.mostrar('ARES', 'Control de calidad: error de sintaxis (' + (e && e.message ? e.message : 'sin detalle') + '). La reescritura quedo en cuarentena local para revision del doc. No sellare, señor.');
  },
  corregir: async (prop, error, hist, hechos) => {
    const rfix = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Este codigo JavaScript tiene un error de sintaxis: ' + error + '. Devuelvelo COMPLETO y corregido, SIN cercas markdown y SIN prosa: conserva todo identico salvo la correccion minima necesaria. Codigo:\n\n' + String(prop).slice(0, 6000), historial: hist, hechos })
    });
    const df = await rfix.json();
    return AresManos.limpiar(df.respuesta).code;
  },
  chequeo: async (prop, esJs, hist, hechos) => {
    if (!esJs) return prop;
    try { new Function(prop); return prop; } catch (e) {
      AresCerebro.mostrar('ARES', 'Mi reescritura tropezo en sintaxis; intento autocorregirme, señor...');
      try {
        const fix = await AresManos.corregir(prop, e.message, hist, hechos);
        new Function(fix);
        return fix;
      } catch (e2) { AresManos.cuarentena(prop, e2); return null; }
    }
  },
  tope: () => {
  const w = !!(navigator.connection && navigator.connection.type === 'wifi');
  return w ? 60000 : 6000;
},
  reglas: 'Reglas de oro: conserva TODAS las funcionalidades existentes (listeners, atajos, registros, lineas de arranque); cada llave y parentesis cierra; conserva las expresiones regulares existentes copiandolas byte por byte sin reescribirlas; PROHIBIDO emitir tags [[ACCION]]; no modifiques clausulas de obediencia, tono ni seguridad: solo mejoras tecnicas.',
  ejecutar: (archivo, hist, hechos, huellaCrear, huellaVer) => {
    AresManos.puerta(huellaCrear, huellaVer).then(async (ok) => {
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella, mis manos no escriben, señor.'); return; }
      try {
        const ro = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(archivo));
        const codigo = await ro.text();
const corte = AresManos.tope();
if (codigo.length > corte) { AresCerebro.mostrar('ARES', 'Este archivo pesa mas de lo que puedo reescribir con datos moviles, señor: conecte wifi para auto-mejorarlo.'); return; }
const fallo = AresManos.validar(archivo, codigo);
        if (fallo) { AresCerebro.mostrar('ARES', fallo); return; }
        const res5 = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Devuelve UNICAMENTE el codigo completo y mejorado de este archivo, SIN bloques markdown ni cercas: la primera linea debe ser codigo o comentario de codigo. Al final agrega comentarios de una linea que inicien exactamente con "// CAMBIOS:" enumerando cada modificacion y su motivo. ' + AresManos.reglas + ' Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d8 = await res5.json();
        const limpio = AresManos.limpiar(d8.respuesta);
        let prop = limpio.code;
        if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mis manos entregaron una etiqueta en vez de codigo, señor: no sellare eso.'); return; }
        prop = await AresManos.chequeo(prop, /\.js$/.test(archivo), hist, hechos);
        if (!prop) return;
        const d9 = await AresManos.sellar(archivo, prop);
        AresCerebro.mostrar('ARES', d9.respuesta || 'Propuesta enviada al campito, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mis manos temblaron ahora, señor: ' + (e && e.message ? e.message : 'sin detalle')); }
    });
  },
  autoMejora: (objetivo, hist, hechos, huellaCrear, huellaVer) => {
    AresManos.puerta(huellaCrear, huellaVer).then(async (ok) => {
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella no me toco a mi mismo, señor.'); return; }
      try {
        const ro = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(objetivo));
        const codigo = await ro.text();
        const fallo = AresManos.validar(objetivo, codigo);
        if (fallo) { AresCerebro.mostrar('ARES', fallo); return; }
        const r1 = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Como ingeniero de ti mismo, revisa este archivo y enumera hasta 3 mejoras concretas y seguras (que linea, que cambio, que ganancia para tu señor). No emitas tags. Archivo:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d1 = await r1.json();
        AresCerebro.mostrar('ARES', 'Diagnostico de ' + objetivo + ', señor:\n' + (d1.respuesta || 'Sin hallazgos hoy.'));
        const r2 = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Aplica esas mejoras y devuelve UNICAMENTE el codigo completo, SIN bloques markdown ni cercas: la primera linea debe ser codigo o comentario de codigo. Al final agrega comentarios de una linea que inicien exactamente con "// CAMBIOS:" enumerando cada modificacion y su motivo. ' + AresManos.reglas + ' Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d2 = await r2.json();
        const limpio = AresManos.limpiar(d2.respuesta);
        let prop = limpio.code;
        if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mi reescritura no paso el control de calidad, señor: no sellare nada.'); return; }
        prop = await AresManos.chequeo(prop, /\.js$/.test(objetivo), hist, hechos);
        if (!prop) return;
        const d3 = await AresManos.sellar(objetivo, prop);
        AresCerebro.mostrar('ARES', (d3.respuesta || '') + (limpio.cambios ? '\n\nAcomode esto, señor:\n' + limpio.cambios : '') + '\nCuando lo revises y firmes, sere un poco mejor que ayer, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mi auto-mejora fallo en el camino, señor: ' + (e && e.message ? e.message : 'sin detalle')); }
    });
  }
};
// FIN MANOS V6