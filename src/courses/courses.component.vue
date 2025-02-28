<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import CourseComponent from './course.component.vue';
import { categoryStore } from '../store/CategoryStore';
import CategoryService from '../services/CategorieService';

const categorStore = categoryStore()

const categories= ref(categorStore.getCategories())

onMounted(async()=>{
    const category= await CategoryService.getAllCategories();
    categorStore.setCategories(category);
    categories.value= category
})

</script>


<template>
    <div v-for="(item, index) in categories" :key="index">
        <CourseComponent :item="item" />
    </div>

</template>