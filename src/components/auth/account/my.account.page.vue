<script lang="ts" setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import FooterComponent from '../../footer/footer.component.vue';
import { onMounted, ref } from 'vue';
const router = useRouter()
const route = useRoute()

const messages = ref({
    isSuccess: false,
    isCancel: false
})

onMounted(() => {
    if (route.query.is_save) {
        messages.value.isSuccess = true
        setTimeout(() => {
            messages.value.isSuccess = false
            // Limpiar query sin recargar
            router.replace({ query: { ...route.query, is_save: undefined } })
        }, 3000)
    }

    if (route.query.is_cancel) {
        messages.value.isCancel = true
        setTimeout(() => {
            messages.value.isCancel = false
            // Limpiar query sin recargar
            router.replace({ query: { ...route.query, is_cancel: undefined } })
        }, 3000)
    }
})
</script>

<template>
    <!-- Wrapper para mantener footer abajo -->
    <div class="min-h-screen flex flex-col bg-white text-slate-900">
        <!-- Contenido principal -->
        <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            <!-- Mensajes -->
            <div class="space-y-2">
                <div v-if="messages.isSuccess"
                    class="inline-block bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded shadow-sm font-medium"
                    role="status" aria-live="polite">
                    GUARDADO CON ÉXITO
                </div>
                <div v-if="messages.isCancel"
                    class="inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded shadow-sm font-medium"
                    role="status" aria-live="polite">
                    NO FUE GUARDADO
                </div>
            </div>

            <!-- Header: título + icono -->
            <header class="mt-4 flex flex-col md:flex-row items-center md:justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="text-2xl font-extrabold">CONFIGURACIÓN</div>
                    <!-- icono con tamaño responsive -->
                    <div class="w-8 h-8 md:w-9 md:h-9">
                        <!-- SVG se escala con width/height del contenedor -->
                        <svg viewBox="0 0 31 30" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- (tu PATH original) -->
                            <g clip-path="url(#clip0_146_946)">
                                <path
                                    d="M27.0573 17.0474C27.1127 16.6333 27.1404 16.2055 27.1404 15.75C27.1404 15.3083 27.1127 14.8667 27.0435 14.4526L29.8532 12.2719C29.9742 12.1724 30.057 12.0341 30.0872 11.8805C30.1175 11.727 30.0935 11.5678 30.0192 11.43L27.3618 6.84766C27.2832 6.70944 27.1582 6.60324 27.0089 6.54772C26.8596 6.49219 26.6954 6.49088 26.5452 6.54401L23.2373 7.86901C22.5452 7.34453 21.8117 6.90287 20.9951 6.57162L20.4968 3.06589C20.4723 2.9079 20.3918 2.76391 20.2699 2.66008C20.148 2.55624 19.9927 2.49945 19.8324 2.5H14.5176C14.1854 2.5 13.9224 2.73464 13.8671 3.06589L13.3688 6.57162C12.5522 6.90287 11.8048 7.35834 11.1266 7.86901L7.81863 6.54401C7.51413 6.4336 7.16811 6.54401 7.00202 6.84766L4.35843 11.43C4.19234 11.7198 4.24771 12.0786 4.52452 12.2719L7.3342 14.4526C7.265 14.8667 7.20964 15.3221 7.20964 15.75C7.20964 16.1779 7.23732 16.6333 7.30652 17.0474L4.49684 19.2281C4.37577 19.3276 4.29304 19.4659 4.26275 19.6195C4.23247 19.773 4.2565 19.9322 4.33075 20.0701L6.98818 24.6523C7.15427 24.956 7.50029 25.0526 7.80479 24.956L11.1127 23.631C11.8048 24.1555 12.5383 24.5971 13.3549 24.9284L13.8532 28.4341C13.9224 28.7654 14.1854 29 14.5176 29H19.8324C20.1646 29 20.4414 28.7654 20.4829 28.4341L20.9812 24.9284C21.7978 24.5971 22.5452 24.1555 23.2234 23.631L26.5314 24.956C26.8359 25.0664 27.1819 24.956 27.348 24.6523L30.0054 20.0701C30.1715 19.7664 30.1023 19.4214 29.8393 19.2281L27.0573 17.0474ZM17.175 20.7188C14.4345 20.7188 12.1923 18.4828 12.1923 15.75C12.1923 13.0172 14.4345 10.7813 17.175 10.7813C19.9155 10.7813 22.1577 13.0172 22.1577 15.75C22.1577 18.4828 19.9155 20.7188 17.175 20.7188Z"
                                    fill="black" />
                            </g>
                            <defs>
                                <clipPath id="clip0_146_946">
                                    <rect width="30" height="30" fill="white" transform="translate(0.5)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                </div>

                <!-- Opcional: subtítulo o control a la derecha en desktop -->
                <div class="text-sm text-slate-600 hidden md:block">Administra tu perfil y ventas</div>
            </header>

            <!-- Grid de opciones: responsive -->
            <section class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Item (link) reutilizable - se hace accesible y con hover -->
                <RouterLink :to="{ name: 'config-user' }" class="block">
                    <div class="group flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        role="button">
                        <div class="w-10 h-10 flex-shrink-0">
                            <!-- SVG escalable -->
                            <svg viewBox="0 0 30 30" class="w-full h-full" xmlns="http://www.w3.org/2000/svg"
                                fill="none">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M24.1667 13.9049V15.5765C24.7019 15.7175 25.2079 15.9327 25.6717 16.2118L26.8325 15.0287L28.896 17.1293L27.7337 18.3109C28.0079 18.783 28.2194 19.2981 28.3579 19.8429H30V22.812H28.3579C28.2194 23.3568 28.0079 23.8719 27.7337 24.344L28.896 25.5256L26.8325 27.6262L25.6717 26.4431C25.2017 26.7255 24.6951 26.9394 24.1667 27.0784V28.75H21.25V27.0784C20.7216 26.9394 20.215 26.7255 19.745 26.4431L18.5842 27.6262L16.5206 25.5256L17.6829 24.344C17.4055 23.8655 17.1954 23.3498 17.0588 22.812H15.4167V19.8429H17.0588C17.1973 19.2981 17.4088 18.783 17.6829 18.3109L16.5206 17.1293L18.5842 15.0287L19.745 16.2118C20.215 15.9294 20.7216 15.7155 21.25 15.5765V13.9049H24.1667ZM24.7588 19.2165L24.7821 19.2402C25.2983 19.7717 25.6192 20.5021 25.625 21.3067V21.3482C25.6212 21.9328 25.4479 22.5033 25.1269 22.988C24.8058 23.4727 24.3514 23.8502 23.8205 24.0731C23.2896 24.296 22.7058 24.3544 22.1424 24.241C21.5791 24.1275 21.0611 23.8473 20.6535 23.4355L20.639 23.4176C20.1073 22.8581 19.8127 22.1083 19.8188 21.3298C19.8249 20.5513 20.1312 19.8064 20.6716 19.2556C21.212 18.7047 21.9433 18.3919 22.708 18.3846C23.4728 18.3773 24.2083 18.676 24.7588 19.2165ZM6.66667 10.9359C6.66696 10.1121 6.83563 9.29741 7.16195 8.54358C7.48827 7.78975 7.96511 7.11329 8.56213 6.55719C9.15916 6.00109 9.86332 5.57753 10.6299 5.31344C11.3964 5.04934 12.2085 4.95048 13.0146 5.02315C13.8207 5.09582 14.6031 5.33843 15.3121 5.73555C16.0211 6.13266 16.6412 6.67561 17.1329 7.32986C17.6246 7.9841 17.9773 8.73535 18.1684 9.53582C18.3595 10.3363 18.3848 11.1685 18.2429 11.9795C16.1883 13.0001 14.5278 14.6904 13.5252 16.7819C12.6856 16.9345 11.8233 16.8978 10.9992 16.6744C10.175 16.451 9.40895 16.0464 8.75503 15.489C8.10112 14.9316 7.57522 14.2351 7.2144 13.4484C6.85358 12.6617 6.66661 11.8041 6.66667 10.9359ZM12.9229 18.3584H9.58333C8.03624 18.3584 6.55251 18.984 5.45854 20.0976C4.36458 21.2112 3.75 22.7216 3.75 24.2965V25.781C3.75 26.5684 4.05729 27.3236 4.60427 27.8804C5.15125 28.4372 5.89312 28.75 6.66667 28.75H15.564C14.5926 27.7835 13.821 26.6288 13.2948 25.354C12.7686 24.0793 12.4984 22.7102 12.5 21.3274C12.5 20.2957 12.6473 19.2996 12.9229 18.3584Z"
                                    fill="black" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <div class="text-lg font-semibold truncate">Configurar Cuenta</div>
                            <div class="text-sm text-slate-500 truncate">Editar tu perfil y datos de pago</div>
                        </div>
                    </div>
                </RouterLink>

                <RouterLink :to="{ name: 'sales-user' }" class="block">
                    <div
                        class="group flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        <div class="w-10 h-10 flex-shrink-0">
                            <svg viewBox="0 0 30 30" class="w-full h-full" xmlns="http://www.w3.org/2000/svg"
                                fill="none">
                                <path
                                    d="M20 14.375C20 13.5462 20.3292 12.7513 20.9153 12.1653C21.5013 11.5792 22.2962 11.25 23.125 11.25C23.9538 11.25 24.7487 11.5792 25.3347 12.1653C25.9208 12.7513 26.25 13.5462 26.25 14.375C26.25 15.2038 25.9208 15.9987 25.3347 16.5847C24.7487 17.1708 23.9538 17.5 23.125 17.5C22.2962 17.5 21.5013 17.1708 20.9153 16.5847C20.3292 15.9987 20 15.2038 20 14.375ZM16.25 3.75V25H30V3.75H16.25ZM27.5 20C26.125 20 25 21.125 25 22.5H21.25C21.25 21.837 20.9866 21.2011 20.5178 20.7322C20.0489 20.2634 19.413 20 18.75 20V8.75C20.1375 8.75 21.25 7.6375 21.25 6.25H25C25 6.91304 25.2634 7.54893 25.7322 8.01777C26.2011 8.48661 26.837 8.75 27.5 8.75V20ZM8.75 7.5C10.125 7.5 11.25 8.625 11.25 10C11.25 11.375 10.125 12.5 8.75 12.5C7.375 12.5 6.25 11.375 6.25 10C6.25 8.625 7.375 7.5 8.75 7.5ZM8.75 5C5.9875 5 3.75 7.2375 3.75 10C3.75 12.7625 5.9875 15 8.75 15C11.5125 15 13.75 12.7625 13.75 10C13.75 7.2375 11.5125 5 8.75 5ZM8.75 17.5C3.9125 17.5 0 19.7375 0 22.5V25H13.75V22.5H2.5C2.5 21.775 4.6875 20 8.75 20C11.0375 20 12.7125 20.5625 13.75 21.1875V18.4C12.3375 17.8375 10.625 17.5 8.75 17.5Z"
                                    fill="black" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <div class="text-lg font-semibold truncate">Historial de ventas</div>
                            <div class="text-sm text-slate-500 truncate">Ver tus transacciones y facturas</div>
                        </div>
                    </div>
                </RouterLink>

                <!-- Item no-link (Ayuda) -->
                <div
                    class="group flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
                    <div class="w-10 h-10 flex-shrink-0">
                        <svg viewBox="0 0 30 30" class="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none">
                            <path
                                d="M15 2.5C8.09625 2.5 2.5 8.09625 2.5 15C2.5 21.9038 8.09625 27.5 15 27.5C21.9038 27.5 27.5 21.9038 27.5 15C27.5 8.09625 21.9038 2.5 15 2.5ZM16.25 22.5H13.75V20H16.25V22.5ZM16.25 17.3238V18.75H13.75V16.25C13.75 15.9185 13.8817 15.6005 14.1161 15.3661C14.3505 15.1317 14.6685 15 15 15C16.3788 15 17.5 13.8788 17.5 12.5C17.5 11.1213 16.3788 10 15 10C13.6213 10 12.5 11.1213 12.5 12.5H10C10 11.1739 10.5268 9.90215 11.4645 8.96447C12.4021 8.02678 13.6739 7.5 15 7.5C16.3261 7.5 17.5979 8.02678 18.5355 8.96447C19.4732 9.90215 20 11.1739 20 12.5C19.9983 13.606 19.629 14.6801 18.9501 15.5533C18.2713 16.4265 17.3214 17.0493 16.25 17.3238Z"
                                fill="black" />
                        </svg>
                    </div>
                    <div class="min-w-0">
                        <div class="text-lg font-semibold truncate">Ayuda</div>
                        <div class="text-sm text-slate-500 truncate">Documentación y soporte</div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Footer -->

    </div>
    <footer class="bg-slate-50 w-full">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <FooterComponent />
        </div>
    </footer>
</template>
