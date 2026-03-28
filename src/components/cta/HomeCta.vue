<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

// ── Stats data ──────────────────────────────────────────────
interface StatConfig {
  label: string
  targetValue: number
  prefix: string
  suffix: string
  divisor: number
  decimals: number
  current: number
  done: boolean
}

const stats = reactive<StatConfig[]>([
  { label: 'Estudiantes', targetValue: 4500, prefix: '+', suffix: ' K', divisor: 1000, decimals: 1, current: 0, done: false },
  { label: 'Cursos', targetValue: 9421, prefix: '+', suffix: '', divisor: 1, decimals: 0, current: 0, done: false },
  { label: 'Plataformas/Autores', targetValue: 945, prefix: '', suffix: '', divisor: 1, decimals: 0, current: 0, done: false },
])

const statsRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

// ── Easing: easeOutExpo ─────────────────────────────────────
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

// ── Format display value ────────────────────────────────────
function formatStat(stat: StatConfig): string {
  const displayVal = stat.current / stat.divisor
  const formatted = stat.decimals > 0
    ? displayVal.toFixed(stat.decimals)
    : Math.floor(displayVal).toLocaleString('es')
  return `${stat.prefix}${formatted}${stat.suffix}`
}

// ── Animate a single counter ────────────────────────────────
function animateCounter(stat: StatConfig, duration: number, delay: number) {
  setTimeout(() => {
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)

      stat.current = Math.round(eased * stat.targetValue)

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        stat.current = stat.targetValue
        stat.done = true
      }
    }

    requestAnimationFrame(tick)
  }, delay)
}

// ── Start all counters with stagger ─────────────────────────
function startCounters() {
  const duration = 2500
  stats.forEach((stat, i) => {
    animateCounter(stat, duration, i * 200)
  })
}

