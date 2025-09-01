<script lang="ts" setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { authStore } from '../../store/AuthStore';
import { cartStore } from '../../store/CartStore';
import { ref, watch } from 'vue';
import HeaderSearchComponent from './header.search.component.vue';
import CartPage from '../../cart/cart.page.vue';

const positionNavigate = ref(0)
const showPoverMore = ref(false);
const showCart = ref(false)

const userStore = authStore()

const carSto = cartStore()

const router = useRouter();
const route = useRoute();

watch(() => route.path, () => {
    if (route.path === '/') {
        positionNavigate.value = 0;
    } else if (route.path === '/courses') {
        positionNavigate.value = 1;
    } else if (route.path === '/monetizar') {
        positionNavigate.value = 2;
    }
});

const hadleCartData = () => {
    if (window.innerWidth > 768) {
        hadleShowCart();
        return;
    }

    router.push({ name: 'cart' })
}

const hadleShowCart = () => {
    showCart.value = !showCart.value
}



</script>

<template>
    <div class="grid gap-1 p-2 fixed bg-white z-10 w-full">
        <div class="relative">
            <div class="flex gap-2 justify-between px-2">
                <h1 class="font-semibold md:text-2xl md:text-center">CURSOS ESTUDIA Y TRABAJA</h1>
                <RouterLink v-if="userStore.getProfile() == null" :to="{ name: 'login' }"><button
                        class="bg-[#FFBF2B] p-1 px-2 rounded-sm  border-[0.5px]  border-black ">INICIAR SESION</button>
                </RouterLink>

                <div v-if="userStore.getProfile() != null"
                    class="border border-black p-1 flex text-sm rounded-lg gap-2 relative z-20 md:items-center md:gap-6 px-3"
                    @click="() => { showPoverMore = !showPoverMore }">
                    <div class="md:text-2xl">{{ userStore.getProfile()?.user?.given_name }}</div>
                    <div>
                        <img class="w-6 h-6 rounded-full md:w-10 md:h-10" :src="userStore.getProfile()?.user?.picture"
                            alt="">
                    </div>
                </div>
                <!-- popober mas informacion -->
                <div @click="() => showPoverMore = false" v-if="showPoverMore"
                    class="flex flex-col justify-center  absolute h-16 right-0 top-12 md:w-52 border border-black rounded-lg bg-white px-2 z-50">
                    <RouterLink :to="{ name: 'mycourses' }" class="grid grid-cols-4">
                        <div class="col-span-1">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M18.562 6C18.6157 5.69354 18.6017 5.37903 18.5209 5.07857C18.4402 4.7781 18.2946 4.49895 18.0945 4.26071C17.8944 4.02248 17.6445 3.83093 17.3625 3.69951C17.0805 3.5681 16.7731 3.5 16.462 3.5H5.53801C5.22687 3.5 4.91951 3.5681 4.63749 3.69951C4.35548 3.83093 4.10564 4.02248 3.90552 4.26071C3.7054 4.49895 3.55985 4.7781 3.47909 5.07857C3.39832 5.37903 3.3843 5.69354 3.43801 6M16.5 3.5C16.528 3.24 16.543 3.111 16.543 3.004C16.5441 2.50969 16.3621 2.0325 16.0321 1.66446C15.7021 1.29643 15.2475 1.06364 14.756 1.011C14.65 1 14.52 1 14.26 1H7.74001C7.48001 1 7.34901 1 7.24301 1.011C6.75151 1.06364 6.29692 1.29643 5.96693 1.66446C5.63694 2.0325 5.45492 2.50969 5.45601 3.004C5.45601 3.111 5.47001 3.241 5.49901 3.5"
                                    stroke="black" stroke-width="1.5" />
                                <path
                                    d="M14.0001 17H8.00008M20.1941 15.793C19.8441 18.273 19.6691 19.514 18.7721 20.257C17.8751 21 16.5521 21 13.9051 21H8.09509C5.44909 21 4.12509 21 3.22809 20.257C2.33109 19.514 2.15609 18.274 1.80609 15.793L1.38409 12.793C0.937085 9.629 0.714085 8.048 1.66208 7.023C2.61009 6 4.29808 6 7.67208 6H14.3281C17.7021 6 19.3901 6 20.3381 7.024C21.0871 7.833 21.1051 8.99 20.8591 11"
                                    stroke="black" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                        </div>

                        <div class="col-span-3">mis cursos</div>

                    </RouterLink>
                    <RouterLink :to="{ name: 'config' }" class="grid grid-cols-4">
                        <div class="col-span-1">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_662_527" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="-1"
                                    y="-1" width="24" height="24">
                                    <path
                                        d="M10.9999 1.83334L8.24992 4.58334H4.58325V8.25001L1.83325 11L4.58325 13.75V17.4167H8.24992L10.9999 20.1667L13.7499 17.4167H17.4166V13.75L20.1666 11L17.4166 8.25001V4.58334H13.7499L10.9999 1.83334Z"
                                        fill="white" stroke="white" stroke-width="4" stroke-linejoin="round" />
                                    <path
                                        d="M11 13.75C11.7293 13.75 12.4288 13.4603 12.9445 12.9445C13.4603 12.4288 13.75 11.7293 13.75 11C13.75 10.2707 13.4603 9.57118 12.9445 9.05546C12.4288 8.53973 11.7293 8.25 11 8.25C10.2707 8.25 9.57118 8.53973 9.05546 9.05546C8.53973 9.57118 8.25 10.2707 8.25 11C8.25 11.7293 8.53973 12.4288 9.05546 12.9445C9.57118 13.4603 10.2707 13.75 11 13.75Z"
                                        fill="black" stroke="black" stroke-width="4" stroke-linejoin="round" />
                                </mask>
                                <g mask="url(#mask0_662_527)">
                                    <path d="M0 0H22V22H0V0Z" fill="black" />
                                </g>
                            </svg>



                        </div>

                        <div class="col-span-3">Configuracion</div>

                    </RouterLink>
                </div>
            </div>
        </div>

        <!-- navegacion -->
        <div class="flex justify-between px-3 md:text-xl flex-col md:flex-row">
            <div class="flex gap-4 md:gap-20">
                <RouterLink :class="{ 'border-t border-black px-2': positionNavigate === 0 }" :to="{ name: 'home' }">
                    HOME
                </RouterLink>
                <RouterLink :class="{ 'border-t border-black px-2': positionNavigate === 1 }" :to="{ name: 'courses' }">
                    CURSOS
                </RouterLink>
                <RouterLink :class="{ 'border-t border-black px-2': positionNavigate === 2 }" :to="{ name: 'courses' }">
                    MONETIZAR</RouterLink>
            </div>
            <!-- carrito e input -->
            <div>
                <div class="flex justify-between items-center md:justify-end md:gap-12">

                    <!-- esto aparece en el caso de que no se haya logeado -->
                    <div v-if="userStore.getProfile() === null">
                        <router-link :to="{ name: 'register' }"><button
                                class="bg-[#FFBF2B] p-1 px-2 rounded-sm ">REGISTRARME</button></router-link>
                    </div>

                    <!-- input busqueda -->
                    <HeaderSearchComponent />
                    <!-- carrito de compras -->
                    <div class="group relative mr-3">
                        <div @click="hadleCartData()">
                            <div class="relative" v-if="userStore.getProfile() !== null">
                                <div class="">
                                    <svg class="w-10 h-10 md:w-20 md:h-11" viewBox="0 0 50 36" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.5" y="0.5" width="49" height="35" rx="9.5"
                                            fill="url(#paint0_linear_294_321)" />
                                        <rect x="0.5" y="0.5" width="49" height="35" rx="9.5" stroke="black" />
                                        <path
                                            d="M35.2154 10.2358C35.1059 10.1094 34.9704 10.0081 34.8182 9.93863C34.666 9.86918 34.5007 9.83327 34.3334 9.83333H18.2112L17.9837 8.47533C17.9385 8.20292 17.798 7.9554 17.5874 7.7768C17.3767 7.59821 17.1096 7.50013 16.8334 7.5H14.2084C13.899 7.5 13.6022 7.62292 13.3835 7.84171C13.1647 8.0605 13.0417 8.35725 13.0417 8.66667C13.0417 8.97609 13.1647 9.27283 13.3835 9.49162C13.6022 9.71042 13.899 9.83333 14.2084 9.83333H15.8452L18.0152 22.858L18.0677 23.0027L18.1307 23.1788L18.2707 23.3877L18.3816 23.5183L18.6067 23.67L18.7374 23.7458C18.8734 23.8017 19.0186 23.8314 19.1656 23.8333H32.0001C32.3095 23.8333 32.6062 23.7104 32.825 23.4916C33.0438 23.2728 33.1667 22.9761 33.1667 22.6667C33.1667 22.3572 33.0438 22.0605 32.825 21.8417C32.6062 21.6229 32.3095 21.5 32.0001 21.5H20.1549L19.9612 20.3333H33.1667C33.4475 20.3334 33.7188 20.2322 33.931 20.0483C34.1431 19.8644 34.2819 19.6102 34.3217 19.3323L35.4884 11.1657C35.5122 11.0002 35.5001 10.8315 35.453 10.6711C35.4059 10.5106 35.3249 10.3622 35.2154 10.2358ZM32.9882 12.1667L32.6557 14.5H28.5001V12.1667H32.9882ZM27.3334 12.1667V14.5H23.8334V12.1667H27.3334ZM27.3334 15.6667V18H23.8334V15.6667H27.3334ZM22.6667 12.1667V14.5H19.1667L18.9941 14.535L18.5997 12.1667H22.6667ZM19.1831 15.6667H22.6667V18H19.5716L19.1831 15.6667ZM28.5001 18V15.6667H32.4877L32.1552 18H28.5001Z"
                                            fill="black" />
                                        <path
                                            d="M20.9167 28.5C21.8832 28.5 22.6667 27.7165 22.6667 26.75C22.6667 25.7835 21.8832 25 20.9167 25C19.9502 25 19.1667 25.7835 19.1667 26.75C19.1667 27.7165 19.9502 28.5 20.9167 28.5Z"
                                            fill="black" />
                                        <path
                                            d="M31.4167 28.5C32.3832 28.5 33.1667 27.7165 33.1667 26.75C33.1667 25.7835 32.3832 25 31.4167 25C30.4502 25 29.6667 25.7835 29.6667 26.75C29.6667 27.7165 30.4502 28.5 31.4167 28.5Z"
                                            fill="black" />
                                        <defs>
                                            <linearGradient id="paint0_linear_294_321" x1="25" y1="0" x2="25" y2="36"
                                                gradientUnits="userSpaceOnUse">
                                                <stop stop-color="#FFFEFA" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                </div>
                                <div v-if="carSto.countCart !== 0"
                                    class="absolute w-5 h-5 bg-red-500 -top-2 rounded-full -right-1 sm:-right-0 flex justify-center items-center text-[10px]">
                                    <p>{{ carSto.countCart }}</p>
                                </div>
                            </div>

                        </div>
                    </div>


                </div>
            </div>
        </div>


    </div>



    <!-- carrito de compra solo si es mayor a 780px -->
    <div v-if="showCart" class="w-[400px] hidden md:block right-0">
        <div class="fixed right-12 z-50 top-2" @click="hadleShowCart()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </div>

        <CartPage />
    </div>
</template>