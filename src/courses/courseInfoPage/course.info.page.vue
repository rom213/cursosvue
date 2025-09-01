<script setup lang="ts">
import { ref } from 'vue';
import { categoryStore } from '../../store/CategoryStore';
import CourseBodyInfoComponent from './componentCourseInfo/course.body.info.component.vue';
import CourseImgComponent from './componentCourseInfo/course.img.component.vue';
import MessageService from '../../services/MessageService';
import { authStore } from '../../store/AuthStore';
import FooterComponent from '../../components/footer/footer.component.vue';
import { emergentBuyStore } from '../../store/EmergentBuyStore';

const stars = ref(0)
const comment = ref("")
const userAuth = authStore()

const storeCategory = categoryStore()


const hadleMauseOver = (index: number) => {
    stars.value = index
}

const saveMessage = () => {
    const is_succes = MessageService.addMessage(Number(storeCategory.getCategory()?.id), comment.value, stars.value)
    is_succes.then((res: boolean) => {
        if (res) {
            window.location.reload()
        }
        if (!res) {
            alert("posible error")
            window.location.reload()
        }
    });
}

const storeemergentBuy = emergentBuyStore();

const handleBuy = () => {
    const categorie = storeCategory.getCategory()
    if (categorie) {
        storeemergentBuy.setCategoryEmergent(categorie)
        storeemergentBuy.buyCategory();
    }

}




</script>


<template>
    <div class="md:px-42 pt-8">
        <CourseImgComponent />

        <div v-if="storeCategory.getCategory()?.user_bought && !storeCategory.getCategory()?.user_comment" class="p-4">
            <div class="flex justify-between">
                <div>
                    <h4 class="font-semibold">
                        Califica estos cursos
                    </h4>
                    <p class="text-sm">Comparte tu opinion</p>
                </div>
                <div v-if="stars > 0" @click="saveMessage()" class="text-blue-600">Publicar</div>
            </div>

            <div>
                <template v-for="index in 5" :key="index">
                    <span @mouseover="hadleMauseOver(index)" class="text-4xl"
                        v-if="index <= Math.round(Number(stars))">★</span>
                    <span @mouseover="hadleMauseOver(index)" v-else class="text-gray-300 text-4xl">★</span>
                </template>
                <div v-if="stars > 0" class="w-full">
                    <input v-model="comment" placeholder="escribe tu experiencia (opcional)"
                        class="outline-none border border-black w-full p-2 rounded-sm" />
                </div>
            </div>
        </div>


        <CourseBodyInfoComponent />

        <!-- footer comprar cursos -->
        <div @click="handleBuy()" v-if="!storeCategory.getCategory()?.user_bought"
            class="sticky bottom-0 h-[80px] w-full flex gap-7 p-4 bg-white">
            <button class="bg-[#CDFF00] rounded-sm">
                <div class="flex gap-2 p-2"
                    v-if="!userAuth.getProfile()?.user?.is_bought && storeCategory.getCategory()?.precio_desc">
                    <div class="font-bold">COMPRAR</div>
                    <div>${{ (storeCategory.getCategory()?.precio_desc ?? 0) + 3999 }}</div>
                </div>

                <!-- se muestra el precio real si la persona compro o hay codigo de referrencia -->
                <p v-if="userAuth.getProfile()?.user?.is_bought">
                    comprar ${{ storeCategory.getCategory()?.precio_desc }}
                </p>
            </button>

            <button class="flex items-center bg-[#CDFF00] rounded-lg px-3">
                <div>
                    VISTA PREVIA
                </div>
                <div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_352_56)">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.31 3C14.6332 3 14.9516 3.07832 15.2379 3.22827C15.5243 3.37822 15.77 3.59533 15.954 3.861L16.042 4L21.815 14C21.9755 14.2779 22.0667 14.5904 22.081 14.911C22.0952 15.2316 22.0321 15.5509 21.897 15.842L21.815 16L19.505 20C19.3435 20.2798 19.1165 20.5162 18.8436 20.6892C18.5707 20.8621 18.26 20.9664 17.938 20.993L17.774 21H6.22703C5.90365 21.0002 5.58506 20.9219 5.29856 20.772C5.01205 20.622 4.76619 20.4048 4.58202 20.139L4.49502 20L2.18502 16C2.02458 15.7221 1.93337 15.4096 1.91909 15.089C1.90482 14.7684 1.96791 14.4491 2.10302 14.158L2.18502 14L7.96002 4C8.12169 3.72009 8.34878 3.48354 8.62187 3.3106C8.89495 3.13766 9.20588 3.03349 9.52802 3.007L9.69102 3H14.31ZM19.506 16H9.11302L7.38102 19H17.774L19.506 16ZM9.11403 6L3.91702 15L5.64902 18L10.845 9L9.11403 6ZM14.31 5H10.846L16.042 14H19.506L14.31 5ZM12 11L10.268 14H13.732L12 11Z"
                                fill="black" />
                        </g>
                        <defs>
                            <clipPath id="clip0_352_56">
                                <rect width="24" height="24" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </button>
        </div>

    </div>

    <FooterComponent />


</template>