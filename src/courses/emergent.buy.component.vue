<script lang="ts" setup>
import AuthService from "../services/AuthServices";
import GuestCheckoutService from "../services/GuestCheckoutService";
import { authStore } from "../store/AuthStore";
import { emergentBuyStore } from "../store/EmergentBuyStore";
import { OptionsEmergentBuy, OptionBuyPay } from "../types/Payment";
import AlertNotification from "../components/common/AlertNotification.vue";
import WhatsAppInput from "../components/common/WhatsAppInput.vue";

import { ref, watch, computed, onMounted } from "vue";
import { useTracking } from "../composables/useTracking";

const storeemergentBuy = emergentBuyStore();
const userAuth = authStore();
const { trackBeginCheckout, trackAddPaymentInfo } = useTracking();

const emailVerified = ref(false);
const isEditingAccessEmail = ref(false);
const tieneCupon = ref(false);
const loadingVerify = ref(false);
const isProcessingPayment = ref(false);
const cupon = ref("");
const guestEmail = ref("");
const guestEmailConfirm = ref("");
const guestEmailError = ref("");
const guestEmailConfirmError = ref("");
const whatsappError = ref("");
const alert = ref({
  show: false,
  message: "",
  type: "success", // 'success' | 'error' | 'warning'
});

const EMAIL_RE = /^[^@\s]+@gmail\.com$/i;

