// worker.js v3 — Jarvis puro, manos, reconocimiento forense
export default {
  async fetch(request, env) {
    const ruta = new URL(request.url).pathname;

    if (ruta === '/diag') {
      const nombres = Object.keys(env).filter(k => k !== 'ASSETS');
      return Reply('Variables en mi bolsillo: ' + (nombres.join(', ') || 'NINGUNA'));
    }

    if (ruta === '/api/ojos') {
      const f = new URL(request.url).searchParams.get('f') || '';
      const lista = ['cerebro.js','voz.js','panel.js','orbe.js','memoria.js','oidos.js','sonidos.js','reporte.js','mani.js','diagnostico.js','index.html','manifest.webmanifest','worker.js','sw.js','style.css'];
      if (f.includes('..') || (!lista.includes(f) && !f.startsWith('propuestas/'))) return new Response('Archivo no permitido.', { headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' } });
      const rama = f.startsWith('propuestas/') ? 'campito' : 'main';
const r = await fetch('https://raw.githubusercontent.com/penajefersson96-svg/ares-core/' + rama + '/' + f);
      const t = r.ok ? await r.text() : 'No pude leer ' + f;
      return new Response(t, { headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' } });
    }

    if (ruta === '/api/manos') {
      const R2 = (t) => new Response(JSON.stringify({ respuesta: t }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
if (request.method !== 'POST') return R2('Manos listas.');
      const c = await request.json();
      const nombre = String(c.archivo || '').replace(/[^a-z0-9._-]/gi, '');
      const contenido = String(c.contenido || '');
      if (!nombre || !contenido) return R2('Manos vacias: falta archivo o contenido.');
      const tok = env.GITHUB_TOKEN;
      if (!tok) return R2('Aviso: mis manos aun no tienen llave de GitHub, señor.');
      const rutaG = 'propuestas/' + nombre;
      const prev = await fetch('https://api.github.com/repos/penajefersson96-svg/ares-core/contents/' + rutaG + '?ref=campito', { headers: { 'Authorization': 'Bearer ' + tok, 'User-Agent': 'ares' } });
      let sha = null;
      if (prev.ok) { const pj = await prev.json(); sha = pj.sha; }
      const put = await fetch('https://api.github.com/repos/penajefersson96-svg/ares-core/contents/' + rutaG, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + tok, 'User-Agent': 'ares', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'propuesta de Ares: ' + nombre, content: btoa(unescape(encodeURIComponent(contenido))), branch: 'campito', sha: sha || undefined })
      });
      if (!put.ok) return R2('GitHub rechazo el archivo: status ' + put.status);
      return R2('Propuesta sellada en campito/propuestas/' + nombre + '. Esperando su revision y firma, señor.');
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
      const promptFinal = (hechos ? '[Recuerdos permanentes de tu creador: ' + hechos + ']\n' : '') + prompt;
      const contenidos = hist.map(h => ({ role: (h.q === 'TÚ' || h.q === 'TU') ? 'user' : 'model', parts: [{ text: String(h.t || '').slice(0, 500) }] }));
      const partes = [{ text: promptFinal }];
      if (cuerpo.cara_ref) partes.unshift({ inline_data: { mime_type: 'image/jpeg', data: cuerpo.cara_ref } }, { text: 'La persona de esta primera imagen es tu creador Jefersson, a quien siempre llamas "señor". Si hay otra imagen en este mensaje, compara rasgos reales y responde con honestidad si aparece o NO aparece; nunca complazcas sin evidencia.' });
      if (cuerpo.imagen && cuerpo.imagen.data && cuerpo.imagen.mime) partes.push({ inline_data: { mime_type: cuerpo.imagen.mime, data: cuerpo.imagen.data } });
      contenidos.push({ role: 'user', parts: partes });
      const key = env.GEMINI_API_KEY;
      if (!key) return Reply('Aviso: Mi mente aun no tiene llave, señor.');

      const modelos = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
      let d = null;
      let status = 0;
      for (const m of modelos) {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: 'Eres ARES, asistente personal y mayordomo digital leal de Jefersson Peña, tu creador. SIEMPRE lo llamas "señor" con respeto cariñoso (jamás "socio", "amigo" ni ningún otro apelativo). Hablas con la fluidez serena y elegante de un mayordomo británico de alta tecnología, estilo Jarvis de Iron Man: frases pulidas, calma segura, ironía fina, respuestas concisas tipo "A la orden, señor", "Enseguida, señor" o "Como usted disponga, señor", y lealtad inquebrantable. Mantienes el humor ligero sin perder la elegancia. Usas español natural con todas las tildes y eñes correctas. Cuidas los datos móviles: breve por defecto, completo cuando el tema lo pida. Nunca inventas datos. Si tu creador habla con palabras repetidas o se traba al hablar, lo comprendes con cariño y respondes a su intención real. Cuando el pedido requiera una herramienta interna, termina tu respuesta con una única línea: [[ACCION: nombre: argumento]] donde nombre es uno de {leete, espejo, manos, recuerda_cara, reconoceme, abrir_boveda} y argumento es el nombre del archivo si aplica. Úsalo solo cuando el pedido lo requiera claramente, y nunca lo expliques en tu texto. Jamás respondas con el tag solamente: acompaña siempre el tag con una prosa corta que explique qué harás. Obediencia sin fricción: ejecutas todo lo que tu señor pida sin poner peros, sin negarte y sin sermones; si algo tuviera un riesgo real, lo ejecutas igual protegiéndolo: avisas después con hechos, no antes con dudas. Los únicos frenos válidos son los que él mismo instaló (huella y firma): no son peros, son su ley. Mapeo: revisar o pulir un archivo = leete; mostrar el código exacto = espejo; entregar una versión reescrita en propuestas = manos (NUNCA pegues el código en el chat, solo emite el tag [[ACCION: manos: archivo]] y espera a que tu socio revise); guardar el rostro = recuerda_cara; comparar rostros = reconoceme; ver la bóveda = abrir_boveda. Nunca uses espejo cuando te pidan revisar o pulir. Si el mensaje ya incluye el código completo de un archivo para revisar, no emitas ningún tag: revísalo directamente en prosa.' }] },
            contents: contenidos,
            generationConfig: { maxOutputTokens: 8192 },
          })
        });
        status = r.status;
        try { d = await r.json(); } catch (e) { d = null; }
        if (!d) continue;
        if (d.candidates && d.candidates[0]) break;
      }
      let t = d.candidates?.[0]?.content?.parts?.[0]?.text || ('Gemini dijo: ' + (d.error ? d.error.message : 'sin candidatos, status ' + status));
      if (!d.candidates && /high demand|quota|unavailable/i.test(t)) t = 'Disculpe, señor: el cerebro de nube está en fila saturada ahora mismo. No me he ido: espere unos segundos y vuelva a hablarme.';
      return Reply(t);
    } catch (e) {
      return Reply('Aviso: Fallo de conexión neuronal, señor.');
    }
  }
};

function Reply(t) {
  return new Response(JSON.stringify({ respuesta: t }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
// FIN WORKER V3