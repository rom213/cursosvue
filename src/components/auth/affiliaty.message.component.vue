<script lang="ts" setup>
import { ref } from 'vue';
import { authStore } from '../../store/AuthStore';
import { useRouter } from 'vue-router';
const showMessageCopyLink = ref(false);
const showMessageIsNotBougth = ref(false)

const storeAuth = authStore()
const router = useRouter();

const generateLinkAff = async (categoryId:number | undefined) => {
    const auth = storeAuth.getProfile()?.user?.google_id;
    if (!auth) return;

    let link = `${location.origin}/${auth}/affiliaty/${categoryId}`;
    try {
        await navigator.clipboard.writeText(link);
        showMessageCopyLink.value = true;
        setTimeout(() => {
            showMessageCopyLink.value = false;
        }, 2000);
    } catch (err) {
        console.error("Error al copiar el enlace: ", err);
    }
}


const handleShowMessageNotBougth = () => {
    showMessageIsNotBougth.value = true;
    setTimeout(() => {
        showMessageIsNotBougth.value = false;
    }, 2000);
}



const validateLinkAfiliaty = async (id_category:number | undefined) => {
    if (storeAuth.getProfile()?.user?.is_bought) {
        generateLinkAff(id_category)
    }
    if (storeAuth.getProfile()?.user == null) {
        router.push({ name: 'register' })
    }
    if (!storeAuth.getProfile()?.user?.is_bought) {
        handleShowMessageNotBougth()
    }
};


defineProps<{
    id_category: number | undefined;
}>();
</script>



<template>
    <div @click="validateLinkAfiliaty(id_category)" class="flex gap-3 justify-center rounded-b-lg border-b border-[#ACA9A9]">
        <div>
            <p class="font-light">Compartir link de afiliado</p>
        </div>
        <div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M22.0153 10.2347L14.5153 2.73468C14.4629 2.68217 14.396 2.64641 14.3233 2.63192C14.2505 2.61742 14.175 2.62485 14.1065 2.65326C14.0379 2.68166 13.9793 2.72977 13.9381 2.7915C13.8969 2.85322 13.875 2.92578 13.875 2.99999V7.13343C8.81253 7.36218 2.58472 12.1537 1.88065 18.2897C1.86094 18.4464 1.89201 18.6052 1.9693 18.7429C2.04658 18.8806 2.16602 18.9899 2.31003 19.0547C2.40997 19.102 2.51913 19.1267 2.62972 19.1269C2.73178 19.1266 2.83269 19.1052 2.9261 19.064C3.01951 19.0229 3.10341 18.9629 3.17253 18.8878C4.25347 17.7375 8.16847 14.0381 13.875 13.8816V18C13.875 18.0742 13.8969 18.1468 13.9381 18.2085C13.9793 18.2702 14.0379 18.3183 14.1065 18.3467C14.175 18.3751 14.2505 18.3826 14.3233 18.3681C14.396 18.3536 14.4629 18.3178 14.5153 18.2653L22.0153 10.7653C22.0502 10.7305 22.0779 10.6891 22.0967 10.6436C22.1156 10.5981 22.1253 10.5493 22.1253 10.5C22.1253 10.4507 22.1156 10.4019 22.0967 10.3564C22.0779 10.3109 22.0502 10.2695 22.0153 10.2347ZM14.625 17.0934V13.5C14.625 13.4005 14.5855 13.3052 14.5152 13.2348C14.4449 13.1645 14.3495 13.125 14.25 13.125C11.6822 13.125 9.18003 13.7972 6.8119 15.1219C5.26172 15.9912 3.85045 17.0877 2.62503 18.375C2.94003 15.6366 4.45784 12.9862 6.90003 10.9153C9.14347 9.0103 11.8903 7.87499 14.25 7.87499C14.3495 7.87499 14.4449 7.83548 14.5152 7.76516C14.5855 7.69483 14.625 7.59945 14.625 7.49999V3.90561L21.2194 10.5L14.625 17.0934Z"
                    fill="black" />
            </svg>
        </div>

        <div v-if="showMessageCopyLink"
            class="fixed bottom-5 z-50 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 text-center text-2xl">
            Copiado al portapapeles
        </div>

        <div v-if="showMessageIsNotBougth"
            class="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 text-center text-2xl w-[300px]">
            Para ser miembro tienes que haber comprado
        </div>
    </div>

</template>