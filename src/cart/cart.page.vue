<script lang="ts" setup>
import { onMounted, ref, watch, onUnmounted, computed } from 'vue';
import PaymentService from '../services/PaymentService';
import GuestCheckoutService from '../services/GuestCheckoutService';
import { authStore } from '../store/AuthStore';
import { cartStore } from '../store/CartStore';
import ItemComponent from './item.component.vue';
import WhatsAppInput from '../components/common/WhatsAppInput.vue';
import type { ICategory } from '../types/Categorie';
import { useTracking } from '../composables/useTracking';
const storeCart = cartStore()
const userAuth = authStore()
const { trackBeginCheckout, trackAddPaymentInfo, persistPurchaseData } = useTracking()

const cart = ref<ICategory[]>([]);
const valueCart = ref<number>(0)
const isSidebarMode = ref(false)
const isProcessingPayment = ref(false)

// Flujo multi-paso: 'whatsapp' | 'email' | 'payment' | null
const checkoutStep = ref<'whatsapp' | 'email' | 'payment' | null>(null)
const whatsappValue = ref('')
const whatsappError = ref('')
const guestEmail = ref('')
const guestEmailConfirm = ref('')
const guestEmailError = ref('')
const guestEmailConfirmError = ref('')
const guestGoogleId = ref('')

const EMAIL_RE = /^[^@\s]+@gmail\.com$/i

const isGuest = computed(() => !userAuth.getProfile())

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

  // Pre-carga WhatsApp del perfil si está logueado
  const profile = userAuth.getProfile()?.user
  if (profile?.num_whatsapp) {
    const prefix = profile.prefix || '+57'
    whatsappValue.value = profile.num_whatsapp.startsWith('+')
      ? profile.num_whatsapp
      : `${prefix} ${profile.num_whatsapp}`
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

const isOnlyPaypal = () => {
  if (isGuest.value) return false // guests always use Wompi
  const userCountry = (userAuth.getProfile()?.user?.country || '').toUpperCase()
  return userCountry !== 'CO'
}

const handleBuyClick = () => {
  if (isProcessingPayment.value) return
  checkoutStep.value = 'whatsapp'
}

const continueFromWhatsapp = () => {
  const digits = whatsappValue.value.replace(/\D/g, '')
  if (digits.length < 7) {
    whatsappError.value = 'Ingresa un WhatsApp válido (mínimo 7 dígitos).'
    return
  }
  whatsappError.value = ''
  checkoutStep.value = isGuest.value ? 'email' : 'payment'
}

const continueFromEmail = async () => {
  const email = guestEmail.value.trim().toLowerCase()
  const emailConfirm = guestEmailConfirm.value.trim().toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    guestEmailError.value = 'Ingresa un correo Gmail válido (ejemplo@gmail.com).'
    return
  }
  guestEmailError.value = ''

  if (!emailConfirm || emailConfirm !== email) {
    guestEmailConfirmError.value = 'Los correos no coinciden.'
    return
  }
  guestEmailConfirmError.value = ''

  isProcessingPayment.value = true
  const result = await GuestCheckoutService.register({ email, num_whatsapp: whatsappValue.value })
  isProcessingPayment.value = false
  if (!result?.google_id) {
    guestEmailError.value = 'No pudimos registrarte. Intenta de nuevo.'
    return
  }
  guestGoogleId.value = result.google_id
  checkoutStep.value = 'payment'
}

const buyCategoriesWompi = async () => {
  if (isProcessingPayment.value) return;
  isProcessingPayment.value = true;
  const items = storeCart.getCart();
  trackAddPaymentInfo(items, valueCart.value, 'Wompi');
  persistPurchaseData(items, valueCart.value);
  const data = items.map(item => ({ id_category: item.id }));
  checkoutStep.value = null

  if (isGuest.value && guestGoogleId.value) {
    const res = await GuestCheckoutService.initGuestCheckout({
      google_id: guestGoogleId.value,
      categories: data,
      gateway: 'wompi',
      num_whatsapp: whatsappValue.value,
      cupon:""
    })
    if (res?.approval_url) window.location.href = res.approval_url
  } else {
    await PaymentService.generate_link_pay_wompy({ categories: data, num_whatsapp: whatsappValue.value }).then((res) => {
      if (res?.approval_url) window.location.href = res.approval_url
    })
  }
  isProcessingPayment.value = false;
}

