<script setup lang="ts">
import { ref, watch } from 'vue';
import CategoryService from '../../services/CategorieService';
import type { ICategory } from '../../types/Categorie';
import { useRouter } from 'vue-router';

const dataReseived = ref<ICategory[] | []>([])
const dataInput = ref('')
const router = useRouter();

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(() => dataInput.value, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!val || val.trim().length < 2) return
  searchTimer = setTimeout(() => {
    getDataSearch()
  }, 350)
})

const getDataSearch = () => {
    CategoryService.searchCategories(dataInput.value, 8).then((res) => {
        dataReseived.value = res
    }).catch(() => dataReseived.value = [])
}

const handleClickItem = (cat: ICategory) => {
    dataInput.value = ""
    dataReseived.value = []
    router.push({
        name: 'courses-description',
        params: { id: cat.id },
        query: { q_course: cat.titulo }
    })
}

const handleClickOutside = () => {
    dataReseived.value = [];
};
</script>

<template>
    <!-- Contenedor externo: gestiona el dropdown -->
    <div class="search-outer">

        <!-- Anillo giratorio: overflow:hidden para recortar el pseudo-elemento -->
        <div class="search-ring" :class="{ 'search-ring--active': dataInput }">

            <!-- Interior blanco: el input real -->
            <div class="search-inner">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 22L20 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input
                    v-model="dataInput"
                    class="search-input"
                    placeholder="¿Qué quieres aprender?"
                    type="text"
                    autocomplete="off"
                    inputmode="search"
                    enterkeyhint="search"
                />
            </div>
        </div>

        <!-- Dropdown de resultados -->
        <div v-if="dataReseived.length"
            class="search-dropdown">
            <div class="max-h-[300px] overflow-y-auto py-2">
                <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Resultados</div>
                <div v-for="(cat, index) in dataReseived" :key="index"
                     @click="handleClickItem(cat)"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0">
                    <img class="w-10 h-10 rounded-lg object-cover shadow-sm bg-gray-100" :src="cat.imagen_url" alt="">
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-sm font-medium text-gray-700 truncate">{{ cat.titulo }}</span>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span v-if="cat.cantidad_cursos" class="text-[11px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-medium whitespace-nowrap">{{ cat.cantidad_cursos }} cursos</span>
                            <span v-if="cat.autor" class="text-xs text-gray-500 truncate">{{ cat.autor }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="dataReseived.length" @click="handleClickOutside()" class="fixed inset-0 z-40 bg-black/5 cursor-default"></div>
    </div>
</template>

<style scoped>
/* ── CONTENEDOR (para posicionar el dropdown) ───────── */
.search-outer {
    position: relative;
}

/* ── ANILLO GIRATORIO ────────────────────────────────── */
.search-ring {
    position: relative;
    border-radius: 9999px;
    padding: 2px;           /* grosor del "borde" visible */
    overflow: hidden;
    /* Fondo por defecto: gris muy suave (estado inactivo) */
    background: #e2e8f0;
    transition: background 0.4s ease;
}

/* Pseudo-elemento: el conic-gradient que rota */
.search-ring::before {
    content: '';
    position: absolute;
    /* Más grande que el padre para cubrir bordes al rotar */
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: conic-gradient(
        from 0deg,
        #4285f4 0deg,
        #9b59b6 72deg,
        #ea4335 144deg,
        #fbbc04 216deg,
        #34a853 288deg,
        #4285f4 360deg
    );
    animation: searchSpin 5s linear infinite;
    opacity: 0;             /* invisible por defecto */
    transition: opacity 0.4s ease;
}

@keyframes searchSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

/* Hover: borde aparece suavemente */
.search-ring:hover::before {
    opacity: 0.7;
    animation-duration: 4s;
}

/* Focus o con texto: borde completo + más vivo */
.search-ring:focus-within::before,
.search-ring--active::before {
    opacity: 1;
    animation-duration: 2.5s;
}

/* Cuando hay foco, el fondo del anillo queda cubierto por el pseudo */
.search-ring:focus-within,
.search-ring--active {
    background: transparent;
}

/* ── INTERIOR BLANCO (sienta encima del gradiente) ───── */
.search-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: #f8fafc;
    border-radius: 9999px;
    padding: 0.5rem 1rem;
    transition: background 0.3s ease;
}

.search-ring:focus-within .search-inner {
    background: #ffffff;
}

/* ── ICONO ───────────────────────────────────────────── */
.search-icon {
    width: 1.1rem;
    height: 1.1rem;
    color: #94a3b8;
    flex-shrink: 0;
    transition: color 0.3s ease;
}
.search-ring:focus-within .search-icon {
    color: #6366f1;
}

/* ── INPUT ───────────────────────────────────────────── */
.search-input {
    background: transparent;
    outline: none;
    border: none;
    color: #1e293b;
    font-size: 0.875rem;
    width: 100%;
    min-width: 0;
    font-family: 'Inter', system-ui, sans-serif;
}
@media (min-width: 768px) {
    .search-input { width: 15rem; }
}
.search-input::placeholder {
    color: #94a3b8;
}

/* ── DROPDOWN ────────────────────────────────────────── */
.search-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    width: auto;
    background: white;
    border-radius: 1rem;
    box-shadow:
        0 4px 6px -1px rgba(0,0,0,0.07),
        0 20px 48px -8px rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.08);
    z-index: 50;
    overflow: hidden;
}
@media (min-width: 768px) {
    .search-dropdown {
        right: auto;
        min-width: 380px;
    }
}
</style>
