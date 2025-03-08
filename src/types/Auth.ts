export interface AuthResponse {
  success: boolean;
  user?: {
    google_id: string;
    email: string;
    is_bought:boolean
    name: string;
    picture: string;
    rol: string;
    register: boolean;
    given_name: string;
  };
  error?: string;
}

export interface IUserAfiliaty{
  name: string
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}