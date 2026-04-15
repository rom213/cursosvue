<script setup lang="ts">
import { usePromoQuery } from '../../composables/usePromoQuery'

const { promoName, promoType, showPromoIntro, dismissIntro } = usePromoQuery()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showPromoIntro"
      class="promo-intro-overlay fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      @keydown.esc="dismissIntro"
    >
      <Transition
        appear
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
      >
        <div
          class="promo-intro-card relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/30 overflow-hidden"
        >
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
              <span class="font-semibold text-gray-900">Esta aqui</span> y ademas te llevas
              los demas cursos
              <span class="font-semibold text-blue-700">gratis como bono</span>.
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
                Los cursos estan disponibles en
                <span class="font-semibold text-gray-900">Google Drive</span>. Solo necesitas
                un correo
                <span class="font-semibold text-gray-900">Gmail</span> para verlos.
              </p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="px-6 pb-6 pt-1 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              class="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
              @click="dismissIntro"
            >
              Cerrar
            </button>
            <button
              type="button"
              class="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:brightness-105 active:brightness-95 transition-all"
              @click="dismissIntro"
            >
              Aceptar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.promo-intro-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}
</style>
