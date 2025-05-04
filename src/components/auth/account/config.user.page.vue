<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { authStore } from '../../../store/AuthStore';
import { typeAcc } from '../../../types/Auth';
import FooterComponent from '../../footer/footer.component.vue';
import AccountService from '../../../services/AccountService';

const storeAuth = authStore();
const DEFAULT_PLACEHOLDER = 'null';

interface AccountFields {
  nequi: string;
  daviplata: string;
  llave: string;
  cellphone: string;
  prefix: string;
}

const accounts = ref<AccountFields>({
  nequi: '',
  daviplata: '',
  llave: '',
  cellphone: '',
  prefix: '+57',
});

const accountTypes = {
  [typeAcc.nequi]: 'Nequi',
  [typeAcc.daviplata]: 'Daviplata',
  [typeAcc.llave]: 'Llave'
};

const fullCellphone = computed(() => 
  `${accounts.value.prefix} ${accounts.value.cellphone}`
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

  accounts.value = { ...accounts.value, ...initialData };
};

const shouldUpdateField = (currentValue: string, storedValue?: string) => 
  currentValue !== (storedValue || DEFAULT_PLACEHOLDER);

const handleAccountUpdate = async () => {
  const originalCellphone = accounts.value.cellphone;
  const payload = { ...accounts.value };
  

  console.log(fullCellphone.value, `${storedCellphoneInfo.value.prefix} ${storedCellphoneInfo.value.number}` );

  if (fullCellphone.value === `${storedCellphoneInfo.value.prefix} ${storedCellphoneInfo.value.number}`) {
    payload.cellphone = DEFAULT_PLACEHOLDER;
  }else
  {
    payload.cellphone= `${payload.prefix} ${payload.cellphone}`
  }


  Object.keys(accountTypes).forEach(type => {
    const stored = storedAccounts.value.find(a => a.name_acc === type);


    if (stored?.number_acc === payload[type as keyof AccountFields]) {
      payload[type as keyof AccountFields] = DEFAULT_PLACEHOLDER;
    }
  });
  await AccountService.updated(payload);
  accounts.value.cellphone = originalCellphone;
  window.location.href = '/config?isSuccess=true';
};

const handleCancel = () => {
  window.location.href = '/config?is_cancel=true';
};

