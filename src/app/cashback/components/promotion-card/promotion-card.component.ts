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
   * Obtiene la URL de la imagen en base64
   */
  getImageUrl(): string {
    if (this.promotion.image && this.promotion.image.imageNumber) {
      return `data:image/jpg;base64,${this.promotion.image.imageNumber}`;
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

