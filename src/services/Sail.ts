// src/services/RefundService.ts

import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { ISail } from "../types/Sail";


class SailService {

    static async getSailByUserAndDate(date_init: Date, date_end: Date): Promise<ISail[] | []> {
        try {
            // El backend espera fechas en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ o similar).
            // toISOString() genera un formato compatible con datetime.fromisoformat() de Python.
            const formattedDateInit = date_init.toISOString();
            const formattedDateEnd = date_end.toISOString();
            // Construimos la URL con los parámetros de búsqueda (query params)
            const url = `/api/sails?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;

            const response: AxiosResponse<ISail[]> = await ApiService.get<ISail[]>(url);

            return response.data;
        } catch (error) {
            console.error("Error obteniendo los reintegros por usuario y fecha:", error);
            return []; // En caso de error, retorna un arreglo vacío como en el ejemplo
        }
    }
}

export default SailService;