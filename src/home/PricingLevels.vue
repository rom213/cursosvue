<script lang="ts" setup>
import { RouterLink } from 'vue-router';

interface PricingTag {
  label: string
  bg: string
  text: string
  ring?: string
}

interface PricingLevel {
  id: number
  tier: 'basic' | 'advanced' | 'premium'
  name: string
  price: string
  priceNote: string
  themes: string
  courses: string
  description: string
  tags: PricingTag[]
  features: string[]
  ctaLabel: string
  filterQuery: string
}

const levels: PricingLevel[] = [
  {
    id: 1,
    tier: 'basic',
    name: 'Bloque Individual',
    price: '$19.600',
    priceNote: 'COP · Pago unico',
    themes: '1 Bloque',
    courses: '+20 cursos',
    description: 'Perfecto para explorar un area especifica y empezar a aprender hoy.',
    tags: [],
    features: [
      'Acceso vitalicio al bloque',
      '100% descargable y offline',
      'Certificacion incluida',
      'Acceso a biblioteca de 10.134 libros',
    ],
    ctaLabel: 'Explorar bloques',
    filterQuery: 'bloques',
  },
  {
    id: 2,
    tier: 'advanced',
    name: 'Pilar Principal',
    price: '$48.500',
    priceNote: 'COP · Pago unico',
    themes: '7 a 9 Bloques',
    courses: '+150 cursos',
    description: 'Domina un area completa. Ideal para especializarte y monetizar tu conocimiento.',
    tags: [
      { label: '🤝 Incluye Reventa', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-1 ring-inset ring-amber-600/10' },
      { label: '🎟️ 70% Dto. en Tienda', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-1 ring-inset ring-emerald-600/10' },
    ],
    features: [
      'Acceso vitalicio al pilar completo',
      '100% descargable y offline',
      'Certificacion incluida',
      'Acceso a biblioteca de 10.134 libros',
      'Licencia de reventa incluida',
      '70% de descuento en toda la tienda',
    ],
    ctaLabel: 'Ver pilares',
    filterQuery: 'pilares',
  },
  {
    id: 3,
    tier: 'advanced',
    name: 'Combinacion de Gigantes',
    price: '$75.700',
    priceNote: 'COP · Pago unico',
    themes: '14 a 16 Bloques',
    courses: '+300 cursos',
    description: 'Une dos pilares y multiplica tu perfil profesional. Maximo valor por tu inversion.',
    tags: [
      { label: '🤝 Incluye Reventa', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-1 ring-inset ring-amber-600/10' },
      { label: '🎟️ 70% Dto. en Tienda', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-1 ring-inset ring-emerald-600/10' },
    ],
    features: [
      'Acceso vitalicio a 2 pilares',
      '100% descargable y offline',
      'Certificacion incluida',
      'Acceso a biblioteca de 10.134 libros',
      'Licencia de reventa incluida',
      '70% de descuento en toda la tienda',
    ],
    ctaLabel: 'Ver combinaciones',
    filterQuery: 'combos',
  },
  {
    id: 4,
    tier: 'premium',
    name: 'Toda la Tienda 2026',
    price: '$80.000',
    priceNote: 'COP · Pago unico',
    themes: '23 Bloques',
    courses: 'Acceso Total',
    description: 'El pack definitivo. Todo el conocimiento, una sola compra. Acceso vitalicio a los 3 pilares.',
    tags: [
      { label: '👑 Mejor Oferta', bg: 'pricing-pill-premium', text: 'text-amber-900', ring: '' },
      { label: '🤝 Incluye Reventa', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-1 ring-inset ring-amber-600/10' },
      { label: '🎟️ 70% Dto. en Tienda', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-1 ring-inset ring-emerald-600/10' },
    ],
    features: [
      'Acceso vitalicio a los 3 pilares',
      '100% descargable y offline',
      'Certificacion incluida',
      'Acceso a biblioteca de 10.134 libros',
      'Licencia de reventa incluida',
      '70% de descuento en futuras compras',
      'Todas las actualizaciones 2026',
    ],
    ctaLabel: 'Obtener todo',
    filterQuery: 'toda-la-tienda',
  },
];
</script>

<template>
  <section class="pricing-section">
    <!-- Olas decorativas -->
    <div class="pricing-wave" aria-hidden="true">
      <span></span>
      <span></span>
    </div>

    <div class="pricing-inner">

      <!-- Encabezado -->
      <div class="pricing-header">
        <span class="pricing-label">✦ Escalera de valor</span>
        <h2 class="pricing-title">
          Elige el nivel de acceso
          <em class="pricing-title-em">perfecto para ti</em>
        </h2>
        <p class="pricing-sub">
          A mayor nivel, mas bloques, mas cursos y mayores beneficios.
          Todos incluyen acceso vitalicio y descarga offline.
        </p>
      </div>

      <!-- Grid comparativo -->
      <div class="pricing-grid">
        <div
          v-for="level in levels"
          :key="level.id"
          class="pricing-card"
          :class="{
            'pricing-card--basic': level.tier === 'basic',
            'pricing-card--advanced': level.tier === 'advanced',
            'pricing-card--premium': level.tier === 'premium',
          }"
        >
          <!-- Shimmer overlay solo para premium -->
          <div v-if="level.tier === 'premium'" class="pricing-shimmer" aria-hidden="true" />

          <!-- Contenido de la tarjeta -->
          <div class="pricing-card-content">

            <!-- Zona de tags -->
            <div v-if="level.tags.length > 0" class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="(tag, i) in level.tags"
                :key="i"
                class="inline-flex items-center rounded-full font-semibold"
                :class="[
                  tag.bg,
                  tag.text,
                  tag.ring,
                  tag.bg === 'pricing-pill-premium'
                    ? 'pricing-pill-premium text-sm py-1 px-3.5 font-extrabold shadow-sm shadow-amber-200/50'
                    : 'text-xs px-2.5 py-1',
                ]"
              >
                {{ tag.label }}
              </span>
            </div>

            <!-- Sin tags: spacer para alinear -->
            <div v-else class="mb-4">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                📌 Nivel basico
              </span>
            </div>

            <!-- Nombre del nivel -->
            <h3 class="pricing-card-name" :class="{ 'pricing-card-name--premium': level.tier === 'premium' }">
              {{ level.name }}
            </h3>

            <!-- Precio -->
            <div class="mt-3 mb-1">
              <span
                class="pricing-price"
                :class="level.tier === 'premium' ? 'pricing-price--premium' : ''"
              >
                {{ level.price }}
              </span>
              <span class="pricing-price-note">{{ level.priceNote }}</span>
            </div>

            <!-- Magnitud -->
            <div class="pricing-magnitude">
              <div class="pricing-magnitude-row">
                <svg class="pricing-magnitude-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                <strong>{{ level.themes }}</strong>
                <span class="text-slate-400 mx-1">&middot;</span>
                <span>{{ level.courses }}</span>
              </div>
            </div>

            <!-- Descripcion -->
            <p class="pricing-description">{{ level.description }}</p>

            <!-- Features checklist -->
            <ul class="pricing-features">
              <li
                v-for="(feat, i) in level.features"
                :key="i"
                class="pricing-feature-item"
              >
                <svg
                  class="pricing-check-icon"
                  :class="level.tier === 'premium' ? 'text-amber-500' : level.tier === 'advanced' ? 'text-emerald-500' : 'text-slate-400'"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span>{{ feat }}</span>
              </li>
            </ul>

            <!-- CTA -->
            <RouterLink
              :to="{ name: 'courses' }"
              class="pricing-cta"
              :class="{
                'pricing-cta--basic': level.tier === 'basic',
                'pricing-cta--advanced': level.tier === 'advanced',
                'pricing-cta--premium': level.tier === 'premium',
              }"
            >
              {{ level.ctaLabel }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </RouterLink>

          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

/* ═══════════════════════════════════════════════════════════
   SECCION PRICING
═══════════════════════════════════════════════════════════ */
.pricing-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #f0f4ff 0%, #ffffff 40%, #f8faff 100%);
  padding: clamp(3rem, 7vw, 5rem) 1.25rem;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Olas decorativas ────────────────────────────────────── */
.pricing-wave {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.pricing-wave span {
  position: absolute;
  width: 400vh;
  height: 400vh;
  top: -350px;
  left: 50%;
  transform: translate(-50%, -55%);
}
.pricing-wave span:nth-child(1) {
  border-radius: 45%;
  background: rgba(30, 64, 175, 0.04);
  animation: pricingWave 35s linear infinite;
}
.pricing-wave span:nth-child(2) {
  border-radius: 40%;
  background: rgba(59, 130, 246, 0.03);
  animation: pricingWave 52s linear infinite reverse;
}
@keyframes pricingWave {
  from { transform: translate(-50%, -82%) rotate(0deg); }
  to   { transform: translate(-50%, -82%) rotate(360deg); }
}

/* ── Inner container ─────────────────────────────────────── */
.pricing-inner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
}

/* ── Encabezado ──────────────────────────────────────────── */
.pricing-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 3rem;
}

.pricing-label {
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
  margin-bottom: 1.2rem;
}

.pricing-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  color: #0d1b2a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 0.8rem;
}
.pricing-title-em {
  font-style: normal;
  color: #1e40af;
}

.pricing-sub {
  font-size: clamp(0.85rem, 1.5vw, 1rem);
  color: #64748b;
  line-height: 1.7;
  margin: 0;
}

/* ═══════════════════════════════════════════════════════════
   GRID COMPARATIVO
═══════════════════════════════════════════════════════════ */
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: stretch;
}
@media (min-width: 640px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}

/* ═══════════════════════════════════════════════════════════
   TARJETAS
═══════════════════════════════════════════════════════════ */
.pricing-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pricing-card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.75rem;
}