watch(
  () => storeAuth.profile?.user,
  initializeAccountData,
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="mt-3 px-5 grid gap-2">
    <div class="flex justify-center items-center text-2xl font-semibold gap-3">
      <h3>Configura mi cuenta</h3>
      <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Icono original preservado -->
        <g clip-path="url(#clip0_624_651)">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M24.6667 13.9049V15.5765C25.2019 15.7175 25.7079 15.9327 26.1717 16.2118L27.3325 15.0287L29.396 17.1293L28.2337 18.3109C28.5079 18.783 28.7194 19.2981 28.8579 19.8429H30.5V22.812H28.8579C28.7194 23.3568 28.5079 23.8719 28.2337 24.344L29.396 25.5256L27.3325 27.6262L26.1717 26.4431C25.7017 26.7255 25.1951 26.9394 24.6667 27.0784V28.75H21.75V27.0784C21.2216 26.9394 20.715 26.7255 20.245 26.4431L19.0842 27.6262L17.0206 25.5256L18.1829 24.344C17.9055 23.8655 17.6954 23.3498 17.5588 22.812H15.9167V19.8429H17.5588C17.6973 19.2981 17.9088 18.783 18.1829 18.3109L17.0206 17.1293L19.0842 15.0287L20.245 16.2118C20.715 15.9294 21.2216 15.7155 21.75 15.5765V13.9049H24.6667ZM25.2588 19.2165L25.2821 19.2402C25.7983 19.7717 26.1192 20.5021 26.125 21.3067V21.3482C26.1212 21.9328 25.9479 22.5033 25.6269 22.988C25.3058 23.4727 24.8514 23.8502 24.3205 24.0731C23.7896 24.296 23.2058 24.3544 22.6424 24.241C22.0791 24.1275 21.5611 23.8473 21.1535 23.4355L21.139 23.4176C20.6073 22.8581 20.3127 22.1083 20.3188 21.3298C20.3249 20.5513 20.6312 19.8064 21.1716 19.2556C21.712 18.7047 22.4433 18.3919 23.208 18.3846C23.9728 18.3773 24.7083 18.676 25.2588 19.2165ZM7.16667 10.9359C7.16696 10.1121 7.33563 9.29741 7.66195 8.54358C7.98827 7.78975 8.46511 7.11329 9.06213 6.55719C9.65916 6.00109 10.3633 5.57753 11.1299 5.31344C11.8964 5.04934 12.7085 4.95048 13.5146 5.02315C14.3207 5.09582 15.1031 5.33843 15.8121 5.73555C16.5211 6.13266 17.1412 6.67561 17.6329 7.32986C18.1246 7.9841 18.4773 8.73535 18.6684 9.53582C18.8595 10.3363 18.8848 11.1685 18.7429 11.9795C16.6883 13.0001 15.0278 14.6904 14.0252 16.7819C13.1856 16.9345 12.3233 16.8978 11.4992 16.6744C10.675 16.451 9.90895 16.0464 9.25503 15.489C8.60112 14.9316 8.07522 14.2351 7.7144 13.4484C7.35358 12.6617 7.16661 11.8041 7.16667 10.9359ZM13.4229 18.3584H10.0833C8.53624 18.3584 7.05251 18.984 5.95854 20.0976C4.86458 21.2112 4.25 22.7216 4.25 24.2965V25.781C4.25 26.5684 4.55729 27.3236 5.10427 27.8804C5.65125 28.4372 6.39312 28.75 7.16667 28.75H16.064C15.0926 27.7835 14.321 26.6288 13.7948 25.354C13.2686 24.0793 12.9984 22.7102 13 21.3274C13 20.2957 13.1473 19.2996 13.4229 18.3584Z"
            fill="black" />
        </g>
        <defs>
          <clipPath id="clip0_624_651">
            <rect width="30" height="30" fill="white" transform="translate(0.5)" />
          </clipPath>
        </defs>
      </svg>
    </div>

    <div class="grid gap-3">
      <!-- Sección de Contacto -->
      <div>
        <h3 class="font-semibold text-xl">Contacto</h3>
        <div>
          <p>Se usa por si hay algún inconveniente con algún pago, estos datos son opcionales</p>
          <div class="border border-gray-500 h-16 rounded-lg text-center mt-2">
            WhatsApp
            <div class="h-6 border-t border-gray-500 flex gap-4 items-center pt-3 justify-center">
              <div class="relative">
                <select
                  v-model="accounts.prefix"
                  class="appearance-none bg-white border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:border-blue-500"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+57">🇨🇴 +57</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M5.5 7l4.5 4.5L14.5 7z" />
                  </svg>
                </div>
              </div>
              <input
                v-model="accounts.cellphone"
                type="number"
                maxlength="15"
                class="w-30 border border-blue-300 rounded px-2"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Cuentas -->
      <div>
        <h3 class="font-semibold text-xl">Cuenta para desembolso de dinero</h3>
        <div class="grid gap-4 mt-2">
          <div v-for="(label, type) in accountTypes" :key="type">
            <div class="border border-gray-500 h-16 rounded-lg text-center">
              {{ label }}
              <div class="h-6 border-t border-gray-500 flex gap-4 items-center pt-3 justify-center">
                <input
                  v-model="accounts[type]"
                  :type="type === typeAcc.llave ? 'text' : 'number'"
                  :maxlength="type === typeAcc.llave ? undefined : 15"
                  class="w-30 border border-blue-300 rounded px-2"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex gap-2 justify-end mt-4">
        <div
          class="bg-[#CDFF00] h-10 w-10 rounded flex justify-center items-center cursor-pointer"
          @click="handleAccountUpdate"
        >
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M10.354 17.5995L5.38403 12.6295L6.09803 11.9165L10.354 16.1725L19.51 7.01648L20.223 7.73048L10.354 17.5995Z" fill="black"/>
          </svg>
        </div>
        <div
          class="bg-[#ACA9A9] h-10 w-10 rounded flex justify-center items-center cursor-pointer"
          @click="handleCancel"
        >
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M7.09203 18.616L6.38403 17.908L11.984 12.308L6.38403 6.708L7.09203 6L12.692 11.6L18.292 6L19 6.708L13.4 12.308L19 17.908L18.292 18.616L12.692 13.016L7.09203 18.616Z" fill="black"/>
          </svg>
        </div>
      </div>
    </div>


  </div>
  <br>
  <div>
      <FooterComponent class="w-full absolute -bottom-8" />
    </div>
</template>