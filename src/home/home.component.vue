<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import FooterComponent from '../components/footer/footer.component.vue';
import CourseFaqSection from '../courses/courseInfoPage/CourseFaqSection.vue';
import HomeCta from '../components/cta/HomeCta.vue';
import PricingLevels from './PricingLevels.vue';
import { icons } from './section_one/section.one.data';

const logosAnimationDuration = 40;
const logosMarqueeRef = ref<HTMLElement | null>(null);
const logosDragging = ref(false);
const logosHoveredIdx = ref<number | null>(null);
let logosStartX = 0;
let logosBaseOffset = 0;
let logosDragOffset = 0;

function getTranslateX(el: HTMLElement): number {
  return new DOMMatrix(window.getComputedStyle(el).transform).m41;
}

function onLogosMouseDown(e: MouseEvent) {
  const el = logosMarqueeRef.value;
  if (!el) return;
  e.preventDefault();
  logosDragging.value = true;
  logosStartX = e.clientX;
  // Captura posición actual ANTES de desactivar la animación
  logosBaseOffset = getTranslateX(el);
  logosDragOffset = logosBaseOffset;
  // Desactiva la animación por completo: el CSS animation sobreescribe
  // el style.transform inline aunque esté pausada, por eso usamos 'none'
  el.style.animation = 'none';
  el.style.transform = `translateX(${logosBaseOffset}px)`;
}

function onLogosMouseMove(e: MouseEvent) {
  if (!logosDragging.value || !logosMarqueeRef.value) return;
  logosDragOffset = logosBaseOffset + (e.clientX - logosStartX);
  logosMarqueeRef.value.style.transform = `translateX(${logosDragOffset}px)`;
}

function onLogosMouseUp() {
  const el = logosMarqueeRef.value;
  if (!el || !logosDragging.value) return;
  logosDragging.value = false;

  // Normaliza el offset dentro del rango del loop (-50% del ancho total)
  const halfWidth = el.scrollWidth / 2;
  let normalized = logosDragOffset % halfWidth;
  if (normalized > 0) normalized -= halfWidth;
  if (normalized < -halfWidth) normalized += halfWidth;

  const progress = Math.abs(normalized) / halfWidth;
  // Aplica el delay antes de restaurar la animación CSS para evitar flash
  el.style.animationDelay = `${-(progress * logosAnimationDuration)}s`;
  el.style.transform = '';
  el.style.animation = ''; // La clase CSS retoma el control con el delay aplicado
}

// ── Testimonials: CSS animation + drag override (igual que marcas) ─
const testimonialAnimationDuration = 30;
const testimonialScrollRef = ref<HTMLElement | null>(null);
const testimonialDragging  = ref(false);

const testimonialImages = [
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_2.jpg?alt=media&token=22bca7ef-47a6-42e4-adb2-3193a321fc86' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_1.jpg?alt=media&token=b2806947-6965-450e-a9a3-a7ec15def596' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_3.jpg?alt=media&token=44065c19-1050-4858-ba7b-457cb36f7aae' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_4.jpg?alt=media&token=975ebf38-d4a6-4ae8-a09e-4dd9c5d9932d' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_5.png?alt=media&token=05216ab9-a450-4825-95c4-39223b10fdfa' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_6.png?alt=media&token=09062eeb-4afa-4dbb-bd32-6cd64d527f3b' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_7.jpg?alt=media&token=116095fc-f42e-4241-b5c0-2ecb0353a01a' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_8.jpg?alt=media&token=0ef3c517-6648-4981-a94d-afe1b112d43e' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_9.png?alt=media&token=a8159439-8cd1-46fd-8f13-aa5032b6a6d1' },
];

let testimonialStartX    = 0;
let testimonialBaseOffset = 0;
let testimonialDragOffset = 0;

// ── Mouse ──────────────────────────────────────────────
function onTestimonialsMouseDown(e: MouseEvent) {
  const el = testimonialScrollRef.value;
  if (!el) return;
  e.preventDefault();
  testimonialDragging.value = true;
  testimonialStartX     = e.clientX;
  testimonialBaseOffset = getTranslateX(el);
  testimonialDragOffset = testimonialBaseOffset;
  el.style.animation = 'none';
  el.style.transform = `translateX(${testimonialBaseOffset}px)`;
}

