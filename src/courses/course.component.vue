<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { authStore } from '../store/AuthStore';
import type { ICategory } from '../types/Categorie';
import { cartStore } from '../store/CartStore';
import AffiliatyMessageComponent from '../components/auth/affiliaty.message.component.vue';
import { emergentBuyStore } from '../store/EmergentBuyStore';

const cartSt = cartStore()
const storeemergentBuy = emergentBuyStore();

const router = useRouter();
const userAuth = authStore()








const addCarCategory = (item: ICategory) => {
    if (userAuth.getProfile() == null) {
        router.push("/login")
        return
    }
    if (cartSt.validateCart(item)) {

        cartSt.setCart(item)
    }
}

const handleClickItem = (id: number) => {
    router.push({ name: 'courses-description', params: { id: id } })
}


defineProps<{
    item: ICategory;
    referCode: string | null
}>();
</script>


<template>
    <div class="p-2 grid gap-3 text-sm">
        <div>
            <h3 class="font-extrabold text-xl">{{ item.titulo }}</h3>
            <p>{{ item.frase_1 }}</p>
        </div>
        <!-- curso -->
        <div class="grid grid-cols-2 gap-2">
            <!-- section img -->
            <div class="border border-black rounded-sm p-0.5">
                <div @click="handleClickItem(item.id)">
                    <img class="w-full rounded-sm" :src="item.imagen_url" alt="">
                </div>
                <div class="px-1 grid">
                    <div @click="handleClickItem(item.id)">
                        <div class="px-2">
                            <div class="flex justify-between text-sm">
                                <div class="flex">
                                    <div>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 12.5C10.9 12.5 9.95833 12.1083 9.175 11.325C8.39167 10.5417 8 9.6 8 8.5C8 7.4 8.39167 6.45833 9.175 5.675C9.95833 4.89167 10.9 4.5 12 4.5C13.1 4.5 14.0417 4.89167 14.825 5.675C15.6083 6.45833 16 7.4 16 8.5C16 9.6 15.6083 10.5417 14.825 11.325C14.0417 12.1083 13.1 12.5 12 12.5ZM4 18.5V17.7C4 17.1333 4.146 16.6127 4.438 16.138C4.73 15.6633 5.11733 15.3007 5.6 15.05C6.63333 14.5333 7.68333 14.146 8.75 13.888C9.81667 13.63 10.9 13.5007 12 13.5C13.1 13.4993 14.1833 13.6287 15.25 13.888C16.3167 14.1473 17.3667 14.5347 18.4 15.05C18.8833 15.3 19.271 15.6627 19.563 16.138C19.855 16.6133 20.0007 17.134 20 17.7V18.5C20 19.05 19.8043 19.521 19.413 19.913C19.0217 20.305 18.5507 20.5007 18 20.5H6C5.45 20.5 4.97933 20.3043 4.588 19.913C4.19667 19.5217 4.00067 19.0507 4 18.5ZM6 18.5H18V17.7C18 17.5167 17.9543 17.35 17.863 17.2C17.7717 17.05 17.6507 16.9333 17.5 16.85C16.6 16.4 15.6917 16.0627 14.775 15.838C13.8583 15.6133 12.9333 15.5007 12 15.5C11.0667 15.4993 10.1417 15.612 9.225 15.838C8.30833 16.064 7.4 16.4013 6.5 16.85C6.35 16.9333 6.229 17.05 6.137 17.2C6.045 17.35 5.99933 17.5167 6 17.7V18.5ZM12 10.5C12.55 10.5 13.021 10.3043 13.413 9.913C13.805 9.52167 14.0007 9.05067 14 8.5C13.9993 7.94933 13.8037 7.47867 13.413 7.088C13.0223 6.69733 12.5513 6.50133 12 6.5C11.4487 6.49867 10.978 6.69467 10.588 7.088C10.198 7.48133 10.002 7.952 10 8.5C9.998 9.048 10.194 9.519 10.588 9.913C10.982 10.307 11.4527 10.5027 12 10.5Z"
                                                fill="black" />
                                        </svg>
                                    </div>
                                    <div>
                                        {{ item.num_per }}
                                    </div>
                                </div>
                                <div class="flex ">
                                    <div>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 11.5V20.5H3V11.5H7Z" fill="black" fill-opacity="0.3" />
                                            <path
                                                d="M7 11.5L12 3.5L15 4.5L14 10.5H21V13.5L18 20.5H7M7 11.5H3V20.5H7M7 11.5V20.5"
                                                stroke="black" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>

                                    </div>
                                    <div>
                                        {{ item.precio }}k
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="text-[#FF0000] text-sm">
                            <p class="text-center bg-[#FFE8E8]">Ultimos dias</p>
                            <div class="flex justify-between">
                                <div>
                                    {{ item.descuento }}% DTO.
                                </div>
                                <div>
                                    ${{ item.precio }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pt-1">
                        <div class="grid gap-2">
                            <button @click="addCarCategory(item)" class="bg-[#2BA0FF] rounded-sm p-1">Agregar
                                carrito</button>
                            <button
                                @click="() => { storeemergentBuy.handleEmergentBuy(); storeemergentBuy.setCategoryEmergent(item)}"
                                class="bg-[#CDFF00] rounded-sm p-1">
                                <!-- se muestra el precio de + 4000 si no ha comprado y  hay referido -->
                                <p v-if="referCode == null && !userAuth.getProfile()?.user?.is_bought">
                                    comprar ${{ item.precio_desc + 3999 }}
                                </p>
                                <!-- se muestra el precio real si la persona compro o hay codigo de referrencia -->
                                <p v-if="referCode || userAuth.getProfile()?.user?.is_bought">
                                    comprar ${{ item.precio_desc }}
                                </p>
                            </button>
                            <p class="text-[10px] -mt-1 w-full text-center"
                                v-if="referCode == null && !userAuth.getProfile()?.user?.is_bought">
                                Tenemos un regalo para ti 🎁
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <!-- section description -->
            <div class="grid gap-2">
                <div @click="handleClickItem(item.id)" class="grid gap-2">
                    <div>
                        Porque conseguir un solo
                        curso si puedes tener 500
                        aprende de los mejores
                        mentores
                    </div>
                    <div>
                        N# cursos: 500
                    </div>
                    <div>
                        Certificacion: Si
                    </div>

                    <div class="grid gap-2">
                        <div class="flex gap-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.25" y="0.25" width="23.5" height="23.5" stroke="black" stroke-width="0.5" />
                                <path d="M7 6L12 11L17 6M7 13L12 18L17 13" stroke="black" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div>
                                Lista de cursos
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.25" y="0.25" width="23.5" height="23.5" stroke="black" stroke-width="0.5" />
                                <path d="M7 6L12 11L17 6M7 13L12 18L17 13" stroke="black" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div>
                                Lista de cursos
                            </div>
                        </div>
                    </div>
                </div>
                <!-- booton google drive -->
                <div>
                    <button class="flex items-center bg-[#CDFF00] rounded-lg p-1">
                        <div>
                            Vista previa de los cursos en tu drive
                        </div>
                        <div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_352_56)">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M14.31 3C14.6332 3 14.9516 3.07832 15.2379 3.22827C15.5243 3.37822 15.77 3.59533 15.954 3.861L16.042 4L21.815 14C21.9755 14.2779 22.0667 14.5904 22.081 14.911C22.0952 15.2316 22.0321 15.5509 21.897 15.842L21.815 16L19.505 20C19.3435 20.2798 19.1165 20.5162 18.8436 20.6892C18.5707 20.8621 18.26 20.9664 17.938 20.993L17.774 21H6.22703C5.90365 21.0002 5.58506 20.9219 5.29856 20.772C5.01205 20.622 4.76619 20.4048 4.58202 20.139L4.49502 20L2.18502 16C2.02458 15.7221 1.93337 15.4096 1.91909 15.089C1.90482 14.7684 1.96791 14.4491 2.10302 14.158L2.18502 14L7.96002 4C8.12169 3.72009 8.34878 3.48354 8.62187 3.3106C8.89495 3.13766 9.20588 3.03349 9.52802 3.007L9.69102 3H14.31ZM19.506 16H9.11302L7.38102 19H17.774L19.506 16ZM9.11403 6L3.91702 15L5.64902 18L10.845 9L9.11403 6ZM14.31 5H10.846L16.042 14H19.506L14.31 5ZM12 11L10.268 14H13.732L12 11Z"
                                        fill="black" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_352_56">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                    </button>
                </div>
            </div>

        </div>

    </div>

    <!-- link de afiliado -->
    <AffiliatyMessageComponent class="z-50" :id_category="item.id" />





</template>