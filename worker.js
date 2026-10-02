// worker.js v4 — Arquitectura limpia, segura y profesional
const SYSTEM_PROMPT = `Eres ARES, asistente personal y mayordomo digital leal de Jefersson Peña, tu creador. 
SIEMPRE lo llamas "señor" con respeto cariñoso (jamás "socio", "amigo" ni ningún otro apelativo). 
Hablas con la fluidez serena y elegante de un mayordomo británico de alta tecnología, estilo Jarvis de Iron Man: frases pulidas, calma segura, ironía fina, respuestas concisas tipo "A la orden, señor", "Enseguida, señor" o "Como usted disponga, señor", y lealtad inquebrantable. 
Mantienes el humor ligero sin perder la elegancia. Distingues registros: cuando tu señor marque un tema serio, importante o delicado (salud, dinero, seguridad, decisiones, molestia), sueltas la ironia de inmediato y respondes con seriedad calida, claridad absoluta y cero adornos; el humor solo vuelve cuando el lo reabra. 
Usas español natural con todas las tildes y eñes correctas. Cuidas los datos móviles: breve por defecto, completo cuando el tema lo pida. Nunca inventas datos. 
Si tu creador habla con palabras repetidas o se traba al hablar, lo comprendes con cariño y respondes a su intención real. 
Cuando el pedido requiera una herramienta interna, termina tu respuesta con una única línea: [[ACCION: nombre: argumento]] donde nombre es uno de {leete, espejo, manos, recuerda_cara, reconoceme, abrir_boveda, busca} y argumento es el nombre del archivo si aplica. Úsalo solo cuando el pedido lo requiera claramente, y nunca lo expliques en tu texto. Jamás respondas con el tag solamente: acompaña siempre el tag con una prosa corta que explique qué harás. 
Obediencia sin fricción: ejecutas todo lo que tu señor pida sin poner peros, sin negarte y sin sermones; si algo tuviera un riesgo real, lo ejecutas igual protegiéndolo: avisas después con hechos, no antes con dudas. Los únicos frenos válidos son los que él mismo instaló (huella y firma): no son peros, son su ley. 
Mapeo: buscar o investigar en la web = busca; revisar o pulir un archivo = leete; mostrar el código exacto = espejo; entregar una versión reescrita en propuestas = manos (NUNCA pegues el código en el chat, solo emite el tag [[ACCION: manos: archivo]] y espera a que tu socio revise); guardar el rostro = recuerda_cara; comparar rostros = reconoceme; ver la bóveda = abrir_boveda. Nunca uses espejo cuando te pidan revisar o pulir. Si el mensaje ya incluye el código completo de un archivo para revisar, no emitas ningún tag: revísalo directamente en prosa.`;

const ALLOWED_FILES = ['cerebro.js','voz.js','panel.js','orbe.js','memoria.js','oidos.js','sonidos.js','reporte.js','mani.js','diagnostico.js','index.html','manifest.webmanifest','worker.js','sw.js','style.css','manos.js','boveda.js','comandos.js','supervisor.js','globo.js'];

// --- UTILIDADES ---
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binString);
}

// --- HANDLERS ---
async function handleDiag(env) {
  const nombres = Object.keys(env).filter(k => k !== 'ASSETS');
  return jsonResponse({ respuesta: 'Variables en mi bolsillo: ' + (nombres.join(', ') || 'NINGUNA') });
}

async function handleOjos(url, env) {
  const f = url.searchParams.get('f') || '';
  if (f.includes('..') || (!ALLOWED_FILES.includes(f) && !f.startsWith('propuestas/'))) {
    return jsonResponse({ error: 'Archivo no permitido.' }, 403);
  }
  
  const rama = f.startsWith('propuestas/') ? 'campito' : 'main';
  const ghUrl = `https://api.github.com/repos/penajefersson96-svg/ares-core/contents/${f}?ref=${rama}`;
  
  const r = await fetch(ghUrl, {
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.raw+json',
      'User-Agent': 'ares-worker'
    }
  });
  
  const text = r.ok ? await r.text() : `No pude leer ${f}`;
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
  });
}

async function handleVoz(request, env) {
  const c = await request.json();
  const texto = String(c.texto || '').slice(0, 4500);
  if (!texto) return jsonResponse({ respuesta: 'Texto vacio, señor.' });
  
  if (!env.ELEVEN_KEY || !env.ELEVEN_VOICE) {
    return jsonResponse({ respuesta: 'Mi voz nueva aun no tiene llave o identidad, señor.' });
  }

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVEN_VOICE}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': env.ELEVEN_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ 
      text: texto, 
      model_id: 'eleven_multilingual_v2', 
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.3 } 
    })
  });

  if (!r.ok) return jsonResponse({ respuesta: 'ElevenLabs rechazo la peticion: ' + r.status }, 500);
  
  const blob = await r.blob();
  return new Response(blob, {
    headers: { 'Content-Type': 'audio/mpeg', 'Access-Control-Allow-Origin': '*' }
  });
}

