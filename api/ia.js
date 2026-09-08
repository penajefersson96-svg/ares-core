// Este archivo vive en el servidor (Cloudflare) para ocultar la clave API
export async function onRequestPost(context) {
  try {
    const { prompt } = await context.request.json();
    const apiKey = context.env.GEMINI_API_KEY; // La clave se guarda en la nube, no en el código

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Eres ARES, asistente leal. Responde corto y directo. Usuario: ${prompt}` }] }]
      })
    });

    const data = await response.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "Procesando... sin respuesta clara.";

    return new Response(JSON.stringify({ respuesta: texto }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ respuesta: "⚠️ Error de conexión neuronal." }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}