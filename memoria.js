// memoria.js — Fase 6: Memoria de largo plazo de Ares
const AresMemoria = {
  clave: 'ares_memoria',

  leer: () => JSON.parse(localStorage.getItem(AresMemoria.clave) || '[]'),

  guardar: (dato) => {
    const m = AresMemoria.leer();
    m.push(dato);
    localStorage.setItem(AresMemoria.clave, JSON.stringify(m.slice(-30)));
    AresVoz.saltar = true;
    AresVoz.hablar('Guardado en mi memoria: ' + dato);
  },

  repasar: () => {
    const m = AresMemoria.leer();
    const txt = m.length ? m.join(' | ') : 'Aun no guardo nada sobre ti, socio.';
    AresDiag.log('🧠 Memoria: ' + txt);
    AresVoz.saltar = true;
    AresVoz.hablar(m.length ? 'Recuerdo esto: ' + txt : 'Aun no guardo nada sobre ti.');
  },

  olvidar: () => {
    localStorage.removeItem(AresMemoria.clave);
    AresVoz.saltar = true;
    AresVoz.hablar('He borrado mi memoria. Empezamos de cero.');
  },

  init: () => {
    const original = AresCerebro.mostrar;
    AresCerebro.mostrar = (quien, msg) => {
      original(quien, msg);
      if (quien === 'TÚ') {
        const t = msg.toLowerCase().trim();
        if (t.startsWith('recuerda ')) {
          const dato = msg.trim().slice(8).replace(/^(que|:)\s*/i, '').trim();
          if (dato) AresMemoria.guardar(dato);
        }
        else if (t === 'memoria' || t.includes('que recuerdas')) AresMemoria.repasar();
        else if (t === 'olvida todo') AresMemoria.olvidar();
      }
    };
    AresDiag.log('🧠 Módulo de memoria activado.');
  }
};
document.addEventListener('DOMContentLoaded', AresMemoria.init);