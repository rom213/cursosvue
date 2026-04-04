<script lang="ts" setup>
import { useRoute } from "vue-router";

const route = useRoute();

interface Tab {
  id: string;
  label: string;
  routeName: string;
  icon: string;
}

const tabs: Tab[] = [
  {
    id: "home",
    label: "Home",
    routeName: "monetizar",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>`,
  },
  {
    id: "configuracion",
    label: "Configuración",
    routeName: "monetizar-configuracion",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
    </svg>`,
  },
  {
    id: "mis-ventas",
    label: "Mis Ventas",
    routeName: "monetizar-mis-ventas",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>`,
  },
    {
    id: "catalogo",
    label: "Catálogo",
    routeName: "monetizar-catalogo",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.5a1 1 0 10-2 0v5.5zM15 13h1.5a1.5 1.5 0 100-3H15v3z"/>
    </svg>`,
  },
];

const isActive = (tabRouteName: string): boolean => {
  return route.name === tabRouteName;
};
</script>

<template>
  <nav
    class="sticky top-0 z-30 border-b border-gray-200/80 bg-white shadow-sm"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-start gap-1 sm:gap-2">
        <router-link
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ name: tab.routeName }"
          class="group flex items-center gap-2 border-b-2 px-3 py-4 text-sm font-medium transition-colors duration-200"
          :class="
            isActive(tab.routeName)
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          "
        >
          <span
            class="h-5 w-5"
            :class="
              isActive(tab.routeName)
                ? 'text-emerald-600'
                : 'text-gray-400 group-hover:text-gray-600'
            "
            v-html="tab.icon"
          />
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>
