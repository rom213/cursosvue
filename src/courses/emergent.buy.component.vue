<script lang="ts" setup>
import AuthService from '../services/AuthServices';
import GuestCheckoutService from '../services/GuestCheckoutService';
import { authStore } from '../store/AuthStore';
import { emergentBuyStore } from '../store/EmergentBuyStore';
import { OptionsEmergentBuy, OptionBuyPay } from '../types/Payment';
import AlertNotification from '../components/common/AlertNotification.vue';
import WhatsAppInput from '../components/common/WhatsAppInput.vue';


import { ref, watch, computed, onMounted } from 'vue';
import { useTracking } from '../composables/useTracking';

const storeemergentBuy = emergentBuyStore();
const userAuth = authStore();
const { trackBeginCheckout, trackAddPaymentInfo } = useTracking();

const emailVerified = ref(false);
const tieneCupon = ref(false);
const loadingVerify = ref(false);
const isProcessingPayment = ref(false);
const cupon = ref('');
const guestEmail = ref('');
const guestEmailConfirm = ref('');
const guestEmailError = ref('');
const guestEmailConfirmError = ref('');
const whatsappError = ref('');
const alert = ref({
    show: false,
    message: '',
    type: 'success' // 'success' | 'error' | 'warning'
});

const EMAIL_RE = /^[^@\s]+@gmail\.com$/i;

// Computed properties for Coupon Logic
const couponFullData = computed(() => {
    if (storeemergentBuy.cuponResponse && 
        storeemergentBuy.cuponResponse.status === 'success' && 
        storeemergentBuy.cuponResponse.records && 
        storeemergentBuy.cuponResponse.records.length > 0) {
        return storeemergentBuy.cuponResponse.records[0];
    }
    return null;
});

const finalPrice = computed(() => {
    if (couponFullData.value && couponFullData.value.price) {
        // Ensure we parse it correctly, API returns string usually
        return parseFloat(couponFullData.value.price) || 0; 
    }
    // Fallback to standard price
    return storeemergentBuy.getCategoryEmergent()?.precio || 0;
});

const discountAmount = computed(() => {
    if (couponFullData.value && couponFullData.value.descuento) {
        return couponFullData.value.descuento;
    }
    return 0;
});

const isCouponApplied = computed(() => !!couponFullData.value);
const isOnlyPaypal = computed(() => {
    if (isGuest.value) return false; // guests always use Wompi
    const country = (userAuth.getProfile()?.user?.country || '').toUpperCase();
    return country !== 'CO';
});







const isGuest = computed(() => !userAuth.getProfile());

onMounted(() => {
    const profile = userAuth.getProfile()?.user;
    if (profile?.num_whatsapp) {
        const prefix = profile.prefix || '+57';
        storeemergentBuy.emergentBuy.num_whatsapp = profile.num_whatsapp.startsWith('+')
            ? profile.num_whatsapp
            : `${prefix} ${profile.num_whatsapp}`;
    }
});

const showAlert = (type: string, message: string) => {
    alert.value = { show: true, type, message };
    setTimeout(() => {
        alert.value.show = false;
    }, 4000);
};

const verificarCorreo = async () => {
    if (!storeemergentBuy.emergentBuy.correo) {
        showAlert('warning', 'Por favor ingrese un correo válido.');
        return;
    }
    
    loadingVerify.value = true;
    try {
        const response = await AuthService.verificarEmail(storeemergentBuy.emergentBuy.correo);
        
        if (response.status === 'success') {
             // Validar que el correo no sea el mismo del usuario logueado
             if (userAuth.getProfile()?.user?.email === storeemergentBuy.emergentBuy.correo) {
                showAlert('warning', 'Si es para uso personal, seleccione la opción "Para mi uso personal".');
                emailVerified.value = true;
             } else {
                showAlert('success', 'Correo verificado correctamente. Puede continuar.');
                emailVerified.value = true;
                storeemergentBuy.emergentBuy.user_google_id = response.records[0].google_id;
             }
        } else {
            showAlert('error', response.message || 'El correo no es válido o no existe en Google.');
            emailVerified.value = false;
        }
    } catch (e) {
        showAlert('error', 'Ocurrió un error al verificar el correo.');
        emailVerified.value = false;
    } finally {
        loadingVerify.value = false;
    }
};

const resetVerification = () => {
    emailVerified.value = false;
    storeemergentBuy.emergentBuy.correo = '';
};

