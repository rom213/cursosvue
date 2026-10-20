import type { StudyRouteDefinition } from "./studyRoutes";

export const TECHNOLOGY_CATEGORY_ID = 200;
export const TECHNOLOGY_CAMPAIGN_ID = "tecnologia_200";

const illustrationAlts: Record<string, string> = {
  "arduino.webp": "Placa Arduino Uno R3 para proyectos de electrónica",
  "algoritmos.svg": "Diagrama de flujo del algoritmo de Euclides",
  "matematicas.svg": "Gráficas de las funciones seno y coseno",
  "electricidad.webp": "Resistencias electrónicas para circuitos eléctricos",
  "construccion.webp": "Grúas torre trabajando en una obra en construcción",
};

function route(
  id: string, title: string, summary: string, terms: RegExp,
  image: string, featured = true,
): StudyRouteDefinition {
  return {
    id, title: `Ruta ${title}`, summary, terms, featured,
    goal: `Explora ${title}: ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`,
    image: `/images/campaigns/tecnologia/${image}`,
    imageAlt: illustrationAlts[image] ?? `Logotipo de ${title}`,
    imageKind: illustrationAlts[image] ? "report" : "logo",
    accent: featured ? "#047857" : "#0e7490",
    steps: [
      `Empieza por los fundamentos de ${title}.`,
      "Practica con los cursos y proyectos que encajen con tu objetivo.",
      "Continúa con contenidos avanzados cuando tengas las bases.",
    ],
  };
}