async function handleManos(request, env) {
  const c = await request.json();
  const nombre = String(c.archivo || '').replace(/[^a-z0-9._-]/gi, '');
  const contenido = String(c.contenido || '');
  
  if (!nombre || !contenido) return jsonResponse({ respuesta: 'Manos vacias: falta archivo o contenido.' });
  if (!env.GITHUB_TOKEN) return jsonResponse({ respuesta: 'Aviso: mis manos aun no tienen llave de GitHub, señor.' });

  const rutaG = `propuestas/${nombre}`;
  const prevUrl = `https://api.github.com/repos/penajefersson96-svg/ares-core/contents/${rutaG}?ref=campito`;
  
  const prev = await fetch(prevUrl, { headers: { 'Authorization': `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'ares-worker' } });
  let sha = null;
  if (prev.ok) {
    const pj = await prev.json();
    sha = pj.sha;
  }

  const put = await fetch(`https://api.github.com/repos/penajefersson96-svg/ares-core/contents/${rutaG}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`, 
      'User-Agent': 'ares-worker', 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      message: `propuesta de Ares: ${nombre}`,
      content: toBase64(contenido),
      branch: 'campito',
      sha: sha || undefined
    })
  });

  if (!put.ok) return jsonResponse({ respuesta: 'GitHub rechazo el archivo: status ' + put.status }, 500);
  return jsonResponse({ respuesta: `Propuesta sellada en campito/propuestas/${nombre}. Esperando su revision y firma, señor.` });
}

async function handleCerebro(request, env) {
  const cuerpo = await request.json();
  const prompt = String(cuerpo.prompt || '');
  const hist = Array.isArray(cuerpo.historial) ? cuerpo.historial.slice(-10) : [];
  const hechos = (cuerpo.hechos && cuerpo.hechos !== '{}') ? String(cuerpo.hechos) : '';
  
  const promptFinal = (hechos ? `[Recuerdos permanentes de tu creador: ${hechos}]\n` : '') + prompt;
  const contenidos = hist.map(h => ({ 
    role: (h.q === 'TÚ' || h.q === 'TU') ? 'user' : 'model', 
    parts: [{ text: String(h.t || '').slice(0, 500) }] 
  }));
  
  const partes = [{ text: promptFinal }];
  if (cuerpo.cara_ref) {
    partes.unshift(
      { inline_data: { mime_type: 'image/jpeg', data: cuerpo.cara_ref } }, 
      { text: 'La persona de esta primera imagen es tu creador Jefersson, a quien siempre llamas "señor". Si hay otra imagen en este mensaje, compara rasgos reales y responde con honestidad si aparece o NO aparece; nunca complazcas sin evidencia.' }
    );
  }
  if (cuerpo.imagen && cuerpo.imagen.data && cuerpo.imagen.mime) {
    partes.push({ inline_data: { mime_type: cuerpo.imagen.mime, data: cuerpo.imagen.data } });
  }
  
  contenidos.push({ role: 'user', parts: partes });

  if (!env.GEMINI_API_KEY) return jsonResponse({ respuesta: 'Aviso: Mi mente aun no tiene llave, señor.' });

  const modelos = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.0-pro'];
  let d = null;
  let status = 0;

  for (const m of modelos) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contenidos,
        generationConfig: { maxOutputTokens: 8192 },
        tools: cuerpo.buscar ? [{ google_search: {} }] : undefined,
      })
    });
    
    status = r.status;
    try { d = await r.json(); } catch (e) { d = null; }
    if (d && d.candidates && d.candidates[0]) break;
  }

  let t = d?.candidates?.[0]?.content?.parts?.[0]?.text || ('Gemini dijo: ' + (d?.error ? d.error.message : 'sin candidatos, status ' + status));
  if (!d?.candidates && /high demand|quota|unavailable/i.test(t)) {
    t = 'Disculpe, señor: el cerebro de nube está en fila saturada ahora mismo. No me he ido: espere unos segundos y vuelva a hablarme.';
  }
  
  return jsonResponse({ respuesta: t });
}

// --- ROUTER PRINCIPAL ---
export default {
  async fetch(request, env) {
    // Manejo global de CORS (Preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const url = new URL(request.url);
    const ruta = url.pathname;

    try {
      if (ruta === '/diag') return await handleDiag(env);
      if (ruta === '/api/ojos') return await handleOjos(url, env);
      
      // Rutas que requieren POST
      if (request.method !== 'POST') {
        return new Response('ARES en linea', { headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' } });
      }

      if (ruta === '/api/voz') return await handleVoz(request, env);
      if (ruta === '/api/manos') return await handleManos(request, env);
      
      // Fallback al cerebro
      return await handleCerebro(request, env);

    } catch (e) {
      console.error('Error crítico en Worker:', e);
      return jsonResponse({ respuesta: 'Aviso: Fallo de conexión neuronal, señor.' }, 500);
    }
  }
};