function onTestimonialsMouseMove(e: MouseEvent) {
  if (!testimonialDragging.value || !testimonialScrollRef.value) return;
  testimonialDragOffset = testimonialBaseOffset + (e.clientX - testimonialStartX);
  testimonialScrollRef.value.style.transform = `translateX(${testimonialDragOffset}px)`;
}

function onTestimonialsMouseUp() {
  const el = testimonialScrollRef.value;
  if (!el || !testimonialDragging.value) return;
  testimonialDragging.value = false;

  const halfWidth = el.scrollWidth / 2;
  let normalized  = testimonialDragOffset % halfWidth;
  if (normalized > 0)          normalized -= halfWidth;
  if (normalized < -halfWidth) normalized += halfWidth;

  const progress = Math.abs(normalized) / halfWidth;
  const delay    = -(progress * testimonialAnimationDuration);
  el.style.transform = '';
  // Escribir el animation completo de una vez evita que el browser resetee
  // el delay cuando se restaura la clase CSS (bug de cascade en Chrome/Safari)
  el.style.animation = `testimonialsScroll ${testimonialAnimationDuration}s ${delay}s linear infinite`;
}

// ── Touch ──────────────────────────────────────────────
function onTestimonialsTouchStart(e: TouchEvent) {
  const el = testimonialScrollRef.value;
  if (!el) return;
  testimonialDragging.value = true;
  testimonialStartX     = e.touches[0].clientX;
  testimonialBaseOffset = getTranslateX(el);
  testimonialDragOffset = testimonialBaseOffset;
  el.style.animation = 'none';
  el.style.transform = `translateX(${testimonialBaseOffset}px)`;
}

function onTestimonialsTouchMove(e: TouchEvent) {
  if (!testimonialDragging.value || !testimonialScrollRef.value) return;
  testimonialDragOffset = testimonialBaseOffset + (e.touches[0].clientX - testimonialStartX);
  testimonialScrollRef.value.style.transform = `translateX(${testimonialDragOffset}px)`;
}

function onTestimonialsTouchEnd() { onTestimonialsMouseUp(); }

onMounted(() => {
  window.addEventListener('mousemove', onLogosMouseMove);
  window.addEventListener('mouseup',   onLogosMouseUp);
  window.addEventListener('mousemove', onTestimonialsMouseMove);
  window.addEventListener('mouseup',   onTestimonialsMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onLogosMouseMove);
  window.removeEventListener('mouseup',   onLogosMouseUp);
  window.removeEventListener('mousemove', onTestimonialsMouseMove);
  window.removeEventListener('mouseup',   onTestimonialsMouseUp);
});
</script>

