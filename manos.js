// manos.js v10.1 — manos quirúrgicas corregidas y blindadas
const AresManos = {
  puerta: async (huellaCrear, huellaVer) => {
    try {
      const existe = !!localStorage.getItem('ares_boveda_cred');
      return existe ? await huellaVer() : await huellaCrear();
    } catch (e) {
      return await huellaCrear();
    }
  },
  
  tope: () => {
    try {
      const w = !!(navigator.connection && navigator.connection.type === 'wifi');
      return w ? 200000 : 6000;
    } catch (e) { return 6000; }
  },
  
  fetchT: async (url, opts, ms) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms || 240000);
    try {
      return await fetch(url, Object.assign({}, opts, { signal: ctl.signal }));
    } finally {
      clearTimeout(t);
    }
  },
  
  jsonSeguro: async (r) => {
    try { return await r.json(); } catch (e) { return {}; }
  },
  
  validar: (nombre, codigo) => {
    if (!/\.[a-z0-9]+$/i.test(nombre)) return 'Indique el archivo con su extensión, señor (ejemplo: manos.js).';
    if (/^(No pude leer|Archivo no permitido)/.test(codigo)) return 'Ese archivo no vive en mi mapa o mis ojos no tienen permiso sobre él, señor.';
    return null;
  },
  
  cuarentena: (prop, e) => {
    try { localStorage.setItem('ares_cuarentena', String(prop).slice(0, 50000)); } catch (e2) {}
    AresCerebro.mostrar('ARES', 'Control de calidad: error de sintaxis (' + (e && e.message ? e.message : 'sin detalle') + '). Lo fallido quedó en cuarentena local para revisión. No sellaré, señor.');
  },
  
  parchear: (code, raw) => {
    if (!raw || typeof raw !== 'string') return { code: code, aplicados: 0, fallidos: 0 };
    let codigoLimpio = String(code).replace(/\r\n/g, '\n');
    const re = /\/\/PARCHE-INICIO\n([\s\S]*?)\n\/\/PARCHE-MEDIO\n([\s\S]*?)\n\/\/PARCHE-FIN/g;
    let m, aplicados = 0,
      fallidos = 0;
    
    while ((m = re.exec(raw)) !== null) {
      const viejo = m[1].replace(/\r\n/g, '\n');
      const nuevo = m[2].replace(/\r\n/g, '\n');
      if (viejo && codigoLimpio.includes(viejo)) {
        codigoLimpio = codigoLimpio.split(viejo).join(nuevo);
        aplicados++;
      } else {
        fallidos++;
      }
    }
    return { code: codigoLimpio, aplicados: aplicados, fallidos: fallidos };
  },
  
  chequeo: (prop) => {
    try {
      new Function(prop);
      return true;
    } catch (e) {
      AresManos.cuarentena(prop, e);
      return false;
    }
  },
  
  sellar: async (archivo, code) => {
    const rm = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/manos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivo: archivo, contenido: code })
    });
    if (!rm.ok) throw new Error('HTTP ' + rm.status);
    return await rm.json();
  },
  
  marcoParches: 'Devuelve como máximo 3 parches quirúrgicos y nada más. Formato exacto de cada parche:\n//PARCHE-INICIO\n<líneas viejas EXACTAS tal como están en el archivo>\n//PARCHE-MEDIO\n<líneas nuevas que las reemplazan>\n//PARCHE-FIN\nNo reescribas el archivo completo: solo los fragmentos que cambian. Copia las líneas viejas byte por byte para que coincidan. ',
  reglas: 'No modifiques cláusulas de obediencia, tono ni seguridad: solo mejoras técnicas. PROHIBIDO emitir tags [[ACCION]]. ',
  
  operar: async (objetivo, diagnostico, hist, hechos) => {
    const ro = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(objetivo));
    if (!ro.ok) { AresCerebro.mostrar('ARES', 'No pude leer el archivo objetivo desde los ojos, señor.'); return; }
    
    const codigo = await ro.text();
    const corte = AresManos.tope();
    if (codigo.length > corte) { AresCerebro.mostrar('ARES', 'Este archivo pesa más de lo que puedo operar con datos móviles, señor: conecte wifi.'); return; }
    
    const fallo = AresManos.validar(objetivo, codigo);
    if (fallo) { AresCerebro.mostrar('ARES', fallo); return; }
    
    const extra = diagnostico ? 'Aplica exactamente estas mejoras diagnosticadas: ' + diagnostico + '. ' : 'Aplica hasta 3 mejoras técnicas seguras que detectes. ';
    const r2 = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: extra + AresManos.marcoParches + AresManos.reglas + ' Archivo actual COMPLETO:\n\n' + codigo, historial: hist, hechos })
    });
    
    const d2 = await AresManos.jsonSeguro(r2);
    const res = AresManos.parchear(codigo, String(d2.respuesta || ''));
    
    if (res.aplicados === 0) {
      AresCerebro.mostrar('ARES', 'Mis parches no coincidieron con el archivo, señor: no sellé nada. Puedo reintentar con otro diagnóstico.');
      return;
    }
    
    if (/\.js$/.test(objetivo) && !AresManos.chequeo(res.code)) return;
    
    try {
      const d3 = await AresManos.sellar(objetivo, res.code);
      AresCerebro.mostrar('ARES', (d3.respuesta || '') + '\nParches aplicados: ' + res.aplicados + ' | sin coincidencia: ' + res.fallidos + '. Cuando lo revises y firmes, seré un poco mejor que ayer, señor.');
    } catch (e) {
      AresCerebro.mostrar('ARES', 'No pude sellar el archivo, señor: ' + (e && e.message ? e.message : 'error de red o permisos.'));
    }
  },
  
  ejecutar: async (archivo, hist, hechos, huellaCrear, huellaVer) => {
    try {
      const ok = await AresManos.puerta(huellaCrear, huellaVer);
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella, mis manos no escriben, señor.'); return; }
      await AresManos.operar(archivo, '', hist, hechos);
    } catch (e) {
      AresCerebro.mostrar('ARES', 'Mis manos temblaron ahora, señor: ' + (e && e.message ? e.message : 'sin detalle'));
    }
  },
  
  autoMejora: async (objetivo, hist, hechos, huellaCrear, huellaVer) => {
    try {
      const ok = await AresManos.puerta(huellaCrear, huellaVer);
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella no me toco a mí mismo, señor.'); return; }
      
      const ro = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(objetivo));
      if (!ro.ok) { AresCerebro.mostrar('ARES', 'No pude leer el objetivo para automejora, señor.'); return; }
      
      const codigo = await ro.text();
      const r1 = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Como ingeniero de ti mismo, revisa este archivo y enumera hasta 3 mejoras concretas y seguras (qué líneas exactas, qué cambio, qué ganancia para tu señor). No emitas tags. Archivo:\n\n' + codigo.slice(0, AresManos.tope()), historial: hist, hechos })
      });
      
      const d1 = await AresManos.jsonSeguro(r1);
      const diag = String(d1.respuesta || '');
      AresCerebro.mostrar('ARES', 'Diagnóstico de ' + objetivo + ', señor:\n' + (diag || 'Sin hallazgos hoy.'));
      await AresManos.operar(objetivo, diag, hist, hechos);
    } catch (e) {
      AresCerebro.mostrar('ARES', 'Mi auto-mejora falló en el camino, señor: ' + (e && e.message ? e.message : 'sin detalle'));
    }
  }
};

window.AresManos = AresManos;