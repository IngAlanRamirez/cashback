import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
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
  imports: [CommonModule, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush
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
   * Retorna el nombre formateado según el tipo y nombre del producto
   */
  formatProductName(name: string, product: Product): string {
    const productName = name.toLowerCase();
    const type = product.type?.toUpperCase() || '';
    
    // Mapeo de nombres según el tipo y nombre del producto
    if (type === 'CREDIT') {
      if (productName.includes('famous')) {
        return 'Rockstar Famous Credit';
      } else {
        return 'Rockstar Credit';
      }
    } else if (type === 'DEBIT') {
      return 'Rockstar Debit Plus';
    }
    
    // Si no coincide, retornar el nombre original truncado
    return name.length > 22 ? name.substring(0, 22) + '...' : name;
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

  // Cache de imágenes de tarjetas para evitar recalcular
  private cardImageCache = new Map<string, string>();

  /**
   * Obtiene la ruta de la imagen de la tarjeta basada en el tipo y nombre
   * Usa caché para evitar recalcular la misma imagen
   */
  getCardImage(product: Product | null): string {
    if (!product) {
      return '/assets/images/cards/card-1.png';
    }
    
    // Generar clave única para el caché
    const cacheKey = `${product.type}-${product.product?.name || ''}`;
    
    // Si existe en caché, retornarlo
    if (this.cardImageCache.has(cacheKey)) {
      return this.cardImageCache.get(cacheKey)!;
    }
    
    const productName = product.product?.name?.toLowerCase() || '';
    const type = product.type?.toUpperCase() || '';
    
    let imagePath: string;
    
    // Mapeo de tarjetas a imágenes
    // Las imágenes deben estar en src/assets/images/cards/
    if (type === 'CREDIT' && productName.includes('famous')) {
      imagePath = '/assets/images/cards/card-2.png'; // Rockstar Famous Credit - Tarjeta con gradiente teal-naranja
    } else if (type === 'CREDIT') {
      imagePath = '/assets/images/cards/card-1.png'; // Rockstar Credit - Tarjeta negra con efectos dorados
    } else if (type === 'DEBIT') {
      imagePath = '/assets/images/cards/card-3.png'; // Rockstar Debit Plus - Tarjeta con gradiente azul-magenta
    } else {
      // Imagen por defecto
      imagePath = '/assets/images/cards/card-1.png';
    }
    
    // Guardar en caché
    this.cardImageCache.set(cacheKey, imagePath);
    
    return imagePath;
  }
}

