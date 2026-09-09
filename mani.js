// mani.js — radiografia del manifiesto e iconos
const AresMani = {
  init: async () => {
    const out = [];
    out.push('link:' + (document.querySelector('link[rel="manifest"]') ? 'si' : 'NO'));
    try {
      const r = await fetch('manifest.webmanifest?t=' + Date.now());
      const m = await r.json();
      out.push('iconos:' + (m.icons ? m.icons.length : 0));
      for (const ic of (m.icons || [])) {
        const ri = await fetch(ic.src + '?t=' + Date.now());
        const blob = await ri.blob();
        const img = await createImageBitmap(blob).catch(() => null);
        out.push(ic.src + ':' + ri.headers.get('content-type') + ':' + (img ? img.width + 'x' + img.height : 'NODECODIFICA'));
      }
    } catch (e) { out.push('ERROR:' + e.message); }
    AresDiag.log('MANIFIESTO → ' + out.join(' | '));
  }
};
document.addEventListener('DOMContentLoaded', AresMani.init);