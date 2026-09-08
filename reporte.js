// reporte.js v2 — medico sin falsas alarmas
const AresReporte = {
  archivos: ['diagnostico.js', 'cerebro.js', 'voz.js', 'oidos.js', 'memoria.js', 'orbe.js'],
  mods: () => {
    const t = (v) => (v === 'undefined' ? 'FALTA' : 'ok');
    return 'Diag:' + t(typeof AresDiag) + ' Cerebro:' + t(typeof AresCerebro) + ' Voz:' + t(typeof AresVoz) + ' Oidos:' + t(typeof AresOidos) + ' Memoria:' + t(typeof AresMemoria) + ' Orbe:' + t(typeof AresOrbe);
  },
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
    if (typeof AresVoz !== 'undefined') { AresVoz.saltar = true; AresVoz.hablar('Reporte generado, socio. Pasaselo a mi creador.'); }
  },
  init: () => {
    if (typeof AresCerebro !== 'undefined') {
      const original = AresCerebro.mostrar;
      AresCerebro.mostrar = (quien, msg) => {
        original(quien, msg);
        if (quien === 'TÚ' && msg.toLowerCase().trim() === 'reporte') AresReporte.generar();
      };
    }
    setTimeout(async () => {
      const faltan = [];
      if (typeof AresCerebro === 'undefined') faltan.push('cerebro.js');
      if (typeof AresVoz === 'undefined') faltan.push('voz.js');
      if (typeof AresOidos === 'undefined') faltan.push('oidos.js');
      if (typeof AresMemoria === 'undefined') faltan.push('memoria.js');
      if (typeof AresOrbe === 'undefined') faltan.push('orbe.js');
      for (const a of faltan) {
        try { const r = await fetch(a + '?t=' + Date.now()); new Function(await r.text()); AresDiag.log('⚠️ ' + a + ' carga pero no define su modulo'); }
        catch (e) { AresDiag.log('🚨 ' + a + ' sintaxis: ' + e.message); }
      }
      
    }, 1500);
    
  }
};
document.addEventListener('DOMContentLoaded', AresReporte.init);