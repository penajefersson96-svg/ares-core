// cerebro.js v3 — streaming + voz por frases
const AresCerebro = {
  mostrar: (quien, msg) => {
    const chat = document.getElementById('chat');
    const p = document.createElement('p');
    p.innerHTML = '<strong>' + quien + ':</strong> ' + msg;
    p.style.color = quien === 'ARES' ? '#fff' : '#888';
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
  },
  pensarLocal: (texto) => {
    texto = texto.toLowerCase();
    let respuesta = 'Modo entrenamiento: Mi mente real se activara al desplegar el proyecto en la nube.';
    if (texto.includes('hola')) respuesta = 'Hola socio. Sistemas operativos al 100%.';
    else if (texto.includes('estado')) respuesta = 'Memoria estable. Diagnostico activo. Esperando nucleo neuronal.';
    else if (texto.includes('futuro')) respuesta = 'Visualizo una interfaz holografica y aprendizaje autonomo, socio.';
    AresCerebro.mostrar('ARES', respuesta);
  },
  enviar: async () => {
    const input = document.getElementById('entrada');
    const texto = input.value.trim();
    if (!texto) return;
    AresCerebro.mostrar('TÚ', texto);
    input.value = '';
    input.blur();
    try {
      const res = await fetch('https://ares.penajefersson96.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: texto })
      });
      if (!res.ok) throw new Error('Sin servidor');
      const chat = document.getElementById('chat');
      const p = document.createElement('p');
      p.innerHTML = '<strong>ARES:</strong> ';
      p.style.color = '#fff';
      chat.appendChild(p);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let frase = '';
      let full = '';
      while (true) {
        const r2 = await reader.read();
        if (r2.done) break;
        buffer += decoder.decode(r2.value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                p.innerHTML += data.text;
                full += data.text;
                frase += data.text;
                const m2 = frase.match(/[^.!?…\n]+[.!?…]+/);
                if (m2 && window.AresVoz) { AresVoz.frag(m2[0]); frase = frase.slice(m2[0].length); }
                chat.scrollTop = chat.scrollHeight;
              }
            } catch (e) {}
          }
        }
      }
      if (frase.trim() && window.AresVoz) AresVoz.frag(frase);
      if (window.AresVoz) AresVoz.ultimo = full.toLowerCase();
    } catch (error) {
      AresCerebro.pensarLocal(texto);
    }
  },
  init: () => {
    const input = document.getElementById('entrada');
    const btn = document.getElementById('enviar');
    if (btn && input) {
      btn.onclick = AresCerebro.enviar;
      input.onkeydown = (e) => { if (e.key === 'Enter') AresCerebro.enviar(); };
    }
  }
};
document.addEventListener('DOMContentLoaded', AresCerebro.init);
// FIN CEREBRO V3
