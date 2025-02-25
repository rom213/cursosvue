<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';


</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/login">login</RouterLink>
    <RouterLink to="/users">Users</RouterLink>
  </nav>

  <RouterView></RouterView>
</template>
