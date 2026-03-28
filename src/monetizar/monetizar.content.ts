export type FaqListItem = { ordered: boolean; items: string[] };

export interface FaqItem {
  question: string;
  paragraphs: string[];
  list?: FaqListItem;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export interface PaymentMethod {
  id: string;
  title: string;
  description: string;
}

export interface MonetizationBullet {
  label: string;
  /** Texto antes del monto resaltado */
  text: string;
  /** Monto en color acento (opcional) */
  highlightAmount?: string;
  /** Texto después del monto */
  textAfter?: string;
}

export interface MonetizationOption {
  id: string;
  title: string;
  intro: string;
  bullets: MonetizationBullet[];
  tipMaestro?: string;
}

export interface ProModule {
  id: string;
  title: string;
  concept: string;
  estadoLabel: string;
  /** Títulos de lecciones/objeciones para mostrar difuminados (sin tips del experto) */
  lessonTitles: string[];
}

export interface CalculatorCategory {
  id: string;
  name: string;
  precioReal: number;
  precioFinal: number;
  costoPayU: number;
  comision: number;
}

export const calculatorSectionTitle = "CALCULADORA DE PROYECCIÓN";
export const calculatorSectionLead =
  "Ingresa tu meta de ingresos mensuales y descubre cuántas ventas necesitas para alcanzarla. ¡Los números no mienten!";

export const calculatorCategories: CalculatorCategory[] = [
  {
    id: "tema",
    name: "Tema Individual",
    precioReal: 19600,
    precioFinal: 17640,
    costoPayU: 1803,
    comision: 10584,
  },
  {
    id: "pilar",
    name: "Un Pilar Completo",
    precioReal: 48500,
    precioFinal: 43650,
    costoPayU: 2883,
    comision: 26190,
  },
  {
    id: "combinacion",
    name: "Combinación (2 Pilares)",
    precioReal: 75700,
    precioFinal: 68130,
    costoPayU: 3900,
    comision: 40878,
  },
  {
    id: "tienda",
    name: "Tienda Completa",
    precioReal: 80000,
    precioFinal: 72000,
    costoPayU: 4061,
    comision: 43200,
  },
];

export const heroTitle =
  "¿Cómo puedo pagar? Tu inversión está 100% protegida.";

export const heroIntro =
  "Te ofrecemos múltiples opciones para que elijas la más cómoda para ti:";

export const paymentMethods: PaymentMethod[] = [
  {
    id: "wallets",
    title: "Billeteras digitales y pagos móviles",
    description: "Nequi, DaviPlata, Google Pay y códigos QR (Bre-B).",
  },
  {
    id: "cards",
    title: "Tarjetas de crédito y débito",
    description:
      "Visa, Mastercard, American Express, Diners Club y Codensa.",
  },
  {
    id: "transfer",
    title: "Transferencias bancarias",
    description:
      "Pagos rápidos y seguros a través de PSE o directamente desde tu banco.",
  },
  {
    id: "cash",
    title: "Efectivo en oficinas de pago",
    description:
      "Acércate a puntos físicos como Efecty, PagaTodo, La Perla, Su Red, Gana, y muchos más a nivel nacional.",
  },
];

export const securityBox = {
  lead: "Tu seguridad es primero:",
  body:
    "Procesamos tu pago con encriptación bancaria y protección antifraude, asegurando que tus datos financieros nunca sean revelados.",
};

export const monetizationTitle = "MONETIZACIÓN — gana un ingreso extra.";

export const monetizationLead =
  "¡Transforma tu aprendizaje en un negocio rentable! Al adquirir cualquier paquete desde $47.500 COP en adelante, desbloqueas automáticamente tu perfil de Revendedor Oficial. Tienes dos rutas probadas para generar ingresos masivos:";

export const monetizationOptions: MonetizationOption[] = [
  {
    id: "embajador",
    title: "Opción 1: Embajador digital (gana el 50% libre de comisiones)",
    intro:
      "Es la forma más rápida. Comparte tu enlace único o tu código promocional y nosotros nos encargamos del resto.",
    bullets: [
      {
        label: "Tu ganancia",
        text: "Por cada venta ejemplo de un pack de $47.500, recibes ",
        highlightAmount: "$28.500 COP",
        textAfter: " directos a tu cuenta.",
      },
      {
        label: "El potencial",
        text: "Con solo 2 ventas diarias, generas un salario mínimo extra al mes. ¡Imagina si tu contenido se vuelve viral!",
      },
    ],
    tipMaestro:
      "Tip maestro: Usa el “Gancho del Descuento”. Dile a tus amigos: “¡Oye! Vi que te gusta la programación. En esta página hay 3680 cursos brutales. Usa mi cupón y llévate un 10% de DESCUENTO extra hoy mismo”.",
  },
  {
    id: "reseller",
    title: "Opción 2: Modelo reseller (tú pones las reglas)",
    intro:
      "¿Quieres ser el dueño total del flujo? Compra los packs con un 50% libre de comisiones de descuento directo y revéndelos por tu cuenta al precio que tú decidas.",
    bullets: [
      {
        label: "Cómo funciona",
        text: "Si el pack cuesta $47.500, tú solo nos pagas ",
        highlightAmount: "$19.000 COP",
        textAfter: ".",
      },
      {
        label: "Tu margen",
        text: "Tú decides si lo vendes en $50.000, $80.000 o más. ¡Tienes el control total de tu rentabilidad y de tu propia base de clientes!",
      },
    ],
  },
];

export const ctaLabel = "Adquirir Pack Principal y Activar Perfil PRO";

export const proModulesSectionTitle = "Módulos — Solo Afiliados PRO";

export const proModules: ProModule[] = [
  {
    id: "m1",
    title: "Módulo 1: El Radar de Ganancias",
    concept:
      "No busques clientes, haz que ellos te encuentren. Aprende a usar las herramientas de los profesionales para saber qué cursos se están vendiendo hoy mismo y cómo preparar tus redes para recibirlos.",
    estadoLabel: "Solo Afiliados PRO",
    lessonTitles: [
      "Lección 1: Herramientas de espionaje (Google Trends y FB Library)",
      "Lección 2: Identificación de prospectos y nichos “cajero”",
      "Lección 3: Tu perfil de Facebook como imán de ventas",
      "Lección 4: Infiltración en grupos y comentarios estratégicos",
      "Lección 5: TikToks informativos de 15 segundos",
    ],
  },
  {
    id: "m2",
    title: "Módulo 2: IA y copywriting",
    concept:
      "No pierdas horas pensando qué decir. Aprende a usar la Inteligencia Artificial para crear anuncios y mensajes que “obliguen” a la gente a preguntar por tus cursos.",
    estadoLabel: "Solo Afiliados PRO",
    lessonTitles: [
      "Lección 1: Prompts de oro para vender packs",
      "Lección 2: La fórmula A.I.D.A. (adaptada a cursos)",
      "Lección 3: Guiones express para TikTok/Reels",
    ],
  },
  {
    id: "m3",
    title: "Módulo 3: Tráfico infinito (orgánico)",
    concept:
      "Cómo atraer a cientos de personas interesadas en aprender, usando solo tus redes sociales y un par de minutos al día sin gastar en publicidad.",
    estadoLabel: "Solo Afiliados PRO",
    lessonTitles: [
      "Lección 1: Infiltración en grupos de Facebook",
      "Lección 2: TikTok — el “show” de las carpetas",
      "Lección 3: El puente a WhatsApp",
    ],
  },
  {
    id: "m4",
    title: "Módulo 4: Cierre maestro",
    concept:
      "El cliente ya te escribió al WhatsApp preguntando “Precio” o “Información”. Ahora aprenderás el guion exacto para que no te dejen en “visto” y realicen la transferencia.",
    estadoLabel: "Solo Afiliados PRO",
    lessonTitles: [
      "Lección 1: El guion de oro de 3 pasos",
      "Lección 2: Vender el “acceso de por vida”",
      "Lección 3: El gatillo del cupón de descuento",
    ],
  },
  {
    id: "m5",
    title: "Módulo 5: Modelo reseller",
    concept:
      "Deja de ser un promotor y conviértete en el dueño de tu propio flujo de dinero. Aprende a comprar al por mayor y a escalar tus ventas usando publicidad pagada.",
    estadoLabel: "Solo Afiliados PRO",
    lessonTitles: [
      "Lección 1: Cómo funciona el pago del 50%",
      "Lección 2: Escalamiento con Facebook Ads",
      "Lección 3: Crea tu propia base de datos",
    ],
  },
  {
    id: "m6",
    title: "Módulo 6: El escudo imbatible",
    concept:
      "No pierdas ni una sola venta. Aquí tienes las respuestas “Copia y Pega” para las dudas y objeciones más comunes de los clientes de cursos digitales.",
    estadoLabel: "Solo Afiliados PRO",
    lessonTitles: [
      "Objeción 1: “¿Es una estafa? ¿Cómo sé que me darán el acceso?”",
      "Objeción 2: “¿Dan certificado de los cursos?”",
      "Objeción 3: “¿El acceso se vence o es mensual?”",
      "Objeción 4: “No tengo el dinero ahora”",
    ],
  },
];

export const faqSectionTitle = "FAQ — Academia";

export const faqCategories: FaqCategory[] = [
  {
    id: "negocio",
    title: "¿Cómo funciona el negocio y requisitos de entrada?",
    items: [
      {
        question:
          "¿Cómo puedo ganar dinero con ustedes? / ¿Cómo funciona lo de revender?",
        paragraphs: [
          "¡Es la mejor decisión que puedes tomar! Nuestro programa te permite revender nuestros paquetes y llevarte el 50% libre de comisiones directo a tu bolsillo por cada venta. Nosotros nos encargamos de entregar el acceso al cliente y dar soporte; tú solo recomiendas y ganas.",
        ],
      },
      {
        question:
          "¿Cualquier curso me sirve para ser afiliado? / Si compro un curso barato, ¿puedo monetizar? / ¿Tengo que pagar algo extra?",
        paragraphs: [
          "El programa de revendedores no tiene ningún costo de mensualidad, pero tiene un único requisito estricto de entrada: para que el sistema te habilite el panel de afiliado y te deje monetizar, debes adquirir un Pack Principal de nuestras categorías con un valor mínimo de $49.900 COP. (Las compras de cursos individuales o mini packs de $19.900 COP NO activan el derecho de reventa). Una vez adquieres tu Pack Principal, quedas habilitado de por vida para ganar el 50% libre de comisiones.",
        ],
      },
    ],
  },
  {
    id: "links",
    title: "Generación de links y ventas",
    items: [
      {
        question: "¿Dónde saco mi link de afiliado / código de descuento?",
        paragraphs: [
          'Debes loguearte y haber adquirido un paquete de mínimo $40.000 COP. Automáticamente en cada paquete estará activa la opción de generar link. Para crear un código promocional, ingresa a tu perfil en la sección “Monetizar”. El sistema registrará la venta a tu nombre automáticamente cuando el cliente use tu link o código.',
        ],
      },
      {
        question: "¿Puedo comprar con mi propio link para tener descuento?",
        paragraphs: [
          'No, está estrictamente prohibido hacer “auto-compras”. El sistema detecta estas prácticas y anula la comisión. El programa está diseñado para ganar dinero recomendando a otras personas.',
        ],
      },
    ],
  },
  {
    id: "pagos",
    title: "Pagos y comisiones",
    items: [
      {
        question: "¿Cuándo y cómo me pagan mis comisiones?",
        paragraphs: [
          "Las comisiones se aprueban el mismo día y se cancelan en las horas de la tarde, a partir de las 3 pm. Si haces una venta después de esa hora, el pago se procesa al día siguiente.",
        ],
      },
      {
        question: "¿Dónde veo cuántas ventas he hecho?",
        paragraphs: [
          'En tu panel de “Monetización” tienes un tablero en tiempo real para ver clics, ventas cerradas y saldo disponible para retirar.',
        ],
      },
    ],
  },
  {
    id: "estrategias",
    title: "Estrategias (tips de ventas)",
    items: [
      {
        question: "No sé cómo vender, ¿me ayudan?",
        paragraphs: [
          '¡Claro que sí! En tu panel de afiliado encontrarás una carpeta con “Material de Promoción” que incluye imágenes, videos y textos persuasivos listos para usar en Facebook, Instagram y WhatsApp.',
        ],
      },
    ],
  },
  {
    id: "nuevos",
    title: "Dudas de nuevos revendedores (rastreo y reglas)",
    items: [
      {
        question:
          "¿Yo tengo que darle soporte técnico o entregarle el curso al cliente que le vendí?",
        paragraphs: [
          "¡Para nada! Tú solo recomiendas. Nosotros nos encargamos del acceso automático al correo, envíos a Google Drive y todo el soporte técnico necesario.",
        ],
      },
      {
        question: "¿Puedo venderle a personas de otros países?",
        paragraphs: [
          "¡Por supuesto! Tu link es global. La plataforma mostrará los métodos de pago locales y hará la conversión de moneda automáticamente.",
        ],
      },
      {
        question:
          "El cliente dice que compró, pero no me aparece la comisión. ¿Qué pasó?",
        paragraphs: [
          "El cliente DEBE comprar usando tu link. Si cambia de navegador o dispositivo después de abrir el link, el rastreo se pierde. Es vital recordarles: “Asegúrate de darle clic a este enlace justo en el momento de hacer el pago”.",
        ],
      },
      {
        question:
          "¿Cuánto tiempo dura mi link o código promocional si el cliente no compra ese mismo día?",
        paragraphs: [
          "El link y el código promocional no caducan, puedes vender con tranquilidad.",
        ],
      },
    ],
  },
  {
    id: "activos",
    title: "Dudas de vendedores activos (panel y finanzas)",
    items: [
      {
        question:
          'Vendí un paquete con mi link, ¿por qué no me aparece ese paquete en “Mis Compras”?',
        paragraphs: [
          '“Mis Compras” es tu biblioteca personal. Las ventas a terceros aparecen en la sección “Programa de Afiliados” > “Mis Ventas” o “Tablero”. El material le llega al correo del cliente, no al tuyo.',
        ],
      },
      {
        question:
          "¿Qué pasa con mi comisión si el cliente pide la garantía o un reembolso?",
        paragraphs: [
          "Todos los clientes tienen 7 días de garantía. Si se solicita un reembolso, la comisión se anula. Por seguridad, las comisiones se liberan para pago tras pasar este periodo de 7 días.",
        ],
      },
    ],
  },
  {
    id: "tres-formas",
    title: "Las 3 formas de vender y ganar",
    items: [
      {
        question:
          "¿Cuáles son las opciones para venderle a mis clientes? / ¿Cómo les cobro?",
        paragraphs: [],
        list: {
          ordered: false,
          items: [
            "Opción 1 (Link de afiliado): El cliente paga en la web con descuento automático y recibes el 50% libre de comisiones.",
            "Opción 2 (Código promocional): El cliente usa un cupón para un 10% de descuento extra y recibes comisión automática.",
            "Opción 3 (Comprar para un tercero): Cobras directamente al cliente el precio que desees, luego compras en la plataforma con el 50% libre de comisiones de descuento inmediato (solo pagas el 50%) usando el correo del cliente.",
          ],
        },
      },
    ],
  },
  {
    id: "cuenta",
    title: "Gestión de cuenta y seguridad bancaria",
    items: [
      {
        question:
          "¿Cómo registro mi cuenta bancaria, actualizo mis datos o qué seguridad tiene mi dinero?",
        paragraphs: [
          "Todo se gestiona de forma segura desde tu Panel de Monetización. Tienes control absoluto las 24 horas para registrar o actualizar tus datos financieros.",
        ],
      },
      {
        question:
          "¿Me descuentan impuestos o comisiones de plataforma sobre mi 50%?",
        paragraphs: [
          "Tu comisión del 50% es neta sobre el valor comisionable. Nosotros cubrimos costos de servidores, pasarelas de pago y mantenimiento con el 50% restante.",
        ],
      },
    ],
  },
  {
    id: "intro-afiliado",
    title: "Introducción al mundo del afiliado y estrategia",
    items: [
      {
        question:
          "¿Qué es exactamente un afiliado y por qué debería convertirme en uno?",
        paragraphs: [
          "Es un socio comercial que recomienda productos digitales y gana comisión. Es ideal porque no creas el producto ni das soporte, nosotros ponemos la infraestructura y tú te llevas el 50% libre de comisiones de ganancia limpia.",
        ],
      },
      {
        question: "¿Cuántos ingresos se pueden generar como afiliado?",
        paragraphs: [
          "No hay tope. Desde un ingreso extra hasta un sueldo completo. Con la comisión del 50% libre de comisiones, pocas ventas a la semana generan ganancias muy atractivas.",
        ],
      },
      {
        question:
          "¿Cómo elijo un buen nicho o qué cursos me recomiendan vender?",
        paragraphs: [
          "El que se cruce con tus intereses. Paquetes de Programación o Ingeniería para universitarios, o Marketing para emprendedores. Revisa nuestro catálogo y elige la solución que mejor se adapte a tu entorno.",
        ],
      },
    ],
  },
  {
    id: "ventajas",
    title: "Las ventajas de trabajar con nosotros",
    items: [
      {
        question: "¿Qué ventajas tengo al vender sus cursos en lugar de otros?",
        paragraphs: [],
        list: {
          ordered: true,
          items: [
            "Tecnología Premium (infraestructura y cobro listo).",
            "Catálogo de Oro (material de alta calidad y actualizado).",
            "Libertad Total (3 formas de ganar).",
            "Automatización (entregas y pagos rápidos).",
            "Material de Apoyo (guías y creativos).",
            "Soporte 24/7 (Clarita IA y soporte humano).",
          ],
        },
      },
    ],
  },
];

export const footerSupportLine =
  "Soporte 24/7 con Clarita IA y soporte humano cuando lo necesites.";

export const footerDisclaimer =
  "Los resultados pueden variar según el esfuerzo, la dedicación y el contexto de cada persona. Los ejemplos de ingresos son ilustrativos y no constituyen una garantía de resultados.";
