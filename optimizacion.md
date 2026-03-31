# Optimización Mobile (Rendimiento + UX) — `cursosvue` (+ PWA + backend)

## Objetivo

Mejorar la experiencia en **mobile real** (CPU lenta, red lenta, pantallas pequeñas, notch) y subir Lighthouse **Mobile** / Core Web Vitals sin alterar la UI/UX.

## Métricas objetivo (producción)

- **LCP** < 2.5s (Slow 4G / CPU 4×)
- **INP** < 200ms (ideal < 150ms)
- **CLS** < 0.1
- **JS inicial** lo más bajo posible (objetivo práctico: < 200–300KB gz en home; el resto por ruta)

## Principios (para no “optimizar mal”)

- Optimizar **ruta crítica** (home + header + búsqueda) antes que pantallas de uso raro.
- Priorizar **menos bytes** y **menos trabajo JS** antes que micro-optimizaciones de CSS.
- En mobile el coste real suele ser: **parse/compile JS**, **imágenes sobredimensionadas**, **repaints**, **layout thrash**.

---

## Context

La plataforma de cursos sufre baja puntuación en Lighthouse Mobile debido a un bundle de 1.7MB sin estrategia de chunking, imágenes pesadas sin optimizar (456KB), la fuente Poppins no precargada (FOUT), una llamada a la API de búsqueda sin debounce que dispara N peticiones por carácter digitado, y animaciones CSS que usan propiedades costosas (box-shadow). El objetivo es alcanzar un puntaje alto en Core Web Vitals sin alterar la UI/UX actual.

---

## Diagnóstico por Área

### A. Bundle & Build — CRÍTICO

| Problema | Detalle |
|---|---|
| Chunk de 598KB | `management.admin.account.page-Bdoe6Uml.js` — 3.5× el siguiente |
| Sin `rollupOptions` | `vite.config.ts` solo tiene `vue()` y `tailwindcss()` |
| Quasar instalado, no usado | ~500KB en node_modules sin importar nada |
| Imagen hero 456KB | `mujercursos-AXNXeMpq.png` sin comprimir |

**Archivos críticos:**
- [cursosvue/vite.config.ts](cursosvue/vite.config.ts)
- [cursosvue/package.json](cursosvue/package.json)

### B. Fuentes — ALTO

Poppins es usada en `home.component.vue`, `PricingLevels.vue`, `HomeCta.vue`, `courses.component.vue` mediante `font-family: 'Poppins'` en CSS scoped, pero **no está declarada en `index.html`**. Resultado: Flash Of Unstyled Text (FOUT) + sistema carga la fuente tarde.

**Archivos críticos:**
- [cursosvue/index.html](cursosvue/index.html)

### C. Imágenes — MEDIO/ALTO

- 10+ `<img>` sin atributos `width`/`height` (causa CLS)
- 8+ imágenes sin `loading="lazy"` (incluye logos de home, testimoniales)
- Sin `fetchpriority="high"` en la imagen LCP (hero)

**Archivos críticos:**
- [cursosvue/src/home/home.component.vue](cursosvue/src/home/home.component.vue)
- [cursosvue/src/courses/CourseCard.vue](cursosvue/src/courses/CourseCard.vue)
- [cursosvue/src/components/header/header.component.vue](cursosvue/src/components/header/header.component.vue)
- [cursosvue/src/cart/item.component.vue](cursosvue/src/cart/item.component.vue)
- [cursosvue/src/courses/courseInfoPage/componentCourseInfo/comments.body.component.vue](cursosvue/src/courses/courseInfoPage/componentCourseInfo/comments.body.component.vue)

### D. API Redundante / Estado — CRÍTICO

| Problema | Archivo | Línea |
|---|---|---|
| Búsqueda sin debounce (1 API call/carácter) | `header.search.component.vue` | 11–13 |
| Dos `onMounted` en App.vue sin coordinar | `App.vue` | 20–44 |
| `my.courses.page.vue` fuerza `fetchCategories(true)` siempre | `my.courses.page.vue` | 13–15 |
| `watch` sin cuerpo en CartStore (dead code) | `CartStore.ts` | 9–11 |
| `watch({ deep: true })` sobre un ref en App.vue | `App.vue` | 51–61 |
| Sin `<KeepAlive>` — full remount en cada navegación | `App.vue` / router | — |

