import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ICategory } from '../types/Categorie';

const CACHE_NAME = 'curso-api-cache-v1';
const CACHE_URL = '/static-cache/categories';

export const categoryStore = defineStore('category', () => {
    const categories = ref<ICategory[]>([]);
    const category = ref<ICategory>();

    // Carga asincrónica usando la API de Cache nativa del navegador para grandes volúmenes de datos
    const initCache = async () => {
        try {
            if (!('caches' in window)) return;
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(CACHE_URL);
            if (response) {
                const data = await response.json();
                if (data && data.timestamp && Array.isArray(data.categories)) {
                    // Cargar los datos a memoria inmediatamente
                    if (categories.value.length === 0) {
                        categories.value = data.categories;
                    }
                }
            }
        } catch (e) {
            console.warn('Error reading categories from Cache API', e);
        }
    };
    
    // Iniciar carga parcial desde el caché
    initCache();

    async function fetchCategories(force: boolean = false) {
        try {
            let useCache = false;
            if (!force && 'caches' in window) {
                const cache = await caches.open(CACHE_NAME);
                const response = await cache.match(CACHE_URL);
                if (response) {
                    const data = await response.json();
                    if (data && data.timestamp && Array.isArray(data.categories)) {
                        const now = new Date().getTime();
                        const diffMins = Math.round((now - data.timestamp) / 60000);
                        if (diffMins < 10) {
                            useCache = true;
                            if (categories.value.length === 0) {
                                categories.value = data.categories;
                            }
                        }
                    }
                }
            }
            
            // fetch fresh data if no cache or expired
            if (!useCache) {
                const { default: CategoryService } = await import('../services/CategorieService');
                const freshCategories = await CategoryService.getAllCategories();
                setCategories(freshCategories);
            }
        } catch (error) {
            console.error('Error in fetchCategories', error);
        }
    }

    async function setCategories(cat: ICategory[]) {
        categories.value = cat;
        try {
            if (!('caches' in window)) return;
            const cache = await caches.open(CACHE_NAME);
            const cacheData = {
                timestamp: new Date().getTime(),
                categories: cat
            };
            const response = new Response(JSON.stringify(cacheData), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(CACHE_URL, response);
        } catch (e) {
            console.warn('Could not cache categories to Cache API', e);
        }
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


    return { setCategories, fetchCategories, getCategories, findCategoryById, categories, getCategory, getCategoriesBougth };
});
