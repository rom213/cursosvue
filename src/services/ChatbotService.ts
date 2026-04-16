import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";

interface ChatbotResponse {
  success: boolean;
  output?: string;
  error?: string;
  message?: string;
}

const GUEST_SESSION_KEY = "guest_session_id";

function generateGuestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getGuestSessionId(): string {
  if (typeof localStorage === "undefined") return generateGuestId();
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id = generateGuestId();
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
}

function buildGuestEmail(): string {
  return `guest_${getGuestSessionId()}@invitado.local`;
}

class ChatbotService {
  /**
   * Envía un mensaje al chatbot Clarita a través de FastAPI
   */
  static async sendMessage(
    message: string,
    userEmail: string,
    userName: string,
    isAuthenticated: boolean = true
  ): Promise<ChatbotResponse | null> {
    try {
      const payload = isAuthenticated
        ? {
            message,
            user_email: userEmail,
            user_name: userName,
            chat_id: userEmail,
            is_guest: false,
            profesion: "",
            intereses: ""
          }
        : {
            message,
            user_email: buildGuestEmail(),
            user_name: "Invitado",
            chat_id: getGuestSessionId(),
            is_guest: true,
            profesion: "",
            intereses: ""
          };

      const response: AxiosResponse<ChatbotResponse> = await ApiService.post<ChatbotResponse>(
        "/chatbot/message",
        payload
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
      const isGuest = !userEmail;
      const emailToReset = isGuest ? buildGuestEmail() : userEmail;
      const chatIdToReset = isGuest ? getGuestSessionId() : userEmail;
      const response: AxiosResponse<ChatbotResponse> = await ApiService.post<ChatbotResponse>(
        "/chatbot/reset",
        {
          user_email: emailToReset,
          chat_id: chatIdToReset
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

  /**
   * Limpia el seudo-email de invitado. Llamar tras login exitoso para que
   * las próximas conversaciones usen la identidad real del usuario.
   */
  static clearGuestSession(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
}

export default ChatbotService;
