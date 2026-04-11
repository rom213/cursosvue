import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";

interface ChatbotResponse {
  success: boolean;
  output?: string;
  error?: string;
  message?: string;
}

class ChatbotService {
  /**
   * Envía un mensaje al chatbot Clarita a través de FastAPI
   */
  static async sendMessage(
    message: string,
    userEmail: string,
    userName: string
  ): Promise<ChatbotResponse | null> {
    try {
      const response: AxiosResponse<ChatbotResponse> = await ApiService.post<ChatbotResponse>(
        "/chatbot/message",
        {
          message,
          user_email: userEmail,
          user_name: userName
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      return {
        success: false,
        message: "Lo siento, tuve un problema de conexión. ¿Podrías intentar enviar tu mensaje de nuevo?"
      };
    }
  }

  /**
   * Reinicia la conversación de Clarita
   */
  static async resetConversation(userEmail: string): Promise<ChatbotResponse | null> {
    try {
      const response: AxiosResponse<ChatbotResponse> = await ApiService.post<ChatbotResponse>(
        "/chatbot/reset",
        {
          user_email: userEmail
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error resetting conversation:", error);
      return {
        success: true,
        message: "Conversación reiniciada"
      };
    }
  }
}

export default ChatbotService;
