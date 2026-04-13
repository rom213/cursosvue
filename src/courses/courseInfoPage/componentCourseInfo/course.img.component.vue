<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { categoryStore } from '../../../store/CategoryStore';
import type { ICategory } from '../../../types/Categorie';
import { cartStore } from '../../../store/CartStore';
import { authStore } from '../../../store/AuthStore';

import AffiliatyMessageComponent from '../../../components/auth/affiliaty.message.component.vue';
import { useTracking } from '../../../composables/useTracking';
const router = useRouter();
const { trackAddToCart } = useTracking();

const category = ref<ICategory>()

const route = useRoute()
const userAuth = authStore()
const cartSt = cartStore();


const storeCategory = categoryStore()


watch(() => route.params.id, () => {
    let index = Number(route.params.id);
    category.value = storeCategory.findCategoryById(index);
})




watch(() => storeCategory.categories, () => {
    let index = Number(route.params.id);
    category.value = storeCategory.findCategoryById(index);
})





const addCarCategory = (item: ICategory | undefined) => {
    if (item) {
        if (userAuth.getProfile() == null) {
            router.push("/login")
            return
        }
        if (cartSt.validateCart(item)) {
            cartSt.setCart(item)
            trackAddToCart(item)
        }
    }
}

</script>

<template>
    <div>
        <div class="p-2 grid gap-3 text-sm">
            <div v-if="userAuth.nameAffiliaty" class="text-[10px] mt-1 pl-2 font-semibold">Comprar con el descuento de
                {{ userAuth.nameAffiliaty }}</div>

            <div class="text-center">
                <h3 class="font-semibold text-2xl">{{ category?.titulo }}</h3>
                <p>{{ category?.frase_1 }}</p>
            </div>
            <!-- curso -->
            <div class="grid grid-cols-2 gap-2">
                <!-- section img -->
                <div class="border border-black rounded-sm p-0.5 grid gap-3 pb-2">
                    <div>
                        <img class="w-full rounded-sm" :src="category?.imagen_url" alt="">
                    </div>
                    <div class="md:hidden">
                        <div class="grid gap-2" v-if="!category?.user_bought">
                            <button class="flex items-center bg-[#CDFF00] rounded-lg">
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

                            <button @click="addCarCategory(storeCategory.getCategory())"
                                class="bg-[#2BA0FF] rounded-sm p-1 w-full">Agregar
                                carrito</button>
                        </div>
                        <div v-if="category?.user_bought">
                            <button class="flex items-center bg-[#CDFF00] rounded-lg w-full p-1 justify-evenly">
                                <div>
                                    Ver mis cursos
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
                <!-- section description -->
                <div class="grid gap-2">
                    <div class="grid gap-2">
                        <div class="flex flex-col gap-3">
                            Porque conseguir un solo
                            curso si puedes tener 500
                            aprende de los mejores
                            mentores
                            <div>
                                N# cursos: {{ category?.courses.length }}
                            </div>

                        </div>
                        <div class="hidden md:flex w-full">


                            <div class="grid  grid-cols-2 gap-2 w-full h-12" v-if="!category?.user_bought">
                                <button class="flex items-center bg-[#CDFF00] rounded-lg justify-center gap-3 font-bold cursor-pointer hover:scale-[102%]">
                                    <div>
                                        VISTA PREVIA
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

                                <button @click="addCarCategory(storeCategory.getCategory())"
                                    class="bg-[#2BA0FF] rounded-sm p-1 w-full font-bold text-white cursor-pointer hover:scale-[102%]">AGREGAR CARRITO 🛒</button>
                            </div>
                            <div v-if="category?.user_bought">
                                <button class="flex items-center bg-[#CDFF00] rounded-lg w-full p-1 justify-evenly">
                                    <div>
                                        Ver mis cursos
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

            </div>

        </div>

        <!-- link de afiliado -->
        <AffiliatyMessageComponent :id_category="category?.id" />
    </div>
</template>