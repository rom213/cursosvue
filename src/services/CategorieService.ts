// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { ICategory, ICategoryCourseDetail } from "../types/Categorie";
import type { FilterType } from "../courses/courseFilterData";

export interface IPaginatedCourses {
  items: ICategoryCourseDetail[];
  total: number;
  offset: number;
  limit: number;
}

export interface IGetCoursesParams {
  offset?: number;
  limit?: number;
  q?: string;
  only_free?: boolean;
  subcategoria?: string;
  autor?: string;
  tema_id?: number;
}

export interface ILocatedCourse {
  course: ICategoryCourseDetail;
  course_id: number;
  index: number;
  offset: number;
  limit: number;
}

export type FacetBy = "subcategoria" | "autor" | "tema";

export interface IFacetSubcategoriaItem {
  subcategoria: string;
  count: number;
}

export interface IFacetAutorItem {
  autor: string;
  count: number;
}

export interface IFacetTemaItem {
  tema_id: number;
  titulo: string;
  imagen_url?: string | null;
  count: number;
}

export type IFacetItem = IFacetSubcategoriaItem | IFacetAutorItem | IFacetTemaItem;

export interface IGetFacetsParams {
  by: FacetBy;
  offset?: number;
  limit?: number;
  q?: string;
  only_free?: boolean;
}

export interface IFacetsResult<T = IFacetItem> {
  items: T[];
  total: number;
}

export interface IBloquePilarGroup {
  pilar: { id: number; titulo: string };
  total: number;
  bloques: ICategory[];
}

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


      static async getCategoryBloques(categoryId: number): Promise<IBloquePilarGroup[]> {
        try {
          const response = await ApiService.get<IBloquePilarGroup[]>(
            `api/category/${categoryId}/bloques`
          );
          return response.data;
        } catch (error) {
          console.error(`Error obteniendo bloques de categoría ${categoryId}:`, error);
          return [];
        }
      }

      /** Página de bloques de un pilar concreto (paginación server-side). */
      static async getBloquesPilarPage(
        categoryId: number,
        pilarId: number,
        offset: number,
        limit: number,
      ): Promise<IBloquePilarGroup | null> {
        try {
          const search = new URLSearchParams({
            pilar_id: String(pilarId),
            offset: String(offset),
            limit: String(limit),
          });
          const response = await ApiService.get<IBloquePilarGroup>(
            `api/category/${categoryId}/bloques?${search.toString()}`
          );
          return response.data;
        } catch (error) {
          console.error(`Error obteniendo página de bloques (pilar ${pilarId}):`, error);
          return null;
        }
      }

      static async getCourses(categoryId: number, params: IGetCoursesParams = {}): Promise<IPaginatedCourses> {
        const fallback: IPaginatedCourses = { items: [], total: 0, offset: params.offset ?? 0, limit: params.limit ?? 10 };
        try {
          const search = new URLSearchParams();
          if (params.offset !== undefined) search.set("offset", String(params.offset));
          if (params.limit !== undefined) search.set("limit", String(params.limit));
          if (params.q) search.set("q", params.q);
          if (params.only_free) search.set("only_free", "true");
          if (params.subcategoria) search.set("subcategoria", params.subcategoria);
          if (params.autor) search.set("autor", params.autor);
          if (params.tema_id !== undefined) search.set("tema_id", String(params.tema_id));
          const response: AxiosResponse<IPaginatedCourses> = await ApiService.get<IPaginatedCourses>(
            `api/category/${categoryId}/courses?${search.toString()}`
          );
          return response.data;
        } catch (error) {
          console.error(`Error obteniendo cursos de categoría ${categoryId}:`, error);
          return fallback;
        }
      }

      static async getFacets<T = IFacetItem>(categoryId: number, params: IGetFacetsParams): Promise<IFacetsResult<T>> {
        const fallback: IFacetsResult<T> = { items: [], total: 0 };
        try {
          const search = new URLSearchParams();
          search.set("by", params.by);
          if (params.offset !== undefined) search.set("offset", String(params.offset));
          if (params.limit !== undefined) search.set("limit", String(params.limit));
          if (params.q) search.set("q", params.q);
          if (params.only_free) search.set("only_free", "true");
          const response: AxiosResponse<IFacetsResult<T>> = await ApiService.get<IFacetsResult<T>>(
            `api/category/${categoryId}/facets?${search.toString()}`
          );
          return response.data;
        } catch (error) {
          console.error(`Error obteniendo facets de categoría ${categoryId}:`, error);
          return fallback;
        }
      }

      /** Ubica un curso por slug (link directo) o nombre (promo/referido) para saber qué página de getCourses cargar. */
      static async locateCourse(
        categoryId: number,
        params: { slug?: string; nombre?: string; limit?: number },
      ): Promise<ILocatedCourse | null> {
        try {
          const search = new URLSearchParams();
          if (params.slug) search.set("slug", params.slug);
          if (params.nombre) search.set("nombre", params.nombre);
          if (params.limit !== undefined) search.set("limit", String(params.limit));
          const response: AxiosResponse<ILocatedCourse> = await ApiService.get<ILocatedCourse>(
            `api/category/${categoryId}/courses/locate?${search.toString()}`
          );
          return response.data;
        } catch (error) {
          return null;
        }
      }

      /** Trae bajo demanda el contenido (HTML) de un curso al expandirlo. */
      static async getCourseContenido(courseId: number): Promise<string> {
        try {
          const response: AxiosResponse<{ id: number; contenido: string | null }> =
            await ApiService.get<{ id: number; contenido: string | null }>(
              `api/category/courses/${courseId}/contenido`
            );
          return response.data.contenido ?? "";
        } catch (error) {
          console.error(`Error obteniendo contenido del curso ${courseId}:`, error);
          return "";
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