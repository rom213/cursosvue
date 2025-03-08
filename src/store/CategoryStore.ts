import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ICategory } from '../types/Categorie';


export const categoryStore = defineStore('category', () => {
    const categories= ref<[] | ICategory[]>([])
    const category =ref<ICategory>()


    function setCategories(cat: [] | ICategory[]){
        categories.value=cat
    }

    function getCategories(): ICategory[] | [] {
        return categories.value
    }

    function getCategoriesBougth(): ICategory[] | [] {
        const category_bought = categories.value.filter(dat=>dat.user_bought===true)
        return category_bought
    }

    function findCategoryById(id: number): ICategory | undefined {
        const cat= categories.value.find(item => item.id === id);
        category.value=cat;
        return cat
    }

    function getCategory(): ICategory | undefined {
        return category.value
    }

    return { setCategories, getCategories, findCategoryById, categories, getCategory, getCategoriesBougth };
});
