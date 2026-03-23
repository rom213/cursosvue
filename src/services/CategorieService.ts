// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { ICategory } from "../types/Categorie";

class CategoryService {
    static async getAllCategories(limit: number = 6, offset: number = 0): Promise<ICategory[] | []> {
        try {
          const response: AxiosResponse<ICategory[]> = await ApiService.get<ICategory[]>(
            `api/category/all-categories?limit=${limit}&offset=${offset}`
          );
          return response.data;
        } catch (error) {
          console.error("Error obteniendo categorías:", error);
          return [];
        }
      }

      static async getCategoryById(categoryId: number): Promise<ICategory | null> {
        try {
          const response: AxiosResponse<ICategory> = await ApiService.get<ICategory>(
            `api/category/${categoryId}`
          );
          return response.data;
        } catch (error) {
          console.error(`Error obteniendo categoría con id ${categoryId}:`, error);
          return null;
        }
      }


      static async searchCategories(searchTerm: string, limit: number = 10): Promise<ICategory[] | []> {
        try {
          
          const response: AxiosResponse<ICategory[]> = await ApiService.get<ICategory[]>(
            `/api/category/categories/deep-search?q=${searchTerm}&limit=${limit}`
          );
          return response.data;
        } catch (error) {
          console.error("Error buscando categorías:", error);
          return [];
        }
      }
}


export default CategoryService;