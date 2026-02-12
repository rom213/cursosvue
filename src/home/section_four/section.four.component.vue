<script lang="ts" setup>
import TechnologyIcon from '../../assets/home/Technology.png';
import GraduadoIcon from '../../assets/home/graduado.png';
import SeguridadIcon from '../../assets/home/seguridad.png';

const cards = [
  {
    title: 'Acceso y plataforma',
    text: 'El acceso se te otorga a tu cuenta de Gmail (google), los cursos estan alojados en Google Drive . te contamos como verlos.',
    image: TechnologyIcon,
    alt: 'Icono de Tecnología'
  },
  {
    title: 'Estudio y certificacion',
    text: 'Dominar un area requiere de diversos conocimientos, por ello te damos todas las herramientas, porsupuesto que te certificamos. 👇',
    image: GraduadoIcon,
    alt: 'Icono de Graduado'
  },
  {
    title: 'Pagos y seguridad',
    text: 'contamos con diferentes metodos de pago, garantias del servicio y una opcion de trabajar con nosotros desde cualquier lugar. 👇',
    image: SeguridadIcon,
    alt: 'Icono de Seguridad'
  }
];
</script>

<template>
  <div class="mt-20 px-4 md:px-8 lg:px-20">
    <div class="text-center text-3xl font-bold text-yellow-500 mb-10">PREGUNTAS FRECUENTES</div>
    
    <div class="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-6 lg:gap-10 py-4">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="flex flex-col items-center w-full max-w-sm p-6 text-center bg-white border border-gray-100 shadow-lg rounded-2xl transition-transform hover:-translate-y-1 duration-300"
      >
        <div class="mb-4 p-4 bg-gray-50 rounded-full">
          <img
            :src="card.image"
            :alt="card.alt"
            class="object-contain"
          />
        </div>

        <h3 class="mb-3 text-2xl font-bold text-gray-900">
          {{ card.title }}
        </h3>

        <p class="mb-6 text-lg text-gray-600 leading-relaxed flex-grow">
          {{ card.text }}
        </p>

        <button
          class="px-8 py-2 text-lg font-medium transition-all duration-300 border-2 border-black rounded-full hover:bg-black hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Leer respuesta
        </button>
      </div>
    </div>
  </div>
</template>