**Archivos críticos:**
- [cursosvue/src/components/header/header.search.component.vue](cursosvue/src/components/header/header.search.component.vue)
- [cursosvue/src/App.vue](cursosvue/src/App.vue)
- [cursosvue/src/store/CartStore.ts](cursosvue/src/store/CartStore.ts)
- [cursosvue/src/components/auth/my.courses.page.vue](cursosvue/src/components/auth/my.courses.page.vue)

### E. Animaciones CSS Costosas — MEDIO

- `ctaPulse` en `ProLessonViewer.vue` anima `box-shadow` en loop infinito → fuerza repaint cada frame en GPU
- Accordion usa `max-height` en transición (layout-triggering reflow)
- `TransitionGroup` de 500ms sobre 12+ CourseCards al filtrar

**Archivos críticos:**
- [cursosvue/src/monetizar/ProLessonViewer.vue](cursosvue/src/monetizar/ProLessonViewer.vue)
- [cursosvue/src/courses/courses.component.vue](cursosvue/src/courses/courses.component.vue)

---

## Optimización Mobile UX (IU/UX) — lo que suele faltar

> Estas mejoras no siempre suben Lighthouse, pero sí mejoran conversión y reducen frustración en móviles (errores de tap, scroll-jank, teclado mal configurado).

### 1) UX táctil (tap targets y “misclicks”)

- **Hit target** mínimo: 44×44px en botones, icon-buttons, chips y acciones dentro de cards.
- Evitar acciones importantes en zonas muy cercanas (especialmente “comprar/eliminar”).
- Asegurar feedback táctil: `:active` visible y no depender de `:hover`.

Checklist:
- [ ] Icon-buttons y chips ≥ 44×44px reales (no solo visuales)
- [ ] Estados `:active` visibles en mobile
- [ ] Acciones en cards con suficiente padding/separación

### 2) Scroll performance (evitar “jank”)

- Evitar trabajo pesado en `scroll`/`touchmove`.
- Donde aplique, usar listeners `passive`.
- En listados: limitar animaciones en entradas/salidas y evitar reflows (transiciones de `max-height`).

Checklist:
- [ ] No hay lógica costosa en scroll
- [ ] Transiciones no dependen de `max-height` si hay alternativas

### 3) Safe areas (notch / barras de sistema)

Si hay header/footer pegados al borde en iOS con notch, usar safe-area:

```css
.safeTop { padding-top: env(safe-area-inset-top); }
.safeBottom { padding-bottom: env(safe-area-inset-bottom); }
```

Checklist:
- [ ] Header/CTA/floating buttons respetan `safe-area-inset-*`

### 4) Accesibilidad (A11y) orientada a mobile

- Icon-buttons con `aria-label`.
- Imágenes: `alt` significativo o `alt=""` si es decorativa.
- Respetar `prefers-reduced-motion` (especialmente animaciones infinitas).

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Checklist:
- [ ] Icon-buttons tienen `aria-label`
- [ ] Hay foco visible (`:focus-visible`) para navegación con teclado
- [ ] Animaciones se reducen si el usuario lo pide

### 5) Formularios y teclado (búsqueda/login)

En mobile, el teclado correcto acelera tareas y reduce errores:

```html
<input inputmode="search" enterkeyhint="search" autocomplete="off" />
```

Checklist:
- [ ] `inputmode` correcto (search/email/numeric)
- [ ] `enterkeyhint` correcto (search/go/next/done)

---

## Plan de Implementación

### 0. PWA (Mobile-first) — Instalación, offline y caching

> Objetivo: mejorar carga en visitas repetidas, permitir instalación y ofrecer degradación aceptable sin conexión.

**Componentes:**
- **Manifest** (`manifest.webmanifest`): `name`, `short_name`, `icons` (192/512 + `maskable`), `theme_color`, `background_color`, `display`.
- **Service Worker** (Workbox / plugin PWA de Vite): precache + runtime caching.
- **Estrategia de updates**: evitar que el SW quede “pegado” con una versión vieja.