<template>
  <div class="home-root">

    <!-- ═══════════════════════════════════════════
         HERO — Wave CSS "agujero negro"
    ════════════════════════════════════════════ -->
    <section class="hero-section">
      <!-- Fondo de olas (CSS puro, sin JS) -->
      <div class="hero-wave" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- Modelo: capa intermedia — z5, detrás del texto pero delante de las olas -->
      <div class="hero-model" aria-hidden="true">
        <picture>
          <source srcset="../assets/home/mujercursos.webp" type="image/webp" />
          <img
            src="../assets/home/mujercursos.png"
            alt=""
            class="hero-model-img"
            width="800"
            height="600"
            fetchpriority="high"
          />
        </picture>
      </div>

      <!-- Texto: z10, encima de todo -->
      <div class="hero-layout">
        <div class="hero-text">
          <span class="hero-label">✦ Plataforma educativa premium</span>
          <h1 class="hero-title">
            No te damos
            <em class="hero-title-em">un curso,</em><br>
            te damos <strong class="hero-title-strong">miles</strong><br>
            de cursos.
          </h1>
          <p class="hero-sub has-tooltip">
            · Cursos alojados en Google Drive
            <span class="tooltip tooltip-up">
              Todos los cursos se almacenan en Google Drive con material completo y organizado.
              Accede desde cualquier dispositivo, sin necesidad de espacio en tu equipo.
              Solo necesitas conexión a internet para visualizarlos.
            </span>
          </p>
        </div>
      </div>

      <!-- Tarjetas glass en la base del hero -->
      <div class="hero-cards">
        <div class="glass-card has-tooltip">
          <div class="card-icon" v-html="icons.accesoVitalicio" />
          <h3 class="card-title">Acceso Vitalicio</h3>
          <p class="card-text">Pago único. Actualizaciones gratis para siempre.</p>
          <span class="tooltip tooltip-up">
            Odiamos las suscripciones. Un solo pago y el contenido es tuyo para siempre,
            con actualizaciones incluidas. Estudia hoy, mañana o dentro de un año.
          </span>
        </div>
        <div class="glass-card has-tooltip">
          <div class="card-icon" v-html="icons.descargable" />
          <h3 class="card-title">100% Descargable</h3>
          <p class="card-text">Estudia offline y a tu propio ritmo.</p>
          <span class="tooltip tooltip-up">
            Descarga cualquier curso a tu dispositivo y estudia sin depender de internet.
            Tú decides cuándo, dónde y cómo aprender. El control es completamente tuyo.
          </span>
        </div>
        <div class="glass-card has-tooltip">
          <div class="card-icon" v-html="icons.clubDescuentos" />
          <h3 class="card-title">Club de Descuentos</h3>
          <p class="card-text">70% OFF en todas tus próximas compras.</p>
          <span class="tooltip tooltip-up">
            Al adquirir un paquete de $48.500 o superior, desbloqueas el Club de Descuentos
            y el modo Revendedor. Descuentos exclusivos en todo el catálogo y ganancias del 60% por cada venta.
          </span>
        </div>
        <div class="glass-card has-tooltip">
          <div class="card-icon" v-html="icons.trabajaYGana" />
          <h3 class="card-title">Trabaja y Gana</h3>
          <p class="card-text">Comisiones del 60% por cada venta referida.</p>
          <span class="tooltip tooltip-up">
            Gana comisiones reales por cada venta que refieras. Visita la sección de
            Monetización en el menú superior para conocer todos los detalles del programa.
          </span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         CARRUSEL DE MARCAS
    ════════════════════════════════════════════ -->
    <div class="logos-section">
      <p class="logos-label">Contenido certificado de las mejores plataformas</p>
      <div class="logos-track-outer">
        <div
          ref="logosMarqueeRef"
          class="home-logos-marquee logos-track"
          :class="logosDragging ? 'cursor-grabbing' : 'cursor-grab'"
          :style="{ '--home-logos-duration': logosAnimationDuration + 's' }"
          @mousedown="onLogosMouseDown"
        >
          <template v-for="n in 3" :key="n">
            <div
              class="logo-item"
              :class="logosHoveredIdx !== null && logosHoveredIdx !== 0 ? 'logo-dim' : ''"
              @mouseenter="logosHoveredIdx = 0"
              @mouseleave="logosHoveredIdx = null"
            >
              <img class="logo-img pointer-events-none select-none" src="../assets/home/coursera.png" alt="Coursera" draggable="false" loading="lazy" width="120" height="40" />
            </div>
            <div
              class="logo-item"
              :class="logosHoveredIdx !== null && logosHoveredIdx !== 1 ? 'logo-dim' : ''"
              @mouseenter="logosHoveredIdx = 1"
              @mouseleave="logosHoveredIdx = null"
            >
              <img class="logo-img pointer-events-none select-none" src="../assets/home/edx.png" alt="edX" draggable="false" loading="lazy" width="120" height="40" />
            </div>
            <div
              class="logo-item"
              :class="logosHoveredIdx !== null && logosHoveredIdx !== 2 ? 'logo-dim' : ''"
              @mouseenter="logosHoveredIdx = 2"
              @mouseleave="logosHoveredIdx = null"
            >
              <img class="logo-img pointer-events-none select-none" src="../assets/home/hotmart.png" alt="Hotmart" draggable="false" loading="lazy" width="120" height="40" />
            </div>
            <div
              class="logo-item"
              :class="logosHoveredIdx !== null && logosHoveredIdx !== 3 ? 'logo-dim' : ''"
              @mouseenter="logosHoveredIdx = 3"
              @mouseleave="logosHoveredIdx = null"
            >
              <img class="logo-img pointer-events-none select-none" src="../assets/home/platzi.png" alt="Platzi" draggable="false" loading="lazy" width="120" height="40" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         CTA
    ════════════════════════════════════════════ -->
    <HomeCta />

    <!-- ═══════════════════════════════════════════
         PRICING LEVELS
    ════════════════════════════════════════════ -->
    <PricingLevels />

    <!-- ═══════════════════════════════════════════
         FAQ
    ════════════════════════════════════════════ -->
    <section class="faq-section">
      <div class="faq-header">
        <span class="faq-label">Centro de ayuda</span>
        <h2 class="faq-title">Preguntas frecuentes</h2>
        <p class="faq-sub">Todo lo que necesitas saber antes de empezar.</p>
      </div>
      <div class="faq-inner">
        <CourseFaqSection />
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         TESTIMONIOS
    ════════════════════════════════════════════ -->
    <section class="testimonials-section">

      <!-- Olas decorativas -->
      <div class="testimonials-wave" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- Encabezado -->
      <div class="testimonials-header">
        <span class="testimonials-label">✦ Testimonios reales</span>
        <h2 class="testimonials-title">Lo que dicen nuestros estudiantes</h2>
        <p class="testimonials-sub">Encuesta directa por WhatsApp · Respuestas sin editar</p>
      </div>

      <!-- Carrusel draggable -->
      <div class="testimonials-track-outer">
        <div
          ref="testimonialScrollRef"
          class="testimonials-track home-testimonials-marquee"
          :class="testimonialDragging ? 'cursor-grabbing' : 'cursor-grab'"
          :style="{ '--testimonials-duration': testimonialAnimationDuration + 's' }"
          @mousedown="onTestimonialsMouseDown"
          @touchstart.passive="onTestimonialsTouchStart"
          @touchmove.prevent="onTestimonialsTouchMove"
          @touchend="onTestimonialsTouchEnd"
        >
          <template v-for="_n in 2" :key="_n">
            <div class="testimonials-row">
              <div
                v-for="(item, index) in testimonialImages"
                :key="index"
                class="testimonial-card"
              >
                <img :src="item.url" alt="Testimonio de estudiante" class="testimonial-img" draggable="false" loading="lazy" width="96" height="96" />
              </div>
            </div>
          </template>
        </div>
      </div>

    </section>

    <FooterComponent />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

