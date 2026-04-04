<script lang="ts" setup>
import { ref } from "vue";
import MonetizarCalculator from "../MonetizarCalculator.vue";

const isOpen = ref(false);

const toggleFAB = () => {
  isOpen.value = !isOpen.value;
};

const closeFAB = () => {
  isOpen.value = false;
};
</script>

<template>
  <div
    class="fixed bottom-6 right-6 z-50 font-sans transition-all duration-300 ease-in-out"
    :class="[isOpen ? 'w-[90vw] max-w-[500px] h-auto' : 'w-14 h-14']"
  >
    <!-- Collapsed FAB Button -->
    <button
      v-if="!isOpen"
      @click="toggleFAB"
      class="w-full h-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      title="Abrir calculadora"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6-4a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </button>

    <!-- Expanded Panel -->
    <div
      v-else
      class="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-full max-h-[90vh] overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6-4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800">Calculadora de Ganancias</h3>
        </div>
        <button
          @click="closeFAB"
          class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="p-4">
          <MonetizarCalculator compact />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
