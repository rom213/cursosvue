export interface ICourse {
    id: number;
    name: string;
    autor: string;
    category_id: number;
    created_at: string; // ISO 8601 format
  }

  export interface ICategory {
    id: number;
    titulo?: string;
    url?: string;
    frase_1?: string;
    frase_2?: string;
    imagen_url?: string;
    num_per?: number;
    descuento?: number;
    precio?: number;
    precio_desc: number;
    reference_code:string;
    signature: string;
    user_bought: boolean;
    user_comment:boolean;
    duracion?: string;
    delete_at?: string | null; // Puede ser `null`
    created_at: string;
    courses: ICourse[]; // Relación con Course
  }
  