<script lang="ts" setup>
</script>

<template>
  <div class="p-4 grid gap-6 max-w-4xl mx-auto">
    <!-- Título -->
    <h3 class="text-3xl text-[#66532a] font-extrabold text-center md:text-4xl">
      BENEFICIOS
    </h3>

    <!-- Lista de Beneficios -->
    <div class=" text-lg md:text-2xl mt-6">
      <ul class="space-y-4 text-gray-700 list-inside pl-4">
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Estudia en el lugar y momento que tú quieras</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Contenido 100% descargable</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Pagas una sola vez</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Actualizaciones constantes</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Monetiza con nuestros cursos</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Cursos desde básico hasta experto</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Después de la primera compra, todos los cursos los puedes adquirir a mitad de precio</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Encontrarás packs que te darán la mejor ruta de aprendizaje</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Cursos para TODAS las personas</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Estudia sin importar tu edad</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="w-3 h-3 bg-[#66532a] rounded-full"></span>
          <span>Puedes terminar un curso en 1 o 2 semanas</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Estilo para el contenedor */
.grid {
  grid-template-columns: 1fr;
}

/* Animación para la lista de beneficios */
li {
  transition: transform 0.3s ease, color 0.3s ease;
}

li:hover {
  transform: translateX(10px);
  color: #2d3748;
}

/* Estilos generales */
h3 {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

/* Sombra en el contenedor */
div {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  border-radius: 8px;
}

/* Espaciado entre los items */
.space-y-4 {
  margin-bottom: 1rem;
}
</style>
