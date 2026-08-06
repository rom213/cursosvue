# Configuración necesaria en Google Tag Manager

El código de la aplicación ya envía los eventos al `dataLayer`, pero Google Tag
Manager debe configurarse para escucharlos y enviarlos a GA4, Meta/Stape y,
cuando corresponda, Google Ads.

## 1. Actualizar activadores antiguos

Los eventos dejaron de usar el sufijo `_stape` y ahora emplean nombres estándar:

| Evento anterior | Evento nuevo |
| --- | --- |
| `view_item_stape` | `view_item` |
| `add_to_cart_stape` | `add_to_cart` |
| `begin_checkout_stape` | `begin_checkout` |
| `add_payment_info_stape` | `add_payment_info` |
| `purchase_stape` | `purchase` |
| `contact_stape` | `whatsapp_contact` |

Los activadores existentes que escuchen los nombres anteriores deben actualizarse.

## 2. Crear el activador de ecommerce

Crear un activador de tipo **Evento personalizado**, habilitar coincidencia con
expresión regular y utilizar:

```regex
^(view_item_list|select_item|view_item|add_to_cart|view_cart|remove_from_cart|begin_checkout|add_payment_info|purchase|view_promotion|select_promotion)$
```

## 3. Crear la etiqueta de eventos GA4 de ecommerce

Crear una etiqueta **GA4 Event** asociada al activador anterior:

```text
Event name: {{Event}}
Ecommerce data: Data Layer
```

La etiqueta debe tomar del objeto `ecommerce` los siguientes campos cuando estén
disponibles:

- `currency`
- `value`
- `transaction_id`
- `payment_type`
- `item_list_id`
- `item_list_name`
- `items`

## 4. Crear el activador para eventos no ecommerce

Crear otro activador de tipo **Evento personalizado** con esta expresión:

```regex
^(page_view|search|login|sign_up|generate_lead|referral_click|whatsapp_contact|view_course|lesson_progress|module_complete|review_submit|campaign_.*|bonus_.*|course_description_open|drive_access_.*|use_filter|toggle_free_filter|apply_coupon)$
```

Conectarlo a una etiqueta GA4 cuyo nombre de evento sea `{{Event}}`. Solo deben
mapearse como parámetros las variables permitidas para cada evento; datos como
correo, teléfono, nombre o identificadores de usuario no deben enviarse como
parámetros de GA4.

## 5. Configurar las vistas de la SPA

Crear variables de capa de datos para:

| Parámetro GA4 | Variable de GTM sugerida |
| --- | --- |
| `page_title` | `{{DLV - page_title}}` |
| `page_location` | `{{DLV - page_location}}` |
| `page_path` | `{{DLV - page_path}}` |
| `page_referrer` | `{{DLV - page_referrer}}` |

La aplicación Vue ya emite `page_view` tanto para la carga inicial como para
cada navegación interna. Para evitar vistas duplicadas se debe:

1. Configurar `send_page_view: false` en la Google Tag.
2. Desactivar en GA4 **Page changes based on browser history events**.
3. Verificar que solo la etiqueta controlada por el evento `page_view` envíe las vistas.

## 6. Configurar Meta/Stape

Crear o actualizar las etiquetas con este mapeo:

| Evento del `dataLayer` | Evento de Meta |
| --- | --- |
| `view_item` | `ViewContent` |
| `add_to_cart` | `AddToCart` |
| `begin_checkout` | `InitiateCheckout` |
| `add_payment_info` | `AddPaymentInfo` |
| `purchase` | `Purchase` |
| `sign_up` | `CompleteRegistration` |
| `generate_lead` | `Lead` |
| `whatsapp_contact` | `Contact` |

Todas las etiquetas de Meta/Stape deben recibir:

```text
event_id → {{DLV - event_id}}
```

Para eventos de comercio también deben mapear, cuando existan:

- `value`
- `currency`
- `content_ids` o `items`
- `transaction_id`

En `purchase`, el `event_id` esperado tiene el formato:

```text
purchase-<referencia>
```

El mismo identificador es utilizado por el evento server-side para deduplicar
la conversión del navegador frente a CAPI.

## 7. Definir los eventos clave en GA4

Se recomienda marcar como eventos clave:

- `purchase`
- `generate_lead`
- `sign_up`

Según los objetivos comerciales también pueden marcarse:

- `begin_checkout`
- `whatsapp_contact`

## 8. Validar antes de publicar

Abrir el modo **Preview** de GTM y recorrer el flujo completo:

```text
Catálogo
→ select_item
→ view_item
→ add_to_cart o begin_checkout
→ add_payment_info
→ purchase
```

Para cada paso se debe comprobar:

- El evento aparece una sola vez en el `dataLayer`.
- Solo se dispara una etiqueta GA4 para ese evento.
- `event_id` está presente y coincide entre navegador y backend.
- `currency`, `value` e `items` contienen valores correctos.
- `purchase` contiene una referencia real en `transaction_id`.
- Meta Browser y CAPI muestran el evento como deduplicado.
- La navegación interna de Vue produce exactamente un `page_view` por pantalla.

No se debe publicar el contenedor hasta completar esta validación en Preview y
comprobar los eventos en GA4 DebugView.
