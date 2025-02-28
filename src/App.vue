<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import HeaderComponent from './components/header/header.component.vue';

import { onMounted } from 'vue';
import AuthService from './services/AuthServices';import { authStore } from './store/AuthStore';
import CategoryService from './services/CategorieService';
import { categoryStore } from './store/CategoryStore';

const storeAuth = authStore()
const catStore=categoryStore()


onMounted(async()=>{
    const profile= await AuthService.getProfile();
    const category= await CategoryService.getAllCategories();
    catStore.setCategories(category);
    storeAuth.setProfile(profile);
})

</script>

<template>
  <div class="h-screen bg-[#F9F9F9]">
    <HeaderComponent />
    <div class="pt-28">

      <RouterView></RouterView>
    </div>

  </div>

</template>
