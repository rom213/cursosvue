import { defineStore } from "pinia";
import { ref } from "vue";
import { usePayU } from "../payu/usePayu";
import { authStore } from "./AuthStore";
import type { ICategory } from "../types/Categorie";
import { OptionBuyPay, OptionsEmergentBuy, type ICuponResponsePayu } from "../types/Payment";
const { generatePayUForm } = usePayU();
import PaymentService from '../services/PaymentService';
import GuestCheckoutService from '../services/GuestCheckoutService';
import CuponService from "../services/Cupon";
import { useTracking } from "../composables/useTracking";
const { persistPurchaseData } = useTracking();




export const emergentBuyStore = defineStore('emergentBuy', () => {

    const userAuth = authStore()
    const cuponResponse = ref<ICuponResponsePayu | null>(null);
    const esVentaTercero = ref(false)
    const emergentBuy = ref({
        emergent: false,
        optionsEmergentBuy: OptionsEmergentBuy.UserInternal,
        optionBuyPay: OptionBuyPay.Wompi,
        correo: '',
        user_google_id: '',
        num_whatsapp: '',
        guest_email: '',
        guest_google_id: '',
      })


    const category = ref<ICategory>()

    const setCategoryEmergent =(categor : ICategory)=>{
        category.value= categor
    }

    const getCategoryEmergent =()=>{
        return category.value
    }


    const handleEmergentBuy = () => {
        emergentBuy.value.emergent = !emergentBuy.value.emergent
    }

    const handleChangeOptionsEmergentBuy = (select: OptionsEmergentBuy) => {
        emergentBuy.value.optionsEmergentBuy = select
    }


    const clearCupon = () => {
        cuponResponse.value = null;
    }

    const buyCategory = () => {
        const num_whatsapp = emergentBuy.value.num_whatsapp || undefined;

        // ── Flujo GUEST (sin sesión) ─────────────────────────────────────────
        if (!userAuth.getProfile()) {
            const google_id = emergentBuy.value.guest_google_id;
            if (!google_id) {
                console.warn('buyCategory guest: google_id vacío — se debe llamar a GuestCheckoutService.register primero.');
                return;
            }
            const gateway = emergentBuy.value.optionBuyPay === OptionBuyPay.Paypal ? 'paypal' : 'wompi';
            if (category.value) persistPurchaseData([category.value], category.value.precio_desc);
            GuestCheckoutService.initGuestCheckout({
                google_id,
                categories: [{ id_category: category.value?.id as number }],
                gateway,
                num_whatsapp: num_whatsapp || '',
            }).then((res) => {
                if (res?.approval_url) {
                    window.location.href = res.approval_url;
                }
            });
            return;
        }

        // ── Flujo INTERNO (usuario logueado) ────────────────────────────────
        if (emergentBuy.value.optionsEmergentBuy === OptionsEmergentBuy.UserInternal) {
            let value_extra=`|${category.value?.id},${userAuth.getProfile()?.user?.google_id}`
            const google_affiliaty= localStorage.getItem("google_affiliaty")
            if (google_affiliaty && !userAuth.profile?.user?.is_bought) {
                value_extra= value_extra + `,${google_affiliaty}`
            }

            if (category.value) persistPurchaseData([category.value], category.value.precio_desc);

            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.PayU) {
                PaymentService.generate_signature_reference_code({ categories: [{id_category:category.value?.id}] }).then((res) => {
                    if (res?.signature) {
                        generatePayUForm(res.price, category.value?.titulo, userAuth.getProfile()?.user?.email, res?.signature, res?.reference_code, value_extra);
                    }
                });
            }

            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.Paypal) {
                PaymentService.generate_link_pay_paypal({ categories: [{id_category:category.value?.id}], num_whatsapp }).then((res) => {
                    if (res?.approval_url) {
                        window.location.href = res.approval_url;
                    }
                });
            }

            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.Wompi) {
                PaymentService.generate_link_pay_wompy({ categories: [{id_category:category.value?.id}], num_whatsapp }).then((res) => {
                    if (res?.approval_url) {
                        window.location.href = res.approval_url;
                    }
                });
            }
        }

        if (emergentBuy.value.optionsEmergentBuy === OptionsEmergentBuy.UserInternalCupon) {
            if (!cuponResponse.value || !cuponResponse.value.records || cuponResponse.value.records.length === 0) {
                 handleChangeOptionsEmergentBuy(OptionsEmergentBuy.UserInternal);
                 buyCategory();
                 return;
            }

            const record = cuponResponse.value.records[0];
            let value_extra=`|${category.value?.id},${userAuth.getProfile()?.user?.google_id},${record.google_id}`

            const finalPrice = parseFloat(record.price);
            if (category.value) persistPurchaseData([category.value], finalPrice);
            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.PayU) {
                generatePayUForm(finalPrice, category.value?.titulo, userAuth.getProfile()?.user?.email, record.signature, record.reference_code, value_extra);
            }

            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.Paypal) {
                PaymentService.generate_link_pay_paypal_cupon({ categories: [{id_category:category.value?.id}], cupon: record.cupon, num_whatsapp }).then((res) => {
                    if (res?.approval_url) {
                        window.location.href = res.approval_url;
                    }
                });
            }

            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.Wompi) {
                PaymentService.generate_link_pay_wompy_cupon({ categories: [{id_category:category.value?.id}], cupon: record.cupon, num_whatsapp }).then((res) => {
                    if (res?.approval_url) {
                        window.location.href = res.approval_url;
                    }
                });
            }
        }

        if (emergentBuy.value.optionsEmergentBuy === OptionsEmergentBuy.UserExternal) {
            clearCupon();

            let value_extra=`|${category.value?.id},${emergentBuy.value.user_google_id}`
            if (category.value) persistPurchaseData([category.value], category.value.precio_desc);
            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.PayU) {
                PaymentService.generate_signature_reference_code({ categories: [{id_category:category.value?.id}] }).then((res) => {
                    if (res?.signature) {
                        generatePayUForm(res.price, category.value?.titulo, emergentBuy.value.correo, res?.signature, res?.reference_code, value_extra);
                    }
                });
            }

            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.Paypal) {
                PaymentService.generate_link_pay_paypal_external({ categories: [{id_category:category.value?.id}], google_id_external:emergentBuy.value.user_google_id, num_whatsapp }).then((res) => {
                    if (res?.approval_url) {
                        window.location.href = res.approval_url;
                    }
                });
            }

            if (emergentBuy.value.optionBuyPay=== OptionBuyPay.Wompi) {
                PaymentService.generate_link_pay_wompi_external({ categories: [{id_category:category.value?.id}], google_id_external:emergentBuy.value.user_google_id, num_whatsapp }).then((res) => {
                    if (res?.approval_url) {
                        window.location.href = res.approval_url;
                    }
                });
            }
        }
    };

    const validarCupon = async (cupon:string):Promise<ICuponResponsePayu | null>=>{
        return CuponService.generate_signature_reference_code_cupon({ categories: [{id_category:category.value?.id}], cupon: cupon }).then((res) => {
            cuponResponse.value = res
            return res
        })
    }

    const validarCuponGuess = async (cupon:string):Promise<ICuponResponsePayu | null>=>{
        return CuponService.generate_signature_reference_code_cupon_guess({ categories: [{id_category:category.value?.id}], cupon: cupon }).then((res) => {
            cuponResponse.value = res
            return res
        })
    }

    return { buyCategory, validarCuponGuess,handleChangeOptionsEmergentBuy, handleEmergentBuy, emergentBuy, setCategoryEmergent, getCategoryEmergent, validarCupon, clearCupon, cuponResponse, esVentaTercero }
})