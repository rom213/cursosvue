<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import CourseComponent from './course.component.vue';
import { categoryStore } from '../store/CategoryStore';
import CategoryService from '../services/CategorieService';
import FooterComponent from '../components/footer/footer.component.vue';
import { authStore } from '../store/AuthStore';
import EmergentBuyComponent from './emergent.buy.component.vue';
import { emergentBuyStore } from '../store/EmergentBuyStore';
import type { ICategory } from '../types/Categorie';

const storeemergentBuy = emergentBuyStore();
const categorStore = categoryStore()
const storeAuth = authStore()

const pageSize = 6
const currentOffset = ref(0)
const hasMoreCategories = ref(true)
const isLoadingMore = ref(false)
const categories = ref<ICategory[]>([])
const isRefer = ref<string | null>(null)

const loadMoreCategories = async () => {
    if (!hasMoreCategories.value || isLoadingMore.value) {
        return
    }

    isLoadingMore.value = true

    const batch = await CategoryService.getAllCategories(pageSize, currentOffset.value)
    const list = batch as ICategory[]

    if (list.length < pageSize) {
        hasMoreCategories.value = false
    }

    currentOffset.value += list.length
    
    // Filtrar para mostrar solo las categorías que no han sido compradas
    const unboughtList = list.filter(item => !item.user_bought)
    
    categories.value = [...categories.value, ...unboughtList]
    categorStore.setCategories(categories.value)

    isLoadingMore.value = false
}

const handleScroll = () => {
    if (!hasMoreCategories.value || isLoadingMore.value) return
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
    if (nearBottom) {
        void loadMoreCategories()
    }
}


onMounted(async () => {
    categories.value = []
    currentOffset.value = 0
    hasMoreCategories.value = true
    await loadMoreCategories()
    window.addEventListener('scroll', handleScroll, { passive: true })
    // evaluamos si es referido o no
    if (!storeAuth.getProfile()?.user?.is_bought) {
        const affiliaty = localStorage.getItem('google_affiliaty')
        isRefer.value = affiliaty
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})


</script>


<template>
    <div>
        <div v-if="storeAuth.nameAffiliaty" class="text-[10px] mt-1 pl-2 font-semibold ">Comprar con el descuento de {{
            storeAuth.nameAffiliaty }}</div>
        <div class="md:grid md:grid-cols-2 md:px-12 md:gap-3">
            <div :class="{ 'blur-[2px]': storeemergentBuy.emergentBuy.emergent }" v-for="(item, index) in categories"
                :key="index">
                <div >
                    <CourseComponent :item="item" :refer-code="isRefer" />
                </div>
            </div>
        </div>
        <div v-if="isLoadingMore" class="text-center text-sm text-gray-600 mt-4">
            Búsqueda cargado para ti
        </div>
        <br>
        <EmergentBuyComponent />
        <FooterComponent />
    </div>
</template>