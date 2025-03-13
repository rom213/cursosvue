import { defineStore } from "pinia";
import { ref } from "vue";
import { usePayU } from "../payu/usePayu";
import { useRouter } from "vue-router";
import { authStore } from "./AuthStore";
import type { ICategory } from "../types/Categorie";
const { generatePayUForm } = usePayU();
const router = useRouter();
const userAuth = authStore()

export const emergentBuyStore = defineStore('emergentBuy', () => {
    const emergentBuy = ref({
        'emergent': false,
        'optionsEmergentBuy': 0,
        'correo': ''
    })

    const category= ref<ICategory>()
    
    
    const handleEmergentBuy = () => {
        console.log("hola me ejecute");
        emergentBuy.value.emergent = !emergentBuy.value.emergent
    }
    
    const handleChangeOptionsEmergentBuy=(select: number)=>{
        emergentBuy.value.optionsEmergentBuy=select
    }
    
    
    const buyCategory = () => {
        if (emergentBuy.value.optionsEmergentBuy === 0) {
            if (!userAuth.getProfile()) {
                router.push("/login");
                return;
            }
            generatePayUForm(category.value?.precio_desc, category.value?.titulo, userAuth.getProfile()?.user?.email, category.value?.signature, category.value?.reference_code);
        }
    
        if (emergentBuy.value.optionsEmergentBuy === 1) {
            if (!userAuth.getProfile()) {
                router.push("/login");
                return;
            }
            generatePayUForm(category.value?.precio_desc, category.value?.titulo, emergentBuy.value.correo, category.value?.signature, category.value?.reference_code);
        }
    
    };
    return {buyCategory, handleChangeOptionsEmergentBuy, handleEmergentBuy, emergentBuy, category}
})