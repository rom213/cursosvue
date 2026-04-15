// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { ICategory } from "../types/Categorie";
import type { FilterType } from "../courses/courseFilterData";

class CategoryService {
    static async getAllCategories(limit: number = 6, offset: number = 0, filterType: FilterType = 'all'): Promise<ICategory[] | []> {
        try {
          const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
          // El SP MySQL espera "temas" para bloques (tipo_categoria = 4), no "bloques"
          if (filterType !== 'all') {
            const apiFilter = filterType === 'bloques' ? 'temas' : filterType;
            params.append('filter_type', apiFilter);
          }
          const response: AxiosResponse<ICategory[]> = await ApiService.get<ICategory[]>(
            `api/category/all-categories?${params.toString()}`
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


      static async getCategoryBloques(categoryId: number): Promise<{ pilar: { id: number; titulo: string }; bloques: ICategory[] }[]> {
        try {
          const response = await ApiService.get<{ pilar: { id: number; titulo: string }; bloques: ICategory[] }[]>(
            `api/category/${categoryId}/bloques`
          );
          return response.data;
        } catch (error) {
          console.error(`Error obteniendo bloques de categoría ${categoryId}:`, error);
          return [];
        }
      }

      static async getMyCourses(): Promise<ICategory[]> {
        try {
          const response: AxiosResponse<ICategory[]> = await ApiService.get<ICategory[]>(
            'api/category/my-courses'
          );
          return response.data;
        } catch (error) {
          console.error("Error obteniendo mis cursos:", error);
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

      static async agregarMiembroTiempo(google_id:string, categoryId:number):Promise<any[]>{
        try {
          let data= {
            "extra1":`|${categoryId},${google_id}`
          }
          console.log(data);
          const response: AxiosResponse<any[]> = await ApiService.post<any[]>(
            `/api/groups/add-member-time`, data
          );
          return response.data;
        } catch (error) {
          console.error("Error buscando categorías:", error);
          return [];
        }
      }
}


export default CategoryService;