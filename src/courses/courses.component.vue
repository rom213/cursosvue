<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import CourseComponent from './course.component.vue';
import { categoryStore } from '../store/CategoryStore';
import CategoryService from '../services/CategorieService';
import FooterComponent from '../components/footer/footer.component.vue';

const categorStore = categoryStore()

const categories= ref(categorStore.getCategories())

onMounted(async()=>{
    const category= await CategoryService.getAllCategories();
    categorStore.setCategories(category);
    categories.value= category
})

</script>


<template>
    <div class="h-full" v-for="(item, index) in categories" :key="index">
        <div v-if="!item.user_bought">
            <CourseComponent :item="item" />
        </div>

    </div>
    <br>
    <FooterComponent />
</template>