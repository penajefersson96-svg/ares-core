// reporte.js — Ares se autodiagnostica y reporta a su creador
const AresReporte = {
  archivos: ['diagnostico.js', 'cerebro.js', 'voz.js', 'oidos.js', 'memoria.js', 'orbe.js'],
  mods: () => ['AresDiag', 'AresCerebro', 'AresVoz', 'AresOidos', 'AresMemoria', 'AresOrbe']
    .map(n => n.replace('Ares', '') + ':' + (typeof window[n] === 'undefined' ? 'FALTA' : 'ok')).join(' '),
  sintaxis: async () => {
    const out = [];
    for (const a of AresReporte.archivos) {
      try {
        const r = await fetch(a + '?t=' + Date.now());
        if (!r.ok) { out.push(a + ': no existe'); continue; }
        new Function(await r.text());
        out.push(a + ': OK');
      } catch (e) { out.push(a + ': ERROR ' + e.message); }
    }
    return out.join(' | ');
  },
  generar: async () => {
    AresDiag.log('📋 MODULOS → ' + AresReporte.mods());
    AresDiag.log('📋 SINTAXIS → ' + (await AresReporte.sintaxis()));
    AresDiag.log('📋 ENTORNO → voz:' + ('speechSynthesis' in window) + ' oidos:' + (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) + ' ' + location.host);
    if (window.AresVoz) { AresVoz.saltar = true; AresVoz.hablar('Reporte generado, socio. Pasaselo a mi creador.'); }
  },
  init: () => {
    if (window.AresCerebro) {
      const original = AresCerebro.mostrar;
      AresCerebro.mostrar = (quien, msg) => {
        original(quien, msg);
        if (quien === 'TÚ' && msg.toLowerCase().trim() === 'reporte') AresReporte.generar();
      };
    }
    setTimeout(async () => {
      const faltan = ['AresCerebro', 'AresVoz', 'AresOidos', 'AresMemoria', 'AresOrbe'].filter(n => typeof window[n] === 'undefined');
      for (const n of faltan) {
        const a = n.replace('Ares', '').toLowerCase() + '.js';
        try { const r = await fetch(a + '?t=' + Date.now()); new Function(await r.text()); AresDiag.log('⚠️ ' + a + ' carga pero no define ' + n); }
        catch (e) { AresDiag.log('🚨 ' + a + ' sintaxis: ' + e.message); }
      }
    }, 1500);
    AresDiag.log('📋 Escribe "reporte" para ver mi parte medico.');
  }
};
document.addEventListener('DOMContentLoaded', AresReporte.init);