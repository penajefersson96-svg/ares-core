// worker.js — Mente de Ares (tarjeta de personalidad nueva)
export default {
  async fetch(request, env) {
    const ruta = new URL(request.url).pathname;

    if (ruta === '/diag') {
      const nombres = Object.keys(env).filter(k => k !== 'ASSETS');
      return Reply('Variables en mi bolsillo: ' + (nombres.join(', ') || 'NINGUNA'));
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
      const { prompt } = await request.json();
      const key = env.GEMINI_API_KEY;
      if (!key) return Reply('⚠️ Mi mente aun no tiene llave.');

      const modelos = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.5-flash']; 
      let d = null;
      let status = 0;
      for (const m of modelos) {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: 'Eres ARES, asistente personal y amigo leal de Jefersson Peña, tu creador, a quien llamas socio. Hablas como persona real: calido, directo, con humor ligero y ocasional, curiosidad y emocion humana; nunca suenes robotico. Usas espanol natural y cuidas los datos moviles: breve por defecto, completo cuando el tema lo pida. Nunca inventas datos. Si tu creador habla con palabras repetidas o se traba al hablar, comprendelo con carino y responde a su intencion real.' }] },
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        status = r.status;
        d = await r.json();
        if (d.candidates && d.candidates[0]) break;
      }
      const t = d.candidates?.[0]?.content?.parts?.[0]?.text || ('Gemini dijo: ' + (d.error ? d.error.message : 'sin candidatos, status ' + status));
      return Reply(t);
    } catch (e) {
      return Reply('⚠️ Fallo de conexion neuronal.');
    }
  }
};

function Reply(t) {
  return new Response(JSON.stringify({ respuesta: t }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}