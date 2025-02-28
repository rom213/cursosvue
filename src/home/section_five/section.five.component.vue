<script lang="ts" setup>
import { ref } from 'vue';
import BestSallersComponent from './best.sallers.component.vue';

const animationDuration = 20; // duración en segundos
const scrollContainer = ref<HTMLElement | null>(null);

const pauseScroll = () => {
  if (scrollContainer.value) {
    scrollContainer.value.style.animationPlayState = 'paused';
  }
};

const resumeScroll = () => {
  if (scrollContainer.value) {
    scrollContainer.value.style.animationPlayState = 'running';
  }
};
</script>

<template>
  <!-- Cambiamos overflow-hidden por overflow-x-auto para permitir scroll horizontal -->
  <div class="bg-black h-52 rounded-t-lg p-2">
    <h3 class="text-[#FFD21E] mb-2">
      CURSOS MÁS PEDIDOS
    </h3>
    <!-- Contenedor animado que contiene el grid duplicado -->
    <div class="overflow-x-auto" >
      <div ref="scrollContainer" class="animate-scroll" :style="{ '--animation-duration': animationDuration + 's' }"
        @mouseenter="pauseScroll" @mouseleave="resumeScroll">
        <template v-for="n in 3" :key="n">
          <div class="grid grid-cols-4 grid-rows-2 gap-4">
            <BestSallersComponent />
            <BestSallersComponent />
            <BestSallersComponent />
            <BestSallersComponent />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  display: flex;
  width: max-content;
  /* Se ajusta al ancho total del contenido duplicado */
  animation: scroll var(--animation-duration) linear infinite;
}
</style>
