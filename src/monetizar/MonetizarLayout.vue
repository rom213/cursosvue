<script lang="ts" setup>
import MonetizarTabNav from "./MonetizarTabNav.vue";
import FooterComponent from "../components/footer/footer.component.vue";
</script>

<template>
  <main
    class="monetizar-layout font-sans text-[#1A1A1A] antialiased selection:bg-emerald-500/20"
  >
    <MonetizarTabNav />
    <router-view />
    <FooterComponent />
  </main>
</template>

<style scoped>
.monetizar-layout {
  font-family: "Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
</style>
