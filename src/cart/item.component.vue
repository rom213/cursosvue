<script lang="ts" setup>
import { cartStore } from '../store/CartStore';
import type { ICategory } from '../types/Categorie';

const storeCart = cartStore()

const deleteCart=(id:number)=>{
    storeCart.deleteItem(id)
}

defineProps<{
    item: ICategory;
}>();
</script>

<template>

    <div class="w-full flex justify-between md:justify-around md:h-36 bg-white">
        <!-- seccion imagen -->
        <div class="40px flex items-center sm:w-[120px]">
            <img class="rounded-sm" :src="item.imagen_url" alt="" srcset="">
        </div>
        <!-- seccion descripcion -->
        <div class="flex justify-center items-center gap-5 px-1 text-sm">
            <div>
                <h3 class="font-semibold">{{ item.titulo }}</h3>
                <div>
                    <p># cursos {{ item.courses.length }}</p>
                    <div class="flex justify-baseline text-red-600 gap-3">
                        <p class="line-through">${{ item.precio }}</p>
                        <p>{{ item.descuento }}%DTO</p>
                    </div>
                    <p>
                        precio ${{ item.precio_desc }}
                    </p>
                </div>

            </div>
            <!-- seccion buttons -->
            <div class="grid">
                <!-- arriba -->
                <div class="flex justify-end">
                    <!-- basura -->
                    <svg @click="deleteCart(item.id)" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M14.5 11.5V17.5M10.5 11.5V17.5M6.5 7.5V19.5C6.5 20.0304 6.71071 20.5391 7.08579 20.9142C7.46086 21.2893 7.96957 21.5 8.5 21.5H16.5C17.0304 21.5 17.5391 21.2893 17.9142 20.9142C18.2893 20.5391 18.5 20.0304 18.5 19.5V7.5M4.5 7.5H20.5M7.5 7.5L9.5 3.5H15.5L17.5 7.5"
                            stroke="black" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <!-- corazon -->
                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M4.74 11.29C4.34461 10.8972 4.03134 10.4297 3.81845 9.91465C3.60556 9.3996 3.49731 8.84732 3.5 8.29001C3.5 7.16284 3.94777 6.08184 4.7448 5.28481C5.54183 4.48778 6.62283 4.04001 7.75 4.04001C9.33 4.04001 10.71 4.90001 11.44 6.18001H12.56C12.9311 5.52907 13.4681 4.9881 14.1163 4.61219C14.7645 4.23628 15.5007 4.03885 16.25 4.04001C17.3772 4.04001 18.4582 4.48778 19.2552 5.28481C20.0522 6.08184 20.5 7.16284 20.5 8.29001C20.5 9.46001 20 10.54 19.26 11.29L12 18.54L4.74 11.29ZM19.96 12C20.91 11.04 21.5 9.74001 21.5 8.29001C21.5 6.89762 20.9469 5.56227 19.9623 4.5777C18.9777 3.59313 17.6424 3.04001 16.25 3.04001C14.5 3.04001 12.95 3.89001 12 5.21001C11.5151 4.53651 10.8766 3.98833 10.1375 3.61094C9.39835 3.23355 8.5799 3.03783 7.75 3.04001C6.35761 3.04001 5.02226 3.59313 4.03769 4.5777C3.05312 5.56227 2.5 6.89762 2.5 8.29001C2.5 9.74001 3.09 11.04 4.04 12L12 19.96L19.96 12Z"
                            fill="black" />
                    </svg>
                </div>

                <!-- boton google drive -->
                <div class="flex justify-end">
                    <button class="h-[55px] w-[120px] grid grid-cols-3 bg-[#CDFF00] rounded-sm p-0.5">
                        <div  class="text-[12px] col-span-2">Vista de los cursos en drive</div>
                        <div class="col-span-1 flex items-center">
                            <svg width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.6765 4.625C20.1209 4.625 20.5587 4.7327 20.9524 4.93888C21.346 5.14506 21.6839 5.44358 21.937 5.80888L22.058 6L29.9959 19.75C30.2165 20.1322 30.3419 20.5618 30.3615 21.0026C30.3811 21.4434 30.2944 21.8825 30.1086 22.2828L29.9959 22.5L26.8196 28C26.5975 28.3847 26.2854 28.7098 25.9102 28.9476C25.5349 29.1854 25.1077 29.3287 24.665 29.3654L24.4395 29.375H8.56236C8.11772 29.3752 7.67966 29.2676 7.28571 29.0614C6.89177 28.8553 6.5537 28.5566 6.30048 28.1911L6.18086 28L3.00461 22.5C2.78399 22.1178 2.65858 21.6882 2.63895 21.2474C2.61933 20.8066 2.70607 20.3675 2.89186 19.9672L3.00461 19.75L10.9452 6C11.1675 5.61513 11.4798 5.28987 11.8553 5.05208C12.2308 4.81429 12.6583 4.67105 13.1012 4.63462L13.3254 4.625H19.6765ZM26.821 22.5H12.5306L10.1491 26.625H24.4395L26.821 22.5ZM12.532 8.75L5.38611 21.125L7.76761 25.25L14.9121 12.875L12.532 8.75ZM19.6765 7.375H14.9135L22.058 19.75H26.821L19.6765 7.375ZM16.5002 15.625L14.1187 19.75H18.8817L16.5002 15.625Z"
                                fill="black" />
                        </svg>
                        </div>

                    </button>
                </div>
            </div>
        </div>
    </div>
</template>