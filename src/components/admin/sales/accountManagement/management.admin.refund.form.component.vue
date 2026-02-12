<script setup lang="ts">
import { onMounted, ref } from "vue";
import { AdminRefundService } from "../../../../services/AdminService";
import type { IFormRefundAdmin } from "../../../../types/admin/FormAdmin";
import type { IAccount } from "../../../../types/Auth";
import UserService from "../../../../services/UserService";

const props = defineProps<{ date_init: string,  date_end: string, google_id: string, list_ids_refers: number[], amount_to_pay: number }>();
const emit = defineEmits(['close', 'saved']);

const getFechaCorta = (fecha: Date) => {
    return fecha.toISOString().split("T")[0];
}

const isLoadingCode = ref(false);
const notification = ref<{ message: string, type: 'success' | 'error' | null }>({ message: '', type: null });
const listAccounts = ref<IAccount[]>([]);

const formRefund = ref<IFormRefundAdmin>({
    date_init: getFechaCorta(new Date(props.date_init)),
    date_end: getFechaCorta(new Date(props.date_end)),
    google_id: props.google_id,
    type_acc_em: "",
    titular_acc_em: "",
    number_acc_em: "",
    type_acc_re: "",
    titular_acc_res: "",
    image: null,
    code_reference: "",
    number_acc_res: "",
    verification_code: "",
    list_ids_refers: []
})

const showNotification = (message: string, type: 'success' | 'error') => {
    notification.value = { message, type };
    setTimeout(() => {
        notification.value = { message: '', type: null };
    }, 5000);
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        formRefund.value.image = target.files[0];
    } else {
        formRefund.value.image = null;
    }
}

const fetchAccounts = async (google_id:string) => {
  try {
    const res = await UserService.getAccountsByGoogleId(google_id);
    if (res.data.status === "success" || res.data.records) {
      listAccounts.value = res.data.records[0];
    }
  } catch (err) {
    console.error(err);
  }
}

const selectAccount = (account: IAccount) => {
    formRefund.value.type_acc_re = account.name_acc;
    formRefund.value.number_acc_res = account.number_acc;
}

const saveRefund = async() => {
    // Validation
    if (!formRefund.value.google_id || 
        !formRefund.value.code_reference || 
        !formRefund.value.verification_code ||
        !formRefund.value.type_acc_em ||
        !formRefund.value.titular_acc_em ||
        !formRefund.value.number_acc_em ||
        !formRefund.value.type_acc_re ||
        !formRefund.value.titular_acc_res ||
        !formRefund.value.number_acc_res ||
        !formRefund.value.image) {
        
        showNotification('Todos los campos son obligatorios, incluyendo el comprobante.', 'error');
        return;
    }

    let formData = new FormData();
    formData.append('date_init', formRefund.value.date_init);
    formData.append('date_end', formRefund.value.date_end);
    formData.append('google_id', formRefund.value.google_id);
    formData.append('type_acc_em', formRefund.value.type_acc_em);
    formData.append('titular_acc_em', formRefund.value.titular_acc_em);
    formData.append('number_acc_em', formRefund.value.number_acc_em);
    formData.append('type_acc_re', formRefund.value.type_acc_re);
    formData.append('titular_acc_res', formRefund.value.titular_acc_res);
    formData.append('image', formRefund.value.image);
    formData.append('code_reference', formRefund.value.code_reference);
    formData.append('number_acc_res', formRefund.value.number_acc_res);
    formData.append('verification_code', formRefund.value.verification_code);
    formData.append('list_ids_refers', JSON.stringify(props.list_ids_refers));

    const res = await AdminRefundService.createRefund(formData)
    if (res.status === 'success') {
        showNotification('Reembolso creado correctamente.', 'success');
        emit('saved'); // Emit event to notify parent
        setTimeout(() => {
            closeForm();
        }, 2000); // Wait 2s to show message
    } else {
        showNotification('Error al crear el reembolso.', 'error');
    }
}

const refreshCode = async () => {
    isLoadingCode.value = true;
    notification.value = { message: '', type: null };
    try {
        const res = await AdminRefundService.gen();
        if (res.status === 'success') {
             showNotification('Código de verificación enviado correctamente.', 'success');
        } else {
             showNotification('Error al solicitar el código.', 'error');
        }
    } catch (error) {
        showNotification('Ocurrió un error al solicitar el código.', 'error');
    } finally {
        isLoadingCode.value = false;
    }
}

const closeForm = () => {
    emit('close');
}

onMounted(()=>{
    console.log(props.google_id);
    fetchAccounts(props.google_id);
})

</script>

