import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promotion } from '../../models/promotion';

@Component({
  selector: 'app-promotion-card',
  templateUrl: './promotion-card.component.html',
  styleUrls: ['./promotion-card.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionCardComponent {
  @Input() promotion!: Promotion;
  @Output() learnMoreClick = new EventEmitter<Promotion>();

  // Cache de URL de imagen para evitar recalcular
  private imageUrlCache: string | null = null;

  /**
   * Obtiene la URL de la imagen
   * Soporta tanto imágenes base64 como rutas de archivos
   * Usa caché para evitar recalcular la misma URL
   */
  getImageUrl(): string {
    if (this.imageUrlCache) {
      return this.imageUrlCache;
    }
    if (!this.promotion.image || !this.promotion.image.imageNumber) {
      return '';
    }
    
    const imageValue = this.promotion.image.imageNumber;
    
    // Si es una ruta de archivo (contiene 'images/' o 'assets/')
    if (imageValue.includes('images/') || imageValue.includes('assets/')) {
      // Si ya empieza con /assets, usarla directamente
      if (imageValue.startsWith('/assets/')) {
        this.imageUrlCache = imageValue;
        return imageValue;
      }
      // Si empieza con assets/, agregar la barra inicial
      if (imageValue.startsWith('assets/')) {
        this.imageUrlCache = `/${imageValue}`;
        return this.imageUrlCache;
      }
      // Si solo tiene images/, agregar /assets/
      this.imageUrlCache = `/assets/${imageValue}`;
      return this.imageUrlCache;
    }
    
    // Si es base64 (muy largo o empieza con caracteres base64), retornar como data URL
    if (imageValue.length > 100 || /^[A-Za-z0-9+/=]/.test(imageValue)) {
      // Verificar si ya es un data URL
      if (imageValue.startsWith('data:')) {
        this.imageUrlCache = imageValue;
        return imageValue;
      }
      this.imageUrlCache = `data:image/jpg;base64,${imageValue}`;
      return this.imageUrlCache;
    }
    
    this.imageUrlCache = '';
    return '';
  }

  /**
   * Maneja el click en el botón "Conocer más"
   */
  onLearnMore(): void {
    this.learnMoreClick.emit(this.promotion);
  }
}

