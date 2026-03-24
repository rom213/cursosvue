<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { categoryStore } from '../store/CategoryStore';
import CategoryService from '../services/CategorieService';
import FooterComponent from '../components/footer/footer.component.vue';
import { authStore } from '../store/AuthStore';
import EmergentBuyComponent from './emergent.buy.component.vue';
import { emergentBuyStore } from '../store/EmergentBuyStore';
import { cartStore } from '../store/CartStore';
import type { ICategory } from '../types/Categorie';
import { courseIcons } from './courseIcons';
import AffiliatyMessageComponent from '../components/auth/affiliaty.message.component.vue';

const storeemergentBuy = emergentBuyStore();
const categorStore = categoryStore();
const storeAuth = authStore();
const cartSt = cartStore();
const router = useRouter();

const pageSize = 6;
const currentOffset = ref(0);
const hasMoreCategories = ref(true);
const isLoadingMore = ref(false);
const categories = ref<ICategory[]>([]);

const loadMoreCategories = async () => {
  if (!hasMoreCategories.value || isLoadingMore.value) {
    return;
  }

  isLoadingMore.value = true;

  const batch = await CategoryService.getAllCategories(pageSize, currentOffset.value);
  const list = batch as ICategory[];

  if (list.length < pageSize) {
    hasMoreCategories.value = false;
  }

  currentOffset.value += list.length;

  const unboughtList = list.filter((item) => !item.user_bought);

  categories.value = [...categories.value, ...unboughtList];
  categorStore.setCategories(categories.value);

  isLoadingMore.value = false;
};

const handleScroll = () => {
  if (!hasMoreCategories.value || isLoadingMore.value) return;
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
  if (nearBottom) {
    void loadMoreCategories();
  }
};

const addCarCategory = (item: ICategory) => {
  if (storeAuth.getProfile() == null) {
    router.push('/login');
    return;
  }
  if (cartSt.validateCart(item)) {
    cartSt.setCart(item);
  }
};

const handleClickCourseItem = (id: number) => {
  router.push({ name: 'courses-description', params: { id } });
};

