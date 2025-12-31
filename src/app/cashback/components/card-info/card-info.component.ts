import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, card } from 'ionicons/icons';
import { Product } from '../../models/product';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class CardInfoComponent {
  @Input() product: Product | null = null;
  @Input() products: Product[] = [];
  
  @Output() cardClick = new EventEmitter<void>();

  constructor() {
    // Registrar iconos de ionicons
    addIcons({ chevronForward, card });
  }

  /**
   * Formatea el nombre del producto
   * Si es tipo CREDIT, retorna "LikeU", sino retorna el nombre truncado
   */
  formatProductName(name: string, product: Product): string {
    if (product.type?.toUpperCase() === 'CREDIT') {
      return 'LikeU';
    } else {
      return name.length > 22 ? name.substring(0, 22) + '...' : name;
    }
  }

  /**
   * Obtiene el tipo de tarjeta (TDC o TDD)
   */
  getCardType(product: Product): string {
    return product.type?.toUpperCase() === 'CREDIT' ? 'TDC' : 'TDD';
  }

  /**
   * Obtiene los últimos 4 dígitos de la tarjeta
   */
  getLastFourDigits(product: Product): string {
    return product.cardIdentification?.displayNumber?.slice(-4) || '****';
  }

  /**
   * Maneja el click en la tarjeta
   */
  onCardClick(): void {
    if (this.products.length > 1) {
      this.cardClick.emit();
    }
  }

  /**
   * Verifica si hay múltiples productos
   */
  hasMultipleProducts(): boolean {
    return this.products.length > 1;
  }
}

