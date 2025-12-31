import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cart, 
  restaurant, 
  medical, 
  car, 
  ticket, 
  call,
  storefront
} from 'ionicons/icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class TransactionItemComponent {
  @Input() description: string = '';
  @Input() date: string = '';
  @Input() cashback_amount: number = 0;
  @Input() amount: number = 0;
  @Input() category: string = '';

  constructor() {
    // Registrar iconos de ionicons
    addIcons({ 
      cart, 
      restaurant, 
      medical, 
      car, 
      ticket, 
      call,
      storefront
    });
  }

  /**
   * Formatea la fecha en formato "dd/MMMM/yyyy" en español
   */
  getDateValid(): string {
    if (!this.date) {
      return '';
    }
    try {
      return format(parseISO(this.date), 'dd/MMMM/yyyy', { locale: es });
    } catch (error) {
      // Si falla el parseo, intentar con formato Date directo
      return format(new Date(this.date), 'dd/MMMM/yyyy', { locale: es });
    }
  }

  /**
   * Obtiene el nombre del icono según el código de categoría
   */
  getIconName(categoryCode: string): string {
    const iconMap: { [key: string]: string } = {
      'Res': 'restaurant',
      'Far': 'medical',
      'Gas': 'car',
      'Ent': 'ticket',
      'Sup': 'cart',
      'Tel': 'call'
    };
    return iconMap[categoryCode] || 'storefront';
  }

  /**
   * Formatea el monto de cashback
   */
  formatCashbackAmount(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.cashback_amount);
  }

  /**
   * Formatea el monto de la compra
   */
  formatPurchaseAmount(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.amount);
  }
}

