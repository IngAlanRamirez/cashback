import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promotion } from '../../models/promotion';

@Component({
  selector: 'app-promotion-card',
  templateUrl: './promotion-card.component.html',
  styleUrls: ['./promotion-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PromotionCardComponent {
  @Input() promotion!: Promotion;

  /**
   * Obtiene la URL de la imagen
   * Soporta tanto imágenes base64 como rutas de archivos
   */
  getImageUrl(): string {
    if (!this.promotion.image || !this.promotion.image.imageNumber) {
      return '';
    }
    
    const imageValue = this.promotion.image.imageNumber;
    
    // Si es una ruta de archivo (contiene 'images/' o 'assets/')
    if (imageValue.includes('images/') || imageValue.includes('assets/')) {
      // Si ya empieza con /assets, usarla directamente
      if (imageValue.startsWith('/assets/')) {
        return imageValue;
      }
      // Si empieza con assets/, agregar la barra inicial
      if (imageValue.startsWith('assets/')) {
        return `/${imageValue}`;
      }
      // Si solo tiene images/, agregar /assets/
      return `/assets/${imageValue}`;
    }
    
    // Si es base64 (muy largo o empieza con caracteres base64), retornar como data URL
    if (imageValue.length > 100 || /^[A-Za-z0-9+/=]/.test(imageValue)) {
      // Verificar si ya es un data URL
      if (imageValue.startsWith('data:')) {
        return imageValue;
      }
      return `data:image/jpg;base64,${imageValue}`;
    }
    
    return '';
  }

  /**
   * Maneja el click en el botón "Conocer más"
   */
  onLearnMore(): void {
    if (this.promotion.merchant && this.promotion.merchant.url) {
      // Abrir URL en navegador externo
      window.open(this.promotion.merchant.url, '_blank');
    }
  }
}

