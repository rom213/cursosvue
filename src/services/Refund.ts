// src/services/RefundService.ts

import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { IRefund } from "../types/Refund";

class RefundService {

    static async getRefundsByUserAndDate(date_init: Date, date_end: Date): Promise<IRefund[] | []> {
        try {
            // El backend espera fechas en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ o similar).
            // toISOString() genera un formato compatible con datetime.fromisoformat() de Python.
            const formattedDateInit = date_init.toISOString().split("T")[0];
            const formattedDateEnd = date_end.toISOString().split("T")[0];

            // Construimos la URL con los parámetros de búsqueda (query params)
            const url = `/api/refunds?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;

            const response: AxiosResponse<IRefund[]> = await ApiService.get<IRefund[]>(url);

            return response.data;
        } catch (error) {
            console.error("Error obteniendo los reintegros por usuario y fecha:", error);
            return []; // En caso de error, retorna un arreglo vacío como en el ejemplo
        }
    }
}

export default RefundService;