// Order is editorial: programming, cloud and AI precede the remaining pillar.
// Match explicit technology names in titles, never broad author/platform labels.
// Do not use global regex flags: each expression is reused for the whole catalog.
export const TECHNOLOGY_ROUTES: StudyRouteDefinition[] = [
  route("python", "Python", "Programa, automatiza tareas y desarrolla proyectos con Python.", /\bpython\b|\bdjango\b|\bflask\b|\bfastapi\b/, "python.svg"),
  route("javascript", "JavaScript y TypeScript", "Domina el lenguaje del navegador y el tipado de tus aplicaciones.", /\bjava\s*script\b|\btypescript\b|\bjquery\b|\becmascript\b/, "javascript.svg"),
  route("frontend", "HTML, CSS y frontend", "Construye interfaces y sitios web adaptables.", /\bhtml\s*5?\b|\bcss\s*3?\b|\bsass\b|\btailwind\b|\bbootstrap\b|\bfront\s*end\b|desarrollo web|\bastro\b|\bthree\.?\s*js\b/, "html5.svg"),
  route("react", "React y Next.js", "Crea interfaces con componentes y aplicaciones web con React.", /\breact\b|\bnext\s*\.?\s*js\b|\bnextjs\b/, "react.svg"),
  route("vue", "Vue y Nuxt", "Desarrolla interfaces reactivas y aplicaciones con Vue.", /\bvue(?:\.?js)?\b|\bnuxt(?:\.?js)?\b|\bquasar\b/, "vue.svg"),
  route("angular", "Angular", "Organiza aplicaciones web con componentes y servicios.", /\bangular(?:js)?\b/, "angular.svg"),
  route("node", "Node.js y backend", "Construye servidores, servicios y API para tus aplicaciones.", /\bnode\s*\.?\s*js\b|\bnodejs\b|\bexpress(?:js)?\b|\bnest(?:js)?\b|\bback\s*end\b/, "nodedotjs.svg"),
  route("php", "PHP y Laravel", "Desarrolla aplicaciones y servicios web del lado del servidor.", /\bphp\b|\blaravel\b|\bsymfony\b/, "laravel.svg"),
  route("java", "Java y Spring", "Aprende programación orientada a objetos y aplicaciones con Java.", /\bjava\b(?!\s*script)|\bspring\b|\bjakarta\b/, "spring.svg"),
  route("dotnet", "C# y .NET", "Explora aplicaciones y servicios con el ecosistema .NET.", /\bc\s*#|\bcsharp\b|\basp\s*\.?\s*net\b|\bdotnet\b|\.net\b/, "dotnet.svg"),
  route("movil", "Desarrollo móvil", "Crea aplicaciones para Android e iOS.", /\bandroid\b|\bios\b|\bflutter\b|\bkotlin\b|\bswift\b|\breact native\b|\bionic\b|desarrollo movil/, "flutter.svg"),
  route("bases-datos", "SQL y bases de datos", "Diseña, consulta y administra datos para tus proyectos.", /\bsql\b|\bmysql\b|\bpostgres(?:ql)?\b|\bmongodb\b|bases? de datos|\boracle\b|\bredis\b/, "postgresql.svg"),
  route("git", "Git y control de versiones", "Organiza los cambios de tu código y colabora en equipo.", /\bgit\b|\bgithub\b|\bgitlab\b|control de versiones/, "git.svg"),
  route("linux", "Linux y terminal", "Trabaja con servidores, comandos y scripts de sistema.", /\blinux\b|\bubuntu\b|\bdebian\b|\bcentos\b|\bbash\b|\bshell\b|\bterminal\b|linea de comandos/, "linux.svg"),
  route("aws", "AWS", "Explora infraestructura y servicios de Amazon Web Services.", /\baws\b|amazon web services|\bec2\b/, "aws.svg"),
  route("azure", "Azure", "Desarrolla tus habilidades en la nube de Microsoft.", /\bazure\b/, "azure.svg"),
  route("google-cloud", "Google Cloud", "Explora los servicios y herramientas de Google Cloud.", /google cloud|\bgcp\b|\bbigquery\b/, "googlecloud.svg"),
  route("cloud", "Cloud y servidores", "Aprende a desplegar y administrar servicios en la nube.", /\bcloud\b|\bnube\b|\bservidores?\b/, "openstack.svg"),
  route("contenedores", "Docker y Kubernetes", "Empaqueta aplicaciones y explora la gestión de contenedores.", /\bdocker\b|\bkubernetes\b|\bk8s\b|\bcontenedores\b/, "docker.svg"),
  route("devops", "DevOps", "Conecta desarrollo, despliegue y operación de software.", /\bdevops\b|\bjenkins\b|\bterraform\b|\bansible\b|\bci\s*\/\s*cd\b|integracion continua|despliegue continuo/, "githubactions.svg"),
  route("ia", "Inteligencia artificial generativa", "Explora asistentes, modelos generativos y herramientas de IA.", /inteligencia artificial|\bia\b|\bai\b|\bchat\s*gpt\b|\bopenai\b|\bllms?\b|\bprompt(?:s|ing)?\b|\bmidjourney\b|\bstable diffusion\b|\bgemini\b|\blangchain\b/, "huggingface.svg"),
  route("machine-learning", "Machine learning y Data Science", "Analiza datos y explora modelos de aprendizaje automático.", /machine learning|deep learning|data science|ciencia de datos|\btensorflow\b|\bpytorch\b|\bpandas\b|\bnumpy\b|aprendizaje automatico|redes neuronales/, "tensorflow.svg"),
  route("wordpress", "WordPress y desarrollo CMS", "Crea y administra sitios web con WordPress y sus herramientas.", /\bwordpress\b|\bwoocommerce\b|\belementor\b|\bdrupal\b|\bjoomla\b/, "wordpress.svg"),
  route("fundamentos", "Fundamentos y algoritmos", "Desarrolla tu lógica y comprende las bases de la programación.", /algoritmos?|logica de programacion|fundamentos de programacion|\bpseint\b|estructuras de datos|programacion orientada a objetos|\boop\b|\bsolid\b|patrones de diseno/, "algoritmos.svg"),
  route("big-data", "Big Data y análisis de datos", "Explora procesamiento de datos y herramientas de análisis.", /big data|analisis de datos|analitica de datos|\bspark\b|\bhadoop\b|\bdatabricks\b|\bpower bi\b|\btableau\b/, "apachespark.svg"),
  route("ux-ui", "UX/UI y Figma", "Diseña experiencias, interfaces y prototipos digitales.", /\bux\b|\bui\b|\bfigma\b|\bsketch\b|diseno de interfaces|experiencia de usuario/, "figma.svg", false),
  route("testing", "Pruebas de software", "Comprueba la calidad de tus aplicaciones y automatiza pruebas.", /\btesting\b|\bselenium\b|\bcypress\b|\bplaywright\b|\bjest\b|pruebas de software|\bqa\b/, "selenium.svg", false),
  route("cpp", "C y C++", "Aprende fundamentos y programación de sistemas.", /\bc\+\+|\bcpp\b|(?:programacion|programar|lenguaje|curso de) (?:en )?c\b(?!\s*#)|\bc desde cero\b/, "cplusplus.svg", false),
  route("videojuegos", "Videojuegos, Unity y Unreal", "Explora la creación de juegos y experiencias interactivas.", /\bvideojuegos?\b|\bunity\b|\bunreal\b|\bgodot\b|\bgame development\b/, "unity.svg", false),
  route("ciberseguridad", "Ciberseguridad", "Protege sistemas y explora técnicas de seguridad digital.", /\bciberseguridad\b|cyber\s*security|seguridad (?:informatica|de la informacion|en redes)|\bosint\b|\bforense\b|\bsoc\b/, "hackthebox.svg", false),
  route("hacking", "Hacking ético", "Conoce técnicas de auditoría y evaluación de seguridad.", /\bhacking\b|\bpentesting\b|\bpentest\b|\bkali\b|\bmetasploit\b|\bethical hacker\b/, "kalilinux.svg", false),
  route("redes", "Redes y Cisco", "Aprende conectividad y administración de redes informáticas.", /\bcisco\b|\bccna\b|\bccnp\b|redes (?:informaticas|de computadoras|de datos)|\bnetworking\b|\bmikrotik\b|\btcp\b|\bwi\s*fi\b/, "cisco.svg", false),
  route("hardware", "Hardware y reparación", "Explora componentes y mantenimiento de equipos electrónicos.", /\bhardware\b|\breparacion\b|\bmantenimiento\b|ensamblaje|\belectronica\b/, "raspberrypi.svg", false),
  route("robotica", "Arduino y robótica", "Conecta programación, electrónica y proyectos físicos.", /\barduino\b|\brobotica\b|\brobots?\b|\braspberry\b|\besp32\b|\bmicrocontroladores?\b/, "arduino.webp", false),
  route("plc", "PLC y automatización industrial", "Explora controladores y sistemas de automatización.", /\bplc\b|\bscada\b|\bsiemens\b|\blogo\s*v[0-9]|automatizacion industrial|\btia portal\b|\bhmi\b/, "siemens.svg", false),
  route("autocad", "AutoCAD", "Desarrolla habilidades de dibujo y documentación técnica.", /\bautocad\b|\bcivil 3d\b/, "autodesk.svg", false),
  route("revit", "Revit y BIM", "Explora modelos de construcción y flujos de trabajo BIM.", /\brevit\b|\bbim\b|\bnavisworks\b/, "autodeskrevit.svg", false),
  route("modelado-3d", "Modelado 3D", "Explora modelos, espacios y objetos digitales en tres dimensiones.", /\bblender\b|\bcinema 4d\b|\b3ds? max\b|\b3d studio\b|\brhinoceros\b|\bzbrush\b|modelado.{0,20}3d|\bmaya\b/, "blender.svg", false),
  route("electricidad", "Electricidad y electrónica", "Explora circuitos, instalaciones y mantenimiento eléctrico.", /electricidad|electronic[ao]|electric[ao]s?|electroneumatica|variadores de frecuencia|\bcctv\b|videovigilancia|bobinado/, "electricidad.webp", false),
  route("matematicas", "Matemáticas para tecnología", "Refuerza las bases de cálculo, álgebra y estadística.", /matematicas?|\bcalculo\b|\balgebra\b|probabilistico|estadistica|modelos numericos/, "matematicas.svg", false),
  route("construccion", "Ingeniería y construcción", "Explora diseño arquitectónico, estructuras y proyectos de obra.", /\barquitectura\b|arquitectonico|\bconstruccion\b|ingenieria civil|\bestructuras\b|\bsap2000\b|\betabs\b|\bsketchup\b|\btopografia\b|\bobra\b|\binstalaciones\b|\belectricista\b/, "construccion.webp", false),
];
