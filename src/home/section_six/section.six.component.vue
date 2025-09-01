<script lang="ts" setup>
</script>

<template>
    <div class="grid mt-20 gap-5 p-6 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg shadow-lg">
        <div class="flex flex-col justify-center">
            <h3 class="cursor-pointer text-[#FFAF00] text-3xl font-bold md:text-center">Preguntas Frecuentes</h3>
            <div class="flex flex-col justify-center bg-white rounded-lg shadow-md mt-5">
                <!-- Pregunta 1 -->
                <div class="group relative hover:bg-gray-200 transition-all duration-300 rounded-lg cursor-pointer">
                    <div class="flex gap-4 p-4">
                        <div
                            class="flex  relative items-center justify-center w-8 h-8 bg-[#FFAF00] rounded-full text-white">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 17L11 12L6 7M13 17L18 12L13 7" stroke="black" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="absolute top-0 opacity-0">
                                <input class="w-full cursor-pointer" type="text" readonly>
                            </div>
                        </div>
                        <div class="text-xl font-semibold text-gray-800">¿Cómo puedo ver los cursos?</div>
                    </div>
                    <div class="group-focus-within:block hidden pl-7 text-justify bg-gray-100 p-4 rounded-b-lg">
                        Los cursos los verás en tu unidad de Google Drive en la sección "Unidades Compartidas". Así,
                        podrás llevar el contenido siempre contigo y no necesitarás pagar más almacenamiento.
                    </div>
                </div>
                <!-- Pregunta 2 -->
                <div class="group relative hover:bg-gray-200 transition-all duration-300 rounded-lg cursor-pointer">
                    <div class="flex gap-4 p-4">
                        <div
                            class="flex relative items-center justify-center w-8 h-8 bg-[#FFAF00] rounded-full text-white">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 17L11 12L6 7M13 17L18 12L13 7" stroke="black" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="absolute top-0 opacity-0">
                                <input class="w-full cursor-pointer" type="text" readonly>
                            </div>
                        </div>
                        <div class="text-xl font-semibold text-gray-800">¿Qué es Google Drive?</div>
                    </div>
                    <div class="group-focus-within:block hidden pl-7 text-justify bg-gray-100 p-4 rounded-b-lg">
                        Es un espacio de almacenamiento gratuito de Google, donde puedes almacenar, visualizar y
                        compartir archivos de forma segura. Todo usuario con un correo Gmail tiene acceso
                        automáticamente.
                    </div>
                </div>
                <!-- Pregunta 3 -->
                <div class="group relative hover:bg-gray-200 transition-all duration-300 rounded-lg cursor-pointer">
                    <div class="flex gap-4 p-4">
                        <div
                            class="flex relative items-center justify-center w-8 h-8 bg-[#FFAF00] rounded-full text-white">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 17L11 12L6 7M13 17L18 12L13 7" stroke="black" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="absolute top-0 opacity-0">
                                <input class="w-full cursor-pointer" type="text" readonly>
                            </div>
                        </div>
                        <div class="text-xl font-semibold text-gray-800">¿Cómo trabajar con ustedes?</div>
                    </div>
                    <div class="group-focus-within:block hidden pl-7 bg-gray-100 p-4 rounded-b-lg">
                        Al adquirir nuestros paquetes de cursos, automáticamente te conviertes en vendedor, y por cada
                        paquete vendido, ganas un 60%. Para más información, ingresa a la sección "Monetizar".
                    </div>
                </div>
                <!-- Pregunta 4 -->
                <div class="group relative hover:bg-gray-200 transition-all duration-300 rounded-lg cursor-pointer">
                    <div class="flex gap-4 p-4">
                        <div
                            class="flex relative items-center justify-center w-8 h-8 bg-[#FFAF00] rounded-full text-white">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 17L11 12L6 7M13 17L18 12L13 7" stroke="black" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="absolute top-0 opacity-0 w-full ">
                                <input class="w-full cursor-pointer" type="text" readonly>
                            </div>
                        </div>
                        <div class="text-xl font-semibold text-gray-800">¿Qué garantías tengo?</div>
                    </div>
                    <div class="group-focus-within:block hidden pl-7 bg-gray-100 p-4 rounded-b-lg">
                        <ul class="list-disc pl-5">
                            <li>7 días de satisfacción o devolución de dinero.</li>
                            <li>Página con certificado de seguridad HTTPS.</li>
                            <li>Certificado educativo válido.</li>
                            <li>Asesoría al cliente vía WhatsApp.</li>
                            <li>Archivos libres de virus.</li>
                            <li>Abiertos a sugerencias.</li>
                        </ul>
                    </div>
                </div>
                <!-- Más preguntas aquí -->
            </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2 mt-10">
            <div class="bg-gray-100 rounded-lg p-6">
                <h3 class="font-semibold text-xl text-center text-[#FFAF00]">MISIÓN</h3>
                <p class="text-justify text-gray-800">
                    Nuestra misión es ofrecer educación de alta calidad a muy bajo costo y trabajar en el área de
                    ventas, ayudando a aquellas personas que buscan un mejor futuro para ellos y su familia.
                </p>
            </div>

            <div class="bg-gray-100 rounded-lg p-6">
                <h3 class="font-semibold text-xl text-center text-[#FFAF00]">VISIÓN</h3>
                <p class="text-justify text-gray-800">
                    Nuestra visión es convertirnos en la plataforma de cursos por Google Drive más grande del mundo,
                    educando a miles de personas que, por dificultades económicas, no pueden estudiar o trabajar.
                    Creemos firmemente en este proyecto, que sin duda nos convertirá en una gran familia.
                </p>
            </div>
        </div>
    </div>
</template>

<style>
.bg-gradient-to-r {
    background-image: linear-gradient(to right, #38bdf8, #0ea5e9);
}
</style>