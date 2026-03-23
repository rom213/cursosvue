<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import type { ICategory } from '../../types/Categorie';
import { categoryStore } from '../../store/CategoryStore';

const courseBougth = ref<ICategory[] | []>([])
import FooterComponent from '../../components/footer/footer.component.vue';
import { useRouter } from 'vue-router';
import AffiliatyMessageComponent from '../../components/auth/affiliaty.message.component.vue';
const storeCatergory = categoryStore()
const router = useRouter()

onMounted(async () => {
  await storeCatergory.fetchCategories(true);
  courseBougth.value = storeCatergory.getCategoriesBougth();
})


watch(
  () => storeCatergory.categories,
  () => {
    courseBougth.value = storeCatergory.getCategoriesBougth();
  },
  { deep: true }
);

const hadleLinkCoursesDrive = (link: string | undefined) => {
  if (link) {
    window.open(link, "_blank"); // Abre el enlace en una nueva pestaña
  }
}

const handleClickItem = (id: number) => {
  router.push({ name: 'courses-description', params: { id: id } })
}



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
                    <span>{{ item.courses?.length || 0 }} {{ item.courses?.length === 1 ? 'curso incluido' : 'cursos incluidos' }}</span>
                  </div>
                </div>
                
                <!-- Componente de Afiliado (si ocupa espacio, ponerle margin top) -->
                <div class="mt-4 pt-1">
                  <AffiliatyMessageComponent :id_category="item.id" />
                </div>
              </div>

              <!-- Acción inferior -->
              <div class="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                <button @click="hadleLinkCoursesDrive(item.url)"
                  class="w-full flex items-center justify-center gap-2 bg-[#FFBF2B] hover:bg-[#FACC15] text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-200">
                  <span>Ver Mis Cursos</span>
                  <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </button>
              </div>
            </div>
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