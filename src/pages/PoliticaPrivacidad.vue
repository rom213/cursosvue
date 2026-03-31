<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="legal-page">
    <div class="legal-container">

      <header class="legal-header">
        <RouterLink :to="{ name: 'home' }" class="legal-back">&larr; Volver al inicio</RouterLink>
        <h1 class="legal-title">Política de Privacidad y Tratamiento de Datos Personales</h1>
        <p class="legal-subtitle">Cursos Estudia y Trabaja</p>
        <p class="legal-date">Última actualización: 29 de marzo de 2026</p>
      </header>

      <!-- PREÁMBULO -->
      <section class="legal-section">
        <p>
          La presente Política de Privacidad y Tratamiento de Datos Personales (en adelante, la <strong>"Política"</strong>)
          describe cómo <strong>"Cursos Estudia y Trabaja"</strong> (en adelante, <strong>"la Plataforma"</strong> o
          <strong>"el Responsable"</strong>) recopila, utiliza, almacena, protege y, en general, trata los datos
          personales de sus Usuarios, de conformidad con la <strong>Ley Estatutaria 1581 de 2012</strong> (Ley de
          Protección de Datos Personales), el <strong>Decreto 1377 de 2013</strong> (reglamentario de la Ley 1581)
          y demás normativa aplicable en la República de Colombia.
        </p>
        <p>
          Al utilizar la Plataforma, el Usuario autoriza de manera expresa, previa e informada el tratamiento de sus
          datos personales conforme a los términos de esta Política. Esta Política forma parte integral de los
          <RouterLink :to="{ name: 'terminos' }" class="legal-link">Términos y Condiciones de Uso</RouterLink>
          de la Plataforma.
        </p>
      </section>

      <!-- ÍNDICE -->
      <nav class="legal-toc">
        <h2 class="legal-toc-title">Índice</h2>
        <ol class="legal-toc-list">
          <li><a href="#priv1">Responsable del Tratamiento</a></li>
          <li><a href="#priv2">Datos Personales Recopilados</a></li>
          <li><a href="#priv3">Finalidades del Tratamiento</a></li>
          <li><a href="#priv4">Base Legal del Tratamiento</a></li>
          <li><a href="#priv5">Transferencia y Transmisión Internacional de Datos</a></li>
          <li><a href="#priv6">Almacenamiento y Medidas de Seguridad</a></li>
          <li><a href="#priv7">Derechos del Titular (Habeas Data)</a></li>
          <li><a href="#priv8">Cookies y Tecnologías de Almacenamiento Local</a></li>
          <li><a href="#priv9">Chatbot Clarita — Tratamiento Específico</a></li>
          <li><a href="#priv10">Protección de Datos de Menores</a></li>
          <li><a href="#priv11">Retención y Eliminación de Datos</a></li>
          <li><a href="#priv12">Modificaciones a la Política</a></li>
        </ol>
      </nav>

      <!-- SECCIÓN 1 -->
      <section id="priv1" class="legal-section">
        <h2 class="legal-section-title">1. Responsable del Tratamiento</h2>
        <div class="legal-info-box">
          <p><strong>Nombre o Razón Social:</strong> [RAZÓN SOCIAL EN TRÁMITE DE REGISTRO]</p>
          <p><strong>NIT:</strong> [EN TRÁMITE]</p>
          <p><strong>Domicilio:</strong> Bogotá D.C., Colombia</p>
          <p><strong>Correo electrónico para asuntos de datos personales:</strong> cursosestudiaytrabaja@gmail.com</p>
          <p><strong>WhatsApp:</strong> +57 313 414 1912</p>
          <p><strong>Sitio web:</strong> cursosestudiaytrabaja.com</p>
        </div>
        <p>
          El Responsable del Tratamiento es la persona natural o jurídica que decide sobre la base de datos y/o el
          tratamiento de los datos personales. Para todos los efectos legales, el canal de atención para el ejercicio
          de derechos de Habeas Data es el correo electrónico indicado anteriormente.
        </p>
      </section>

      <!-- SECCIÓN 2 -->
      <section id="priv2" class="legal-section">
        <h2 class="legal-section-title">2. Datos Personales Recopilados</h2>
        <p>
          La Plataforma recopila las siguientes categorías de datos personales, según la funcionalidad utilizada
          por el Usuario:
        </p>

        <h3 class="legal-subsection-title">2.1 Datos de Identidad</h3>
        <p>Obtenidos automáticamente a través del inicio de sesión con Google OAuth:</p>
        <ul>
          <li>Nombre completo y nombre de pila</li>
          <li>Dirección de correo electrónico</li>
          <li>Identificador único de Google (Google ID)</li>
          <li>URL de la fotografía de perfil de Google</li>
        </ul>

        <h3 class="legal-subsection-title">2.2 Datos de Contacto</h3>
        <p>Proporcionados voluntariamente por el Usuario:</p>
        <ul>
          <li>Número de teléfono WhatsApp con prefijo de país</li>
        </ul>

        <h3 class="legal-subsection-title">2.3 Datos de Ubicación</h3>
        <ul>
          <li><strong>País de origen:</strong> Determinado de forma aproximada a partir de la dirección IP del Usuario
            mediante el servicio externo ipinfo.io. Esta información se utiliza exclusivamente para determinar la
            moneda de pago y la pasarela de pago disponible (PayU para Colombia, PayPal para otros países).
            <strong>No se almacena la dirección IP</strong> del Usuario de forma permanente.</li>
        </ul>

        <h3 class="legal-subsection-title">2.4 Datos Financieros</h3>
        <p>Proporcionados voluntariamente por Usuarios que participan en el programa de afiliados:</p>
        <ul>
          <li>Tipo de cuenta o billetera digital (Nequi, DaviPlata o Llave Electrónica)</li>
          <li>Número de cuenta o billetera digital</li>
          <li>Nombre del titular de la cuenta</li>
        </ul>
        <p>
          <strong>NOTA IMPORTANTE:</strong> La Plataforma <strong>NO</strong> recopila ni almacena datos de tarjetas
          de crédito o débito. Todo el procesamiento de pagos se realiza directamente en las plataformas certificadas
          de PayU y PayPal.
        </p>

        <h3 class="legal-subsection-title">2.5 Datos Transaccionales</h3>
        <p>Generados automáticamente al realizar compras:</p>
        <ul>
          <li>Referencia de la transacción y firma de verificación</li>
          <li>Monto pagado y moneda utilizada</li>
          <li>Estado de la transacción (exitosa, fallida, reembolsada)</li>
          <li>Fecha y hora de la transacción</li>
          <li>Productos adquiridos (Packs de Cursos)</li>
          <li>Información de error en caso de transacciones fallidas</li>
        </ul>

        <h3 class="legal-subsection-title">2.6 Datos de Comunicaciones con Chatbot</h3>
        <p>Recopilados cuando el Usuario interactúa con el chatbot "Clarita":</p>
        <ul>
          <li>Correo electrónico del Usuario (como identificador de la conversación)</li>
          <li>Nombre y fotografía de perfil</li>
          <li>Historial de mensajes de la conversación</li>
          <li>Fecha y hora de cada mensaje</li>
        </ul>
        <p>Para más detalles, consulte la <a href="#priv9" class="legal-link">Sección 9</a> de esta Política.</p>

        <h3 class="legal-subsection-title">2.7 Datos de Opiniones y Reseñas</h3>
        <ul>
          <li>Texto de comentarios o reseñas publicados sobre los cursos</li>
          <li>Calificación (número de estrellas)</li>
        </ul>

        <h3 class="legal-subsection-title">2.8 Datos del Programa de Referidos</h3>
        <ul>
          <li>Código de referido único asignado al Afiliado</li>
          <li>Porcentaje de comisión</li>
          <li>Registro de ventas referidas y comisiones generadas</li>
          <li>Estado de pago de comisiones</li>
        </ul>

        <h3 class="legal-subsection-title">2.9 Datos de Verificación</h3>
        <ul>
          <li>Códigos de verificación de identidad (almacenados con cifrado SHA-256, no en texto legible)</li>
          <li>Marca temporal de emisión y expiración del código (validez de 3 minutos)</li>
        </ul>
      </section>

      <!-- SECCIÓN 3 -->
      <section id="priv3" class="legal-section">
        <h2 class="legal-section-title">3. Finalidades del Tratamiento</h2>
        <p>Los datos personales recopilados se utilizan para las siguientes finalidades:</p>

        <h3 class="legal-subsection-title">3.1 Finalidades Necesarias (Contractuales)</h3>
        <ul>
          <li>Crear y gestionar la cuenta del Usuario en la Plataforma.</li>
          <li>Autenticar la identidad del Usuario mediante Google OAuth.</li>
          <li>Procesar las compras y gestionar las transacciones de pago.</li>
          <li>Otorgar y administrar el acceso al Contenido Digital adquirido (Google Groups y Google Drive).</li>
          <li>Administrar el programa de afiliados, calcular comisiones y procesar pagos a los Afiliados.</li>
          <li>Procesar solicitudes de reembolso y reversiones de pago.</li>
          <li>Determinar el país del Usuario para la selección de moneda y pasarela de pago.</li>
          <li>Emitir certificados de finalización.</li>
          <li>Atender consultas, quejas y solicitudes del Usuario a través de los canales de soporte.</li>
        </ul>

        <h3 class="legal-subsection-title">3.2 Finalidades de Interés Legítimo</h3>
        <ul>
          <li>Prevenir el fraude, el uso abusivo de la Plataforma y la piratería de contenido.</li>
          <li>Garantizar la seguridad técnica de la Plataforma y sus sistemas.</li>
          <li>Mejorar la experiencia del Usuario y la calidad del servicio.</li>
          <li>Realizar análisis internos sobre el uso de la Plataforma (sin identificación individual).</li>
        </ul>

        <h3 class="legal-subsection-title">3.3 Finalidades de Comunicación</h3>
        <ul>
          <li>Enviar notificaciones sobre actualizaciones de contenido, cambios en el servicio o mantenimiento programado.</li>
          <li>Enviar códigos de verificación para operaciones que requieran confirmación de identidad.</li>
          <li>Comunicar cambios en estos Términos o en la Política de Privacidad.</li>
        </ul>

        <h3 class="legal-subsection-title">3.4 Finalidades Excluidas</h3>
        <div class="legal-info-box">
          <p>La Plataforma <strong>NO</strong> utiliza los datos personales para:</p>
          <ul>
            <li>Vender, alquilar o compartir bases de datos con terceros para fines publicitarios o de marketing.</li>
            <li>Enviar publicidad no solicitada o correos masivos con fines comerciales de terceros.</li>
            <li>Crear perfiles publicitarios o de comportamiento para su comercialización.</li>
            <li>Tomar decisiones automatizadas que produzcan efectos jurídicos sobre el Usuario sin intervención humana.</li>
          </ul>
        </div>
      </section>

      <!-- SECCIÓN 4 -->
      <section id="priv4" class="legal-section">
        <h2 class="legal-section-title">4. Base Legal del Tratamiento</h2>
        <p>
          El tratamiento de datos personales por parte de la Plataforma se fundamenta en las siguientes bases
          legales, de conformidad con la Ley 1581 de 2012:
        </p>
        <ul>
          <li>
            <strong>Consentimiento expreso del Titular (Art. 9):</strong> Otorgado al registrarse en la Plataforma
            mediante Google OAuth y al aceptar esta Política de Privacidad. El consentimiento es libre, previo,
            expreso e informado.
          </li>
          <li>
            <strong>Ejecución de un contrato (Art. 10, literal a):</strong> El tratamiento es necesario para la
            prestación del servicio contratado (entrega de Packs de Cursos, programa de afiliados, procesamiento
            de pagos y reembolsos).
          </li>
          <li>
            <strong>Interés legítimo del Responsable:</strong> Para la prevención del fraude, la seguridad de
            la Plataforma y la mejora del servicio, siempre que prevalezcan sobre los derechos del Titular.
          </li>
          <li>
            <strong>Obligación legal:</strong> Cuando la ley exija conservar datos para cumplir obligaciones
            tributarias, contables o de protección al consumidor (Ley 1480 de 2011, normativa tributaria colombiana).
          </li>
        </ul>
      </section>

      <!-- SECCIÓN 5 -->
      <section id="priv5" class="legal-section">
        <h2 class="legal-section-title">5. Transferencia y Transmisión Internacional de Datos</h2>
        <p>
          Para la prestación del servicio, la Plataforma comparte datos personales con los siguientes terceros
          y/o realiza transferencias internacionales de datos. De conformidad con el <strong>Decreto 1377 de
          2013 (Art. 24)</strong>, el Usuario autoriza expresamente estas transferencias al aceptar esta Política.
        </p>

        <div class="legal-table-wrapper">
          <table class="legal-table">
            <thead>
              <tr>
                <th>Tercero / Servicio</th>
                <th>Datos Compartidos</th>
                <th>Finalidad</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Google</strong> (OAuth, Groups, Drive)</td>
                <td>Nombre, email, foto de perfil, Google ID</td>
                <td>Autenticación, gestión de acceso al contenido, almacenamiento de materiales</td>
                <td>Estados Unidos</td>
              </tr>
              <tr>
                <td><strong>PayU</strong></td>
                <td>Email del comprador, referencia de transacción, monto</td>
                <td>Procesamiento de pagos en Colombia</td>
                <td>Colombia / Latam</td>
              </tr>
              <tr>
                <td><strong>PayPal</strong></td>
                <td>Datos de transacción, montos, ítems de compra</td>
                <td>Procesamiento de pagos internacionales</td>
                <td>Estados Unidos</td>
              </tr>
              <tr>
                <td><strong>Servicio de IA</strong> (Chatbot Clarita)</td>
                <td>Email, nombre, foto de perfil, mensajes del chat</td>
                <td>Procesamiento de respuestas del chatbot de soporte</td>
                <td>Servicio en la nube (ver Sección 9)</td>
              </tr>
              <tr>
                <td><strong>ipinfo.io</strong></td>
                <td>Dirección IP (no almacenada permanentemente)</td>
                <td>Detección de país para selección de moneda y pasarela de pago</td>
                <td>Estados Unidos</td>
              </tr>
              <tr>
                <td><strong>ExchangeRate-API</strong></td>
                <td>Ningún dato personal</td>
                <td>Obtención de tasas de cambio de moneda</td>
                <td>Estados Unidos</td>
              </tr>
              <tr>
                <td><strong>Google Fonts</strong></td>
                <td>Dirección IP (solicitud del navegador)</td>
                <td>Carga de fuentes tipográficas para la interfaz</td>
                <td>Estados Unidos</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Los terceros mencionados cuentan con sus propias políticas de privacidad y medidas de seguridad. La
          Plataforma exige que estos terceros traten los datos conforme a estándares adecuados de protección.
          Las transferencias a Estados Unidos se consideran permitidas dado que dicho país ofrece niveles
          adecuados de protección de datos según los estándares internacionales reconocidos.
        </p>
      </section>

      <!-- SECCIÓN 6 -->
      <section id="priv6" class="legal-section">
        <h2 class="legal-section-title">6. Almacenamiento y Medidas de Seguridad</h2>

        <h3 class="legal-subsection-title">6.1 Infraestructura de Almacenamiento</h3>
        <p>
          Los datos personales se almacenan en bases de datos protegidas con las siguientes medidas de seguridad:
        </p>
        <ul>
          <li><strong>Cifrado en tránsito:</strong> Todas las comunicaciones entre el Usuario y la Plataforma se
            realizan mediante protocolo HTTPS (TLS/SSL).</li>
          <li><strong>Autenticación segura:</strong> Los tokens de acceso (JWT) se generan con algoritmo HS256 y
            tienen una vigencia limitada de siete (7) días.</li>
          <li><strong>Cifrado de datos sensibles:</strong> Los códigos de verificación y las direcciones de correo
            electrónico asociadas a dichos códigos se almacenan con cifrado SHA-256 (hash irreversible).</li>
          <li><strong>Control de acceso:</strong> El acceso a las bases de datos está restringido al personal
            técnico autorizado mediante credenciales seguras.</li>
          <li><strong>Delegación de datos de pago:</strong> Los datos de tarjetas de crédito y débito son
            procesados exclusivamente por PayU y PayPal, cumpliendo con el estándar PCI-DSS. La Plataforma
            nunca tiene acceso a esta información.</li>
        </ul>

        <h3 class="legal-subsection-title">6.2 Compromiso de Mejora Continua</h3>
        <p>
          La Plataforma se compromete a implementar de manera progresiva mejoras en sus medidas de seguridad,
          incluyendo el cifrado de datos financieros de afiliados (números de cuenta) y la adopción de prácticas
          de seguridad adicionales conforme a los avances tecnológicos y las mejores prácticas de la industria.
        </p>
      </section>

      <!-- SECCIÓN 7 -->
      <section id="priv7" class="legal-section">
        <h2 class="legal-section-title">7. Derechos del Titular (Habeas Data)</h2>
        <p>
          De conformidad con el <strong>Artículo 8 de la Ley 1581 de 2012</strong>, el Titular de los datos
          personales tiene los siguientes derechos:
        </p>

        <h3 class="legal-subsection-title">7.1 Derechos ARCO</h3>
        <ul>
          <li>
            <strong>Acceso:</strong> Conocer qué datos personales tiene la Plataforma almacenados, su uso y
            el estado actual del tratamiento (si están siendo utilizados, compartidos, etc.).
          </li>
          <li>
            <strong>Rectificación:</strong> Solicitar la corrección o actualización de datos personales
            inexactos, incompletos o desactualizados.
          </li>
          <li>
            <strong>Cancelación (Supresión):</strong> Solicitar la eliminación de sus datos personales cuando:
            <ul>
              <li>Los datos ya no son necesarios para la finalidad para la cual fueron recopilados.</li>
              <li>El Titular revoca el consentimiento otorgado.</li>
              <li>Se determina que los datos fueron tratados ilícitamente.</li>
            </ul>
          </li>
          <li>
            <strong>Oposición:</strong> Oponerse al tratamiento de sus datos para finalidades específicas,
            siempre que exista un motivo legítimo y fundado.
          </li>
          <li>
            <strong>Revocación del consentimiento:</strong> Revocar en cualquier momento la autorización
            otorgada para el tratamiento de sus datos personales, lo cual podrá implicar la imposibilidad
            de continuar prestando el servicio.
          </li>
        </ul>

        <h3 class="legal-subsection-title">7.2 Procedimiento para Ejercer los Derechos</h3>
        <p>Para ejercer cualquiera de los derechos mencionados, el Titular deberá:</p>
        <ol>
          <li>Enviar una solicitud escrita al correo electrónico: <strong>cursosestudiaytrabaja@gmail.com</strong></li>
          <li>
            Incluir en la solicitud:
            <ul>
              <li>Nombre completo del Titular</li>
              <li>Correo electrónico registrado en la Plataforma</li>
              <li>Descripción clara del derecho que desea ejercer</li>
              <li>Documentos que soporten la solicitud (si aplica)</li>
            </ul>
          </li>
        </ol>

        <h3 class="legal-subsection-title">7.3 Plazos de Respuesta</h3>
        <p>
          De conformidad con la Ley 1581 de 2012:
        </p>
        <ul>
          <li><strong>Consultas (derecho de acceso):</strong> La Plataforma responderá en un plazo máximo de
            <strong>diez (10) días hábiles</strong> contados a partir del día siguiente a la recepción de la solicitud.</li>
          <li><strong>Reclamos (rectificación, cancelación, oposición):</strong> La Plataforma responderá en un plazo
            máximo de <strong>quince (15) días hábiles</strong> contados a partir del día siguiente a la recepción
            del reclamo.</li>
          <li>En ambos casos, cuando no fuere posible atender la solicitud dentro del plazo indicado, se informará
            al interesado los motivos de la demora y la fecha en que se atenderá, la cual no podrá superar los
            <strong>cinco (5) días hábiles</strong> siguientes al vencimiento del primer plazo.</li>
        </ul>

        <h3 class="legal-subsection-title">7.4 Consecuencias de la Eliminación de Datos</h3>
        <div class="legal-warning-box">
          <p>
            <strong>IMPORTANTE:</strong> Al solicitar la eliminación de datos personales o revocar el consentimiento
            para su tratamiento, se producirán las siguientes consecuencias:
          </p>
          <ul>
            <li>Se revocará <strong>inmediatamente</strong> el acceso a todas las unidades compartidas de Google Drive,
              ya que el correo electrónico es indispensable para gestionar los permisos de acceso.</li>
            <li>Se desactivará la cuenta del Usuario en la Plataforma.</li>
            <li>Se cancelará la participación en el programa de afiliados (si aplica).</li>
            <li>Los datos que deban conservarse por obligación legal (registros de transacciones, datos tributarios)
              se mantendrán por el período legalmente exigido, tras el cual serán eliminados.</li>
          </ul>
        </div>

        <h3 class="legal-subsection-title">7.5 Autoridad de Protección de Datos</h3>
        <p>
          Si el Titular considera que la Plataforma no ha atendido adecuadamente su solicitud, tiene derecho
          a presentar una queja ante la <strong>Superintendencia de Industria y Comercio (SIC)</strong>,
          autoridad encargada de vigilar el cumplimiento de la normativa de protección de datos en Colombia.
        </p>
        <div class="legal-info-box">
          <p><strong>Superintendencia de Industria y Comercio</strong></p>
          <p>Sitio web: www.sic.gov.co</p>
          <p>Línea gratuita: 018000 910165</p>
        </div>
      </section>

      <!-- SECCIÓN 8 -->
      <section id="priv8" class="legal-section">
        <h2 class="legal-section-title">8. Cookies y Tecnologías de Almacenamiento Local</h2>

        <h3 class="legal-subsection-title">8.1 Uso de Almacenamiento Local (localStorage)</h3>
        <p>
          La Plataforma utiliza la tecnología de almacenamiento local del navegador (localStorage) para las
          siguientes funciones estrictamente necesarias:
        </p>
        <div class="legal-table-wrapper">
          <table class="legal-table">
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Finalidad</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Token de autenticación (JWT)</td>
                <td>Mantener la sesión activa del Usuario sin necesidad de iniciar sesión repetidamente</td>
                <td>7 días (caduca automáticamente)</td>
              </tr>
              <tr>
                <td>Identificador de afiliado</td>
                <td>Rastrear la referencia del afiliado que recomendó al Usuario</td>
                <td>Hasta que se completa la compra</td>
              </tr>
              <tr>
                <td>Ruta de referido</td>
                <td>Redirigir al Usuario al producto recomendado por el afiliado</td>
                <td>Hasta que se completa la redirección</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="legal-subsection-title">8.2 Cookies de Terceros</h3>
        <p>
          La Plataforma en sí <strong>no establece cookies</strong> propias para seguimiento o analítica. Sin
          embargo, los servicios de terceros integrados pueden establecer sus propias cookies:
        </p>
        <ul>
          <li><strong>Google OAuth:</strong> Cookies necesarias para el proceso de inicio de sesión con Google.</li>
          <li><strong>PayU / PayPal:</strong> Cookies establecidas durante el proceso de pago en sus respectivas plataformas.</li>
          <li><strong>Google Fonts:</strong> Posibles cookies de rendimiento al cargar fuentes tipográficas.</li>
        </ul>
        <p>
          Estas cookies son gestionadas por sus respectivos proveedores y están sujetas a sus propias políticas
          de privacidad.
        </p>

        <h3 class="legal-subsection-title">8.3 Analítica y Seguimiento</h3>
        <p>
          La Plataforma <strong>NO</strong> utiliza actualmente servicios de analítica de terceros como Google
          Analytics, Facebook Pixel, ni herramientas similares de seguimiento de comportamiento del Usuario.
        </p>
      </section>

      <!-- SECCIÓN 9 -->
      <section id="priv9" class="legal-section">
        <h2 class="legal-section-title">9. Chatbot Clarita — Tratamiento Específico de Datos</h2>

        <h3 class="legal-subsection-title">9.1 Descripción del Servicio</h3>
        <p>
          "Clarita" es un asistente virtual con inteligencia artificial integrado en la Plataforma que proporciona
          soporte, orientación sobre cursos y asistencia al Usuario en tiempo real.
        </p>

        <h3 class="legal-subsection-title">9.2 Datos Recopilados por Clarita</h3>
        <p>Al interactuar con Clarita, se recopilan los siguientes datos:</p>
        <ul>
          <li>Dirección de correo electrónico (utilizada como identificador de la conversación)</li>
          <li>Nombre completo del Usuario</li>
          <li>URL de la fotografía de perfil</li>
          <li>Contenido completo de los mensajes enviados por el Usuario</li>
          <li>Fecha y hora de cada interacción</li>
        </ul>

        <h3 class="legal-subsection-title">9.3 Procesamiento de Datos</h3>
        <div class="legal-warning-box">
          <p>
            <strong>AVISO IMPORTANTE:</strong> Los mensajes enviados a Clarita son transmitidos a un servicio
            externo de procesamiento de inteligencia artificial alojado en la nube para generar las respuestas.
            Esto implica que el contenido de las conversaciones es procesado por un sistema automatizado fuera
            de los servidores propios de la Plataforma.
          </p>
        </div>
        <p>Los datos del chatbot se utilizan exclusivamente para:</p>
        <ul>
          <li>Generar respuestas relevantes y contextuales a las consultas del Usuario.</li>
          <li>Proporcionar recomendaciones de cursos y soporte técnico.</li>
          <li>Mejorar la calidad de las respuestas del asistente.</li>
        </ul>

        <h3 class="legal-subsection-title">9.4 Control del Usuario</h3>
        <p>El Usuario puede:</p>
        <ul>
          <li><strong>Reiniciar la conversación:</strong> Borrar el historial de la conversación actual con Clarita
            en cualquier momento utilizando la función de reinicio disponible en la interfaz del chatbot.</li>
          <li><strong>No utilizar el servicio:</strong> La interacción con Clarita es completamente voluntaria.
            El Usuario puede optar por no utilizar el chatbot y comunicarse a través de los otros canales de soporte
            (WhatsApp, correo electrónico).</li>
        </ul>

        <h3 class="legal-subsection-title">9.5 Recomendaciones de Seguridad</h3>
        <p>
          Se recomienda a los Usuarios <strong>no compartir información personal sensible</strong> (números de
          identificación, contraseñas, datos bancarios completos) a través del chatbot. Para asuntos que requieran
          el manejo de información confidencial, por favor utilice los canales de comunicación directa (WhatsApp
          o correo electrónico).
        </p>
      </section>

      <!-- SECCIÓN 10 -->
      <section id="priv10" class="legal-section">
        <h2 class="legal-section-title">10. Protección de Datos de Menores</h2>
        <p>
          De conformidad con el <strong>Artículo 7 de la Ley 1581 de 2012</strong>, la Plataforma reconoce la
          especial protección que merecen los datos personales de niños, niñas y adolescentes.
        </p>
        <p>
          La Plataforma <strong>no está dirigida a menores de dieciocho (18) años</strong>. No recopilamos
          intencionalmente datos de menores de edad. Si la Plataforma tiene conocimiento de que ha recopilado
          datos personales de un menor sin la autorización del representante legal, procederá a eliminar dichos
          datos de forma inmediata.
        </p>
        <p>
          Si usted es padre, madre o tutor legal y tiene conocimiento de que un menor bajo su responsabilidad
          se ha registrado en la Plataforma, le rogamos se comunique a cursosestudiaytrabaja@gmail.com para
          proceder con la eliminación de los datos.
        </p>
      </section>

      <!-- SECCIÓN 11 -->
      <section id="priv11" class="legal-section">
        <h2 class="legal-section-title">11. Retención y Eliminación de Datos</h2>

        <h3 class="legal-subsection-title">11.1 Períodos de Retención</h3>
        <div class="legal-table-wrapper">
          <table class="legal-table">
            <thead>
              <tr>
                <th>Tipo de Datos</th>
                <th>Período de Retención</th>
                <th>Fundamento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Datos de cuenta (perfil)</td>
                <td>Durante la vigencia de la cuenta + 6 meses después de la solicitud de eliminación</td>
                <td>Contractual / prevención de fraude</td>
              </tr>
              <tr>
                <td>Datos transaccionales y de pago</td>
                <td>Cinco (5) años desde la fecha de la transacción</td>
                <td>Obligación tributaria (Art. 632 del Estatuto Tributario) y contable colombiana</td>
              </tr>
              <tr>
                <td>Datos del programa de afiliados</td>
                <td>Cinco (5) años desde la última comisión generada</td>
                <td>Obligación tributaria y contractual</td>
              </tr>
              <tr>
                <td>Conversaciones con Clarita</td>
                <td>Doce (12) meses desde la última interacción</td>
                <td>Mejora del servicio</td>
              </tr>
              <tr>
                <td>Códigos de verificación</td>
                <td>Tres (3) minutos (uso activo) / treinta (30) días (registro de auditoría)</td>
                <td>Seguridad</td>
              </tr>
              <tr>
                <td>Reseñas y comentarios</td>
                <td>Durante la vigencia de la cuenta, eliminados con la solicitud de supresión</td>
                <td>Consentimiento</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="legal-subsection-title">11.2 Mecanismo de Eliminación</h3>
        <p>
          Cuando un Usuario solicita la eliminación de su cuenta, la Plataforma realiza un proceso de
          <strong>desactivación</strong> de la cuenta que incluye:
        </p>
        <ol>
          <li>Revocación inmediata del acceso a los contenidos de Google Drive.</li>
          <li>Marcado de la cuenta como inactiva/eliminada en el sistema.</li>
          <li>Eliminación de los datos no sujetos a retención legal en el plazo de seis (6) meses.</li>
          <li>Conservación de los datos con retención legal obligatoria por el período correspondiente, tras
            el cual serán eliminados de forma definitiva.</li>
        </ol>
      </section>

      <!-- SECCIÓN 12 -->
      <section id="priv12" class="legal-section">
        <h2 class="legal-section-title">12. Modificaciones a la Política</h2>
        <p>
          La Plataforma se reserva el derecho de modificar esta Política de Privacidad en cualquier momento.
          Las modificaciones sustanciales serán notificadas al Usuario a través de:
        </p>
        <ul>
          <li>Correo electrónico a la dirección registrada.</li>
          <li>Aviso destacado en la Plataforma.</li>
        </ul>
        <p>
          Las modificaciones entrarán en vigencia en la fecha indicada en la notificación. El uso continuado de
          la Plataforma después de dicha fecha constituye aceptación de la Política modificada. La fecha de
          "Última actualización" al inicio de este documento reflejará siempre la versión más reciente.
        </p>

        <h3 class="legal-subsection-title">12.1 Contacto para Asuntos de Privacidad</h3>
        <div class="legal-info-box">
          <p>Para cualquier consulta, solicitud o reclamo relacionado con el tratamiento de sus datos personales:</p>
          <p><strong>Correo electrónico:</strong> cursosestudiaytrabaja@gmail.com</p>
          <p><strong>WhatsApp:</strong> +57 313 414 1912</p>
          <p><strong>Horario de atención:</strong> Lunes a viernes de 8:00 a.m. a 6:00 p.m. (hora Colombia, GMT-5)</p>
          <p><strong>Domicilio:</strong> Bogotá D.C., Colombia</p>
        </div>
      </section>

      <footer class="legal-footer">
        <p>Documento vigente desde el 29 de marzo de 2026.</p>
        <p>&copy; {{ new Date().getFullYear() }} Cursos Estudia y Trabaja. Todos los derechos reservados.</p>
        <p>
          Consulte también nuestros
          <RouterLink :to="{ name: 'terminos' }" class="legal-link">Términos y Condiciones de Uso</RouterLink>.
        </p>
      </footer>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.legal-page {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  color: #1e293b;
  line-height: 1.7;
}

