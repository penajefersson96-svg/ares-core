// mani.js v2.0 — Verificador de manifiesto bajo demanda
const AresMani = {
  verificar: async () => {
    if (!window.AresCerebro) {
      console.error('[Mani] AresCerebro no disponible');
      return;
    }
    
    AresCerebro.mostrar('ARES', 'Verificando manifiesto PWA, señor...');
    
    const resultados = [];
    
    // Verificar link al manifest
    const linkManifest = document.querySelector('link[rel="manifest"]');
    if (!linkManifest) {
      AresCerebro.mostrar('ARES', '❌ No se encontró link al manifiesto en el HTML, señor.');
      return;
    }
    resultados.push('✅ Link al manifiesto: presente');
    
    // Cargar y validar manifest
    try {
      const response = await fetch('manifest.webmanifest?t=' + Date.now());
      if (!response.ok) {
        AresCerebro.mostrar('ARES', `❌ No se pudo cargar manifest.webmanifest (HTTP ${response.status}), señor.`);
        return;
      }
      
      const manifest = await response.json();
      resultados.push(`✅ Nombre: ${manifest.name || 'Sin nombre'}`);
      resultados.push(`✅ Display: ${manifest.display || 'browser'}`);
      resultados.push(`✅ Theme color: ${manifest.theme_color || 'No definido'}`);
      
      // Verificar iconos
      const iconos = manifest.icons || [];
      if (iconos.length === 0) {
        resultados.push('❌ No hay iconos definidos');
      } else {
        resultados.push(`📱 Iconos declarados: ${iconos.length}`);
        
        for (const icono of iconos) {
          const src = icono.src;
          const sizes = icono.sizes || 'sin tamaño';
          const purpose = icono.purpose || 'any';
          
          try {
            const iconResponse = await fetch(src + '?t=' + Date.now());
            if (!iconResponse.ok) {
              resultados.push(`   ❌ ${src}: No encontrado (HTTP ${iconResponse.status})`);
              continue;
            }
            
            const contentType = iconResponse.headers.get('content-type') || 'desconocido';
            const blob = await iconResponse.blob();
            const img = await createImageBitmap(blob).catch(() => null);
            
            if (img) {
              resultados.push(`   ✅ ${src}: ${img.width}x${img.height} (${contentType}) [${purpose}]`);
            } else {
              resultados.push(`   ⚠️ ${src}: No se pudo decodificar como imagen`);
            }
          } catch (e) {
            resultados.push(`   ❌ ${src}: Error al cargar - ${e.message}`);
          }
        }
      }
      
      // Validaciones adicionales
      if (!manifest.start_url) {
        resultados.push('⚠️ start_url no definido');
      }
      if (!manifest.background_color) {
        resultados.push('⚠️ background_color no definido');
      }
      
    } catch (e) {
      AresCerebro.mostrar('ARES', `❌ Error procesando manifiesto: ${e.message}, señor.`);
      return;
    }
    
    const reporte = '📋 VERIFICACIÓN DE MANIFIESTO\n\n' + resultados.join('\n');
    AresCerebro.mostrar('ARES', reporte);
    
    if (window.AresDiag) {
      AresDiag.log('Verificación de manifiesto completada', 'info');
    }
  },
  
  init: () => {
    // No se ejecuta automáticamente
    // El comando "mani" o "manifiesto" se maneja en cerebro.js
    if (window.AresDiag) {
      AresDiag.log('Módulo de verificación de manifiesto cargado', 'info');
    }
  }
};

document.addEventListener('DOMContentLoaded', AresMani.init);