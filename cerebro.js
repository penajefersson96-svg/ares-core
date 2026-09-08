const AresCerebro = {
  mostrar: (quien, msg) => {
    const chat = document.getElementById('chat');
    const p = document.createElement('p');
    p.innerHTML = `<strong>${quien}:</strong> ${msg}`;
    p.style.color = quien === 'ARES' ? '#fff' : '#888';
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
  },
  
  pensarLocal: (texto) => {
    texto = texto.toLowerCase();
    let respuesta = "Modo entrenamiento: Mi mente real se activará al desplegar el proyecto en la nube.";

    if (texto.includes("hola")) respuesta = "Hola socio. Sistemas operativos al 100%.";
    else if (texto.includes("estado")) respuesta = "Memoria estable. Diagnóstico activo. Esperando núcleo neuronal.";
    else if (texto.includes("futuro")) respuesta = "Visualizo una interfaz holográfica y aprendizaje autónomo, socio.";
    
    AresCerebro.mostrar('ARES', respuesta);
  },

  enviar: async () => {
    const input = document.getElementById('entrada');
    const texto = input.value.trim();
    if (!texto) return;

    AresCerebro.mostrar('TÚ', texto);
    input.value = "";
    input.blur();

    // Intentar conectar con la IA real (Backend)
    try {
      const res = await fetch('https://ares.penajefersson96.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: texto })
      });
      
      if (!res.ok) throw new Error('Sin servidor');
      
      const data = await res.json();
      AresCerebro.mostrar('ARES', data.respuesta);
    } catch (error) {
      // Si no hay servidor (Spck local), usar modo entrenamiento
      AresCerebro.pensarLocal(texto);
    }
  },

  init: () => {
    const input = document.getElementById('entrada');
    const btn = document.getElementById('enviar');

    if (btn && input) {
      btn.onclick = AresCerebro.enviar;
      input.onkeydown = (e) => {
        if (e.key === 'Enter') AresCerebro.enviar();
      };
    }
  }
};
document.addEventListener('DOMContentLoaded', AresCerebro.init);