# Mapa de eventos para Google Tag Manager

La aplicación emite todos los eventos mediante `src/analytics/dataLayer.ts`. El
`event_id` es compartido con `POST /api/events`, por lo que las etiquetas de
navegador y los eventos server-side pueden deduplicarse.

## Eventos estándar

| Evento | Disparador en la aplicación |
| --- | --- |
| `page_view` | Cada navegación completada por Vue Router |
| `view_item_list` | Carga o cambio de filtro del catálogo |
| `select_item` | Selección de un producto del catálogo o resultados de búsqueda |
| `view_item` | Carga del detalle de un paquete |
| `add_to_cart` | El producto entra realmente al carrito |
| `view_cart` | Se abre un carrito con productos |
| `remove_from_cart` | Se elimina un producto del carrito |
| `begin_checkout` | Se abre el flujo de checkout web |
| `add_payment_info` | Se confirma el método de pago |
| `purchase` | El backend/gateway confirma el pago |
| `search` | Una búsqueda devuelve respuesta |
| `login` | Autenticación de una cuenta existente |
| `sign_up` | El backend informa que acaba de crear la cuenta |
| `generate_lead` | Captura válida en curso gratis o checkout invitado |
| `view_promotion` | Se muestra la promoción de bienvenida |
| `select_promotion` | Se acepta el CTA de la promoción |

Los eventos personalizados se convierten a `snake_case` para GTM/GA4, mientras
el backend conserva sus nombres históricos. Ejemplos: `LessonProgress` se emite
como `lesson_progress` y `CampaignCtaClick` como `campaign_cta_click`.

## Configuración sugerida del contenedor

1. Mantener una sola etiqueta **Google Tag** base para todas las páginas.
2. Crear un activador **Custom Event** para ecommerce con esta expresión:

   ```regex
   ^(view_item_list|select_item|view_item|add_to_cart|view_cart|remove_from_cart|begin_checkout|add_payment_info|purchase|view_promotion|select_promotion)$
   ```

3. Conectar el activador a una etiqueta **GA4 Event** con nombre `{{Event}}` y
   fuente de ecommerce `Data Layer`.
4. Crear otro activador permitido para eventos no ecommerce:

   ```regex
   ^(page_view|search|login|sign_up|generate_lead|referral_click|whatsapp_contact|view_course|lesson_progress|module_complete|review_submit|campaign_.*|bonus_.*|course_description_open|drive_access_.*|use_filter|toggle_free_filter|apply_coupon)$
   ```

5. Para `page_view`, mapear `page_title`, `page_location`, `page_path` y
   `page_referrer`. Desactivar el `page_view` automático de la Google Tag
   (`send_page_view: false`) y el seguimiento automático de cambios de historial
   en GA4; la aplicación ya emite tanto la vista inicial como las navegaciones SPA.
6. En Meta/Stape mapear el mismo `event_id`:

   | dataLayer | Meta |
   | --- | --- |
   | `view_item` | `ViewContent` |
   | `add_to_cart` | `AddToCart` |
   | `begin_checkout` | `InitiateCheckout` |
   | `add_payment_info` | `AddPaymentInfo` |
   | `purchase` | `Purchase` |
   | `sign_up` | `CompleteRegistration` |
   | `generate_lead` | `Lead` |
   | `whatsapp_contact` | `Contact` |

## Validación antes de publicar

En GTM Preview/Tag Assistant recorrer: catálogo → detalle → carrito/checkout →
retorno de pago. Para cada interacción comprobar el evento, los parámetros de
`ecommerce.items`, el valor, la moneda y que solo se dispare una etiqueta GA4.
La compra debe usar `event_id = purchase-<reference>` tanto en navegador como
en el evento server-side.
