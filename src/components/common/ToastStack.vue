<script setup lang="ts">
import { toastStore } from '../../store/ToastStore';
import claritaAvatar from '../../assets/home/mujercurosagente.png';

const toasts = toastStore();

function dismiss(id: string) {
  toasts.dismiss(id);
}
</script>

<template>
  <TransitionGroup
    name="list"
    tag="div"
    class="flex flex-col-reverse gap-3"
  >
    <template v-for="item in toasts.items" :key="item.id">
      <!-- Garantía (estilo Clarita) — misma forma que el toast de promo -->
      <div
        v-if="item.type === 'guarantee'"
        class="pointer-events-auto rounded-2xl bg-white border-2 border-blue-300 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/15 transition-shadow overflow-hidden"
      >
        <div class="flex items-stretch">
          <div class="flex-1 flex items-start gap-3 p-3 md:p-4 min-w-0">
            <img
              :src="claritaAvatar"
              alt="Clarita"
              class="flex-shrink-0 w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
            />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-500 flex items-center gap-1 mb-0.5">
                Clarita
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              </p>
              <p class="text-blue-700 font-bold text-sm md:text-[15px] leading-tight mb-1">
                ¡Tranquilo! Tu acceso es para siempre <span aria-hidden="true">🔒</span>
              </p>
              <p class="text-gray-600 text-xs md:text-sm leading-snug">
                Recuerda que al adquirir este paquete, los cursos son tuyos de por vida. Además, te damos
                <span class="font-semibold text-gray-900">7 días de garantía</span>
                o te devolvemos el dinero.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="flex-shrink-0 self-start mt-2 mr-2 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            @click="dismiss(item.id)"
            aria-label="Cerrar notificación"
            title="Cerrar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Bienvenida / bonos — misma forma -->
      <div
        v-else-if="item.type === 'error'"
        class="pointer-events-auto rounded-2xl bg-white border-2 border-red-200 shadow-lg shadow-red-900/10 max-w-sm"
      >
        <div class="flex items-start gap-3 p-3 md:p-4 min-w-0">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center border-2 border-red-100"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p class="text-red-800 text-sm md:text-[15px] leading-snug flex-1 min-w-0">
            {{ item.message || 'Ha ocurrido un error. Intenta de nuevo.' }}
          </p>
          <button
            type="button"
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-red-300"
            @click="dismiss(item.id)"
            aria-label="Cerrar notificación"
            title="Cerrar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-else-if="item.type === 'gift'"
        class="pointer-events-auto rounded-2xl bg-white border-2 border-blue-300 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/15 transition-shadow overflow-hidden"
      >
        <div class="flex items-stretch">
          <div class="flex-1 flex items-start gap-3 p-3 md:p-4 min-w-0">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center border-2 border-blue-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-blue-700 font-bold text-sm md:text-[15px] leading-tight mb-1">
                Bonos incluidos <span aria-hidden="true">🎁</span>
              </p>
              <p class="text-gray-600 text-xs md:text-sm leading-snug">
                Te llevas cursos adicionales como bono al comprar.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="flex-shrink-0 self-start mt-2 mr-2 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            @click="dismiss(item.id)"
            aria-label="Cerrar notificación"
            title="Cerrar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </TransitionGroup>
</template>

<style scoped>
.list-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.list-leave-active {
  transition: all 0.25s ease-in;
  position: absolute;
  right: 0;
  left: 0;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
