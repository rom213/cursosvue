<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import FooterComponent from '../components/footer/footer.component.vue';
import CourseFaqSection from '../courses/courseInfoPage/CourseFaqSection.vue';
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

const testimonialAnimationDuration = 50;
const testimonialScrollRef = ref<HTMLElement | null>(null);

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

const pauseTestimonialScroll = () => {
  if (testimonialScrollRef.value) {
    testimonialScrollRef.value.style.animationPlayState = 'paused';
  }
};

const resumeTestimonialScroll = () => {
  if (testimonialScrollRef.value) {
    testimonialScrollRef.value.style.animationPlayState = 'running';
  }
};

onMounted(() => {
  const el = testimonialScrollRef.value;
  if (el) {
    el.innerHTML += el.innerHTML;
  }
  window.addEventListener('mousemove', onLogosMouseMove);
  window.addEventListener('mouseup', onLogosMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onLogosMouseMove);
  window.removeEventListener('mouseup', onLogosMouseUp);
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
        <img
          src="../assets/home/mujercursos.png"
          alt=""
          class="hero-model-img"
        />
      </div>

      <!-- Texto: z10, encima de todo -->
      <div class="hero-layout">
        <div class="hero-text">
          <span class="hero-label">✦ Plataforma educativa premium</span>
          <h1 class="hero-title">
            No te damos<br>
            <em class="hero-title-em">un curso,</em><br>
            te damos <strong class="hero-title-strong">miles</strong><br>
            de cursos.
          </h1>
          <p class="hero-sub">Acceso vitalicio · Descarga offline · Certifícate</p>
        </div>
      </div>

      <!-- Tarjetas glass en la base del hero -->
      <div class="hero-cards">
        <div class="glass-card">
          <div class="card-icon" v-html="icons.accesoVitalicio" />
          <h3 class="card-title">Acceso Vitalicio</h3>
          <p class="card-text">Pago único. Actualizaciones gratis para siempre.</p>
        </div>
        <div class="glass-card">
          <div class="card-icon" v-html="icons.descargable" />
          <h3 class="card-title">100% Descargable</h3>
          <p class="card-text">Estudia offline y a tu propio ritmo.</p>
        </div>
        <div class="glass-card">
          <div class="card-icon" v-html="icons.clubDescuentos" />
          <h3 class="card-title">Club de Descuentos</h3>
          <p class="card-text">50% OFF en todas tus próximas compras.</p>
        </div>
        <div class="glass-card">
          <div class="card-icon" v-html="icons.trabajaYGana" />
          <h3 class="card-title">Trabaja y Gana</h3>
          <p class="card-text">Comisiones del 60% por cada venta referida.</p>
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
              <img class="logo-img pointer-events-none select-none" src="../assets/home/coursera.png" alt="Coursera" draggable="false" />
            </div>
            <div
              class="logo-item"
              :class="logosHoveredIdx !== null && logosHoveredIdx !== 1 ? 'logo-dim' : ''"
              @mouseenter="logosHoveredIdx = 1"
              @mouseleave="logosHoveredIdx = null"
            >
              <img class="logo-img pointer-events-none select-none" src="../assets/home/edx.png" alt="edX" draggable="false" />
            </div>
            <div
              class="logo-item"
              :class="logosHoveredIdx !== null && logosHoveredIdx !== 2 ? 'logo-dim' : ''"
              @mouseenter="logosHoveredIdx = 2"
              @mouseleave="logosHoveredIdx = null"
            >
              <img class="logo-img pointer-events-none select-none" src="../assets/home/hotmart.png" alt="Hotmart" draggable="false" />
            </div>
            <div
              class="logo-item"
              :class="logosHoveredIdx !== null && logosHoveredIdx !== 3 ? 'logo-dim' : ''"
              @mouseenter="logosHoveredIdx = 3"
              @mouseleave="logosHoveredIdx = null"
            >
              <img class="logo-img pointer-events-none select-none" src="../assets/home/platzi.png" alt="Platzi" draggable="false" />
            </div>
          </template>
        </div>
      </div>
    </div>

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
      <div class="testimonials-header">
        <span class="testimonials-label">Testimonios reales</span>
        <h2 class="testimonials-title">Lo que dicen nuestros estudiantes</h2>
        <p class="testimonials-sub">Encuesta directa por WhatsApp · Respuestas sin editar</p>
      </div>
      <div class="testimonials-track-outer">
        <div
          ref="testimonialScrollRef"
          class="home-testimonials-marquee testimonials-track"
          :style="{ '--home-testimonials-duration': testimonialAnimationDuration + 's' }"
          @mouseenter="pauseTestimonialScroll"
          @mouseleave="resumeTestimonialScroll"
        >
          <div class="testimonials-row">
            <div
              v-for="(item, index) in testimonialImages"
              :key="index"
              class="testimonial-card"
            >
              <img :src="item.url" alt="Testimonio de estudiante" class="testimonial-img" />
            </div>
          </div>
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
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}
.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(30, 64, 175, 0.14), 0 2px 6px rgba(0,0,0,0.05);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: rgba(30, 64, 175, 0.07);
}

.card-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0d1b2a;
  line-height: 1.3;
  margin: 0;
}

.card-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
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
  background: #0d1b2a;
  padding: 4rem 0 4rem;
  overflow: hidden;
}

.testimonials-header {
  text-align: center;
  padding: 0 1.5rem;
  margin-bottom: 2.75rem;
}

.testimonials-label {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 999px;
  padding: 0.24rem 0.8rem;
  margin-bottom: 0.85rem;
}

.testimonials-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.7rem, 2.8vw, 2.4rem);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  margin: 0 0 0.5rem;
}

.testimonials-sub {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.testimonials-track-outer {
  position: relative;
  overflow: hidden;
}
.testimonials-track-outer::before,
.testimonials-track-outer::after {
  content: '';
  position: absolute;
  top: 0;
  width: 7rem;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}
.testimonials-track-outer::before {
  left: 0;
  background: linear-gradient(to right, #0d1b2a, transparent);
}
.testimonials-track-outer::after {
  right: 0;
  background: linear-gradient(to left, #0d1b2a, transparent);
}

.testimonials-track {
  display: flex;
}

.testimonials-row {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.testimonial-card {
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.testimonial-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
}

.testimonial-img {
  height: 155px;
  width: auto;
  display: block;
  object-fit: cover;
}

/* ── Scrollbar ───────────────────────────── */
@media (pointer: fine) {
  .logos-track-outer::-webkit-scrollbar { display: none; }
}
</style>

<style scoped>
@keyframes homeTestimonialsScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.home-testimonials-marquee {
  width: max-content;
  animation: homeTestimonialsScroll var(--home-testimonials-duration, 50s) linear infinite;
}
</style>
