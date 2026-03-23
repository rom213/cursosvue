/**
 * Pruebas unitarias para PaymentService enfocadas en atributos ISO/IEC 25000:
 * - Adecuación Funcional
 * - Fiabilidad (Manejo de Errores)
 * 
 * Comando exacto de terminal para ejecutar estas pruebas:
 * npm run test:unit src/services/__tests__/PaymentService.spec.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentService from '../PaymentService';
import ApiService from '../ApiService';

// Mock del ApiService para aislar las llamadas HTTP en los test
vi.mock('../ApiService', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('PaymentService (Cumplimiento ISO/IEC 25000)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // ISO 25000: Adecuación Funcional (Exactitud) - Camino Feliz
  // =========================================================================
  describe('Adecuación Funcional', () => {
    it('generate_signature_reference_code_cupon solicita y retorna correctamente la firma PayU', async () => {
      /**
       * Atributo: Exactitud Funcional
       * Verifica el procesamiento correcto (Happy Path) al generar solicitud firmada HTTP a PayU.
       */
      const mockData = { categories: [{ id_category: 1 }], cupon: 'DESCUENTO50' };
      const mockResponse = { data: { status: 'success', records: [{ signature: 'firm', price: 50 }] } };
      
      // Simular que el endpoint retorna exitosamente
      (ApiService.post as any).mockResolvedValueOnce(mockResponse);

      const result = await PaymentService.generate_signature_reference_code_cupon(mockData);

      // Verificamos que llamó con la URL correcta y la data apropiada
      expect(ApiService.post).toHaveBeenCalledWith('/payu-firm-cupon', mockData);
      // Validamos exactitud de los datos devueltos
      expect(result).toEqual(mockResponse.data);
    });

    it('generate_link_pay_paypal solicita y retorna el portal de pago (approval_url)', async () => {
      /**
       * Atributo: Idoneidad Funcional
       * Valida uno de los comportamientos principales del sistema (PayPal link creation).
       */
      const mockData = { categories: [{ id_category: 1 }] };
      const mockResponse = { data: { approval_url: 'https://paypal.com/checkout/123' } };
      
      (ApiService.post as any).mockResolvedValueOnce(mockResponse);

      const result = await PaymentService.generate_link_pay_paypal(mockData);

      expect(ApiService.post).toHaveBeenCalledWith('/paypal-generate-link-pay', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  // =========================================================================
  // ISO 25000: Fiabilidad (Tolerancia a fallos, Madurez del manejo de excepciones)
  // =========================================================================
  describe('Fiabilidad', () => {
    it('Maneja un fallo en el servidor (ej. HTTP 500) devolviendo `null` sin romper la app', async () => {
      /**
       * Atributo: Tolerancia a fallos (Manejo de Errores)
       * Verifica que si el servidor interrumpe conexión, el servicio atrape `catch(error)` 
       * y no propague un volcado de red al contenedor de Vue, manteniendo un estado predecible.
       */
      const mockData = { categories: [{ id_category: 1 }] };
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Simular un fallo severo de red
      (ApiService.post as any).mockRejectedValueOnce(new Error('Network Error FATAL'));

      const result = await PaymentService.generate_signature_reference_code(mockData);

      // El resultado no provoca "Unhandled Promise Rejection" sino que reporta predeciblemente nulo
      expect(result).toBeNull();
      // Validamos que se asiente debidamente en los logs locales de depuración
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al verificar token:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it('Maneja excepciones en solicitudes PayPal con cupon de forma resiliente', async () => {
      /**
       * Atributo: Madurez (Manejo controlado ante valores inesperados)
       */
      const mockData = { categories: [{}], cupon: 'INVALIDO_O_CADUCADO' };
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (ApiService.post as any).mockRejectedValueOnce(new Error('Cupón inválido HTTP 400'));

      const result = await PaymentService.generate_link_pay_paypal_cupon(mockData);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});
