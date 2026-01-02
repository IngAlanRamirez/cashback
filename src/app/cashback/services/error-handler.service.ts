import { Injectable, inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap, take, delay } from 'rxjs/operators';
import { LoggerService } from './logger.service';

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean; // Si es true, aumenta el delay en cada intento
  retryable?: (error: any) => boolean; // Función para determinar si el error es recuperable
}

/**
 * Servicio para manejar errores y lógica de reintentos
 * 
 * Proporciona utilidades para:
 * - Reintentar operaciones fallidas automáticamente
 * - Determinar si un error es recuperable
 * - Aplicar backoff exponencial para reintentos
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private logger = inject(LoggerService);
  
  // Configuración por defecto
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_DELAY_MS = 1000;
  
  /**
   * Aplica lógica de reintentos a un Observable
   * 
   * Este método envuelve un Observable con lógica de reintentos inteligente.
   * Solo reintenta errores que son considerados "recuperables" (errores de red,
   * timeouts, errores 5xx, etc.).
   * 
   * **Opciones de reintento**:
   * - `maxRetries`: Número máximo de reintentos (por defecto: 3)
   * - `delayMs`: Delay inicial entre reintentos en milisegundos (por defecto: 1000ms)
   * - `backoff`: Si es true, aumenta el delay exponencialmente en cada intento
   * - `retryable`: Función personalizada para determinar si un error es recuperable
   * 
   * **Errores recuperables por defecto**:
   * - Errores de red (NetworkError, TimeoutError)
   * - Errores HTTP 5xx (errores del servidor)
   * - Errores HTTP 429 (Too Many Requests)
   * - Errores HTTP 408 (Request Timeout)
   * 
   * **Errores NO recuperables** (no se reintentan):
   * - Errores HTTP 4xx (excepto 408, 429)
   * - Errores de validación
   * - Errores de autenticación (401, 403)
   * 
   * @param source - Observable que se quiere reintentar
   * @param options - Opciones de configuración de reintentos
   * @returns Observable con lógica de reintentos aplicada
   * 
   * @example
   * // Reintentar hasta 3 veces con delay de 1 segundo
   * this.http.get('/api/data')
   *   .pipe(this.errorHandler.retryWithBackoff())
   *   .subscribe(...);
   * 
   * // Reintentar hasta 5 veces con backoff exponencial
   * this.http.get('/api/data')
   *   .pipe(this.errorHandler.retryWithBackoff({ maxRetries: 5, backoff: true }))
   *   .subscribe(...);
   */
  retryWithBackoff<T>(options: RetryOptions = {}): (source: Observable<T>) => Observable<T> {
    const {
      maxRetries = this.DEFAULT_MAX_RETRIES,
      delayMs = this.DEFAULT_DELAY_MS,
      backoff = false,
      retryable = this.isRetryableError.bind(this)
    } = options;
    
    return (source: Observable<T>) => {
      return source.pipe(
        retryWhen((errors: Observable<any>) => {
          return errors.pipe(
            mergeMap((error, attempt) => {
              const attemptNumber = attempt + 1;
              
              // Si no es un error recuperable, no reintentar
              if (!retryable(error)) {
                this.logger.warn(`Error no recuperable, no se reintentará:`, error);
                return throwError(() => error);
              }
              
              // Si se alcanzó el máximo de reintentos, lanzar error
              if (attemptNumber > maxRetries) {
                this.logger.error(`Máximo de reintentos alcanzado (${maxRetries}):`, error);
                return throwError(() => error);
              }
              
              // Calcular delay para este intento
              const currentDelay = backoff 
                ? delayMs * Math.pow(2, attemptNumber - 1) // Backoff exponencial
                : delayMs; // Delay fijo
              
              this.logger.warn(
                `Reintentando operación (intento ${attemptNumber}/${maxRetries}) después de ${currentDelay}ms`,
                error
              );
              
              // Esperar antes de reintentar
              return timer(currentDelay);
            }),
            take(maxRetries + 1) // +1 porque el primer error no cuenta como reintento
          );
        })
      );
    };
  }
  
  /**
   * Determina si un error es recuperable y debe reintentarse
   * 
   * @param error - Error a evaluar
   * @returns true si el error es recuperable, false en caso contrario
   */
  private isRetryableError(error: any): boolean {
    // Si no hay información del error, no reintentar
    if (!error) {
      return false;
    }
    
    // Errores de red (NetworkError, TimeoutError)
    if (error.name === 'NetworkError' || 
        error.name === 'TimeoutError' ||
        error.message?.includes('network') ||
        error.message?.includes('timeout')) {
      return true;
    }
    
    // Errores HTTP
    if (error.status) {
      const status = error.status;
      
      // Errores del servidor (5xx) - recuperables
      if (status >= 500 && status < 600) {
        return true;
      }
      
      // Too Many Requests (429) - recuperable
      if (status === 429) {
        return true;
      }
      
      // Request Timeout (408) - recuperable
      if (status === 408) {
        return true;
      }
      
      // Errores del cliente (4xx) - generalmente no recuperables
      // excepto los casos especiales arriba
      if (status >= 400 && status < 500) {
        return false;
      }
    }
    
    // Por defecto, no reintentar si no se puede determinar
    return false;
  }
  
  /**
   * Maneja un error y determina si debe mostrarse al usuario
   * 
   * @param error - Error a manejar
   * @param context - Contexto donde ocurrió el error (opcional)
   * @returns true si el error debe mostrarse al usuario, false en caso contrario
   */
  shouldShowErrorToUser(error: any, context?: string): boolean {
    // Errores de validación no se muestran (ya se manejan en el formulario)
    if (error?.status === 400 && error?.error?.type === 'validation') {
      return false;
    }
    
    // Errores de autenticación se muestran
    if (error?.status === 401 || error?.status === 403) {
      return true;
    }
    
    // Errores del servidor se muestran
    if (error?.status >= 500) {
      return true;
    }
    
    // Errores de red se muestran
    if (this.isRetryableError(error)) {
      return true;
    }
    
    // Por defecto, mostrar el error
    return true;
  }
  
  /**
   * Obtiene un mensaje de error amigable para el usuario
   * 
   * @param error - Error del cual obtener el mensaje
   * @returns Mensaje de error amigable
   */
  getErrorMessage(error: any): string {
    if (!error) {
      return 'Ha ocurrido un error desconocido';
    }
    
    // Mensajes personalizados según el tipo de error
    if (error.status === 0 || error.name === 'NetworkError') {
      return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    }
    
    if (error.status === 408 || error.name === 'TimeoutError') {
      return 'La solicitud tardó demasiado. Por favor, intenta nuevamente.';
    }
    
    if (error.status === 429) {
      return 'Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.';
    }
    
    if (error.status >= 500) {
      return 'Error del servidor. Por favor, intenta nuevamente más tarde.';
    }
    
    if (error.status === 401) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    
    if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }
    
    if (error.status === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }
    
    // Mensaje genérico
    return error.message || 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  }
}

