<script lang="ts" setup>
// Componente Vue 3 - responsive
</script>

<template>
  <section class="min-h-screen flex items-center bg-hero-gradient">
    <div class="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <div class="flex flex-col-reverse md:flex-row items-center md:justify-between gap-8">

        <!-- Texto (izquierda en desktop, arriba en móvil) -->
        <div class="w-full md:w-1/2 text-center md:text-left">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-white animate-in delay-200">
            No existen obstáculos, como el tiempo y el dinero.
          </h1>

          <p class="mt-4 text-white text-lg sm:text-xl md:text-2xl font-semibold animate-in delay-400">
            Contamos con certificados. Para cada categoría.
          </p>

          <p class="mt-4 text-white text-lg sm:text-xl md:text-2xl font-semibold animate-in delay-600">
            ¡Hazlo posible con nosotros!
          </p>
        </div>

        <!-- Imagen (derecha en desktop, abajo en móvil) -->
        <div class="w-full md:w-1/2 flex justify-center md:justify-end">
          <figure class="max-w-[280px] sm:max-w-[320px] md:max-w-[420px] lg:max-w-[520px]">
            <img
              src="../../assets/home/senora.png"
              alt="Persona sonriendo representando el servicio"
              class="w-full h-auto object-contain rounded-2xl shadow-2xl transform-gpu animate-in-image delay-300"
            />
          </figure>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* Fondo degradado (también lo dejamos utilizable por utilidades si usas Tailwind) */
.bg-hero-gradient {
  background-image: linear-gradient(90deg, #38bdf8 0%, #06b6d4 50%, #0ea5e9 100%);
}

/* Animaciones (entrada sutil) */
@keyframes floatIn {
  0% { opacity: 0; transform: translateY(18px) rotate(-2deg); }
  60% { opacity: 1; transform: translateY(-6px) rotate(1deg); }
  100% { opacity: 1; transform: translateY(0) rotate(0); }
}

@keyframes floatImage {
  0% { opacity: 0; transform: translateY(24px) scale(0.98); }
  60% { opacity: 1; transform: translateY(-6px) scale(1.01); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-in {
  opacity: 0;
  animation-name: floatIn;
  animation-duration: 700ms;
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(.22,.9,.36,1);
  animation-iteration-count: 1; /* entra una vez */
}

.animate-in-image {
  opacity: 0;
  animation-name: floatImage;
  animation-duration: 900ms;
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(.22,.9,.36,1);
  animation-iteration-count: 1;
}

/* Delays reutilizables */
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.45s; }
.delay-600 { animation-delay: 0.65s; }

/* Preferencias de usuario: reducir animaciones */
@media (prefers-reduced-motion: reduce) {
  .animate-in, .animate-in-image { animation: none; opacity: 1; transform: none; }
}

/* Ajustes finos responsive (si quieres más control sin Tailwind) */
@media (max-width: 640px) {
  h1 { line-height: 1.05; }
}

@media (max-width: 420px) {
  /* En pantallas muy pequeñas podemos reducir el ancho de la imagen */
  figure { max-width: 220px; }
}
</style>
