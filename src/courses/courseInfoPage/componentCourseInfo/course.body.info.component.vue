<script lang="ts" setup>
import { categoryStore } from '../../../store/CategoryStore';
import CommentsBodyComponent from './comments.body.component.vue';
import QuestionsBodyComponent from './questions.body.component.vue';

const storeCategory = categoryStore()



</script>
<template>
    <div class="p-4 pb-30">
        <!-- Lista de cursos -->
        <details class="mb-4">
            <summary class="font-semibold cursor-pointer flex justify-between">
                LISTA DE CURSOS
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.25" y="0.25" width="23.5" height="23.5" stroke="black" stroke-width="0.5" />
                    <path d="M7 6L12 11L17 6M7 13L12 18L17 13" stroke="black" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </summary>
            <div class="mt-2 pl-2">
                <div>
                    <ul class="list-disc pl-3">
                        <div v-for="(item, index) in storeCategory.getCategory()?.courses" :key="index">
                            <li>
                                {{ item.name }}
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </details>

        <details class="mb-4">
            <summary class="font-semibold cursor-pointer flex justify-between">
                AUTORES
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.25" y="0.25" width="23.5" height="23.5" stroke="black" stroke-width="0.5" />
                    <path d="M7 6L12 11L17 6M7 13L12 18L17 13" stroke="black" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </summary>
            <div class="mt-2 pl-2">
                <div>
                    <ul class="list-disc pl-3">
                        <div v-for="(item, index) in storeCategory.getCategory()?.courses" :key="index">
                            <li v-if="item.autor">
                                {{ item.autor }}
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </details>

        <!-- Preguntas frecuentes -->
        <details class="mb-4">
            <summary class="font-semibold cursor-pointer flex justify-between">
                PREGUNTAS FRECUENTES
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.25" y="0.25" width="23.5" height="23.5" stroke="black" stroke-width="0.5" />
                    <path d="M7 6L12 11L17 6M7 13L12 18L17 13" stroke="black" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </summary>

            <!-- Preguntas dentro de la sección -->
            <QuestionsBodyComponent />
        </details>

        <!-- garantias -->
        <details>
            <summary class="font-semibold cursor-pointer flex justify-between">
                GARANTIAS
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.25" y="0.25" width="23.5" height="23.5" stroke="black" stroke-width="0.5" />
                    <path d="M7 6L12 11L17 6M7 13L12 18L17 13" stroke="black" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </summary>

            <!-- Preguntas dentro de la sección -->
            <div class="pl-4">
                <ul class="list-disc pl-2">
                    <li>7 Dias de satisfaccion o devolucion de dinero.</li>
                    <li>Pagina con certificado de seguridad HTTPS.</li>
                    <li>Certificado educativo valido.</li>
                    <li>Asesoria al cliente via whatsApp.</li>
                </ul>
            </div>
        </details>

        <!-- comentario -->
        <details class="pt-3">
            <summary class="font-semibold cursor-pointer flex justify-between">
                COMENTARIOS
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.25" y="0.25" width="23.5" height="23.5" stroke="black" stroke-width="0.5" />
                    <path d="M7 6L12 11L17 6M7 13L12 18L17 13" stroke="black" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </summary>

            <!-- Preguntas dentro de la sección -->
            <div class="pl-4">
                <CommentsBodyComponent/>
            </div>
        </details>
    </div>
</template>