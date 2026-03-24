<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { courseIcons } from "../courseIcons";
import { courseInfoIcons } from "./courseInfo.icons";
import { authStore } from "../../store/AuthStore";
import { cartStore } from "../../store/CartStore";
import AffiliatyMessageComponent from "../../components/auth/affiliaty.message.component.vue";
import { emergentBuyStore } from "../../store/EmergentBuyStore";
import type { ICategory } from "../../types/Categorie";
import { onMounted, ref, watch, computed } from "vue";
import { categoryStore } from "../../store/CategoryStore";
import EmergentBuyComponent from "../emergent.buy.component.vue";
import AuthService from "../../services/AuthServices";
import CategoryService from "../../services/CategorieService";
import CourseFaqSection from "./CourseFaqSection.vue";

const cartSt = cartStore();
const storeemergentBuy = emergentBuyStore();
enum Navegacion {
  Contenido = 1,
  Preguntas = 2,
  Comentarios = 3,
  Beneficios = 4,
}

const router = useRouter();
const userAuth = authStore();
const route = useRoute();
const storeCategory = categoryStore();
const category = ref<ICategory>();
const navegacion = ref(Navegacion.Contenido);
const openedFolders = ref<Record<string, boolean>>({});

const itemsPerPage = 5;
const itemsPerPageLista = 10;

const currentPages = ref({
  plataformas: 1,
  temas: 1,
  listaCompleta: 1
});

const searchTermLista = ref("");

watch(searchTermLista, () => {
  currentPages.value.listaCompleta = 1;
});

const paginatedPlataformas = computed(() => {
  const list = category.value?.seccion_plataformas?.plataformas || [];
  const start = (currentPages.value.plataformas - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage).map((item, idx) => ({
    ...item,
    originalIndex: start + idx
  }));
});
const totalPagesPlataformas = computed(() => Math.ceil((category.value?.seccion_plataformas?.plataformas?.length || 0) / itemsPerPage));

const paginatedTemas = computed(() => {
  const list = category.value?.seccion_temas?.temas || [];
  const start = (currentPages.value.temas - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage).map((item, idx) => ({
    ...item,
    originalIndex: start + idx
  }));
});
const totalPagesTemas = computed(() => Math.ceil((category.value?.seccion_temas?.temas?.length || 0) / itemsPerPage));

const filteredListaCompleta = computed(() => {
  const list = category.value?.seccion_lista_completa?.lista_completa || [];
  if (!searchTermLista.value) return list;
  const term = searchTermLista.value.toLowerCase();
  return list.filter(item => item.name_del_curso?.toLowerCase().includes(term));
});

const paginatedListaCompleta = computed(() => {
  const list = filteredListaCompleta.value;
  const start = (currentPages.value.listaCompleta - 1) * itemsPerPageLista;
  return list.slice(start, start + itemsPerPageLista).map((item, idx) => ({
    ...item,
    originalIndex: start + idx
  }));
});
const totalPagesListaCompleta = computed(() => Math.ceil((filteredListaCompleta.value.length || 0) / itemsPerPageLista));

const toggleFolder = (key: string) => {
  openedFolders.value[key] = !openedFolders.value[key];
};

const isFolderOpen = (key: string) => Boolean(openedFolders.value[key]);

const openInNewTab = (url?: string) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

const addCarCategory = (item: ICategory) => {
  if (userAuth.getProfile() == null) {
    router.push("/login");
    return;
  }
  if (cartSt.validateCart(item)) {
    cartSt.setCart(item);
  }
};
const syncCategoryFromRoute = async () => {
  const rawId = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const index = Number(rawId);

  if (Number.isNaN(index)) {
    category.value = undefined;
    return;
  }

  // Carga rápida del objeto "light" desde cache
  category.value = storeCategory.findCategoryById(index);
  
  // Petición asíncrona del objeto completo
  const fullCategory = await CategoryService.getCategoryById(index);
  if (fullCategory) {
    category.value = fullCategory;
  }
};
onMounted(() => {
  let index = Number(route.params.id);
  category.value = storeCategory.findCategoryById(index);

  if (route.params.googleid) {
    AuthService.get_affiliaty(route.params.googleid).then((res) => {
      userAuth.nameAffiliaty = res?.name;
      localStorage.setItem("google_affiliaty", String(route.params.googleid));
    });
  } else {
    userAuth.nameAffiliaty = undefined;
  }
});

