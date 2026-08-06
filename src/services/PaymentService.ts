import { isAxiosError, type AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { ICuponResponsePayu, IPaymentResponsePayPal, IPaymentResponsePayu } from "../types/Payment";
import type { ConfirmedPurchaseResponse } from "../analytics/purchase";


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

  static async generate_link_pay_paypal(data: { categories: any[]; num_whatsapp?: string }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/paypal-generate-link-pay", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async generate_link_pay_paypal_external(data: { categories: any[]; google_id_external: string; num_whatsapp?: string }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/paypal-generate-link-pay-external", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async generate_signature_reference_code_cupon(data: { categories: any[]; cupon: string }): Promise<ICuponResponsePayu | null> {
    try {
      const response: AxiosResponse<ICuponResponsePayu> = await ApiService.post<ICuponResponsePayu>("/payu-firm-cupon", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async generate_link_pay_paypal_cupon(data: { categories: any[]; cupon: string; num_whatsapp?: string }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/paypal-generate-link-pay-cupon", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async generate_link_pay_wompi_external(data: { categories: any[]; google_id_external: string; num_whatsapp?: string }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/wompi-generate-link-pay-external", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async generate_link_pay_wompy(data: { categories: any[]; num_whatsapp?: string }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/wompi-generate-link-pay", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async generate_link_pay_wompy_cupon(data: { categories: any[]; cupon: string; num_whatsapp?: string }): Promise<IPaymentResponsePayPal | null> {
    try {
      const response: AxiosResponse<any> = await ApiService.post<IPaymentResponsePayPal>("/wompi-generate-link-pay-cupon", data);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return null;
    }
  }

  static async verifyWompiTransaction(transactionId: string): Promise<{
    status: string;
    wompi_status?: string;
    transaction_id?: string;
    reference?: string;
    categories?: { id: number }[];
  } | null> {
    try {
      const response = await ApiService.post<{
        status: string;
        wompi_status?: string;
        transaction_id?: string;
        reference?: string;
        categories?: { id: number }[];
      }>("/wompi/verify-transaction", { transaction_id: transactionId });
      return response.data;
    } catch (error) {
      console.error("Error verificando transaccion Wompi:", error);
      return null;
    }
  }

  static async getWompiPurchaseAnalytics(
    transactionId: string,
  ): Promise<ConfirmedPurchaseResponse | null> {
    try {
      const response = await ApiService.get<ConfirmedPurchaseResponse>(
        `/wompi/purchases/${encodeURIComponent(transactionId)}/analytics`,
      )
      return response.data
    } catch (error) {
      if (isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
        return this.getPublicWompiPurchaseAnalytics(transactionId)
      }
      console.error("Error obteniendo la compra confirmada de Wompi:", error)
      return null
    }
  }

  private static async getPublicWompiPurchaseAnalytics(
    transactionId: string,
  ): Promise<ConfirmedPurchaseResponse | null> {
    try {
      const response = await ApiService.get<ConfirmedPurchaseResponse>(
        `/wompi/purchases/${encodeURIComponent(transactionId)}/analytics-public`,
      )
      return response.data
    } catch (error) {
      console.error("Error obteniendo la compra pública confirmada de Wompi:", error)
      return null
    }
  }
}

export default PaymentService;
