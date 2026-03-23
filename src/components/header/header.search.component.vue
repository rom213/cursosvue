<script setup lang="ts">
import { ref, watch } from 'vue';
import CategoryService from '../../services/CategorieService';
import type { ICategory } from '../../types/Categorie';
import { useRouter } from 'vue-router';


const dataReseived = ref<ICategory[] | []>([])
const dataInput = ref('')
const router = useRouter();



watch(() => dataInput.value, () => {
    getDataSearch()
})



const getDataSearch = () => {
    CategoryService.searchCategories(dataInput.value, 8).then((res) => {
        dataReseived.value = res
    }).catch(() => dataReseived.value = [])
}

const handleClickItem = (cat: ICategory) => {
    dataInput.value = ""
    dataReseived.value = []
    
    // Pass the selected course title in the query params to be highlighted on the target page
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
    <div class="relative group">
        <div class="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all duration-300 w-full md:w-auto border border-transparent focus-within:border-blue-100">
            <svg class="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 22L20 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
                v-model="dataInput" 
                class="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full md:w-64 text-sm md:text-base"
                placeholder="¿Qué quieres aprender?" 
                type="text"
            >
        </div>
        
        <!-- Results Dropdown -->
        <div v-if="dataReseived.length"
            class="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all duration-200 origin-top-left">
            <div class="max-h-[300px] overflow-y-auto py-2">
                <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Resultados</div>
                <div v-for="(cat, index) in dataReseived" :key="index"
                     @click="handleClickItem(cat)"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0">
                    <img class="w-10 h-10 rounded-lg object-cover shadow-sm bg-gray-100" :src="cat.imagen_url" alt="">
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-sm font-medium text-gray-700 truncate">{{ cat.titulo }}</span>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span v-if="cat.cantidad_cursos" class="text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium whitespace-nowrap">{{ cat.cantidad_cursos }} cursos</span>
                            <span v-if="cat.autor" class="text-xs text-gray-500 truncate">{{ cat.autor }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="dataReseived.length" @click="handleClickOutside()" class="fixed inset-0 z-40 bg-black/5 cursor-default"></div>
    </div>
</template>