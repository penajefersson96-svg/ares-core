// memoria.js v2.0 — Base de datos estructurada (DAO), sin acoplamiento a UI
const AresMemoria = {
  CLAVE: 'ares_memoria_v2',
  
  // Lee la memoria como un array de objetos estructurados
  leer: () => {
    try {
      const data = localStorage.getItem(AresMemoria.CLAVE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error leyendo memoria:', e);
      return [];
    }
  },
  
  // Guarda un hecho nuevo con timestamp
  guardar: (texto, tipo = 'hecho') => {
    if (!texto || typeof texto !== 'string') return false;
    
    const m = AresMemoria.leer();
    const nuevoHecho = {
      id: Date.now(),
      text: texto.trim(),
      tipo: tipo, // 'hecho', 'preferencia', 'aprendizaje'
      fecha: new Date().toISOString()
    };
    
    m.push(nuevoHecho);
    
    // Límite duro de 50 recuerdos para no inflar LocalStorage
    const memoriaFinal = m.slice(-50);
    localStorage.setItem(AresMemoria.CLAVE, JSON.stringify(memoriaFinal));
    
    return nuevoHecho;
  },
  
  // Devuelve el texto plano para inyectar en el Prompt del Worker
  obtenerParaPrompt: () => {
    const m = AresMemoria.leer();
    if (m.length === 0) return '';
    // Formato: "El usuario prefiere X. El usuario trabaja en Y."
    return m.map(item => `- ${item.text}`).join('\n');
  },
  
  // Devuelve un resumen legible para mostrar en chat
  obtenerResumen: () => {
    const m = AresMemoria.leer();
    if (m.length === 0) return 'Aun no guardo nada sobre usted, señor.';
    
    return m.map(item => {
      const fecha = new Date(item.fecha).toLocaleDateString('es-ES');
      return `• ${item.text} (${fecha})`;
    }).join('\n');
  },
  
  // Borrar toda la memoria
  formatear: () => {
    localStorage.removeItem(AresMemoria.CLAVE);
    localStorage.removeItem('ares_memoria'); // Limpia la versión vieja si existía
    return true;
  },
  
  // Migración silenciosa de la versión vieja (strings planos) a la nueva (objetos)
  migrar: () => {
    const vieja = localStorage.getItem('ares_memoria');
    if (vieja) {
      try {
        const arrViejo = JSON.parse(vieja);
        if (Array.isArray(arrViejo) && typeof arrViejo[0] === 'string') {
          arrViejo.forEach(texto => AresMemoria.guardar(texto, 'migrado'));
        }
        localStorage.removeItem('ares_memoria');
      } catch (e) {}
    }
  },
  
  init: () => {
    AresMemoria.migrar();
  }
};

document.addEventListener('DOMContentLoaded', AresMemoria.init);