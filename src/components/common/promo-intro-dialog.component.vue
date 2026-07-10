<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePromoQuery } from '../../composables/usePromoQuery'
import { useTracking } from '../../composables/useTracking'

const { showPromoIntro, dismissIntro } = usePromoQuery()
const { trackCustom } = useTracking()

// PromoView (F3.4): se registra al mostrarse el diálogo de intro de la promo.
watch(showPromoIntro, (visible) => {
  if (visible) trackCustom('PromoView')
}, { immediate: true })

const driveTooltipText =
  'Servicio en la nube. Puedes ver los cursos online sin consumir tu espacio de almacenamiento, o descargarlos a tu equipo para ser el dueño de los archivos para siempre.'
const showDriveTooltip = ref(false)
</script>

<template>
  <Transition
    appear
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"  
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showPromoIntro"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      @keydown.esc="dismissIntro"
      @click.self="dismissIntro"
    >
      <div
        class="promo-intro-card relative w-full max-w-sm md:max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl shadow-blue-900/30 overflow-hidden flex flex-col ring-1 ring-black/5"
      >
        <!-- Botón X de cierre -->
        <button
          type="button"
          class="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label="Cerrar"
          data-track="promo-cerrar"
          @click="dismissIntro"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Cabecera azul con icono de bienvenida -->
        <div class="promo-intro-header shrink-0 relative px-6 pt-8 pb-7 text-center overflow-hidden">
          <!-- Brillos decorativos -->
          <div class="promo-blob promo-blob--1"></div>
          <div class="promo-blob promo-blob--2"></div>

          <div class="relative">
            <div
              class="mx-auto w-16 h-16 rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20"
            >
              <!-- Icono sparkles -->
              <svg
                class="w-9 h-9 text-white"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
            </div>
            <h2 class="text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">
              ¡Bienvenido a nuestra comunidad!
            </h2>
            <p class="mt-1.5 text-blue-100/90 text-xs md:text-sm font-medium">
              Cursos Estudia y Trabaja
            </p>
          </div>
        </div>

        <!-- Cuerpo (scrollable si el contenido no cabe) -->
        <div class="px-6 py-5 space-y-4 overflow-y-auto">
          <p class="text-gray-700 text-sm md:text-base leading-relaxed text-left">
            Aquí encontrarás paquetes de cursos relacionados a tus
            intereses. Todos los cursos están en
            <button
              type="button"
              class="relative inline-flex items-center underline decoration-dotted underline-offset-2 cursor-help focus:outline-none"
              :title="driveTooltipText"
              :aria-label="driveTooltipText"
              @click="showDriveTooltip = !showDriveTooltip"
              @mouseenter="showDriveTooltip = true"
              @mouseleave="showDriveTooltip = false"
              @focus="showDriveTooltip = true"
              @blur="showDriveTooltip = false"
            >
              Google Drive
              <span
                v-if="showDriveTooltip"
                role="tooltip"
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 sm:w-64 z-10 rounded-lg bg-gray-900 text-white text-[11px] leading-snug font-normal px-3 py-2 shadow-lg text-center normal-case"
              >
                {{ driveTooltipText }}
                <span
                  class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"
                ></span>
              </span>
            </button>
            , así que podrás verlos online o descargarlos
            <strong class="font-semibold text-gray-900">para siempre</strong>. De bienvenida te damos
            <strong class="font-semibold text-gray-900">un curso gratis</strong>, y con tu compra
            <strong class="font-semibold text-gray-900">mantienes vivo este proyecto</strong>: tu aporte
            se usa para cubrir el almacenamiento en la nube. Puedes adquirir los cursos a través de
            nuestro <strong class="font-semibold text-gray-900">WhatsApp</strong> o directamente desde la
            web. El programa de revendedores sirve para expandir nuestra comunidad, y podrás acceder a
            él desde tu <strong class="font-semibold text-gray-900">primera compra</strong>.
          </p>

          <p class="text-gray-500 text-xs md:text-sm italic text-center pt-1">
            ¡Felicitaciones por invertir en tu futuro! Sé bienvenido a Cursos Estudia y Trabaja.
          </p>
        </div>

        <!-- Acciones -->
        <div class="shrink-0 px-6 pb-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            class="promo-intro-cta w-full h-11 px-3 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:brightness-105 active:brightness-95 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2"
            data-track="promo-vamos"
            @click="dismissIntro"
          >
            ¡Vamos!
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.promo-intro-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%);
}

.promo-intro-cta {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
}

/* Brillos decorativos del encabezado */
.promo-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(28px);
  pointer-events: none;
}
.promo-blob--1 {
  top: -2.5rem;
  right: -2rem;
  width: 9rem;
  height: 9rem;
  background: rgba(255, 255, 255, 0.22);
}
.promo-blob--2 {
  bottom: -3rem;
  left: -2.5rem;
  width: 8rem;
  height: 8rem;
  background: rgba(56, 189, 248, 0.35);
}
</style>
