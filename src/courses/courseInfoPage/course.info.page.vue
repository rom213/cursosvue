<script setup lang="ts">
import { ref } from 'vue';
import { categoryStore } from '../../store/CategoryStore';
import CourseBodyInfoComponent from './componentCourseInfo/course.body.info.component.vue';
import CourseImgComponent from './componentCourseInfo/course.img.component.vue';
import MessageService from '../../services/MessageService';

const stars = ref(0)
const comment= ref("")

const storeCategory = categoryStore()

const hadleMauseOver = (index: number) => {
    stars.value = index
}

const saveMessage= ()=>{
    const is_succes=MessageService.addMessage(Number(storeCategory.getCategory()?.id), comment.value, stars.value)
    is_succes.then((res:boolean)=>{
        if (res) {
            window.location.reload()
        }
        if (!res) {
            alert("posible error")
            window.location.reload()
        }
    });
}

</script>


<template>
    <div>
        <CourseImgComponent />

        <div v-if="storeCategory.getCategory()?.user_bought && !storeCategory.getCategory()?.user_comment" class="p-4">
            <div class="flex justify-between">
                <div>
                    <h4 class="font-semibold">
                        Califica estos cursos
                    </h4>
                    <p class="text-sm">Comparte tu opinion</p>
                </div>
                <div v-if="stars>0" @click="saveMessage()" class="text-blue-600">Publicar</div>
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
    </div>
</template>