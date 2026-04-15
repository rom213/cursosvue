import type { AxiosResponse } from 'axios'
import ApiService from './ApiService'

export interface GuestRegisterResponse {
  google_id: string
  email: string
}

export interface GuestCourse {
  id: number
  titulo: string
  imagen_url: string
  url: string
  cantidad_cursos: number
}

export interface GuestTransactionCoursesResponse {
  status: 'completed' | 'pending' | 'not_found'
  email: string | null
  categories?: GuestCourse[]
}

export interface GuestInitResponse {
  approval_url: string
}

class GuestCheckoutService {
  static async register(data: {
    email: string
    num_whatsapp: string
  }): Promise<GuestRegisterResponse | null> {
    try {
      const response: AxiosResponse<GuestRegisterResponse> =
        await ApiService.post<GuestRegisterResponse>('/guest-checkout/register', data)
      return response.data
    } catch (error) {
      console.error('GuestCheckoutService.register error:', error)
      return null
    }
  }

  static async getCoursesByTransaction(
    transactionId: string
  ): Promise<GuestTransactionCoursesResponse | null> {
    try {
      const response: AxiosResponse<GuestTransactionCoursesResponse> =
        await ApiService.get<GuestTransactionCoursesResponse>(
          '/guest/transaction-courses',
          { transaction_id: transactionId }
        )
      return response.data
    } catch (error) {
      console.error('GuestCheckoutService.getCoursesByTransaction error:', error)
      return null
    }
  }

  static async initGuestCheckout(data: {
    google_id: string
    categories: { id_category: number }[]
    gateway: 'wompi' | 'paypal'
    num_whatsapp: string
  }): Promise<GuestInitResponse | null> {
    try {
      const response: AxiosResponse<GuestInitResponse> =
        await ApiService.post<GuestInitResponse>('/guest-checkout/init', data)
      return response.data
    } catch (error) {
      console.error('GuestCheckoutService.initGuestCheckout error:', error)
      return null
    }
  }
}

export default GuestCheckoutService
