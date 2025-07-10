// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { ICategory } from "../types/Categorie";

class CategoryService {
    static async getAllCategories(): Promise<ICategory[] | []> {
        try {
          const response: AxiosResponse<ICategory[]> = await ApiService.get<ICategory[]>("api/category/all-categories");
          return response.data;
        } catch (error) {
          console.error("Error obteniendo categorías:", error);
          return [];
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