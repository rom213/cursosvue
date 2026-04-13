<script lang="ts" setup>
import { cartStore } from '../store/CartStore';
import type { ICategory } from '../types/Categorie';

const storeCart = cartStore()

const deleteCart=(id:number)=>{
    storeCart.deleteItem(id)
}

const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(Number(value || 0))
}

defineProps<{
    item: ICategory;
}>();
</script>

<template>
    <div class="w-full rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start gap-3 md:gap-4">
            <div class="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img class="h-full w-full object-cover" :src="item.imagen_url" :alt="item.titulo" loading="lazy" width="96" height="96" />
            </div>
            <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <h3 class="font-bold text-slate-900 line-clamp-2">{{ item.titulo }}</h3>
                        <p class="mt-1 text-xs text-slate-500">{{ item.courses?.length ?? 0 }} cursos incluidos</p>
                    </div>
                    <button
                        class="shrink-0 rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                        @click="deleteCart(item.id)"
                        aria-label="Eliminar del carrito"
                        title="Eliminar del carrito"
                    >
                        <svg width="18" height="18" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M14.5 11.5V17.5M10.5 11.5V17.5M6.5 7.5V19.5C6.5 20.0304 6.71071 20.5391 7.08579 20.9142C7.46086 21.2893 7.96957 21.5 8.5 21.5H16.5C17.0304 21.5 17.5391 21.2893 17.9142 20.9142C18.2893 20.5391 18.5 20.0304 18.5 19.5V7.5M4.5 7.5H20.5M7.5 7.5L9.5 3.5H15.5L17.5 7.5"
                                stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <div class="mt-3 flex items-center justify-between gap-2">
                    <div class="text-lg font-extrabold text-slate-900">
                        {{ formatCurrency(item.precio) }}
                    </div>
                    <button class="rounded-xl bg-[#CDFF00] px-3 py-2 text-xs font-bold text-slate-900 transition hover:brightness-95">
                        Ver cursos
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>