// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { AuthResponse, LogoutResponse } from "../types/Auth";



class AuthService {
  static verifyToken(token: string): Promise<AxiosResponse<AuthResponse>> {
    return ApiService.post<AuthResponse>("/verify-token", { token });
  }

  static logout(): Promise<AxiosResponse<LogoutResponse>> {
    return ApiService.post<LogoutResponse>("/logout");
  }

  static getProfile(): Promise<AxiosResponse<AuthResponse>> {
    return ApiService.post<AuthResponse>("/profile");
  }
  
}

export default AuthService;