/* ── Basic ───────────────────────────────────────────────── */
.pricing-card--basic {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 1px 8px rgba(15, 23, 42, 0.04);
}
.pricing-card--basic:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

/* ── Advanced ────────────────────────────────────────────── */
.pricing-card--advanced {
  background: #ffffff;
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-top: 3px solid #10b981;
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.06);
}
.pricing-card--advanced:hover {
  transform: translateY(-6px);
  box-shadow:
    0 12px 32px rgba(16, 185, 129, 0.1),
    0 4px 12px rgba(15, 23, 42, 0.05);
}

/* ── Premium ─────────────────────────────────────────────── */
.pricing-card--premium {
  background: linear-gradient(165deg, #fffbeb 0%, #ffffff 40%, #fffdf5 100%);
  border: 2px solid rgba(245, 158, 11, 0.35);
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.1),
    0 4px 20px rgba(245, 158, 11, 0.1),
    0 8px 32px rgba(245, 158, 11, 0.06);
  animation: premiumCardGlow 3s ease-in-out infinite;
}
.pricing-card--premium:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.2),
    0 16px 48px rgba(245, 158, 11, 0.15),
    0 8px 24px rgba(15, 23, 42, 0.06);
}

@keyframes premiumCardGlow {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(245, 158, 11, 0.1),
      0 4px 20px rgba(245, 158, 11, 0.1),
      0 8px 32px rgba(245, 158, 11, 0.06);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(245, 158, 11, 0.25),
      0 4px 24px rgba(245, 158, 11, 0.18),
      0 12px 40px rgba(245, 158, 11, 0.1);
  }
}

