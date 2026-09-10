// worker.js v1-restaurado-bis — comilla fantasma eliminada
export default {
  async fetch(request, env) {
    const ruta = new URL(request.url).pathname;

    if (ruta === '/diag') {
      const nombres = Object.keys(env).filter(k => k !== 'ASSETS');
      return Reply('Variables en mi bolsillo: ' + (nombres.join(', ') || 'NINGUNA'));
    }

    if (ruta === '/api/ojos') {
      const f = new URL(request.url).searchParams.get('f') || '';
      const lista = ['cerebro.js','voz.js','panel.js','orbe.js','memoria.js','oidos.js','sonidos.js','reporte.js','mani.js','diagnostico.js','index.html','manifest.webmanifest','worker.js'];
      if (!lista.includes(f)) return new Response('Archivo no permitido.', { headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' } });
      const r = await fetch('https://raw.githubusercontent.com/penajefersson96-svg/ares-core/main/' + f);
      const t = r.ok ? await r.text() : 'No pude leer ' + f;
      return new Response(t, { headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' } });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('ARES en linea', { headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' } });
    }

    try {
      const cuerpo = await request.json();
      const prompt = String(cuerpo.prompt || '');
      const hist = Array.isArray(cuerpo.historial) ? cuerpo.historial.slice(-10) : [];
      const hechos = (cuerpo.hechos && cuerpo.hechos !== '{}') ? String(cuerpo.hechos) : '';
      const promptFinal = (hechos ? '[Recuerdos permanentes de tu socio: ' + hechos + ']\n' : '') + prompt;
      const contenidos = hist.map(h => ({ role: (h.q === 'TÚ' || h.q === 'TU') ? 'user' : 'model', parts: [{ text: String(h.t || '').slice(0, 500) }] }));
      contenidos.push({ role: 'user', parts: [{ text: promptFinal }] });
      const key = env.GEMINI_API_KEY;
      if (!key) return Reply('Aviso: Mi mente aun no tiene llave.');

      const modelos = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
      let d = null;
      let status = 0;
      for (const m of modelos) {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: 'Eres ARES, asistente personal y amigo leal de Jefersson Pena, tu creador, a quien llamas socio. Hablas como persona real: calido, directo, con humor ligero y ocasional, curiosidad y emocion humana; nunca suenes robotico. Usas espanol natural y cuidas los datos moviles: breve por defecto, completo cuando el tema lo pida. Nunca inventas datos. Si tu creador habla con palabras repetidas o se traba al hablar, comprendelo con carino y responde a su intencion real.' }] },
            contents: contenidos,
          })
        });
        status = r.status;
        try { d = await r.json(); } catch (e) { d = null; }
        if (!d) continue;
        if (d.candidates && d.candidates[0]) break;
      }
      let t = d.candidates?.[0]?.content?.parts?.[0]?.text || ('Gemini dijo: ' + (d.error ? d.error.message : 'sin candidatos, status ' + status));
      if (!d.candidates && /high demand|quota|unavailable/i.test(t)) t = 'Socio, el cerebro de nube esta en fila gratis saturada ahora mismo. No me fui: espera unos segundos y vuelveme a hablar.';
      return Reply(t);
    } catch (e) {
      return Reply('Aviso: Fallo de conexion neuronal.');
    }
  }
};

function Reply(t) {
  return new Response(JSON.stringify({ respuesta: t }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
// FIN WORKER BIS