**Runtime caching recomendado (alto impacto en mobile):**
- **API categorías/catálogos**: `stale-while-revalidate` (rápido + se actualiza solo).
- **Imágenes**: `cache-first` con expiración (límite de entradas y edad).

**Checklist PWA:**
- [ ] `manifest.webmanifest` presente y validado
- [ ] Íconos correctos (incluye `maskable`)
- [ ] SW registra y cachea “app shell”
- [ ] Cache de API y de imágenes con expiración
- [ ] UX de actualización (toast “hay nueva versión” y recarga controlada)
- [ ] Prueba offline: home abre y muestra estado razonable

### 1. Vite Config — Chunking Inteligente
**Archivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('apexcharts') || id.includes('vue3-apexcharts'))
              return 'vendor-charts'
            if (id.includes('vue3-google-login'))
              return 'vendor-google'
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router'))
              return 'vendor-core'
            return 'vendor'
          }
        }
      }
    }
  }
})
```

**Resultado esperado:** chunk de admin pasa de 598KB → ~120KB (sin quasar bundleado accidentalmente).

### 2. Eliminar Quasar (Unused Dependency)
```bash
npm uninstall quasar @quasar/extras
```
Verificar que no hay ningún import de `quasar` en el codebase antes de desinstalar.

### 3. Fuente Poppins en index.html
**Archivo:** `index.html`

Agregar después de los preconnects de Inter:
```html
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
  media="print" onload="this.media='all'" />
<noscript>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />
</noscript>
```
Esto aplica la técnica de carga no-bloqueante + preload para eliminar el FOUT.

### 4. Imágenes — LCP, CLS y Lazy Loading

**a) Imagen hero (LCP)** en `home.component.vue`:
```html
<!-- ANTES -->
<img :src="heroImage" class="...">

<!-- DESPUÉS -->
<img :src="heroImage" class="..."
  width="800" height="600"
  fetchpriority="high"
  alt="Cursos en línea">
```

**b) Logos y testimoniales** en `home.component.vue` (below the fold):
```html
<img :src="logo" loading="lazy" width="120" height="40" alt="...">
```

**c) CourseCard** (`CourseCard.vue`):
```html
<img class="w-full h-full object-cover"
  :src="course.imagen_url"
  loading="lazy"
  width="400" height="225"
  :alt="course.nombre">
```

**d) Avatares de comentarios** (`comments.body.component.vue`):
```html
<img class="w-8 h-8 rounded-full"
  :src="item.user.picture"
  loading="lazy"
  width="32" height="32"
  alt="">
```

**e) Comprimir imagen hero**: convertir `mujercursos.png` (456KB) a WebP usando:
```bash
# En cursosvue/public/ o cursosvue/src/assets/
cwebp -q 80 mujercursos.png -o mujercursos.webp
```
Usar `<picture>` con fallback PNG o reemplazar directamente si los browsers target soportan WebP.

### 5. Debounce en Búsqueda
**Archivo:** `header.search.component.vue` líneas 11–13

```typescript
// ANTES
watch(() => dataInput.value, () => {
    getDataSearch()
})

// DESPUÉS
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(() => dataInput.value, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!val || val.trim().length < 2) return
  searchTimer = setTimeout(() => {
    getDataSearch()
  }, 350)
})
```
**Impacto:** Para "hello" pasa de 5 requests → 1 request (solo al detenerse 350ms).

### 6. Consolidar onMounted en App.vue y Eliminar Deep Watch Innecesario
**Archivo:** `App.vue`

```typescript
// ANTES: dos onMounted separados + deep watch sobre ref

// DESPUÉS: un solo onMounted
onMounted(async () => {
  const [profile] = await Promise.all([
    AuthService.getProfile(),
    catStore.fetchCategories()
  ])
  store.setProfile(profile)

  const affiliaty_id = localStorage.getItem('google_affiliaty')
  if (affiliaty_id) {
    AuthService.get_affiliaty(affiliaty_id).then((res) => {
      // ... mismo handler
    })
  }
})

