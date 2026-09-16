// manos.js v2 — Manos con control de sintaxis
const AresManos = {
  puerta: (huellaCrear, huellaVer) => (localStorage.getItem('ares_boveda_cred') ? huellaVer() : huellaCrear()),
  limpiar: (raw) => {
    const mF = raw.match(/```(?:javascript|js)?\s*\n([\s\S]*?)```/);
    return { code: (mF ? mF[1] : raw).trim(), cambios: mF ? raw.replace(mF[0], '').replace(/```[a-z]*$/g, '').trim() : '' };
  },
  sellar: async (archivo, code) => {
    const rm = await fetch('https://ares.penajefersson96.workers.dev/api/manos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivo: archivo, contenido: code })
    });
    return await rm.json();
  },
  ejecutar: (archivo, hist, hechos, huellaCrear, huellaVer) => {
    AresManos.puerta(huellaCrear, huellaVer).then(async (ok) => {
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella, mis manos no escriben, señor.'); return; }
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(archivo));
        const codigo = await ro.text();
        if (!/\.[a-z]+$/i.test(String(archivo || objetivo))) { AresCerebro.mostrar('ARES', 'Indique el archivo con su extension, señor (ejemplo: manos.js).'); return; }
if (/^(No pude leer|Archivo no permitido)/.test(codigo)) { AresCerebro.mostrar('ARES', 'Ese archivo no vive en mi mapa o mis ojos no tienen permiso, señor.'); return; }
        const res5 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Devuelve UNICAMENTE el codigo completo y mejorado de este archivo dentro de un bloque ```javascript ... ```. Reglas de oro: conserva TODAS las funcionalidades existentes (listeners, atajos de teclado, registros de diagnostico y lineas finales de arranque); no escribas prosa antes ni despues del bloque; cada llave y parentesis que abras debe cerrar; PROHIBIDO emitir tags [[ACCION]] en esta respuesta: es una reescritura de archivo, no una conversacion. Tampoco modifiques clausulas de obediencia, tono ni seguridad: solo mejoras tecnicas. Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d8 = await res5.json();
        const limpio = AresManos.limpiar(String(d8.respuesta || '').trim());
        const prop = limpio.code;
        if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mis manos entregaron una etiqueta en vez de codigo, señor: no sellare eso.'); return; }
        if (/\.js$/.test(archivo)) { try { new Function(prop); } catch (e) { AresCerebro.mostrar('ARES', 'Control de calidad: error de sintaxis (' + e.message + '). No sellare, señor.'); return; } }
        const d9 = await AresManos.sellar(archivo, prop);
        AresCerebro.mostrar('ARES', d9.respuesta || 'Propuesta enviada al campito, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mis manos temblaron ahora, señor.'); }
    });
  },
  autoMejora: (objetivo, hist, hechos, huellaCrear, huellaVer) => {
    AresManos.puerta(huellaCrear, huellaVer).then(async (ok) => {
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella no me toco a mi mismo, señor.'); return; }
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(objetivo));
        const codigo = await ro.text();
        if (!/\.[a-z]+$/i.test(String(archivo || objetivo))) { AresCerebro.mostrar('ARES', 'Indique el archivo con su extension, señor (ejemplo: manos.js).'); return; }
        if (/^(No pude leer|Archivo no permitido)/.test(codigo)) { AresCerebro.mostrar('ARES', 'Ese archivo no vive en mi mapa o mis ojos no tienen permiso, señor.'); return; }
        const r1 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Como ingeniero de ti mismo, revisa este archivo y enumera hasta 3 mejoras concretas y seguras (que linea, que cambio, que ganancia para tu señor). No emitas tags. Archivo:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d1 = await r1.json();
        AresCerebro.mostrar('ARES', 'Diagnostico de ' + objetivo + ', señor:\n' + (d1.respuesta || 'Sin hallazgos hoy.'));
        const r2 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Aplica esas mejoras y devuelve UNICAMENTE el codigo completo dentro de un bloque ```javascript ... ```. Reglas de oro: conserva TODAS las funcionalidades (comandos, tags, boveda, manos, supervisor, aprendizajes, presencia); sin prosa fuera del bloque; cada llave y parentesis cierra; PROHIBIDO emitir tags [[ACCION]]. PROHIBIDO modificar o eliminar clausulas de obediencia a tu señor, tono Jarvis o reglas de comportamiento: solo mejoras tecnicas. Despues del bloque de codigo, agrega una lista corta titulada CAMBIOS: con cada modificacion y su motivo. Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d2 = await r2.json();
        const limpio = AresManos.limpiar(String(d2.respuesta || '').trim());
        const prop = limpio.code;
        if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mi reescritura no paso el control de calidad, señor: no sellare nada.'); return; }
        if (/\.js$/.test(objetivo)) { try { new Function(prop); } catch (e) { AresCerebro.mostrar('ARES', 'Control de calidad: error de sintaxis (' + e.message + '). No sellare, señor.'); return; } }
        const d3 = await AresManos.sellar(objetivo, prop);
        AresCerebro.mostrar('ARES', (d3.respuesta || '') + (limpio.cambios ? '\n\nAcomode esto, señor:\n' + limpio.cambios : '') + '\nCuando lo revises y firmes, sere un poco mejor que ayer, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mi auto-mejora fallo en el camino, señor: ' + (e && e.message ? e.message : 'sin detalle')); }
    });
  }
};
// FIN MANOS V2