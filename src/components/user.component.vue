<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();

console.log(route.params);

watch(() => route.params, (newParam, oldParam) => {
    console.log("obteniendo los datos de usuario con watch");
})


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