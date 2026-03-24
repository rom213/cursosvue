<script setup lang="ts">
import { onMounted, ref } from 'vue';
import FooterComponent from '../components/footer/footer.component.vue';
import { icons } from './section_one/section.one.data';
import TechnologyIcon from '../assets/home/Technology.png';
import GraduadoIcon from '../assets/home/graduado.png';
import SeguridadIcon from '../assets/home/seguridad.png';

const logosAnimationDuration = 40;

const faqCards = [
  {
    title: 'Acceso y plataforma',
    text: 'El acceso se te otorga a tu cuenta de Gmail (google), los cursos estan alojados en Google Drive . te contamos como verlos.',
    image: TechnologyIcon,
    alt: 'Icono de Tecnología',
  },
  {
    title: 'Estudio y certificacion',
    text: 'Dominar un area requiere de diversos conocimientos, por ello te damos todas las herramientas, porsupuesto que te certificamos. 👇',
    image: GraduadoIcon,
    alt: 'Icono de Graduado',
  },
  {
    title: 'Pagos y seguridad',
    text: 'contamos con diferentes metodos de pago, garantias del servicio y una opcion de trabajar con nosotros desde cualquier lugar. 👇',
    image: SeguridadIcon,
    alt: 'Icono de Seguridad',
  },
];

const testimonialAnimationDuration = 50;
const testimonialScrollRef = ref<HTMLElement | null>(null);

const testimonialImages = [
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_2.jpg?alt=media&token=22bca7ef-47a6-42e4-adb2-3193a321fc86' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_1.jpg?alt=media&token=b2806947-6965-450e-a9a3-a7ec15def596' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_3.jpg?alt=media&token=44065c19-1050-4858-ba7b-457cb36f7aae' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_4.jpg?alt=media&token=975ebf38-d4a6-4ae8-a09e-4dd9c5d9932d' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_5.png?alt=media&token=05216ab9-a450-4825-95c4-39223b10fdfa' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_6.png?alt=media&token=09062eeb-4afa-4dbb-bd32-6cd64d527f3b' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_7.jpg?alt=media&token=116095fc-f42e-4241-b5c0-2ecb0353a01a' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_8.jpg?alt=media&token=0ef3c517-6648-4981-a94d-afe1b112d43e' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/blog-46e71.appspot.com/o/study_and_work%2Fimage_9.png?alt=media&token=a8159439-8cd1-46fd-8f13-aa5032b6a6d1' },
];

const pauseTestimonialScroll = () => {
  if (testimonialScrollRef.value) {
    testimonialScrollRef.value.style.animationPlayState = 'paused';
  }
};

const resumeTestimonialScroll = () => {
  if (testimonialScrollRef.value) {
    testimonialScrollRef.value.style.animationPlayState = 'running';
  }
};

onMounted(() => {
  const el = testimonialScrollRef.value;
  if (el) {
    el.innerHTML += el.innerHTML;
  }
});
</script>