/* ═══════════════════════════════════════════════════════════
   TOKENS CORPORATIVOS
   --navy:   #0d1b2a  titulares, texto principal
   --blue:   #1e40af  acento primario (corporate blue)
   --sky:    #3b82f6  acento secundario (highlight)
   --bg:     #f0f4ff  tinte base del gradiente hero
   --slate:  #64748b  texto secundario
═══════════════════════════════════════════════════════════ */

/* ─── BASE ───────────────────────────────────────────────── */
.home-root {
  font-family: 'Inter', system-ui, sans-serif;
  color: #0d1b2a;
}

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
.hero-section {
  position: relative;
  overflow: hidden;
  min-height: 78vh;
  /* Gradiente corporativo: azul tenue en la esquina sup-izq → blanco */
  background: linear-gradient(130deg, #dbeafe 0%, #eff6ff 30%, #ffffff 62%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* ── Olas: decoración de fondo, z1, baja opacidad ─────── */
.hero-wave {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
  z-index: 1;
}
.hero-wave span {
  position: absolute;
  width: 400vh;
  height: 400vh;
  top: 0;
  left: 50%;
  transform: translate(-50%, -85%);
}
.hero-wave span:nth-child(1) {
  border-radius: 45%;
  background: rgba(30, 64, 175, 0.07);
  animation: heroWave 25s linear infinite;
}
.hero-wave span:nth-child(2) {
  border-radius: 40%;
  background: rgba(59, 130, 246, 0.05);
  animation: heroWave 40s linear infinite;
}
.hero-wave span:nth-child(3) {
  border-radius: 42.5%;
  background: rgba(30, 64, 175, 0.04);
  animation: heroWave 55s linear infinite;
}
@keyframes heroWave {
  from { transform: translate(-50%, -85%) rotate(0deg); }
  to   { transform: translate(-50%, -85%) rotate(360deg); }
}

/* ── Modelo: z10, encima de todo, derecha absoluta ──────── */
.hero-model {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 46%;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}
@media (max-width: 1023px) {
  .hero-model { display: none; }
}
.hero-model-img {
  height: 97%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  object-position: bottom center;
  /* Fusión suave solo en el borde inferior */
  mask-image: linear-gradient(to bottom, black 68%, transparent 97%);
  -webkit-mask-image: linear-gradient(to bottom, black 68%, transparent 97%);
  /* Sombra fría que ancla la figura al gradiente del hero */
  filter: drop-shadow(-16px 0 48px rgba(30, 64, 175, 0.14));
}

/* ── Layout texto: ocupa el 55 % izquierdo ─────────────── */
.hero-layout {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1.5rem 1.5rem 0;
}
@media (min-width: 1024px) {
  .hero-layout {
    align-items: flex-start;
    padding: 2rem 0 0 5rem;
    max-width: 56%;
  }
}

/* ── Titular ────────────────────────────────────────────── */
.hero-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
@media (min-width: 1024px) {
  .hero-text {
    align-items: flex-start;
    text-align: left;
  }
}

.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1e40af;
  background: rgba(30, 64, 175, 0.08);
  border: 1px solid rgba(30, 64, 175, 0.14);
  border-radius: 999px;
  padding: 0.25rem 0.8rem;
  margin-bottom: 1rem;
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2rem, 3.6vw, 3.4rem);
  font-weight: 900;
  color: #0d1b2a;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin: 0;
}
.hero-title-em {
  font-style: italic;
  font-weight: 300;
  color: #1e40af;
}
.hero-title-strong {
  font-weight: 900;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  margin-top: 0.9rem;
  font-size: 0.82rem;
  color: #64748b;
  letter-spacing: 0.03em;
  cursor: default;
  transition: color 0.35s ease;
  position: relative;
  display: inline-block;
}
.hero-sub::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -2px;
  width: 0;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, #1e40af, transparent);
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 1px;
}
.hero-sub:hover {
  color: #1e40af;
  z-index: 50;
}
.hero-sub:hover::after {
  width: 100%;
  left: 0;
}

