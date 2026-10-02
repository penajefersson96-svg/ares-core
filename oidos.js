// oidos.js v8.0 — Reconocimiento de voz con modo centinela
const AresOidos = {
  activo: false,
  centinela: false,
  recognition: null,
  wakeLock: null,
  timeoutDormir: null,
  
  soportado: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },
  
  crearReconocimiento: () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.continuous = false;
    return recognition;
  },
  
  limpiarTexto: (texto) => {
    let limpio = texto.toLowerCase().trim();
    
    // Remover wake-word "ares" al inicio
    limpio = limpio.replace(/^ares\s*/i, '');
    
    // Remover palabras duplicadas (ej: "hola hola" -> "hola")
    let anterior;
    do {
      anterior = limpio;
      limpio = limpio.replace(/\b(\w+)\s+\1\b/g, '$1');
    } while (limpio !== anterior);
    
    // Normalizar espacios
    return limpio.replace(/\s+/g, ' ').trim();
  },
  
  esEcoPropio: (texto) => {
    // Verificar si el texto reconocido es algo que Ares acaba de decir
    if (!window.AresVoz || !AresVoz.ultimo) return false;
    
    const textoLimpio = texto.replace(/[^a-z0-9áéíóúñü ]/gi, '');
    const ultimoAres = AresVoz.ultimo.replace(/[^a-z0-9áéíóúñü ]/gi, '');
    
    // Si el texto reconocido está contenido en lo último que dijo Ares, es eco
    return ultimoAres.includes(textoLimpio) || textoLimpio.includes(ultimoAres.slice(0, 50));
  },
  
  esperarFinVoz: (callback) => {
    const verificar = () => {
      if (window.speechSynthesis && speechSynthesis.speaking) {
        setTimeout(verificar, 500);
      } else {
        setTimeout(callback, 1000);
      }
    };
    verificar();
  },
  
  iniciarReconocimiento: (boton, modoCentinela = false) => {
    if (AresOidos.activo) return;
    
    AresOidos.activo = true;
    if (boton) boton.textContent = '🔴';
    
    const recognition = AresOidos.crearReconocimiento();
    AresOidos.recognition = recognition;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const textoLimpio = AresOidos.limpiarTexto(transcript);
      
      if (!textoLimpio || textoLimpio.length < 2) {
        AresOidos.finalizar(boton, modoCentinela);
        return;
      }
      
      // Evitar eco propio
      if (AresOidos.esEcoPropio(textoLimpio)) {
        AresOidos.finalizar(boton, modoCentinela);
        return;
      }
      
      // Enviar al cerebro
      const input = document.getElementById('entrada');
      if (input) {
        input.value = textoLimpio;
        if (window.AresCerebro) {
          AresCerebro.enviar();
        }
      }
      
      AresOidos.finalizar(boton, modoCentinela);
    };
    
    recognition.onend = () => {
      if (modoCentinela && AresOidos.centinela) {
        // En modo centinela, reiniciar después de un delay
        setTimeout(() => {
          if (AresOidos.centinela) {
            AresOidos.activo = false;
            AresOidos.iniciarReconocimiento(boton, true);
          }
        }, 500);
      } else {
        AresOidos.finalizar(boton, false);
      }
    };
    
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        if (window.AresDiag) {
          AresDiag.log('Permiso de micrófono denegado', 'error');
        }
        if (window.AresCerebro) {
          AresCerebro.mostrar('ARES', 'No tengo permiso para usar el micrófono, señor.');
        }
        AresOidos.centinela = false;
      } else if (event.error !== 'no-speech') {
        if (window.AresDiag) {
          AresDiag.log(`Error de reconocimiento: ${event.error}`, 'warning');
        }
      }
      AresOidos.finalizar(boton, modoCentinela);
    };
    
    try {
      recognition.start();
    } catch (e) {
      if (window.AresDiag) {
        AresDiag.log(`Error iniciando reconocimiento: ${e.message}`, 'error');
      }
      AresOidos.finalizar(boton, modoCentinela);
    }
  },
  
  finalizar: (boton, reiniciarCentinela) => {
    AresOidos.activo = false;
    if (boton) boton.textContent = '🎙';
    
    if (reiniciarCentinela && AresOidos.centinela) {
      AresOidos.renovarCentinela(boton);
    }
  },
  
  unaVez: (boton) => {
    if (AresOidos.centinela) {
      if (window.AresCerebro) {
        AresCerebro.mostrar('ARES', 'Desactive el modo centinela primero, señor.');
      }
      return;
    }
    AresOidos.iniciarReconocimiento(boton, false);
  },
  
  renovarCentinela: (boton) => {
    clearTimeout(AresOidos.timeoutDormir);
    AresOidos.timeoutDormir = setTimeout(() => {
      if (window.AresCerebro) {
        AresCerebro.mostrar('ARES', 'Centinela dormido por inactividad, señor.');
      }
      AresOidos.toggleCentinela(boton);
    }, 300000); // 5 minutos
  },
  
  toggleCentinela: async (boton) => {
    if (AresOidos.centinela) {
      // Desactivar centinela
      AresOidos.centinela = false;
      if (boton) boton.textContent = '🛡️';
      
      if (AresOidos.recognition) {
        AresOidos.recognition.stop();
      }
      
      if (AresOidos.wakeLock) {
        try {
          await AresOidos.wakeLock.release();
        } catch (e) {}
        AresOidos.wakeLock = null;
      }
      
      clearTimeout(AresOidos.timeoutDormir);
      
      if (window.AresDiag) {
        AresDiag.log('Centinela desactivado', 'info');
      }
      
      return;
    }
    
    // Activar centinela
    AresOidos.centinela = true;
    if (boton) boton.textContent = '🟢';
    
    // Solicitar wake lock para mantener pantalla activa
    if ('wakeLock' in navigator) {
      try {
        AresOidos.wakeLock = await navigator.wakeLock.request('screen');
        AresOidos.wakeLock.addEventListener('release', () => {
          if (window.AresDiag) {
            AresDiag.log('Wake lock liberado', 'info');
          }
        });
      } catch (e) {
        if (window.AresDiag) {
          AresDiag.log('No se pudo obtener wake lock', 'warning');
        }
      }
    }
    
    AresOidos.renovarCentinela(boton);
    
    if (window.AresDiag) {
      AresDiag.log('Centinela activado', 'info');
    }
    
    if (window.AresCerebro) {
      AresCerebro.mostrar('ARES', 'Modo centinela activado, señor. Escuchando continuamente.');
    }
    
    AresOidos.iniciarReconocimiento(boton, true);
  },
  
  init: () => {
    if (!AresOidos.soportado()) {
      if (window.AresDiag) {
        AresDiag.log('Reconocimiento de voz no soportado en este navegador', 'warning');
      }
      return;
    }
    
    const botonEnviar = document.getElementById('enviar');
    if (!botonEnviar || !botonEnviar.parentNode) return;
    
    const estiloBoton = 'background:transparent;border:1px solid #0ff;color:#0ff;padding:10px;font-size:16px;cursor:pointer;margin-right:4px;';
    
    // Botón de reconocimiento una vez
    const botonMicrofono = document.createElement('button');
    botonMicrofono.type = 'button';
    botonMicrofono.textContent = '🎙';
    botonMicrofono.style.cssText = estiloBoton;
    botonMicrofono.onclick = () => AresOidos.unaVez(botonMicrofono);
    botonEnviar.parentNode.insertBefore(botonMicrofono, botonEnviar);
    
    // Botón de modo centinela
    const botonCentinela = document.createElement('button');
    botonCentinela.type = 'button';
    botonCentinela.textContent = '🛡️';
    botonCentinela.style.cssText = estiloBoton;
    botonCentinela.onclick = () => AresOidos.toggleCentinela(botonCentinela);
    botonEnviar.parentNode.insertBefore(botonCentinela, botonEnviar);
    
    if (window.AresDiag) {
      AresDiag.log('Sistema de reconocimiento de voz inicializado', 'info');
    }
  }
};

document.addEventListener('DOMContentLoaded', AresOidos.init);