// watch sin deep:true — store.profile es un ref, no necesita deep
watch(() => store.profile?.id, (id) => {
  if (!id) return
  const referido = localStorage.getItem('path_referido')
  if (referido) {
    localStorage.removeItem('path_referido')
    location.href = location.origin + referido
  }
})
```

**Beneficio:** Las dos llamadas críticas (profile + categories) corren en paralelo, reduciendo tiempo de arranque.

### 7. Eliminar Dead Code en CartStore
**Archivo:** `CartStore.ts` líneas 9–11

```typescript
// ELIMINAR estas líneas:
watch(cartCategories,()=>{
    countCart
})
```

### 8. Optimizar Animación CTA Pulse (box-shadow → opacity + scale)
**Archivo:** `ProLessonViewer.vue`

```css
/* ANTES — repaint intensivo */
@keyframes ctaPulse {
  0%, 100% { box-shadow: 0 10px 25px -3px rgba(...); }
  50%       { box-shadow: 0 10px 40px -3px rgba(...); }
}

/* DESPUÉS — solo opacity + scale (compositor, sin repaint) */
@keyframes ctaPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.85; transform: scale(1.02); }
}
```

### 9. KeepAlive para Courses List (Opcional, Alta Ganancia)
**Archivo:** `App.vue` (o en el router view)

```html
<RouterView v-slot="{ Component }">
  <KeepAlive :include="['CoursesComponent']" :max="2">
    <component :is="Component" />
  </KeepAlive>
</RouterView>
```

Esto evita re-ejecutar `onMounted` + re-fetching del catálogo al volver a `/courses`. Solo aplicar si no hay side-effects de estado stale.

### 10. my.courses.page.vue — Respetar el Cache de Categorías
**Archivo:** `my.courses.page.vue` línea 13

```typescript
// ANTES — fuerza re-fetch siempre
await storeCatergory.fetchCategories(true)

