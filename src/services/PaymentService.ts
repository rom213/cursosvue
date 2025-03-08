// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { IPaymentResponse } from "../types/Payment";


class PaymentService {
    static async generate_signature_reference_code(data: { categories: any[] }): Promise<IPaymentResponse | null> {
    try {
      const response: AxiosResponse<IPaymentResponse> = await ApiService.post<IPaymentResponse>("/payu-firm", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

}

export default PaymentService;