watch(
  [() => route.params.id, () => storeCategory.categories.length],
  async () => {
    openedFolders.value['section-lista-completa'] = true;
    if (route.query.q_course) {
      searchTermLista.value = route.query.q_course as string;
      setTimeout(() => {
         const el = document.getElementById('lista-completa-header');
         if(el) {
           const y = el.getBoundingClientRect().top + window.scrollY - 180;
           window.scrollTo({ top: y, behavior: 'smooth' });
         }
      }, 600);
    } else {
      searchTermLista.value = "";
    }
    await syncCategoryFromRoute();
  },
  { immediate: true },
);
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-12">
    <div v-if="userAuth.nameAffiliaty" class="bg-amber-100 border-b border-amber-200 w-full py-3">
      <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-20 text-center">
        <span class="text-sm font-semibold text-amber-800">
          🎉 Estás comprando con el descuento especial de {{ userAuth.nameAffiliaty }}
        </span>
      </div>
    </div>

    <div class="bg-white border-b border-gray-200 pt-10 pb-12">
      <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-20">
        <div class="w-full lg:w-2/3 pr-0 lg:pr-8">
          <div class="flex items-center gap-2 mb-4">
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Curso Destacado
            </span>
            <div class="flex items-center text-amber-400 text-sm">
              ★★★★★ <span class="text-gray-500 ml-2 text-xs">(4.9)</span>
            </div>
          </div>
          <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            {{ category?.titulo }}
          </h1>
          <p class="text-lg text-gray-600 mb-6 line-clamp-2">
            {{ category?.frase_1 }}
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-20 -mt-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div class="lg:col-span-8 order-2 lg:order-1">
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 flex flex-wrap gap-2 sticky top-[5rem] z-10">
            <button
              v-for="(tab, key) in [
                { id: Navegacion.Contenido, label: 'Contenido', icon: courseInfoIcons.contenido },
                { id: Navegacion.Preguntas, label: 'Preguntas', icon: courseInfoIcons.preguntas },
                { id: Navegacion.Comentarios, label: 'Reseñas (23)', icon: courseInfoIcons.comentarios },
                { id: Navegacion.Beneficios, label: 'Beneficios', icon: courseInfoIcons.beneficios }
              ]"
              :key="key"
              @click="navegacion = tab.id"
              class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all"
              :class="navegacion === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
            >
              <div class="w-4 h-4" v-html="tab.icon"></div>
              {{ tab.label }}
            </button>
          </div>

          <div v-if="navegacion === Navegacion.Contenido" class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Temario del curso</h2>
            
            <div v-if="category?.seccion_plataformas?.plataformas?.length" class="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors" @click="toggleFolder('section-plataformas')">
                <span class="font-bold text-lg text-gray-800">Plataformas Integradas</span>
                <span class="flex items-center gap-3">
                  <span class="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm font-semibold">
                    {{ category?.seccion_plataformas?.cantidad_plataformas ?? category?.seccion_plataformas?.plataformas?.length ?? 0 }} clases
                  </span>
                  <svg class="w-6 h-6 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': isFolderOpen('section-plataformas') }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div v-show="isFolderOpen('section-plataformas')" class="border-t border-gray-100 px-6 py-4 max-h-[600px] overflow-y-auto bg-gray-50/50">
                <div v-if="!(category?.seccion_plataformas?.plataformas?.length)" class="text-sm text-gray-500 py-4 text-center">Sin elementos</div>
                
                <div v-for="plataforma in paginatedPlataformas" :key="plataforma.originalIndex" class="mb-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div class="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 cursor-pointer" @click="toggleFolder(`plat-${plataforma.originalIndex}`)">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
                      <span class="font-bold text-gray-800">{{ plataforma.titulo_plataforma || "Módulo" }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-gray-500">{{ plataforma.cantidad_cursos_plataforma ?? plataforma.cursos?.length ?? 0 }} lecciones</span>
                      <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isFolderOpen(`plat-${plataforma.originalIndex}`) }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  
                  <div v-show="isFolderOpen(`plat-${plataforma.originalIndex}`)" class="border-t border-gray-100 bg-gray-50 p-4">
                    <div v-for="(curso, cIndex) in plataforma.cursos || []" :key="cIndex" class="ml-4 pl-4 border-l-2 border-gray-200 py-2">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer" @click="toggleFolder(`plat-${plataforma.originalIndex}-cur-${cIndex}`)">
                          {{ cIndex + 1 }}. {{ curso.name_del_curso || "Lección" }}
                        </span>
                        <button v-if="curso.info_tecnica?.url" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition" @click.stop="openInNewTab(curso.info_tecnica?.url)">Recursos</button>
                      </div>
                      <ul v-show="isFolderOpen(`plat-${plataforma.originalIndex}-cur-${cIndex}`)" class="mt-2 space-y-1 text-xs text-gray-500 list-disc ml-4">
                        <li v-for="(item, iIndex) in curso.contenido || []" :key="iIndex">{{ item }}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div v-if="totalPagesPlataformas > 1" class="flex items-center justify-center gap-4 mt-4 mb-2">
                  <button 
                    @click="currentPages.plataformas--" 
                    :disabled="currentPages.plataformas === 1"
                    class="p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span class="text-sm font-medium text-gray-600">
                    Página {{ currentPages.plataformas }} de {{ totalPagesPlataformas }}
                  </span>
                  <button 
                    @click="currentPages.plataformas++" 
                    :disabled="currentPages.plataformas === totalPagesPlataformas"
                    class="p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="category?.seccion_temas?.temas?.length" class="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors" @click="toggleFolder('section-temas')">
                <span class="font-bold text-lg text-gray-800">Temas</span>
                <span class="flex items-center gap-3">
                  <span class="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm font-semibold">
                    {{ category?.seccion_temas?.cantidad_temas ?? category?.seccion_temas?.temas?.length ?? 0 }} temas
                  </span>
                  <svg class="w-6 h-6 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': isFolderOpen('section-temas') }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div v-show="isFolderOpen('section-temas')" class="border-t border-gray-100 px-6 py-4 max-h-[600px] overflow-y-auto bg-gray-50/50">
                <div v-if="!(category?.seccion_temas?.temas?.length)" class="text-sm text-gray-500 py-4 text-center">Sin elementos</div>

                <div v-for="tema in paginatedTemas" :key="tema.originalIndex" class="mb-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div class="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 cursor-pointer" @click="toggleFolder(`tema-${tema.originalIndex}`)">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a2 2 0 012-2h5a1 1 0 010 2H4v5.586l6.293-6.293a1 1 0 011.414 0l6.293 6.293V5a1 1 0 112 0v5a1 1 0 01-.293.707z" clip-rule="evenodd"></path></svg>
                      <span class="font-bold text-gray-800">{{ tema.titulo_tema || "Tema" }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-gray-500">{{ tema.cantidad_cursos_tema ?? tema.cursos?.length ?? 0 }} lecciones</span>
                      <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isFolderOpen(`tema-${tema.originalIndex}`) }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div v-show="isFolderOpen(`tema-${tema.originalIndex}`)" class="border-t border-gray-100 bg-gray-50 p-4">
                    <div v-for="(curso, cIndex) in tema.cursos || []" :key="cIndex" class="ml-4 pl-4 border-l-2 border-gray-200 py-2">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer" @click="toggleFolder(`tema-${tema.originalIndex}-cur-${cIndex}`)">
                          {{ cIndex + 1 }}. {{ curso.name_del_curso || "Lección" }}
                        </span>
                        <button v-if="curso.info_tecnica?.url" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition" @click.stop="openInNewTab(curso.info_tecnica?.url)">Recursos</button>
                      </div>
                      <ul v-show="isFolderOpen(`tema-${tema.originalIndex}-cur-${cIndex}`)" class="mt-2 space-y-1 text-xs text-gray-500 list-disc ml-4">
                        <li v-for="(item, iIndex) in curso.contenido || []" :key="iIndex">{{ item }}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div v-if="totalPagesTemas > 1" class="flex items-center justify-center gap-4 mt-4 mb-2">
                  <button 
                    @click="currentPages.temas--" 
                    :disabled="currentPages.temas === 1"
                    class="p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span class="text-sm font-medium text-gray-600">
                    Página {{ currentPages.temas }} de {{ totalPagesTemas }}
                  </span>
                  <button 
                    @click="currentPages.temas++" 
                    :disabled="currentPages.temas === totalPagesTemas"
                    class="p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div id="lista-completa-header" v-if="category?.seccion_lista_completa?.lista_completa?.length" class="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors" @click="toggleFolder('section-lista-completa')">
                <span class="font-bold text-lg text-gray-800">Lista Completa</span>
                <span class="flex items-center gap-3">
                  <span class="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm font-semibold">
                    {{ category?.seccion_lista_completa?.cantidad_cursos ?? category?.seccion_lista_completa?.lista_completa?.length ?? 0 }} cursos
                  </span>
                  <svg class="w-6 h-6 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': isFolderOpen('section-lista-completa') }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div v-show="isFolderOpen('section-lista-completa')" class="border-t border-gray-100 px-6 py-4 max-h-[600px] overflow-y-auto bg-gray-50/50">
                
                <div class="mb-5 relative w-full lg:w-2/3 mx-auto">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input v-model="searchTermLista" type="text" placeholder="Buscar un curso específico en este paquete..." class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm bg-white">
                  <button v-if="searchTermLista" @click="searchTermLista = ''" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div v-if="!filteredListaCompleta.length" class="text-sm text-gray-500 py-8 text-center flex flex-col items-center justify-center">
                   <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   No se encontraron cursos que coincidan con "{{ searchTermLista }}"
                </div>

                <div v-if="!(category?.seccion_lista_completa?.lista_completa?.length)" class="text-sm text-gray-500 py-4 text-center">Sin elementos</div>

                <div v-for="curso in paginatedListaCompleta" :key="curso.originalIndex" class="mb-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div class="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 cursor-pointer" @click="toggleFolder(`lista-cur-${curso.originalIndex}`)">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fill-rule="evenodd" d="M4 5a2 2 0 012-2h3a1 1 0 010 2H6a2 2 0 012 2v11a2 2 0 002 2h7a2 2 0 002-2V7a2 2 0 012-2h2a1 1 0 110 2h-2a2 2 0 012 2v11a4 4 0 01-4 4H8a4 4 0 01-4-4V5z" clip-rule="evenodd"></path></svg>
                      <span class="font-bold text-gray-800">{{ curso.name_del_curso || "Curso" }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button v-if="curso.info_tecnica?.url" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition" @click.stop="openInNewTab(curso.info_tecnica?.url)">Recursos</button>
                      <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isFolderOpen(`lista-cur-${curso.originalIndex}`) }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div v-show="isFolderOpen(`lista-cur-${curso.originalIndex}`)" class="border-t border-gray-100 bg-gray-50 p-4">
                    <ul class="space-y-1 text-xs text-gray-500 list-disc ml-4">
                      <li v-for="(item, iIndex) in curso.contenido || []" :key="iIndex">{{ item }}</li>
                    </ul>
                  </div>
                </div>

                <div v-if="totalPagesListaCompleta > 1" class="flex items-center justify-center gap-4 mt-4 mb-2">
                  <button 
                    @click="currentPages.listaCompleta--" 
                    :disabled="currentPages.listaCompleta === 1"
                    class="p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span class="text-sm font-medium text-gray-600">
                    Página {{ currentPages.listaCompleta }} de {{ totalPagesListaCompleta }}
                  </span>
                  <button 
                    @click="currentPages.listaCompleta++" 
                    :disabled="currentPages.listaCompleta === totalPagesListaCompleta"
                    class="p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>

            </div>

          <div v-if="navegacion === Navegacion.Preguntas" class="space-y-4">
            <CourseFaqSection />
          </div>

          <div v-if="navegacion === Navegacion.Comentarios">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Lo que dicen nuestros estudiantes</h2>
            <div class="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 class="text-lg font-bold text-gray-900">Comentarios próximamente</h3>
              <p class="text-gray-500 mt-2">Sé uno de los primeros en dejar tu opinión al terminar el curso.</p>
            </div>
          </div>

          <div v-if="navegacion === Navegacion.Beneficios">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Lo que obtendrás</h2>
            <div class="bg-white rounded-xl p-8 border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-start gap-4">
                <div class="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">Certificación Oficial</h4>
                  <p class="text-sm text-gray-600 mt-1">Recibe un certificado al concluir todos los módulos.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">A tu propio ritmo</h4>
                  <p class="text-sm text-gray-600 mt-1">Acceso 24/7 al material. Estudia cuando quieras.</p>
                </div>
              </div>
              </div>
          </div>

        </div>

        <div class="lg:col-span-4 order-1 lg:order-2">
          <div class="bg-white border border-gray-200 rounded-2xl shadow-xl lg:-mt-24 sticky top-[6.5rem] z-20 overflow-hidden">
            
            <div class="relative w-full aspect-video bg-gray-100 group cursor-pointer">
              <img class="w-full h-full object-cover" :src="category?.imagen_url" alt="Imagen del curso" />
              <div class="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
                <div class="bg-white/90 rounded-full p-4 transform group-hover:scale-110 transition-transform shadow-lg flex items-center justify-center">
                  <div class="w-8 h-8 text-blue-600 flex items-center justify-center" v-html="courseIcons.preview"></div>
                </div>
              </div>
              <div class="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded font-semibold">
                Vista previa
              </div>
            </div>

            <div class="p-6">
              <div class="mb-6">
                <div class="flex items-end gap-3">
                  <span class="text-4xl font-extrabold text-gray-900">
                    ${{ category?.precio }}
                    <span class="text-xl font-bold">{{ userAuth.getProfile()?.user?.country === "COP" ? "COP" : "USD" }}</span>
                  </span>
                </div>
                <p v-if="category?.pregunta_respuesta?.[0]?.pregunta" class="text-emerald-600 text-sm font-bold mt-2 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  Oferta disponible hoy
                </p>
              </div>

              <div class="space-y-3">
                <button
                  @click="() => { storeemergentBuy.handleEmergentBuy(); storeemergentBuy.setCategoryEmergent(category as ICategory); }"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-4 px-4 rounded-xl text-lg font-bold shadow-lg shadow-emerald-600/20 transform transition-all hover:-translate-y-0.5"
                >
                  Comprar ahora
                </button>

                <button
                  @click="addCarCategory(category as ICategory)"
                  class="w-full bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 py-3 px-4 rounded-xl font-bold transition-colors"
                >
                  Añadir al carrito
                </button>
              </div>

              <div class="mt-4">
                <AffiliatyMessageComponent :id_category="category?.id" variant="card" />
              </div>

              <div class="mt-6 border-t border-gray-100 pt-6">
                <h4 class="font-bold text-gray-900 mb-3 text-sm">Este curso incluye:</h4>
                <ul class="space-y-3 text-sm text-gray-600">
                  <li class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Acceso de por vida
                  </li>
                  <li class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Acceso en dispositivos móviles y TV
                  </li>
                  <li class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Garantía de reembolso de 7 días
                  </li>
                </ul>
              </div>

              <div class="mt-6 flex items-center justify-center gap-2 pt-4 border-t border-gray-100 text-xs text-gray-400 font-medium">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                Pagos seguros y encriptados
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <EmergentBuyComponent />
  </div>
</template>

<style scoped>
/* Scoped styles removed in favor of Tailwind utility classes */
</style>