// DESPUÉS — respeta el TTL de 10 minutos del cache
await storeCatergory.fetchCategories() // force: false (default)
```

---

## Backend (FastAPI) — optimizaciones que ayudan especialmente en mobile

> Aunque el foco sea frontend, en mobile el backend define mucho: bytes, latencia, cache, paginación y payload “limpio”.

**Referencias para implementar en backend:**
- `cursos-server/src/main.py` (middlewares / headers)
- `cursos-server/src/routes/**` (endpoints de catálogo/categorías/usuarios, según uso en home)

### 1) Compresión (Brotli/Gzip)

- Idealmente en **reverse proxy** (Nginx/Caddy) por eficiencia y soporte.
- Alternativa: middleware en FastAPI (ojo con CPU y streaming).

Checklist:
- [ ] Respuestas JSON comprimidas en producción
- [ ] Medir tamaño real (transfer) en mobile con Slow 4G

### 2) Cache HTTP (ETag / Cache-Control)

Aplicar sobre recursos semi-estáticos:\n- categorías\n- catálogos\n- configuración pública\n

Checklist:
- [ ] `Cache-Control` adecuado para endpoints cacheables
- [ ] `ETag` y soporte de `If-None-Match` para devolver 304
- [ ] Considerar `stale-while-revalidate` cuando tenga sentido

### 3) Paginación + filtros (control de payload)

Checklist:
- [ ] Listados paginados (limit/offset o cursor)
- [ ] Campos opcionales (evitar relaciones/payload grande si no se usan)
- [ ] Respuestas consistentes y livianas para mobile

### 4) Imágenes server-side (opcional, alto impacto)

Si hoy se suben/consumen imágenes grandes, un proxy/transform puede ahorrar mucho en mobile:\n- `?w=400&q=75&format=webp`\n- caching del resultado\n

Checklist:
- [ ] Thumbnails optimizados por ancho (`w`) y calidad (`q`)
- [ ] Headers de cache para resultados transformados

## Prioridad de Implementación

| # | Cambio | Impacto Lighthouse | Esfuerzo |
|---|---|---|---|
| 1 | Debounce en búsqueda | FID/INP alto | 5 min |
| 2 | Consolidar onMounted App.vue + parallel fetch | FCP | 10 min |
| 3 | Fuente Poppins en index.html | CLS / FOUT | 5 min |
| 4 | vite.config.ts con manualChunks | LCP / TTI | 15 min |
| 5 | width/height + loading=lazy en imágenes | CLS / LCP | 30 min |
| 6 | Comprimir imagen hero a WebP | LCP | 10 min |
| 7 | Eliminar ctaPulse box-shadow | TBT | 5 min |
| 8 | Eliminar dead code CartStore | — | 2 min |
| 9 | my.courses.page.vue sin force:true | RPC reduction | 2 min |
| 10 | npm uninstall quasar | Bundle size | 2 min |
| 11 | KeepAlive para courses | Nav timing | 15 min |

---

## Verificación End-to-End

1. **Build check**: `npm run build` — verificar que no haya chunk > 300KB
2. **Lighthouse CLI**:
   ```bash
   npx lighthouse http://localhost:3001 --only-categories=performance --form-factor=mobile
   ```
3. **Network tab**: Con throttling "Slow 4G" verificar:
   - Imagen hero carga con prioridad alta
   - Las rutas de admin solo se descargan al navegar a `/admin`
   - Búsqueda no dispara más de 1 request por término
4. **Chrome DevTools > Performance**: Confirmar que no hay frames largos (>50ms) durante el filtrado de cursos
5. **CLS check**: Usar Web Vitals extension, navegar al home y esperar carga de imágenes → CLS debe ser < 0.1

### Verificación ampliada (mobile real + PWA + backend)

#### A) Pruebas mobile UX (manuales, 10 min)

- **Tap targets**: botones/íconos “tocables” sin errores (>= 44×44px).
- **Teclado**: búsqueda con `enterkeyhint="search"` y `inputmode` correcto.
- **Preferencias del usuario**: `prefers-reduced-motion` reduce animaciones.
- **Safe area**: header/CTA no chocan con notch/barras.

Checklist:
- [ ] Tap targets OK
- [ ] Teclado OK en búsqueda/login
- [ ] Reduced motion OK
- [ ] Safe area OK

#### B) PWA

- **Instalación**: el navegador detecta manifest + SW.
- **Offline**: simular “Offline” y validar experiencia mínima.
- **Update**: desplegar cambio y validar que el SW actualiza (sin quedar pegado).

Checklist:
- [ ] App instalable
- [ ] Offline: home muestra estado razonable
- [ ] Update del SW controlado (hay señal al usuario)

#### C) Backend (bytes + cache)

- Medir **Transfer size** en red lenta.
- Validar que endpoints cacheables devuelven `Cache-Control` / `ETag` y responden 304 cuando aplica.
- Validar paginación en listados para evitar payload gigante.

Checklist:
- [ ] JSON comprimido en producción (si aplica)
- [ ] Cache headers presentes en catálogo/categorías
- [ ] 304 funciona con `If-None-Match`
- [ ] Listados paginados

---

## Archivos Modificados (Resumen)

| Archivo | Cambios |
|---|---|
| `cursosvue/vite.config.ts` | Añadir `build.rollupOptions` con `manualChunks` |
| `cursosvue/package.json` | Eliminar `quasar`, `@quasar/extras` |
| `cursosvue/index.html` | Añadir preload/stylesheet para Poppins |
| `cursosvue/src/App.vue` | Consolidar onMounted, eliminar deep watch, añadir KeepAlive |
| `cursosvue/src/store/CartStore.ts` | Eliminar watch inútil |
| `cursosvue/src/components/header/header.search.component.vue` | Añadir debounce 350ms |
| `cursosvue/src/components/auth/my.courses.page.vue` | Quitar `force: true` |
| `cursosvue/src/home/home.component.vue` | Añadir `loading="lazy"`, `width`/`height` a imágenes |
| `cursosvue/src/courses/CourseCard.vue` | Añadir dimensiones e `loading="lazy"` |
| `cursosvue/src/components/header/header.component.vue` | Añadir dimensiones al logo |
| `cursosvue/src/cart/item.component.vue` | Añadir dimensiones explícitas |
| `cursosvue/src/courses/courseInfoPage/componentCourseInfo/comments.body.component.vue` | Añadir dimensiones a avatares |
| `cursosvue/src/monetizar/ProLessonViewer.vue` | Reemplazar box-shadow animation |
| `cursosvue/src/assets/` | Convertir hero PNG → WebP |
