# Campañas de cursos

## Organización

- `pages/pilares/`: páginas de entrada de Negocios (100), Tecnología (200), Creatividad (300), Toda la Tienda (100200300), Excel/SAP (103) y Bisutería (306).
- `pages/bloques/`: una página por cada bloque (101–107, 201–207 y 301–309), con su ID en el nombre. `index.ts` registra sus importaciones dinámicas.
- `config/bloques/`: configuración independiente por ID, con presentación, rutas e instantánea de cantidades.
- `components/`: presentación compartida de rutas y cursos (`StudyCampaignPage.vue`) e icono de WhatsApp.
- `composables/`: carga bajo demanda, caché, paginación y buscador con recomendaciones.
- `config/`: textos, colores, configuración de campañas y cantidades estáticas de cursos.
- `routes/`: definiciones de rutas de estudio, clasificación de cursos y consultas compatibles con la API existente.
- `styles/`: estilos móviles compartidos.

Las páginas incluyen el ID de su categoría en el nombre:

- `BusinessCampaignPage100.vue`
- `TechnologyCampaignPage200.vue`
- `CreativeCampaignPage300.vue`
- `AllAccessCampaignPage100200300.vue`
- `ExcelSapCampaignPage103.vue`
- `BisuteriaCampaignPage306.vue`

Las pruebas permanecen junto al componente o módulo que verifican y usan el mismo ID.

## Dónde hacer cambios

- Para ajustar la presentación común de los pilares, Toda la Tienda y los bloques: `components/StudyCampaignPage.vue`.
- Para cambiar textos o rutas de Negocios y Creatividad: `config/personalizedCampaignData.json` y `config/personalizedCampaigns.ts`.
- La Ruta Excel pide primero el objetivo (trabajo actual, conseguir empleo, negocio o emprendimiento, estudio o uso personal) y después muestra los niveles. Los objetivos y sus palabras clave están en `routes/studyPurposes.ts`; los cursos que no encajan en ningún objetivo aparecen en todos. Se aplica en `/courses/103` y en `/courses/103/tematica/ex`.
- Para cambiar rutas de Tecnología: `routes/technologyRoutes.ts`; su portada y configuración están en `config/technologyCampaign.ts`.
- Toda la Tienda combina las rutas de los tres pilares en `config/personalizedCampaigns.ts`. Cada ruta consulta su catálogo de origen; la compra y los permisos corresponden al producto 100200300.
- Las cantidades iniciales están en `config/personalizedRouteCounts.json` y `config/technologyRouteCounts.json`. Se actualizan con la respuesta real al abrir cada ruta.
- Para editar un bloque: `pages/bloques/BlockCampaignPage<ID>.vue` y `config/bloques/<ID>.json`. Cada archivo de página define su identidad y carga su propia configuración.
- `config/blockCampaigns.ts` reutiliza las rutas existentes y construye las personalizadas. El catálogo, la búsqueda, la compra y los permisos utilizan siempre el ID del bloque; no el del pilar padre.
- Las rutas sin cursos se omiten según la instantánea validada. El catálogo completo permite encontrar también cursos que no encajen en una ruta.
- Excel/SAP y Bisutería conservan sus campañas especiales en `pages/pilares/`, en `/courses/103/tematica/ex` y `/courses/306/tematica`. Sus páginas principales `/courses/103` y `/courses/306` utilizan las nuevas páginas de bloques.
- Los cursos individuales con slug, los afiliados y los combos conservan la vista y navegación existentes.
- El buscador superior abre las categorías personalizadas sin slug: `q_search` conserva la palabra clave escrita, mientras `q_course` y `q_author` identifican el curso elegido. El buscador de la página consulta la palabra clave, conserva todas las rutas y coloca primero las del curso seleccionado, que también aparece antes de los niveles al abrirlas. Si ese curso no está en la página de resultados, se localiza por separado y se añade primero sin quitar coincidencias ni alterar la paginación de la palabra clave. Escribir otra búsqueda recupera el filtrado habitual; limpiar elimina estos parámetros de la URL. Los enlaces anteriores sin `q_search` conservan su comportamiento. `config/campaignLocation.ts` identifica los destinos personalizados sin cargar sus páginas ni catálogos.
- En los resultados de búsqueda antiguos, `id` identifica el pilar, mientras `pack_nombre` comienza con el bloque real (`106 | …`). El destino prioriza ese bloque cuando está registrado y usa una ruta absoluta, sin heredar el ID de la página actual. El autor desambigua cursos con el mismo título; si el índice antiguo utiliza otro autor, la selección conserva la coincidencia exacta de título del catálogo actual.

Las imágenes y sus créditos se encuentran en `public/images/campaigns/`. Las rutas públicas y las importaciones dinámicas se declaran en `src/router/course.routes.ts` y `src/courses/courseInfoPage/course.info.page.vue`.

## Verificación

Desde la raíz del frontend:

```sh
npx vitest run src/courses/campaigns src/courses/courseInfoPage/course.info.page.test.ts src/router/courseCampaignRoute.test.ts
npm run build
```

## Actualizar las cantidades de los bloques

Exportar los catálogos de solo lectura a una carpeta externa al repositorio. Cada archivo `<ID>.json` debe contener `{ "category": { "id": 101, "cantidad_cursos": 483 }, "courses": [...] }`, con todos los cursos del bloque y sus IDs únicos. Después, desde la raíz del frontend:

```sh
node scripts/refresh-block-route-counts.mjs /ruta/a/exportaciones
```

El script valida las cantidades, las coincidencias de rutas y la cobertura de sus consultas antes de escribir las instantáneas. No consulta ni modifica el backend. Las imágenes nuevas y sus licencias están en `public/images/campaigns/bloques/`; las rutas reutilizadas conservan sus archivos y créditos originales.

No colocar servicios de backend ni copias de los catálogos completos en esta carpeta.
