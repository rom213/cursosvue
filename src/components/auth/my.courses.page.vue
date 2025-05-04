<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import type { ICategory } from '../../types/Categorie';
import { categoryStore } from '../../store/CategoryStore';

const courseBougth = ref<ICategory[] | []>([])
import FooterComponent from '../../components/footer/footer.component.vue';
import { useRouter } from 'vue-router';
import AffiliatyMessageComponent from '../../components/auth/affiliaty.message.component.vue';
const storeCatergory = categoryStore()
const router = useRouter()

onMounted(() => {
  courseBougth.value = storeCatergory.getCategoriesBougth();
})


watch(
  () => storeCatergory.categories,
  () => {
    courseBougth.value = storeCatergory.getCategoriesBougth();
  },
  { deep: true }
);

const hadleLinkCoursesDrive = (link: string | undefined) => {
  if (link) {
    window.open(link, "_blank"); // Abre el enlace en una nueva pestaña
  }
}

const handleClickItem = (id: number) => {
  router.push({ name: 'courses-description', params: { id: id } })
}



</script>

<template>
  <div class="pt-4">
    <!-- se muestra si no hay cursos disponibles -->
    <div v-if="courseBougth.length == 0" class="mt-12">
      <div class="text-center font-light">
        AUN
        NO TIENES CURSOS DISPONIBLES
        TE INVITAMOS A VER NUESTRAS CATEGORIAS
      </div>
      <div class="flex justify-center">
        <svg width="40" height="42" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0.5 13.5H39.5L37.4647 36.4525C37.3546 37.6948 36.7958 38.85 35.8979 39.6914C35 40.5328 33.8278 40.9995 32.6116 41H7.38838C6.17215 40.9995 5.00004 40.5328 4.10213 39.6914C3.20422 38.85 2.64538 37.6948 2.53531 36.4525L0.5 13.5Z"
            stroke="black" stroke-linejoin="round" />
          <path
            d="M10.25 18.5V11C10.25 8.34784 11.2772 5.8043 13.1057 3.92893C14.9342 2.05357 17.4141 1 20 1C22.5859 1 25.0658 2.05357 26.8943 3.92893C28.7228 5.8043 29.75 8.34784 29.75 11V18.5"
            stroke="black" stroke-linecap="round" />
        </svg>

      </div>
    </div>
    <div v-if="courseBougth.length > 0" class="h-full grid gap-6 px-1">
      <div class="text-center">
        <h2 class="font-semibold">MIS CURSOS</h2>
        <p class="text-sm">Cada gran logro comienza con un pequeño paso</p>
      </div>

      <div class=" grid gap-2">
        <div v-for="(item, index) in courseBougth" :key="index" class="grid grid-cols-3 text-sm">
          <div @click="handleClickItem(item.id)" class="col-span-1 bg-red-300 flex ">
            <img class="rounded-sm" :src="item.imagen_url" alt="">
          </div>
          <div class="col-span-2 flex gap-4 flex-col px-2 justify-center">
            <div>
              <div class="grid grid-cols-3">
                <div @click="handleClickItem(item.id)" class="col-span-2">
                  <h3 class="font-semibold">{{ item.titulo }}</h3>
                  <p>cantidad de cursos #{{ item.courses.length }}</p>
                </div>
                <!-- boton ver mis cursos -->
                <div @click="hadleLinkCoursesDrive(item.url)"
                  class="bg-[#CDFF00] w-full flex col-span-1 p-1 items-center justify-center rounded-sm">
                  <p class="text-[10px]">ver mis cursos</p>
                  <div>
                    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_537_286)">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M14.3099 3.5C14.6331 3.5 14.9515 3.57832 15.2378 3.72827C15.5241 3.87822 15.7698 4.09533 15.9539 4.361L16.0419 4.5L21.8149 14.5C21.9754 14.7779 22.0666 15.0904 22.0808 15.411C22.0951 15.7316 22.032 16.0509 21.8969 16.342L21.8149 16.5L19.5049 20.5C19.3433 20.7798 19.1164 21.0162 18.8435 21.1892C18.5706 21.3621 18.2599 21.4664 17.9379 21.493L17.7739 21.5H6.2269C5.90353 21.5002 5.58494 21.4219 5.29843 21.272C5.01193 21.122 4.76606 20.9048 4.5819 20.639L4.4949 20.5L2.1849 16.5C2.02445 16.2221 1.93324 15.9096 1.91897 15.589C1.9047 15.2684 1.96779 14.9491 2.1029 14.658L2.1849 14.5L7.9599 4.5C8.12157 4.22009 8.34866 3.98354 8.62174 3.8106C8.89482 3.63766 9.20575 3.53349 9.5279 3.507L9.6909 3.5H14.3099ZM19.5059 16.5H9.1129L7.3809 19.5H17.7739L19.5059 16.5ZM9.1139 6.5L3.9169 15.5L5.6489 18.5L10.8449 9.5L9.1139 6.5ZM14.3099 5.5H10.8459L16.0419 14.5H19.5059L14.3099 5.5ZM11.9999 11.5L10.2679 14.5H13.7319L11.9999 11.5Z"
                          fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_537_286">
                          <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
                        </clipPath>
                      </defs>
                    </svg>

                  </div>
                </div>

              </div>

            </div>

            <br>

            <!-- link de afiliado -->
            <div>
              <AffiliatyMessageComponent :id_category="item.id" />
            </div>
            <div>

            </div>
          </div>
        </div>

      </div>

      <div>

      </div>



    </div>

    <div>
      <FooterComponent class="absolute bottom-0 w-full" />
    </div>
  </div>
</template>