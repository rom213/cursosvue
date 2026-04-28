<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import type { IResponseDataMessage } from '../../../types/Message';
import MessageService from '../../../services/MessageService';
import { useRoute } from 'vue-router';

const props = withDefaults(
  defineProps<{ userBought?: boolean }>(),
  { userBought: false }
);

const route = useRoute();
const messageResponse = ref<IResponseDataMessage>();
const isLoading = ref(true);

const newStars = ref(0);
const hoverStars = ref(0);
const newMessage = ref('');
const submitting = ref(false);
const submitError = ref('');
const failedPictures = ref<Record<string, boolean>>({});
const pastelColors = ['#F8D7DA', '#FCECC9', '#D9F0D8', '#D8ECF8', '#E6DCF8', '#F7D9E8', '#D9F4EF', '#F9E2D2'];

const loadMessages = async () => {
  isLoading.value = true;
  const message = await MessageService.getAllMessageByCategory(Number(route.params.id));
  messageResponse.value = message;
  isLoading.value = false;
};

onMounted(loadMessages);

const averageRating = computed(() => {
  const messages = messageResponse.value?.messages || [];
  if (messages.length === 0) return 0;
  const sum = messages.reduce((acc, msg) => acc + msg.stars, 0);
  return (sum / messages.length).toFixed(1);
});

const ratingPercentages = computed(() => {
  const counts: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const messages = messageResponse.value?.messages || [];
  messages.forEach(msg => { counts[msg.stars] = (counts[msg.stars] || 0) + 1; });
  const total = messages.length;
  const percentages: { [key: number]: number } = {};
  for (let i = 1; i <= 5; i++) {
    percentages[i] = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
  }
  return percentages;
});

const canComment = computed(() =>
  messageResponse.value?.is_login && !messageResponse.value?.is_comment && props.userBought
);

const getUserKey = (user: { google_id?: string; email?: string; name?: string }) =>
  user.google_id || user.email || user.name || '';

const hasPicture = (user: { picture?: string | null; google_id?: string; email?: string; name?: string }) => {
  const key = getUserKey(user);
  return Boolean(user.picture?.trim()) && !failedPictures.value[key];
};

const handlePictureError = (user: { google_id?: string; email?: string; name?: string }) => {
  const key = getUserKey(user);
  if (key) failedPictures.value[key] = true;
};

const getInitial = (name?: string | null) => {
  const trimmedName = name?.trim();
  return trimmedName ? trimmedName.charAt(0).toUpperCase() : '?';
};

const getPastelColor = (name?: string | null) => {
  const seed = (name || 'user').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[seed % pastelColors.length];
};

const submitReview = async () => {
  if (newStars.value === 0 || !newMessage.value.trim()) {
    submitError.value = 'Selecciona una calificación y escribe tu comentario.';
    return;
  }
  submitError.value = '';
  submitting.value = true;
  const success = await MessageService.addMessage(
    Number(route.params.id),
    newMessage.value.trim(),
    newStars.value
  );
  submitting.value = false;
  if (success) {
    newStars.value = 0;
    newMessage.value = '';
    await loadMessages();
  } else {
    submitError.value = 'No se pudo enviar tu reseña. Intenta de nuevo.';
  }
};
</script>

