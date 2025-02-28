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
}


export default CategoryService;