// cerebro.js v5 — Memoria Real v1 (hilo de conversacion)
const AresCerebro = {
  HIST: 'ares_historial',
  leerHist: () => { try { return JSON.parse(localStorage.getItem(AresCerebro.HIST)) || []; } catch (e) { return []; } },
  recordar: (quien, t) => {
    const h = AresCerebro.leerHist();
    h.push({ q: quien, t: String(t).slice(0, 600) });
    while (h.length > 24) h.shift();
    localStorage.setItem(AresCerebro.HIST, JSON.stringify(h));
  },
  mostrar: (quien, msg) => {
    const chat = document.getElementById('chat');
    const p = document.createElement('p');
    p.innerHTML = '<strong>' + quien + ':</strong> ' + String(msg).replace(/\n/g, '<br>');
    p.style.color = quien === 'ARES' ? '#fff' : '#888';
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
    if (quien === 'TÚ' || quien === 'ARES') AresCerebro.recordar(quien, msg);
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
    const hist = AresCerebro.leerHist().slice(-10);
    let hechos = '';
    try { if (window.AresMemoria) hechos = JSON.stringify(AresMemoria.hechos || AresMemoria.datos || AresMemoria.memoria || {}); } catch (e) {}
    AresCerebro.mostrar('TÚ', texto);
    input.value = '';
    input.blur();
    const mEspejo = texto.match(/^espejo\s+([\w.\-]+)$/i);
    if (mEspejo) {
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(mEspejo[1]));
        const codigo = await ro.text();
        const lineas = codigo.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
        const seguro = lineas.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const chat = document.getElementById('chat');
        const p = document.createElement('p');
        p.innerHTML = '<strong>ARES (espejo fiel):</strong><br><pre style="white-space:pre-wrap;word-break:break-word;font-size:10px;color:#9ff;background:rgba(0,20,30,.7);padding:6px;border:1px solid rgba(0,255,255,.3);">' + seguro + '</pre>';
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
      } catch (e) {
        AresCerebro.mostrar('ARES', 'Mis ojos no pudieron abrir el espejo.');
      }
      return;
    }
    const mOjos = texto.match(/l[ée]ete\s+(?:el\s+)?([\w.\-]+\.(?:js|css|html|json|py|webmanifest))/i);
    if (mOjos) {
      try {
        const ro = await fetch('https://ares.penajefersson96.workers.dev/api/ojos?f=' + encodeURIComponent(mOjos[1]));
        const codigo = await ro.text();
        const promptOjos = 'Este es tu archivo actual ' + mOjos[1] + ':\n\n' + codigo.slice(0, 6000) + '\n\nRevisalo como ingeniero de ti mismo: propone hasta 3 mejoras concretas (que linea, que cambio, por que). Breve y sin inventar.';
        const res2 = await fetch('https://ares.penajefersson96.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptOjos, historial: hist, hechos })
        });
        const d5 = await res2.json();
        AresCerebro.mostrar('ARES', d5.respuesta || 'No pude revisarme ahora.');
      } catch (e) {
        AresCerebro.mostrar('ARES', 'Mis ojos aun no ven, socio: revisa el despliegue.');
      }
      return;
    }
    try {
      const hilo = hist.map(h => h.q + ': ' + h.t).join('\n');
        const promptCompleto = (hilo ? 'Conversacion reciente entre tu socio y tu:\n' + hilo + '\n\n' : '') + (hechos && hechos !== '{}' ? 'Recuerdos permanentes: ' + hechos + '\n\n' : '') + 'Mensaje nuevo de tu socio: ' + texto;
      const res = await fetch('https://ares.penajefersson96.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptCompleto, historial: hist, hechos })
      });
      if (!res.ok) throw new Error('Sin servidor');
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const d4 = await res.json();
        AresCerebro.mostrar('ARES', d4.respuesta);
        return;
      }
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
      let hablo = false;
      const decir = (t) => { if (window.AresVoz && AresVoz.frag) { try { AresVoz.frag(t); hablo = true; } catch (e) {} } };
      const pintar = (t) => { p.innerHTML += t; full += t; frase += t; const m2 = frase.match(/[^.!?…\n]+[.!?…]+/); if (m2) { decir(m2[0]); frase = frase.slice(m2[0].length); } chat.scrollTop = chat.scrollHeight; };
      while (true) {
        const r2 = await reader.read();
        if (r2.done) break;
        buffer += decoder.decode(r2.value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try { const data = JSON.parse(line.slice(6)); if (data.text) pintar(data.text); } catch (e) {}
          }
        }
      }
      if (buffer.startsWith('data: ')) {
        try { const d3 = JSON.parse(buffer.slice(6)); if (d3.text) pintar(d3.text); } catch (e) {}
      }
      if (frase.trim()) decir(frase);
      if (window.AresVoz) {
        AresVoz.ultimo = full.toLowerCase();
        if (!hablo && full.trim()) AresVoz.hablar(full);
      }
      if (full.trim()) AresCerebro.recordar('ARES', full);
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
// FIN CEREBRO V5