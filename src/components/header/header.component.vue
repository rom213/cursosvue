<script lang="ts" setup>
import { RouterLink, useRoute } from 'vue-router';
import { authStore } from '../../store/AuthStore';
import { cartStore } from '../../store/CartStore';
import { ref, watch } from 'vue';

const positionNavigate = ref(0)

const userStore = authStore()

const carSto = cartStore()

const router = useRoute();

watch(() => router.path, () => {
    if (router.path === '/') {
        positionNavigate.value = 0;
    } else if (router.path === '/courses') {
        positionNavigate.value = 1;
    } else if (router.path === '/monetizar') {
        positionNavigate.value = 2;
    }
});


</script>

<template>
    <div class="grid gap-1 p-2 fixed bg-white z-40 w-full">
        <div>
            <div class="flex gap-2 justify-between px-2">
                <h1 class="font-semibold">Cursos estudia y trabaja</h1>
                <RouterLink v-if="userStore.getProfile() == null" :to="{ name: 'login' }"><button
                        class="bg-[#FFBF2B] p-1 px-2 rounded-sm  border-[0.5px]  border-black ">INICIAR SESION</button>
                </RouterLink>

                <div v-if="userStore.getProfile() != null"
                    class="group border border-black p-1 flex text-sm rounded-lg gap-2 relative z-20">
                    <div>{{ userStore.getProfile()?.user?.given_name }}</div>
                    <div>
                        <img class="w-6 h-6 rounded-full" :src="userStore.getProfile()?.user?.picture" alt="">
                    </div>
                    <!-- popober mas informacion -->
                    <div
                        class="hidden group-hover:flex flex-col justify-center  absolute h-16 w-32 right-0 top-8 border border-black rounded-lg bg-white px-2 z-50">
                        <RouterLink :to="{ name: 'mycourses' }" class="flex items-center gap-3">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M18.562 6C18.6157 5.69354 18.6017 5.37903 18.5209 5.07857C18.4402 4.7781 18.2946 4.49895 18.0945 4.26071C17.8944 4.02248 17.6445 3.83093 17.3625 3.69951C17.0805 3.5681 16.7731 3.5 16.462 3.5H5.53801C5.22687 3.5 4.91951 3.5681 4.63749 3.69951C4.35548 3.83093 4.10564 4.02248 3.90552 4.26071C3.7054 4.49895 3.55985 4.7781 3.47909 5.07857C3.39832 5.37903 3.3843 5.69354 3.43801 6M16.5 3.5C16.528 3.24 16.543 3.111 16.543 3.004C16.5441 2.50969 16.3621 2.0325 16.0321 1.66446C15.7021 1.29643 15.2475 1.06364 14.756 1.011C14.65 1 14.52 1 14.26 1H7.74001C7.48001 1 7.34901 1 7.24301 1.011C6.75151 1.06364 6.29692 1.29643 5.96693 1.66446C5.63694 2.0325 5.45492 2.50969 5.45601 3.004C5.45601 3.111 5.47001 3.241 5.49901 3.5"
                                    stroke="black" stroke-width="1.5" />
                                <path
                                    d="M14.0001 17H8.00008M20.1941 15.793C19.8441 18.273 19.6691 19.514 18.7721 20.257C17.8751 21 16.5521 21 13.9051 21H8.09509C5.44909 21 4.12509 21 3.22809 20.257C2.33109 19.514 2.15609 18.274 1.80609 15.793L1.38409 12.793C0.937085 9.629 0.714085 8.048 1.66208 7.023C2.61009 6 4.29808 6 7.67208 6H14.3281C17.7021 6 19.3901 6 20.3381 7.024C21.0871 7.833 21.1051 8.99 20.8591 11"
                                    stroke="black" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                            mis cursos
                        </RouterLink>
                        <RouterLink :to="{ name: 'mycourses' }" class=" flex justify-center items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M11.6324 12.1905L12.0824 11.7435C14.1644 11.8115 14.1964 11.7385 14.2879 11.5245L14.8599 10.132L14.9024 10L14.8559 9.8845C14.8314 9.8235 14.7559 9.6415 13.4559 8.402V7.75C14.9559 6.305 14.9239 6.231 14.8384 6.0195L14.2689 4.6125C14.1834 4.4015 14.1509 4.319 12.0839 4.3755L11.6339 3.9105C11.6809 3.22556 11.6573 2.5376 11.5634 1.8575L11.5054 1.726L10.0184 1.076C9.79941 0.976 9.72241 0.94 8.31841 2.469L7.68741 2.4595C6.24191 0.9165 6.17341 0.9445 5.95691 1.032L4.57441 1.591C4.35791 1.6785 4.28141 1.7095 4.36541 3.8095L3.91891 4.2545C1.83791 4.1865 1.80591 4.2605 1.71541 4.4735L1.14241 5.8665L1.09741 6L1.14441 6.116C1.16891 6.176 1.24141 6.356 2.54441 7.597V8.247C1.04441 9.692 1.07691 9.766 1.16291 9.978L1.73191 11.3865C1.81891 11.602 1.84991 11.6785 3.91641 11.6245L4.36641 12.092C4.31962 12.7759 4.34257 13.4628 4.43491 14.142L4.49291 14.2745L5.98941 14.9285C6.20691 15.0195 6.28241 15.052 7.68241 13.5285L8.31341 13.5365C9.76091 15.0815 9.83491 15.0515 10.0464 14.966L11.4259 14.4085C11.6439 14.322 11.7199 14.2915 11.6324 12.1905ZM5.70341 8.9285C5.52894 8.47253 5.49302 7.97518 5.60015 7.49887C5.70729 7.02255 5.95271 6.58849 6.30562 6.25114C6.65854 5.91379 7.10322 5.68818 7.58388 5.60262C8.06454 5.51706 8.55976 5.57536 9.00741 5.77021C9.45505 5.96505 9.83519 6.28776 10.1001 6.69785C10.365 7.10793 10.5029 7.58712 10.4965 8.07529C10.4901 8.56347 10.3397 9.03887 10.0641 9.44186C9.78849 9.84485 9.40002 10.1575 8.94741 10.3405C8.32988 10.582 7.64182 10.569 7.03385 10.3044C6.42587 10.0397 5.94749 9.54502 5.70341 8.9285Z"
                                    fill="#40535B" />
                            </svg>
                            Configuracion
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>

        <!-- navegacion -->
        <div class="flex justify-between px-6">
            <RouterLink :class="{'border-t border-black px-2': positionNavigate === 0}"  :to="{ name: 'home' }">home</RouterLink>
            <RouterLink :class="{'border-t border-black px-2': positionNavigate === 1}"  :to="{ name: 'courses' }">cursos</RouterLink>
            <RouterLink :class="{'border-t border-black px-2': positionNavigate === 2}"  :to="{ name: 'courses' }">monetizar</RouterLink>
        </div>
        <!-- carrito e input -->
        <div class="flex justify-between items-center">

            <!-- input busqueda -->
            <div v-if="userStore.getProfile() === null">
                <router-link :to="{ name: 'register' }"><button
                        class="bg-[#FFBF2B] p-1 px-2 rounded-sm ">REGISTRARME</button></router-link>
            </div>

            <div>
                <div class="border border-black flex p-1 px-2 rounded-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9.37396 6.408C8.50396 6.4415 7.71746 6.752 7.29696 7.173C7.25051 7.21943 7.19536 7.25624 7.13468 7.28135C7.07399 7.30647 7.00896 7.31938 6.94328 7.31935C6.87761 7.31933 6.81258 7.30637 6.75192 7.28122C6.69125 7.25607 6.63613 7.21921 6.58971 7.17275C6.54329 7.1263 6.50647 7.07115 6.48136 7.01047C6.45625 6.94979 6.44334 6.88475 6.44336 6.81908C6.44338 6.7534 6.45634 6.68838 6.48149 6.62771C6.50665 6.56704 6.54351 6.51193 6.58996 6.4655C7.23846 5.817 8.29446 5.449 9.33496 5.4085C10.3825 5.368 11.526 5.6545 12.327 6.4555C12.4207 6.54932 12.4734 6.67655 12.4733 6.80918C12.4733 6.94182 12.4205 7.069 12.3267 7.16275C12.2329 7.25651 12.1057 7.30915 11.973 7.3091C11.8404 7.30906 11.7132 7.25632 11.6195 7.1625C11.0745 6.617 10.2375 6.374 9.37396 6.4075"
                            fill="black" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M14.468 13.692C15.4593 12.5204 16.0023 11.0347 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.0975 16 12.56 15.424 13.692 14.468L13.5 15.572L17.257 19.329L19.329 17.257L15.572 13.5L14.468 13.692ZM9.5 14.5C12.2615 14.5 14.5 12.2615 14.5 9.5C14.5 6.7385 12.2615 4.5 9.5 4.5C6.7385 4.5 4.5 6.7385 4.5 9.5C4.5 12.2615 6.7385 14.5 9.5 14.5Z"
                            fill="black" />
                        <path
                            d="M17.964 20.036L20.036 17.964L20.714 18.642C21.0955 19.0235 21.0955 19.642 20.714 20.023L20.023 20.714C19.6415 21.0955 19.023 21.0955 18.642 20.714L17.964 20.036Z"
                            fill="black" />
                    </svg>
                    <input class="w-40 outline-none" placeholder="Que quieres aprender" type="text">
                </div>
            </div>
            <!-- carrito de compras -->
            <div class="group relative mr-3">
                <RouterLink :to="{ name: 'cart' }">
                    <div class="relative" v-if="userStore.getProfile() !== null">
                        <div>
                            <svg width="50" height="36" viewBox="0 0 50 36" fill="none"
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
                            class="absolute w-5 h-5 bg-red-500 -top-2 rounded-full -right-1 flex justify-center items-center text-[10px]">
                            <p>{{ carSto.countCart }}</p>
                        </div>
                    </div>

                </RouterLink>
            </div>


        </div>
    </div>
</template>