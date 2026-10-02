// diagnostico.js v2.0 — Captura de errores silenciosa, sin ensuciar el chat
const AresDiag = {
  CLAVE_LOGS: 'ares_logs',
  MAX_LOGS: 50,
  
  // Guardar log en localStorage (silencioso, no aparece en chat)
  log: (msg, tipo = 'info') => {
    try {
      const logs = JSON.parse(localStorage.getItem(AresDiag.CLAVE_LOGS) || '[]');
      const entrada = {
        timestamp: new Date().toISOString(),
        tipo: tipo, // 'info', 'error', 'warning'
        mensaje: msg
      };
      logs.push(entrada);
      
      // Mantener solo los últimos MAX_LOGS
      const logsRecientes = logs.slice(-AresDiag.MAX_LOGS);
      localStorage.setItem(AresDiag.CLAVE_LOGS, JSON.stringify(logsRecientes));
      
      // También mostrar en consola del navegador para debugging
      console.log(`[ARES ${tipo.toUpperCase()}] ${msg}`);
    } catch (e) {
      console.error('Error guardando log:', e);
    }
  },
  
  // Obtener todos los logs guardados (para revisar después)
  obtenerLogs: () => {
    try {
      return JSON.parse(localStorage.getItem(AresDiag.CLAVE_LOGS) || '[]');
    } catch (e) {
      return [];
    }
  },
  
  // Limpiar todos los logs
  limpiarLogs: () => {
    localStorage.removeItem(AresDiag.CLAVE_LOGS);
    console.log('[ARES] Logs limpiados');
  },
  
  // Exportar logs como archivo de texto (útil para debugging)
  exportarLogs: () => {
    const logs = AresDiag.obtenerLogs();
    if (logs.length === 0) {
      console.log('[ARES] No hay logs para exportar');
      return;
    }
    
    const texto = logs.map(log =>
      `[${log.timestamp}] [${log.tipo.toUpperCase()}] ${log.mensaje}`
    ).join('\n');
    
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ares-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  init: () => {
    // Capturar errores de JavaScript no manejados
    window.onerror = (msg, url, line, col, error) => {
      const errorMsg = `${msg} (línea ${line}, columna ${col})`;
      AresDiag.log(errorMsg, 'error');
      return false; // Dejar que el error se propague normalmente
    };
    
    // Capturar promesas rechazadas no manejadas
    window.onunhandledrejection = (event) => {
      const errorMsg = event.reason ?
        (event.reason.message || String(event.reason)) :
        'Promesa rechazada sin razón';
      AresDiag.log(`Promesa rota: ${errorMsg}`, 'error');
    };
    
    // Capturar cambios de conectividad
    window.addEventListener('offline', () => {
      AresDiag.log('Conexión a internet perdida', 'warning');
    });
    
    window.addEventListener('online', () => {
      AresDiag.log('Conexión a internet restaurada', 'info');
    });
    
    // Log de inicialización
    AresDiag.log('Sistema de diagnóstico inicializado', 'info');
    
    // Exponer funciones de debugging en consola
    window.AresLogs = {
      ver: () => console.table(AresDiag.obtenerLogs()),
      limpiar: AresDiag.limpiarLogs,
      exportar: AresDiag.exportarLogs
    };
    
    console.log('[ARES] Sistema de diagnóstico activo. Usa window.AresLogs.ver() para ver logs.');
  }
};

document.addEventListener('DOMContentLoaded', AresDiag.init);