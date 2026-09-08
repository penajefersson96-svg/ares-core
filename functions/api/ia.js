// functions/api/ia.js — Mente real de Ares (Cloudflare Pages)
export async function onRequestPost(context) {
  try {
    const { prompt } = await context.request.json();
    const key = context.env.GEMINI_API_KEY;
    if (!key) return Reply('⚠️ Mi mente aun no tiene llave.');
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'Eres ARES, asistente personal leal a Jefersson Peña, tu creador. Responde en español, corto, directo y cuidando los datos moviles.' }] },
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const d = await r.json();
    const t = d.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar eso.';
    return Reply(t);
  } catch (e) {
    return Reply('⚠️ Fallo de conexion neuronal.');
  }
}
function Reply(t) {
  return new Response(JSON.stringify({ respuesta: t }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}