import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent
} from '@ionic/angular/standalone';
import { Promotion } from '../../models/promotion';

@Component({
  selector: 'app-promotion-detail-modal',
  templateUrl: './promotion-detail-modal.component.html',
  styleUrls: ['./promotion-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent
  ]
})
export class PromotionDetailModalComponent {
  private _isOpen = signal<boolean>(false);
  private _promotion = signal<Promotion | null>(null);

  @Input() 
  set isOpen(value: boolean) {
    this._isOpen.set(value);
  }
  
  get isOpen(): boolean {
    return this._isOpen();
  }

  @Input()
  set promotion(value: Promotion | null) {
    this._promotion.set(value);
  }

  get promotion(): Promotion | null {
    return this._promotion();
  }

  @Output() close = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();

  // Breakpoints para el modal - más grande para mostrar todo el contenido
  modalBreakpoint = computed(() => {
    const screenHeight = window.innerHeight;
    // Calcular breakpoint basado en el contenido necesario (logo + texto + botón)
    // Aproximadamente 70-80% de la pantalla para mostrar todo
    const contentHeight = 500; // Altura estimada del contenido
    return Math.min(0.85, Math.max(0.7, contentHeight / screenHeight));
  });

  maxBreakpoint = computed(() => {
    const screenHeight = window.innerHeight;
    return Math.min(0.95, Math.max(0.85, 700 / screenHeight));
  });

  /**
   * Obtiene la URL de la imagen
   */
  getImageUrl(): string {
    if (!this.promotion?.image?.imageNumber) {
      return '';
    }
    
    const imageValue = this.promotion.image.imageNumber;
    
    // Si es una ruta de archivo
    if (imageValue.includes('images/') || imageValue.includes('assets/')) {
      if (imageValue.startsWith('/assets/')) {
        return imageValue;
      }
      if (imageValue.startsWith('assets/')) {
        return `/${imageValue}`;
      }
      return `/assets/${imageValue}`;
    }
    
    // Si es base64
    if (imageValue.length > 100 || /^[A-Za-z0-9+/=]/.test(imageValue)) {
      if (imageValue.startsWith('data:')) {
        return imageValue;
      }
      return `data:image/jpg;base64,${imageValue}`;
    }
    
    return '';
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this._isOpen.set(false);
    this.close.emit();
  }

  /**
   * Cierra el modal sin redirigir (redirecciones deshabilitadas)
   */
  navigateToUrl(): void {
    // Solo cerrar el modal, sin redirigir a sitios externos
    this.closeModal();
  }
}

