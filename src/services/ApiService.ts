import axios, { type AxiosInstance, type AxiosResponse } from "axios";


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
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error("API Error:", error);
                return Promise.reject(error);
            }
        );
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

export default new ApiService('http://localhost:5001')

