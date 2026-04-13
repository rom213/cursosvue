<script lang="ts" setup>
import { onMounted, ref, watch, onUnmounted } from 'vue';
//import { usePayU } from '../payu/usePayu';
import PaymentService from '../services/PaymentService';
import { authStore } from '../store/AuthStore';
import { cartStore } from '../store/CartStore';
import ItemComponent from './item.component.vue';
import type { ICategory } from '../types/Categorie';
import { useTracking } from '../composables/useTracking';
const storeCart = cartStore()
const userAuth = authStore()
const { trackBeginCheckout, trackAddPaymentInfo, persistPurchaseData } = useTracking()
//const { generatePayUForm } = usePayU();

const cart = ref<ICategory[]>([]);
const valueCart = ref<number>(0)
const isSidebarMode = ref(false)
const showPaymentModal = ref(false)
const isProcessingPayment = ref(false)

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
    valueCart.value += item.precio || 0
  });
  if (cart.value?.length) {
    trackBeginCheckout(cart.value, valueCart.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkViewport)
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value || 0)
}



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



// const buyCategoryPayu = async () => {
//   if (isProcessingPayment.value) return;
//   isProcessingPayment.value = true;
//   let data = storeCart.getCart().map(item => ({ id_category: item.id }));

//   await PaymentService.generate_signature_reference_code({ categories: data }).then((res) => {
//     if (res?.signature) {
//       let extra_info: string = ''
//       const user_id = userAuth.getProfile()?.user?.google_id
//       data.map((item) => {
//         extra_info = extra_info + '|' + `${item.id_category},` + `${user_id}`
//       })
//       generatePayUForm(res?.price, " carrito de compras", userAuth.getProfile()?.user?.email, res?.signature, res?.reference_code, extra_info)
//     }
//   });
//   isProcessingPayment.value = false;
// };

const buyCategoriesWompi = async () => {
  if (isProcessingPayment.value) return;
  isProcessingPayment.value = true;
  const items = storeCart.getCart();
  trackAddPaymentInfo(items, valueCart.value, 'Wompi');
  persistPurchaseData(items, valueCart.value);
  let data = items.map(item => ({ id_category: item.id }));
  await PaymentService.generate_link_pay_wompy({ categories: data }).then((res) => {
    if (res?.approval_url) window.location.href = res.approval_url
  }).finally(() => {
    isProcessingPayment.value = false;
  })
}

const buyCategoriesPayPal = async () => {
  if (isProcessingPayment.value) return;
  isProcessingPayment.value = true;
  const items = storeCart.getCart();
  trackAddPaymentInfo(items, valueCart.value, 'PayPal');
  persistPurchaseData(items, valueCart.value);
  let data = items.map(item => ({ id_category: item.id }));
  await PaymentService.generate_link_pay_paypal({ categories: data }).then((res) => {
    if (res?.approval_url) window.location.href = res.approval_url
  }).finally(() => {
    isProcessingPayment.value = false;
  })
}

const isOnlyPaypal = () => {
  const userCountry = (userAuth.getProfile()?.user?.country || '').toUpperCase()
  return userCountry !== 'CO'
}

const handleBuyClick = async () => {
  if (isProcessingPayment.value) return;
  if (isOnlyPaypal()) {
    await buyCategoriesPayPal()
    return;
  }
  showPaymentModal.value = true
}






</script>

<template>
  <div
    :class="[
      isSidebarMode
        ? 'fixed right-0 top-0 h-full w-[520px] bg-slate-50 shadow-2xl overflow-y-auto transition-all duration-300 z-30 border-l border-slate-200'
        : 'w-full bg-slate-50 transition-all duration-300'
    ]"
  >
    <div class="px-4 md:px-6 pt-6 pb-28">
      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-[#CDFF00] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="..." fill="black" />
                <path d="..." fill="black" />
                <path d="..." fill="black" />
              </svg>
            </div>
            <div>
              <h2 class="text-base md:text-lg font-extrabold text-slate-900">Carrito de compras</h2>
              <p class="text-xs text-slate-500">Listo para completar tu compra</p>
            </div>
          </div>
          <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {{ cart.length }} item{{ cart.length === 1 ? '' : 's' }}
          </span>
        </div>
        <div class="mt-4 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium">
          Cada gran logro comienza con un pequeño paso.
        </div>
      </div>

      <div v-if="valueCart == 0" class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="..." stroke="black" stroke-linejoin="round" />
            <path d="..." stroke="black" stroke-linecap="round" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900">Tu carrito está vacío</h3>
        <p class="mt-2 text-sm text-slate-500">Agrega cursos y continúa con tu compra en segundos.</p>
      </div>

      <div v-else class="mt-6 grid gap-3 px-1">
        <div v-for="(item, index) in cart" :key="index">
          <ItemComponent :item="item" />
          <div
            class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
            v-if="index === 0 && cart.length > 1 && !userAuth.getProfile()?.user?.is_bought"
          >
            Beneficio activo: primera compra con descuento especial en cursos adicionales.
          </div>
        </div>
      </div>

      <div
        v-if="valueCart >= 1"
        class="fixed bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-md"
        :class="{ 'right-0 w-[520px]': isSidebarMode, 'left-0 w-full': !isSidebarMode }"
      >
        <div class="px-4 md:px-6 py-4">
          <div class="rounded-2xl bg-slate-900 text-white p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-300">Valor total</span>
              <span class="text-xl font-extrabold">{{ formatCurrency(valueCart) }}</span>
            </div>
            <button
              class="mt-3 w-full rounded-xl bg-[#CDFF00] py-3 text-sm font-extrabold text-slate-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="isProcessingPayment"
              @click="handleBuyClick"
            >
              {{ isProcessingPayment ? 'Lo estamos alistando para ti...' : 'Comprar ahora' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showPaymentModal" class="absolute inset-0 z-50 bg-black/55 flex items-center justify-center p-4 w-full">
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
          <div class="mb-5">
            <h3 class="text-lg font-extrabold text-slate-900">Selecciona método de pago</h3>
            <p class="text-sm text-slate-500">Elige cómo deseas finalizar tu compra.</p>
          </div>
          <div class="space-y-3">
            <button
              @click="buyCategoriesWompi(); showPaymentModal = false"
              class="w-full rounded-xl border border-sky-200 bg-sky-50 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="isProcessingPayment"
            >
              Pagar con Wompi
            </button>
            <button
              @click="buyCategoriesPayPal(); showPaymentModal = false"
              class="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="isProcessingPayment"
            >
              Pagar con PayPal
            </button>
            <button
              @click="showPaymentModal = false"
              class="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="isProcessingPayment"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
      <div v-if="isProcessingPayment" class="absolute inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xl flex items-center gap-3">
          <div class="h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin"></div>
          <p class="text-sm font-semibold text-slate-700">Lo estamos alistando para ti...</p>
        </div>
      </div>
    </div>
  </div>
</template>
