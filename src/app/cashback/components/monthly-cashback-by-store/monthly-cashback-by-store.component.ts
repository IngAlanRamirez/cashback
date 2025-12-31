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
import { ActivityAmountCashBack } from '../../models/activity-amount-cashback';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-monthly-cashback-by-store',
  templateUrl: './monthly-cashback-by-store.component.html',
  styleUrls: ['./monthly-cashback-by-store.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, ProgressBarComponent]
})
export class MonthlyCashbackByStoreComponent {
  @Input() activityAmountCashBacks: ActivityAmountCashBack[] = [];

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
   * Obtiene el porcentaje formateado para una categoría
   */
  getPercent(categoryCode: string): string {
    const category = this.activityAmountCashBacks.find(
      cat => cat.categoryCode === categoryCode
    );
    return category?.cashBackPercentage 
      ? `+${category.cashBackPercentage}%` 
      : '';
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
   * Obtiene la clase CSS según el código de categoría
   */
  getCategoryClass(categoryCode: string): string {
    const categoryMap: { [key: string]: string } = {
      'Res': 'category-theme-restaurants',
      'Far': 'category-theme-pharmacy',
      'Gas': 'category-theme-gas-station',
      'Ent': 'category-theme-entertainment',
      'Sup': 'category-theme-supermarket',
      'Tel': 'category-theme-telecom'
    };
    return categoryMap[categoryCode] || '';
  }

  /**
   * Formatea el monto de cashback
   */
  formatAmount(amount: number, currency: string = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

