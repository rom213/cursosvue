export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    picture: string;
    rol: string;
    register: boolean;
  };
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}