<template>
    <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div class="absolute inset-0 bg-gray-900 opacity-50" @click="closeForm"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="bg-white p-6 pb-2 border-b flex justify-between items-start">
                 <div>
                    <h1 class="text-2xl font-bold text-gray-800">Formulario de Reembolso</h1>
                     <p v-if="props.amount_to_pay" class="text-gray-500 mt-1">
                        Monto a reembolsar: <span class="text-xl font-bold text-green-600">${{ props.amount_to_pay.toLocaleString() }}</span>
                    </p>
                 </div>
                <button @click="closeForm" class="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 dark:bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Form Content -->
            <div class="p-8 overflow-y-auto custom-scrollbar relative">
                
                <!-- Notification Banner -->
                <div v-if="notification.message" :class="[
                    'mb-6 p-4 rounded-lg flex items-center justify-between transition-all duration-300',
                    notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                ]">
                    <div class="flex items-center gap-3">
                        <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                        <span class="font-medium">{{ notification.message }}</span>
                    </div>
                    <button @click="notification = { message: '', type: null }" class="hover:opacity-75">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="saveRefund" class="space-y-6">
                    
                    <!-- Section: Información General -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Información General</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="google_id" class="block text-sm font-medium text-gray-700 mb-1">Google ID <span class="text-red-500">*</span></label>
                                <input type="text" id="google_id" v-model="formRefund.google_id" disabled
                                    class="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-600 cursor-not-allowed focus:outline-none" />
                            </div>
                            <div>
                                <label for="code_reference" class="block text-sm font-medium text-gray-700 mb-1">Código de Referencia <span class="text-red-500">*</span></label>
                                <input type="text" id="code_reference" v-model="formRefund.code_reference"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <!-- Section: Cuenta Emisor -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Cuenta Emisor</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label for="type_acc_em" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta <span class="text-red-500">*</span></label>
                                <input type="text" id="type_acc_em" v-model="formRefund.type_acc_em"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                            </div>
                            <div>
                                <label for="titular_acc_em" class="block text-sm font-medium text-gray-700 mb-1">Titular <span class="text-red-500">*</span></label>
                                <input type="text" id="titular_acc_em" v-model="formRefund.titular_acc_em"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                            </div>
                            <div>
                                <label for="number_acc_em" class="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta <span class="text-red-500">*</span></label>
                                <input type="text" id="number_acc_em" v-model="formRefund.number_acc_em"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <!-- Section: Cuenta Receptor -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Cuenta Receptor</h3>
                         
                         <!-- Cuentas Disponibles -->
                        <div v-if="listAccounts.length > 0" class="mb-6">
                            <p class="text-sm font-medium text-gray-600 mb-3">Seleccionar cuenta guardada:</p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div 
                                    v-for="acc in listAccounts" 
                                    :key="acc.id" 
                                    @click="selectAccount(acc)"
                                    class="cursor-pointer border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-all group relative overflow-hidden"
                                >
                                    <div class="absolute top-0 left-0 w-1 h-full bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                                    <div class="flex items-center gap-3">
                                        <div class="bg-blue-100 text-blue-600 p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-semibold text-gray-700 text-sm capitalize">{{ acc.name_acc }}</p>
                                            <p class="text-xs text-gray-500">{{ acc.number_acc }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label for="type_acc_re" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta <span class="text-red-500">*</span></label>
                                <input type="text" id="type_acc_re" v-model="formRefund.type_acc_re"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                            </div>
                            <div>
                                <label for="titular_acc_res" class="block text-sm font-medium text-gray-700 mb-1">Titular <span class="text-red-500">*</span></label>
                                <input type="text" id="titular_acc_res" v-model="formRefund.titular_acc_res"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                            </div>
                            <div>
                                <label for="number_acc_res" class="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta <span class="text-red-500">*</span></label>
                                <input type="text" id="number_acc_res" v-model="formRefund.number_acc_res"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <!-- Section: Verificación y Comprobante -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Verificación y Comprobante</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="image" class="block text-sm font-medium text-gray-700 mb-1">Comprobante (Imagen) <span class="text-red-500">*</span></label>
                                <input type="file" id="image" @change="handleFileUpload" accept="image/*"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>
                            <div>
                                <label for="verification_code" class="block text-sm font-medium text-gray-700 mb-1">Código de Verificación <span class="text-red-500">*</span></label>
                                <div class="flex gap-2">
                                    <input type="text" id="verification_code" v-model="formRefund.verification_code"
                                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                                    <button type="button" @click="refreshCode" :disabled="isLoadingCode"
                                        class="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 font-medium py-2 px-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        title="Solicitar Nuevo Código">
                                        <svg v-if="!isLoadingCode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <svg v-else class="animate-spin h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                                
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end pt-6 border-t mt-6">
                        <button type="button" @click="closeForm" class="mr-4 px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 font-medium">
                            Guardar Reembolso
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c7c7c7;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>