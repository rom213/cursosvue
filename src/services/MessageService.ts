import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type { IMessage, IResponseDataMessage } from "../types/Message";

class MessageService {
    static async getAllMessageByCategory(id:number): Promise<IResponseDataMessage> {
          const response: AxiosResponse<IResponseDataMessage> = await ApiService.get<IResponseDataMessage>(`/all-messages/${id}`);
          return response.data;
      }

      static async addMessage(categoryId: number, message: string, stars: number): Promise<boolean> {
        try {
            const response: AxiosResponse<IMessage> = await ApiService.post<IMessage>("/add-message-category", {
                category_id: categoryId,
                message: message,
                stars: stars
            });
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


export default MessageService;