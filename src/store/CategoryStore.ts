import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ICategory } from '../types/Categorie';


export const categoryStore = defineStore('category', () => {
    const categories= ref<[] | ICategory[]>([])


    function setCategories(cat: [] | ICategory[]){
        categories.value=cat
    }

    function getCategories(): ICategory[] | [] {
        return categories.value
    }




    return { setCategories, getCategories };
});
