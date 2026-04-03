<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import type { ICategory } from '../../types/Categorie';
import CategoryService from '../../services/CategorieService';
import MessageService from '../../services/MessageService';

const courseBougth = ref<ICategory[]>([])
import FooterComponent from '../../components/footer/footer.component.vue';
import { useRouter } from 'vue-router';
import AffiliatyMessageComponent from '../../components/auth/affiliaty.message.component.vue';
const router = useRouter()

// Review dialog state
const showReviewDialog = ref(false);
const reviewCategoryId = ref<number | null>(null);
const reviewCategoryName = ref('');
const reviewStars = ref(0);
const reviewHoverStars = ref(0);
const reviewMessage = ref('');
const reviewSubmitting = ref(false);
const reviewError = ref('');
const reviewSuccess = ref('');
const reviewAlreadyCommented = ref(false);

onMounted(async () => {
  courseBougth.value = await CategoryService.getMyCourses();
});

const hadleLinkCoursesDrive = (link: string | undefined) => {
  if (link) {
    window.open(link, "_blank");
  }
}

const handleClickItem = (id: number) => {
  router.push({ name: 'courses-description', params: { id: id } })
}

const openReviewDialog = async (category: ICategory) => {
  reviewCategoryId.value = category.id;
  reviewCategoryName.value = category.titulo || '';
  reviewStars.value = 0;
  reviewHoverStars.value = 0;
  reviewMessage.value = '';
  reviewError.value = '';
  reviewSuccess.value = '';
  reviewAlreadyCommented.value = false;
  showReviewDialog.value = true;

  // Check if user already commented
  const response = await MessageService.getAllMessageByCategory(category.id);
  if (response.is_comment) {
    reviewAlreadyCommented.value = true;
  }
};

const closeReviewDialog = () => {
  showReviewDialog.value = false;
};