const handleBuy = async () => {
    if (isProcessingPayment.value) return;

    // Validar WhatsApp obligatorio
    const wa = storeemergentBuy.emergentBuy.num_whatsapp;
    if (!wa || wa.replace(/\D/g, '').length < 7) {
        whatsappError.value = 'Ingresa un número de WhatsApp válido para recibir el recibo.';
        showAlert('error', whatsappError.value);
        return;
    }
    whatsappError.value = '';

    // Flujo guest: registrar usuario TERCERO primero
    if (isGuest.value) {
        const email = guestEmail.value.trim().toLowerCase();
        const emailConfirm = guestEmailConfirm.value.trim().toLowerCase();

        if (!email || !EMAIL_RE.test(email)) {
            guestEmailError.value = 'Ingresa un correo Gmail válido (ejemplo@gmail.com).';
            showAlert('error', guestEmailError.value);
            return;
        }
        guestEmailError.value = '';

        if (!emailConfirm || emailConfirm !== email) {
            guestEmailConfirmError.value = 'Los correos no coinciden.';
            showAlert('error', guestEmailConfirmError.value);
            return;
        }
        guestEmailConfirmError.value = '';

        isProcessingPayment.value = true;
        // Para guests siempre usar Wompi
        storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Wompi;
        const regResult = await GuestCheckoutService.register({ email, num_whatsapp: wa });
        if (!regResult?.google_id) {
            showAlert('error', 'No pudimos registrarte. Verifica el correo e intenta de nuevo.');
            isProcessingPayment.value = false;
            return;
        }
        storeemergentBuy.emergentBuy.guest_email = email;
        storeemergentBuy.emergentBuy.guest_google_id = regResult.google_id;
    }

    if (storeemergentBuy.emergentBuy.optionsEmergentBuy === OptionsEmergentBuy.UserExternal) {
        if (!emailVerified.value) {
            showAlert('error', 'Debe verificar el correo del beneficiario antes de realizar la compra.');
            isProcessingPayment.value = false;
            return;
        }
    }
    if (isOnlyPaypal.value) {
        storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Paypal;
    }
    isProcessingPayment.value = true;
    const cat = storeemergentBuy.getCategoryEmergent();
    if (cat) {
      const price = finalPrice.value;
      const payMethod = storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Paypal ? 'PayPal'
        : storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Wompi ? 'Wompi' : 'PayU';
      trackBeginCheckout([cat], price);
      trackAddPaymentInfo([cat], price, payMethod);
    }
    storeemergentBuy.buyCategory();
    // Si hay fallo y no hay redirección, desbloquea UI para reintento.
    window.setTimeout(() => {
        isProcessingPayment.value = false;
    }, 7000);
};

const verificarCupon = (cupon: string) => {
    if (!cupon) {
        showAlert('error', 'Debe ingresar un cupón válido.');
        return;
    }
    console.log(cupon);
    console.log('rommmario');
    storeemergentBuy.validarCupon(cupon).then((res) => {
        if(res?.status === 'success') {
             showAlert('success', 'Cupón aplicado correctamente.');
        } else {
             showAlert('error', res?.message || 'Cupón inválido.');
        }
    });
};

// Reset verification if email changes manually
watch(() => storeemergentBuy.emergentBuy.correo, () => {
    emailVerified.value = false;
});

// Watch toggling coupon checkbox
watch(()=>tieneCupon.value, (newVal)=>{
    if(newVal){
        storeemergentBuy.handleChangeOptionsEmergentBuy(OptionsEmergentBuy.UserInternalCupon);
    } else {
        // If unchecking, revert to standard Internal if we were in Cupon mode
        if (storeemergentBuy.emergentBuy.optionsEmergentBuy === OptionsEmergentBuy.UserInternalCupon) {
             storeemergentBuy.handleChangeOptionsEmergentBuy(OptionsEmergentBuy.UserInternal);
        }
        cupon.value = ''; // Reset coupon input
        storeemergentBuy.clearCupon(); // Clear store state
    }
});

// Watch option selection to enforce rules
watch(() => storeemergentBuy.emergentBuy.optionsEmergentBuy, (newVal) => {
    if (newVal === OptionsEmergentBuy.UserExternal) {
        tieneCupon.value = false;
        cupon.value = '';
    }
});

watch(()=>storeemergentBuy.emergentBuy.emergent, ()=>{
    if(userAuth.nameAffiliaty){
        tieneCupon.value = true;
        cupon.value = userAuth.getCupoCode();
        verificarCupon(userAuth.getCupoCode());
    }
    if (isOnlyPaypal.value) {
        storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Paypal;
    }
})

</script>

