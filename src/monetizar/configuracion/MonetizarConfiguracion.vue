<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { authStore } from "../../store/AuthStore";
import { typeAcc } from "../../types/Auth";
import AccountService from "../../services/AccountService";

const storeAuth = authStore();
const DEFAULT_PLACEHOLDER = null;
const saved = ref(false);
const copiado = ref(false);

interface AccountFields {
  nequi: string | null;
  daviplata: string | null;
  llave: string | null;
  cellphone: string | null;
  prefix: string | null;
  codigo_referido: string | null;
}

const accounts = ref<AccountFields>({
  nequi: "",
  daviplata: "",
  llave: "",
  cellphone: "",
  prefix: "+57",
  codigo_referido: "",
});

const errors = ref<Record<keyof AccountFields, boolean>>({
  nequi: false,
  daviplata: false,
  llave: false,
  cellphone: false,
  prefix: false,
  codigo_referido: false,
});

const accountTypes = {
  [typeAcc.nequi]: "Nequi",
  [typeAcc.daviplata]: "Daviplata",
  [typeAcc.llave]: "Llave Electrónica",
};

const fullCellphone = computed(() =>
  `${accounts.value.prefix}${accounts.value.cellphone}`
);

const storedAccounts = computed(() => storeAuth.profile?.user?.accounts || []);
const storedCellphoneInfo = computed(() => ({
  prefix: storeAuth.profile?.user?.prefix || "",
  number: storeAuth.profile?.user?.num_whatsapp || "",
}));

const codigoReferido = computed(() => storeAuth.profile?.user?.codigo_referido || "");

const initializeAccountData = () => {
  const initialData: Partial<AccountFields> = {
    cellphone: storedCellphoneInfo.value.number,
    prefix: storedCellphoneInfo.value.prefix,
    codigo_referido: codigoReferido.value,
  };

  Object.entries(accountTypes).forEach(([type]) => {
    initialData[type as keyof AccountFields] =
      storedAccounts.value.find((a) => a.name_acc === type)?.number_acc ||
      DEFAULT_PLACEHOLDER;
  });

  accounts.value = { ...accounts.value, ...initialData };
};

watch(
  () => storeAuth.profile?.user,
  initializeAccountData,
  { immediate: true, deep: true }
);

const validate = (): boolean => {
  let ok = true;
  if (!accounts.value.prefix) {
    errors.value.prefix = true;
    ok = false;
  } else {
    errors.value.prefix = false;
  }
  if (!accounts.value.cellphone || accounts.value.cellphone === DEFAULT_PLACEHOLDER) {
    errors.value.cellphone = true;
    ok = false;
  } else {
    errors.value.cellphone = false;
  }
  if (!accounts.value.codigo_referido || accounts.value.codigo_referido === DEFAULT_PLACEHOLDER) {
    errors.value.codigo_referido = true;
    ok = false;
  } else {
    errors.value.codigo_referido = false;
  }
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
    return;
  }
  const payload = { ...accounts.value };
  payload.cellphone =
    fullCellphone.value !==
    `${storedCellphoneInfo.value.prefix}${storedCellphoneInfo.value.number}`
      ? fullCellphone.value
      : DEFAULT_PLACEHOLDER;

  // Only send codigo_referido if it changed
  if (payload.codigo_referido === codigoReferido.value) {
    payload.codigo_referido = DEFAULT_PLACEHOLDER;
  }

  Object.keys(accountTypes).forEach((type) => {
    const stored = storedAccounts.value.find((a) => a.name_acc === type);
    if (stored?.number_acc === payload[type as keyof AccountFields]) {
      payload[type as keyof AccountFields] = DEFAULT_PLACEHOLDER;
    }
  });

  await AccountService.updated(payload);
  saved.value = true;
  setTimeout(() => {
    saved.value = false;
  }, 3000);
};

const handleDiscard = () => {
  initializeAccountData();
};

const copyCodigoReferido = () => {
  if (accounts.value.codigo_referido) {
    navigator.clipboard.writeText(accounts.value.codigo_referido);
    copiado.value = true;
    setTimeout(() => {
      copiado.value = false;
    }, 2000);
  }
};
</script>

