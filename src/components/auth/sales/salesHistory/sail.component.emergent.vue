<script lang="ts" setup>
import { ref } from 'vue';
import type { ISail } from '../../../../types/Sail';

ref()
defineProps<{
    item: ISail | null;
}>();

</script>


<template>
    <div class="grid grid-cols-2">
        <div class="grid gap-2">
            <div class="w-full">
                <div class="text-sm">
                    TIPO AFILIACION
                </div>
                <div class="text-sm font-bold">
                    {{ item?.affiliaty }}
                </div>
            </div>
            <div class="w-full">
                <div class="text-sm">
                    NOMBRE CATEGORIA
                </div>
                <div class="text-sm font-bold">
                    {{ item?.category_bought }}
                </div>
            </div>
            <div class="w-full">
                <div class="text-sm">
                    PRECIO CATEGORIA
                </div>
                <div class="text-sm font-bold">
                    ${{ item?.category_price }}
                </div>
            </div>
            <div class="w-full">
                <div class="text-sm">
                    GANANCIA VENDEDOR
                </div>
                <div class="text-sm font-bold">
                    ${{ item?.refund_price }}
                </div>
            </div>
        </div>

        <div class="grid gap-2">
            <div class="w-full">
                <div class="text-sm">
                    PORCENTAJE DE DESEMBOLSO
                </div>
                <div class="text-sm font-bold">
                    {{ item?.porcetage_refund }}%
                </div>
            </div>
            <div class="w-full">
                <div class="text-sm">
                    GANANCIA VENDEDOR
                </div>
                <div class="text-sm font-bold">
                    ${{ item?.refund_price }}
                </div>
            </div>
            <div class="w-full">
                <div class="text-sm">
                    ESTADO DE REEMBOLSO
                </div>
                <div class="text-sm">
                    <div class="text-red-500" v-if="!item?.is_refund">PENDIENTE</div>
                    <div class="text-green-500 font-bold" v-if="item?.is_refund">REEMBOLSADO</div>
                </div>
            </div>


            <div class="w-full">
                <div class="text-sm text-end">
                    VER BOUCHER
                </div>
                <div class="text-sm flex justify-end cursor-pointer">
                    <a :href="'http://127.0.0.1:5002/api/'+item?.baucher_image"
                        target="_blank">
                        <svg class="hover:fill-blue-300" width="44" height="43" viewBox="0 0 44 43" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M16.6252 7.99077C18.3632 7.43859 20.1766 7.16053 22.0002 7.1666C29.4929 7.1666 34.592 11.6458 37.6325 15.5946C39.1554 17.5762 39.9168 18.5634 39.9168 21.4999C39.9168 24.4383 39.1554 25.4255 37.6325 27.4053C34.592 31.3541 29.4929 35.8333 22.0002 35.8333C14.5074 35.8333 9.40833 31.3541 6.36787 27.4053C4.84495 25.4273 4.0835 24.4365 4.0835 21.4999C4.0835 18.5616 4.84495 17.5744 6.36787 15.5946C7.29685 14.3813 8.33107 13.2524 9.4585 12.2209"
                                stroke="black" stroke-width="1.5" stroke-linecap="round" />
                            <path
                                d="M27.375 21.5C27.375 22.9255 26.8087 24.2927 25.8007 25.3007C24.7927 26.3087 23.4255 26.875 22 26.875C20.5745 26.875 19.2073 26.3087 18.1993 25.3007C17.1913 24.2927 16.625 22.9255 16.625 21.5C16.625 20.0745 17.1913 18.7073 18.1993 17.6993C19.2073 16.6913 20.5745 16.125 22 16.125C23.4255 16.125 24.7927 16.6913 25.8007 17.6993C26.8087 18.7073 27.375 20.0745 27.375 21.5Z"
                                stroke="black" stroke-width="1.5" />
                        </svg>
                    </a>
                </div>
            </div>


        </div>
    </div>
</template>