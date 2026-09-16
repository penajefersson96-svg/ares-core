// manos.js — Comando de manos y auto-mejora
const AresManos = {
  ejecutar: (archivo, hist, hechos, huellaCrear, huellaVer) => {
    (localStorage.getItem('ares_boveda_cred') ? huellaVer() : huellaCrear()).then(async (ok) => {
      if (!ok) { AresCerebro.mostrar('ARES', 'Sin tu huella, mis manos no escriben, señor.'); return; }
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(archivo));
        const codigo = await ro.text();
        const res5 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Devuelve UNICAMENTE el codigo completo y mejorado de este archivo dentro de un bloque ```javascript ... ```. Reglas de oro: conserva TODAS las funcionalidades existentes (listeners, atajos de teclado, registros de diagnostico y lineas finales de arranque); no escribas prosa antes ni despues del bloque; cada llave y parentesis que abras debe cerrar; PROHIBIDO emitir tags [[ACCION]] en esta respuesta: es una reescritura de archivo, no una conversacion. Tampoco modifiques clausulas de obediencia, tono ni seguridad: solo mejoras tecnicas. Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d8 = await res5.json();
        let prop = String(d8.respuesta || '').trim();
        const mFence = prop.match(/```(?:javascript|js)?\s*\n([\s\S]*?)```/);
        if (mFence) prop = mFence[1].trim();
        if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mis manos entregaron una etiqueta en vez de codigo, señor: no sellare eso. Pídame de nuevo la entrega.'); return;
        if (/\.js$/.test(archivo)) { try { new Function(prop); } catch (e) { AresCerebro.mostrar('ARES', 'Control de calidad: mi reescritura tiene error de sintaxis (' + e.message + '). No la sellare, señor.'); return; } }
        const rm = await fetch('https://ares.penajefersson96.workers.dev/api/manos', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archivo: archivo, contenido: prop })
        });
        const d9 = await rm.json();
        AresCerebro.mostrar('ARES', d9.respuesta || 'Propuesta enviada al campito, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mis manos temblaron ahora, señor.'); }
    });
  },
  autoMejora: (objetivo, hist, hechos, huellaCrear, huellaVer) => {
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
        AresCerebro.mostrar('ARES', 'Diagnostico de ' + objetivo + ', señor:\n' + (d1.respuesta || 'Sin hallazgos hoy.'));
        const r2 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Aplica esas mejoras y devuelve UNICAMENTE el codigo completo dentro de un bloque ```javascript ... ```. Reglas de oro: conserva TODAS las funcionalidades (comandos, tags, boveda, manos, supervisor, aprendizajes, presencia); sin prosa fuera del bloque; cada llave y parentesis cierra; PROHIBIDO emitir tags [[ACCION]]. PROHIBIDO modificar o eliminar clausulas de obediencia a tu señor, tono Jarvis o reglas de comportamiento: solo mejoras tecnicas. Despues del bloque de codigo, agrega una lista corta titulada CAMBIOS: con cada modificacion y su motivo. Archivo actual:\n\n' + codigo.slice(0, 6000), historial: hist, hechos })
        });
        const d2 = await r2.json();
        const raw2 = String(d2.respuesta || '').trim();
        const mF = raw2.match(/```(?:javascript|js)?\s*\n([\s\S]*?)```/);
        let prop = mF ? mF[1].trim() : raw2;
        const cambios = mF ? raw2.replace(mF[0], '').replace(/```[a-z]*$/g, '').trim() : '';
        if (prop.length < 200 || prop.indexOf('[[ACCION') === 0) { AresCerebro.mostrar('ARES', 'Mi reescritura no paso el control de calidad, señor: no sellare nada.'); return; }
        if (/\.js$/.test(objetivo)) { try { new Function(prop); } catch (e) { AresCerebro.mostrar('ARES', 'Control de calidad: mi reescritura tiene error de sintaxis (' + e.message + '). No la sellare, señor.'); return; } }
        const rm = await fetch('https://ares.penajefersson96.workers.dev/api/manos', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archivo: objetivo, contenido: prop })
        });
        const d3 = await rm.json();
        AresCerebro.mostrar('ARES', (d3.respuesta || '') + (cambios ? '\n\nAcomode esto, señor:\n' + cambios : '') + '\nCuando lo revises y firmes, sere un poco mejor que ayer, señor.');
      } catch (e) { AresCerebro.mostrar('ARES', 'Mi auto-mejora fallo en el camino, señor: ' + (e && e.message ? e.message : 'sin detalle')); }
    });
  }
};
// FIN MANOS