// src/services/RefundService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { IBalance } from "../types/Balance";
import type { IApiResponseBalance } from "../types/admin/ReferAdmin";

class BalanceService {

    static async getBalance(date_init: Date, date_end: Date): Promise<IBalance> {
        try {
            const formattedDateInit = date_init.toISOString().split("T")[0];
            const formattedDateEnd = date_end.toISOString().split("T")[0];
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
                total_value_all_refunds:0,
                list_ids_refers:[]
            }
            return errorBalance
        }
    }


    static async getBalanceByGoogleId(date_init: Date, date_end: Date, google_id:string): Promise<IApiResponseBalance> {
        try {
            const formattedDateInit = date_init.toISOString().split("T")[0];
            const formattedDateEnd = date_end.toISOString().split("T")[0];

            const params = new URLSearchParams({
                date_init: formattedDateInit,   
                date_end: formattedDateEnd,
            });

            const url = `/api/balance/user/${google_id}?${params.toString()}`;
            const response: AxiosResponse<IApiResponseBalance> = await ApiService.get<IApiResponseBalance>(url);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo los reintegros por usuario y fecha:", error);
            const errorBalance:IApiResponseBalance={
                message:"",
                pagination:null,
                records:[],
                status:"ERROR"
            }
            return errorBalance
        }
    }



    static async getAllBalance(date_init: Date, date_end: Date): Promise<IApiResponseBalance> {
        try {
            const formattedDateInit = date_init.toISOString().split("T")[0];
            const formattedDateEnd = date_end.toISOString().split("T")[0];
            const url = `/api/balance/all?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;
            const response: AxiosResponse<IApiResponseBalance> = await ApiService.get<IApiResponseBalance>(url);
            return response.data; 
        } catch (error) {
            console.error("Error obteniendo los reintegros por usuario y fecha:", error);
            const errorBalance:IApiResponseBalance={
                message:"",
                pagination:null,
                records:[],
                status:"ERROR"
            }
            return errorBalance
        }
    }
}

export default BalanceService;