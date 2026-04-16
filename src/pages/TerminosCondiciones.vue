<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="legal-page">
    <div class="legal-container">

      <header class="legal-header">
        <RouterLink :to="{ name: 'home' }" class="legal-back">&larr; Volver al inicio</RouterLink>
        <h1 class="legal-title">Términos y Condiciones de Uso</h1>
        <p class="legal-subtitle">Cursos Estudia y Trabaja</p>
        <p class="legal-date">Última actualización: 29 de marzo de 2026</p>
      </header>

      <!-- ÍNDICE -->
      <nav class="legal-toc">
        <h2 class="legal-toc-title">Índice</h2>
        <ol class="legal-toc-list">
          <li><a href="#art1">Información General y Definiciones</a></li>
          <li><a href="#art2">Naturaleza del Servicio</a></li>
          <li><a href="#art3">Requisitos de Uso y Registro</a></li>
          <li><a href="#art4">Proceso de Compra y Pago</a></li>
          <li><a href="#art5">Entrega y Acceso al Contenido</a></li>
          <li><a href="#art6">Política de Reembolso y Derecho de Retracto</a></li>
          <li><a href="#art7">Propiedad Intelectual y Derechos de Autor</a></li>
          <li><a href="#art8">Programa de Afiliados y Revendedores</a></li>
          <li><a href="#art9">Certificados de Finalización</a></li>
          <li><a href="#art10">Conducta del Usuario y Restricciones</a></li>
          <li><a href="#art11">Limitación de Responsabilidad</a></li>
          <li><a href="#art12">Resolución de Disputas</a></li>
          <li><a href="#art13">Modificaciones a los Términos</a></li>
          <li><a href="#art14">Disposiciones Finales</a></li>
        </ol>
      </nav>

      <!-- PREÁMBULO -->
      <section class="legal-section">
        <p>
          El presente documento establece los Términos y Condiciones (en adelante, los <strong>"Términos"</strong>) que
          regulan el uso de la plataforma <strong>"Cursos Estudia y Trabaja"</strong> (en adelante, <strong>"la
            Plataforma"</strong>), accesible a través de su sitio web y canales digitales asociados.
        </p>
        <p>
          Al acceder, registrarse o realizar cualquier transacción en la Plataforma, el Usuario declara haber leído,
          comprendido y aceptado íntegramente estos Términos, así como la
          <RouterLink :to="{ name: 'privacidad' }" class="legal-link">Política de Privacidad y Tratamiento de Datos
            Personales</RouterLink>, la cual forma parte integral de este acuerdo.
        </p>
        <p>
          <strong>Si usted no está de acuerdo con alguno de estos Términos, le solicitamos abstenerse de utilizar la
            Plataforma.</strong>
        </p>
      </section>

      <!-- ARTÍCULO 1 -->
      <section id="art1" class="legal-section">
        <h2 class="legal-section-title">Artículo 1. Información General y Definiciones</h2>

        <h3 class="legal-subsection-title">1.1 Identificación del Responsable</h3>
        <div class="legal-info-box">
          <p><strong>Nombre o Razón Social:</strong> [RAZÓN SOCIAL EN TRÁMITE DE REGISTRO]</p>
          <p><strong>NIT:</strong> [EN TRÁMITE]</p>
          <p><strong>Domicilio:</strong> Bogotá D.C., Colombia</p>
          <p><strong>Correo electrónico:</strong> cursosestudiaytrabajalatam@gmail.com</p>
          <p><strong>WhatsApp:</strong> +57 313 414 1912</p>
          <p><strong>Sitio web:</strong> cursosestudiaytrabaja.store</p>
        </div>

        <h3 class="legal-subsection-title">1.2 Definiciones</h3>
        <p>Para efectos de interpretación de estos Términos, los siguientes conceptos tendrán el significado que a continuación se indica:</p>
        <ul class="legal-definitions">
          <li><strong>"Plataforma":</strong> El sitio web, la aplicación y todos los servicios digitales operados bajo el nombre "Cursos Estudia y Trabaja".</li>
          <li><strong>"Usuario":</strong> Toda persona natural que accede, navega, se registra o utiliza la Plataforma en cualquier capacidad.</li>
          <li><strong>"Comprador":</strong> El Usuario que adquiere una licencia de acceso a uno o varios Packs de Cursos.</li>
          <li><strong>"Afiliado" o "Revendedor":</strong> El Usuario que participa en el programa de referidos de la Plataforma, promocionando los productos a cambio de comisiones.</li>
          <li><strong>"Pack de Cursos":</strong> Cada paquete temático de contenido educativo digital ofrecido para la venta en la Plataforma, organizado por categorías.</li>
          <li><strong>"Contenido Digital":</strong> Todo material educativo incluido en los Packs, tales como videocursos, documentos, plantillas, guías y demás recursos de aprendizaje.</li>
          <li><strong>"Licencia de Acceso":</strong> El derecho personal, no exclusivo e intransferible otorgado al Comprador para acceder y consumir el Contenido Digital de un Pack adquirido.</li>
          <li><strong>"Clarita":</strong> El asistente virtual (chatbot) con inteligencia artificial integrado en la Plataforma para soporte y orientación al Usuario.</li>
        </ul>
      </section>

      <!-- ARTÍCULO 2 -->
      <section id="art2" class="legal-section">
        <h2 class="legal-section-title">Artículo 2. Naturaleza del Servicio</h2>

        <h3 class="legal-subsection-title">2.1 Descripción del Servicio</h3>
        <p>
          "Cursos Estudia y Trabaja" es una plataforma de comercio electrónico especializada en la <strong>curaduría,
            organización y distribución de contenido educativo digital</strong>. La Plataforma ofrece Packs de Cursos
          temáticos que son seleccionados, organizados y puestos a disposición del Comprador como un servicio integral
          de acceso a material de formación.
        </p>
        <p>
          El valor agregado de la Plataforma consiste en la selección temática, la organización del contenido por niveles
          y categorías, la gestión técnica del acceso, el soporte al usuario, la emisión de certificados internos de
          finalización y la administración del programa de afiliados.
        </p>

        <h3 class="legal-subsection-title">2.2 Producto Ofrecido</h3>
        <p>El Comprador adquiere una <strong>Licencia de Acceso</strong> con las siguientes características:</p>
        <ul>
          <li><strong>Personal:</strong> Para uso exclusivo del titular de la cuenta.</li>
          <li><strong>No exclusiva:</strong> La misma licencia puede ser otorgada a otros Compradores.</li>
          <li><strong>Intransferible:</strong> No puede ser cedida, vendida ni compartida con terceros.</li>
          <li><strong>Perpetua:</strong> El acceso se otorga de forma vitalicia, sujeto a la disponibilidad técnica del servicio y al cumplimiento de estos Términos.</li>
        </ul>

        <h3 class="legal-subsection-title">2.3 Entrega del Producto</h3>
        <p>
          El Contenido Digital se entrega al Comprador a través de unidades compartidas en Google Drive, cuyo acceso se
          gestiona mediante Google Groups. El contenido puede ser visualizado en línea o descargado para uso sin conexión,
          siempre dentro de los límites de la Licencia de Acceso.
        </p>

        <h3 class="legal-subsection-title">2.4 Contenido Dinámico</h3>
        <p>
          El catálogo de cursos y materiales es dinámico. La Plataforma se reserva el derecho de agregar, modificar,
          actualizar, sustituir o retirar cualquier curso o material en cualquier momento, por razones que incluyen pero
          no se limitan a: solicitudes de retiro por titulares de derechos de autor, obsolescencia del contenido,
          mejoras en la organización temática o causas técnicas.
        </p>
        <p>
          La adquisición de un Pack garantiza acceso a la <strong>biblioteca disponible en el momento de la
            compra</strong>, con actualizaciones y mejoras continuas, pero no a un archivo específico a perpetuidad.
        </p>
      </section>

      <!-- ARTÍCULO 3 -->
      <section id="art3" class="legal-section">
        <h2 class="legal-section-title">Artículo 3. Requisitos de Uso y Registro</h2>

        <h3 class="legal-subsection-title">3.1 Edad Mínima</h3>
        <p>
          Para utilizar la Plataforma y realizar compras, el Usuario debe ser mayor de dieciocho (18) años o contar
          con autorización expresa de su representante legal. Al registrarse, el Usuario declara cumplir con este
          requisito. La Plataforma no está dirigida a menores de edad.
        </p>

        <h3 class="legal-subsection-title">3.2 Cuenta de Google</h3>
        <p>
          El registro y acceso a la Plataforma se realiza exclusivamente a través de una cuenta de Google (Gmail).
          El Usuario es responsable de mantener la seguridad de su cuenta de Google y de todas las actividades que
          se realicen a través de ella en la Plataforma.
        </p>

        <h3 class="legal-subsection-title">3.3 Una Cuenta por Persona</h3>
        <p>
          Cada persona natural podrá tener únicamente una (1) cuenta activa en la Plataforma. La creación de múltiples
          cuentas para eludir restricciones, obtener beneficios indebidos o cualquier otro fin fraudulento constituye
          una violación de estos Términos y podrá resultar en la suspensión o cancelación de todas las cuentas asociadas.
        </p>

        <h3 class="legal-subsection-title">3.4 Aceptación de los Términos</h3>
        <p>
          Al completar el proceso de compra, el Usuario acepta de forma expresa e inequívoca los presentes Términos y
          Condiciones, así como la Política de Privacidad, de conformidad con lo dispuesto en la Ley 527 de 1999 sobre
          comercio electrónico y mensajes de datos.
        </p>
      </section>

      <!-- ARTÍCULO 4 -->
      <section id="art4" class="legal-section">
        <h2 class="legal-section-title">Artículo 4. Proceso de Compra y Pago</h2>

        <h3 class="legal-subsection-title">4.1 Precios</h3>
        <p>
          Los precios de los Packs de Cursos se exhiben en <strong>Pesos Colombianos (COP)</strong> para usuarios
          ubicados en Colombia, y en <strong>Dólares Estadounidenses (USD)</strong> para usuarios internacionales.
          La conversión de moneda se realiza con base en tasas de cambio de mercado obtenidas de fuentes públicas
          actualizadas periódicamente. Los precios incluyen todos los impuestos aplicables, salvo que se indique
          expresamente lo contrario.
        </p>

        <h3 class="legal-subsection-title">4.2 Pasarelas de Pago</h3>
        <p>Los pagos se procesan a través de pasarelas de pago certificadas:</p>
        <ul>
          <li><strong>PayU:</strong> Para pagos en Colombia (tarjeta de crédito/débito, PSE, Nequi, DaviPlata, Efecty y otros medios locales).</li>
          <li><strong>PayPal:</strong> Para pagos internacionales y como opción alternativa en Colombia.</li>
        </ul>
        <p>
          <strong>Seguridad de datos de pago:</strong> La Plataforma <strong>NO</strong> almacena datos de tarjetas de
          crédito, débito ni credenciales bancarias del Comprador. Todo el procesamiento de pagos es gestionado
          íntegramente por las pasarelas de pago certificadas, las cuales cumplen con los estándares PCI-DSS
          (Payment Card Industry Data Security Standard).
        </p>

        <h3 class="legal-subsection-title">4.3 Cupones de Descuento</h3>
        <p>
          La Plataforma podrá ofrecer cupones de descuento a través de su programa de afiliados o promociones
          especiales. Los cupones tienen las condiciones de uso específicas que se indiquen al momento de su emisión
          y no son acumulables entre sí, salvo que se indique expresamente lo contrario.
        </p>

        <h3 class="legal-subsection-title">4.4 Compras como Regalo</h3>
        <p>
          La Plataforma permite realizar compras para otorgar acceso a un tercero (compra como regalo). En este caso,
          el Comprador deberá proporcionar la dirección de correo electrónico Gmail del destinatario. El destinatario
          quedará sujeto a estos mismos Términos y Condiciones al acceder al contenido.
        </p>

        <h3 class="legal-subsection-title">4.5 Confirmación de la Transacción</h3>
        <p>
          Una vez procesado el pago exitosamente, el Comprador recibirá confirmación de su compra y el acceso al
          contenido se habilitará de forma automática. En caso de que la pasarela de pago rechace la transacción,
          no se generará cargo alguno y el acceso no será otorgado.
        </p>
      </section>

      <!-- ARTÍCULO 5 -->
      <section id="art5" class="legal-section">
        <h2 class="legal-section-title">Artículo 5. Entrega y Acceso al Contenido</h2>

        <h3 class="legal-subsection-title">5.1 Mecanismo de Entrega</h3>
        <p>
          La entrega del Contenido Digital es <strong>automática e inmediata</strong> tras la confirmación del pago
          por parte de la pasarela correspondiente. El acceso se otorga mediante la inclusión del correo electrónico
          del Comprador en los grupos de Google asociados a los Packs adquiridos, lo que habilita el acceso a las
          carpetas de Google Drive correspondientes.
        </p>

        <h3 class="legal-subsection-title">5.2 Herramientas de Visualización</h3>
        <p>
          Para la correcta visualización del contenido, se recomienda el uso de aplicaciones como Google Drive,
          File Manager+, VLC Media Player o FileBrowserGO, disponibles para dispositivos móviles y computadoras.
          La Plataforma no tiene relación comercial con estas aplicaciones ni se hace responsable por su funcionamiento.
        </p>

        <h3 class="legal-subsection-title">5.3 Dependencia de Servicios de Terceros</h3>
        <p>
          El Usuario reconoce y acepta que el servicio de almacenamiento y entrega se aloja en infraestructura de
          <strong>Google (Google Drive y Google Groups)</strong>. La Plataforma realiza todas las gestiones técnicas
          razonables para asegurar la disponibilidad continua del contenido; sin embargo, no puede garantizar una
          disponibilidad del 100% libre de interrupciones.
        </p>
        <p>
          En caso de fallas en los servicios de Google, cambios en sus políticas, o cualquier interrupción ajena
          a la voluntad de la Plataforma, esta se compromete a realizar sus mejores esfuerzos para restablecer el
          acceso o migrar el contenido a una ubicación alternativa en un plazo razonable. Las interrupciones
          derivadas de causas de fuerza mayor o hechos de terceros no constituirán incumplimiento contractual.
        </p>
      </section>

      <!-- ARTÍCULO 6 -->
      <section id="art6" class="legal-section">
        <h2 class="legal-section-title">Artículo 6. Política de Reembolso y Derecho de Retracto</h2>

        <h3 class="legal-subsection-title">6.1 Derecho de Retracto</h3>
        <p>
          De conformidad con el <strong>Artículo 47 de la Ley 1480 de 2011</strong> (Estatuto del Consumidor de
          Colombia), el Comprador tiene derecho a ejercer el retracto dentro de los <strong>siete (7) días calendario
          </strong> siguientes a la fecha de la compra, sin necesidad de justificar su decisión y sin que se le
          aplique penalidad alguna.
        </p>

        <h3 class="legal-subsection-title">6.2 Proceso para Solicitar el Reembolso</h3>
        <p>Para ejercer el derecho de retracto, el Comprador deberá:</p>
        <ol>
          <li>Comunicarse dentro del plazo de siete (7) días calendario a través de:
            <ul>
              <li><strong>WhatsApp:</strong> +57 313 414 1912</li>
              <li><strong>Correo electrónico:</strong> cursosestudiaytrabajalatam@gmail.com</li>
            </ul>
          </li>
          <li>Indicar su nombre completo, correo electrónico registrado y el número o referencia de la transacción.</li>
          <li>Especificar el motivo de la solicitud (opcional, pero útil para mejorar nuestro servicio).</li>
        </ol>

        <h3 class="legal-subsection-title">6.3 Procesamiento del Reembolso</h3>
        <p>
          Una vez verificada la solicitud, la Plataforma procederá a efectuar la <strong>reversión del pago</strong>
          de conformidad con el <strong>Artículo 51 de la Ley 1480 de 2011</strong> y el <strong>Decreto 587 de
          2016</strong>, en un plazo máximo de <strong>quince (15) días hábiles</strong>.
        </p>
        <p>El reembolso se realizará, según corresponda:</p>
        <ul>
          <li>A la cuenta o medio de pago original utilizado para la compra (PayU o PayPal).</li>
          <li>Mediante transferencia a cuenta bancaria o billetera digital designada por el Comprador (Nequi, DaviPlata o cuenta bancaria colombiana), en caso de que la reversión al medio original no sea técnicamente posible.</li>
        </ul>
        <p>
          Al procesarse el reembolso, el acceso a las unidades compartidas de Google Drive será <strong>revocado
            inmediatamente</strong>.
        </p>

        <h3 class="legal-subsection-title">6.4 Excepciones al Reembolso</h3>
        <p>
          De acuerdo con la normativa colombiana aplicable a productos digitales, el derecho de retracto <strong>no
            procederá</strong> en los siguientes casos:
        </p>
        <ul>
          <li>Cuando hayan transcurrido más de siete (7) días calendario desde la fecha de la compra.</li>
          <li>Cuando se evidencie que el Comprador ha descargado o consumido una parte sustancial del contenido (superior al 30% del material del Pack adquirido), de conformidad con el Decreto 587 de 2016 sobre contenidos digitales.</li>
          <li>Cuando la solicitud de reembolso forme parte de un patrón de compras y devoluciones reiteradas que evidencie uso abusivo del derecho de retracto o intención fraudulenta.</li>
        </ul>

        <h3 class="legal-subsection-title">6.5 Prevención de Fraude</h3>
        <p>
          La Plataforma se reserva el derecho de investigar y rechazar solicitudes de reembolso cuando existan
          indicios razonables de fraude, abuso del sistema de devoluciones o uso indebido del contenido. En tales
          casos, la Plataforma podrá suspender la cuenta del Usuario involucrado y reportar la actividad a las
          autoridades competentes y a las pasarelas de pago.
        </p>
      </section>

      <!-- ARTÍCULO 7 -->
      <section id="art7" class="legal-section">
        <h2 class="legal-section-title">Artículo 7. Propiedad Intelectual y Derechos de Autor</h2>

        <h3 class="legal-subsection-title">7.1 Naturaleza del Contenido</h3>
        <p>
          La Plataforma actúa como un servicio de <strong>curaduría, organización y distribución</strong> de contenido
          educativo digital. El Contenido Digital disponible en los Packs puede incluir materiales de diversa
          procedencia, los cuales son seleccionados y organizados temáticamente por el equipo de la Plataforma para
          ofrecer una experiencia de aprendizaje estructurada.
        </p>
        <p>
          La Plataforma reconoce y respeta los derechos de propiedad intelectual de todos los creadores de contenido.
          La compilación, organización temática, estructura de los Packs, el diseño de la Plataforma, su marca,
          logotipos y materiales originales son propiedad de "Cursos Estudia y Trabaja".
        </p>

        <h3 class="legal-subsection-title">7.2 Licencia Otorgada al Comprador</h3>
        <p>Al adquirir un Pack, el Comprador recibe una licencia de uso que le permite:</p>
        <ul>
          <li>Acceder al contenido para su formación personal y autoaprendizaje.</li>
          <li>Descargar el material para uso sin conexión, exclusivamente para consumo personal.</li>
          <li>Consultar el material las veces que lo considere necesario.</li>
        </ul>

        <h3 class="legal-subsection-title">7.3 Restricciones de Uso</h3>
        <p><strong>Está terminantemente prohibido:</strong></p>
        <ul>
          <li>Reproducir, copiar, redistribuir o compartir el Contenido Digital por cualquier medio, físico o digital.</li>
          <li>Revender, sublicenciar o comercializar el acceso a los materiales o los materiales mismos.</li>
          <li>Publicar, subir o poner a disposición el contenido en plataformas de terceros, redes sociales, foros, sitios de descarga o cualquier otro medio público.</li>
          <li>Modificar, adaptar, traducir o crear obras derivadas del contenido sin autorización expresa.</li>
          <li>Utilizar herramientas automatizadas (bots, scrapers) para la descarga masiva de contenido.</li>
          <li>Compartir los enlaces de acceso a las carpetas de Google Drive con personas no autorizadas.</li>
        </ul>
        <p>
          La violación de cualquiera de estas restricciones constituirá un <strong>incumplimiento grave</strong> de estos
          Términos y dará lugar a la suspensión inmediata y permanente de la cuenta, sin derecho a reembolso, además de
          las acciones legales que correspondan.
        </p>

        <h3 class="legal-subsection-title">7.4 Política de Notificación y Retiro (DMCA / Ley 1915 de 2018)</h3>
        <p>
          La Plataforma respeta los derechos de propiedad intelectual de terceros y actúa de conformidad con la
          <strong>Ley 1915 de 2018</strong> (que modifica y complementa la Ley 23 de 1982 sobre derechos de autor
          en Colombia) y los principios de la Digital Millennium Copyright Act (DMCA).
        </p>
        <p>
          Si usted es titular de derechos de autor sobre algún contenido disponible en la Plataforma y considera
          que dicho contenido infringe sus derechos, puede enviar una notificación de retiro a:
        </p>
        <div class="legal-info-box">
          <p><strong>Correo electrónico:</strong> cursosestudiaytrabajalatam@gmail.com</p>
          <p><strong>WhatsApp:</strong> +57 313 414 1912</p>
        </div>
        <p>La notificación deberá contener:</p>
        <ol>
          <li>Identificación de la obra protegida presuntamente infringida.</li>
          <li>Identificación del material infractor dentro de la Plataforma (nombre del curso, carpeta o archivo).</li>
          <li>Datos de contacto del reclamante (nombre, correo electrónico, teléfono).</li>
          <li>Declaración de buena fe de que el uso del material no está autorizado por el titular de los derechos.</li>
          <li>Prueba de titularidad o representación legal sobre la obra reclamada.</li>
        </ol>
        <p>
          Tras la verificación de la titularidad, el contenido será <strong>retirado de forma inmediata</strong>,
          sin necesidad de requerimiento judicial previo. La Plataforma notificará al reclamante sobre las acciones
          tomadas en un plazo máximo de cinco (5) días hábiles.
        </p>
      </section>

      <!-- ARTÍCULO 8 -->
      <section id="art8" class="legal-section">
        <h2 class="legal-section-title">Artículo 8. Programa de Afiliados y Revendedores</h2>

        <h3 class="legal-subsection-title">8.1 Descripción del Programa</h3>
        <p>
          La Plataforma ofrece un programa de afiliados que permite a los Usuarios que han adquirido determinados
          Packs de Cursos referir nuevos compradores a cambio de comisiones por cada venta efectiva generada a
          través de su código o enlace de referido.
        </p>

        <h3 class="legal-subsection-title">8.2 Elegibilidad</h3>
        <p>
          Para participar en el programa de afiliados, el Usuario debe haber adquirido previamente un Pack que
          habilite la función de revendedor. Al cumplir este requisito, el sistema le asignará automáticamente
          un código de referido único.
        </p>

        <h3 class="legal-subsection-title">8.3 Comisiones</h3>
        <ul>
          <li>Las comisiones se calculan como un porcentaje del valor de cada venta referida exitosamente confirmada.</li>
          <li>El porcentaje de comisión vigente será el publicado en la sección "Monetizar" de la Plataforma al momento de cada venta.</li>
          <li>La Plataforma se reserva el derecho de modificar la estructura y porcentajes de comisiones con aviso previo de treinta (30) días.</li>
        </ul>

        <h3 class="legal-subsection-title">8.4 Pago de Comisiones</h3>
        <p>
          Las comisiones generadas serán desembolsadas a la cuenta bancaria o billetera digital (Nequi, DaviPlata
          o Llave Electrónica) que el Afiliado haya registrado en su perfil. El Afiliado es responsable de mantener
          sus datos bancarios actualizados y correctos.
        </p>

        <h3 class="legal-subsection-title">8.5 Obligaciones Fiscales</h3>
        <p>
          Las comisiones percibidas por los Afiliados constituyen <strong>ingresos gravables</strong>. El Afiliado es
          el único responsable de cumplir con sus obligaciones tributarias ante la DIAN y demás autoridades fiscales
          aplicables, incluyendo la declaración y pago de impuestos sobre la renta y complementarios. La Plataforma
          no actúa como agente de retención ni asume responsabilidad alguna sobre las obligaciones fiscales del Afiliado.
        </p>

        <h3 class="legal-subsection-title">8.6 Conducta del Afiliado</h3>
        <p>El Afiliado se compromete a:</p>
        <ul>
          <li>Promocionar los productos de manera ética, veraz y sin realizar afirmaciones engañosas sobre los resultados que el Comprador puede obtener.</li>
          <li>No utilizar técnicas de spam, publicidad engañosa o prácticas desleales de competencia.</li>
          <li>No crear cuentas ficticias para autorreferirse o inflar artificialmente las comisiones.</li>
        </ul>
        <p>
          El incumplimiento de estas obligaciones resultará en la suspensión del programa de afiliados, la retención
          de comisiones pendientes y, en casos graves, la cancelación de la cuenta.
        </p>
      </section>

      <!-- ARTÍCULO 9 -->
      <section id="art9" class="legal-section">
        <h2 class="legal-section-title">Artículo 9. Certificados de Finalización</h2>

        <h3 class="legal-subsection-title">9.1 Naturaleza de los Certificados</h3>
        <p>
          La Plataforma emite certificados de finalización que acreditan que el estudiante ha consumido el material
          de un determinado módulo o Pack y ha superado la evaluación interna correspondiente.
        </p>

        <h3 class="legal-subsection-title">9.2 Alcance y Limitaciones</h3>
        <div class="legal-warning-box">
          <p><strong>DESCARGO IMPORTANTE:</strong></p>
          <p>
            Los certificados emitidos por "Cursos Estudia y Trabaja" son <strong>constancias de autoformación</strong>
            que validan la finalización de un proceso de aprendizaje autodidacta dentro de la Plataforma.
          </p>
          <p>
            Estos certificados <strong>NO</strong> constituyen títulos académicos oficiales, <strong>NO</strong> están
            avalados por el Ministerio de Educación Nacional ni por ninguna institución de educación formal, y
            <strong>NO</strong> otorgan créditos académicos ni habilitaciones profesionales.
          </p>
          <p>
            Su propósito es enriquecer el perfil personal y profesional del estudiante como evidencia de
            autoformación y compromiso con el aprendizaje continuo.
          </p>
        </div>
      </section>

      <!-- ARTÍCULO 10 -->
      <section id="art10" class="legal-section">
        <h2 class="legal-section-title">Artículo 10. Conducta del Usuario y Restricciones</h2>

        <h3 class="legal-subsection-title">10.1 Obligaciones del Usuario</h3>
        <p>El Usuario se compromete a:</p>
        <ul>
          <li>Utilizar la Plataforma y el Contenido Digital exclusivamente para fines de aprendizaje personal.</li>
          <li>Proporcionar información veraz y actualizada en su perfil.</li>
          <li>No interferir con el funcionamiento técnico de la Plataforma.</li>
          <li>Cumplir con la legislación colombiana y la de su país de residencia aplicable al uso de la Plataforma.</li>
        </ul>

        <h3 class="legal-subsection-title">10.2 Uso Intransferible</h3>
        <p>
          El acceso otorgado a las unidades de Google Drive es <strong>personal e intransferible</strong>. Está
          prohibido compartir credenciales de acceso, enlaces de carpetas o cualquier forma de acceso con
          terceros no autorizados.
        </p>

        <h3 class="legal-subsection-title">10.3 Monitoreo y Detección</h3>
        <p>
          La Plataforma utiliza sistemas de monitoreo para detectar patrones de uso irregular, incluyendo pero no
          limitado a: acceso desde múltiples ubicaciones geográficas simultáneas, descargas masivas automatizadas,
          o extracción sistemática de contenido. Si se detecta actividad que evidencie uso compartido no autorizado
          o intención de piratería, la cuenta será <strong>suspendida permanentemente sin derecho a reembolso</strong>.
        </p>

        <h3 class="legal-subsection-title">10.4 Suspensión y Terminación de Cuenta</h3>
        <p>La Plataforma podrá suspender temporal o permanentemente la cuenta de un Usuario cuando:</p>
        <ul>
          <li>Se violen estos Términos y Condiciones.</li>
          <li>Se detecte actividad fraudulenta o uso indebido.</li>
          <li>Se reciba una orden judicial o administrativa que así lo requiera.</li>
          <li>El Usuario solicite voluntariamente la eliminación de su cuenta.</li>
        </ul>
        <p>
          En caso de suspensión por incumplimiento, la Plataforma notificará al Usuario a su correo electrónico
          registrado indicando los motivos de la suspensión.
        </p>
      </section>

      <!-- ARTÍCULO 11 -->
      <section id="art11" class="legal-section">
        <h2 class="legal-section-title">Artículo 11. Limitación de Responsabilidad</h2>

        <h3 class="legal-subsection-title">11.1 Entrega "Tal Cual" (As Is)</h3>
        <p>
          El Contenido Digital se entrega <strong>"tal cual" (as is)</strong>, sin garantías de ningún tipo,
          expresas o implícitas, más allá de las establecidas por la legislación colombiana de protección al
          consumidor. La Plataforma no garantiza que el contenido satisfaga las necesidades específicas del
          Usuario ni que los métodos o conocimientos contenidos en los cursos produzcan resultados económicos,
          laborales o profesionales determinados.
        </p>

        <h3 class="legal-subsection-title">11.2 Limitación de Responsabilidad Monetaria</h3>
        <p>
          En la máxima medida permitida por la ley colombiana, la responsabilidad total de la Plataforma frente
          al Comprador por cualquier causa relacionada con el servicio estará limitada al <strong>monto efectivamente
            pagado</strong> por el Comprador por el Pack o servicio que origina la reclamación.
        </p>

        <h3 class="legal-subsection-title">11.3 Exclusión de Responsabilidad</h3>
        <p>La Plataforma no será responsable por:</p>
        <ul>
          <li>Daños indirectos, incidentales, especiales o consecuenciales derivados del uso o imposibilidad de uso del contenido.</li>
          <li>Interrupciones del servicio causadas por fallos en los servicios de Google, pasarelas de pago u otros proveedores externos.</li>
          <li>Pérdidas económicas, de oportunidad o de beneficios esperados por el Usuario.</li>
          <li>Contenido descargado por el Usuario que sea utilizado en contravención de estos Términos o de la ley aplicable.</li>
          <li>Eventos de fuerza mayor o caso fortuito, según la definición del Código Civil colombiano.</li>
        </ul>
      </section>

      <!-- ARTÍCULO 12 -->
      <section id="art12" class="legal-section">
        <h2 class="legal-section-title">Artículo 12. Resolución de Disputas</h2>

        <h3 class="legal-subsection-title">12.1 Ley Aplicable</h3>
        <p>
          Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la
          <strong>República de Colombia</strong>, en particular la Ley 1480 de 2011 (Estatuto del Consumidor),
          la Ley 1581 de 2012 (Protección de Datos Personales) y demás normativa aplicable.
        </p>

        <h3 class="legal-subsection-title">12.2 Procedimiento de Resolución</h3>
        <p>Cualquier controversia derivada de estos Términos se resolverá conforme al siguiente procedimiento escalonado:</p>
        <ol>
          <li>
            <strong>Arreglo directo:</strong> Las partes intentarán resolver la controversia mediante comunicación
            directa a través de los canales de atención de la Plataforma (WhatsApp: +57 313 414 1912,
            email: cursosestudiaytrabajalatam@gmail.com) en un plazo de quince (15) días hábiles.
          </li>
          <li>
            <strong>Queja formal:</strong> Si no se logra un acuerdo, el Usuario podrá presentar una queja formal
            por escrito a cursosestudiaytrabajalatam@gmail.com, la cual será atendida en un plazo máximo de quince (15)
            días hábiles.
          </li>
          <li>
            <strong>Protección al consumidor:</strong> El Usuario podrá acudir ante la <strong>Superintendencia de
              Industria y Comercio (SIC)</strong> para la protección de sus derechos como consumidor, de conformidad
            con los mecanismos establecidos por dicha entidad.
          </li>
          <li>
            <strong>Jurisdicción:</strong> Para controversias que no puedan resolverse por los medios anteriores,
            las partes se someten a la jurisdicción de los jueces y tribunales competentes de la ciudad de
            Bogotá D.C., Colombia.
          </li>
        </ol>
      </section>

      <!-- ARTÍCULO 13 -->
      <section id="art13" class="legal-section">
        <h2 class="legal-section-title">Artículo 13. Modificaciones a los Términos</h2>
        <p>
          La Plataforma se reserva el derecho de modificar, actualizar o complementar estos Términos y Condiciones
          en cualquier momento. Las modificaciones sustanciales serán notificadas a los Usuarios con un mínimo de
          <strong>treinta (30) días calendario de anticipación</strong> a través del correo electrónico registrado
          y/o mediante aviso destacado en la Plataforma.
        </p>
        <p>
          El uso continuado de la Plataforma después de la fecha de entrada en vigencia de las modificaciones
          constituirá aceptación tácita de los nuevos Términos. Si el Usuario no está de acuerdo con las
          modificaciones, deberá dejar de utilizar la Plataforma y podrá solicitar la eliminación de su cuenta.
        </p>
      </section>

      <!-- ARTÍCULO 14 -->
      <section id="art14" class="legal-section">
        <h2 class="legal-section-title">Artículo 14. Disposiciones Finales</h2>

        <h3 class="legal-subsection-title">14.1 Divisibilidad</h3>
        <p>
          Si alguna cláusula de estos Términos fuese declarada nula, inválida o inaplicable por una autoridad
          competente, dicha nulidad no afectará la validez de las demás disposiciones, las cuales permanecerán
          en pleno vigor y efecto.
        </p>

        <h3 class="legal-subsection-title">14.2 Acuerdo Completo</h3>
        <p>
          Estos Términos y Condiciones, junto con la
          <RouterLink :to="{ name: 'privacidad' }" class="legal-link">Política de Privacidad y Tratamiento de Datos
            Personales</RouterLink>, constituyen el acuerdo íntegro entre el Usuario y la Plataforma en relación con
          el uso de los servicios ofrecidos, y sustituyen cualquier acuerdo, comunicación o entendimiento previo,
          verbal o escrito, sobre la misma materia.
        </p>

        <h3 class="legal-subsection-title">14.3 No Renuncia</h3>
        <p>
          La omisión o demora por parte de la Plataforma en ejercer cualquier derecho o acción prevista en estos
          Términos no constituirá renuncia a dicho derecho ni impedirá su ejercicio posterior.
        </p>

        <h3 class="legal-subsection-title">14.4 Contacto</h3>
        <div class="legal-info-box">
          <p>Para cualquier consulta relacionada con estos Términos y Condiciones:</p>
          <p><strong>Correo electrónico:</strong> cursosestudiaytrabajalatam@gmail.com</p>
          <p><strong>WhatsApp:</strong> +57 313 414 1912</p>
          <p><strong>Horario de atención:</strong> Lunes a viernes de 8:00 a.m. a 6:00 p.m. (hora Colombia, GMT-5)</p>
        </div>
      </section>

      <footer class="legal-footer">
        <p>Documento vigente desde el 29 de marzo de 2026.</p>
        <p>&copy; {{ new Date().getFullYear() }} Cursos Estudia y Trabaja. Todos los derechos reservados.</p>
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
  font-size: 2rem;
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

/* Definitions list */
.legal-definitions li {
  margin-bottom: 0.6rem;
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
    font-size: 1.5rem;
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
}
</style>
