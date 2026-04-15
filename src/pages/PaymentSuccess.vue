<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { authStore } from '../store/AuthStore'
import { useTracking } from '../composables/useTracking'
import type { TrackingUserData } from '../composables/useTracking'

const route = useRoute()
const userAuthStore = authStore()
const { trackPurchaseFromPending, getPendingPurchase } = useTracking()

const status = ref<'success' | 'pending' | 'error'>('pending')
const transactionId = ref('')
const receiptCode = ref('')

onMounted(() => {
  // PayU sends: transactionState (4=approved, 6=declined, 5=expired, 7=pending)
  // Also: referenceCode, TX_VALUE
  const txState = route.query.transactionState as string | undefined
  const refCode = route.query.referenceCode as string || route.query.ref as string || ''
  transactionId.value = refCode
  receiptCode.value = route.query.receipt_code as string || ''

  if (txState === '4' || txState === undefined) {
    // 4 = approved (PayU), undefined = Wompi/PayPal (assume success if redirected back)
    status.value = 'success'
  } else if (txState === '7') {
    status.value = 'pending'
  } else {
    status.value = 'error'
  }

  // Fire purchase_stape if we have pending purchase data and payment was successful
  if (status.value === 'success') {
    const pending = getPendingPurchase()
    if (pending) {
      const user = userAuthStore.profile?.user
      const userData: TrackingUserData = {
        email: user?.email || '',
        phone: (user?.prefix || '') + (user?.num_whatsapp || ''),
        first_name: user?.given_name || '',
        last_name: user?.name ? user.name.replace(user.given_name || '', '').trim() : '',
        country: user?.country || '',
        customer_id: user?.google_id || ''
      }
      trackPurchaseFromPending(
        pending,
        transactionId.value || crypto.randomUUID(),
        userData
      )
    }
  }
})
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full text-center">
      <!-- Success -->
      <template v-if="status === 'success'">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 mb-2">¡Pago exitoso!</h1>
        <p class="text-slate-500 mb-2">Tu compra ha sido procesada correctamente. Ya puedes acceder a tus cursos.</p>
        <p class="text-sm text-emerald-700 font-medium mb-1">
          📩 Te enviamos el recibo por WhatsApp y correo electrónico.
        </p>
        <p v-if="receiptCode" class="text-xs text-slate-400 mb-6">
          N° de orden: <span class="font-mono font-semibold text-slate-600">{{ receiptCode }}</span>
        </p>
        <div v-else class="mb-6"></div>
        <RouterLink to="/mis-courses"
          class="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors no-underline">
          Ir a Mis Cursos
        </RouterLink>
      </template>

      <!-- Pending -->
      <template v-else-if="status === 'pending'">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Pago en proceso</h1>
        <p class="text-slate-500 mb-6">Tu pago esta siendo procesado. Te notificaremos cuando se confirme.</p>
        <RouterLink to="/"
          class="inline-block px-6 py-3 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors no-underline">
          Volver al inicio
        </RouterLink>
      </template>

      <!-- Error -->
      <template v-else>
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Pago no completado</h1>
        <p class="text-slate-500 mb-6">Hubo un problema con tu pago. Por favor intenta nuevamente.</p>
        <RouterLink to="/courses"
          class="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors no-underline">
          Ver cursos
        </RouterLink>
      </template>
    </div>
  </div>
</template>
