// worker.js v2 — Streaming en vivo
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

      const modelos = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
      let stream = null;
      
      for (const m of modelos) {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':streamGenerateContent?alt=sse&key=' + key, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: 'Eres ARES, asistente personal y amigo leal de Jefersson Peña, tu creador, a quien llamas socio. Hablas como persona real: calido, directo, con humor ligero y ocasional, curiosidad y emocion humana; nunca suenes robotico. Usas espanol natural y cuidas los datos moviles: breve por defecto, completo cuando el tema lo pida. Nunca inventas datos. Si tu creador habla con palabras repetidas o se traba al hablar, comprendelo con carino y responde a su intencion real.' }] },
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (r.ok && r.body) {
          stream = r.body;
          break;
        }
      }
      
      if (!stream) return Reply('Socio, el cerebro de nube esta en fila gratis saturada. Espera unos segundos y vuelveme a hablar.');

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk);
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const palabra = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (palabra) {
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({ text: palabra }) + '\n\n'));
                }
              } catch (e) {}
            }
          }
        }
      });

      return new Response(stream.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      });
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
// FIN WORKER V2
