<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import CourseComponent from './course.component.vue';
import { categoryStore } from '../store/CategoryStore';
import CategoryService from '../services/CategorieService';
import FooterComponent from '../components/footer/footer.component.vue';
import { authStore } from '../store/AuthStore';
import  EmergentBuyComponent from './emergent.buy.component.vue';
import { emergentBuyStore } from '../store/EmergentBuyStore';

const storeemergentBuy=emergentBuyStore();
const categorStore = categoryStore()
const storeAuth = authStore()

const categories= ref(categorStore.getCategories())
const isRefer= ref<string | null>(null)


onMounted(async()=>{
    const category= await CategoryService.getAllCategories();
    categorStore.setCategories(category);
    categories.value= category
    // evaluamos si es referido o no
    if (!storeAuth.getProfile()?.user?.is_bought) {
        const affiliaty=localStorage.getItem('google_affiliaty')
        isRefer.value = affiliaty
    }
})


</script>


<template>
    <div v-if="storeAuth.nameAffiliaty" class="text-[10px] mt-1 pl-2 font-semibold ">Comprar con el descuento de {{ storeAuth.nameAffiliaty }}</div>
    <div :class="{'blur-[2px] ': storeemergentBuy.emergentBuy.emergent}" v-for="(item, index) in categories" :key="index">
        <div v-if="!item.user_bought">
            <CourseComponent :item="item" :refer-code="isRefer"/>
        </div>
    </div>
    <br>
    <EmergentBuyComponent />
    <FooterComponent />
</template>