<template>
  <main class="min-h-screen bg-gray-50 flex flex-col">
    <div class="container mx-auto flex-1 p-4 lg:p-8">
      <!-- Header -->
      <div class="text-center lg:text-left mb-8">
        <h1 class="text-3xl font-bold mb-2">Configuración de Monetización</h1>
        <p class="text-gray-600">
          Administra tu cupón, contacto y métodos de pago para tus ganancias
        </p>
      </div>

      <!-- Success Toast -->
      <transition name="fade">
        <div
          v-if="saved"
          class="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center"
        >
          <p class="text-sm font-medium text-emerald-800">
            ✓ Configuración guardada correctamente
          </p>
        </div>
      </transition>

      <!-- Copied Toast -->
      <transition name="fade">
        <div
          v-if="copiado"
          class="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center"
        >
          <p class="text-sm font-medium text-blue-800">
            ✓ Código copiado al portapapeles
          </p>
        </div>
      </transition>

      <!-- Form Grid -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Cupón de Descuento Card -->
        <div class="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-200/80">
          <h2 class="text-xl font-semibold mb-4">Cupón de Descuento</h2>
          <p class="text-gray-600 mb-6 text-sm">
            Código único que tus clientes pueden usar para obtener descuento
          </p>

          <!-- Código Referido -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tu código referido
            </label>
            <div class="flex gap-2">
              <input
                v-model="accounts.codigo_referido"
                type="text"
                placeholder="Ej: MI_CODIGO_UNICO"
                class="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring focus:ring-emerald-200 font-mono text-sm"
              />
              <button
                @click="copyCodigoReferido"
                class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition font-medium text-sm"
              >
                Copiar
              </button>
            </div>
            <span v-if="errors.codigo_referido" class="text-red-500 text-xs mt-1 block">
              Digite un código referido
            </span>
          </div>

          <!-- Descuento Aplicado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descuento para tus clientes
            </label>
            <div class="flex items-center gap-3">
              <input
                value="10%"
                type="text"
                disabled
                class="flex-1 border border-gray-300 rounded-xl px-4 py-2 bg-gray-100 text-gray-600 font-semibold text-lg"
              />
              <span class="text-emerald-600 font-semibold text-lg">✓</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Descuento fijo aplicado automáticamente a tus clientes
            </p>
          </div>
        </div>

        <!-- WhatsApp Contact Card -->
        <div class="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-200/80">
          <h2 class="text-xl font-semibold mb-4">Contacto WhatsApp</h2>
          <p class="text-gray-600 mb-4 text-sm">
            Datos de contacto para consultas y pagos
          </p>
          <div class="flex items-center space-x-2">
            <select
              v-model="accounts.prefix"
              class="border border-gray-300 rounded-lg focus:ring focus:ring-emerald-200 p-2 text-sm"
            >
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
                class="w-full border border-gray-300 rounded-lg focus:ring focus:ring-emerald-200 p-2"
              />
              <span v-if="errors.cellphone" class="text-red-500 text-xs">
                Digite un valor
              </span>
            </div>
          </div>
        </div>

        <!-- Payment Accounts Card -->
        <div class="md:col-span-2 bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border border-gray-200/80">
          <h2 class="text-xl font-semibold mb-4">Cuentas de Desembolso</h2>
          <p class="text-gray-600 mb-4 text-sm">
            Ingresa tu usuario para cada plataforma (tus ganancias se depositan aquí)
          </p>
          <div class="space-y-4">
            <div
              v-for="(label, type) in accountTypes"
              :key="type"
              class="flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-800">{{ label }}</span>
                <input
                  v-model="accounts[type]"
                  :type="type === typeAcc.llave ? 'text' : 'tel'"
                  :placeholder="
                    type === typeAcc.llave ? 'xxxxxxxxxxxx' : '3001234567'
                  "
                  class="w-1/2 border border-gray-300 rounded-lg focus:ring focus:ring-emerald-200 p-2 text-right text-sm"
                />
              </div>
              <span v-if="errors[type]" class="text-red-500 text-xs self-end mt-1">
                Digite un valor
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex justify-end space-x-4">
        <button
          @click="handleDiscard"
          class="bg-gray-300 text-gray-700 px-6 py-2 rounded-2xl hover:bg-gray-400 transition font-medium"
        >
          Descartar cambios
        </button>
        <button
          @click="handleAccountUpdate"
          class="bg-emerald-600 text-white px-6 py-2 rounded-2xl hover:bg-emerald-700 transition font-medium"
        >
          Guardar
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