.legal-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.legal-header {
  text-align: center;
  padding: 2rem 0 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 2rem;
}

.legal-back {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.legal-back:hover {
  color: #1d4ed8;
}

.legal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.legal-subtitle {
  font-size: 1.1rem;
  color: #3b82f6;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.legal-date {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* Table of contents */
.legal-toc {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 2.5rem;
}

.legal-toc-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem;
}

.legal-toc-list {
  margin: 0;
  padding-left: 1.5rem;
}

.legal-toc-list li {
  margin-bottom: 0.4rem;
}

.legal-toc-list a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.legal-toc-list a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Sections */
.legal-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.legal-section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #3b82f6;
}

.legal-subsection-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 1.5rem 0 0.8rem;
}

.legal-section p {
  margin: 0 0 0.8rem;
  font-size: 0.95rem;
  color: #334155;
}

.legal-section ul,
.legal-section ol {
  margin: 0 0 0.8rem;
  padding-left: 1.5rem;
}

.legal-section li {
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
  color: #334155;
}

.legal-section li ul {
  margin-top: 0.3rem;
}

/* Info box */
.legal-info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
}

.legal-info-box p {
  margin: 0.3rem 0;
  font-size: 0.93rem;
}

.legal-info-box ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.legal-info-box li {
  font-size: 0.93rem;
}

/* Warning box */
.legal-warning-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
}

.legal-warning-box p {
  margin: 0.3rem 0;
  font-size: 0.93rem;
}

.legal-warning-box ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.legal-warning-box li {
  font-size: 0.93rem;
}

/* Link */
.legal-link {
  color: #3b82f6;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s;
}

.legal-link:hover {
  color: #1d4ed8;
}

/* Tables */
.legal-table-wrapper {
  overflow-x: auto;
  margin: 1rem 0;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.legal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.legal-table th {
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.legal-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: top;
}

.legal-table tr:last-child td {
  border-bottom: none;
}

.legal-table tr:hover td {
  background: #f8fafc;
}

/* Footer */
.legal-footer {
  text-align: center;
  padding: 2rem 0 0;
  border-top: 2px solid #e2e8f0;
  margin-top: 1rem;
}

.legal-footer p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0.3rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .legal-container {
    padding: 1rem;
  }

  .legal-title {
    font-size: 1.4rem;
  }

  .legal-section {
    padding: 1.25rem;
  }

  .legal-section-title {
    font-size: 1.15rem;
  }

  .legal-toc {
    padding: 1rem 1.25rem;
  }

  .legal-table th,
  .legal-table td {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style>
