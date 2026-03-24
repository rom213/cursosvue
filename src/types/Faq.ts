export interface FaqItem {
  pregunta: string;
  respuesta: string;
  /** Palabras extra para mejorar la búsqueda (sin mostrar al usuario) */
  palabras_clave?: string[];
}

export interface FaqCategoria {
  categoria: string;
  preguntas_frecuentes: FaqItem[];
  palabras_clave?: string[];
}

export interface FaqContenidoBlock {
  preguntas_frecuentes: FaqCategoria[];
}

export interface FaqFile {
  contenido: FaqContenidoBlock[];
}
