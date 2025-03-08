interface User {
    created_at: string;
    delete_at: string | null;
    email: string;
    google_id: string;
    id: number;
    name: string;
    picture: string;
    rol: "user" | "admin" | "moderator"; // Puedes agregar más roles si existen
  }
  
  export interface IMessage {
    category_id: number;
    created_at: string;
    google_id: string;
    id: number;
    message: string;
    stars: number;
    user: User;
  }
  
  export interface IResponseDataMessage {
    is_comment: boolean;
    is_login: boolean;
    messages: IMessage[] | [];
  }
  