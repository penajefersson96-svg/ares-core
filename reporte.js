// reporte.js v5.0 — Generador de reportes seguro y profesional
const AresReporte = {
  ARCHIVOS_CORE: [
    'cerebro.js', 'voz.js', 'memoria.js', 'panel.js',
    'orbe.js', 'sonidos.js', 'oidos.js', 'diagnostico.js'
  ],
  
  verificarModulos: () => {
    const modulos = {
      'AresCerebro': typeof AresCerebro,
      'AresVoz': typeof AresVoz,
      'AresMemoria': typeof AresMemoria,
      'AresPanel': typeof AresPanel,
      'AresOrbe': typeof AresOrbe,
      'AresSonidos': typeof AresSonidos,
      'AresOidos': typeof AresOidos,
      'AresDiag': typeof AresDiag
    };
    
    const faltantes = Object.entries(modulos)
      .filter(([_, tipo]) => tipo === 'undefined')
      .map(([nombre]) => nombre);
    
    return {
      total: Object.keys(modulos).length,
      cargados: Object.keys(modulos).length - faltantes.length,
      faltantes: faltantes
    };
  },
  
  verificarCapacidades: () => {
    return {
      speechSynthesis: 'speechSynthesis' in window,
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      serviceWorker: 'serviceWorker' in navigator,
      wakeLock: 'wakeLock' in navigator,
      localStorage: (() => {
        try {
          localStorage.setItem('test', '1');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      })()
    };
  },
  
  verificarManifest: async () => {
    try {
      const response = await fetch('manifest.webmanifest?t=' + Date.now());
      if (!response.ok) {
        return { estado: 'ERROR', mensaje: 'No se pudo cargar manifest.webmanifest' };
      }
      
      const manifest = await response.json();
      return {
        estado: 'OK',
        nombre: manifest.name || 'Sin nombre',
        iconos: manifest.icons ? manifest.icons.length : 0,
        themeColor: manifest.theme_color || 'No definido'
      };
    } catch (e) {
      return { estado: 'ERROR', mensaje: e.message };
    }
  },
  
  verificarConexion: () => {
    return {
      online: navigator.onLine,
      tipo: navigator.connection ? navigator.connection.effectiveType : 'desconocido',
      downlink: navigator.connection ? navigator.connection.downlink : 'N/A'
    };
  },
  
  generar: async () => {
    if (!window.AresCerebro) {
      console.error('[Reporte] AresCerebro no está disponible');
      return;
    }
    
    AresCerebro.mostrar('ARES', 'Generando reporte del sistema, señor...');
    
    const modulos = AresReporte.verificarModulos();
    const capacidades = AresReporte.verificarCapacidades();
    const manifest = await AresReporte.verificarManifest();
    const conexion = AresReporte.verificarConexion();
    
    const lineas = [
      '📊 REPORTE DEL SISTEMA',
      '',
      `🧩 Módulos: ${modulos.cargados}/${modulos.total} cargados`,
      modulos.faltantes.length > 0 ? `   Faltantes: ${modulos.faltantes.join(', ')}` : '   ✅ Todos los módulos presentes',
      '',
      '⚙️ Capacidades del navegador:',
      `   • Síntesis de voz: ${capacidades.speechSynthesis ? '✅' : '❌'}`,
      `   • Reconocimiento de voz: ${capacidades.speechRecognition ? '✅' : '❌'}`,
      `   • Service Worker: ${capacidades.serviceWorker ? '✅' : '❌'}`,
      `   • Wake Lock: ${capacidades.wakeLock ? '✅' : '❌'}`,
      `   • LocalStorage: ${capacidades.localStorage ? '✅' : '❌'}`,
      '',
      '📱 Manifiesto PWA:',
      `   • Estado: ${manifest.estado}`,
      manifest.estado === 'OK' ? `   • Nombre: ${manifest.nombre}` : `   • Error: ${manifest.mensaje}`,
      manifest.estado === 'OK' ? `   • Iconos: ${manifest.iconos}` : '',
      '',
      '🌐 Conexión:',
      `   • Estado: ${conexion.online ? 'En línea' : 'Sin conexión'}`,
      `   • Tipo: ${conexion.tipo}`,
      `   • Velocidad: ${conexion.downlink} Mbps`,
      '',
      `🕐 Generado: ${new Date().toLocaleString('es-ES')}`
    ];
    
    const reporte = lineas.filter(linea => linea !== '').join('\n');
    AresCerebro.mostrar('ARES', reporte);
    
    if (window.AresDiag) {
      AresDiag.log('Reporte del sistema generado', 'info');
    }
  },
  
  init: () => {
    // El comando "reporte" se maneja en cerebro.js como comando local
    // Este módulo solo expone la función generar()
    
    if (window.AresDiag) {
      AresDiag.log('Módulo de reportes inicializado', 'info');
    }
  }
};

document.addEventListener('DOMContentLoaded', AresReporte.init);