onMounted(async () => {
  categories.value = [];
  currentOffset.value = 0;
  hasMoreCategories.value = true;
  await loadMoreCategories();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div>
    <div
      v-if="storeAuth.nameAffiliaty"
      class="text-[10px] mt-1 pl-2 font-semibold"
    >
      Comprar con el descuento de {{ storeAuth.nameAffiliaty }}
    </div>
    <div class="md:grid md:grid-cols-2 md:px-12 md:gap-3">
      <div
        v-for="(item, index) in categories"
        :key="index"
        :class="{ 'blur-[2px]': storeemergentBuy.emergentBuy.emergent }"
      >
        <div
          class="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
        >
          <div class="p-5 pb-0">
            <h3
              class="font-bold text-xl text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
              :title="item.titulo"
              @click="handleClickCourseItem(item.id)"
            >
              {{ item.titulo }}
            </h3>
            <p class="text-gray-500 text-sm mt-1 line-clamp-2">{{ item.frase_1 }}</p>
          </div>

          <div class="p-5 pt-4 flex flex-col sm:flex-row gap-5 flex-grow">
            <div
              class="relative w-full sm:w-2/5 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group-hover:ring-2 ring-offset-2 ring-blue-500/20 transition-all"
              @click="handleClickCourseItem(item.id)"
            >
              <img
                class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                :src="item.imagen_url"
                alt="Course Image"
              />
              <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            <div class="flex flex-col justify-between w-full sm:w-3/5 gap-4">
              <div class="cursor-pointer space-y-4" @click="handleClickCourseItem(item.id)">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    Certificación incluida
                  </span>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-3 text-gray-700 group/item">
                    <div
                      class="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover/item:bg-red-100 transition-colors"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 25 22"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.5 0C14.7422 0 16.5625 2.20948 16.5625 4.93103C16.5625 7.65259 14.7422 9.86207 12.5 9.86207C10.2578 9.86207 8.4375 7.65259 8.4375 4.93103C8.4375 2.20948 10.2578 0 12.5 0ZM3.75 3.41379C5.30469 3.41379 6.5625 4.94052 6.5625 6.82759C6.5625 8.71465 5.30469 10.2414 3.75 10.2414C2.19531 10.2414 0.9375 8.71465 0.9375 6.82759C0.9375 4.94052 2.19531 3.41379 3.75 3.41379ZM0 18.9655C0 15.6134 2.23828 12.8966 5 12.8966C5.5 12.8966 5.98438 12.9866 6.44141 13.1526C5.15625 14.8974 4.375 17.2017 4.375 19.7241V20.4828C4.375 21.0233 4.46875 21.5353 4.63672 22H1.25C0.558594 22 0 21.322 0 20.4828V18.9655ZM20.3633 22C20.5312 21.5353 20.625 21.0233 20.625 20.4828V19.7241C20.625 17.2017 19.8438 14.8974 18.5586 13.1526C19.0156 12.9866 19.5 12.8966 20 12.8966C22.7617 12.8966 25 15.6134 25 18.9655V20.4828C25 21.322 24.4414 22 23.75 22H20.3633ZM18.4375 6.82759C18.4375 4.94052 19.6953 3.41379 21.25 3.41379C22.8047 3.41379 24.0625 4.94052 24.0625 6.82759C24.0625 8.71465 22.8047 10.2414 21.25 10.2414C19.6953 10.2414 18.4375 8.71465 18.4375 6.82759ZM6.25 19.7241C6.25 15.5328 9.04688 12.1379 12.5 12.1379C15.9531 12.1379 18.75 15.5328 18.75 19.7241V20.4828C18.75 21.322 18.1914 22 17.5 22H7.5C6.80859 22 6.25 21.322 6.25 20.4828V19.7241Z"
                        />
                      </svg>
                    </div>
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-sm font-medium text-gray-500">Cupos disponibles:</span>
                      <span class="text-lg font-bold text-gray-900">{{ item.num_per || 23 }}</span>
                      <span class="text-xs text-gray-400 font-medium">/ 200</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 text-gray-700 group/item">
                    <div
                      class="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 group-hover/item:bg-indigo-100 transition-colors"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 27 27"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M5.0625 4.21875C5.0625 3.99497 5.15139 3.78036 5.30963 3.62213C5.46786 3.4639 5.68247 3.375 5.90625 3.375H21.0938C21.3175 3.375 21.5321 3.4639 21.6904 3.62213C21.8486 3.78036 21.9375 3.99497 21.9375 4.21875V9.28125H22.7812C23.005 9.28125 23.2196 9.37014 23.3779 9.52838C23.5361 9.68661 23.625 9.90122 23.625 10.125V21.0938C23.625 21.3175 23.5361 21.5321 23.3779 21.6904C23.2196 21.8486 23.005 21.9375 22.7812 21.9375H4.21875C3.99497 21.9375 3.78036 21.8486 3.62213 21.6904C3.4639 21.5321 3.375 21.3175 3.375 21.0938V7.59375C3.375 7.36997 3.4639 7.15536 3.62213 6.99713C3.78036 6.8389 3.99497 6.75 4.21875 6.75H5.0625V4.21875ZM5.0625 8.4375V12.6562H21.9375V10.9688H12.6562C12.5454 10.9689 12.4355 10.9473 12.333 10.905C12.2305 10.8627 12.1374 10.8007 12.0589 10.7224L9.77569 8.4375H5.0625ZM20.25 9.28125V5.0625H6.75V6.75H10.125C10.2359 6.7498 10.3457 6.77146 10.4482 6.81373C10.5507 6.85601 10.6439 6.91807 10.7224 6.99637L13.0056 9.28125H20.25Z"
                        />
                      </svg>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-sm font-medium text-gray-500">Cursos incluidos:</span>
                      <span class="text-base font-bold text-gray-900">122</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 text-gray-700 group/item">
                    <div
                      class="p-1.5 rounded-lg bg-orange-50 text-orange-500 group-hover/item:bg-orange-100 transition-colors"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M8.002 4.55295C10.6984 4.34986 13.4067 4.36324 16.101 4.59295L17.725 4.73095C18.3208 4.7819 18.8821 5.03166 19.3189 5.44009C19.7556 5.84853 20.0423 6.39192 20.133 6.98295L20.235 7.65195C20.582 9.91986 20.5496 12.2297 20.139 14.487C20.0412 15.0269 19.7568 15.5153 19.3355 15.8668C18.9142 16.2183 18.3827 16.4105 17.834 16.41H8.858C8.651 16.41 8.448 16.461 8.266 16.559L4.355 18.661C4.24071 18.7224 4.11245 18.7531 3.98275 18.7501C3.85304 18.7471 3.72633 18.7105 3.61499 18.6439C3.50364 18.5773 3.41149 18.483 3.34751 18.3701C3.28354 18.2572 3.24994 18.1297 3.25 18V9.48295C3.25026 8.23983 3.72013 7.0427 4.56552 6.1313C5.41091 5.21989 6.56941 4.6615 7.809 4.56795L8.002 4.55295ZM8 9.49995C7.66848 9.49995 7.35054 9.63165 7.11612 9.86607C6.8817 10.1005 6.75 10.4184 6.75 10.75C6.75 11.0815 6.8817 11.3994 7.11612 11.6338C7.35054 11.8683 7.66848 12 8 12C8.33152 12 8.64946 11.8683 8.88388 11.6338C9.1183 11.3994 9.25 11.0815 9.25 10.75C9.25 10.4184 9.1183 10.1005 8.88388 9.86607C8.64946 9.63165 8.33152 9.49995 8 9.49995ZM12 9.49995C11.6685 9.49995 11.3505 9.63165 11.1161 9.86607C10.8817 10.1005 10.75 10.4184 10.75 10.75C10.75 11.0815 10.8817 11.3994 11.1161 11.6338C11.3505 11.8683 11.6685 12 12 12C12.3315 12 12.6495 11.8683 12.8839 11.6338C13.1183 11.3994 13.25 11.0815 13.25 10.75C13.25 10.4184 13.1183 10.1005 12.8839 9.86607C12.6495 9.63165 12.3315 9.49995 12 9.49995ZM14.75 10.75C14.75 10.4184 14.8817 10.1005 15.1161 9.86607C15.3505 9.63165 15.6685 9.49995 16 9.49995C16.3315 9.49995 16.6495 9.63165 16.8839 9.86607C17.1183 10.1005 17.25 10.4184 17.25 10.75C17.25 11.0815 17.1183 11.3994 16.8839 11.6338C16.6495 11.8683 16.3315 12 16 12C15.6685 12 15.3505 11.8683 15.1161 11.6338C14.8817 11.3994 14.75 11.0815 14.75 10.75Z"
                        />
                      </svg>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-sm font-medium text-gray-500">Comentarios:</span>
                      <span class="text-base font-bold text-gray-900">23</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-auto space-y-3">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    title="Vista previa"
                    class="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <div class="w-5 h-5" v-html="courseIcons.preview" />
                  </button>

                  <button
                    type="button"
                    class="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex justify-center items-center gap-2"
                    @click="addCarCategory(item)"
                  >
                    <span>Agregar al carro</span>
                  </button>
                </div>

                <p
                  v-if="item.pregunta_respuesta?.[0]?.pregunta"
                  class="text-sm text-gray-700 font-medium"
                >
                  {{ item.pregunta_respuesta[0].pregunta }}
                </p>
                <button
                  type="button"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-base font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2"
                  @click="
                    () => {
                      storeemergentBuy.handleEmergentBuy();
                      storeemergentBuy.setCategoryEmergent(item);
                    }
                  "
                >
                  <span>
                    {{ ' $' + item.precio
                    }}{{ storeAuth.getProfile()?.user?.country === 'COP' ? ' COP' : ' USD' }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div class="px-5 pb-5">
            <AffiliatyMessageComponent :id_category="item.id" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoadingMore" class="text-center text-sm text-gray-600 mt-4">
      Búsqueda cargado para ti
    </div>
    <br />
    <EmergentBuyComponent />
    <FooterComponent />
  </div>
</template>
