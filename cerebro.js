const AresCerebro = {
  mostrar: (quien, msg) => {
    const chat = document.getElementById('chat');
    const p = document.createElement('p');
    p.innerHTML = `<strong>${quien}:</strong> ${msg}`;
    p.style.color = quien === 'ARES' ? '#fff' : '#888';
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
  },
  pensar: (texto) => {
    texto = texto.toLowerCase();
    let respuesta = "Entendido. Mi núcleo neuronal se activará en la siguiente fase.";

    if (texto.includes("hola")) respuesta = "Hola socio. Sistemas operativos al 100%.";
    else if (texto.includes("estado")) respuesta = "Memoria estable. Diagnóstico activo. Listo para aprender.";
    else if (texto.includes("diagnostico")) {
      const logs = JSON.parse(localStorage.getItem('ares_logs') || '[]');
      respuesta = logs.length ? `Último reporte: ${logs[logs.length-1]}` : "Todo en orden, sin errores.";
    }

    AresCerebro.mostrar('ARES', respuesta);
  },
  init: () => {
    const input = document.getElementById('entrada');
    const btn = document.getElementById('enviar');

    if (btn && input) {
      btn.onclick = () => {
        const texto = input.value.trim();
        if (texto) {
          AresCerebro.mostrar('TÚ', texto);
          AresCerebro.pensar(texto);
          input.value = "";
        }
      };
    }
  }
};
document.addEventListener('DOMContentLoaded', AresCerebro.init);