// Computed properties for Coupon Logic
const couponFullData = computed(() => {
  if (
    storeemergentBuy.cuponResponse &&
    storeemergentBuy.cuponResponse.status === "success" &&
    storeemergentBuy.cuponResponse.records &&
    storeemergentBuy.cuponResponse.records.length > 0
  ) {
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
  const country = (userAuth.getProfile()?.user?.country || "").toUpperCase();
  return country !== "CO";
});

const isGuest = computed(() => !userAuth.getProfile());
const profileEmail = computed(() => userAuth.getProfile()?.user?.email || "");
const normalizedProfileEmail = computed(() =>
  profileEmail.value.trim().toLowerCase(),
);
const normalizedAccessEmail = computed(() =>
  storeemergentBuy.emergentBuy.correo.trim().toLowerCase(),
);
const isEditedPersonalAccess = computed(
  () =>
    !isGuest.value &&
    !storeemergentBuy.esVentaTercero &&
    normalizedAccessEmail.value !== normalizedProfileEmail.value,
);

const guestEmailConfirmTouched = ref(false);

const guestEmailsMatch = computed(() => {
  const a = guestEmail.value.trim().toLowerCase();
  const b = guestEmailConfirm.value.trim().toLowerCase();
  return !!a && !!b && a === b;
});

const guestEmailsMismatch = computed(() => {
  const a = guestEmail.value.trim().toLowerCase();
  const b = guestEmailConfirm.value.trim().toLowerCase();
  return guestEmailConfirmTouched.value && !!b && a !== b;
});

const syncDefaultAccessEmail = () => {
  if (!isGuest.value && !storeemergentBuy.esVentaTercero) {
    storeemergentBuy.emergentBuy.correo = profileEmail.value;
    storeemergentBuy.emergentBuy.user_google_id = "";
    emailVerified.value = false;
    isEditingAccessEmail.value = false;
  }
};

const hydrateWhatsappFromProfile = () => {
  const profile = userAuth.getProfile()?.user;
  if (profile?.num_whatsapp) {
    const prefix = profile.prefix || "+57";
    storeemergentBuy.emergentBuy.num_whatsapp = profile.num_whatsapp.startsWith(
      "+",
    )
      ? profile.num_whatsapp
      : `${prefix} ${profile.num_whatsapp}`;
  }
};

onMounted(() => {
  hydrateWhatsappFromProfile();
  syncDefaultAccessEmail();
});

const showAlert = (type: string, message: string) => {
  alert.value = { show: true, type, message };
  setTimeout(() => {
    alert.value.show = false;
  }, 4000);
};

const verificarCorreo = async () => {
  if (loadingVerify.value) return;

  const email = normalizedAccessEmail.value;
  if (!email) {
    showAlert("warning", "Por favor ingrese un correo valido.");
    return;
  }

  storeemergentBuy.emergentBuy.correo = email;

  if (email === normalizedProfileEmail.value) {
    if (storeemergentBuy.esVentaTercero) {
      showAlert(
        "warning",
        'Si es para uso personal, seleccione la opcion "Para mi uso personal".',
      );
      emailVerified.value = false;
      return;
    }

    storeemergentBuy.handleChangeOptionsEmergentBuy(
      OptionsEmergentBuy.UserInternal,
    );
    storeemergentBuy.emergentBuy.user_google_id = "";
    emailVerified.value = false;
    isEditingAccessEmail.value = false;
    showAlert("success", "Usaremos tu usuario actual para dar acceso.");
    return;
  }

  loadingVerify.value = true;
  try {
    const response = await AuthService.verificarEmail(email);

    if (response.status === "success") {
      const googleId = response.records?.[0]?.google_id;
      if (!googleId) {
        showAlert("error", "No pudimos obtener el usuario de ese correo.");
        emailVerified.value = false;
        return;
      }

      showAlert(
        "success",
        "Correo verificado correctamente. Puede continuar.",
      );
      emailVerified.value = true;
      isEditingAccessEmail.value = false;
      storeemergentBuy.emergentBuy.user_google_id = googleId;
      storeemergentBuy.handleChangeOptionsEmergentBuy(
        OptionsEmergentBuy.UserExternal,
      );
    } else {
      showAlert(
        "error",
        response.message || "El correo no es valido o no existe en Google.",
      );
      emailVerified.value = false;
    }
  } catch (e) {
    showAlert("error", "Ocurrio un error al verificar el correo.");
    emailVerified.value = false;
  } finally {
    loadingVerify.value = false;
  }
};

const resetVerification = () => {
  emailVerified.value = false;
  storeemergentBuy.emergentBuy.correo = "";
};

const editPersonalAccessEmail = () => {
  if (!storeemergentBuy.emergentBuy.correo) {
    storeemergentBuy.emergentBuy.correo = profileEmail.value;
  }
  emailVerified.value = false;
  isEditingAccessEmail.value = true;
};

const handleAccessEmailInput = () => {
  emailVerified.value = false;
  storeemergentBuy.emergentBuy.user_google_id = "";

  if (isEditedPersonalAccess.value) {
    storeemergentBuy.handleChangeOptionsEmergentBuy(
      OptionsEmergentBuy.UserExternal,
    );
    tieneCupon.value = false;
    cupon.value = "";
    storeemergentBuy.clearCupon();
    return;
  }

  if (!storeemergentBuy.esVentaTercero) {
    storeemergentBuy.handleChangeOptionsEmergentBuy(
      OptionsEmergentBuy.UserInternal,
    );
  }
};

const handleAccessEmailChange = () => {
  handleAccessEmailInput();
  if (isEditedPersonalAccess.value) {
    verificarCorreo();
  }
};

const selectPersonalAccess = () => {
  if (isEditedPersonalAccess.value) {
    storeemergentBuy.handleChangeOptionsEmergentBuy(
      OptionsEmergentBuy.UserExternal,
    );
    return;
  }

  storeemergentBuy.handleChangeOptionsEmergentBuy(
    OptionsEmergentBuy.UserInternal,
  );
};

const handleBuy = async () => {
  if (isProcessingPayment.value) return;

  // Validar WhatsApp obligatorio
  const wa = storeemergentBuy.emergentBuy.num_whatsapp;
  if (!wa || wa.replace(/\D/g, "").length < 7) {
    whatsappError.value =
      "Ingresa un número de WhatsApp válido para recibir el recibo.";
    showAlert("error", whatsappError.value);
    return;
  }
  whatsappError.value = "";

  // Flujo guest: registrar usuario TERCERO primero
  if (isGuest.value) {
    const email = guestEmail.value.trim().toLowerCase();
    const emailConfirm = guestEmailConfirm.value.trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      guestEmailError.value =
        "Ingresa un correo Gmail válido (ejemplo@gmail.com).";
      showAlert("error", guestEmailError.value);
      return;
    }
    guestEmailError.value = "";

    if (!emailConfirm || emailConfirm !== email) {
      guestEmailConfirmError.value = "Los correos no coinciden.";
      showAlert("error", guestEmailConfirmError.value);
      return;
    }
    guestEmailConfirmError.value = "";

    isProcessingPayment.value = true;
    // Para guests siempre usar Wompi
    storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Wompi;
    const regResult = await GuestCheckoutService.register({
      email,
      num_whatsapp: wa,
    });
    if (!regResult?.google_id) {
      showAlert(
        "error",
        "No pudimos registrarte. Verifica el correo e intenta de nuevo.",
      );
      isProcessingPayment.value = false;
      return;
    }
    storeemergentBuy.emergentBuy.guest_email = email;
    storeemergentBuy.emergentBuy.guest_google_id = regResult.google_id;
  }

  if (!isGuest.value && isEditedPersonalAccess.value) {
    storeemergentBuy.handleChangeOptionsEmergentBuy(
      OptionsEmergentBuy.UserExternal,
    );
  }

  if (
    storeemergentBuy.emergentBuy.optionsEmergentBuy ===
    OptionsEmergentBuy.UserExternal
  ) {
    if (!emailVerified.value) {
      showAlert(
        "error",
        "Debe verificar el correo del beneficiario antes de realizar la compra.",
      );
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
    const payMethod =
      storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Paypal
        ? "PayPal"
        : storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Wompi
          ? "Wompi"
          : "PayU";
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
    showAlert("error", "Debe ingresar un cupón válido.");
    return;
  }

  if (isGuest.value) {
    storeemergentBuy.validarCuponGuess(cupon).then((res) => {
      if (res?.status === "success") {
        showAlert("success", "Cupón aplicado correctamente.");
      } else {
        showAlert("error", res?.message || "Cupón inválido.");
      }
    });
    return
  }
  storeemergentBuy.validarCupon(cupon).then((res) => {
    if (res?.status === "success") {
      showAlert("success", "Cupón aplicado correctamente.");
    } else {
      showAlert("error", res?.message || "Cupón inválido.");
    }
  });
};

// Reset verification if email changes manually
watch(
  () => storeemergentBuy.emergentBuy.correo,
  () => {
    emailVerified.value = false;
    if (isEditedPersonalAccess.value) {
      storeemergentBuy.handleChangeOptionsEmergentBuy(
        OptionsEmergentBuy.UserExternal,
      );
    }
  },
);

// Watch toggling coupon checkbox
watch(
  () => tieneCupon.value,
  (newVal) => {
    if (newVal) {
      storeemergentBuy.handleChangeOptionsEmergentBuy(
        OptionsEmergentBuy.UserInternalCupon,
      );
    } else {
      // If unchecking, revert to standard Internal if we were in Cupon mode
      if (
        storeemergentBuy.emergentBuy.optionsEmergentBuy ===
        OptionsEmergentBuy.UserInternalCupon
      ) {
        storeemergentBuy.handleChangeOptionsEmergentBuy(
          OptionsEmergentBuy.UserInternal,
        );
      }
      cupon.value = ""; // Reset coupon input
      storeemergentBuy.clearCupon(); // Clear store state
    }
  },
);

// Watch option selection to enforce rules
watch(
  () => storeemergentBuy.emergentBuy.optionsEmergentBuy,
  (newVal) => {
    if (newVal === OptionsEmergentBuy.UserExternal) {
      tieneCupon.value = false;
      cupon.value = "";
    }
  },
);

watch(
  () => storeemergentBuy.emergentBuy.emergent,
  (isOpen) => {
    if (isOpen) {
      hydrateWhatsappFromProfile();
      if (storeemergentBuy.esVentaTercero) {
        storeemergentBuy.emergentBuy.correo = "";
        storeemergentBuy.emergentBuy.user_google_id = "";
        emailVerified.value = false;
        isEditingAccessEmail.value = false;
      } else {
        syncDefaultAccessEmail();
      }
    }
    if (userAuth.nameAffiliaty) {
      tieneCupon.value = true;
      cupon.value = userAuth.getCupoCode();
      verificarCupon(userAuth.getCupoCode());
    }
    if (isOnlyPaypal.value) {
      storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Paypal;
    }
  },
);
</script>

<template>
  <div
    v-if="storeemergentBuy.emergentBuy.emergent"
    class="emergent-buy-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  >
    <div
      class="emergent-buy-panel bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- Header -->
      <div
        class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10"
      >
        <h3 class="text-gray-800 font-bold text-lg">
          ¿A dónde enviamos tu acceso?
        </h3>
        <button
          @click="storeemergentBuy.handleEmergentBuy()"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-8">
        <div v-if="!isGuest" class="text-sm text-gray-500 font-medium">
          ¿Quién tendrá acceso al curso?
        </div>

        <!-- Selection Cards (solo logueados) -->
        <div v-if="!isGuest" class="space-y-4">
          <!-- Option 1: Internal User -->
          <div
            v-if="!storeemergentBuy.esVentaTercero"
            @click="selectPersonalAccess()"
            class="cursor-pointer border rounded-lg p-4 transition-all duration-200 relative group"
            :class="[
              storeemergentBuy.emergentBuy.optionsEmergentBuy !==
                OptionsEmergentBuy.UserExternal || isEditedPersonalAccess
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <span
                class="font-bold text-gray-800"
                :class="{
                  'text-green-700':
                    storeemergentBuy.emergentBuy.optionsEmergentBuy !==
                      OptionsEmergentBuy.UserExternal ||
                    isEditedPersonalAccess,
                }"
                >Para mi uso personal</span
              >
              <div
                v-if="
                  storeemergentBuy.emergentBuy.optionsEmergentBuy !==
                    OptionsEmergentBuy.UserExternal || isEditedPersonalAccess
                "
                class="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div
                v-else
                class="h-5 w-5 rounded-full border-2 border-gray-300"
              ></div>
            </div>

            <div
              class="flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-md shadow-sm"
            >
              <div class="flex-shrink-0">
                <!-- User Icon / Avatar Placeholder -->
                <div
                  class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div class="min-w-0 flex-1 space-y-2" @click.stop>
                <div class="relative">
                  <input
                    v-model="storeemergentBuy.emergentBuy.correo"
                    type="email"
                    :disabled="!isEditingAccessEmail || emailVerified"
                    @input="handleAccessEmailInput()"
                    @change="handleAccessEmailChange()"
                    @keydown.enter.prevent="verificarCorreo()"
                    class="w-full rounded-md border border-gray-200 bg-white py-2 pl-3 pr-11 text-sm font-medium outline-none transition-colors disabled:bg-gray-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Correo del usuario"
                  />
                  <button
                    type="button"
                    @click.stop="editPersonalAccessEmail()"
                    class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Editar correo"
                    title="Editar correo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M16.862 4.487l1.688-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 7.125L16.875 4.5"
                      />
                    </svg>
                  </button>
                </div>

                <p
                  v-if="isEditedPersonalAccess && !emailVerified"
                  class="text-xs font-medium text-amber-600"
                >
                  Este correo se comprara como usuario tercero. Debe estar
                  verificado.
                </p>
                <p
                  v-else-if="isEditedPersonalAccess && emailVerified"
                  class="text-xs font-medium text-emerald-600"
                >
                  Correo verificado. La compra se hara para este usuario.
                </p>

                <button
                  v-if="isEditedPersonalAccess && !emailVerified"
                  type="button"
                  @click.stop="verificarCorreo()"
                  :disabled="loadingVerify"
                  class="w-full rounded-md bg-slate-800 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {{ loadingVerify ? "Verificando..." : "Verificar correo" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Option 2: External User -->
          <div
            v-if="storeemergentBuy.esVentaTercero"
            @click="
              storeemergentBuy.handleChangeOptionsEmergentBuy(
                OptionsEmergentBuy.UserExternal,
              )
            "
            class="cursor-pointer border rounded-lg p-4 transition-all duration-200"
            :class="[
              storeemergentBuy.emergentBuy.optionsEmergentBuy ===
              OptionsEmergentBuy.UserExternal
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center justify-between mb-3">
              <span
                class="font-bold text-gray-800"
                :class="{
                  'text-green-700':
                    storeemergentBuy.emergentBuy.optionsEmergentBuy ===
                    OptionsEmergentBuy.UserExternal,
                }"
                >Para otra persona (Regalo/Venta)</span
              >
              <div
                v-if="
                  storeemergentBuy.emergentBuy.optionsEmergentBuy ===
                  OptionsEmergentBuy.UserExternal
                "
                class="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div
                v-else
                class="h-5 w-5 rounded-full border-2 border-gray-300"
              ></div>
            </div>

            <!-- Email Input for External -->
            <div @click.stop class="space-y-2">
              <div class="relative">
                <input
                  v-model="storeemergentBuy.emergentBuy.correo"
                  :disabled="emailVerified"
                  :class="[
                    'w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors',
                    emailVerified
                      ? 'bg-gray-100 text-gray-500 border-gray-200'
                      : 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
                  ]"
                  placeholder="Correo electrónico del beneficiario"
                  type="email"
                />
                <div
                  v-if="emailVerified"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div
                v-if="
                  storeemergentBuy.emergentBuy.optionsEmergentBuy ===
                  OptionsEmergentBuy.UserExternal
                "
              >
                <button
                  v-if="!emailVerified"
                  @click="verificarCorreo()"
                  :disabled="loadingVerify"
                  class="w-full bg-slate-800 text-white text-sm font-semibold py-2 rounded-md hover:bg-slate-700 transition-colors flex justify-center items-center"
                >
                  <span
                    v-if="loadingVerify"
                    class="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                  ></span>
                  {{
                    loadingVerify
                      ? "Verificando..."
                      : "Verificar correo del beneficiario"
                  }}
                </button>
                <button
                  v-else
                  @click="resetVerification()"
                  class="w-full bg-white border border-gray-300 text-gray-700 text-sm font-semibold py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cambiar destinatario
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Coupon Section (Internal Only, only for logged-in users) -->
        <div
          v-if="
            storeemergentBuy.emergentBuy.optionsEmergentBuy !==
            OptionsEmergentBuy.UserExternal
          "
          class="pt-6 border-t border-gray-100"
        >
          <label class="flex items-center gap-3 cursor-pointer group mb-3">
            <div class="relative flex items-center">
              <input
                type="checkbox"
                v-model="tieneCupon"
                class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-emerald-600 checked:bg-emerald-600 hover:border-emerald-500"
              />
              <svg
                class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span
              class="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors"
              >Tengo un cupón de descuento</span
            >

            <!-- Success Badge -->
            <span
              v-if="isCouponApplied"
              class="ml-auto inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              Aplicado
            </span>
          </label>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div v-if="tieneCupon" class="flex flex-col gap-2">
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="cupon"
                  placeholder="Código del cupón"
                  class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase"
                />
                <button
                  @click="verificarCupon(cupon)"
                  class="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>

              <!-- Discount Details -->
              <div
                v-if="isCouponApplied"
                class="flex justify-between items-center text-sm bg-emerald-50 p-2 rounded border border-emerald-100"
              >
                <span class="text-gray-600">Descuento aplicado:</span>
                <span class="font-bold text-emerald-700"
                  >- ${{ discountAmount?.toLocaleString() || 0 }}</span
                >
              </div>
            </div>
          </transition>
        </div>

        <!-- WhatsApp (siempre obligatorio) -->
        <div class="pt-6 border-t border-gray-100">
          <WhatsAppInput
            v-model="storeemergentBuy.emergentBuy.num_whatsapp"
            :disabled="isProcessingPayment"
            :error="whatsappError"
          />
        </div>

        <!-- Formulario guest (solo sin sesión) -->
        <!-- work -->
        <div v-if="isGuest" class="space-y-4">
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
            <p v-if="guestEmailError" class="text-xs text-red-500 mt-1">
              {{ guestEmailError }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirmar correo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="guestEmailConfirm"
              @blur="guestEmailConfirmTouched = true"
              @input="guestEmailConfirmTouched = true"
              type="email"
              placeholder="tucorreo@gmail.com"
              :disabled="isProcessingPayment"
              class="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 disabled:bg-gray-100 transition-colors"
              :class="[
                guestEmailsMismatch
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : guestEmailsMatch
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:border-green-500 focus:ring-green-500',
              ]"
            />
            <p v-if="guestEmailsMismatch" class="text-xs text-red-500 mt-1">
              Los correos no coinciden
            </p>
            <p
              v-else-if="guestEmailConfirmError"
              class="text-xs text-red-500 mt-1"
            >
              {{ guestEmailConfirmError }}
            </p>
            <p v-else class="text-xs text-gray-400 mt-1">
              Recibirás el recibo y acceso a tus cursos aquí.
            </p>
          </div>
        </div>

        <div v-if="!isGuest" class="pt-6 border-t border-gray-100 space-y-4">
          <div class="text-sm text-gray-500 font-medium">
            Selecciona tu método de pago
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
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
              @click="
                storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Wompi
              "
              class="cursor-pointer w-full border rounded-lg p-4 flex flex-col items-start gap-2 transition-all duration-200 relative"
              :class="[
                storeemergentBuy.emergentBuy.optionBuyPay === OptionBuyPay.Wompi
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
              ]"
            >
              <div
                v-if="
                  storeemergentBuy.emergentBuy.optionBuyPay ===
                  OptionBuyPay.Wompi
                "
                class="absolute top-2 right-2 text-green-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-800 pr-6"
                >Pagos locales y Tarjetas (PSE, Nequi, Visa, Mastercard)</span
              >
              <div class="flex flex-wrap items-center gap-2 opacity-90">
                <span
                  class="h-5 inline-flex items-center px-1.5 rounded text-[9px] font-bold text-white"
                  style="background: #3b3f8c"
                  >Nequi</span
                >
                <span
                  class="h-5 inline-flex items-center px-1.5 rounded text-[9px] font-bold text-gray-900"
                  style="background: #fdcd00"
                  >Bancolombia</span
                >
                <span
                  class="h-5 inline-flex items-center px-1.5 rounded text-[9px] font-bold text-white"
                  style="background: #e3001b"
                  >Daviplata</span
                >
                <span
                  class="h-5 inline-flex items-center px-1.5 rounded text-[9px] font-bold text-white"
                  style="background: #00693c"
                  >PSE</span
                >
                <span
                  class="h-5 inline-flex items-center px-1.5 rounded text-[9px] font-extrabold italic tracking-wide text-white"
                  style="background: #1a1f71"
                  >VISA</span
                >
                <span
                  class="h-5 inline-flex items-center px-1 rounded bg-white border border-gray-200"
                >
                  <svg
                    viewBox="0 0 48 30"
                    class="h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Mastercard"
                  >
                    <circle cx="19" cy="15" r="10" fill="#EB001B" />
                    <circle cx="29" cy="15" r="10" fill="#F79E1B" />
                    <path
                      d="M24 7.5a10 10 0 010 15 10 10 0 010-15z"
                      fill="#FF5F00"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <!-- PayPal Option -->
            <div
              @click="
                storeemergentBuy.emergentBuy.optionBuyPay = OptionBuyPay.Paypal
              "
              class="cursor-pointer w-full border rounded-lg p-4 flex flex-col items-start justify-center gap-2 transition-all duration-200 relative"
              :class="[
                storeemergentBuy.emergentBuy.optionBuyPay ===
                OptionBuyPay.Paypal
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
              ]"
            >
              <div
                v-if="
                  storeemergentBuy.emergentBuy.optionBuyPay ===
                  OptionBuyPay.Paypal
                "
                class="absolute top-2 right-2 text-green-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-800 pr-6"
                >Pago internacional (PayPal)</span
              >
              <div class="flex items-center gap-2 opacity-80">
                <span
                  class="h-5 inline-flex items-center px-1.5 rounded text-[9px] font-bold text-white"
                  style="background: #003087"
                  >PayPal</span
                >
                <span
                  class="h-5 inline-flex items-center px-1.5 rounded text-[9px] font-bold text-gray-700 bg-gray-100"
                  >Tarjeta internacional</span
                >
              </div>
            </div>
          </div>
          <p v-if="isOnlyPaypal" class="text-xs text-blue-600 font-medium">
            Tu región usa PayPal como método disponible. Al pagar te redirigimos
            automáticamente.
          </p>
        </div>
      </div>

      <!-- Footer / Action -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <!-- Price Summary -->
        <div
          v-if="
            isCouponApplied &&
            storeemergentBuy.emergentBuy.optionsEmergentBuy !==
              OptionsEmergentBuy.UserExternal
          "
          class="flex justify-between items-end mb-3 px-1"
        >
          <span class="text-sm text-gray-500 line-through decoration-red-500">
            {{ storeemergentBuy.getCategoryEmergent()?.precio_desc }}
          </span>
          <span
            class="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded"
          >
            Ahorras ${{ discountAmount?.toLocaleString() || 0 }}
          </span>
        </div>

        <!-- Botón Pagar (único submit) -->
        <button
          @click="handleBuy()"
          :disabled="isProcessingPayment"
          class="w-full rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base py-3 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span
            v-if="isProcessingPayment"
            class="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"
          ></span>
          <span>
            {{
              isProcessingPayment
                ? "Lo estamos alistando..."
                : storeemergentBuy.emergentBuy.optionBuyPay ===
                    OptionBuyPay.Paypal
                  ? `Pagar $${finalPrice?.toLocaleString() || 0} con PayPal`
                  : `Desbloquear bloque $${finalPrice?.toLocaleString() || 0}`
            }}
          </span>
        </button>

        <p
          class="text-xs text-gray-500 text-center flex items-center justify-center gap-1 mt-2"
        >
          <span aria-hidden="true">🔒</span>
          <span>Pago 100% seguro (PSE, Nequi, Tarjetas)</span>
        </p>

        <div class="text-center mt-3">
          <p class="text-xs text-gray-400">
            Al continuar aceptas nuestros
            <a
              href="/terminos-y-condiciones"
              target="_blank"
              rel="noopener"
              class="underline hover:text-gray-600"
              >Términos y Condiciones</a
            >.
          </p>
        </div>
      </div>
    </div>
    <div
      v-if="isProcessingPayment"
      class="absolute inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        class="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xl flex items-center gap-3"
      >
        <div
          class="h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin"
        ></div>
        <p class="text-sm font-semibold text-slate-700">
          Lo estamos alistando para ti...
        </p>
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

<style scoped>
.emergent-buy-panel {
  color: #111827;
}

.emergent-buy-modal :deep(input:not([type="checkbox"]):not([type="radio"])),
.emergent-buy-modal :deep(textarea),
.emergent-buy-modal :deep(select) {
  color: #111827;
  -webkit-text-fill-color: #111827;
}

.emergent-buy-modal :deep(input:disabled),
.emergent-buy-modal :deep(textarea:disabled),
.emergent-buy-modal :deep(select:disabled) {
  color: #6b7280;
  -webkit-text-fill-color: #6b7280;
  opacity: 1;
}

.emergent-buy-modal :deep(input::placeholder),
.emergent-buy-modal :deep(textarea::placeholder) {
  color: #9ca3af;
  -webkit-text-fill-color: #9ca3af;
  opacity: 1;
}
</style>
