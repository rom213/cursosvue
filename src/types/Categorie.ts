export interface ICourse {
    id: number;
    name: string;
    autor: string;
    category_id: number;
    created_at: string; // ISO 8601 format
  }

  export interface IQuestionAnswer {
    pregunta: string;
    respuesta: string;
  }

  export interface IInfoTecnica {
    url?: string;
  }

  export interface ICategoryCourseDetail {
    id?: number;
    name_del_curso?: string;
    author?: string;
    contenido?: string; // HTML enriquecido (descripción del curso)
    subcategoria?: string;
    info_tecnica?: IInfoTecnica;
    es_gratis?: boolean;
  }

  export interface ICategory {
    id: number;
    titulo?: string;
    url?: string;
    frase_1?: string;
    frase_2?: string;
    imagen_url?: string;
    autor?: string;
    pack_nombre?: string;
    cantidad_cursos?: number;
    num_per?: number;
    cupos_google:number;
    descuento?: number;
    precio?: number;
    precio_desc: number;
    reference_code:string;
    signature: string;
    user_bought: boolean;
    user_comment:boolean;
    cat_rel?: Array<number | string>; 
    cat_rel_info?: Array<{ id: number; titulo: string }>;
    pregunta_respuesta?: IQuestionAnswer[];
    duracion?: string;
    delete_at?: string | null; // Puede ser `null`
    created_at: string;
    courses: ICourse[]; // Relación con Course
  }
  