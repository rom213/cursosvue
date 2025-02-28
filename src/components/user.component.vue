<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
const route = useRoute();



const router = useRouter()
function verDetalle(idUser: number, name: string) {
    router.push({
        name: 'user',
        params: { idUser: idUser.toString(), nombre: name }
    });
}
</script>


<template>

    <h3>Detalle del usuario</h3>
    <br>
    <p>id user: {{ route.params.idUser }}</p>
    <p>Nombre: {{ route.params.nombre }} </p>
    <button @click="verDetalle(1,'Socio')">hola</button>
</template>