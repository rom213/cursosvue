<script lang="ts" setup>
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { usePayU } from '../payu/usePayu';
import PaymentService from '../services/PaymentService';
import { authStore } from '../store/AuthStore';
import { cartStore } from '../store/CartStore';
import ItemComponent from './item.component.vue';
import type { ICategory } from '../types/Categorie';
const storeCart = cartStore()
const userAuth = authStore()
const { generatePayUForm } = usePayU();

const cart = ref<ICategory[]>([]);
const valueCart = ref<number>(0)
const isSidebarMode = ref(false)
const showPaymentModal = ref(false)

const checkViewport = () => {
  isSidebarMode.value = window.innerWidth > 768
}

onMounted(() => {
  checkViewport()
  window.addEventListener('resize', checkViewport)

  cart.value = storeCart.getCart()
  valueCart.value = 0
  cart.value?.forEach((item, index) => {
    if (!userAuth.getProfile()?.user?.is_bought && index > 0) {
      item.precio = item.precio
    }
    valueCart.value += item.precio
  });
})

onUnmounted(() => {
  window.removeEventListener('resize', checkViewport)
})



watch(
  () => storeCart.cartCategories,
  () => {
    const original = storeCart.getCart() ?? []

    cart.value = original.map(item => ({ ...item }))

    valueCart.value = cart.value.reduce((acc, item, index) => {
      const precio = Number(item.precio ?? 0)

      const precioFinal = (!userAuth.getProfile()?.user?.is_bought && index > 0)
        ? precio
        : precio
      // opcional: guardar el precio calculado en la copia (NO en el store)
      item.precio = precioFinal
      return acc + precioFinal
    }, 0)
  },
  { deep: true, immediate: true }
)



const buyCategoryPayu = () => {
  let data = storeCart.getCart().map(item => ({ id_category: item.id }));

  PaymentService.generate_signature_reference_code({ categories: data }).then((res) => {
    if (res?.signature) {
      let extra_info: string = ''
      const user_id = userAuth.getProfile()?.user?.google_id
      data.map((item) => {
        extra_info = extra_info + '|' + `${item.id_category},` + `${user_id}`
      })
      generatePayUForm(res?.price, " carrito de compras", userAuth.getProfile()?.user?.email, res?.signature, res?.reference_code, extra_info)
    }
  });
};

const buyCategoriesPayPal=()=>{
      let data = storeCart.getCart().map(item => ({ id_category: item.id }));
      PaymentService.generate_link_pay_paypal({categories: data}).then((res)=>{
        if (res?.approval_url) window.location.href=res.approval_url

      })
}


</script>

<template>
  <div
    :class="[
      isSidebarMode
        ? 'fixed right-0 top-0 h-full w-[500px] bg-white shadow-lg p-4 overflow-y-auto transition-all duration-300 z-30'
        : 'w-full transition-all duration-300'
    ]"
  >
    <div>
      <div class="flex justify-center gap-5">
        <h2 class="font-semibold">CARRITO DE COMPRA</h2>
        <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="..." fill="black" />
          <path d="..." fill="black" />
          <path d="..." fill="black" />
        </svg>
      </div>
      <p class="text-sm text-center">Cada gran logro comienza con un pequeño paso</p>
    </div>
    <br />

    <!-- carrito vacío -->
    <div v-if="valueCart == 0">
      <div class="text-center font-light">
        TU CARRITO ESTÁ VACÍO<br />
        YA PUEDES AGREGAR LOS CURSOS QUE QUIERAS
      </div>
      <div class="flex justify-center">
        <svg width="40" height="42" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="..." stroke="black" stroke-linejoin="round" />
          <path d="..." stroke="black" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <!-- carrito con items -->
    <div class="grid gap-3 px-2">
      <div v-for="(item, index) in cart" :key="index">
        <ItemComponent :item="item" />
        <div
          class="mt-7 mb-1 text-sm"
          v-if="index === 0 && cart.length > 1 && !userAuth.getProfile()?.user?.is_bought"
        >
          Al SER PRIMERA COMPRA, DESCUENTO 50% 🎁
        </div>
      </div>
    </div>

    <!-- barra inferior para comprar -->
    <div
      v-if="valueCart >= 1"
      class="flex gap-6 w-[500px] fixed bottom-0 h-[80px] border border-black items-center justify-center font-semibold bg-white"
      :class="{ 'right-0 ': isSidebarMode, 'left-0 w-full': !isSidebarMode }"
    >
      <div>Valor total ${{ valueCart }}</div>
      <div>
        <button class="bg-[#CDFF00] p-2 rounded-lg" @click="showPaymentModal = true">COMPRAR AHORA</button>
      </div>
    </div>

    <!-- Payment Selection Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-center">Selecciona método de pago</h3>
        <button @click="buyCategoryPayu(); showPaymentModal = false" class="block w-full bg-blue-500 text-white p-3 rounded-lg mb-3 hover:bg-blue-600 transition">
          PayU
        </button>
        <button @click="buyCategoriesPayPal(); showPaymentModal = false" class="block w-full bg-green-500 text-white p-3 rounded-lg mb-3 hover:bg-green-600 transition">
          PayPal
        </button>
        <button @click="showPaymentModal = false" class="block w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>
