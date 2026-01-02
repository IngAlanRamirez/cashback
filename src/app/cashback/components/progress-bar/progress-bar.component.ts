import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityAmountCashBack } from '../../models/activity-amount-cashback';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  @Input() activityAmountCashBacks: ActivityAmountCashBack[] = [];

  /**
   * Calcula el total de cashback de todas las categorías
   */
  getTotalAmount(): number {
    return this.activityAmountCashBacks
      .map(a => a.cashBackAmount.amount)
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Calcula el porcentaje que representa cada categoría
   */
  getPercentByMCC(category: ActivityAmountCashBack): number {
    const total = this.getTotalAmount();
    if (total === 0 || category.cashBackAmount.amount === 0) {
      return 0;
    }
    return (category.cashBackAmount.amount * 100) / total;
  }

  /**
   * Obtiene la clase CSS según el código de categoría
   */
  getCategoryClass(categoryCode: string): string {
    const categoryMap: { [key: string]: string } = {
      'Res': 'progress-theme-restaurant',
      'Far': 'progress-theme-pharmacy',
      'Gas': 'progress-theme-gas-station',
      'Ent': 'progress-theme-entertainment',
      'Sup': 'progress-theme-supermarket',
      'Tel': 'progress-theme-telecom'
    };
    return categoryMap[categoryCode] || '';
  }
}

