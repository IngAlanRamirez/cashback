import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Servicio de logging que solo funciona en modo desarrollo
 * En producción, todos los logs se ignoran para mejorar el rendimiento
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly isProduction = environment.production;

  /**
   * Log general (equivalente a console.log)
   */
  log(...args: any[]): void {
    if (!this.isProduction) {
      console.log(...args);
    }
  }

  /**
   * Log de error (equivalente a console.error)
   */
  error(...args: any[]): void {
    if (!this.isProduction) {
      console.error(...args);
    }
  }

  /**
   * Log de advertencia (equivalente a console.warn)
   */
  warn(...args: any[]): void {
    if (!this.isProduction) {
      console.warn(...args);
    }
  }

  /**
   * Log informativo (equivalente a console.info)
   */
  info(...args: any[]): void {
    if (!this.isProduction) {
      console.info(...args);
    }
  }

  /**
   * Log de depuración (equivalente a console.debug)
   */
  debug(...args: any[]): void {
    if (!this.isProduction) {
      console.debug(...args);
    }
  }

  /**
   * Log de tabla (equivalente a console.table)
   */
  table(...args: any[]): void {
    if (!this.isProduction) {
      console.table(...args);
    }
  }

  /**
   * Log de grupo (equivalente a console.group)
   */
  group(...args: any[]): void {
    if (!this.isProduction) {
      console.group(...args);
    }
  }

  /**
   * Cierra un grupo de logs (equivalente a console.groupEnd)
   */
  groupEnd(): void {
    if (!this.isProduction) {
      console.groupEnd();
    }
  }

  /**
   * Verifica si el logging está habilitado
   */
  isEnabled(): boolean {
    return !this.isProduction;
  }
}

