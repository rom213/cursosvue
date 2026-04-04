<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import HeaderComponent from './components/header/header.component.vue';
import { GoogleLogin } from 'vue3-google-login'; // Added GoogleLogin import

import { onMounted, watch } from 'vue';
import AuthService from './services/AuthServices';
import { authStore } from './store/AuthStore';
import { categoryStore } from './store/CategoryStore';
import { usePromoQuery } from './composables/usePromoQuery';

const store = authStore() // Renamed storeAuth to store for consistency with new code
const catStore = categoryStore()
const appRouter = useRouter()
const { promoName, promoRoute, promoType, isPromoActive, clearPromo } = usePromoQuery()

const goToPromo = () => {
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

    <!-- ═══ BANNER PROMO (flotante inferior, tema azul) ═══ -->
    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="isPromoActive"
        class="promo-toast fixed bottom-16 md:bottom-4 left-3 right-3 md:left-auto md:right-6 md:max-w-xl z-[60] rounded-2xl shadow-2xl shadow-blue-900/25 border border-blue-400/30 overflow-hidden backdrop-blur-md"
      >
        <div class="flex items-center gap-2 md:gap-3 pr-2">
          <!-- Zona clickeable: todo el banner menos la X -->
          <div
            class="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 cursor-pointer hover:bg-white/[0.07] transition-colors min-w-0"
            @click="goToPromo"
            title="Ver promocion"
          >
            <!-- Icono -->
            <div class="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <!-- Texto adaptado por tipo -->
            <p class="text-white text-xs md:text-sm leading-snug min-w-0">
              <template v-if="promoType === 'bloque'">
                Si vienes por el bloque de
                <span class="font-bold text-blue-100">{{ promoName }}</span>,
                esta aqui y te llevas los demas cursos como bono
              </template>
              <template v-else>
                Si vienes para el curso de
                <span class="font-bold text-blue-100">{{ promoName }}</span>,
                esta aqui y te llevas los demas como bono
              </template>
            </p>
          </div>
          <!-- Cerrar (no navega) -->
          <button
            type="button"
            class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border-none text-white/70 hover:text-white"
            @click.stop="clearPromo"
            title="Cerrar"
          >
            <svg class="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

  </div>

</template>

<style>
/* Mobile: semi-transparent so buy button peeks through */
.promo-toast {
  background: rgba(30, 64, 175, 0.92);
}
@media (min-width: 768px) {
  .promo-toast {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  }
}
</style>
