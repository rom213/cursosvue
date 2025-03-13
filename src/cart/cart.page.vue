<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { usePayU } from '../payu/usePayu';
import PaymentService from '../services/PaymentService';
import { authStore } from '../store/AuthStore';
import { cartStore } from '../store/CartStore';
import ItemComponent from './item.component.vue';
import type { ICategory } from '../types/Categorie';
const storeCart = cartStore()
const userAuth = authStore()
const { generatePayUForm } = usePayU();




const buyCategory = () => {
    let data = storeCart.getCart().map(item => ({ id_category: item.id }));
    PaymentService.generate_signature_reference_code({ categories: data }).then((res)=>{
        if (res?.signature) {
            generatePayUForm(res?.price, " carrito de compras", userAuth.getProfile()?.user?.email, res?.signature, res?.reference_code)
        }
    });
};


const cart = ref<ICategory[]>([]);
const valueCart = ref<number>(0)



onMounted(() => {
    cart.value=storeCart.getCart()
    valueCart.value=0
    cart.value?.forEach((item, index) => {
        if (!userAuth.getProfile()?.user?.is_bought && index>0) {
            item.precio_desc= item.precio_desc/2
        }
        valueCart.value=valueCart.value + item.precio_desc
    });
});


watch(()=>storeCart.cartCategories, ()=>{
    cart.value=storeCart.getCart()
    valueCart.value=0
    cart.value?.forEach((item, index) => {
        if (!userAuth.getProfile()?.user?.is_bought && index>0) {
            item.precio_desc= item.precio_desc/2
        }
        valueCart.value=valueCart.value + item.precio_desc
    });
})





</script>

<template>

    <div>
        <div>
            <div class="flex justify-center gap-5">
                <h2 class="font-semibold">CARRITO DE COMPRA</h2>
                <!-- icono carrito -->
                <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M26.445 6.68125C26.3276 6.54582 26.1825 6.43722 26.0194 6.36282C25.8564 6.28841 25.6792 6.24993 25.5 6.25H8.22625L7.9825 4.795C7.93398 4.50312 7.78349 4.23792 7.55781 4.04657C7.33212 3.85523 7.04588 3.75014 6.75 3.75H3.9375C3.60598 3.75 3.28804 3.8817 3.05362 4.11612C2.8192 4.35054 2.6875 4.66848 2.6875 5C2.6875 5.33152 2.8192 5.64946 3.05362 5.88388C3.28804 6.1183 3.60598 6.25 3.9375 6.25H5.69125L8.01625 20.205L8.0725 20.36L8.14 20.5487L8.29 20.7725L8.40875 20.9125L8.65 21.075L8.79 21.1562C8.93565 21.2161 9.09129 21.2479 9.24875 21.25H23C23.3315 21.25 23.6495 21.1183 23.8839 20.8839C24.1183 20.6495 24.25 20.3315 24.25 20C24.25 19.6685 24.1183 19.3505 23.8839 19.1161C23.6495 18.8817 23.3315 18.75 23 18.75H10.3088L10.1013 17.5H24.25C24.5508 17.5 24.8415 17.3916 25.0688 17.1946C25.2961 16.9976 25.4448 16.7252 25.4875 16.4275L26.7375 7.6775C26.763 7.50018 26.75 7.31945 26.6996 7.14757C26.6491 6.97568 26.5623 6.81665 26.445 6.68125ZM24.0588 8.75L23.7025 11.25H19.25V8.75H24.0588ZM18 8.75V11.25H14.25V8.75H18ZM18 12.5V15H14.25V12.5H18ZM13 8.75V11.25H9.25L9.065 11.2875L8.6425 8.75H13ZM9.2675 12.5H13V15H9.68375L9.2675 12.5ZM19.25 15V12.5H23.5225L23.1662 15H19.25Z"
                        fill="black" />
                    <path
                        d="M11.125 26.25C12.1605 26.25 13 25.4105 13 24.375C13 23.3395 12.1605 22.5 11.125 22.5C10.0895 22.5 9.25 23.3395 9.25 24.375C9.25 25.4105 10.0895 26.25 11.125 26.25Z"
                        fill="black" />
                    <path
                        d="M22.375 26.25C23.4105 26.25 24.25 25.4105 24.25 24.375C24.25 23.3395 23.4105 22.5 22.375 22.5C21.3395 22.5 20.5 23.3395 20.5 24.375C20.5 25.4105 21.3395 26.25 22.375 26.25Z"
                        fill="black" />
                </svg>

            </div>
            <p class="text-sm text-center">Cada gran logro comienza con un pequeño paso</p>
        </div>
        <br>

        <!-- seccion carrito vasio -->
        <div  v-if="valueCart == 0">
            <div class="text-center font-light">
                TU CARRITO ESTA VACIO
                YA PUEDES AGREGAR LOS CURSOS QUE QUIERAS
            </div>
            <div class="flex justify-center">
                <svg width="40" height="42" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0.5 13.5H39.5L37.4647 36.4525C37.3546 37.6948 36.7958 38.85 35.8979 39.6914C35 40.5328 33.8278 40.9995 32.6116 41H7.38838C6.17215 40.9995 5.00004 40.5328 4.10213 39.6914C3.20422 38.85 2.64538 37.6948 2.53531 36.4525L0.5 13.5Z"
                        stroke="black" stroke-linejoin="round" />
                    <path
                        d="M10.25 18.5V11C10.25 8.34784 11.2772 5.8043 13.1057 3.92893C14.9342 2.05357 17.4141 1 20 1C22.5859 1 25.0658 2.05357 26.8943 3.92893C28.7228 5.8043 29.75 8.34784 29.75 11V18.5"
                        stroke="black" stroke-linecap="round" />
                </svg>

            </div>
        </div>

        <div class="flex flex-col gap-3 px-2 overflow-auto">
            <div v-for="(item, index) in cart" :key="index">
                
                <ItemComponent :item="item" />
                <div class="mt-7 mb-1 text-sm" v-if="index===0 && cart.length>1 && !userAuth.getProfile()?.user?.is_bought">Al SER PRIMERA COMPRA, DESCUENTO 50% 🎁
                </div>
            </div>
        </div>


        <!-- si no hay nada en el carro no muestra nada -->
        <div v-if="valueCart >= 1"
            class="flex gap-6 w-full fixed bottom-0 h-[80px] border border-black items-center justify-center font-semibold bg-white">
            <div>
                Valor total ${{ valueCart }}
            </div>
            <div>
                <button class="bg-[#CDFF00] p-2 rounded-lg" @click="buyCategory()">comprar ahora</button>
            </div>
        </div>
    </div>


</template>