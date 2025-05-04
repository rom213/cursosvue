import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";



class AccountService {

      static async updated(data:any): Promise<boolean> {
        try {
            const response: AxiosResponse<any> = await ApiService.post<any>("/account/update", data);
            if (response.status==200) {
                return true
            }
            return false;
        } catch (error) {
            console.error("Error al guarda mensaje");
            return false;
        }
    }
}


export default AccountService;