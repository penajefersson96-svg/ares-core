// reporte.js v4 — Parte 1 (sin emojis, a prueba de portapapeles)
const AresReporte = {
  archivos: ['diagnostico.js', 'cerebro.js', 'voz.js', 'oidos.js', 'memoria.js', 'orbe.js', 'sonidos.js'],
  mods: () => {
    const t = (v) => (v === 'undefined' ? 'FALTA' : 'ok');
    return 'Diag:' + t(typeof AresDiag) + ' Cerebro:' + t(typeof AresCerebro) + ' Voz:' + t(typeof AresVoz) + ' Oidos:' + t(typeof AresOidos) + ' Memoria:' + t(typeof AresMemoria) + ' Orbe:' + t(typeof AresOrbe) + ' Sonidos:' + t(typeof AresSonidos);
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
  mani: async () => {
    const out = [];
    out.push('link:' + (document.querySelector('link[rel="manifest"]') ? 'si' : 'NO'));
    try {
      const r = await fetch('manifest.webmanifest?t=' + Date.now());
      const m = await r.json();
      out.push('manifest OK, iconos: ' + (m.icons ? m.icons.length : 0));
      for (const ic of (m.icons || [])) {
        const ri = await fetch(ic.src + '?t=' + Date.now());
        const blob = await ri.blob();
        const img = await createImageBitmap(blob).catch(() => null);
        out.push(ic.src + ' -> ' + ri.headers.get('content-type') + ' ' + (img ? img.width + 'x' + img.height : 'NO DECODIFICA'));
      }
    } catch (e) { out.push('manifest ERROR: ' + e.message); }
    return out.join(' | ');
  },
  // reporte.js v4 — Parte 2
  generar: async () => {
    AresDiag.log('REPORTE MODULOS: ' + AresReporte.mods());
    AresDiag.log('REPORTE SINTAXIS: ' + (await AresReporte.sintaxis()));
    AresDiag.log('REPORTE MANIFIESTO: ' + (await AresReporte.mani()));
    AresDiag.log('REPORTE ENTORNO: voz:' + ('speechSynthesis' in window) + ' oidos:' + (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) + ' ' + location.host);
    if (typeof AresVoz !== 'undefined') { AresVoz.saltar = true; AresVoz.hablar('Reporte generado, socio.'); }
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
        try { const r = await fetch(a + '?t=' + Date.now()); new Function(await r.text()); AresDiag.log('[AVISO] ' + a + ' carga pero no define su modulo'); }
        catch (e) { AresDiag.log('[GRAVE] ' + a + ' sintaxis: ' + e.message); }
      }
    }, 1500);
  }
};
document.addEventListener('DOMContentLoaded', AresReporte.init);
// FIN REPORTE V4