# Fix: Bus error (core dumped) al ejecutar `npm run dev`

## Síntoma

```
npm run dev
> cursos@0.0.0 dev
> vite --host --port 3001

Bus error (core dumped)
```

## Causa raíz

El binario nativo `@rollup/rollup-linux-x64-gnu` se descargó **truncado/corrupto** (probablemente por red inestable durante `npm install`).

| | Valor |
|---|---|
| Tamaño en disco | ~766 KB |
| Tamaño esperado (según cabecera ELF) | ~1.96 MB |

Cuando Node.js intenta cargar (`mmap`) ese `.node` cortado, la CPU no puede mapear las páginas que faltan → **Bus error**.

Vite depende de rollup como bundler interno, así que falla en el arranque antes de mostrar cualquier log útil.

## Diagnóstico

Para aislar qué módulo nativo falla, cargar cada uno por separado:

```bash
node -e "require('rollup'); console.log('OK')"
# Bus error (core dumped) ← aquí está el problema

node -e "require('esbuild'); console.log('OK')"        # OK
node -e "require('lightningcss'); console.log('OK')"   # OK
node -e "require('@tailwindcss/oxide'); console.log('OK')"  # OK
```

Verificar integridad del binario:

```bash
file node_modules/@rollup/rollup-linux-x64-gnu/*.node
# "missing section headers at 1959032" → archivo incompleto
```

## Solución

```bash
# 1. Eliminar los paquetes corruptos
rm -rf node_modules/@rollup node_modules/rollup

# 2. Verificar y limpiar la caché de npm
npm cache verify

# 3. Reinstalar
npm install
```

El binario reinstalado debe medir ~1.96 MB y cargar correctamente:

```bash
node -e "require('rollup'); console.log('OK')"
# rollup OK
```

## Si el problema reaparece

La caché de npm puede haber guardado la descarga parcial. Limpieza completa:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Entorno en que se reprodujo

- OS: Linux Mint 22.3 (glibc 2.39)
- Node: v20.19.1
- npm: 10.8.2
- rollup: 4.50.1
- vite: 6.3.6
