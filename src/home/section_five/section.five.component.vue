<script lang="ts" setup>
import { ref, onMounted } from 'vue';
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

// Duplicar contenido al montar
onMounted(() => {
  if (scrollContainer.value) {
    const container = scrollContainer.value;
    container.innerHTML += container.innerHTML; // Duplica el contenido para un efecto de carrusel infinito
  }
});
</script>

<template>
  <div class="bg-black h-[200px] rounded-t-lg p-2 relative">
    <h3 class="text-[#FFD21E] mb-2">CURSOS MÁS PEDIDOS</h3>
    <div class="overflow-hidden whitespace-nowrap overflow-x-auto">
                <div ref="scrollContainer" class="animate-scroll flex"
                    :style="{ '--animation-duration': animationDuration + 's' }" @mouseenter="pauseScroll"
                    @mouseleave="resumeScroll">
                    <div class="flex gap-4">
                        <BestSallersComponent/>
                        <BestSallersComponent/>
                        <BestSallersComponent/>
                        <BestSallersComponent/>
                        <BestSallersComponent/>
                    </div>
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
  width: max-content;
  animation: scroll var(--animation-duration) linear infinite;
  display: flex;
  white-space: nowrap;
  overflow-x: auto;
  white-space: nowrap;
}


.scroll-container::-webkit-scrollbar {
  display: none;
}
</style>
