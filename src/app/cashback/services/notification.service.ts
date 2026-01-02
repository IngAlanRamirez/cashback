import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

export enum NotificationType {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info'
}

export interface NotificationOptions {
  message: string;
  type?: NotificationType;
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
  showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastController = inject(ToastController);

  /**
   * Muestra una notificación al usuario
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    const {
      message,
      type = NotificationType.INFO,
      duration = 3000,
      position = 'top',
      showCloseButton = true
    } = options;

    const toast = await this.toastController.create({
      message,
      duration: showCloseButton ? undefined : duration,
      position,
      color: this.getColorForType(type),
      buttons: showCloseButton
        ? [
            {
              text: 'Cerrar',
              role: 'cancel'
            }
          ]
        : [],
      cssClass: `notification-${type}`
    });

    await toast.present();
  }

  /**
   * Muestra un mensaje de error
   */
  async showError(message: string, options?: Partial<NotificationOptions>): Promise<void> {
    await this.showNotification({
      message,
      type: NotificationType.ERROR,
      duration: 5000, // Errores se muestran más tiempo
      ...options
    });
  }

  /**
   * Muestra un mensaje de éxito
   */
  async showSuccess(message: string, options?: Partial<NotificationOptions>): Promise<void> {
    await this.showNotification({
      message,
      type: NotificationType.SUCCESS,
      duration: 3000,
      ...options
    });
  }

  /**
   * Muestra un mensaje de advertencia
   */
  async showWarning(message: string, options?: Partial<NotificationOptions>): Promise<void> {
    await this.showNotification({
      message,
      type: NotificationType.WARNING,
      duration: 4000,
      ...options
    });
  }

  /**
   * Muestra un mensaje informativo
   */
  async showInfo(message: string, options?: Partial<NotificationOptions>): Promise<void> {
    await this.showNotification({
      message,
      type: NotificationType.INFO,
      duration: 3000,
      ...options
    });
  }

  /**
   * Obtiene el color de Ionic según el tipo de notificación
   */
  private getColorForType(type: NotificationType): string {
    const colorMap: Record<NotificationType, string> = {
      [NotificationType.ERROR]: 'danger',
      [NotificationType.SUCCESS]: 'success',
      [NotificationType.WARNING]: 'warning',
      [NotificationType.INFO]: 'primary'
    };
    return colorMap[type] || 'primary';
  }

  /**
   * Muestra un mensaje de error genérico para errores de carga de datos
   */
  async showDataLoadError(): Promise<void> {
    await this.showError(
      'No se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.',
      { duration: 5000 }
    );
  }

  /**
   * Muestra un mensaje de error genérico para errores de transacciones
   */
  async showTransactionsLoadError(): Promise<void> {
    await this.showError(
      'No se pudieron cargar las transacciones. Por favor, intenta nuevamente.',
      { duration: 5000 }
    );
  }

  /**
   * Muestra un mensaje de error genérico para errores de cálculo
   */
  async showCalculationError(): Promise<void> {
    await this.showError(
      'Ocurrió un error al calcular el cashback. Por favor, intenta nuevamente.',
      { duration: 5000 }
    );
  }
}

