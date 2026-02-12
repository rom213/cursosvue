<script setup lang="ts">
import { RouterView } from 'vue-router';
import HeaderComponent from './components/header/header.component.vue';

import { onMounted, watch } from 'vue';
import AuthService from './services/AuthServices'; import { authStore } from './store/AuthStore';
import CategoryService from './services/CategorieService';
import { categoryStore } from './store/CategoryStore';
const storeAuth = authStore()
const catStore = categoryStore()


onMounted(async () => {
  const profile = await AuthService.getProfile();
  const category = await CategoryService.getAllCategories();
  catStore.setCategories(category);
  
  storeAuth.setProfile(profile);
})


onMounted(async () => {

  const affiliaty_id= localStorage.getItem('google_affiliaty')
  if (affiliaty_id) {
    AuthService.get_affiliaty(String(affiliaty_id))
        .then((res)=> {
          if (res) {
            storeAuth.nameAffiliaty= res.name
            storeAuth.setCupoCode(res.cupon)
          }
        })
  }

})





// solo funciona cuando la persona es nueva y redifige al link del referido
watch(() => storeAuth.profile, () => {
  const referido = localStorage.getItem('path_referido');
  if (referido) {
    localStorage.removeItem('path_referido');
    let path = location.origin + referido
    location.href = path
  }
},
  {
    deep: true
  })




</script>

<template>
  <div class="h-screen bg-[#F9F9F9]">
    <HeaderComponent v-if="$route.meta.showHeader" />
    <div :class="{ 'pt-28': $route.meta.showHeader }">

      <RouterView></RouterView>
    </div>

  </div>

</template>
