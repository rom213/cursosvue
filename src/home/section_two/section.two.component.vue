<script lang="ts" setup>
// Opcional: Si quieres controlar la velocidad desde el componente
const animationDuration = 40; // en segundos
</script>

<template>
  <div class="relative w-screen overflow-hidden py-4 before:content-[''] before:absolute before:left-0 before:top-0 before:w-32 before:h-full before:bg-gradient-to-r before:from-white before:to-transparent before:z-10 after:content-[''] after:absolute after:right-0 after:top-0 after:w-32 after:h-full after:bg-gradient-to-l after:from-white after:to-transparent after:z-10">
    <div class="flex gap-20 items-center animate-scroll" :style="{ '--animation-duration': animationDuration + 's' }">
      <!-- Duplicamos las imágenes para el efecto continuo -->
      <template v-for="n in 3" :key="n">
        <div class="flex-shrink-0 opacity-100 transition-opacity">
          <img class="h-7 md:h-8  object-contain" src="../../assets/home/coursera.png" alt="Coursera">
        </div>
        <div class="flex-shrink-0">
          <img class="h-7 md:h-8 object-contain" src="../../assets/home/edx.png" alt="edX">
        </div>
        <div class="flex-shrink-0">
          <img class="h-7 md:h-8 object-contain" src="../../assets/home/hotmart.png" alt="Hotmart">
        </div>
        <div class="flex-shrink-0">
          <img class="h-7 md:h-8 object-contain" src="../../assets/home/platzi.png" alt="Platzi">
        </div>
      </template>
    </div>
  </div>
</template>

<style>
@keyframes scroll {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll var(--animation-duration) linear infinite;
  display: flex;
  width: max-content;
}

/* Para navegadores WebKit (opcional: personalizar scrollbar) */
@media (pointer: fine) {
  .overflow-hidden::-webkit-scrollbar {
    display: none;
  }
}
</style>
