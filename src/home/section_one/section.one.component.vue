<template>
  <div class="flex flex-col xl:flex-row items-center gap-4 p-4 xl:p-0">
    <div class="w-full xl:w-auto flex justify-center">
      <img src="../../assets/home/mujercursos.png" alt="" srcset="" class="max-w-[80%] xl:max-w-full h-auto" />
    </div>
    <div class="flex flex-wrap justify-center gap-6 xl:gap-10 w-full">
      <!-- card acceso vitalicio -->
      <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
        <div class="w-fit" v-html="icons.accesoVitalicio"></div>
        <div class="font-bold text-2xl">Acceso Vitalicio</div>
        <div class="break-words text-xl text-center">Pago unico Actualizaciones gratis</div>
      </div>
      <!-- card 100% descargable -->
      <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
        <div class="w-fit" v-html="icons.descargable"></div>
        <div class="font-bold text-2xl">100% Descargable</div>
        <div class="break-words text-xl text-center">Estudia offline y a tu ritmo.</div>
      </div>

      <!-- card clud de descuentos -->
      <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
        <div class="w-fit" v-html="icons.clubDescuentos"></div>
        <div class="font-bold text-2xl text-center">Club de Descuentos</div>
        <div class="break-words text-xl text-center">50% OFF en próximas compras.</div>
      </div>

           <!-- card trabaja y gana -->
      <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
        <div class="w-fit" v-html="icons.trabajaYGana"></div>
        <div class="font-bold text-2xl text-center">Trabaja y Gana</div>
        <div class="break-words text-xl text-center">Comisiones del 60% por venta.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { icons } from './section.one.data';
</script>