<template>
  <div>
    <!-- Hero + valor (antes section_one) -->
    <div class="grid">
      <div class="flex flex-col xl:flex-row items-center gap-4 p-4 xl:p-0">
        <div class="w-full xl:w-auto flex justify-center">
          <img
            src="../assets/home/mujercursos.png"
            alt=""
            class="max-w-[80%] xl:max-w-full h-auto"
          />
        </div>
        <div class="flex flex-wrap justify-center gap-6 xl:gap-10 w-full">
          <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
            <div class="w-fit" v-html="icons.accesoVitalicio" />
            <div class="font-bold text-2xl">Acceso Vitalicio</div>
            <div class="break-words text-xl text-center">Pago unico Actualizaciones gratis</div>
          </div>
          <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
            <div class="w-fit" v-html="icons.descargable" />
            <div class="font-bold text-2xl">100% Descargable</div>
            <div class="break-words text-xl text-center">Estudia offline y a tu ritmo.</div>
          </div>
          <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
            <div class="w-fit" v-html="icons.clubDescuentos" />
            <div class="font-bold text-2xl text-center">Club de Descuentos</div>
            <div class="break-words text-xl text-center">50% OFF en próximas compras.</div>
          </div>
          <div class="border border-solid border-black p-4 rounded-xl flex flex-col justify-center items-center w-[250px] gap-6">
            <div class="w-fit" v-html="icons.trabajaYGana" />
            <div class="font-bold text-2xl text-center">Trabaja y Gana</div>
            <div class="break-words text-xl text-center">Comisiones del 60% por venta.</div>
          </div>
        </div>
      </div>

      <!-- Carrusel de marcas (antes section_two) -->
      <div
        class="relative w-screen overflow-hidden py-4 before:content-[''] before:absolute before:left-0 before:top-0 before:w-32 before:h-full before:bg-gradient-to-r before:from-white before:to-transparent before:z-10 after:content-[''] after:absolute after:right-0 after:top-0 after:w-32 after:h-full after:bg-gradient-to-l after:from-white after:to-transparent after:z-10"
      >
        <div
          class="flex gap-20 items-center home-logos-marquee"
          :style="{ '--home-logos-duration': logosAnimationDuration + 's' }"
        >
          <template v-for="n in 3" :key="n">
            <div class="flex-shrink-0 opacity-100 transition-opacity">
              <img class="h-7 md:h-8 object-contain" src="../assets/home/coursera.png" alt="Coursera" />
            </div>
            <div class="flex-shrink-0">
              <img class="h-7 md:h-8 object-contain" src="../assets/home/edx.png" alt="edX" />
            </div>
            <div class="flex-shrink-0">
              <img class="h-7 md:h-8 object-contain" src="../assets/home/hotmart.png" alt="Hotmart" />
            </div>
            <div class="flex-shrink-0">
              <img class="h-7 md:h-8 object-contain" src="../assets/home/platzi.png" alt="Platzi" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- FAQ tarjetas (antes section_four) -->
    <div class="mt-20 px-4 md:px-8 lg:px-20">
      <div class="text-center text-3xl font-bold text-yellow-500 mb-10">PREGUNTAS FRECUENTES</div>
      <div class="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-6 lg:gap-10 py-4">
        <div
          v-for="(card, index) in faqCards"
          :key="index"
          class="flex flex-col items-center w-full max-w-sm p-6 text-center bg-white border border-gray-100 shadow-lg rounded-2xl transition-transform hover:-translate-y-1 duration-300"
        >
          <div class="mb-4 p-4 bg-gray-50 rounded-full">
            <img :src="card.image" :alt="card.alt" class="object-contain" />
          </div>
          <h3 class="mb-3 text-2xl font-bold text-gray-900">{{ card.title }}</h3>
          <p class="mb-6 text-lg text-gray-600 leading-relaxed flex-grow">{{ card.text }}</p>
          <button
            type="button"
            class="px-8 py-2 text-lg font-medium transition-all duration-300 border-2 border-black rounded-full hover:bg-black hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Leer respuesta
          </button>
        </div>
      </div>
    </div>

    <br />

    <!-- Testimonios (antes section_seven) -->
    <div class="home-testimonials-root h-[280px] w-full rounded-t-lg">
      <div class="text-center">
        <h3 class="text-xl font-semibold">TESTIMONIOS</h3>
        <p class="text-sm">Encuesta realizada por WhatsApp</p>
        <p class="font-semibold">¿Cómo te han parecido los cursos y la atención?</p>
      </div>
      <div class="overflow-hidden whitespace-nowrap overflow-x-auto mt-4">
        <div
          ref="testimonialScrollRef"
          class="home-testimonials-marquee flex"
          :style="{ '--home-testimonials-duration': testimonialAnimationDuration + 's' }"
          @mouseenter="pauseTestimonialScroll"
          @mouseleave="resumeTestimonialScroll"
        >
          <div class="flex gap-6">
            <div
              v-for="(item, index) in testimonialImages"
              :key="index"
              class="border-2 border-white rounded-lg p-2 shadow-lg"
            >
              <img class="home-testimonial-img h-[150px] rounded-md" :src="item.url" alt="Imagen del testimonio" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterComponent />
  </div>
</template>

<style>
@keyframes homeLogosScroll {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.home-logos-marquee {
  animation: homeLogosScroll var(--home-logos-duration, 40s) linear infinite;
  display: flex;
  width: max-content;
}

@media (pointer: fine) {
  .overflow-hidden::-webkit-scrollbar {
    display: none;
  }
}
</style>

<style scoped>
@keyframes homeTestimonialsScroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.home-testimonials-marquee {
  width: max-content;
  animation: homeTestimonialsScroll var(--home-testimonials-duration, 50s) linear infinite;
  display: flex;
  white-space: nowrap;
}

.home-testimonials-root {
  background-image: linear-gradient(to right, #38bdf8, #0ea5e9);
}

.home-testimonial-img {
  transition: transform 0.3s ease-in-out;
}

.home-testimonial-img:hover {
  transform: scale(1.05);
}
</style>