const buyCategoriesPayPal = async () => {
  if (isProcessingPayment.value) return;
  isProcessingPayment.value = true;
  const items = storeCart.getCart();
  trackAddPaymentInfo(items, valueCart.value, 'PayPal');
  persistPurchaseData(items, valueCart.value);
  const data = items.map(item => ({ id_category: item.id }));
  checkoutStep.value = null

  if (isGuest.value && guestGoogleId.value) {
    const res = await GuestCheckoutService.initGuestCheckout({
      google_id: guestGoogleId.value,
      categories: data,
      gateway: 'paypal',
      num_whatsapp: whatsappValue.value,
      cupon: ""
    })
    if (res?.approval_url) window.location.href = res.approval_url
  } else {
    await PaymentService.generate_link_pay_paypal({ categories: data, num_whatsapp: whatsappValue.value }).then((res) => {
      if (res?.approval_url) window.location.href = res.approval_url
    })
  }
  isProcessingPayment.value = false;
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
              {{ isProcessingPayment ? 'Lo estamos alistando para ti...' : 'Desbloquear paquete' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal multi-paso checkout -->
      <div v-if="checkoutStep" class="absolute inset-0 z-50 bg-black/55 flex items-center justify-center p-4 w-full">
        <div class="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">

          <!-- Paso A: WhatsApp -->
          <template v-if="checkoutStep === 'whatsapp'">
            <div class="px-6 pt-6 pb-2">
              <h3 class="text-lg font-extrabold text-slate-900 mb-1">¿Dónde enviamos el recibo?</h3>
              <p class="text-sm text-slate-500 mb-4">Te notificaremos por WhatsApp cuando se confirme el pago.</p>
              <WhatsAppInput v-model="whatsappValue" :error="whatsappError" />
            </div>
            <div class="px-6 py-4 flex gap-2">
              <button @click="checkoutStep = null" class="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button @click="continueFromWhatsapp" class="flex-1 rounded-xl bg-slate-900 text-white py-3 text-sm font-bold hover:bg-slate-800 transition">
                Continuar
              </button>
            </div>
          </template>

          <!-- Paso B: Email (solo guest) -->
          <template v-else-if="checkoutStep === 'email'">
            <div class="px-6 pt-6 pb-2 space-y-4">
              <div>
                <h3 class="text-lg font-extrabold text-slate-900 mb-1">¿Cuál es tu correo?</h3>
                <p class="text-sm text-slate-500">Recibirás el recibo y acceso a tus cursos aquí.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestEmail"
                  type="email"
                  placeholder="tucorreo@gmail.com"
                  :disabled="isProcessingPayment"
                  class="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100"
                  :class="guestEmailError ? 'border-red-400' : 'border-gray-300'"
                />
                <p v-if="guestEmailError" class="text-xs text-red-500 mt-1">{{ guestEmailError }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar correo <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestEmailConfirm"
                  type="email"
                  placeholder="tucorreo@gmail.com"
                  :disabled="isProcessingPayment"
                  class="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100"
                  :class="guestEmailConfirmError ? 'border-red-400' : 'border-gray-300'"
                  @keyup.enter="continueFromEmail"
                />
                <p v-if="guestEmailConfirmError" class="text-xs text-red-500 mt-1">{{ guestEmailConfirmError }}</p>
              </div>
            </div>
            <div class="px-6 py-4 flex gap-2">
              <button @click="checkoutStep = 'whatsapp'" :disabled="isProcessingPayment" class="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-60">
                Atrás
              </button>
              <button @click="continueFromEmail" :disabled="isProcessingPayment" class="flex-1 rounded-xl bg-slate-900 text-white py-3 text-sm font-bold hover:bg-slate-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                <span v-if="isProcessingPayment" class="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                {{ isProcessingPayment ? 'Registrando...' : 'Continuar' }}
              </button>
            </div>
          </template>

          <!-- Paso C: Método de pago -->
          <template v-else-if="checkoutStep === 'payment'">
            <div class="px-6 pt-6 pb-2">
              <h3 class="text-lg font-extrabold text-slate-900 mb-1">
                {{ isGuest ? '¡Listo! Procede al pago' : 'Selecciona método de pago' }}
              </h3>
              <p class="text-sm text-slate-500">
                {{ isGuest ? 'Tu compra será procesada de forma segura con Wompi.' : 'Elige cómo deseas finalizar tu compra.' }}
              </p>
            </div>
            <div class="px-6 py-4 space-y-3">
              <!-- Botón Wompi (siempre para guests, o si no es solo PayPal) -->
              <button
                v-if="!isOnlyPaypal()"
                @click="buyCategoriesWompi()"
                :disabled="isProcessingPayment"
                class="w-full rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] px-4 py-3 flex flex-col items-center gap-2 shadow-md shadow-emerald-200"
              >
                <div class="flex items-center gap-2 w-full justify-center">
                  <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7V7a2 2 0 00-2-2H7a2 2 0 00-2 2v3m14 0H5m14 0a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2"/>
                  </svg>
                  <span class="font-extrabold text-emerald-800 text-base">
                    {{ isProcessingPayment ? 'Lo estamos alistando...' : 'Pagar con Wompi' }}
                  </span>
                </div>
                <div v-if="!isProcessingPayment" class="flex flex-wrap justify-center gap-1.5">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:#3B3F8C;">Nequi</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-900" style="background:#FDCD00;">Bancolombia</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:#E3001B;">Daviplata</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:linear-gradient(135deg,#1A56DB 0%,#F5A623 100%);">Tarjeta</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:#00693C;">PSE</span>
                </div>
                <div v-else class="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
              </button>

              <!-- Botón PayPal (solo para usuarios logueados fuera de Colombia) -->
              <button
                v-if="!isGuest"
                @click="buyCategoriesPayPal()"
                :disabled="isProcessingPayment"
                class="w-full rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] px-4 py-3 flex items-center justify-center gap-3 shadow-md shadow-blue-200"
              >
                <div class="h-6 w-6 text-[#003087] shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 19.95L8.237 12.65H5.80801L4.646 19.95H7.076Z" fill="#003087"/><path d="M11.238 12.65L12.399 5.35H9.97001L8.80798 12.65H11.238Z" fill="#003087"/><path d="M9.36295 2H14.139C17.729 2 20.656 4.898 20.656 8.509C20.656 12.12 17.729 15.018 14.139 15.018H11.709L12.871 7.718H15.301C16.463 7.718 17.399 6.782 17.399 5.62C17.399 4.458 16.463 3.522 15.301 3.522H11.729L9.36295 2Z" fill="#009CDE"/></svg>
                </div>
                <span class="font-extrabold text-[#003087] text-base">
                  {{ isProcessingPayment ? 'Lo estamos alistando...' : 'Pagar con PayPal' }}
                </span>
                <span v-if="isProcessingPayment" class="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></span>
              </button>

              <button
                @click="checkoutStep = null"
                :disabled="isProcessingPayment"
                class="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </template>

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
