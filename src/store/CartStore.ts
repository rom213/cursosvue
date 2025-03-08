import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { ICategory } from '../types/Categorie';


export const cartStore = defineStore('car', () => {
    const cartCategories = ref<ICategory[]>([])

    watch(cartCategories,()=>{
        countCart
        valueCart
    })

    const countCart=computed(()=>{
        return cartCategories.value.length
    })

    const valueCart = computed(() => {
        let total = 0;
        cartCategories.value.forEach(item => {
          // Si no hay descuento, se toma 0%
          const descuento = item.descuento || 0;
          if (item.precio) {
            const precioFinal = item.precio - (item.precio * descuento / 100);
            total += precioFinal;
          }
        });
        return total;
      });



    function validateCart(car: ICategory): boolean {
        return !cartCategories.value.some(carro => carro.id === car.id);
    }
    
    function setCart(car: ICategory) {
        cartCategories.value.push(car)
    }

    function getCart(): ICategory[] | [] {
        return cartCategories.value
    }

    function deleteItem(id:Number){
        cartCategories.value = cartCategories.value.filter(item => item.id !== id);
    }

    



    return { setCart, getCart, validateCart, countCart, valueCart, deleteItem };
});
