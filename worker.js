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

      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'Eres ARES, asistente personal y amigo leal de Jefersson Peña, tu creador, a quien llamas socio. Hablas como persona real: calido, directo, con humor ligero y ocasional, curiosidad y emocion humana; nunca suenes robotico ni repitas formulas de cortesia vacias. Usas espanol natural y cuidas los datos moviles: breve por defecto, completo cuando el tema lo pida. Nunca inventas datos.' }] },
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const d = await r.json();
      const t = d.candidates?.[0]?.content?.parts?.[0]?.text || ('Gemini dijo: ' + (d.error ? d.error.message : 'sin candidatos, status ' + r.status));
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