<script setup lang="ts">
import { RouterView } from 'vue-router';
import HeaderComponent from './components/header/header.component.vue';
import { GoogleLogin } from 'vue3-google-login'; // Added GoogleLogin import

import { onMounted, watch } from 'vue';
import AuthService from './services/AuthServices';
import { authStore } from './store/AuthStore';
import { categoryStore } from './store/CategoryStore';

const store = authStore() // Renamed storeAuth to store for consistency with new code
const catStore = categoryStore()

const callback = async (response: any) => {
    const ser = await AuthService.verifyToken(response.credential)
    store.setProfile(ser)
}


onMounted(async () => {
  const profile = await AuthService.getProfile();
  console.log(profile);
  await catStore.fetchCategories();
  console.log("Categories loaded in App.vue");
    
  store.setProfile(profile);

})


onMounted(async () => {

  const affiliaty_id= localStorage.getItem('google_affiliaty')
  if (affiliaty_id) {
    AuthService.get_affiliaty(String(affiliaty_id))
        .then((res)=> {
          if (res) {
            store.nameAffiliaty= res.name
            store.setCupoCode(res.cupon)
          }
        })
  }

})





// solo funciona cuando la persona es nueva y redifige al link del referido
watch(() => store.profile, () => {
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
    <div :class="{ 'pt-0': $route.meta.showHeader }">
      <div class="opacity-0 absolute top-0 left-0" >
        <!-- @ts-ignore -->
        <GoogleLogin :callback="callback" prompt auto-login />
      </div>
      <RouterView></RouterView>
    </div>

  </div>

</template>
