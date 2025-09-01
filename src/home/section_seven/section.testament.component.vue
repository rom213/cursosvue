<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const animationDuration = 50; // duración en segundos
const scrollContainer = ref<HTMLElement | null>(null);

const data = [
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_2.jpg?alt=media&token=22bca7ef-47a6-42e4-adb2-3193a321fc86" }, 
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_1.jpg?alt=media&token=b2806947-6965-450e-a9a3-a7ec15def596" },
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_3.jpg?alt=media&token=44065c19-1050-4858-ba7b-457cb36f7aae" },
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_4.jpg?alt=media&token=975ebf38-d4a6-4ae8-a09e-4dd9c5d9932d" },
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_5.png?alt=media&token=05216ab9-a450-4825-95c4-39223b10fdfa" },
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_6.png?alt=media&token=09062eeb-4afa-4dbb-bd32-6cd64d527f3b" },
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_7.jpg?alt=media&token=116095fc-f42e-4241-b5c0-2ecb0353a01a" },
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_8.jpg?alt=media&token=0ef3c517-6648-4981-a94d-afe1b112d43e" },
  { "url": "https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_9.png?alt=media&token=a8159439-8cd1-46fd-8f13-aa5032b6a6d1" }
];

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
  <div class="h-[280px] 3bg-gradient-to-r w-full rounded-t-lg">
    <div class="text-center">
      <h3 class="text-xl font-semibold">TESTIMONIOS</h3>
      <p class="text-sm">Encuesta realizada por WhatsApp</p>
      <p class="font-semibold">¿Cómo te han parecido los cursos y la atención?</p>
    </div>

    <div class="overflow-hidden whitespace-nowrap overflow-x-auto mt-4">
      <div ref="scrollContainer" class="animate-scroll flex"
        :style="{ '--animation-duration': animationDuration + 's' }" @mouseenter="pauseScroll"
        @mouseleave="resumeScroll">
        <div class="flex gap-6">
          <div v-for="(item, index) in data" :key="index" class="border-2 border-white rounded-lg p-2 shadow-lg">
            <img class="h-[150px] rounded-md" :src="item.url" alt="Imagen del testimonio">
          </div>
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
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

img {
  transition: transform 0.3s ease-in-out;
}

img:hover {
  transform: scale(1.05);
}

.bg-gradient-to-r {
    background-image: linear-gradient(to right, #38bdf8, #0ea5e9);
}
</style>
