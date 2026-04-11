<script setup lang="ts">
interface Props {
  type: 'card' | 'hero' | 'text' | 'list';
  count?: number;
}

withDefaults(defineProps<Props>(), { count: 3 });
</script>

<template>
  <!-- Skeleton Hero -->
  <div v-if="type === 'hero'" class="animate-pulse">
    <div class="h-64 md:h-96 bg-slate-200 rounded-lg mb-6"></div>
    <div class="space-y-3 px-4">
      <div class="h-8 bg-slate-200 rounded w-3/4"></div>
      <div class="h-4 bg-slate-200 rounded w-full"></div>
      <div class="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>

  <!-- Skeleton Card Grid -->
  <div v-else-if="type === 'card'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="n in count" :key="n" class="animate-pulse">
      <div class="bg-slate-200 rounded-lg h-48 mb-3"></div>
      <div class="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
      <div class="h-3 bg-slate-200 rounded w-full"></div>
      <div class="h-3 bg-slate-200 rounded w-5/6 mt-2"></div>
    </div>
  </div>

  <!-- Skeleton Text Lines -->
  <div v-else-if="type === 'text'" class="space-y-3 animate-pulse">
    <div v-for="n in count" :key="n" class="h-4 bg-slate-200 rounded" :style="{ width: n % 2 === 0 ? '100%' : '90%' }"></div>
  </div>

  <!-- Skeleton List -->
  <div v-else-if="type === 'list'" class="space-y-3 animate-pulse">
    <div v-for="n in count" :key="n" class="flex gap-3 p-3 bg-slate-50 rounded-lg">
      <div class="w-12 h-12 bg-slate-200 rounded"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        <div class="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
