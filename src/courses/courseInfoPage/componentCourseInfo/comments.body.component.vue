<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import type { IResponseDataMessage } from '../../../types/Message';
import MessageService from '../../../services/MessageService';
import { useRoute } from 'vue-router';

const route = useRoute();
const messageResponse = ref<IResponseDataMessage>();

onMounted(async () => {
  const message = await MessageService.getAllMessageByCategory(Number(route.params.id));
  messageResponse.value = message;
});

const averageRating = computed(() => {
  const messages = messageResponse.value?.messages || [];
  if (messages.length === 0) return 0;
  const sum = messages.reduce((acc, msg) => acc + msg.stars, 0);
  return (sum / messages.length).toFixed(1);
});

const ratingPercentages = computed(() => {
  const counts: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const messages = messageResponse.value?.messages || [];
  messages.forEach(msg => {
    counts[msg.stars] = (counts[msg.stars] || 0) + 1;
  });
  const total = messages.length;
  const percentages: { [key: number]: number } = {};
  for (let i = 1; i <= 5; i++) {
    percentages[i] = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
  }
  return percentages;
});
</script>

<template>
  <div>
    <!-- Sección de calificación principal -->
    <div class="text-sm">
      <p>Las opiniones y calificaciones están verificadas y provienen de personas que compraron</p>
    </div>
    <div class="flex justify-center items-center">
      <div class="flex items-center gap-4 rounded-lg w-full">
        <!-- Calificación promedio -->
        <div class="flex items-center space-x-1 flex-col">
          <span class="text-3xl font-bold">{{ averageRating }}</span>
          <div class="flex text-yellow-500">
            <!-- Mostrar estrellas según la calificación promedio (redondeado) -->
            <template v-for="index in 5" :key="index">
              <span v-if="index <= Math.round(Number(averageRating))">★</span>
              <span v-else class="text-gray-300">★</span>
            </template>
          </div>
        </div>
        <!-- Barras de calificación dinámica -->
        <div class="mt-4 mb-4 space-y-1 w-full">
          <!-- Iteramos de 5 a 1 -->
          <div v-for="star in [5,4,3,2,1]" :key="star" class="flex items-center">
            <span class="w-4 text-sm">{{ star }}</span>
            <div class="w-full h-2 bg-blue-200 ml-2 rounded-full">
              <div
                class="h-2 bg-blue-600 rounded-full"
                :style="{ width: ratingPercentages[star] + '%' }"
              ></div>
            </div>
            <!-- Puedes mostrar también el porcentaje o la cantidad si lo deseas -->
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de mensajes de usuarios -->
    <div class="grid gap-4 overflow-auto max-h-[300px]">
      <div class="grid gap-2" v-for="(item, index) in messageResponse?.messages" :key="index">
        <div class="flex items-center gap-3">
          <img class="w-8 h-8 rounded-full" :src="item.user.picture" alt="" loading="lazy" width="32" height="32" />
          <p class="text-sm">{{ item.user.name }}</p>
        </div>
        <div class="flex items-center">
          <!-- Estrellas llenas según el número de estrellas evaluadas -->
          <div v-for="index2 in item.stars" :key="index2">
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_113_467)">
                <path
                  d="M5 0L6.5 2.33333L9.5 2.625L7.44 4.42167L8 7L5 5.83333L2 7L2.565 4.42167L0.5 2.625L3.5 2.33333L5 0Z"
                  fill="black" />
              </g>
              <defs>
                <clipPath id="clip0_113_467">
                  <rect width="10" height="7" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <!-- Estrellas vacías para completar hasta 5 -->
          <div v-for="index2 in (5 - item.stars)" :key="'empty-' + index2">
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_491_358)">
                <path
                  d="M3.70794 7.33169L6.00036 6.27363L8.29279 7.34561L7.69239 5.34087L9.71191 4.00439L7.05561 3.8234L6.00036 1.93004L4.94512 3.80948L2.28882 3.99046L4.30834 5.34087L3.70794 7.33169ZM2.59811 8.5L3.50053 5.54135L0.5 3.55221L4.45243 3.29048L6.00036 0.5L7.5483 3.28992L11.5 3.55165L8.49947 5.54079L9.40261 8.49944L6.00036 6.92907L2.59811 8.5Z"
                  fill="black" />
              </g>
              <defs>
                <clipPath id="clip0_491_358">
                  <rect width="12" height="9" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div class="ml-2 text-[12px]">{{ item.created_at }}</div>
        </div>
        <p class="text-sm">{{ item.message }}</p>
      </div>
    </div>
  </div>
</template>
