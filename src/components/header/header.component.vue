<script lang="ts" setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { authStore } from '../../store/AuthStore';
import { cartStore } from '../../store/CartStore';
import { ref, watch } from 'vue';
import HeaderSearchComponent from './header.search.component.vue';
import CartPage from '../../cart/cart.page.vue';
import { icons } from './headerIcons';
import { GoogleLogin } from 'vue3-google-login';
import AuthService from '../../services/AuthServices';

const handleLoginSuccess = async (response: any) => {
    const ser = await AuthService.verifyToken(response.credential)
    userStore.setProfile(ser)
}

const positionNavigate = ref(0)
const showPoverMore = ref(false);
const showCart = ref(false)

const userStore = authStore()

const carSto = cartStore()

const router = useRouter();
const route = useRoute();

watch(() => route.path, () => {
    if (route.name === 'home' || route.path === '/') {
        positionNavigate.value = 0;
    } else if (route.name === 'courses' || route.path === '/courses') {
        positionNavigate.value = 1;
    } else if (route.name === 'monetizar' || route.path === '/monetizar') {
        positionNavigate.value = 2;
    } else if (route.name === 'mycourses') {
        positionNavigate.value = 3;
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
    <div class="fixed top-0 left-0 w-full z-50 bg-white shadow-md backdrop-blur-md bg-opacity-95 transition-all duration-300">
        <!-- Top Bar -->
        <div class="w-full">
            <div class="flex justify-between items-center h-16 px-12">
                <!-- Logo -->
                <div class="flex items-center gap-2">
                <RouterLink :to="{ name: 'home' }" class="flex items-center gap-4">
                <img src="../../assets/home/logo_cursos.png" alt="Logo" class="h-10 w-auto">

                <span class="font-bold text-xl md:text-2xl tracking-tight text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                    CURSOS ESTUDIA Y TRABAJA
                </span>
                </RouterLink>
                </div>

                <!-- Right Side: User & Cart -->
                <div class="flex items-center gap-4">
                     <!-- Login Button -->
                    <div v-if="userStore.getProfile() == null">
                        <!-- @ts-ignore -->
                        <GoogleLogin :callback="handleLoginSuccess" />
                    </div>
                    <!-- <RouterLink v-if="userStore.getProfile() == null" :to="{ name: 'login' }">
                        <button class="bg-[#FFBF2B] hover:bg-[#ffcf5c] text-slate-900 font-medium py-2 px-4 rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-sm md:text-base">
                            INICIAR SESION
                        </button>
                    </RouterLink> -->

                    <!-- User Profile Dropdown -->
                    <div v-if="userStore.getProfile() != null" class="relative">
                         <div 
                            class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-full transition-colors border border-transparent hover:border-gray-200"
                            @click="() => { showPoverMore = !showPoverMore }">
                             <img class="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shadow-sm" :src="userStore.getProfile()?.user?.picture" alt="User Profile">
                             <span class="hidden md:block font-medium text-gray-700 text-sm md:text-base pr-2 truncate max-w-[150px]">
                                {{ userStore.getProfile()?.user?.given_name }}
                             </span>
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                             </svg>
                        </div>

                         <!-- Popover Menu -->
                        <div v-if="showPoverMore"
                            class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-1 z-50 transform origin-top-right transition-all">
                             <div @click="() => showPoverMore = false" class="fixed inset-0 z-[-1]" ></div> <!-- Click backdrop to close -->
                            <div class="px-4 py-3 border-b border-gray-100">
                                <p class="text-sm font-medium text-gray-900 truncate">{{userStore.getProfile()?.user?.name}}</p>
                                <p class="text-xs text-gray-500 truncate">{{userStore.getProfile()?.user?.email}}</p>
                            </div>
                            <RouterLink :to="{ name: 'mycourses' }" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-3" @click="showPoverMore = false">
                                <div class="w-5 h-5 text-gray-500" v-html="icons.myCourses"></div>
                                <span>Mis Cursos</span>
                            </RouterLink>
                            <RouterLink :to="{ name: 'config' }" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-3" @click="showPoverMore = false">
                                <div class="w-5 h-5 text-gray-500" v-html="icons.config"></div>
                                <span>Configuración</span>
                            </RouterLink>
                             <!-- Add logout or other links here if needed -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation & Search Bar (Bottom Row) -->
        <div class="border-t border-gray-100 bg-gray-50/50">
             <div class="w-full px-12">
                <div class="flex flex-col md:flex-row justify-between items-center py-2 gap-4 px-8">
                     <!-- Navigation Links -->
                    <div class="flex gap-6 md:gap-8 w-full md:w-auto justify-center md:justify-start">
                        <RouterLink :to="{ name: 'home' }" 
                            class="group flex flex-col items-center justify-center py-1 px-2 relative font-medium text-gray-600 hover:text-blue-600 transition-colors"
                            :class="{ 'text-blue-600': positionNavigate === 0 }">
                            <span class="" v-html="icons.home"></span>
                            <span class="text-xs md:text-sm">Inicio</span>
                             <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform group-hover:scale-x-100"
                                  :class="{'scale-x-100': positionNavigate === 0}"></span>
                        </RouterLink>

                        <RouterLink :to="{ name: 'courses' }"
                             class="group flex flex-col items-center py-1 px-2 relative font-medium text-gray-600 hover:text-blue-600 transition-colors"
                             :class="{ 'text-blue-600': positionNavigate === 1 }">
                             <span class="" v-html="icons.courses"></span>
                             <span class="text-xs md:text-sm">Cursos</span>
                             <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform group-hover:scale-x-100"
                                   :class="{'scale-x-100': positionNavigate === 1}"></span>
                        </RouterLink>

                        <RouterLink :to="{ name: 'monetizar' }"
                             class="group flex flex-col items-center py-1 px-2 relative font-medium text-gray-600 hover:text-blue-600 transition-colors"
                             :class="{ 'text-blue-600': positionNavigate === 2 }">
                             <span class="" v-html="icons.monetizar"></span>
                             <span class="text-xs md:text-sm">Monetizar</span>
                             <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform group-hover:scale-x-100"
                                   :class="{'scale-x-100': positionNavigate === 2}"></span>
                        </RouterLink>
                        <!-- work -->
                        <RouterLink v-if="userStore.getProfile()?.user?.is_bought"  :to="{ name: 'mycourses' }"
                             class="group flex flex-col items-center py-1 px-2 relative font-medium text-gray-600 hover:text-blue-600 transition-colors"
                             :class="{ 'text-blue-600': positionNavigate === 3 }">
                             <span class="" v-html="icons.misCursos"></span>
                             <span class="text-xs md:text-sm">Mis Cursos</span>
                             <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform group-hover:scale-x-100"
                                   :class="{'scale-x-100': positionNavigate === 3}"></span>
                        </RouterLink>
                    </div>

                    <!-- Search & Cart & Register -->
                    <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        
                         <!-- Register Button (if not logged in) -->
                         <div v-if="userStore.getProfile() === null" class="hidden md:block">
                            <router-link :to="{ name: 'register' }">
                                <button class="bg-[#FFBF2B] hover:bg-[#ffcf5c] text-slate-900 font-medium py-1.5 px-4 rounded-full shadow-sm hover:shadow-md transition-all text-sm">
                                    REGISTRARME
                                </button>
                            </router-link>
                        </div>
                        
                        <!-- Search Bar -->
                        <div class="flex-grow md:flex-grow-0">
                            <HeaderSearchComponent />
                        </div>

                         <!-- Cart Icon -->
                         <div class="relative group cursor-pointer p-2 hover:bg-gray-200 rounded-full transition-colors" @click="hadleCartData()">
                            <div class="w-6 h-6 text-gray-700" v-html="icons.cart"></div>
                            <div v-if="carSto.countCart !== 0"
                                class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {{ carSto.countCart }}
                            </div>
                         </div>
                    </div>
                </div>
             </div>
        </div>
    </div>
    
    <!-- Spacer to prevent content from being hidden behind fixed header -->
    <div class="h-32 md:h-28"></div>

    <!-- Cart Sidebar -->
    <div v-if="showCart" class="fixed inset-0 z-[60] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute inset-0 bg-opacity-75 transition-opacity" @click="hadleShowCart()" aria-hidden="true"></div>
            <div class="fixed inset-y-0 right-0 max-w-full flex">
                <div class="w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700"
                    :class="showCart ? 'translate-x-0' : 'translate-x-full'">
                    <div class="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                        <div class="p-4 flex justify-between items-center border-b border-gray-200">
                             <h2 class="text-lg font-medium text-gray-900">Tu Carrito</h2>
                             <button @click="hadleShowCart()" class="text-gray-400 hover:text-gray-500 w-6 h-6">
                                 <span class="sr-only">Cerrar panel</span>
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                 </svg>
                             </button>
                        </div>
                        <div class="flex-1 p-4">
                             <CartPage />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>