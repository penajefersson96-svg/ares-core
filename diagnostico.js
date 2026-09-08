const AresDiag = {
  log: (msg) => {
    const chat = document.getElementById('chat');
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
    let logs = JSON.parse(localStorage.getItem('ares_logs') || '[]');
    logs.push(msg);
    localStorage.setItem('ares_logs', JSON.stringify(logs.slice(-20))); // Guarda últimos 20
  },
  leer: (file) => {
    const r = new FileReader();
    r.onload = (e) => {
      localStorage.setItem('ares_archivo_' + file.name, e.target.result);
      AresDiag.log(`📂 Archivo leído y guardado: ${file.name}`);
    };
    r.readAsText(file);
  },
  init: () => {
    // Captura errores de código (Sintaxis, Spck, etc.)
    window.onerror = (msg, url, line) => AresDiag.log(`🚨 Error JS Línea ${line}: ${msg}`);
    window.onunhandledrejection = (err) => AresDiag.log(`🚨 Promesa rota: ${err.reason}`);
    
    // Captura estado de red
    window.addEventListener('offline', () => AresDiag.log('🔴 ¡Se cayó internet!'));
    window.addEventListener('online', () => AresDiag.log('🟢 Internet restaurado'));
    
  }
};
document.addEventListener('DOMContentLoaded', AresDiag.init);