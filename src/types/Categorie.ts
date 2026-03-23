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
    name_del_curso?: string;
    author?: string;
    contenido?: string[];
    info_tecnica?: IInfoTecnica;
  }

  export interface ICategoryPlataformaDetail {
    titulo_plataforma?: string;
    cantidad_cursos_plataforma?: number;
    url_plataforma_seleccionada?: string;
    imagen_url?: string;
    cursos?: ICategoryCourseDetail[];
  }

  export interface ICategoryTemaDetail {
    titulo_tema?: string;
    cantidad_cursos_tema?: number;
    url_tema_seleccionado?: string;
    imagen_url?: string;
    cursos?: ICategoryCourseDetail[];
  }

  export interface ICategorySeccionPlataformas {
    cantidad_plataformas?: number;
    plataformas?: ICategoryPlataformaDetail[];
  }

  export interface ICategorySeccionTemas {
    cantidad_temas?: number;
    url_temas?: string;
    temas?: ICategoryTemaDetail[];
  }

  export interface ICategorySeccionListaCompleta {
    cantidad_cursos?: number;
    url_lista_completa?: string;
    lista_completa?: ICategoryCourseDetail[];
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
    descuento?: number;
    precio?: number;
    precio_desc: number;
    reference_code:string;
    signature: string;
    user_bought: boolean;
    user_comment:boolean;
    cat_rel?: Array<number | string>;
    pregunta_respuesta?: IQuestionAnswer[];
    seccion_plataformas?: ICategorySeccionPlataformas;
    seccion_temas?: ICategorySeccionTemas;
    seccion_lista_completa?: ICategorySeccionListaCompleta;
    duracion?: string;
    delete_at?: string | null; // Puede ser `null`
    created_at: string;
    courses: ICourse[]; // Relación con Course
  }
  