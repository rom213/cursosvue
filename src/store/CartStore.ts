import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ICategory } from '../types/Categorie';


export const cartStore = defineStore('car', () => {
    const cartCategories = ref<ICategory[]>([])

    const countCart=computed(()=>{
        return cartCategories.value.length
    })


    function validateCart(car: ICategory): boolean {
        return !cartCategories.value.some(carro => carro.id === car.id);
    }
    
    function setCart(car: ICategory) {
        cartCategories.value.push(car)
    }

    function getCart(): ICategory[] | [] {
        return JSON.parse(JSON.stringify(cartCategories.value));
    }

    function deleteItem(id:Number){
        cartCategories.value = cartCategories.value.filter(item => item.id !== id);
    }

    



    return { setCart, getCart, validateCart, countCart, deleteItem, cartCategories };
});
