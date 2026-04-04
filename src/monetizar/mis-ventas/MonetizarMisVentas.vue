<script lang="ts" setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

// Mostrar hub solo si estamos en la ruta base de mis-ventas
const showHub = route.name === "monetizar-mis-ventas";

const menuOptions = [
  {
    name: "monetizar-mis-ventas-resumen",
    label: "Resumen de Ventas",
    description: "KPI cards con balance, totales y ganancias",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>`,
  },
  {
    name: "monetizar-mis-ventas-graficos",
    label: "Gráficos de Ventas",
    description: "Análisis visuales por semana y categoría",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>`,
  },
  {
    name: "monetizar-mis-ventas-historial",
    label: "Historial de Ventas",
    description: "Tabla detallada con todas tus transacciones",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`,
  },
];
</script>

<template>
  <!-- Hub View -->
  <div v-if="showHub" class="bg-gray-50 min-h-screen flex flex-col">
    <main class="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-5xl mx-auto text-center">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-800 tracking-tight">
            Mis Ventas
          </h1>
          <p class="mt-2 text-lg text-gray-500">
            Monitorea tus ventas, ganancias, comisiones y analiza tu desempeño
          </p>
        </div>

        <!-- Menu Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <router-link
            v-for="option in menuOptions"
            :key="option.name"
            :to="{ name: option.name }"
            class="group block p-8 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:border-emerald-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div
              v-html="option.icon"
              class="mx-auto text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300"
            ></div>

            <h2 class="mt-4 text-xl font-semibold text-gray-700 group-hover:text-gray-900">
              {{ option.label }}
            </h2>
            <p class="mt-2 text-sm text-gray-500 group-hover:text-gray-600">
              {{ option.description }}
            </p>
          </router-link>
        </div>
      </div>
    </main>
  </div>

  <!-- Sub-pages View -->
  <router-view v-else />
</template>