/* ── Premium shimmer overlay ─────────────────────────────── */
.pricing-shimmer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(245, 158, 11, 0.04) 35%,
    rgba(245, 158, 11, 0.08) 50%,
    rgba(245, 158, 11, 0.04) 65%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: pricingShimmer 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
@keyframes pricingShimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ── Premium pill gradient ───────────────────────────────── */
.pricing-pill-premium {
  background: linear-gradient(135deg, #f59e0b, #facc15, #f59e0b);
  background-size: 200% 200%;
  animation: pillGradient 3s ease infinite;
}
@keyframes pillGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ═══════════════════════════════════════════════════════════
   CONTENIDO DE TARJETA
═══════════════════════════════════════════════════════════ */

/* ── Nombre del nivel ────────────────────────────────────── */
.pricing-card-name {
  font-family: 'Poppins', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0d1b2a;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.pricing-card-name--premium {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #b45309 0%, #d97706 50%, #b45309 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Precio ──────────────────────────────────────────────── */
.pricing-price {
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1;
}
.pricing-price--premium {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pricing-price-note {
  display: block;
  font-size: 0.72rem;
  font-weight: 500;
  color: #94a3b8;
  margin-top: 0.25rem;
  letter-spacing: 0.02em;
}

/* ── Magnitud ────────────────────────────────────────────── */
.pricing-magnitude {
  margin-top: 1rem;
  padding: 0.6rem 0.75rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 0.625rem;
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.pricing-magnitude-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #475569;
}
.pricing-magnitude-row strong {
  color: #0f172a;
  font-weight: 700;
}

.pricing-magnitude-icon {
  width: 1rem;
  height: 1rem;
  color: #1e40af;
  flex-shrink: 0;
}

/* ── Descripcion ─────────────────────────────────────────── */
.pricing-description {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.6;
  margin-top: 0.85rem;
}

/* ── Features checklist ──────────────────────────────────── */
.pricing-features {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.pricing-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: #475569;
  line-height: 1.45;
}

.pricing-check-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* ═══════════════════════════════════════════════════════════
   CTAs
═══════════════════════════════════════════════════════════ */
.pricing-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.22s ease;
  margin-top: 1.25rem;
  cursor: pointer;
}

.pricing-cta--basic {
  background: #475569;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(71, 85, 105, 0.15);
}
.pricing-cta--basic:hover {
  background: #334155;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(71, 85, 105, 0.25);
}

.pricing-cta--advanced {
  background: #059669;
  color: #ffffff;
  box-shadow: 0 2px 12px rgba(5, 150, 105, 0.2);
}
.pricing-cta--advanced:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
}

.pricing-cta--premium {
  background: linear-gradient(135deg, #f59e0b 0%, #facc15 50%, #f59e0b 100%);
  background-size: 200% 200%;
  color: #451a03;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25);
  animation: ctaGradient 3s ease infinite;
}
.pricing-cta--premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(245, 158, 11, 0.35);
}
@keyframes ctaGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════════════ */
@media (max-width: 639px) {
  .pricing-card-content {
    padding: 1.5rem;
  }
  .pricing-price {
    font-size: 1.5rem;
  }
}
</style>
