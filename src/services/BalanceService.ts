// src/services/RefundService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { IBalance } from "../types/Balance";

class BalanceService {

    static async getBalance(date_init: Date, date_end: Date): Promise<IBalance> {
        try {
            // El backend espera fechas en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ o similar).
            // toISOString() genera un formato compatible con datetime.fromisoformat() de Python.
            const formattedDateInit = date_init.toISOString();
            const formattedDateEnd = date_end.toISOString();

            // Construimos la URL con los parámetros de búsqueda (query params)
            const url = `/api/balance?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;

            const response: AxiosResponse<IBalance> = await ApiService.get<IBalance>(url);

            return response.data;
        } catch (error) {
            console.error("Error obteniendo los reintegros por usuario y fecha:", error);
            const errorBalance:IBalance={
                count:0,
                courses_payments_value:0,
                non_refunded_value:0,
                refunded_value:0,
                total_value_all_refunds:0
            }
            return errorBalance
        }
    }
}

export default BalanceService;