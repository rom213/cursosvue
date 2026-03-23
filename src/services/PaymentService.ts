// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { ICuponResponsePayu, IPaymentResponsePayPal, IPaymentResponsePayu } from "../types/Payment";


class PaymentService {
    static async generate_signature_reference_code(data: { categories: any[] }): Promise<IPaymentResponsePayu | null> {
    try {
      const response: AxiosResponse<IPaymentResponsePayu> = await ApiService.post<IPaymentResponsePayu>("/payu-firm", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }
  static async generate_link_pay_paypal(data: { categories: any[] }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/paypal-generate-link-pay", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }
    static async generate_link_pay_paypal_external(data: { categories: any[], google_id_external:string }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/paypal-generate-link-pay-external", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

    static async generate_signature_reference_code_cupon(data: { categories: any[], cupon: string }): Promise<ICuponResponsePayu | null> {
      try {
        const response: AxiosResponse<ICuponResponsePayu> = await ApiService.post<ICuponResponsePayu>("/payu-firm-cupon", data);
        return response.data;
      } catch (error) {
        console.error("Error al verificar token:", error);
        return null;
      }
    }
  
    static async generate_link_pay_paypal_cupon(data: { categories: any[], cupon: string }): Promise<IPaymentResponsePayPal | null> {
      try {
        console.log(data);
        const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/paypal-generate-link-pay-cupon", data);
        return response.data;
      } catch (error) {
        console.error("Error al verificar token:", error);
        return null;
      }
    }

}

export default PaymentService;