/* ── Tarjetas ───────────────────────────────────────────── */
.hero-cards {
  position: relative;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.8rem 1.25rem 1.4rem;
}

.glass-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 186px;
  padding: 1rem 0.9rem;
  gap: 0.45rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(30, 64, 175, 0.09);
  box-shadow: 0 2px 14px rgba(30, 64, 175, 0.08), 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.38s ease,
              border-color 0.38s ease,
              background 0.38s ease;
}
.glass-card:hover {
  transform: translateY(-6px);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(30, 64, 175, 0.18);
  box-shadow:
    0 8px 24px rgba(30, 64, 175, 0.12),
    0 20px 48px rgba(30, 64, 175, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: rgba(30, 64, 175, 0.07);
  transition: background 0.38s ease, transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.glass-card:hover .card-icon {
  background: rgba(30, 64, 175, 0.12);
  transform: scale(1.08);
}

.card-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0d1b2a;
  line-height: 1.3;
  margin: 0;
  transition: color 0.3s ease;
}
.glass-card:hover .card-title {
  color: #1e40af;
}

.card-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

/* ── Tooltips ───────────────────────────────────────────── */
.has-tooltip {
  position: relative;
}

.tooltip {
  position: absolute;
  z-index: 100;
  width: 280px;
  padding: 0.85rem 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.65;
  color: #334155;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(30, 64, 175, 0.12);
  border-radius: 12px;
  box-shadow:
    0 4px 16px rgba(30, 64, 175, 0.10),
    0 12px 40px rgba(30, 64, 175, 0.08);
  /* Posición por defecto: debajo del elemento */
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              visibility 0.3s;
}

/* Flecha del tooltip (abajo = apunta hacia arriba) */
.tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid rgba(30, 64, 175, 0.12);
  border-left: 1px solid rgba(30, 64, 175, 0.12);
}

