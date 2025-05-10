import { defineStore } from "pinia";
import { ref } from "vue";
import { usePayU } from "../payu/usePayu";
import { useRouter } from "vue-router";
import { authStore } from "./AuthStore";
import type { ICategory } from "../types/Categorie";
import { OptionsEmergentBuy } from "../types/Payment";
const { generatePayUForm } = usePayU();




export const emergentBuyStore = defineStore('emergentBuy', () => {

    const router = useRouter();
    const userAuth = authStore()
    const emergentBuy = ref({
        emergent: false,
        optionsEmergentBuy: OptionsEmergentBuy.UserInternal,
        correo: ''
      })


    const category = ref<ICategory>()

    const setCategoryEmergent =(categor : ICategory)=>{
        category.value= categor
    }


    const handleEmergentBuy = () => {
        emergentBuy.value.emergent = !emergentBuy.value.emergent
    }

    const handleChangeOptionsEmergentBuy = (select: OptionsEmergentBuy) => {
        emergentBuy.value.optionsEmergentBuy = select
    }


    const buyCategory = () => {

        if (emergentBuy.value.optionsEmergentBuy === OptionsEmergentBuy.UserInternal) {
            if (!userAuth.getProfile()) {
                router.push("/login");
                return;
            }

            let value_extra=`|${category.value?.id},${userAuth.getProfile()?.user?.google_id}`
            const google_affiliaty= localStorage.getItem("google_affiliaty")
            if (google_affiliaty && !userAuth.profile?.user?.is_bought) {
                value_extra= value_extra + `,${google_affiliaty}`
            }


            generatePayUForm(category.value?.precio_desc, category.value?.titulo, userAuth.getProfile()?.user?.email, category.value?.signature, category.value?.reference_code, value_extra);
        }

        if (emergentBuy.value.optionsEmergentBuy === OptionsEmergentBuy.UserExternal) {
            if (!userAuth.getProfile()) {
                router.push("/login");
                return;
            }

            let value_extra=`|${category.value?.id},${userAuth.getProfile()?.user?.google_id}`
            generatePayUForm(category.value?.precio_desc, category.value?.titulo, emergentBuy.value.correo, category.value?.signature, category.value?.reference_code, value_extra);
        }

    };
    return { buyCategory, handleChangeOptionsEmergentBuy, handleEmergentBuy, emergentBuy, setCategoryEmergent }
})