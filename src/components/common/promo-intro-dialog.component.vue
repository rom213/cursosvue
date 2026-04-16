<script setup lang="ts">
import { ref } from 'vue'
import { usePromoQuery } from '../../composables/usePromoQuery'

const { promoName, promoType, showPromoIntro, dismissIntro } = usePromoQuery()

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
        class="promo-intro-card relative w-full max-w-sm md:max-w-lg bg-white rounded-3xl shadow-2xl shadow-blue-900/30 overflow-hidden"
      >
      <!-- Botón X de cierre -->
      <button
        type="button"
        class="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
        aria-label="Cerrar"
        @click="dismissIntro"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div>
          <!-- Cabecera azul con icono regalo -->
          <div class="promo-intro-header px-6 pt-7 pb-5 text-center">
            <div
              class="mx-auto w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-inner"
            >
              <!-- Icono regalo -->
              <svg
                class="w-9 h-9 text-white"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <h2 class="text-white text-lg md:text-xl font-bold leading-tight">
              <template v-if="promoType === 'bloque'">
                Si vienes por el bloque de
                <span class="block text-blue-100 mt-0.5">{{ promoName }}</span>
              </template>
              <template v-else>
                Si vienes para el curso de
                <span class="block text-blue-100 mt-0.5">{{ promoName }}</span>
              </template>
            </h2>
          </div>

          <!-- Cuerpo -->
          <div class="px-6 py-5 space-y-3 text-center">
            <p class="text-gray-700 text-sm md:text-base leading-relaxed">
              <span class="font-semibold text-gray-900">¡Ya lo tienes!</span> Y como regalo
              especial, hoy desbloqueas el acceso a
              <span class="font-semibold text-blue-700">todo nuestro catálogo de cursos de esta categoria</span>
              totalmente gratis.
            </p>
            <div
              class="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-left"
            >
              <!-- Icono Google Drive (triangulo simple) -->
              <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M7.71 3.5L1.15 15l3.3 5.5 6.57-11.5-3.31-5.5z" fill="#0066DA" />
                  <path d="M16.29 3.5h-8.58l6.57 11.5h8.57l-6.56-11.5z" fill="#00AC47" />
                  <path d="M4.45 20.5h15.1l3.3-5.5h-15.1l-3.3 5.5z" fill="#FFBA00" />
                </svg>
              </div>
              <p class="text-gray-700 text-xs md:text-sm leading-snug">
                Todo el material está alojado en
                <button
                  type="button"
                  class="relative inline-flex items-center font-semibold text-gray-900 underline decoration-dotted underline-offset-2 cursor-help focus:outline-none"
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
                . Solo necesitas un correo de
                <span class="font-semibold text-gray-900">Gmail</span> para acceder al instante.
              </p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="px-6 pb-6 pt-1 flex flex-col-reverse gap-2">
            <button
              type="button"
              class="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors whitespace-nowrap"
              @click="dismissIntro"
            >
              Ahora no
            </button>
            <button
              type="button"
              class="w-full h-11 px-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:brightness-105 active:brightness-95 transition-all whitespace-nowrap"
              @click="dismissIntro"
            >
              ¡Quiero acceder a mis cursos!
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.promo-intro-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}
</style>