/* Tooltip hacia arriba (para las cards en la base del hero) */
.tooltip-up {
  top: auto;
  bottom: calc(100% + 10px);
  transform: translateX(-50%) translateY(-6px);
}
.tooltip-up::before {
  top: auto;
  bottom: -6px;
  border-top: none;
  border-left: none;
  border-bottom: 1px solid rgba(30, 64, 175, 0.12);
  border-right: 1px solid rgba(30, 64, 175, 0.12);
}

/* Mostrar tooltip en hover */
.has-tooltip:hover > .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

/* Línea decorativa azul en la parte superior del tooltip */
.tooltip::after {
  content: '';
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #1e40af, #3b82f6, transparent);
  border-radius: 2px;
  opacity: 0.5;
}
.tooltip-up::after {
  top: auto;
  bottom: 0;
}

/* ═══════════════════════════════════════════════════════════
   SECCIÓN LOGOS
═══════════════════════════════════════════════════════════ */
.logos-section {
  background: #ffffff;
  padding: 1.2rem 0 1rem;
  border-top: 1px solid rgba(30, 64, 175, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.logos-label {
  text-align: center;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.85rem;
}

.logos-track-outer {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.logos-track-outer::before,
.logos-track-outer::after {
  content: '';
  position: absolute;
  top: 0;
  width: 8rem;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}
.logos-track-outer::before {
  left: 0;
  background: linear-gradient(to right, #ffffff, transparent);
}
.logos-track-outer::after {
  right: 0;
  background: linear-gradient(to left, #ffffff, transparent);
}

.logos-track {
  display: flex;
  gap: 4rem;
  align-items: center;
  padding: 0.4rem 0;
}

.logo-item {
  flex-shrink: 0;
  transition: opacity 0.5s ease;
}
.logo-dim { opacity: 0.12; }

.logo-img {
  height: 1.6rem;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.55;
  transition: filter 0.4s ease, opacity 0.4s ease;
}
.logo-item:not(.logo-dim) .logo-img,
.logo-item:hover .logo-img {
  filter: grayscale(0%);
  opacity: 1;
}

/* ── Marquee ─────────────────────────────── */
@keyframes homeLogosScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.home-logos-marquee {
  animation: homeLogosScroll var(--home-logos-duration, 40s) linear infinite;
  width: max-content;
}

/* ═══════════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════════ */
.faq-section {
  background: #f0f4ff;
  padding: 4rem 1.5rem 4.5rem;
}

.faq-header {
  text-align: center;
  max-width: 560px;
  margin: 0 auto 2.5rem;
}

.faq-label {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1e40af;
  background: rgba(30, 64, 175, 0.09);
  border: 1px solid rgba(30, 64, 175, 0.16);
  border-radius: 999px;
  padding: 0.24rem 0.8rem;
  margin-bottom: 0.8rem;
}

.faq-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.7rem, 2.8vw, 2.4rem);
  font-weight: 800;
  color: #0d1b2a;
  letter-spacing: -0.025em;
  margin: 0 0 0.55rem;
}

.faq-sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.faq-inner {
  max-width: 860px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .faq-section { padding: 4rem 2.5rem 4.5rem; }
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIOS
═══════════════════════════════════════════════════════════ */
.testimonials-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%);
  padding: 3rem 0 3rem;
}

/* ── Olas ──────────────────────────────────────────────── */
.testimonials-wave {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.testimonials-wave span {
  position: absolute;
  width: 400vh;
  height: 400vh;
  top: -350px;
  left: 50%;
}
.testimonials-wave span:nth-child(1) {
  border-radius: 45%;
  background: rgba(30, 64, 175, 0.08);
  animation: testimonialsWave 30s linear infinite;
}
.testimonials-wave span:nth-child(2) {
  border-radius: 40%;
  background: rgba(255, 255, 255, 0.12);
  animation: testimonialsWave 48s linear infinite reverse;
}
.testimonials-wave span:nth-child(3) {
  border-radius: 42%;
  background: rgba(30, 64, 175, 0.05);
  animation: testimonialsWave 64s linear infinite;
}
@keyframes testimonialsWave {
  from { transform: translate(-50%, -82%) rotate(0deg); }
  to   { transform: translate(-50%, -82%) rotate(360deg); }
}

/* ── Encabezado ────────────────────────────────────────── */
.testimonials-header {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 1.5rem;
  margin-bottom: 3rem;
}

.testimonials-label {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1e40af;
  background: rgba(30, 64, 175, 0.08);
  border: 1px solid rgba(30, 64, 175, 0.14);
  border-radius: 999px;
  padding: 0.24rem 0.9rem;
  margin-bottom: 0.9rem;
}

.testimonials-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.7rem, 2.8vw, 2.4rem);
  font-weight: 800;
  color: #0d1b2a;
  letter-spacing: -0.025em;
  margin: 0 0 0.5rem;
}

.testimonials-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 0.85rem;
}


