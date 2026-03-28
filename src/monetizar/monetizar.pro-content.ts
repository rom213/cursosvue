// ─────────────────────────────────────────────────────────────────────────────
// monetizar.pro-content.ts
// Contenido completo de las lecciones PRO para afiliados.
// Keyed por ProModule.id ("m1" … "m6").
// ─────────────────────────────────────────────────────────────────────────────

export interface ProLesson {
  /** Debe coincidir exactamente con el string en ProModule.lessonTitles */
  title: string;
  /** Párrafos del cuerpo de la lección (cada string = un párrafo) */
  body: string[];
  /** Tip del experto (callout destacado) */
  tipExperto: string;
}

export type ProLessonMap = Record<string, ProLesson[]>;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENIDO COMPLETO
// ─────────────────────────────────────────────────────────────────────────────

export const proLessonContent: ProLessonMap = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO 1 — EL RADAR DE GANANCIAS
  // ═══════════════════════════════════════════════════════════════════════════
  m1: [
    // ── Lección 1 ──────────────────────────────────────────────────────────
    {
      title:
        "Lección 1: Herramientas de espionaje (Google Trends y FB Library)",
      body: [
        "Antes de publicar cualquier cosa en tus redes, necesitas saber qué está buscando la gente ahora mismo. No vas a adivinar: vas a usar datos reales. Las dos herramientas gratuitas más poderosas para esto son Google Trends y la Biblioteca de Anuncios de Meta (Facebook Ad Library). Dominarlas te pone por encima del 90% de los revendedores que simplemente publican sin estrategia.",

        "GOOGLE TRENDS — Tu radar de demanda. Entra a trends.google.com, selecciona Colombia (o el país de tu audiencia) y en el periodo elige \"Últimos 12 meses\". Escribe \"curso de programación\" y dale Enter. Verás una gráfica con el interés a lo largo del tiempo. Ahora viene lo bueno: haz clic en \"Comparar\" y agrega hasta 4 términos más, por ejemplo \"curso de Excel\", \"curso de marketing digital\", \"curso de inglés\" y \"curso de diseño gráfico\". Al instante verás cuál tiene más demanda y, lo más importante, cuál tiene tendencia ascendente. Un tema que sube es oro puro: significa que cada día hay más gente buscándolo y menos competencia lo ha detectado.",

        "Baja hasta la sección \"Consultas relacionadas\" y filtra por \"En aumento\". Aquí encuentras las búsquedas que están explotando. Si ves algo como \"curso de inteligencia artificial\" con un aumento del 300%, eso es exactamente lo que debes promocionar primero de nuestro catálogo. Nuestra academia tiene temas de IA, automatización, Python, y análisis de datos dentro del Pilar de Tecnología. Tú ya tienes el producto; Google Trends te dice cuál destacar primero.",

        "Truco avanzado: cambia el filtro de \"Búsqueda web\" a \"Búsqueda de YouTube\". Esto te muestra la demanda de contenido educativo en video, que es exactamente nuestro formato. Si un tema está en auge en YouTube, hay gente hambrienta de aprenderlo y tú tienes la solución más completa del mercado con más de 9.400 cursos.",

        "BIBLIOTECA DE ANUNCIOS DE META — Tu espía de la competencia. Ve a facebook.com/ads/library, selecciona tu país y en la categoría pon \"Todos los anuncios\". Ahora busca nombres de academias online conocidas (Platzi, Crehana, Domestika, Udemy, o cualquier academia local). Verás TODOS los anuncios activos que están corriendo en este momento: las imágenes que usan, los textos, los llamados a la acción. No vas a copiar, vas a modelar. Fíjate en qué palabras repiten, qué emociones atacan (miedo a quedarse atrás, deseo de ganar más, urgencia por ofertas). Anota los patrones que más se repiten porque esos son los que funcionan, probados con presupuestos de millones.",

        "Ejercicio práctico para hoy: Abre Google Trends, compara 5 temas de nuestro catálogo y anota los 2 que tengan tendencia ascendente. Luego ve a la Biblioteca de Anuncios de Meta, busca 3 competidores y captura de pantalla los 3 anuncios que más te llamen la atención. Con esto ya tienes los ingredientes para tu primera publicación de venta inteligente.",
      ],
      tipExperto:
        "No inventes la rueda: modela lo que ya le funciona a los grandes. Si Platzi está gastando dinero en un anuncio sobre IA, es porque ese tema vende. Tú ofreces lo mismo por una fracción del precio. Usa su investigación a tu favor.",
    },

    // ── Lección 2 ──────────────────────────────────────────────────────────
    {
      title:
        "Lección 2: Identificación de prospectos y nichos \u201Ccajero\u201D",
      body: [
        "Aquí está el error número uno de los revendedores novatos: intentan venderle a todo el mundo. Publican \"tengo 9.400 cursos, ¿quién quiere?\" y nadie responde. ¿Por qué? Porque cuando hablas para todos, no le hablas a nadie. La clave es elegir un nicho — un grupo específico de personas con un problema específico — y hablarles directamente a ellos.",

        "Un nicho \"cajero\" es aquel donde la gente ya tiene el dinero Y la necesidad urgente de aprender. Estos son los 5 nichos más rentables para vender nuestros paquetes: (1) Universitarios y recién egresados que necesitan habilidades prácticas que la universidad no enseña (Excel avanzado, programación, diseño). (2) Profesionales que quieren ascender o cambiar de trabajo (marketing digital, análisis de datos, liderazgo). (3) Emprendedores que necesitan aprender de todo un poco para sacar adelante su negocio (redes sociales, contabilidad, diseño gráfico). (4) Madres y padres que buscan reinventarse laboralmente desde casa. (5) Freelancers que quieren agregar más servicios a su portafolio.",

        "Ahora viene la técnica más poderosa de esta lección: la Técnica del Curso Gancho. NUNCA vendas \"un paquete de 9.400 cursos\". Suena demasiado bueno para ser verdad y la gente desconfía. En lugar de eso, identifica EL curso específico que tu prospecto necesita y véndele ESE. Los demás son el regalo sorpresa. Así funciona en la práctica: si estás hablando con un universitario de ingeniería, dile \"Oye, encontré un curso completo de AutoCAD y otro de Python para ingenieros que están brutales. Y lo mejor es que vienen dentro de un pack que incluye otros 400 cursos de tecnología como regalo. Todo por $48.500\". ¿Ves la diferencia? No vendes un número abrumador; vendes la solución exacta a su necesidad y le agregas un valor masivo con el resto.",

        "Para identificar a tus prospectos ideales, piensa en tu círculo más cercano. ¿Tienes amigos en la universidad? Véndeles el Pilar de Tecnología. ¿Conoces emprendedores? El Pilar de Negocios Digitales es perfecto. ¿Tu prima es diseñadora freelance? La Academia Creativa le va como anillo al dedo. Empieza siempre por la gente que ya te conoce y confía en ti. Ellos serán tus primeras ventas y tus primeros testimonios.",

        "Acción inmediata: Abre tu lista de contactos de WhatsApp ahora mismo. Identifica 20 personas que encajen en alguno de los 5 nichos cajero. No les escribas todavía — primero termina este módulo para que sepas exactamente qué decirles. Pero ten esa lista lista porque la vas a necesitar muy pronto.",
      ],
      tipExperto:
        "El valor percibido de un \"regalo sorpresa\" siempre facilita el cierre. Cuando dices \"y además te llevas 400 cursos extra de regalo\", el cerebro del cliente siente que está ganando muchísimo más de lo que paga. Esa percepción es tu mejor aliada.",
    },

    // ── Lección 3 ──────────────────────────────────────────────────────────
    {
      title: "Lección 3: Tu perfil de Facebook como imán de ventas",
      body: [
        "Tu perfil de Facebook es tu vitrina digital. Antes de comprar, el 80% de las personas van a revisar tu perfil para decidir si confían en ti. Si tu foto de perfil es un meme, tu portada está vacía y tus últimas publicaciones son repost de chistes, nadie te va a tomar en serio como asesor educativo. La buena noticia es que optimizar tu perfil toma menos de 30 minutos y el impacto es brutal.",

        "FOTO DE PERFIL: Usa una foto real tuya, con buena iluminación, sonriendo, con ropa presentable. No tiene que ser profesional de estudio — una foto con tu celular frente a una pared blanca o con buena luz natural funciona perfecto. Nada de logos, avatares, ni fotos en grupo. La gente quiere ver la cara de la persona a quien le va a comprar.",

        "FOTO DE PORTADA: Esta es tu anuncio permanente. Crea una imagen en Canva (es gratis) con un mensaje como: \"Ayudo a personas a acceder a educación de calidad | +9.400 cursos disponibles\" o \"Asesor Educativo Digital | Cursos de Tecnología, Negocios y Creatividad\". Incluye un llamado a la acción sutil como \"Escríbeme para más info\". Canva tiene plantillas de portada de Facebook listas para personalizar.",

        "BIO E INFORMACIÓN: En la sección \"Intro\" de tu perfil pon algo como: \"Apasionado por la educación digital. Te ayudo a encontrar los mejores cursos para crecer profesionalmente. Escríbeme y te asesoro sin compromiso\". En \"Trabajo\" puedes poner \"Asesor Educativo en Estudia y Trabaja\" o el nombre que prefieras. Esto le da contexto inmediato a cualquiera que visite tu perfil.",

        "PUBLICACIONES ESTRATÉGICAS: Las últimas 3-5 publicaciones visibles en tu perfil deben mostrar valor y resultados. Publica cosas como: un tip rápido sobre algún tema de los cursos (\"3 atajos de Excel que te ahorran 2 horas al día\"), una captura mostrando la cantidad de carpetas del Drive (sin revelar todo el contenido), un testimonio de alguien que ya compró y está feliz, o una historia personal sobre cómo tú mismo estás aprendiendo. La regla es 4 publicaciones de valor por cada 1 de venta directa.",

        "ESTRATEGIA DE AMIGOS SUGERIDOS: Facebook tiene un algoritmo de \"Personas que quizás conozcas\" que se basa en intereses y páginas que sigues. Empieza a seguir páginas de educación online, programación, marketing digital, emprendimiento, y universidades de tu ciudad. Luego, envía solicitudes de amistad a personas que ya siguen estas mismas páginas. No les vendas nada al agregar — simplemente deja que tu perfil optimizado haga el trabajo. Cuando vean tus publicaciones de valor en su feed, ellos te van a escribir.",
      ],
      tipExperto:
        "Un perfil real y profesional genera confianza instantánea. Dedica 30 minutos hoy a optimizar foto, portada y bio. Es la inversión de tiempo con mayor retorno que puedes hacer como revendedor.",
    },

    // ── Lección 4 ──────────────────────────────────────────────────────────
    {
      title: "Lección 4: Infiltración en grupos y comentarios estratégicos",
      body: [
        "Los grupos de Facebook son minas de oro llenas de personas que ya están buscando lo que tú vendes. Hay grupos de \"Aprender Excel desde cero\", \"Marketing digital para emprendedores\", \"Programación en Python\", \"Diseño gráfico freelance\" y miles más. El problema es que si entras a vender directamente, te expulsan en minutos. La clave es la infiltración estratégica: posicionarte como alguien que ayuda, no como alguien que vende.",

        "FASE 1 — POSICIONAMIENTO (Semana 1-2): Únete a 10-15 grupos relevantes para los nichos que elegiste en la Lección 2. No publiques nada todavía. Dedica 15-20 minutos diarios a leer las publicaciones de los demás y dejar comentarios genuinamente útiles. Si alguien pregunta \"¿Alguien sabe cómo hacer una tabla dinámica en Excel?\", responde con una explicación real y detallada. Si preguntan \"¿Qué lenguaje de programación me recomiendan para empezar?\", da tu opinión fundamentada. En esta fase tu único objetivo es que la gente empiece a reconocer tu nombre y asociarlo con alguien que sabe y que ayuda.",

        "FASE 2 — AUTORIDAD (Semana 3-4): Ahora sí empieza a publicar contenido propio en los grupos. Pero NO ventas. Publica tips de valor puro. Un formato que funciona increíblemente bien es el post tipo \"descubrimiento\": \"Llevo 2 semanas estudiando análisis de datos y estos son los 3 conceptos que más me han volado la cabeza. El tercero me cambió la forma de ver los negocios...\". Este tipo de posts genera curiosidad, comentarios y posiciona tu nombre como alguien que está en el camino del aprendizaje activo.",

        "FASE 3 — CONVERSIÓN SUAVE (Semana 5 en adelante): Aquí es donde empiezas a monetizar, pero de forma elegante. Cuando alguien publique una pregunta relacionada con tus cursos, responde con valor REAL (2-3 párrafos de ayuda genuina) y al final agrega: \"Si te interesa profundizar, tengo un recurso muy completo que me ha ayudado mucho. Escríbeme al privado y te cuento\". La gente te va a escribir porque ya te conocen como alguien que aporta. En el privado, ahí sí, les cuentas sobre el paquete de cursos.",

        "POSTS QUE FUNCIONAN SIN PARECER VENTA — Copia y adapta estos formatos: Formato \"Pregunta al grupo\": \"Pregunta seria para el grupo: ¿Cuántos de ustedes han intentado aprender [tema] por YouTube y sienten que les falta estructura? Me pasó lo mismo y encontré algo que me funcionó. Si les interesa les cuento en los comentarios\". Formato \"Resultado personal\": \"No lo puedo creer. Acabo de [logro relacionado con lo que enseña el curso]. Hace 3 meses no sabía ni por dónde empezar. Lo que cambió todo fue dejar de aprender fragmentado y seguir un camino estructurado. ¿Alguien más ha sentido esa diferencia?\". Formato \"Recurso\": \"Hice un resumen de las 5 herramientas de [tema] que más me han servido. Si quieren que se los comparta, comenten 'YO' y se los envío al privado\".",

        "REGLA DE ORO: Por cada publicación que tenga alguna intención de venta, debes haber hecho al menos 5 interacciones de puro valor (comentarios útiles, respuestas a preguntas, tips gratuitos). Esta proporción 5:1 es lo que te mantiene como miembro valioso del grupo y no como spammer.",
      ],
      tipExperto:
        "Sé útil primero, vendedor después. La fórmula es simple: cada vez que alguien te escriba al privado porque vio tu comentario en un grupo, ya tienes el 70% de la venta hecha. La confianza se construyó antes de la conversación de ventas.",
    },

    // ── Lección 5 ──────────────────────────────────────────────────────────
    {
      title: "Lección 5: TikToks informativos de 15 segundos",
      body: [
        "TikTok es la máquina de alcance más poderosa que existe hoy. Un solo video puede ser visto por 10.000, 50.000 o hasta millones de personas — sin pagar un centavo en publicidad. Y lo mejor: no necesitas ser influencer, no necesitas mostrar tu cara si no quieres, y no necesitas equipo profesional. Solo necesitas tu celular y la estrategia correcta.",

        "EL FORMATO QUE MÁS VENDE: EL UNBOXING DIGITAL. Graba la pantalla de tu celular o computadora mostrando las carpetas de Google Drive. Abre el Drive, navega por las carpetas organizadas por temas (Programación, Marketing, Diseño, Excel...) y deja que la gente vea la cantidad masiva de contenido. Pon texto en pantalla que diga: \"Todo esto por menos de lo que cuesta un almuerzo\" o \"9.400 cursos. Un solo pago. De por vida\". Usa un audio en tendencia de fondo. Este formato funciona porque la gente quiere ver exactamente qué va a comprar, y cuando ven 23 carpetas llenas de cursos organizados, el valor es visualmente aplastante.",

        "LOS PRIMEROS 3 SEGUNDOS DECIDEN TODO. El algoritmo de TikTok mide cuántas personas ven tu video completo. Si la gente se va en los primeros 3 segundos, el video muere. Necesitas un gancho irresistible al inicio. Aquí tienes 6 hooks probados que puedes copiar y pegar como texto en pantalla: (1) \"Lo que las academias NO quieren que sepas...\" (2) \"Si estás viendo esto, todavía estás a tiempo\" (3) \"3 cosas que necesitas aprender antes de que acabe el año\" (4) \"¿Cansado de pagar miles por cursos? Mira esto\" (5) \"POV: Acabas de descubrir una biblioteca con 9.400 cursos\" (6) \"Nadie te va a decir esto sobre aprender en línea\".",

        "FORMATO CARRUSEL DE FOTOS: TikTok ahora permite subir fotos como carrusel (Photo Mode) y este formato está teniendo un alcance descomunal. Crea 5-8 slides en Canva con tips rápidos sobre un tema: \"5 atajos de Excel que nadie te enseñó\", \"3 herramientas de IA para ganar dinero desde casa\", \"Las 4 habilidades más pedidas en el mercado laboral 2026\". En la última slide pon: \"¿Quieres profundizar? Tengo acceso a más de 9.400 cursos. Link en mi perfil\" o \"Comenta CURSOS y te cuento cómo acceder\".",

        "ESTRATEGIA DE PUBLICACIÓN: Publica entre 2 y 4 videos diarios. Sí, la cantidad importa, especialmente al inicio. No todos van a funcionar y eso está bien — solo necesitas que 1 de cada 10 se haga viral para llenar tu bandeja de mensajes. Los mejores horarios para publicar en LATAM son: 7-9am (gente camino al trabajo), 12-2pm (hora del almuerzo), y 7-10pm (después del trabajo). Dato clave: el 80% de los usuarios de TikTok ve los videos sin sonido, por eso SIEMPRE debes usar texto en pantalla para transmitir tu mensaje.",

        "TU PERFIL DE TIKTOK: En tu bio pon algo como: \"+9.400 cursos | Un solo pago, de por vida | Escríbeme para info\" y en el link pon tu enlace de wa.link para que te escriban directo al WhatsApp (lo vamos a configurar en el Módulo 3). Cada video que publiques es una oportunidad de llevar gente desde TikTok → tu perfil → tu WhatsApp → tu venta cerrada.",
      ],
      tipExperto:
        "A la gente le gusta ver exactamente lo que va a comprar. Un video de 15 segundos mostrando las carpetas del Drive genera más confianza y ventas que mil palabras escritas. Graba uno hoy mismo y publícalo: no tiene que ser perfecto, tiene que ser real.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO 2 — IA Y COPYWRITING
  // ═══════════════════════════════════════════════════════════════════════════
  m2: [
    // ── Lección 1 ──────────────────────────────────────────────────────────
    {
      title: "Lección 1: Prompts de oro para vender packs",
      body: [
        "La inteligencia artificial es tu redactor personal, disponible 24/7, que nunca se cansa y que puede generar 10 variaciones de un texto de ventas en 30 segundos. Si no la estás usando para crear tu contenido, estás compitiendo con las manos atadas. En esta lección te doy los prompts exactos (instrucciones para la IA) que puedes copiar, pegar y adaptar para generar textos de venta poderosos para cada uno de nuestros paquetes.",

        "PROMPT MAESTRO PARA POSTS DE FACEBOOK E INSTAGRAM — Copia y pega esto en ChatGPT o cualquier IA generativa: \"Actúa como un copywriter experto en ventas de cursos digitales para el mercado latinoamericano. Mi público son personas de 20-40 años que quieren mejorar sus ingresos o conseguir empleo. Necesito un post para Facebook/Instagram que venda un paquete de cursos que incluye [nombre del pilar o paquete, ej: Pilar de Tecnología con 8 temas completos de programación, Excel, bases de datos, IA, etc.]. El precio es $48.500 COP (un solo pago, acceso de por vida en Google Drive). El dolor principal de mi cliente es [ej: quiere aprender a programar pero no tiene dinero para una academia cara]. El tono debe ser conversacional, como un amigo que recomienda algo. Usa español latinoamericano. Incluye emojis con moderación. Máximo 150 palabras. Termina con un llamado a acción que diga: Escribe INFO en los comentarios o envíame un DM\".",

        "PROMPT PARA ESTADOS DE WHATSAPP — Los estados de WhatsApp son una mina de oro subestimada. Tus contactos los ven todos los días. Usa este prompt: \"Genera 7 estados de WhatsApp para una semana completa promocionando un paquete de cursos de [tema]. Cada estado debe tener máximo 2 líneas + 1 emoji. Distribuye así: Lunes = Motivación (identificar un dolor), Martes = Tip de valor gratuito, Miércoles = Testimonio o resultado, Jueves = Detrás de cámaras (qué incluye el paquete), Viernes = Oferta o urgencia, Sábado = Prueba social (número de estudiantes), Domingo = Recordatorio suave + llamado a la acción\". Con un solo prompt tienes contenido para toda la semana.",

        "PROMPT PARA MENSAJES DE SEGUIMIENTO EN WHATSAPP — Cuando alguien te preguntó por los cursos pero no compró, necesitas una secuencia de seguimiento que no sea invasiva. Usa este prompt: \"Escribe una secuencia de 5 mensajes de WhatsApp para darle seguimiento a una persona que preguntó por mi paquete de cursos pero no compró. Reglas: máximo 3 líneas por mensaje, tono amigable sin presión, cada mensaje espaciado 2 días, el último mensaje debe crear urgencia real, incluir 1 pregunta abierta en cada mensaje, usar español coloquial latinoamericano\". La IA te entregará 5 mensajes listos para copiar y enviar.",

        "PROMPT PARA ANUNCIOS DE FACEBOOK ADS — Si más adelante decides invertir en publicidad pagada (lo veremos en el Módulo 5), necesitarás variaciones de anuncios. Usa este prompt: \"Crea 5 variaciones de anuncio para Facebook dirigido a [audiencia, ej: universitarios en Colombia que buscan aprender programación]. Cada anuncio debe tener: un hook de máximo 10 palabras, un cuerpo de 3-4 líneas que genere deseo, y un llamado a la acción que lleve a escribir por WhatsApp. El producto es un paquete con más de 400 cursos de tecnología, acceso de por vida en Google Drive, por $48.500 COP. Haz las 5 variaciones así: (1) enfocada en DOLOR, (2) enfocada en ASPIRACIÓN, (3) enfocada en PRUEBA SOCIAL, (4) enfocada en URGENCIA, (5) enfocada en COMPARACIÓN con alternativas caras\".",

        "Consejo final: nunca publiques el primer texto que te genere la IA sin revisarlo. Léelo en voz alta. Si suena como algo que tú dirías naturalmente, está listo. Si suena muy robótico o formal, pídele a la IA: \"Reescribe esto más natural, como si se lo estuviera diciendo a un amigo por WhatsApp\". Tres iteraciones y tienes un texto ganador.",
      ],
      tipExperto:
        "La IA te ahorra horas. Úsala para crear 10 variaciones del mismo anuncio y quédate con las 2 mejores. La diferencia entre un revendedor que vende 2 packs al mes y uno que vende 20 es la cantidad y calidad de contenido que publica. La IA elimina esa barrera.",
    },

    // ── Lección 2 ──────────────────────────────────────────────────────────
    {
      title: "Lección 2: La fórmula A.I.D.A. (adaptada a cursos)",
      body: [
        "A.I.D.A. es la fórmula de ventas más probada del mundo: Atención, Interés, Deseo, Acción. Cada pieza de contenido que publiques — sea un post, un video, un mensaje de WhatsApp o un anuncio — debe seguir esta estructura. Cuando la domines, vas a poder vender cualquier cosa a cualquier persona. Vamos a adaptarla específicamente para vender nuestros paquetes de cursos.",

        "A — ATENCIÓN (1 línea). Tienes exactamente 1 segundo para detener el scroll de tu prospecto. Necesitas un gancho que le haga decir \"espera, ¿qué?\". Aquí tienes hooks que funcionan para nuestros cursos: \"¿Sigues pagando miles por cursos que puedes tener por $48.500?\" / \"Lo que aprendí en 2 semanas vale más que mis 5 años de universidad\" / \"9.400 cursos. Un pago. Para siempre. No es broma\" / \"¿Estás cansado de ver tutoriales en YouTube que nunca terminan de enseñarte lo importante?\". Regla: si tu primera línea no genera curiosidad o emoción, borra todo y empieza de nuevo. Esta línea es el 80% de tu éxito.",

        "I — INTERÉS (2-3 líneas). Ahora que captaste la atención, necesitas conectar con su situación. Demuestra que entiendes su dolor o su deseo. \"Yo también pasé meses buscando cursos sueltos en YouTube, armando un rompecabezas que nunca terminaba. Perdía horas buscando el siguiente tutorial y al final sentía que no avanzaba\". O para emprendedores: \"Sé lo que es querer aprender marketing, diseño, finanzas y programación pero que cada curso cueste $200.000 o más. Al final terminas sin aprender nada porque el presupuesto no alcanza\". La gente necesita sentir que tú la entiendes antes de estar dispuesta a escuchar tu solución.",

        "D — DESEO (2-3 líneas). Aquí muestras la solución y la haces irresistible. Pinta el resultado que lograrán + demuestra el valor masivo. \"Imagina tener acceso a una biblioteca completa con más de 9.400 cursos de programación, marketing, diseño, Excel, IA y mucho más. Todo organizado en carpetas en Google Drive, tuyo para siempre, y con actualizaciones constantes sin pagar un peso más. Más de 300 personas ya están aprendiendo con este mismo material\". IMPORTANTE: es en esta fase donde mencionas el número de cursos, los pilares, el acceso de por vida, las actualizaciones gratuitas. Nunca lances el precio antes de haber generado el deseo. El precio sin contexto de valor siempre suena \"caro\". El precio después de entender todo lo que incluye siempre suena \"regalado\".",

        "A — ACCIÓN (1 línea). El cierre debe ser claro, simple y con un solo paso: \"Escribe INFO en los comentarios y te cuento cómo acceder\" / \"Toca el link de mi perfil y te doy todos los detalles\" / \"Escríbeme al WhatsApp y te muestro todo lo que incluye\" / \"Comenta YO y te envío la info al privado\". Nunca des 3 opciones. Un solo camino. Si le pones \"escríbeme al WhatsApp, o deja un comentario, o envíame un DM, o entra a la web\", el cerebro se paraliza y no hace nada.",

        "EJEMPLO COMPLETO APLICADO A LA TIENDA COMPLETA ($80.000): [A] \"¿Sabías que el 70% de lo que te enseñan en la universidad ya está desactualizado?\" [I] \"Yo también sentí esa frustración. Necesitaba habilidades reales para el mercado laboral de hoy, no teoría de hace 10 años. Probé tutoriales en YouTube pero era como armar un rompecabezas sin imagen de referencia\". [D] \"Hasta que encontré una plataforma con más de 9.400 cursos actualizados de tecnología, negocios y creatividad. Todo organizado, en Google Drive, con acceso de por vida y actualizaciones gratis. Un solo pago de $80.000 — menos de $3.000 al día si lo divides en un mes\". [A] \"Escríbeme CURSOS al DM y te muestro todo lo que incluye\".",
      ],
      tipExperto:
        "Nunca lances el precio sin antes haber generado el deseo. La secuencia es sagrada: Atención → Interés → Deseo → AHORA SÍ el precio → Acción. Si alguien te pregunta el precio de entrada, responde: \"Te cuento en un momento, pero primero déjame mostrarte todo lo que incluye para que veas el valor real\".",
    },

    // ── Lección 3 ──────────────────────────────────────────────────────────
    {
      title: "Lección 3: Guiones express para TikTok/Reels",
      body: [
        "En TikTok e Instagram Reels tienes entre 15 y 60 segundos para captar, convencer y convertir. No hay tiempo para rodeos. Aquí te doy 3 estructuras de guion probadas que puedes grabar hoy mismo con tu celular, sin necesidad de mostrar tu cara si no quieres. Cada una está diseñada para nuestros paquetes de cursos y puedes rotarlas a lo largo de la semana.",

        "ESTRUCTURA 1: EL PROBLEMA — Duración: 15-30 segundos. Este formato ataca un dolor y presenta la solución. Guion para copiar: [Texto en pantalla segundo 0-3] \"Lo que las academias online NO quieren que sepas...\" [Texto segundo 3-8] \"Pagan cientos de miles por cursos que puedes conseguir por $48.500\" [Texto segundo 8-13] \"Un solo pago. Acceso de por vida. +9.400 cursos en Google Drive\" [Texto segundo 13-15] \"Link en mi perfil o comenta CURSOS\". Mientras el texto aparece en pantalla, muestra grabación de pantalla navegando por internet viendo precios de otras academias, o simplemente usa un fondo con movimiento. Pon un audio en tendencia de fondo a volumen bajo.",

        "ESTRUCTURA 2: EL UNBOXING DIGITAL — Duración: 15-30 segundos. Este es el formato más poderoso porque muestra el producto real. Guion: [Graba tu pantalla abriendo Google Drive] [Texto segundo 0-3] \"¿Esto es real? Mira todo lo que me llegó por $48.500\" [Empieza a abrir carpetas: Programación, Marketing, Diseño, Excel, IA...] [Texto segundo 8-12] \"23 temas completos. Más de 9.400 cursos\" [Texto segundo 12-15] \"Un pago único. Tuyo para siempre. Link en mi perfil\". Truco: abre las carpetas rápido para que se vea la cantidad masiva de contenido. La velocidad genera impacto visual. Si alguna carpeta tiene subcarpetas, ábrela para que se vea la profundidad del material.",

        "ESTRUCTURA 3: LA PRUEBA SOCIAL — Duración: 15-30 segundos. Nada vende más que mostrar que otros ya compraron y están satisfechos. Guion: [Texto segundo 0-3] \"Mi primer cliente ya está estudiando\" o \"Mira lo que dicen mis estudiantes\" [Muestra captura de pantalla de un chat de WhatsApp donde alguien te agradece o te dice que el material es excelente] [Texto segundo 5-10] \"Más de 300 personas ya accedieron a esta biblioteca\" [Texto segundo 10-15] \"¿Tú cuándo empiezas? Link en mi perfil\". Si todavía no tienes testimonios, pídele a un amigo o familiar que ya compró que te envíe un mensaje genuino comentando qué le pareció. Un solo testimonio real vale más que mil promesas.",

        "REGLAS PARA TODOS LOS VIDEOS: (1) Los primeros 3 segundos son VIDA O MUERTE — si no enganchan, el video muere. Pon el hook más fuerte al inicio. (2) SIEMPRE usa texto en pantalla — el 80% de la gente ve TikTok sin sonido. (3) No hagas videos de más de 60 segundos al inicio — los videos cortos tienen más probabilidad de ser vistos completos, y eso es lo que más valora el algoritmo. (4) Publica mínimo 2 videos diarios — no todos van a funcionar y eso es normal. Necesitas volumen. (5) Responde TODOS los comentarios — cada comentario le dice al algoritmo que tu video genera conversación y le da más alcance.",

        "PLAN DE CONTENIDO SEMANAL: Lunes = Problema (estructura 1). Martes = Unboxing Digital (estructura 2). Miércoles = Carrusel de fotos con tips de valor. Jueves = Prueba Social (estructura 3). Viernes = Repetir el que mejor funcionó esa semana. Sábado y Domingo = Contenido de valor puro (tips, datos curiosos) para construir audiencia. Con esta rotación, en una semana tienes 14+ piezas de contenido y al menos 2-3 van a tener buen alcance.",
      ],
      tipExperto:
        "En videos cortos, los primeros 3 segundos deciden si te compran o deslizan. Graba 3 versiones del hook inicial para el mismo video y publica la que suene más impactante. Una sola palabra diferente al inicio puede ser la diferencia entre 200 y 20.000 vistas.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO 3 — TRÁFICO INFINITO (ORGÁNICO)
  // ═══════════════════════════════════════════════════════════════════════════
  m3: [
    // ── Lección 1 ──────────────────────────────────────────────────────────
    {
      title: "Lección 1: Infiltración en grupos de Facebook",
      body: [
        "En el Módulo 1 aprendiste los principios de la infiltración en grupos. Ahora vamos al nivel avanzado: la Estrategia del Ayudante. Esta técnica convierte cada respuesta tuya en un grupo de Facebook en una máquina de generar mensajes privados de personas interesadas en comprar. No es SPAM, no rompe ninguna regla, y funciona todos los días.",

        "PASO 1 — ELIGE LOS GRUPOS CORRECTOS. No todos los grupos valen igual. Busca grupos que tengan estas 3 características: (1) Más de 5.000 miembros. (2) Al menos 10 publicaciones nuevas por día (grupo activo). (3) Temática directamente relacionada con nuestros pilares: programación, Excel, marketing digital, diseño gráfico, emprendimiento, freelance, trabajo desde casa, becas, educación online. Únete a 10-15 grupos que cumplan estos criterios. No te unas a 50 — es mejor ser muy activo en 10 que invisible en 50.",

        "PASO 2 — LA ESTRATEGIA DEL AYUDANTE EN ACCIÓN. Todos los días, dedica 20 minutos a revisar las preguntas nuevas en tus grupos. Cuando encuentres una pregunta sobre un tema que cubren nuestros cursos, responde con una respuesta REAL y DETALLADA. No respondas con \"búscalo en Google\" o con una línea genérica. Escribe 3-4 líneas de ayuda genuina que demuestren que sabes del tema. Ejemplo: Si alguien pregunta \"¿Cómo puedo aprender Python desde cero?\", responde algo como: \"Te recomiendo empezar por entender bien las variables y las estructuras de datos. Luego pasa a funciones y después a proyectos pequeños como automatizar tareas en Excel. Yo aprendí con un pack de cursos que tengo en mi Drive que me guió paso a paso. Si te interesa, escríbeme al privado y te cuento cómo accedo al material\".",

        "PASO 3 — EL GANCHO DEL MINICURSO GRATUITO. Esta es la jugada maestra. Cuando alguien te escriba al privado, no le mandes el link de compra de inmediato. Primero, dale algo de valor gratis. Puedes compartirle un PDF, un resumen, o incluso mostrarle una carpeta específica del Drive (sin darle acceso a todo) para que vea la calidad del material. Esto genera dos cosas: primero, el prospecto confirma que el material es real y de calidad; segundo, se queda con ganas de acceder al resto. Ahí es cuando le dices: \"Esto es solo uno de los 23 temas que incluye el pack. El acceso completo de por vida cuesta solo $48.500. ¿Te interesa?\".",

        "PASO 4 — ESCALA CON POSTS DE VALOR. Una vez por semana, publica en los grupos donde ya eres reconocido un post de valor puro con este formato: \"Llevo [X semanas] estudiando [tema] y quiero compartir los 3 recursos que más me han ayudado. Si quieren que se los pase, comenten 'YO' y se los envío al privado\". Este tipo de posts genera decenas de comentarios. A cada persona que comente, le escribes al privado con tu mejor contenido de valor + la mención natural de que tienes acceso al paquete completo. Importante: nunca pongas links directos en los comentarios — siempre lleva la conversación al privado.",

        "NÚMEROS REALES: Si eres constante con esta estrategia en 10 grupos activos, puedes generar entre 5 y 15 conversaciones privadas diarias de personas genuinamente interesadas. Si cierras el 20-30% de esas conversaciones (lo cual es muy factible con los guiones del Módulo 4), estás hablando de 1-4 ventas diarias. A $26.190 de comisión por venta del Pilar Completo, eso son entre $26.190 y $104.760 diarios. Todo sin invertir un peso en publicidad.",
      ],
      tipExperto:
        "Ofrecer un minicurso o recurso gratis de tu Drive como gancho llena tu bandeja de mensajes. La clave es dar valor real primero — una persona que recibe algo útil gratis de ti le cuesta mucho decirte que no cuando le ofreces el paquete completo.",
    },

    // ── Lección 2 ──────────────────────────────────────────────────────────
    {
      title: "Lección 2: TikTok \u2014 el \u201Cshow\u201D de las carpetas",
      body: [
        "En el Módulo 1 aprendiste los formatos básicos de TikTok. Ahora vamos a profundizar en LA estrategia que mejor funciona para vender paquetes de cursos en esta plataforma: el show de las carpetas. Este formato tiene un poder visual que ningún texto puede igualar, porque le muestra al prospecto exactamente qué va a recibir.",

        "LA GRABACIÓN PERFECTA — Paso a paso. Abre Google Drive en tu computadora (se ve mejor en pantalla grande que en celular). Usa una app de grabación de pantalla (OBS Studio es gratis para PC, o la función de grabación nativa en Mac). Ahora haz lo siguiente en este orden: (1) Muestra la carpeta raíz con los 23 temas organizados por pilar. Que se vean todos los nombres: Programación, Excel, Marketing Digital, Diseño Gráfico, IA, etc. (2) Abre una carpeta — por ejemplo \"Programación\" — y muestra las subcarpetas: Python, JavaScript, HTML/CSS, React, etc. (3) Abre una subcarpeta y muestra los archivos reales: videos, PDFs, ejercicios. (4) Regresa a la carpeta raíz y abre otro pilar para que vean la variedad. Todo esto lo haces en 15-20 segundos, navegando con velocidad suficiente para que se vea la cantidad pero no tan rápido que no se distinga nada.",

        "TEXTO EN PANTALLA (obligatorio): En la parte superior del video pon el hook: \"¿Todo esto por $48.500? No puede ser real\" o \"Lo que recibí después de pagar $48.500\". En la parte inferior pon el cierre: \"Link en mi perfil. Acceso de por vida\". El texto debe ser grande, legible, con colores que contrasten con el fondo del Drive (blanco). Usa texto amarillo o blanco con sombra negra para máxima legibilidad.",

        "CÓMO GENERAR INTERACCIÓN (la clave del algoritmo). El algoritmo de TikTok prioriza videos que generan comentarios. Por eso, al final del video o en el texto en pantalla, haz una pregunta que invite a comentar: \"¿Qué tema te gustaría aprender? Dímelo en los comentarios y te digo si lo tenemos\" o \"Comenta el nombre de un curso y te digo si está en el pack\". Cuando la gente comente, responde a TODOS. Cada respuesta tuya también cuenta como interacción para el algoritmo. Y a cada persona que comente algo relevante, puedes responder públicamente con valor y luego enviarle un DM: \"Vi que te interesa [tema]. Si quieres te cuento cómo acceder al pack completo\".",

        "SERIE DE CONTENIDO: No hagas un solo video y esperes resultados. Crea una serie: \"Explorando mi biblioteca de cursos — Parte 1: Tecnología\", \"Parte 2: Negocios Digitales\", \"Parte 3: Academia Creativa\". Cada parte muestra un pilar diferente. Las series generan seguidores que esperan la siguiente entrega. Además, puedes crear videos específicos por nicho: \"Lo que un diseñador gráfico necesita estudiar\" (mostrando solo las carpetas de diseño), \"Todo lo que necesitas para emprender\" (mostrando marketing + finanzas + ecommerce), etc.",

        "HORARIOS DE PUBLICACIÓN PARA LATAM: Los mejores momentos para publicar son 7-9 AM (la gente revisa el celular al despertar), 12-2 PM (hora del almuerzo) y 7-10 PM (después del trabajo o la universidad). Publica al menos 2 videos diarios en estos horarios. TikTok premia la constancia: las cuentas que publican todos los días obtienen más alcance que las que publican esporádicamente.",
      ],
      tipExperto:
        "Pide en el video que te comenten qué quieren aprender para decirles si lo tienes. Esta simple pregunta puede triplicar tus comentarios, lo que dispara el alcance del video y te da una lista de prospectos calientes para contactar por DM.",
    },

    // ── Lección 3 ──────────────────────────────────────────────────────────
    {
      title: "Lección 3: El puente a WhatsApp",
      body: [
        "Las redes sociales son tu vitrina, pero WhatsApp es tu caja registradora. Puedes tener miles de vistas en TikTok y cientos de comentarios en Facebook, pero si esas personas no llegan a tu WhatsApp, no tienes ventas. Esta lección te enseña a construir el puente que convierte seguidores en clientes.",

        "PASO 1 — CREA TU ENLACE PERSONALIZADO DE WHATSAPP. Ve a wa.me o usa la herramienta wa.link. Crea un link con tu número de WhatsApp y un mensaje predeterminado. El formato es: wa.me/57TUNUMERO?text=Hola,%20quiero%20información%20sobre%20los%20cursos (reemplaza 57 por el código de tu país y TUNUMERO por tu número sin espacios). Cuando alguien toque este link, se abre WhatsApp directamente con un mensaje predeterminado listo para enviar. Esto elimina la fricción de tener que guardar tu número, abrir WhatsApp, buscarte y escribirte. Un solo toque y ya están hablando contigo.",

        "PASO 2 — COLOCA TU LINK EN TODAS PARTES. Este link debe estar en: tu bio de TikTok (el ÚNICO link disponible — úsalo bien), tu bio de Instagram, la sección \"Intro\" de tu perfil de Facebook, tu firma de correo electrónico, y cualquier plataforma donde tengas presencia. La idea es que no importa dónde te descubra un prospecto, siempre tenga un camino directo a tu WhatsApp.",

        "PASO 3 — LA TÉCNICA DE RESPUESTA PÚBLICA + PRIVADA. Cuando alguien comente \"Info\", \"Quiero\", \"¿Cómo accedo?\" o cualquier pregunta en tus publicaciones de Facebook, TikTok o Instagram, haz SIEMPRE estas dos cosas: (1) Responde públicamente con valor: \"¡Claro que sí! Es un pack con +9.400 cursos de [tema que le interese], acceso de por vida en Google Drive. Te envío los detalles al privado\". (2) Inmediatamente después, envíale un mensaje privado/DM: \"Hola, vi tu comentario sobre los cursos. ¿Qué tema te interesa más? Así te cuento cuál pack te conviene\". La respuesta pública es importante porque otros usuarios la ven y también se interesan. El mensaje privado es donde inicias la conversación de venta real.",

        "PASO 4 — ESTADOS DE WHATSAPP COMO EMBUDO. Tus estados de WhatsApp son un canal de marketing gratuito que ven tus contactos cada día. Publica 3-5 estados diarios rotando estos tipos de contenido: (1) Un tip de valor relacionado con los cursos (\"¿Sabías que el 65% de las empresas piden manejo avanzado de Excel?\"). (2) Una captura del Drive mostrando las carpetas (sin dar acceso, solo la imagen). (3) Un testimonio o chat de un cliente satisfecho. (4) Una oferta con tu cupón de descuento del 10%: \"Hoy tienes 10% OFF con mi cupón. Responde este estado y te cuento\". (5) Un resultado personal: \"Hoy aprendí [algo del curso] y me siento increíble\". La regla es que por cada 4 estados de valor o entretenimiento, puedes poner 1 de venta directa.",

        "MÉTRICAS QUE IMPORTAN: Lleva un registro simple (en las notas de tu celular o en un Excel) de: cuántas personas te escriben al WhatsApp por día, de qué plataforma vienen (TikTok, Facebook, Instagram, estado de WhatsApp), cuántas compran, y cuántas no compran pero mostraron interés (para seguimiento). Después de 2 semanas, vas a saber exactamente cuál plataforma te genera más ventas y puedes duplicar tu esfuerzo ahí. No adivines: mide y ajusta.",
      ],
      tipExperto:
        "Las redes sociales atraen, pero el WhatsApp es donde realmente se cierra el dinero. Todo tu contenido en redes debe tener un solo objetivo: llevar a la persona a escribirte al WhatsApp. Ahí es donde ocurre la magia.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO 4 — CIERRE MAESTRO
  // ═══════════════════════════════════════════════════════════════════════════
  m4: [
    // ── Lección 1 ──────────────────────────────────────────────────────────
    {
      title: "Lección 1: El guion de oro de 3 pasos",
      body: [
        "El cliente ya te escribió al WhatsApp. Ya hizo lo más difícil: dio el primer paso. Ahora viene el momento que separa a los revendedores que ganan esporádicamente de los que generan ingresos consistentes. Todo se reduce a los próximos 5-10 mensajes. Este guion de 3 pasos ha sido probado con cientos de ventas reales y tiene una tasa de cierre del 25-35% (es decir, de cada 4 personas que te escriben, al menos 1 compra).",

        "PASO 1 — CONECTAR (nunca empieces por el precio). Cuando alguien te escribe \"Hola, quiero info de los cursos\" o \"¿Cuánto cuestan?\", la tentación es responder con el precio de inmediato. NO lo hagas. Un precio sin contexto siempre suena caro. En lugar de eso, conecta primero. Responde así: \"¡Hola [nombre]! Qué gusto que me escribas. Para poder ayudarte mejor, cuéntame: ¿qué es lo que más te gustaría aprender? ¿En qué área te gustaría crecer?\" — luego espera la respuesta. Cuando te diga \"Quiero aprender programación\" o \"Me interesa el marketing digital\", haz una segunda pregunta de conexión: \"¡Excelente! ¿Ya tienes experiencia en eso o empezarías desde cero?\". Estas preguntas hacen dos cosas: te dan información para personalizar tu pitch, y hacen que la persona se sienta escuchada y atendida, no como un número más.",

        "PASO 2 — EL BOMBAZO DE VALOR (haz que el precio sea ridículo en comparación). Ahora que sabes qué busca, lanza el valor. Supongamos que te dijo que quiere aprender programación y es principiante. Responde algo como: \"Perfecto, entonces lo que te conviene es el Pilar de Tecnología. Incluye cursos completos de Python, JavaScript, HTML, CSS, bases de datos, inteligencia artificial y mucho más. Son más de 400 cursos organizados por nivel, desde cero hasta avanzado. Todo en Google Drive, tuyo para siempre. Y lo mejor: si en algún momento agregamos cursos nuevos, te llegan automáticamente sin pagar un peso más\". Luego envía una captura de pantalla de las carpetas del Drive para que vea la cantidad de material. Y agrega: \"Además, si más adelante quieres aprender marketing o diseño, tienes un 70% de descuento automático en todos los demás pilares por ser miembro\".",

        "PASO 3 — CERRAR (la pregunta de cierre que obliga a decidir). Ahora sí, el precio + la pregunta de cierre. No digas \"Cuesta $48.500\". Di: \"Todo esto tiene un valor real de más de $2.000.000 si lo compraras curso por curso en otras plataformas. Pero tú te lo llevas completo por solo $48.500 COP — un solo pago y es tuyo de por vida. ¿Te genero el enlace de pago para que lo actives ahora mismo?\" — La pregunta final es CRUCIAL. No digas \"¿Qué opinas?\" ni \"¿Te parece?\". Esas preguntas invitan a la duda. Pregunta algo que asuma el cierre: \"¿Te genero el enlace?\" / \"¿Te activo el acceso hoy?\" / \"¿Por cuál medio de pago te queda más fácil: Nequi, DaviPlata o tarjeta?\". El prospecto solo tiene que decir sí o elegir una opción, no deliberar.",

        "EJEMPLO COMPLETO DE CONVERSACIÓN: Cliente: \"Hola, vi tu video de los cursos. ¿Cuánto cuesta?\" — Tú: \"¡Hola! Qué gusto. Cuéntame, ¿qué tema te interesa más?\" — Cliente: \"Excel y análisis de datos\" — Tú: \"¡Excelente elección! ¿Ya manejas Excel básico o empiezas de cero?\" — Cliente: \"Sé lo básico\" — Tú: \"Perfecto. Tenemos un pilar completo de Tecnología que incluye Excel básico, intermedio y avanzado, tablas dinámicas, macros, Power BI, análisis de datos con Python, y mucho más. Son más de 400 cursos organizados paso a paso. Todo en tu Google Drive, tuyo para siempre. [Envía captura de carpetas]. Y si después quieres aprender marketing o diseño, tienes 70% de descuento automático\" — Cliente: \"¿Y cuánto cuesta?\" — Tú: \"Son solo $48.500 COP. Un único pago, acceso de por vida, con actualizaciones gratis. ¿Te genero el enlace de pago? Puedes pagar por Nequi, DaviPlata, tarjeta, PSE o hasta en efectivo en Efecty\".",

        "Si el cliente dice que sí: envíale tu link de afiliado del paquete correspondiente (recuerda que tu link ya incluye el rastreo de tu comisión) o usa la Venta a Terceros si quieres manejar tu propio margen. Si dice que lo va a pensar: no te desesperes. Pasa a la Lección 3 de este módulo donde aprenderás el gatillo del cupón de descuento para rescatar esas ventas.",
      ],
      tipExperto:
        "Evita dar el precio en seco. Siempre acompáñalo del valor total que representan los cursos (\"más de $2.000.000 si los compraras por separado\") y de la pregunta de cierre (\"¿Te genero el enlace?\"). El contexto de valor hace que el precio se perciba como una ganga.",
    },

    // ── Lección 2 ──────────────────────────────────────────────────────────
    {
      title: "Lección 2: Vender el \u201Cacceso de por vida\u201D",
      body: [
        "Nuestra academia tiene una ventaja competitiva que el 90% de las plataformas de cursos NO ofrecen: acceso de por vida con un solo pago. Sin suscripciones mensuales, sin vencimientos, sin cargos ocultos. Esta ventaja es tan poderosa que, si la sabes comunicar correctamente, prácticamente se vende sola. En esta lección vas a aprender a convertir el \"acceso de por vida\" en tu argumento de cierre más devastador.",

        "EL DOLOR QUE ATACAS: En Latinoamérica, la mayoría de las personas que han considerado estudiar online conocen plataformas como Platzi ($49 USD/mes), Coursera ($59 USD/mes), LinkedIn Learning ($30 USD/mes) o Domestika ($10-50 USD por curso individual). Todas tienen algo en común: o cobran mensualmente o cobran por curso. El dolor de tu prospecto es real: \"Si pago una mensualidad y un mes no puedo estudiar, pierdo ese dinero\", \"Si compro un curso y no me gusta, no puedo cambiarme a otro\", \"Los cursos premium son muy caros y mi presupuesto no alcanza\". Tú tienes la solución a todos estos dolores.",

        "EL SCRIPT PARA VENDER EL ACCESO DE POR VIDA — Cuando el prospecto ya mostró interés, usa este argumento: \"¿Sabes cuál es la diferencia más grande entre nuestra academia y las demás? En Platzi pagas $200.000 al mes y si dejas de pagar, pierdes todo el acceso. En Udemy pagas $50.000 por UN solo curso. Aquí pagas $48.500 UNA SOLA VEZ y te llevas más de 400 cursos de [pilar] para siempre. No hay mensualidad, no hay renovación, no hay letra pequeña. Es tuyo, en tu Drive, y puedes hasta descargar los videos para verlos sin internet. Imagina: dentro de 2 años sigues accediendo al mismo material, más todo lo nuevo que hayamos agregado, sin haber pagado un peso más. Eso no lo ofrece nadie\".",

        "LA PALABRA MÁGICA: Reemplaza la palabra \"costo\" o \"precio\" por \"inversión única\" en toda tu comunicación. \"La inversión única es de $48.500\" suena radicalmente diferente a \"El precio es $48.500\". \"Inversión\" implica que van a obtener algo a cambio. \"Única\" refuerza que no hay costos recurrentes. Es psicología pura, pero funciona.",

        "OBJECIONES RELACIONADAS Y CÓMO MANEJARLAS: \"¿Y si ustedes cierran la página?\" — \"Entiendo la preocupación. Por eso todo el material está en Google Drive, en la nube de Google, no en nuestra página. Aunque nuestra web desapareciera mañana, tu acceso a los cursos sigue intacto porque es una carpeta compartida directamente a tu Gmail. Google no va a cerrar mañana\". \"¿Los cursos se actualizan?\" — \"Sí, cuando nuestro equipo agrega cursos nuevos o actualiza material, te aparece automáticamente en tu carpeta de Drive. No tienes que hacer nada. Y eso no tiene costo adicional, es parte de tu acceso de por vida\". \"¿Puedo ver los cursos en mi celular?\" — \"¡Claro! Desde la app de Google Drive en tu celular, o puedes descargar los videos y verlos sin internet. Tenemos tutoriales para PC, Android y iPhone en la sección de ayuda\".",

        "MENSAJE DE CIERRE CON \"ACCESO DE POR VIDA\": Cuando estés por cerrar la venta, remata con: \"Piénsalo así: por menos de lo que cuesta una salida a comer, tienes acceso de por vida a una biblioteca con más de 9.400 cursos. Un solo pago. Sin mensualidades. Sin sorpresas. Y con actualizaciones gratis. ¿Te activo el acceso ahora?\". Esta frase resume todo el poder de tu oferta en 3 líneas.",
      ],
      tipExperto:
        "Usa la palabra \"inversión única\" en lugar de \"costo\" o \"precio\". Y siempre compara con lo que cuesta la alternativa: \"$200.000 al mes en Platzi vs $48.500 una sola vez aquí\". Cuando el prospecto hace esa comparación en su cabeza, el cierre es casi automático.",
    },

    // ── Lección 3 ──────────────────────────────────────────────────────────
    {
      title: "Lección 3: El gatillo del cupón de descuento",
      body: [
        "El prospecto te dijo \"déjame pensarlo\", \"ahora no puedo\" o simplemente dejó de responder. No está perdido. Tienes un arma secreta que cierra entre el 15% y el 25% de las ventas que parecían muertas: tu cupón de descuento personalizado del 10%. Este cupón es tu carta bajo la manga, y debes usarlo estratégicamente para crear urgencia real.",

        "CUÁNDO USAR EL CUPÓN: NUNCA lo ofrezcas al inicio de la conversación. Si das el descuento antes de que el prospecto valore el producto, estás devaluando tu oferta. El cupón se usa exclusivamente en estos 3 momentos: (1) Cuando el prospecto dijo que sí le interesa pero está dudando por el precio. (2) Cuando dejó de responder después de mostrar interés genuino (llevan 1-2 días en silencio). (3) Como incentivo final para cerrar la venta hoy y no \"mañana\" (el mañana nunca llega).",

        "EL SCRIPT DEL GATILLO — Cuando el prospecto duda por el precio: \"Entiendo perfectamente, sé que todo está caro ahora. Mira, te voy a contar algo: tengo un cupón especial de descuento del 10% que no está disponible para todo el mundo. Con mi cupón, el Pilar Completo te queda en solo $43.650 en lugar de $48.500. Pero solo puedo mantener este precio hasta [mañana/este viernes]. Después de eso vuelve al precio normal. ¿Te reservo uno?\". La magia aquí es doble: primero, le estás dando un beneficio exclusivo que lo hace sentir especial; segundo, estás creando urgencia real con un límite de tiempo.",

        "EL SCRIPT DE RECUPERACIÓN — Cuando el prospecto dejó de responder (enviar 2 días después del último mensaje): \"Hola [nombre], ¿cómo estás? No quiero molestarte, solo quería avisarte que conseguí un cupón de descuento del 10% para el pack de cursos que te interesaba. Con el cupón te queda en $43.650. Pero solo lo puedo mantener activo hasta hoy a las 11:59 PM. Si te interesa, me dices y te envío el link con el descuento ya aplicado. Si no, tranqui, sin presión\". Este mensaje funciona porque: no es agresivo, ofrece valor adicional (el descuento), tiene urgencia real (hoy a las 11:59), y le da la salida de \"sin presión\" que reduce la incomodidad.",

        "LA TÉCNICA DE LOS \"ÚLTIMOS CUPOS\": Si el cupón por sí solo no alcanza, combínalo con escasez. \"Oye [nombre], te cuento que esta semana solo me quedan 3 cupones del 10% de descuento. Ya usé 7 con otras personas y me quedan los últimos. ¿Quieres que te aplique uno antes de que se acaben?\". La escasez real (o percibida) obliga al cerebro a tomar decisiones rápidas. La gente teme perder una oportunidad más de lo que desea obtener un beneficio — esto se llama \"aversión a la pérdida\" y es el principio psicológico más poderoso en ventas.",

        "IMPORTANTE — CÓMO FUNCIONA TU CUPÓN TÉCNICAMENTE: Desde tu panel de Monetización en nuestra web, puedes generar tu código promocional personalizado. Cuando tu cliente compra usando tu cupón, recibe automáticamente el 10% de descuento y tú recibes tu comisión del 60% calculada sobre el valor neto (después del descuento y la tarifa de PayU). El sistema hace todo automáticamente. Tú solo necesitas compartir el código y cerrar la venta. Recuerda que puedes consultar la Calculadora de Proyección en tu panel para ver exactamente cuánto ganas por cada venta con cupón.",
      ],
      tipExperto:
        "La escasez real obliga a la mente a tomar una decisión rápida. Nunca ofrezcas el cupón al inicio — guárdalo como tu carta bajo la manga para los indecisos. Un descuento del 10% en el momento justo puede ser la diferencia entre una venta perdida y $26.190 en tu bolsillo.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO 5 — MODELO RESELLER
  // ═══════════════════════════════════════════════════════════════════════════
  m5: [
    // ── Lección 1 ──────────────────────────────────────────────────────────
    {
      title: "Lección 1: Cómo funciona el pago del 60%",
      body: [
        "Si ya dominas las ventas con link de afiliado y cupón de descuento, es hora de dar el salto al modelo que te da el control total: la Venta a Terceros (modo Reseller). En este modelo, tú eres el dueño del proceso completo. Cobras directamente al cliente el precio que tú decidas, luego nos pagas solo tu tarifa especial de revendedor, y el margen completo es tuyo. No hay tope de ganancias porque tú pones las reglas.",

        "ASÍ FUNCIONA PASO A PASO: (1) Tú encuentras al cliente por cualquier canal (WhatsApp, redes, en persona, donde sea). (2) Le ofreces el paquete de cursos al precio que tú quieras. Por ejemplo, tú podrías vender el Pilar de Tecnología por $70.000, $90.000 o incluso $120.000 — depende de tu mercado y de cómo posiciones el valor. (3) El cliente te paga directamente a ti (por Nequi, DaviPlata, transferencia, efectivo, como se pongan de acuerdo). (4) Tú entras a nuestra plataforma, vas a la sección \"Venta a Terceros\" o \"Comprar para un tercero\", seleccionas el paquete, ingresas el correo Gmail del cliente, y pagas con tu descuento especial de revendedor. (5) El sistema le envía automáticamente al cliente el acceso a su Google Drive. ¡Listo!",

        "TUS NÚMEROS REALES — Veamos los márgenes con cada paquete usando el precio base que tú nos pagas vs lo que podrías cobrar: Tema Individual: Tú pagas $7.840, vendes a $25.000-$35.000 → ganancia de $17.160-$27.160. Pilar Completo: Tú pagas $19.400, vendes a $70.000-$100.000 → ganancia de $50.600-$80.600. Combinación (2 Pilares): Tú pagas $30.280, vendes a $100.000-$150.000 → ganancia de $69.720-$119.720. Tienda Completa: Tú pagas $32.000, vendes a $120.000-$200.000 → ganancia de $88.000-$168.000. ¿Ves el poder? Con solo 1 venta de la Tienda Completa a $150.000, te llevas $118.000 LIMPIOS a tu bolsillo. Sin intermediarios, sin esperar aprobaciones, sin comisiones de plataforma.",

        "CUÁNDO USAR RESELLER vs LINK DE AFILIADO: Usa el link de afiliado cuando estés vendiendo a distancia (redes sociales, grupos de Facebook) a personas que no conoces personalmente. El sistema maneja todo automáticamente y tú recibes tu 60% de comisión. Usa el modo Reseller cuando: (1) Conoces al cliente personalmente y le puedes cobrar directo. (2) Quieres cobrar un precio mayor al oficial. (3) Estás vendiendo a un grupo (ej: una empresa que quiere capacitar a sus empleados). (4) Tienes una audiencia que confía en ti como \"curador\" de contenido educativo y puedes posicionar precios premium.",

        "VENTAJA CLAVE: FLUJO DE CAJA INMEDIATO. Con el link de afiliado, tu comisión se procesa después del periodo de garantía de 7 días. Con el modo Reseller, el dinero del cliente entra a tu bolsillo inmediatamente cuando te paga. Tú solo necesitas invertir el costo base para liberar el acceso. Eso significa que si vendes 3 paquetes un lunes, ya tienes el dinero el lunes mismo. Este modelo es ideal para quienes quieren generar ingresos rápidos y tienen la habilidad de vender cara a cara o por WhatsApp con una relación más directa.",
      ],
      tipExperto:
        "Tú tienes el control total del cliente y de tu flujo de caja. La clave del modelo Reseller es que no hay techo: si posicionas bien el valor de los cursos, puedes cobrar $150.000 o más por algo que a ti te cuesta $32.000. Tu margen es tu estrategia de precios.",
    },

    // ── Lección 2 ──────────────────────────────────────────────────────────
    {
      title: "Lección 2: Escalamiento con Facebook Ads",
      body: [
        "Hasta ahora todo lo que has aprendido es tráfico orgánico (gratis). Si quieres pasar del nivel \"ingreso extra\" al nivel \"negocio serio\", necesitas aprender a invertir en publicidad pagada. Facebook e Instagram Ads son la forma más rentable de llegar a miles de personas interesadas en aprender, con presupuestos tan bajos como $10.000-$20.000 COP diarios (menos de $5 USD). En esta lección te enseño a crear tu primera campaña rentable paso a paso.",

        "LA ÚNICA CAMPAÑA QUE NECESITAS AL INICIO: MENSAJES A WHATSAPP. Cuando crees una campaña en el Administrador de Anuncios de Meta (business.facebook.com), te va a pedir elegir un objetivo. Con presupuestos bajos, el ÚNICO objetivo que funciona es \"Mensajes\" → \"WhatsApp\". ¿Por qué? Porque este objetivo está optimizado para que la gente te escriba directamente, y tú ya sabes cerrar ventas por WhatsApp (Módulo 4). No uses \"Conversiones\" ni \"Tráfico\" con presupuestos pequeños — necesitan muchos más datos y dinero para funcionar bien.",

        "SEGMENTACIÓN PARA LATINOAMÉRICA — A quién mostrar tus anuncios: Ubicación: Colombia (o tu país). Ciudades principales como Bogotá, Medellín, Cali, Barranquilla (la gente en ciudades grandes tiene más poder adquisitivo y más conectividad). Edad: 20-45 años. Intereses (elige 3-5 de estos): Cursos en línea, Educación en línea, Platzi, Coursera, Udemy, Emprendimiento, Marketing digital, Freelance, Trabajo desde casa, Programación, Diseño gráfico. Estos intereses le dicen a Facebook: \"Muéstrale mi anuncio a personas que ya están interesadas en educación online\". No lances el anuncio a \"todo Colombia\" sin intereses — desperdiciarás tu presupuesto.",

        "TU PRIMER ANUNCIO — Texto copy-paste listo para usar: Pon como imagen una captura de las carpetas del Drive (o un carrusel con 3-4 imágenes de las diferentes carpetas). El texto del anuncio debe ser: \"¿Quieres aprender [programación/marketing/diseño/todo] pero las academias online te cobran fortunas? Accede a más de 9.400 cursos premium de Tecnología, Negocios y Creatividad. Un solo pago. Acceso de por vida. En tu Google Drive para siempre. Por menos de lo que pagas en una salida a comer. Escribe \"QUIERO INFO\" y te cuento todos los detalles + un descuento exclusivo\". El botón del anuncio debe decir \"Enviar mensaje de WhatsApp\".",

        "ESTRUCTURA DE CAMPAÑA CON $15.000-$20.000 COP/DÍA: Crea 1 campaña con 2 conjuntos de anuncios, cada uno con $7.500-$10.000/día. Conjunto 1: Segmentación por intereses (los que listamos arriba). Conjunto 2: Audiencia similar (Lookalike) del 1% basada en tus clientes anteriores o personas que te han escrito. En cada conjunto, pon 2 creatividades (anuncios) diferentes: una enfocada en el dolor (\"¿Cansado de pagar fortunas?\") y otra enfocada en el resultado (\"Imagina tener 9.400 cursos\"). Después de 5-7 días, revisa cuál anuncio tiene menor costo por mensaje y apaga el otro. Nunca tomes decisiones antes de 5 días — el algoritmo necesita tiempo para aprender.",

        "MÉTRICAS CLAVE — Cuándo escalar y cuándo parar: Costo por mensaje iniciado: menos de $2.000 COP es bueno, menos de $1.000 COP es excelente. CTR (Click-Through Rate): busca más del 1.5%. Si tu anuncio tiene menos del 1%, cambia la imagen o el texto. Para escalar: cuando tengas 3+ días consecutivos con costo por mensaje estable, sube el presupuesto un 20-30%. Nunca subas más del 30% de golpe o el algoritmo se desestabiliza. Para parar: si después de 7 días no has cerrado al menos 1 venta, el problema probablemente no es el anuncio sino tu guion de cierre por WhatsApp (regresa al Módulo 4).",
      ],
      tipExperto:
        "El texto del anuncio debe romper objeciones antes de que te escriban. Si tu anuncio ya dice \"un solo pago, de por vida, en Google Drive\", cuando la persona te escriba ya tiene resuelta la mitad de sus dudas y solo falta cerrar. Empieza con $15.000 COP/día y escala solo cuando veas resultados consistentes.",
    },

    // ── Lección 3 ──────────────────────────────────────────────────────────
    {
      title: "Lección 3: Crea tu propia base de datos",
      body: [
        "El 70% de las personas que te escriben NO van a comprar la primera vez. Pero eso no significa que estén perdidas. Significa que necesitan más tiempo, más confianza, o simplemente que no era el momento. La diferencia entre un revendedor que gana $300.000 al mes y uno que gana $3.000.000 al mes es simple: el segundo tiene una base de datos de prospectos que nutre constantemente. Cada persona que te escribió alguna vez es una oportunidad futura de venta.",

        "PASO 1 — GUARDA TODOS TUS CONTACTOS ORGANIZADOS. Cada persona que te escriba preguntando por los cursos, guárdala inmediatamente en tus contactos de WhatsApp con un formato que te permita identificarla: \"María - Cursos Excel - 15Mar\" (nombre, qué le interesaba, fecha). Esto te permite: buscarla fácilmente después, saber exactamente qué le interesaba, y calcular cuánto tiempo ha pasado desde que te contactó. Si eres más organizado, crea una tabla simple en Google Sheets con columnas: Nombre, Teléfono, Qué le interesó, Fecha de contacto, Estado (Interesado/Seguimiento/Compró/No interesado).",

        "PASO 2 — CREA UNA LISTA DE DIFUSIÓN EN WHATSAPP. Ve a WhatsApp → Menú → Nueva lista de difusión → agrega todos los contactos que te han escrito preguntando por cursos. La lista de difusión es diferente a un grupo: cuando envías un mensaje a la lista, cada persona lo recibe como si fuera un mensaje individual tuyo, no como un mensaje de grupo. Esto se siente mucho más personal y tiene tasas de lectura del 80-90% (vs 10-20% de un grupo).",

        "PASO 3 — MENSAJES QUINCENALES QUE REACTIVAN VENTAS. Cada 15 días, envía un mensaje a tu lista de difusión con novedades o valor. Aquí tienes 4 tipos de mensajes que puedes rotar: Mensaje tipo \"Novedad\": \"Hola, te cuento que acabamos de agregar 20 cursos nuevos de [tema trending] a la biblioteca. Si te interesa acceder, escríbeme y te doy los detalles\". Mensaje tipo \"Testimonio\": \"[Nombre] acaba de terminar el curso de Excel avanzado y ya está aplicando lo que aprendió en su trabajo. Si tú también quieres empezar, me dices y te cuento cómo\". Mensaje tipo \"Oferta relámpago\": \"Solo por hoy tengo un cupón de 10% de descuento para el pack de [pilar]. Si te interesa, responde este mensaje antes de las 11:59 PM\". Mensaje tipo \"Contenido de valor\": Comparte un tip útil, un dato interesante, o un mini tutorial. Al final agrega: \"Si quieres profundizar en esto, tengo un pack completo que cubre este tema y muchos más\".",

        "PASO 4 — EL PODER DEL SEGUIMIENTO A LARGO PLAZO. No te desanimes si alguien no compra en el primer contacto ni en el segundo. Hay personas que compran al tercer, quinto o incluso décimo contacto. La clave es que cada mensaje que envíes aporte valor real para que no te vean como spammer sino como una fuente confiable de información. Si envías 2 mensajes mensuales durante 3 meses, eso son 6 puntos de contacto. En ventas, se dice que en promedio se necesitan 7 puntos de contacto antes de que una persona se decida a comprar. Tu lista de difusión hace ese trabajo automáticamente.",

        "NÚMEROS DEL NEGOCIO: Supongamos que en 3 meses juntas 200 contactos en tu lista de difusión. Si solo el 5% compra (una cifra muy conservadora), eso son 10 ventas. A un promedio de $26.190 de comisión por venta del Pilar Completo, son $261.900 — y eso es solo de seguimiento, sin contar las ventas que cierras en el primer contacto. Ahora imagina que en 6 meses tienes 500 contactos. El mismo 5% son 25 ventas: $654.750. Una base de datos bien nutrida es literalmente una máquina de imprimir dinero a futuro. Cada contacto que agregas hoy es dinero que puedes ganar mañana, la próxima semana, o el próximo mes.",
      ],
      tipExperto:
        "Una base de datos bien nutrida es una máquina de imprimir dinero a futuro. No borres ni ignores a ningún prospecto que te haya contactado. Guárdalo, agrégalo a tu lista de difusión, y nútrelo con valor cada 15 días. El dinero está en el seguimiento.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO 6 — EL ESCUDO IMBATIBLE
  // ═══════════════════════════════════════════════════════════════════════════
  m6: [
    // ── Objeción 1 ─────────────────────────────────────────────────────────
    {
      title:
        "Objeción 1: \u201C¿Es una estafa? ¿Cómo sé que me darán el acceso?\u201D",
      body: [
        "Esta es la objeción más común y más importante de resolver. Si el prospecto siente que puede ser una estafa, no importa qué tan barato sea el precio ni cuántos cursos ofrezcas: no va a comprar. La buena noticia es que esta objeción se destruye con una sola acción: MOSTRAR el producto por dentro. Lo visual vence a cualquier argumento verbal.",

        "SCRIPT PARA COPIAR Y PEGAR EN WHATSAPP: \"Entiendo perfectamente tu duda. Con tanto fraude en internet, es normal desconfiar. Déjame mostrarte algo para que te quedes tranquilo/a...\" — Ahora graba un video corto (30-60 segundos) de tu pantalla navegando dentro de Google Drive. Muestra las carpetas organizadas, abre una carpeta y enseña los archivos reales (videos, PDFs). Envía el video y luego escribe: \"Eso es lo que recibes en tu correo de Gmail apenas pagas. El acceso es instantáneo: en menos de 5 minutos ya estás dentro de todas las carpetas. Y si algo falla, tienes 7 días de garantía de satisfacción. Si no te gusta por la razón que sea, te devolvemos tu dinero sin preguntas. ¿Con eso te sientes más tranquilo/a?\".",

        "ARGUMENTOS EXTRA QUE REFUERZAN LA CONFIANZA: (1) \"El pago se procesa a través de PayU, que es la pasarela de pagos más grande de Latinoamérica. Es la misma que usan Rappi, Falabella y otras empresas grandes. Tu dinero está protegido con encriptación bancaria\". (2) \"No necesitas darnos acceso a ninguna cuenta tuya. Tú nos das tu correo de Gmail y nosotros compartimos las carpetas de Google Drive a ese correo. Es como cuando alguien te comparte un documento en Drive — no hay riesgo porque Google es quien maneja la seguridad\". (3) \"Llevamos más de [X tiempo] operando con más de [X] estudiantes activos. Si fuera estafa, ya no existiríamos\". (4) Si tienes testimonios de clientes reales (capturas de chat de WhatsApp donde alguien te agradece por el material), envíalos como prueba social adicional.",

        "ACCIÓN PREVENTIVA: La mejor forma de manejar esta objeción es no dejar que aparezca. Si en tus publicaciones de TikTok y Facebook siempre muestras el contenido real del Drive (las carpetas, los archivos, la navegación), la persona ya vio que es real antes de escribirte. Por eso los videos de \"unboxing digital\" del Módulo 1 son tan efectivos: pre-eliminan la objeción de estafa desde antes de que el prospecto te contacte.",
      ],
      tipExperto:
        "Mostrar el producto por dentro destruye la desconfianza. Un video de 30 segundos navegando por las carpetas del Drive vale más que mil palabras intentando convencer. La prueba visual es tu escudo contra la objeción de estafa.",
    },

    // ── Objeción 2 ─────────────────────────────────────────────────────────
    {
      title: "Objeción 2: \u201C¿Dan certificado de los cursos?\u201D",
      body: [
        "Esta objeción aparece frecuentemente con universitarios y personas que buscan mejorar su hoja de vida. La realidad es que nuestro enfoque no es el certificado sino la habilidad práctica. Y eso es exactamente lo que el mercado laboral actual valora más. Tu trabajo es redirigir la conversación del \"papel\" a la \"competencia real\".",

        "SCRIPT PARA COPIAR Y PEGAR EN WHATSAPP: \"¡Buena pregunta! Te soy honesto: algunos de los cursos del pack sí tienen certificado de finalización que puedes descargar, pero el enfoque principal de nuestra academia no es el papel, sino que realmente aprendas la habilidad. Te lo pongo así: una empresa hoy no contrata a alguien porque tiene un certificado de Canva — contrata a quien le muestre un portafolio real de diseños hechos con Canva. Nosotros te damos el conocimiento para que construyas ESE portafolio, ESE proyecto, o ESA habilidad que realmente impresiona en una entrevista o te permite ganar dinero como freelancer. Y todo esto por el 1% de lo que cuesta un semestre de universidad, con 100% del conocimiento práctico que necesitas para trabajar hoy. ¿Qué habilidad te gustaría dominar primero?\".",

        "DATO PODEROSO PARA REFORZAR TU ARGUMENTO: Según estudios recientes de LinkedIn y empresas de reclutamiento en Latinoamérica, más del 70% de los empleadores valoran las habilidades demostrables por encima de los certificados académicos. Esto es especialmente cierto en áreas como programación, marketing digital y diseño, donde lo que importa es lo que puedes hacer, no un papel que dice que tomaste un curso. Úsalo si el prospecto insiste: \"¿Sabías que 7 de cada 10 empresas prefieren ver lo que sabes hacer en lugar de un certificado? Con nuestros cursos vas a poder demostrar tu habilidad con proyectos reales\".",

        "PARA QUIENES SÍ NECESITAN UN CERTIFICADO: Si el prospecto necesita un certificado formal sí o sí (por ejemplo, para presentar en su empresa), puedes decirle: \"Entiendo que en tu caso necesitas algo formal. Lo que muchos de nuestros estudiantes hacen es aprender la habilidad con nuestros cursos (que son mucho más completos y prácticos que los de plataformas de certificados) y luego presentar un examen de certificación externo si lo necesitan. Pero el 90% descubre que con la habilidad real y un portafolio, el certificado se vuelve secundario\". Y luego redirige: \"¿Qué habilidad es la que necesitas certificar? Así veo qué paquete te conviene más\".",
      ],
      tipExperto:
        "Cambia el enfoque del \"papel\" hacia la \"habilidad\" que van a ganar. En 2026, el mercado laboral paga por lo que sabes hacer, no por lo que un documento dice que estudiaste. Posiciona la habilidad como el verdadero certificado.",
    },

    // ── Objeción 3 ─────────────────────────────────────────────────────────
    {
      title: "Objeción 3: \u201C¿El acceso se vence o es mensual?\u201D",
      body: [
        "Esta objeción en realidad es una oportunidad disfrazada. Cuando alguien pregunta si el acceso se vence, significa que ya está considerando comprar pero tiene miedo de que sea un gasto recurrente. Tu respuesta debe convertir ese miedo en alivio instantáneo y en la razón final para comprar.",

        "SCRIPT PARA COPIAR Y PEGAR EN WHATSAPP: \"¡Cero mensualidades! Es un pago único y el acceso es de por vida. Te lo explico: una vez que pagas, compartimos las carpetas de cursos directamente a tu cuenta de Google Drive. Quedan tuyas para siempre. Puedes acceder desde tu celular, computadora o tablet, en cualquier momento, sin límite de tiempo. Y lo mejor: cuando nuestro equipo agrega cursos nuevos o actualiza el material existente, te llegan automáticamente a tu Drive sin que tengas que pagar un peso más. Es como tener una biblioteca que crece sola cada mes. A diferencia de Platzi o Coursera donde pierdes todo si dejas de pagar la mensualidad, aquí es tuyo para siempre con un solo pago\".",

        "REFUERZA CON LA COMPARACIÓN DE COSTOS: \"Mira, para que te des una idea: un mes de Platzi cuesta $200.000 COP. Un año serían $2.400.000. Y si dejas de pagar, pierdes todo. Aquí pagas $48.500 UNA VEZ y tienes acceso a más de 9.400 cursos de por vida. Es literalmente 50 veces más barato que la alternativa, y encima no caduca. ¿Con cuál te quedarías?\".",

        "LA CEREZA DEL PASTEL — DESCARGA OFFLINE: Muchos prospectos tienen miedo de que \"la nube\" falle o de que no tengan internet siempre. Para eso, agrega: \"Y si quieres estar 100% seguro, puedes descargar los videos a tu computadora o celular para verlos sin internet. Una vez descargados, son tuyos aunque no tengas conexión. Es como tener tu propia universidad en el bolsillo\". Esta posibilidad de descarga elimina la última barrera psicológica. El prospecto sabe que no depende de internet, ni de nuestra plataforma, ni de nada. El contenido es suyo, punto.",

        "CIERRE DESPUÉS DE ESTA OBJECIÓN: Cuando hayas aclarado que es pago único y de por vida, el prospecto ya no tiene excusas racionales. Cierra inmediatamente: \"¿Entonces? ¿Te activo el acceso de por vida? Puedes pagar por Nequi, DaviPlata, tarjeta, PSE o incluso en efectivo en Efecty. ¿Cuál te queda más cómodo?\". Al darle opciones de CÓMO pagar (en lugar de preguntarle SI quiere pagar), asumes el cierre y le facilitas el siguiente paso.",
      ],
      tipExperto:
        "El \"pago único\" es el mayor alivio financiero para un estudiante o alguien con presupuesto ajustado. Cuando dices \"un solo pago, de por vida, sin mensualidades, sin sorpresas\", estás eliminando de un golpe la objeción del precio recurrente que es el principal freno de compra en educación online.",
    },

    // ── Objeción 4 ─────────────────────────────────────────────────────────
    {
      title: "Objeción 4: \u201CNo tengo el dinero ahora\u201D",
      body: [
        "\"No tengo dinero\" es la objeción más universal y, paradójicamente, no siempre es real. A veces significa genuinamente que no tienen el presupuesto. Pero en muchos casos significa \"no estoy suficientemente convencido de que valga la pena gastar mi dinero en esto\". Tu trabajo es diferenciar entre ambos casos y manejar cada uno de forma diferente.",

        "SCRIPT PARA CUANDO SOSPECHAS QUE ES FALTA DE CONVENCIMIENTO (no de dinero): \"Te entiendo perfectamente, sé que la situación económica está difícil para todos. Justamente, muchos de nuestros estudiantes compraron los cursos precisamente para aprender habilidades que les permitan ganar más dinero. [Nombre del estudiante] aprendió marketing digital con este mismo pack y ahora maneja las redes de 3 negocios locales cobrando $500.000 al mes por cada uno. La pregunta no es si puedes pagarlo, sino cuánto te cuesta NO aprenderlo y seguir donde estás 6 meses más. Son solo $48.500, menos de $1.700 al día si lo divides en un mes. ¿Qué te parece si te reservo el precio con un descuento del 10% por 24 horas para que lo pienses con calma?\".",

        "SCRIPT PARA CUANDO GENUINAMENTE NO TIENEN EL DINERO AHORA: \"Te entiendo al 100%. Mira, no hay presión. Lo que sí te recomiendo es que me guardes en tus contactos porque periódicamente tenemos promociones especiales donde el precio baja aún más. También puedes empezar con un Tema Individual por solo $19.600 — es un solo tema específico que te interese, como Excel o programación, y ya empiezas a aprender hoy. Después, cuando puedas, te llevas el pilar completo con un 70% de descuento automático por ser alumno. ¿Te interesa empezar con un tema individual mientras tanto?\".",

        "LA TÉCNICA DE LA RESERVA DE PRECIO: Si el prospecto dice que le interesa pero no puede pagar hoy, usa esta técnica de urgencia suave: \"Entiendo. Mira, lo que puedo hacer es guardarte mi cupón de descuento del 10% por las próximas 48 horas. Con el cupón, el Pilar Completo te queda en $43.650 en lugar de $48.500. Si el viernes ya puedes, me escribes y te envío el link con el descuento aplicado. ¿Te parece?\". Esto hace tres cosas: (1) Le da un plazo razonable para conseguir el dinero. (2) Le ofrece un incentivo extra para actuar dentro de ese plazo. (3) Establece un punto de seguimiento natural para que tú le escribas al vencer las 48 horas.",

        "MENSAJE DE SEGUIMIENTO (enviar cuando venzan las 48 horas): \"Hola [nombre], ¿cómo vas? Te escribo porque hoy es el último día que puedo mantener tu cupón del 10% de descuento. ¿Pudiste organizarte para activar el acceso? Si necesitas más tiempo, no hay problema, pero el descuento sí se vence hoy a la medianoche\". Este mensaje es respetuoso, no invasivo, y genera la urgencia necesaria para provocar acción.",

        "IMPORTANTE — LO QUE NUNCA DEBES HACER: (1) Nunca hagas sentir mal al prospecto por no tener dinero. Empatiza siempre primero (\"Te entiendo\", \"Sé que está difícil\"). (2) Nunca bajes el precio más allá del cupón del 10%. Si empiezas a regalar descuentos mayores, devalúas el producto y entrenas a tus clientes a esperar ofertas. (3) Nunca presiones agresivamente. Una venta forzada genera un reembolso dentro de los 7 días de garantía, y tú pierdes la comisión y al cliente. Es mejor perder una venta hoy y ganarla la próxima semana con un prospecto convencido.",
      ],
      tipExperto:
        "Empatiza primero (\"Te entiendo\"), luego ofrece una solución de tiempo limitado. Nunca hagas sentir mal a alguien por no tener el presupuesto — puede ser tu mejor cliente el mes siguiente si lo tratas con respeto. El dinero va y viene; la confianza, una vez perdida, no regresa.",
    },
  ],
};
