import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashBackAmounts } from '../../models/cashback-amounts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-accumulated-cashback',
  templateUrl: './accumulated-cashback.component.html',
  styleUrls: ['./accumulated-cashback.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccumulatedCashbackComponent {
  @Input() cashbackAmounts: CashBackAmounts | null = null;

  /**
   * Verifica si los datos de cashback son válidos
   */
  isValid(): boolean {
    return this.cashbackAmounts !== null && 
           this.cashbackAmounts !== undefined &&
           this.cashbackAmounts.monthAmount !== undefined &&
           this.cashbackAmounts.annualAmount !== undefined;
  }

  /**
   * Obtiene el nombre del mes formateado en español (minúscula)
   */
  getMonth(): string {
    let monthName: string;
    
    if (!this.cashbackAmounts?.cashbackPeriod) {
      monthName = format(new Date(), 'MMMM', { locale: es });
    } else {
      const month = parseInt(this.cashbackAmounts.cashbackPeriod.month) - 1;
      const date = new Date();
      date.setMonth(month);
      monthName = format(date, 'MMMM', { locale: es });
    }
    
    // Asegurar que la primera letra esté en minúscula
    return monthName.charAt(0).toLowerCase() + monthName.slice(1);
  }

  /**
   * Obtiene el año del período
   */
  getYear(): string {
    return this.cashbackAmounts?.cashbackPeriod?.year || new Date().getFullYear().toString();
  }

  /**
   * Formatea el monto mensual
   */
  formatMonthlyAmount(): string {
    if (!this.cashbackAmounts?.monthAmount) {
      return '$0.00';
    }
    
    const amount = this.cashbackAmounts.monthAmount.amount;
    const currency = this.cashbackAmounts.monthAmount.currency || 'MXN';
    
    if (amount === 0) {
      return `$0.00 ${currency}`;
    }
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Formatea el monto anual
   */
  formatAnnualAmount(): string {
    if (!this.cashbackAmounts?.annualAmount) {
      return '$0.00';
    }
    
    const amount = this.cashbackAmounts.annualAmount.amount;
    const currency = this.cashbackAmounts.annualAmount.currency || 'MXN';
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

