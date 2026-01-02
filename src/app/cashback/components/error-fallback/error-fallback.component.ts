import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';
import { TranslationService } from '../../i18n/translation.service';

/**
 * Componente de fallback UI para mostrar cuando hay errores
 * 
 * Este componente proporciona una interfaz de usuario amigable cuando
 * ocurre un error en la aplicación, permitiendo al usuario:
 * - Ver un mensaje de error claro
 * - Reintentar la operación fallida
 * - Continuar usando la aplicación si es posible
 */
@Component({
  selector: 'app-error-fallback',
  standalone: true,
  imports: [CommonModule, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-fallback.component.html',
  styleUrls: ['./error-fallback.component.scss']
})
export class ErrorFallbackComponent {
  @Input() message: string = '';
  @Input() showRetry: boolean = true;
  @Input() retryLabel: string = '';
  @Input() icon: string = 'alert-circle-outline';
  @Output() retry = new EventEmitter<void>();
  
  translate = inject(TranslationService);
  
  constructor() {
    // Registrar iconos de ionicons
    addIcons({ alertCircleOutline, refreshOutline });
  }
  
  onRetry(): void {
    this.retry.emit();
  }
}

