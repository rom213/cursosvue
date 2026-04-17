<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import HeaderComponent from './components/header/header.component.vue';
import ChatbotWidgetComponent from './components/common/chatbot-widget.component.vue';
import ToastStack from './components/common/ToastStack.vue';
import PromoIntroDialogComponent from './components/common/promo-intro-dialog.component.vue';
import { GoogleLogin } from 'vue3-google-login'; // Added GoogleLogin import

import { onMounted, watch } from 'vue';
import AuthService from './services/AuthServices';
import { authStore } from './store/AuthStore';
import { categoryStore } from './store/CategoryStore';
import { emergentBuyStore } from './store/EmergentBuyStore';
import { usePromoQuery } from './composables/usePromoQuery';

const store = authStore() // Renamed storeAuth to store for consistency with new code
const catStore = categoryStore()
const buyStore = emergentBuyStore()
const appRouter = useRouter()
const {  promoRoute, showPromoBanner, clearPromo, markBannerClicked } = usePromoQuery()

const goToPromo = () => {
  markBannerClicked()
  appRouter.push(promoRoute.value ?? '/courses')
}

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
        <KeepAlive :include="['CoursesComponent']" :max="2">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>

    <!-- ═══ STACK DE NOTIFICACIONES (promo + toasts) ═══ -->
    <div
      class="fixed bottom-44 left-3 right-3 md:bottom-28 md:left-auto md:right-6 md:max-w-md z-[60] flex flex-col-reverse gap-3 pointer-events-none"
    >
      <!-- Toast de promo (queda abajo) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="showPromoBanner && !buyStore.emergentBuy.emergent"
          class="promo-toast pointer-events-auto rounded-2xl bg-white border-2 border-blue-300 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/15 transition-shadow overflow-hidden"
        >
          <div class="flex items-stretch">
            <!-- Zona clickeable: avatar + contenido -->
            <div
              class="flex-1 flex items-start gap-3 p-3 md:p-4 cursor-pointer hover:bg-blue-50/60 transition-colors min-w-0"
              @click="goToPromo"
              title="Ver promoción"
            >
              <!-- Avatar Clarita -->
              <img
                src="./assets/home/mujercurosagente.png"
                alt="Clarita"
                class="flex-shrink-0 w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
              />
              <!-- Contenido -->
              <div class="flex-1 min-w-0">
                <p class="text-blue-700 font-bold text-sm md:text-[15px] leading-tight mb-1">
                  ¡Tu regalo está aquí<template v-if="store.profile?.user?.given_name">, {{ store.profile.user.given_name }}</template>! <span aria-hidden="true">🎁</span>
                </p>
                <p class="text-gray-600 text-xs md:text-sm leading-snug">
                  Desbloqueas
                  <span class="font-semibold text-gray-900">todo nuestro catálogo</span>
                  de cursos de esta categoría gratis. Solo necesitas tu Gmail para acceder en Google Drive.
                </p>
              </div>
            </div>
            <!-- Cerrar -->
            <button
              type="button"
              class="flex-shrink-0 self-start mt-2 mr-2 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              @click.stop="clearPromo"
              aria-label="Cerrar notificación"
              title="Cerrar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Toasts dinámicos (se apilan arriba de la promo) -->
      <ToastStack />
    </div>

    <!-- ═══ DIALOG DE INTRODUCCION A LA PROMO ═══ -->
    <PromoIntroDialogComponent v-if="!buyStore.emergentBuy.emergent" />

    <!-- ═══ CHATBOT WIDGET (Clarita) ═══ -->
    <ChatbotWidgetComponent v-if="false" />

  </div>

</template>