/* ── Carrusel ──────────────────────────────────────────── */
.testimonials-track-outer {
  position: relative;
  z-index: 1;
  overflow: hidden;
}
.testimonials-track-outer::before,
.testimonials-track-outer::after {
  content: '';
  position: absolute;
  top: 0;
  width: 8rem;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}
.testimonials-track-outer::before {
  left: 0;
  background: linear-gradient(to right, #dbeafe, transparent);
}
.testimonials-track-outer::after {
  right: 0;
  background: linear-gradient(to left, #93c5fd, transparent);
}

@keyframes testimonialsScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.home-testimonials-marquee {
  animation: testimonialsScroll var(--testimonials-duration, 30s) linear infinite;
  will-change: transform;
}

.testimonials-track {
  display: flex;
  width: max-content;
  user-select: none;
  touch-action: none;   /* cede el control total del gesto al JS en móvil */
  -webkit-user-select: none;
}

.testimonials-row {
  display: flex;
  flex-shrink: 0;       /* evita compresión del ítem dentro del flex-track */
  gap: 1rem;
  padding: 1rem 1rem 1.25rem 0; /* padding-right = gap, para que el seam sea igual */
}

.testimonial-card {
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(30, 64, 175, 0.1);
  box-shadow:
    0 2px 8px rgba(30, 64, 175, 0.07),
    0 8px 28px rgba(30, 64, 175, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
}
.testimonial-card:hover {
  transform: translateY(-5px) scale(1.015);
  box-shadow:
    0 6px 20px rgba(30, 64, 175, 0.12),
    0 18px 48px rgba(30, 64, 175, 0.1);
}

.testimonial-img {
  height: 170px;
  width: auto;
  display: block;
  object-fit: cover;
  pointer-events: none;
}

/* ── Scrollbar ───────────────────────────── */
@media (pointer: fine) {
  .logos-track-outer::-webkit-scrollbar { display: none; }
}

/* ── Tooltips: ocultar en táctil/mobile ─────────────────── */
@media (max-width: 768px) {
  .tooltip { display: none; }
}

/* ── Tooltips: ajustar cards de los extremos para no salirse ── */
.hero-cards .glass-card:first-child .tooltip-up {
  left: 0;
  transform: translateX(0) translateY(-6px);
}
.hero-cards .glass-card:first-child .tooltip-up::before {
  left: 24px;
  transform: translateX(0) rotate(45deg);
}
.hero-cards .glass-card:first-child:hover > .tooltip-up {
  transform: translateX(0) translateY(0);
}

.hero-cards .glass-card:last-child .tooltip-up {
  left: auto;
  right: 0;
  transform: translateX(0) translateY(-6px);
}
.hero-cards .glass-card:last-child .tooltip-up::before {
  left: auto;
  right: 24px;
  transform: translateX(0) rotate(45deg);
}
.hero-cards .glass-card:last-child:hover > .tooltip-up {
  transform: translateX(0) translateY(0);
}
</style>

<style scoped>
.cursor-grab     { cursor: grab; }
.cursor-grabbing { cursor: grabbing; }
</style>