// ── Intersection Observer ───────────────────────────────────
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true
        startCounters()
        observer?.disconnect()
      }
    },
    { threshold: 0.3 }
  )

  if (statsRef.value) {
    observer.observe(statsRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
    <section class="cta-root">
        <!-- Olas decorativas (igual al hero) -->
        <div class="cta-wave" aria-hidden="true">
            <span></span>
            <span></span>
        </div>

        <div class="cta-inner">

            <!-- Badge -->
            <span class="cta-badge">✦ Plataforma educativa premium</span>

            <!-- Titular -->
            <h2 class="cta-title">
                Tu carrera<br>
                <em class="cta-title-em">no puede esperar.</em>
            </h2>

            <p class="cta-sub">
                Miles de cursos de Coursera, edX, Hotmart y Platzi en un solo lugar.
                Acceso vitalicio · Descarga offline · Certifícate desde hoy.
            </p>

            <!-- Stats -->
            <div ref="statsRef" class="cta-stats">
                <template v-for="(stat, i) in stats" :key="stat.label">
                    <div
                        class="stat-item"
                        :class="{ 'stat-visible': isVisible, 'stat-done': stat.done }"
                        :style="{ transitionDelay: `${i * 200}ms` }"
                    >
                        <span class="stat-num">
                            <span class="stat-num-inner" :class="{ 'num-done': stat.done }">
                                {{ formatStat(stat) }}
                            </span>
                            <!-- Sparkle particles -->
                            <span v-if="stat.done" class="sparkle sparkle-1" />
                            <span v-if="stat.done" class="sparkle sparkle-2" />
                            <span v-if="stat.done" class="sparkle sparkle-3" />
                        </span>
                        <span class="stat-label">{{ stat.label }}</span>
                    </div>
                    <div
                        v-if="i < stats.length - 1"
                        class="stat-divider"
                        :class="{ 'divider-visible': isVisible }"
                        :style="{ transitionDelay: `${i * 200 + 100}ms` }"
                        aria-hidden="true"
                    />
                </template>
            </div>

            <!-- Botones -->
            <div class="cta-actions">
                <RouterLink :to="{ name: 'courses' }" class="btn-primary">
                    Ver todos los cursos
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </RouterLink>
                <RouterLink :to="{ name: 'monetizar' }" class="btn-secondary">
                    Trabaja y gana
                </RouterLink>
            </div>

        </div>
    </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');

/* ══ SECCIÓN ══════════════════════════════════════════════ */
.cta-root {
    position: relative;
    overflow: hidden;
    background: linear-gradient(145deg, #dbeafe 0%, #eff6ff 35%, #ffffff 65%);
    padding: clamp(3.5rem, 8vw, 6rem) 1.25rem;
    font-family: 'Inter', system-ui, sans-serif;
}

/* ── Olas decorativas (misma técnica que el hero) ────────── */
.cta-wave {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}
.cta-wave span {
    position: absolute;
    width: 400vh;
    height: 400vh;
    top: -350px;
    left: 50%;
    transform: translate(-50%, -55%);
}
.cta-wave span:nth-child(1) {
    border-radius: 45%;
    background: rgba(30, 64, 175, 0.06);
    animation: ctaWave 30s linear infinite;
}
.cta-wave span:nth-child(2) {
    border-radius: 40%;
    background: rgba(59, 130, 246, 0.04);
    animation: ctaWave 48s linear infinite reverse;
}
@keyframes ctaWave {
    from { transform: translate(-50%, -82%) rotate(0deg); }
    to   { transform: translate(-50%, -82%) rotate(360deg); }
}

/* ── Contenido central ───────────────────────────────────── */
.cta-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 760px;
    margin: 0 auto;
    gap: 1.5rem;
}

/* ── Badge ───────────────────────────────────────────────── */
.cta-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #1e40af;
    background: rgba(30, 64, 175, 0.08);
    border: 1px solid rgba(30, 64, 175, 0.14);
    border-radius: 999px;
    padding: 0.3rem 1rem;
}

/* ── Titular ─────────────────────────────────────────────── */
.cta-title {
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: clamp(2.2rem, 5.5vw, 3.8rem);
    font-weight: 900;
    line-height: 1.06;
    color: #0d1b2a;
    margin: 0;
}
.cta-title-em {
    font-style: normal;
    color: #1e40af;
}

/* ── Subtítulo ───────────────────────────────────────────── */
.cta-sub {
    font-size: clamp(0.88rem, 1.6vw, 1rem);
    color: #64748b;
    line-height: 1.7;
    margin: 0;
    max-width: 540px;
}

/* ── Stats ───────────────────────────────────────────────── */
.cta-stats {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(30, 64, 175, 0.09);
    border-radius: 14px;
    padding: 1rem 2rem;
}

/* ── Stat item: entrada animada ──────────────────────────── */
.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    opacity: 0;
    transform: translateY(24px);
    filter: blur(8px);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                filter 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.stat-item.stat-visible {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
}

/* ── Divider animado ─────────────────────────────────────── */
.stat-divider {
    width: 1px;
    height: 2rem;
    background: rgba(30, 64, 175, 0.1);
    opacity: 0;
    transform: scaleY(0);
    transition: opacity 0.5s ease, transform 0.5s ease;
}
.stat-divider.divider-visible {
    opacity: 1;
    transform: scaleY(1);
}

/* ── Numero ──────────────────────────────────────────────── */
.stat-num {
    position: relative;
    font-family: 'Poppins', sans-serif;
    font-size: clamp(1.4rem, 2.8vw, 1.9rem);
    font-weight: 800;
    color: #1e40af;
    line-height: 1;
}

.stat-num-inner {
    display: inline-block;
    transition: text-shadow 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── Glow pulse + bounce al completar ────────────────────── */
.stat-num-inner.num-done {
    animation: numComplete 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes numComplete {
    0% {
        text-shadow: 0 0 0 rgba(30, 64, 175, 0);
        transform: scale(1);
    }
    40% {
        text-shadow: 0 0 20px rgba(30, 64, 175, 0.5),
                     0 0 40px rgba(59, 130, 246, 0.3);
        transform: scale(1.08);
    }
    70% {
        transform: scale(0.97);
    }
    100% {
        text-shadow: 0 0 0 rgba(30, 64, 175, 0);
        transform: scale(1);
    }
}

/* ── Sparkle particles ───────────────────────────────────── */
.sparkle {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3b82f6;
    pointer-events: none;
    animation: sparkleOut 0.8s ease-out forwards;
}
.sparkle-1 {
    top: -4px;
    right: -6px;
    animation-delay: 0s;
}
.sparkle-2 {
    bottom: -2px;
    left: -8px;
    animation-delay: 0.1s;
    background: #1e40af;
    width: 4px;
    height: 4px;
}
.sparkle-3 {
    top: 50%;
    right: -12px;
    animation-delay: 0.2s;
    background: #60a5fa;
    width: 5px;
    height: 5px;
}

@keyframes sparkleOut {
    0% {
        opacity: 1;
        transform: scale(0) translate(0, 0);
    }
    30% {
        opacity: 1;
        transform: scale(1.2);
    }
    100% {
        opacity: 0;
        transform: scale(0.5) translate(var(--sx, 12px), var(--sy, -14px));
    }
}
.sparkle-1 { --sx: 14px; --sy: -16px; }
.sparkle-2 { --sx: -16px; --sy: 10px; }
.sparkle-3 { --sx: 18px; --sy: 6px; }

.stat-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: #94a3b8;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

/* ── Botones ─────────────────────────────────────────────── */
.cta-actions {
    display: flex;
    gap: 0.85rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.25rem;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #1e40af;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.75rem 1.75rem;
    border-radius: 10px;
    text-decoration: none;
    letter-spacing: 0.01em;
    transition: background 0.2s, transform 0.18s, box-shadow 0.2s;
    box-shadow: 0 4px 18px rgba(30, 64, 175, 0.28);
    white-space: nowrap;
}
.btn-primary:hover {
    background: #1e3a8a;
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(30, 64, 175, 0.38);
}
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
    display: inline-flex;
    align-items: center;
    background: transparent;
    color: #1e40af;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    border: 1px solid rgba(30, 64, 175, 0.22);
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s;
    white-space: nowrap;
}
.btn-secondary:hover {
    background: rgba(30, 64, 175, 0.05);
    border-color: rgba(30, 64, 175, 0.38);
}

/* ══ RESPONSIVE ═══════════════════════════════════════════ */
@media (max-width: 480px) {
    .stat-divider  { display: none; }
    .cta-stats     { gap: 1.25rem; padding: 0.85rem 1.25rem; }
    .btn-primary,
    .btn-secondary { width: 100%; justify-content: center; }
    .cta-actions   { width: 100%; }
}
</style>
