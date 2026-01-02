import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { options, warning } from 'ionicons/icons';
import { Purchase } from '../../models/purchase';
import { TransactionItemComponent } from '../transaction-item/transaction-item.component';
import { TranslationService } from '../../i18n/translation.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner, TransactionItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsListComponent {
  readonly translate = inject(TranslationService);
  private logger = inject(LoggerService);
  
  @Input() purchases: Purchase[] = [];
  @Input() accountId: string | undefined;
  @Input() period: string = 'current'; // 'current', 'past', 'before'
  @Input() showFilter: boolean = true;
  @Input() startPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() isLoading: boolean = false;

  @Output() filterClick = new EventEmitter<void>();
  @Output() loadMore = new EventEmitter<void>();

  /**
   * Verifica si las compras son válidas
   */
  isValidPurchases(): boolean {
    return Array.isArray(this.purchases);
  }

  /**
   * Verifica si el periodo es válido
   */
  isValidPeriod(): boolean {
    return typeof this.period === 'string' && 
           ['current', 'previous', 'previous-2'].includes(this.period);
  }

  constructor() {
    // Registrar iconos de ionicons
    addIcons({ options, warning });
  }

  /**
   * TrackBy function para optimizar el renderizado de la lista de transacciones
   */
  trackByPurchaseId(index: number, purchase: Purchase): string {
    return purchase.cardTransactionId;
  }

  /**
   * Verifica si el periodo es el actual
   */
  isCurrentPeriod(): boolean {
    return this.period === 'current';
  }

  /**
   * Verifica si hay más páginas para cargar
   */
  hasMorePages(): boolean {
    return this.startPage < this.totalPages;
  }

  /**
   * Maneja el click en el botón de filtro
   */
  onFilterClick(): void {
    this.filterClick.emit();
  }

  /**
   * Maneja el click en "Ver más"
   */
  onLoadMore(): void {
    if (this.hasMorePages()) {
      this.loadMore.emit();
    }
  }
}

