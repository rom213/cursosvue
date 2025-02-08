<script setup lang="ts">
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
const usuarios = reactive([
    { idUser: 1, name: 'romario' },
    { idUser: 2, name: 'brayan' },
    { idUser: 3, name: 'leidy' },
    { idUser: 3, name: 'raul' },
    { idUser: 3, name: 'juan' },
])

const router = useRouter()
function verDetalle(idUser: number, name: string) {
    router.push({
        name: 'user',
        params: { iduser: idUser.toString(), nombre: name }
    });
}
</script>

<template>

    <div class="300 mt-20 gap-5">
        <h2 class="text-4xl">Lista de usuarios</h2>
        <ul class="flex">
            <li v-for="(usuario, index) in usuarios" :key="index" class="grid gap-4">
                {{ usuario.name }}
                <RouterLink class="bg-sky-200" :to="{name:'user-profile', params:{iduser:usuario.idUser}}">ver profile</RouterLink>
                <RouterLink class="bg-red-200" :to="{name:'user-posts', params:{iduser:usuario.idUser}}">ver posts</RouterLink>


                <button class="bg-yellow-300 p-2" @click="verDetalle(usuario.idUser, usuario.name)">hola</button>
            </li>
        </ul>
    </div>


</template>