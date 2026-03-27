// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import { AUTH_ACCESS_TOKEN_KEY } from "../constants/storageKeys";
import ApiService from "./ApiService";
import type { AuthResponse, IApiResponseVerifyEmail, IUserAfiliaty, LogoutResponse } from "../types/Auth";

class AuthService {
  static async verifyToken(token: string): Promise<AuthResponse | null> {
    try {
      const response: AxiosResponse<AuthResponse> = await ApiService.post<AuthResponse>("/verify-token", { token });
      const data = response.data;
      if (data?.token) {
        localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, data.token);
      }
      return data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async logout(): Promise<LogoutResponse | null> {
    try {
      const response: AxiosResponse<LogoutResponse> = await ApiService.post<LogoutResponse>("/logout");
      localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
      return response.data;
    } catch (error) {
      localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
      return null;
    }
  }

  static async getProfile(): Promise<AuthResponse | null> {
    try {
      const response: AxiosResponse<AuthResponse> = await ApiService.post<AuthResponse>("/profile");
      return response.data;
    } catch (error) {
      return null;
    }
  }


  static async get_affiliaty(googleid: string | string[]): Promise<IUserAfiliaty | null> {
    try {
      const response: AxiosResponse<IUserAfiliaty> = await ApiService.get<IUserAfiliaty>(`/user/${googleid}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  static async verificarEmail(email: string): Promise<IApiResponseVerifyEmail> {
          try {
              const response: AxiosResponse<IApiResponseVerifyEmail> = await ApiService.post<IApiResponseVerifyEmail>("/validate-email", {
                  email: email,
              });
              if (response.status==200) {
                  return response.data
              }
              return response.data;
          } catch (error) {
              console.error("Error al verificar email");
              return {
                message: "Error al verificar email",
                records: [],
                status: "error",
              }; 
          }
      }
}

export default AuthService;
