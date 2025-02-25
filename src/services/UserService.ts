// src/services/UserService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { User } from "../types/user";



class UserService {
  static getUsers(): Promise<AxiosResponse<User[]>> {
    return ApiService.get<User[]>("/users");
  }

  static getUserById(id: number): Promise<AxiosResponse<User>> {
    return ApiService.get<User>(`/users/${id}`);
  }

  static createUser(userData: User): Promise<AxiosResponse<User>> {
    return ApiService.post<User>("/users", userData);
  }

  static updateUser(id: number, userData: Partial<User>): Promise<AxiosResponse<User>> {
    return ApiService.put<User>(`/users/${id}`, userData);
  }

  static deleteUser(id: number): Promise<AxiosResponse<void>> {
    return ApiService.delete<void>(`/users/${id}`);
  }
}

export default UserService;
