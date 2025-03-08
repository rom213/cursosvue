<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const animationDuration = 50; // duración en segundos
const scrollContainer = ref<HTMLElement | null>(null);

const data=[{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_1.jpg"}, 
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_2.jpg"},
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_3.jpg"},
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_4.jpg"},
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_5.jpg"},
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_6.jpg"},
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_7.jpg"},
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_8.jpg"},
{"url":"https://gkxffmrkbmyasfkbhtwu.supabase.co/storage/v1/object/public/images_testament//image_9.jpg"}]

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
    <div class="h-[280px] bg-[#FFD21E] w-full rounded-t-lg">
        <div class="text-center">
            <h3 class="text-xl text-center font-semibold">TESTIMONIOS</h3>
            <p>Encuesta realizada por whatsap</p>
            <p class="font-semibold">¿como te han parecido los cursos y la atencion?</p>
        </div>
        <br>
        <div>
            <div class="overflow-hidden whitespace-nowrap overflow-x-auto">
                <div ref="scrollContainer" class="animate-scroll flex"
                    :style="{ '--animation-duration': animationDuration + 's' }" @mouseenter="pauseScroll"
                    @mouseleave="resumeScroll">
                    <div class="flex gap-4">
                        <div v-for="(item, index) in data" :key="index" class="border border-white rounded-lg p-1">
                            <img class="h-[150px]" :src="item.url" alt="">
                        </div>
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
  overflow-x: auto;
  white-space: nowrap;
}


.scroll-container::-webkit-scrollbar {
  display: none;
}
</style>