<template>
    <div v-if="storeemergentBuy.emergentBuy.emergent"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <!-- Header -->
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                <h3 class="text-gray-800 font-bold text-lg">Personaliza tu compra</h3>
                <button @click="storeemergentBuy.handleEmergentBuy()" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="p-6 overflow-y-auto space-y-6">
                
                <div v-if="!isGuest" class="text-sm text-gray-500 font-medium">
                    ¿Quién tendrá acceso al curso?
                </div>

                <!-- Selection Cards (solo logueados) -->
                <div v-if="!isGuest" class="space-y-3">
                    
                    <!-- Option 1: Internal User -->
                    <div
                        v-if="!storeemergentBuy.esVentaTercero" 
                        @click="storeemergentBuy.handleChangeOptionsEmergentBuy(OptionsEmergentBuy.UserInternal)"
                        class="cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 relative group"
                        :class="[
                            storeemergentBuy.emergentBuy.optionsEmergentBuy !== OptionsEmergentBuy.UserExternal 
                            ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/20' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        ]"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-gray-800" :class="{'text-emerald-700': storeemergentBuy.emergentBuy.optionsEmergentBuy !== OptionsEmergentBuy.UserExternal}">Para mi uso personal</span>
                            <div v-if="storeemergentBuy.emergentBuy.optionsEmergentBuy !== OptionsEmergentBuy.UserExternal" class="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div v-else class="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                        </div>
                        
                        <div class="flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-md shadow-sm">
                             <div class="flex-shrink-0">
                                <!-- User Icon / Avatar Placeholder -->
                                <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div class="text-sm text-gray-600 font-medium truncate">
                                {{ userAuth.getProfile()?.user?.email }}
                            </div>
                        </div>
                    </div>

                    <!-- Option 2: External User -->
                    <div 
                        @click="storeemergentBuy.handleChangeOptionsEmergentBuy(OptionsEmergentBuy.UserExternal)"
                        class="cursor-pointer border-2 rounded-lg p-4 transition-all duration-200"
                        :class="[
                            storeemergentBuy.emergentBuy.optionsEmergentBuy === OptionsEmergentBuy.UserExternal 
                            ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/20' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        ]"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <span class="font-bold text-gray-800" :class="{'text-emerald-700': storeemergentBuy.emergentBuy.optionsEmergentBuy === OptionsEmergentBuy.UserExternal}">Para otra persona (Regalo/Venta)</span>
                            <div v-if="storeemergentBuy.emergentBuy.optionsEmergentBuy === OptionsEmergentBuy.UserExternal" class="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div v-else class="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                        </div>

                        <!-- Email Input for External -->
                       <div @click.stop class="space-y-2">
                             <div class="relative">
                                <input 
                                    v-model="storeemergentBuy.emergentBuy.correo" 
                                    :disabled="emailVerified"
                                    :class="[
                                        'w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors',
                                        emailVerified ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                    ]"
                                    placeholder="Correo electrónico del beneficiario" 
                                    type="email" 
                                >
                                <div v-if="emailVerified" class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            
                            <div v-if="storeemergentBuy.emergentBuy.optionsEmergentBuy === OptionsEmergentBuy.UserExternal">
                                <button v-if="!emailVerified" @click="verificarCorreo()" :disabled="loadingVerify" class="w-full bg-slate-800 text-white text-sm font-semibold py-2 rounded-md hover:bg-slate-700 transition-colors flex justify-center items-center">
                                    <span v-if="loadingVerify" class="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                    {{ loadingVerify ? 'Verificando...' : 'Verificar correo del beneficiario' }}
                                </button>
                                <button v-else @click="resetVerification()" class="w-full bg-white border border-gray-300 text-gray-700 text-sm font-semibold py-2 rounded-md hover:bg-gray-50 transition-colors">
                                    Cambiar destinatario
                                </button>
                            </div>
                       </div>
                    </div>
                </div>

                <!-- Coupon Section (Internal Only, only for logged-in users) -->
                <div v-if="!isGuest && storeemergentBuy.emergentBuy.optionsEmergentBuy !== OptionsEmergentBuy.UserExternal" class="pt-2 border-t border-gray-100">
                    <label class="flex items-center gap-3 cursor-pointer group mb-3">
                        <div class="relative flex items-center">
                            <input type="checkbox" v-model="tieneCupon" class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-emerald-600 checked:bg-emerald-600 hover:border-emerald-500">
                            <svg class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Tengo un cupón de descuento</span>
                        
                        <!-- Success Badge -->
                        <span v-if="isCouponApplied" class="ml-auto inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                            Aplicado
                        </span>
                    </label>

                    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform -translate-y-2 opacity-0">
                        <div v-if="tieneCupon" class="flex flex-col gap-2">
                             <div class="flex gap-2">
                                <input type="text" v-model="cupon" placeholder="Código del cupón" class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase">
                                <button @click="verificarCupon(cupon)" class="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                                    Aplicar
                                </button>
                            </div>
                            
                            <!-- Discount Details -->
                            <div v-if="isCouponApplied" class="flex justify-between items-center text-sm bg-emerald-50 p-2 rounded border border-emerald-100">
                                <span class="text-gray-600">Descuento aplicado:</span>
                                <span class="font-bold text-emerald-700">- ${{ discountAmount?.toLocaleString() || 0 }}</span>
                            </div>
                        </div>
                    </transition>
                </div>

            <!-- WhatsApp (siempre obligatorio) -->
            <div class="pt-4 border-t border-gray-100">
                <WhatsAppInput
                    v-model="storeemergentBuy.emergentBuy.num_whatsapp"
                    :disabled="isProcessingPayment"
                    :error="whatsappError"
                />
            </div>

            <!-- Formulario guest (solo sin sesión) -->
            <div
                v-if="isGuest"
                class="space-y-3"
            >
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
                    />
                    <p v-if="guestEmailConfirmError" class="text-xs text-red-500 mt-1">{{ guestEmailConfirmError }}</p>
                    <p v-else class="text-xs text-gray-400 mt-1">Recibirás el recibo y acceso a tus cursos aquí.</p>
                </div>
            </div>

            <div v-if="!isGuest" class="pt-4 border-t border-gray-100 space-y-4">
                 <div class="text-sm text-gray-500 font-medium">
                    Selecciona tu método de pago
                </div>
                <div class="flex gap-3">
                    <!-- PayU Option -->
                    <!-- <div 
                        v-if="!isOnlyPaypal"
                        @click="storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.PayU"
                        class="cursor-pointer w-full border-2 rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 relative"
                        :class="[
                            storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.PayU 
                            ? 'border-emerald-600 bg-emerald-50/30' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        ]"
                    >
                        <div v-if="storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.PayU" class="absolute top-2 right-2 text-emerald-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="h-8 w-8 text-gray-700">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <span class="text-sm font-bold text-gray-700">Tarjeta / PSE</span>
                    </div> -->
                    
                    <!-- WOMPY -->
                    <div 
                        v-if="!isOnlyPaypal"
                        @click="storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Wompi"
                        class="cursor-pointer w-full border-2 rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 relative"
                        :class="[
                            storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Wompi 
                            ? 'border-emerald-600 bg-emerald-50/30' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        ]"
                    >
                        <div v-if="storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Wompi" class="absolute top-2 right-2 text-emerald-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <!-- Métodos Wompi -->
                        <div class="flex flex-wrap justify-center gap-1.5">
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:#3B3F8C;">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path fill="white" d="M9 8l3 3-3 3M12 11h3" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
                            Nequi
                          </span>
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-900" style="background:#FDCD00;">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="5" width="20" height="14" rx="2"/><path fill="#FDCD00" d="M2 9h20"/></svg>
                            Bancolombia
                          </span>
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:#E3001B;">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/></svg>
                            Daviplata
                          </span>
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:linear-gradient(135deg,#1A56DB 0%,#F5A623 100%);">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            Tarjeta
                          </span>
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style="background:#00693C;">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3z" rx="2"/><text x="3" y="16" font-size="9" fill="white" font-weight="bold">PSE</text></svg>
                            PSE
                          </span>
                        </div>
                    </div>                  

                    <!-- PayPal Option -->
                    <div 
                        @click="storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Paypal"
                        class="cursor-pointer w-full border-2 rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 relative"
                         :class="[
                            storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Paypal 
                            ? 'border-blue-500 bg-blue-50/30' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        ]"
                    >
                         <div v-if="storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Paypal" class="absolute top-2 right-2 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <!-- PayPal Icon (SVG) -->
                         <div class="h-8 w-8 text-[#003087]">
                           <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.076 19.95L8.237 12.65H5.80801L4.646 19.95H7.076Z" fill="#003087"/>
                                <path d="M11.238 12.65L12.399 5.35H9.97001L8.80798 12.65H11.238Z" fill="#003087"/>
                                <path d="M15.111 20.354C15.111 20.354 15.11 20.354 15.109 20.353C16.892 19.467 18.238 17.587 18.238 14.869C18.238 11.258 15.341 8.35999 11.751 8.35999H9.36298L8.148 16H10.578L10.748 14.931H11.751C13.829 14.931 15.529 13.251 15.529 11.173C15.529 10.038 15.035 9.02798 14.254 8.35999C17.076 8.78999 18.914 11.458 18.914 14.869C18.914 17.151 17.94 19.165 16.488 20.25L15.111 20.354Z" fill="#003087"/>
                                <path d="M9.36295 2H14.139C17.729 2 20.656 4.898 20.656 8.509C20.656 12.12 17.729 15.018 14.139 15.018H11.709L12.871 7.718H15.301C16.463 7.718 17.399 6.782 17.399 5.62C17.399 4.458 16.463 3.522 15.301 3.522H11.729L9.36295 2Z" fill="#009CDE"/>
                                <path d="M3.46399 19.95H5.894L7.05601 12.65H8.21701L9.379 5.35H5.792C4.629 5.35 3.693 6.286 3.693 7.448C3.693 7.55 3.699 7.65 3.712 7.748L3.46399 19.95Z" fill="#253B80"/>
                            </svg>
                        </div>
                         <span class="text-sm font-bold text-gray-700" :class="{'text-blue-600': storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Paypal}">PayPal</span>
                    </div>

                </div>
                <p v-if="isOnlyPaypal" class="text-xs text-blue-600 font-medium">
                    Tu región usa PayPal como método disponible. Al pagar te redirigimos automáticamente.
                </p>
            </div>

            </div>

            <!-- Footer / Action -->
            <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
                 <!-- Price Summary -->
                 <div v-if="isCouponApplied && storeemergentBuy.emergentBuy.optionsEmergentBuy !== OptionsEmergentBuy.UserExternal" class="flex justify-between items-end mb-3 px-1">
                    <span class="text-sm text-gray-500 line-through decoration-red-500">
                        {{ storeemergentBuy.getCategoryEmergent()?.precio_desc }}
                    </span>
                    <span class="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                        Ahorras ${{ discountAmount?.toLocaleString() || 0 }}
                    </span>
                 </div>

                <!-- Botón Wompi (guest o usuario CO) -->
                <button
                    v-if="isGuest || storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Wompi"
                    @click="handleBuy()"
                    :disabled="isProcessingPayment"
                    class="w-full rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] px-4 py-3 flex flex-col items-center gap-2 shadow-md shadow-emerald-200"
                >
                    <div class="flex items-center gap-2 w-full justify-center">
                        <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7V7a2 2 0 00-2-2H7a2 2 0 00-2 2v3m14 0H5m14 0a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2"/>
                        </svg>
                        <span class="font-extrabold text-emerald-800 text-base">
                            {{ isProcessingPayment ? 'Lo estamos alistando...' : `Pagar $${finalPrice?.toLocaleString() || 0}` }}
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

                <!-- Botón PayPal -->
                <button
                    v-else-if="storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Paypal"
                    @click="handleBuy()"
                    :disabled="isProcessingPayment"
                    class="w-full rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] px-4 py-3 flex items-center justify-center gap-3 shadow-md shadow-blue-200"
                >
                    <div class="h-6 w-6 text-[#003087] shrink-0">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 19.95L8.237 12.65H5.80801L4.646 19.95H7.076Z" fill="#003087"/><path d="M11.238 12.65L12.399 5.35H9.97001L8.80798 12.65H11.238Z" fill="#003087"/><path d="M9.36295 2H14.139C17.729 2 20.656 4.898 20.656 8.509C20.656 12.12 17.729 15.018 14.139 15.018H11.709L12.871 7.718H15.301C16.463 7.718 17.399 6.782 17.399 5.62C17.399 4.458 16.463 3.522 15.301 3.522H11.729L9.36295 2Z" fill="#009CDE"/></svg>
                    </div>
                    <span class="font-extrabold text-[#003087] text-base">
                        {{ isProcessingPayment ? 'Lo estamos alistando...' : `Pagar $${finalPrice?.toLocaleString() || 0} con PayPal` }}
                    </span>
                    <span v-if="isProcessingPayment" class="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></span>
                </button>

                <!-- Botón genérico fallback -->
                <button
                    v-else
                    @click="handleBuy()"
                    :disabled="isProcessingPayment"
                    class="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg py-3 rounded-lg transition-all transform active:scale-[0.99] flex justify-center items-center"
                >
                    <span>{{ isProcessingPayment ? 'Lo estamos alistando...' : `Pagar $${finalPrice?.toLocaleString() || 0}` }}</span>
                </button>

                <div class="text-center mt-3">
                    <p class="text-xs text-gray-400">
                        Al continuar aceptas nuestros <a href="#" class="underline hover:text-gray-600">Términos y Condiciones</a>.
                    </p>
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

    <!-- Alert Notification (Toast) -->
    <AlertNotification 
        :show="alert.show" 
        :type="alert.type" 
        :message="alert.message" 
        @close="alert.show = false" 
    />
</template>