<template>
  <div class="space-y-6">

    <!-- Skeleton carga -->
    <div v-if="isLoading" class="space-y-4">
      <div class="flex items-center gap-6">
        <div class="flex flex-col items-center gap-2">
          <div class="h-12 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
          <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div class="flex-1 space-y-2">
          <div v-for="i in 5" :key="i" class="flex items-center gap-2">
            <div class="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-2 flex-1 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      <div v-for="i in 2" :key="i" class="bg-gray-50 rounded-2xl p-4 space-y-2">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
          <div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div class="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>

    <template v-else>
      <!-- Resumen de calificaciones -->
      <div class="flex items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <!-- Promedio -->
        <div class="flex flex-col items-center shrink-0">
          <span class="text-5xl font-black text-[#0d1b2a] leading-none">{{ averageRating }}</span>
          <div class="flex text-yellow-400 mt-1.5 text-lg">
            <template v-for="i in 5" :key="i">
              <span :class="i <= Math.round(Number(averageRating)) ? 'text-yellow-400' : 'text-gray-200'">★</span>
            </template>
          </div>
          <span class="text-xs text-slate-400 mt-1">{{ messageResponse?.messages?.length ?? 0 }} reseñas</span>
        </div>
        <!-- Barras -->
        <div class="flex-1 space-y-1.5">
          <div v-for="star in [5,4,3,2,1]" :key="star" class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500 w-2 shrink-0">{{ star }}</span>
            <span class="text-yellow-400 text-xs leading-none">★</span>
            <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-yellow-400 rounded-full transition-all duration-500"
                :style="{ width: ratingPercentages[star] + '%' }"
              ></div>
            </div>
            <span class="text-[0.65rem] text-slate-400 w-7 text-right shrink-0">{{ ratingPercentages[star] }}%</span>
          </div>
        </div>
      </div>

      <!-- Estado: no logueado -->
      <div
        v-if="!messageResponse?.is_login"
        class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Inicia sesión para dejar tu reseña.
      </div>

      <!-- Estado: logueado pero no compró -->
      <div
        v-else-if="messageResponse?.is_login && !userBought && !messageResponse?.is_comment"
        class="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Solo los estudiantes que compraron este curso pueden dejar una reseña.
      </div>

      <!-- Estado: ya comentó -->
      <div
        v-else-if="messageResponse?.is_login && messageResponse?.is_comment"
        class="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Ya dejaste tu reseña para este curso. ¡Gracias!
      </div>

      <!-- Formulario de reseña -->
      <div v-if="canComment" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 class="font-[Poppins] font-bold text-[#0d1b2a] text-base">Deja tu reseña</h4>
        <!-- Estrellas -->
        <div class="flex items-center gap-1">
          <button
            v-for="i in 5"
            :key="i"
            type="button"
            class="text-3xl transition-colors leading-none"
            :class="i <= (hoverStars || newStars) ? 'text-yellow-400' : 'text-gray-200'"
            @mouseenter="hoverStars = i"
            @mouseleave="hoverStars = 0"
            @click="newStars = i"
          >★</button>
          <span v-if="newStars > 0" class="ml-2 text-sm font-semibold text-slate-500">{{ newStars }} / 5</span>
        </div>
        <!-- Textarea -->
        <textarea
          v-model="newMessage"
          placeholder="Cuéntanos tu experiencia con este curso..."
          rows="3"
          class="w-full border border-slate-200 rounded-xl p-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
        ></textarea>
        <p v-if="submitError" class="text-red-500 text-xs">{{ submitError }}</p>
        <button
          @click="submitReview"
          :disabled="submitting"
          class="bg-[#FFBF2B] hover:bg-[#FACC15] text-slate-900 font-semibold py-2.5 px-7 rounded-xl text-sm transition-all disabled:opacity-50 shadow-sm"
        >
          {{ submitting ? 'Enviando...' : 'Enviar reseña' }}
        </button>
      </div>

      <!-- Sin reseñas -->
      <div v-if="!messageResponse?.messages?.length" class="text-center py-10 text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-sm">Aún no hay reseñas. ¡Sé el primero!</p>
      </div>

      <!-- Lista de reseñas -->
      <div v-else class="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        <div
          v-for="(item, index) in messageResponse?.messages"
          :key="index"
          class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <img
              v-if="hasPicture(item.user)"
              class="w-9 h-9 rounded-full object-cover shrink-0"
              :src="item.user.picture"
              :alt="item.user.name"
              loading="lazy"
              width="36"
              height="36"
              @error="handlePictureError(item.user)"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-slate-700"
              :style="{ backgroundColor: getPastelColor(item.user.name) }"
              :aria-label="item.user.name"
            >
              {{ getInitial(item.user.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="font-semibold text-sm text-[#0d1b2a] truncate">{{ item.user.name }}</span>
                <span class="text-[0.65rem] text-slate-400 shrink-0">{{ item.created_at }}</span>
              </div>
              <!-- Estrellas -->
              <div class="flex gap-0.5 mt-1">
                <span v-for="s in 5" :key="s" class="text-sm" :class="s <= item.stars ? 'text-yellow-400' : 'text-gray-200'">★</span>
              </div>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">{{ item.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
