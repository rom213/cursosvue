# Cursos gratis (acceso por correo) y eliminación de la "Vista previa"

> Documento de especificación. **No implementar todavía** — describe los cambios a realizar.

---

## 1. Cursos gratis (`es_gratis: true`)

### Objetivo
Algunos cursos tendrán el atributo `es_gratis` en `true`. Para estos cursos el usuario
podrá acceder al **link del curso de forma directa**, pero **antes** debe pasar por un
formulario simple que actúa como "puerta de entrada" (gate).

El atributo ya existe en los tipos:

- `ICursoSubcategoria.es_gratis?: boolean` — [src/types/Categorie.ts:24](../src/types/Categorie.ts#L24)
- `ICategoryCourseDetail.es_gratis?: boolean` — [src/types/Categorie.ts:43](../src/types/Categorie.ts#L43)

### Formulario previo al acceso
El formulario debe contener únicamente:

1. **Campo de correo electrónico** — **obligatorio**.
   - Es solo un requisito de entrada: el correo **no se usa para nada funcional**, pero
     el campo no puede quedar vacío para poder continuar y que sea un corro valido.
2. **Botón "Ver curso"** — al pulsarlo (con el correo completado) se habilita/abre el
   link del curso de forma directa.
3. **Frase de bienvenida** (ver abajo, versión mejorada).

### Frase de bienvenida (versión mejorada)

> **¡Aquí tienes tu curso! 🎉**
>
> Esta es una pequeña muestra de todo lo que preparamos para ti. Te prometemos la mejor
> experiencia para tu educación, con contenido pensado para que aprendas a tu propio ritmo.
> Puedes **descargar el curso** cuando quieras y conservarlo siempre.
>
> Explora nuestra web y llévate el **pack de cursos** que más se ajuste a tus metas. Y si
> lo tuyo es estudiar mientras generas ingresos, te invitamos a conocer nuestro **modelo de
> reventa de cursos**.

(Frase original del cliente, conservada como referencia: *"aqui esta tu curso, te prometemos
la mejor experiencia para tu educacion, puedes descargar el curso si asi lo deseas, explora
nuestra web y llevate el pack de cursos que mas te guste, si lo tuyo es es estudiar y trabajar
te invitamos tambien a conocer nuestro modelo de reventa de cursos."*)

### Comportamiento esperado (resumen)
1. El usuario abre un curso con `es_gratis: true`.
2. Se muestra el formulario con la frase de bienvenida + campo de correo (obligatorio) +
   botón **"Ver curso"**.
3. Validar que el correo no esté vacío (formato de email válido).
4. Al confirmar, se da acceso directo al link del curso.

---

## 2. Eliminar la "Vista previa" (drive preview)

La funcionalidad de **vista previa** ya no se usará en el sistema. Hay que **eliminar el
código** relacionado. A continuación, el inventario de ubicaciones detectadas para
guiar la limpieza:

### Tipos / Store
- [src/types/Auth.ts:24](../src/types/Auth.ts#L24) — campo `vista_previa_drive: number`.
- [src/store/AuthStore.ts:17](../src/store/AuthStore.ts#L17) — `profile.value.user.vista_previa_drive = 0;`.

### Servicio
- [src/services/GuestCheckoutService.ts](../src/services/GuestCheckoutService.ts)
  - `interface GuestDrivePreviewResponse` (línea ~27).
  - `static async registerDrivePreview(...)` (línea ~64) y su llamada a
    `/guest-checkout/drive-preview`.

### Página de información del curso
- [src/courses/courseInfoPage/course.info.page.vue](../src/courses/courseInfoPage/course.info.page.vue)
  - `showPreviewWarning` (línea ~60), `previewTimeoutId` (línea ~62).
  - `guestPreviewError`, `isSubmittingGuestPreview` (líneas ~630–631).
  - `resetGuestPreviewForm()` (línea ~635), `submitGuestPreview()` (línea ~642).
  - `handlePreview(...)` y la lógica que usa `vista_previa_drive === 1` (líneas ~734–746).
  - Cualquier template/modal asociado a estas variables.

### Componente de imagen del curso
- [src/courses/courseInfoPage/componentCourseInfo/course.img.component.vue](../src/courses/courseInfoPage/componentCourseInfo/course.img.component.vue)
  - Texto "Vista previa de los cursos en tu drive" (línea ~72).
  - Botón/etiqueta "VISTA PREVIA" (línea ~138).

### Cards de curso
- [src/courses/CourseCard.vue:39](../src/courses/CourseCard.vue#L39) — emit `(e: 'preview', category: ICategory)`.
- [src/monetizar/CourseCardMonitizar.vue](../src/monetizar/CourseCardMonitizar.vue)
  - emit `'preview'` (línea ~43).
  - estado `previewCopied`, `copyPreviewLink()` (líneas ~128–140).
  - bloque template "Vista previa en Drive - Copiar link" (líneas ~311–324).
- [src/monetizar/MonetizarCatalogo.vue](../src/monetizar/MonetizarCatalogo.vue)
  - `handlePreview(item)` (línea ~238) y binding `@preview="handlePreview"` (línea ~361).

### Iconos
- [src/courses/courseIcons.ts:2](../src/courses/courseIcons.ts#L2) — icono `preview` (SVG).

### Notas de limpieza
- Eliminar emits `'preview'`, handlers `handlePreview`, estados y funciones de copia/preview.
- Quitar imports que queden sin uso tras borrar el código (p. ej. `courseIcons.preview`,
  `GuestCheckoutService.registerDrivePreview`).
- Revisar que no queden referencias a `vista_previa_drive` ni a la ruta de API
  `/guest-checkout/drive-preview`.
- Verificar que la app compile (TypeScript) tras la eliminación.

---

## 3. Pendientes / preguntas abiertas
- Definir si el "acceso directo" del curso gratis abre el link en nueva pestaña o navega
  internamente.
- Confirmar de dónde se obtiene el link del curso gratis (campo `info_tecnica.url`).
- Confirmar si el correo del formulario debe enviarse a algún endpoint o solo validarse en
  el front (según el requerimiento actual: solo obligatorio, sin uso funcional).
