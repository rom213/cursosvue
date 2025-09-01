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
    <div class="p-4 grid gap-4 text-sm">
        <div class="bg-white shadow-lg rounded-lg p-4">
            <h3 class="font-extrabold text-2xl text-gray-900">{{ item.titulo }}</h3>
            <p class="text-gray-700">{{ item.frase_1 }}</p>
        </div>
        
        <!-- Card Item -->
        <div class="grid grid-cols-2 gap-4">
            <!-- Image Section -->
            <div class="border rounded-lg overflow-hidden shadow-md">
                <div @click="handleClickItem(item.id)" class="cursor-pointer">
                    <img class="w-full rounded-lg transition-transform duration-300 hover:scale-105" :src="item.imagen_url" alt="Course Image">
                </div>
                <div class="p-3">
                    <div @click="handleClickItem(item.id)" class="flex justify-between items-center">
                        <div class="text-lg font-medium text-gray-800">{{ item.num_per }}</div>
                        <div class="text-xl text-green-500 font-bold">{{ item.precio }}k</div>
                    </div>
                    <div class="mt-2 text-sm text-red-500">
                        <p class="bg-red-100 text-center rounded py-1">{{ item.descuento }}% OFF</p>
                        <div class="flex justify-between">
                            <div>{{ item.descuento }}% DTO</div>
                            <div>${{ item.precio }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Description Section -->
            <div class="grid gap-3">
                <div @click="handleClickItem(item.id)" class="text-gray-700">
                    <div class="font-semibold">Porque conseguir un solo curso si puedes tener 500</div>
                    <div class="text-sm">N# cursos: 500</div>
                    <div class="text-sm">Certificación: Sí</div>
                </div>
                
                <!-- Buttons Section -->
                <div class="flex flex-col gap-3">
                    <button @click="addCarCategory(item)" class="bg-blue-500 hover:scale-102 cursor-pointer text-white rounded-full py-2 font-semibold transition-all">
                        AGREGAR AL CARRITO
                    </button>
                    <button @click="() => { storeemergentBuy.handleEmergentBuy(); storeemergentBuy.setCategoryEmergent(item)}" 
                        class="bg-yellow-400 hover:scale-102 cursor-pointer hover:bg-yellow-500 text-black rounded-full py-2 font-semibold transition-all">
                        Comprar ${{ item.precio_desc }}
                    </button>
                    <p class="text-xs text-center mt-2" v-if="referCode == null && !userAuth.getProfile()?.user?.is_bought">
                        ¡Tenemos un regalo para ti! 🎁
                    </p>
                </div>
            </div>
        </div>

        <!-- Affiliate Message -->
        <AffiliatyMessageComponent class="" :id_category="item.id" />
    </div>
</template>

<style scoped>
/* Custom styles to improve the look */
.bg-red-100 {
    background-color: #FEE2E2;
}

.bg-blue-500 {
    background-color: #3B82F6;
}

.bg-yellow-400 {
    background-color: #FBBF24;
}

.text-gray-700 {
    color: #4B5563;
}

.text-green-500 {
    color: #10B981;
}

.text-red-500 {
    color: #EF4444;
}

.shadow-md {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rounded-lg {
    border-radius: 8px;
}

.transition-transform {
    transition: transform 0.3s ease;
}
</style>
