# examen.py — El medico Python de Ares (Campito)
import subprocess, os, json, sys

fallos = []
print('EXAMEN DE SINTAXIS JS')
for a in sorted([x for x in os.listdir('.') if x.endswith('.js')]):
    r = subprocess.run(['node', '--check', a], capture_output=True, text=True)
    if r.returncode == 0:
        print(a + ': OK')
    else:
        fallos.append(a)
        print(a + ': FALLO -> ' + (r.stderr.strip().splitlines() or ['?'])[-1])

print('EXAMEN DE MANIFIESTO')
try:
    m = json.load(open('manifest.webmanifest'))
    print('manifest: OK, iconos: ' + str(len(m.get('icons', []))))
    for ic in m.get('icons', []):
        p = ic.get('src', '')
        ok = os.path.exists(p)
        print(p + ': ' + ('existe' if ok else 'FALTA ARCHIVO'))
        if not ok:
            fallos.append(p)
except Exception as e:
    fallos.append('manifest')
    print('manifest: ERROR ' + str(e))

print('VEREDICTO: ' + ('APTO PARA EL CREADOR' if not fallos else 'NO APTO: ' + ', '.join(fallos)))
sys.exit(1 if fallos else 0)
