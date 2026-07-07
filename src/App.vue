<script setup lang="ts">
import { RouterView } from 'vue-router';
import HeaderComponent from './components/header/header.component.vue';
import ChatbotWidgetComponent from './components/common/chatbot-widget.component.vue';
import PromoIntroDialogComponent from './components/common/promo-intro-dialog.component.vue';
import { GoogleLogin } from 'vue3-google-login'; // Added GoogleLogin import

import { onMounted, watch } from 'vue';
import AuthService from './services/AuthServices';
import { authStore } from './store/AuthStore';
import { categoryStore } from './store/CategoryStore';
import { emergentBuyStore } from './store/EmergentBuyStore';

const store = authStore() // Renamed storeAuth to store for consistency with new code
const catStore = categoryStore()
const buyStore = emergentBuyStore()




const callback = async (response: any) => {
    const ser = await AuthService.verifyToken(response.credential)
    store.setProfile(ser)
}


onMounted(async () => {
  const [profile] = await Promise.all([
    AuthService.getProfile(),
    catStore.fetchCategories()
  ])
  store.setProfile(profile)

  const affiliaty_id = localStorage.getItem('google_affiliaty')
  if (affiliaty_id) {
    AuthService.get_affiliaty(String(affiliaty_id)).then((res) => {
      if (res) {
        store.nameAffiliaty = res.name
        store.setCupoCode(res.cupon)
      }
    })
  }
})



// solo funciona cuando la persona es nueva y redifige al link del referido
watch(() => store.profile?.user?.google_id, (id) => {
  if (!id) return
  const referido = localStorage.getItem('path_referido')
  if (referido) {
    localStorage.removeItem('path_referido')
    location.href = location.origin + referido
  }
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
      <RouterView v-slot="{ Component }">
        <!-- Conserva en memoria las vistas de navegación principales para que al
             cambiar de pestaña no se re-monten ni vuelvan a pedir sus datos.
             :max acota cuántas instancias se mantienen vivas (evita crecer sin límite). -->
        <KeepAlive
          :include="['HomeView', 'CoursesComponent', 'CourseInfoPage', 'MyCoursesPage']"
          :max="5"
        >
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>



    <!-- ═══ DIALOG DE INTRODUCCION A LA PROMO ═══ -->
    <PromoIntroDialogComponent v-if="!buyStore.emergentBuy.emergent" />

    <!-- ═══ CHATBOT WIDGET (Clarita) ═══ -->
    <ChatbotWidgetComponent v-if="false" />

  </div>

</template>

