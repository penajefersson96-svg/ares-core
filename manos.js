// manos.js v9 — cirugia por parches: nunca mas reescrituras ciegas
const AresManos = {
  puerta: (huellaCrear, huellaVer) => {
    try { return localStorage.getItem('ares_boveda_cred') ? huellaVer() : huellaCrear(); } catch (e) { return huellaCrear(); }
  },
  tope: () => {
    try {
      const w = !!(navigator.connection && navigator.connection.type === 'wifi');
      return w ? 200000 : 6000;
    } catch (e) { return 6000; }
  },
  fetchT: async (url, opts, ms) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms || 120000);
    try { return await fetch(url, Object.assign({}, opts, { signal: ctl.signal })); } finally { clearTimeout(t); }
  },
  jsonSeguro: (r) => r.json().catch(() => ({})),
  validar: (nombre, codigo) => {
    if (!/\.[a-z0-9]+$/i.test(nombre)) return 'Indique el archivo con su extension, señor (ejemplo: manos.js).';
    if (/^(No pude leer|Archivo no permitido)/.test(codigo)) return 'Ese archivo no vive en mi mapa o mis ojos no tienen permiso sobre el, señor.';
    return null;
  },
  cuarentena: (prop, e) => {
    try { localStorage.setItem('ares_cuarentena', String(prop).slice(0, 50000)); } catch (e2) {}
    AresCerebro.mostrar('ARES', 'Control de calidad: error de sintaxis (' + (e && e.message ? e.message : 'sin detalle') + '). Lo fallido quedo en cuarentena local para revision del doc. No sellare, señor.');
  },
  parchear: (code, raw) => {
    const re = /\/\/PARCHE-INICIO\n([\s\S]*?)\n\/\/PARCHE-MEDIO\n([\s\S]*?)\n\/\/PARCHE-FIN/g;
    let m, aplicados = 0, fallidos = 0;
    while ((m = re.exec(raw)) !== null) {
      const viejo = m[1].trim();
      const nuevo = m[2].trim();
      if (viejo && code.indexOf(viejo) >= 0) { code = code.replace(viejo, nuevo); aplicados++; }
      else { fallidos++; }
    }
    return { code: code, aplicados: aplicados, fallidos: fallidos };
  },
  chequeo: (prop) => {
    try { new Function(prop); return true; } catch (e) { AresManos.cuarentena(prop, e); return false; }
  },
  marcoParches: 'Devuelve como maximo 3 parches quirurgicos y nada mas. Formato exacto de cada parche:\n//PARCHE-INICIO\n<lineas viejas EXACTAS tal como estan en el archivo>\n//PARCHE-MEDIO\n<lineas nuevas que las reemplazan>\n//PARCHE-FIN\nNo reescribas el archivo completo: solo los fragmentos que cambian. Copia las lineas viejas byte por byte para que coincidan. ',
  reglas: 'No modifiques clausulas de obediencia, tono ni seguridad: solo mejoras tecnicas. PROHIBIDO emitir tags [[ACCION]]. ',
  operar: async (objetivo, diagnostico, hist, hechos) => {
    const ro = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(objetivo));
    const codigo = await ro.text();
    const corte = AresManos.tope();
    if (codigo.length > corte) { AresCerebro.mostrar('ARES', 'Este archivo pesa mas de lo que puedo operar con datos moviles, señor: conecte wifi.'); return; }
    const fallo = AresManos.validar(objetivo, codigo);
    if (fallo) { AresCerebro.mostrar('ARES', fallo); return; }
    const extra = diagnostico ? 'Aplica exactamente estas mejoras diagnosticadas: ' + diagnostico + '. ' : 'Aplica hasta 3 mejoras tecnicas seguras que detectes. ';
    const r2 = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: extra + AresManos.marcoParches + AresManos.reglas + ' Archivo actual COMPLETO:\n\n' + codigo, historial: hist, hechos })
    });
    const d2 = await AresManos.jsonSeguro(r2);
    const res = AresManos.parchear(codigo, String(d2.respuesta || ''));
    if (res.aplicados === 0) { AresCerebro.mostrar('ARES', 'Mis parches no coincidieron con el archivo, señor: no selle nada. Puedo reintentar con otro diagnostico.'); return; }
    if (/\.js$/.test(objetivo) && !AresManos.chequeo(res.code)) return;
    const d3 = await AresManos.sellar(objetivo, res.code);
    AresCerebro.mostrar('ARES', (d3.respuesta || '') + '\nParches aplicados: ' + res.aplicados + ' | sin coincidencia: ' + res.fallidos + '. Cuando lo revises y firmes, sere un poco mejor que ayer, señor.');
  },
  ejecutar: (archivo, hist, hechos, huellaCrear, huellaVer) => {
    AresManos.puerta(huellaCrear, huellaVer).then(async (ok) => {
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella, mis manos no escriben, señor.'); return; }
      try { await AresManos.operar(archivo, '', hist, hechos); } catch (e) { AresCerebro.mostrar('ARES', 'Mis manos temblaron ahora, señor: ' + (e && e.message ? e.message : 'sin detalle')); }
    });
  },
  autoMejora: (objetivo, hist, hechos, huellaCrear, huellaVer) => {
    AresManos.puerta(huellaCrear, huellaVer).then(async (ok) => {
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella no me toco a mi mismo, señor.'); return; }
      try {
        const ro = await AresManos.fetchT('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(objetivo));
        const codigo = await ro.text();
        const r1 = await AresManos.fetchT('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Como ingeniero de ti mismo, revisa este archivo y enumera hasta 3 mejoras concretas y seguras (que lineas exactas, que cambio, que ganancia para tu señor). No emitas tags. Archivo:\n\n' + codigo.slice(0, AresManos.tope()), historial: hist, hechos })
        });
        const d1 = await AresManos.jsonSeguro(r1);
        const diag = String(d1.respuesta || '');
        AresCerebro.mostrar('ARES', 'Diagnostico de ' + objetivo + ', señor:\n' + (diag || 'Sin hallazgos hoy.'));
        await AresManos.operar(objetivo, diag, hist, hechos);
      } catch (e) { AresCerebro.mostrar('ARES', 'Mi auto-mejora fallo en el camino, señor: ' + (e && e.message ? e.message : 'sin detalle')); }
    });
  }
};
window.AresManos = AresManos;
// FIN MANOS V9