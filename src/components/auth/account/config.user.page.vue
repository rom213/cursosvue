<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { authStore } from '../../../store/AuthStore';
import { typeAcc } from '../../../types/Auth';
import FooterComponent from '../../footer/footer.component.vue';
import AccountService from '../../../services/AccountService';

const storeAuth = authStore();
const DEFAULT_PLACEHOLDER = null;

interface AccountFields {
  nequi: string | null;
  daviplata: string | null;
  llave: string | null;
  cellphone: string | null;
  prefix: string | null;
}

const accounts = ref<AccountFields>({
  nequi: '',
  daviplata: '',
  llave: '',
  cellphone: '',
  prefix: '+57',
});

// objeto de errores: true = muestra error
const errors = ref<Record<keyof AccountFields, boolean>>({
  nequi: false,
  daviplata: false,
  llave: false,
  cellphone: false,
  prefix: false,
});

const accountTypes = {
  [typeAcc.nequi]: 'Nequi',
  [typeAcc.daviplata]: 'Daviplata',
  [typeAcc.llave]: 'Llave Electrónica',
};

const fullCellphone = computed(() =>
  `${accounts.value.prefix}${accounts.value.cellphone}`
);



const storedAccounts = computed(() => storeAuth.profile?.user?.accounts || []);
const storedCellphoneInfo = computed(() => ({
  prefix: storeAuth.profile?.user?.prefix || '',
  number: storeAuth.profile?.user?.num_whatsapp || ''
}));

const initializeAccountData = () => {
  const initialData: Partial<AccountFields> = {
    cellphone: storedCellphoneInfo.value.number,
    prefix: storedCellphoneInfo.value.prefix
  };

  Object.entries(accountTypes).forEach(([type]) => {
    initialData[type as keyof AccountFields] =
      storedAccounts.value.find(a => a.name_acc === type)?.number_acc || DEFAULT_PLACEHOLDER;
  });

    console.log(accounts.value);

  accounts.value = { ...accounts.value, ...initialData };

    console.log(accounts.value);
};

watch(
  () => storeAuth.profile?.user,
  initializeAccountData,
  { immediate: true, deep: true }
);

// función que revisa cada campo
const validate = (): boolean => {
  let ok = true;
  // Validar prefix (aunque prefix nunca será 'null', lo incluimos si quieres)
  if (!accounts.value.prefix) {
    errors.value.prefix = true;
    ok = false;
  } else {
    errors.value.prefix = false;
  }
  // Validar cellphone
  if (!accounts.value.cellphone || accounts.value.cellphone === DEFAULT_PLACEHOLDER) {
    errors.value.cellphone = true;
    ok = false;
  } else {
    errors.value.cellphone = false;
  }
  // Validar cada cuenta de pago
  Object.keys(accountTypes).forEach((type) => {
    const key = type as keyof AccountFields;

    if (!accounts.value[key] || accounts.value[key] === DEFAULT_PLACEHOLDER) {
      errors.value[key] = true;
      ok = false;
    } else {
      errors.value[key] = false;
    }
  });
  return ok;
};

const handleAccountUpdate = async () => {
  if (!validate()) {
    // si hay errores, no se envía
    return;
  }
  // Build payload
  const payload = { ...accounts.value };
  payload.cellphone = fullCellphone.value !== `${storedCellphoneInfo.value.prefix}${storedCellphoneInfo.value.number}`
    ? fullCellphone.value
    : DEFAULT_PLACEHOLDER;

  Object.keys(accountTypes).forEach(type => {
    const stored = storedAccounts.value.find(a => a.name_acc === type);
    if (stored?.number_acc === payload[type as keyof AccountFields]) {
      payload[type as keyof AccountFields] = DEFAULT_PLACEHOLDER;
    }
  });

  await AccountService.updated(payload);
  window.location.href = '/config?is_save=true';
};

const handleCancel = () => {
  window.location.href = '/config?is_cancel=true';
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <main class="container mx-auto flex-1 p-4 lg:p-8">
      <!-- Header -->
      <div class="text-center lg:text-left">
        <h1 class="text-3xl font-bold mb-2">Configura mi Cuenta</h1>
        <p class="text-gray-600">Actualiza tus datos de contacto y cuentas de pago</p>
      </div>

      <!-- Form Grid -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- WhatsApp Contact Card -->
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 class="text-xl font-semibold mb-4">Contacto WhatsApp</h2>
          <p class="text-gray-500 mb-4">Datos opcionales para pagos o consultas</p>
          <div class="flex items-center space-x-2">
            <select v-model="accounts.prefix" class="border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 p-2">
              <option value="+57">🇨🇴 +57</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+44">🇬🇧 +44</option>
            </select>
            <div class="flex-1">
              <input
                v-model="accounts.cellphone"
                type="tel"
                placeholder="3001234567"
                class="w-full border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 p-2"
              />
              <span v-if="errors.cellphone" class="text-red-500 text-sm">Digite un valor</span>
            </div>
          </div>
        </div>

        <!-- Payment Accounts Card -->
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 class="text-xl font-semibold mb-4">Cuentas de Desembolso</h2>
          <p class="text-gray-500 mb-4">Ingresa tu usuario para cada plataforma</p>
          <div class="space-y-4">
            <div
              v-for="(label, type) in accountTypes"
              :key="type"
              class="flex flex-col bg-gray-100 p-3 rounded-lg"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ label }}</span>
                <input
                  v-model="accounts[type]"
                  :type="type === typeAcc.llave ? 'text' : 'tel'"
                  :placeholder="type === typeAcc.llave ? 'xxxxxxxxxxxx' : '3001234567'"
                  class="w-1/2 border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 p-2 text-right"
                />
              </div>
              <span v-if="errors[type]" class="text-red-500 text-sm self-end">Digite un valor</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex justify-end space-x-4">
        <button
          @click="handleCancel"
          class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
        >Cancelar</button>
        <button
          @click="handleAccountUpdate"
          class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >Guardar</button>
      </div>
    </main>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>

<style scoped>
/* Scroll fixer for mobile safari */
html, body, #app {
  height: 100%;
}
</style>
