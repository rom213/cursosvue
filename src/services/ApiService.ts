import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { AUTH_ACCESS_TOKEN_KEY } from "../constants/storageKeys";


class ApiService {
    private api: AxiosInstance;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });
        this.api.interceptors.request.use((config) => {
            if (typeof localStorage !== "undefined") {
                const token = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        });
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error("API Error:", error);
                if (error?.response?.status === 401 && typeof localStorage !== "undefined") {
                    localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
                }
                return Promise.reject(error);
            }
        );
    }

    public postForm<T>(endpoint: string, data: FormData): Promise<AxiosResponse<T>> {
        return this.api.post<T>(endpoint, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    public get<T>(endpoint: string, params?: object): Promise<AxiosResponse<T>> {
        return this.api.get<T>(endpoint, { params });
    }

    public post<T>(endpoint: string, data?: object): Promise<AxiosResponse<T>> {
        return this.api.post<T>(endpoint, data);
    }

    public put<T>(endpoint: string, data?: object): Promise<AxiosResponse<T>> {
        return this.api.put<T>(endpoint, data);
    }

    public delete<T>(endpoint: string): Promise<AxiosResponse<T>> {
        return this.api.delete<T>(endpoint);
    }
}

export default new ApiService('http://192.168.1.24:5002')

