<script lang="ts" setup>
import { RouterLink } from 'vue-router';

// --- Data para generar las opciones del menú dinámicamente ---
// Esto hace el template más limpio y el código más fácil de mantener.
const menuOptions = [
  {
    name: 'sales-admin-refund-user',
    label: 'Historial de Reembolso',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>`
  },
  {  
    name: 'sales-admin-management-user',
    label: 'Manejo de Cuentas',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>`
  },
  {
    name: 'sales-detail-user',
    label: 'Detalle de Ventas',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`
  }
];
</script>

<template>
    <q-page>    <div class="bg-gray-50 min-h-screen flex flex-col">
        <main class="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div class="w-full max-w-5xl mx-auto text-center">

                <div class="mb-12">
                    <h1 class="text-4xl font-bold text-gray-800 tracking-tight">
                        Panel Admin
                    </h1>
                    <p class="mt-2 text-lg text-gray-500">
                        Gestiona tus ventas, reembolsos y consulta los detalles.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <router-link 
                        v-for="option in menuOptions" 
                        :key="option.name" 
                        :to="{ name: option.name }"
                        class="group block p-8 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                    >
                        <div 
                            v-html="option.icon" 
                            class="mx-auto text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                        ></div>
                        
                        <div class="mt-4 text-2xl font-semibold text-gray-700 group-hover:text-gray-900 capitalize">
                            {{ option.label }}
                        </div>                                                                                                      
                    </router-link>

                </div>
            </div>
        </main>

    </div></q-page>

</template>

