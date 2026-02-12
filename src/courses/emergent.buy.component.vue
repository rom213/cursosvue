<script lang="ts" setup>
import AuthService from '../services/AuthServices';
import { authStore } from '../store/AuthStore';
import { emergentBuyStore } from '../store/EmergentBuyStore';
import { OptionsEmergentBuy } from '../types/Payment';
import AlertNotification from '../components/common/AlertNotification.vue';

import { ref, watch, computed } from 'vue';

const storeemergentBuy = emergentBuyStore();
const userAuth = authStore();

const emailVerified = ref(false);
const tieneCupon = ref(false);
const loadingVerify = ref(false);
const cupon = ref('');
const alert = ref({
    show: false,
    message: '',
    type: 'success' // 'success' | 'error' | 'warning'
});

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

const handleBuy = () => {
    if (storeemergentBuy.emergentBuy.optionsEmergentBuy === OptionsEmergentBuy.UserExternal) {
        if (!emailVerified.value) {
            showAlert('error', 'Debe verificar el correo antes de realizar la compra.');
            return;
        }
    }
    storeemergentBuy.buyCategory();
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
                
                <div class="text-sm text-gray-500 font-medium">
                    ¿Quién tendrá acceso al curso?
                </div>

                <!-- Selection Cards -->
                <div class="space-y-3">
                    
                    <!-- Option 1: Internal User -->
                    <div 
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

                <!-- Coupon Section (Internal Only) -->
                <div v-if="storeemergentBuy.emergentBuy.optionsEmergentBuy !== OptionsEmergentBuy.UserExternal" class="pt-2 border-t border-gray-100">
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

            </div>

            <!-- Footer / Action -->
            <div class="p-6 bg-gray-50 border-t border-gray-100">
                 <!-- Price Summary -->
                 <div v-if="isCouponApplied && storeemergentBuy.emergentBuy.optionsEmergentBuy !== OptionsEmergentBuy.UserExternal" class="flex justify-between items-end mb-3 px-1">
                    <span class="text-sm text-gray-500 line-through decoration-red-500">
                        ${{ storeemergentBuy.getCategoryEmergent()?.precio_desc?.toLocaleString() || 0 }}
                    </span>
                    <span class="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                        Ahorras ${{ discountAmount?.toLocaleString() || 0 }}
                    </span>
                 </div>

                 <button @click="handleBuy()" class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-lg py-3 rounded-lg shadow-lg shadow-emerald-700/20 transition-all transform active:scale-[0.99] flex justify-center items-center">
                    <span>Pagar </span>
                    <span class="ml-2 bg-emerald-800/50 px-2 py-0.5 rounded text-sm">
                        ${{ finalPrice?.toLocaleString() || 0 }}
                    </span>
                </button>
                <div class="text-center mt-3">
                    <p class="text-xs text-gray-400">
                        Al continuar aceptas nuestros <a href="#" class="underline hover:text-gray-600">Términos y Condiciones</a>.
                    </p>
                </div>
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