const submitReview = async () => {
  if (reviewStars.value === 0 || !reviewMessage.value.trim()) {
    reviewError.value = 'Selecciona una calificación y escribe tu comentario.';
    return;
  }
  if (!reviewCategoryId.value) return;

  reviewError.value = '';
  reviewSubmitting.value = true;
  const success = await MessageService.addMessage(
    reviewCategoryId.value,
    reviewMessage.value.trim(),
    reviewStars.value
  );
  reviewSubmitting.value = false;

  if (success) {
    reviewSuccess.value = '¡Reseña enviada con éxito!';
    // Mark the course as already commented locally
    const course = courseBougth.value.find(c => c.id === reviewCategoryId.value);
    if (course) course.user_comment = true;
    setTimeout(() => {
      showReviewDialog.value = false;
    }, 1500);
  } else {
    reviewError.value = 'No se pudo enviar tu reseña. Intenta de nuevo.';
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50/30">
    <!-- Main Content pushing footer down -->
    <div class="flex-grow pt-8 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- ENCABEZADO -->
        <div v-if="courseBougth.length > 0" class="text-center md:text-left mb-10">
          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Mis Cursos</h1>
          <p class="mt-2 text-base md:text-lg text-gray-500">Cada gran logro comienza con un pequeño paso. ¡Continúa aprendiendo!</p>
        </div>

        <!-- ESTADO VACÍO (NO HAY CURSOS) -->
        <div v-if="courseBougth.length === 0" class="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 mt-8">
          <div class="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100 max-w-xl w-full flex flex-col items-center">
            <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Aún no tienes cursos</h2>
            <p class="text-gray-500 mb-8 max-w-md text-sm md:text-base leading-relaxed">Parece que todavía no has adquirido ningún curso. Explora nuestras categorías y encuentra el curso perfecto para ti.</p>
            <button @click="router.push({ name: 'courses' })" class="bg-[#FFBF2B] hover:bg-[#FACC15] text-slate-900 font-semibold py-3.5 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              Explorar Categorías
            </button>
          </div>
        </div>

        <!-- GRILLA DE CURSOS -->
        <div v-if="courseBougth.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(item, index) in courseBougth" :key="index" 
               class="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
            
            <!-- Imagen del curso -->
            <div @click="handleClickItem(item.id)" class="relative w-full aspect-video overflow-hidden bg-gray-100 cursor-pointer">
              <img class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" :src="item.imagen_url" :alt="item.titulo">
              <!-- Overlay sutil -->
              <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
            </div>

            <!-- Contenido del curso -->
            <div class="flex flex-col flex-grow p-6">
              <div class="flex-grow">
                <div @click="handleClickItem(item.id)" class="cursor-pointer">
                  <h3 class="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">{{ item.titulo }}</h3>
                  
                  <div class="flex items-center gap-2 mt-3 text-xs md:text-sm text-gray-600 font-medium bg-gray-50 max-w-max px-3 py-1.5 rounded-lg border border-gray-100">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <span>{{ item.cantidad_cursos || 0 }} {{ item.cantidad_cursos === 1 ? 'curso incluido' : 'cursos incluidos' }}</span>
                  </div>
                </div>
                
                <!-- Componente de Afiliado (si ocupa espacio, ponerle margin top) -->
                <div class="mt-4 pt-1">
                  <AffiliatyMessageComponent :id_category="item.id" />
                </div>
              </div>

              <!-- Acción inferior -->
              <div class="mt-6 pt-5 border-t border-gray-50 flex flex-col gap-3">
                <button @click="hadleLinkCoursesDrive(item.url)"
                  class="w-full flex items-center justify-center gap-2 bg-[#FFBF2B] hover:bg-[#FACC15] text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-200">
                  <span>Ver Mis Cursos</span>
                  <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </button>
                <!-- Botón dejar reseña -->
                <button
                  v-if="!item.user_comment"
                  @click="openReviewDialog(item)"
                  class="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl border border-gray-200 text-sm transition-all duration-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                  <span>Dejar reseña</span>
                </button>
                <p v-else class="text-center text-xs text-green-600">✓ Ya dejaste tu reseña</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de reseña -->
    <div v-if="showReviewDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="closeReviewDialog">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Dejar reseña</h3>
          <button @click="closeReviewDialog" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <p class="text-sm text-gray-500 mb-4">{{ reviewCategoryName }}</p>

        <!-- Ya comentó -->
        <div v-if="reviewAlreadyCommented" class="text-center py-6">
          <p class="text-green-600 font-medium">✓ Ya dejaste tu reseña para este curso.</p>
          <button @click="closeReviewDialog" class="mt-4 text-sm text-gray-500 underline">Cerrar</button>
        </div>

        <!-- Formulario -->
        <div v-else>
          <!-- Estrellas -->
          <div class="flex items-center gap-1 mb-4">
            <span class="text-sm text-gray-600 mr-2">Calificación:</span>
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              class="text-2xl transition-colors"
              :class="i <= (reviewHoverStars || reviewStars) ? 'text-yellow-500' : 'text-gray-300'"
              @mouseenter="reviewHoverStars = i"
              @mouseleave="reviewHoverStars = 0"
              @click="reviewStars = i"
            >★</button>
            <span v-if="reviewStars > 0" class="ml-2 text-sm text-gray-500">{{ reviewStars }}/5</span>
          </div>

          <!-- Comentario -->
          <textarea
            v-model="reviewMessage"
            placeholder="Escribe tu opinión sobre este curso..."
            rows="4"
            class="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>

          <!-- Error / Éxito -->
          <p v-if="reviewError" class="text-red-500 text-xs mt-2">{{ reviewError }}</p>
          <p v-if="reviewSuccess" class="text-green-600 text-sm mt-2 font-medium">{{ reviewSuccess }}</p>

          <!-- Botones -->
          <div class="flex justify-end gap-3 mt-4">
            <button @click="closeReviewDialog" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
            <button
              @click="submitReview"
              :disabled="reviewSubmitting"
              class="bg-[#FFBF2B] hover:bg-[#FACC15] text-slate-900 font-semibold py-2 px-6 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {{ reviewSubmitting ? 'Enviando...' : 'Enviar reseña' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer siempre en la parte inferior de la pantalla pero se empuja hacia abajo si hay contenido -->
    <div class="w-full mt-auto">
      <FooterComponent />
    </div>
  </div>
</template>