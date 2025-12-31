import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { options, warning } from 'ionicons/icons';
import { Purchase } from '../../models/purchase';
import { TransactionItemComponent } from '../transaction-item/transaction-item.component';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, TransactionItemComponent]
})
export class TransactionsListComponent {
  @Input() purchases: Purchase[] = [];
  @Input() accountId: string | undefined;
  @Input() period: string = 'current'; // 'current', 'past', 'before'
  @Input() showFilter: boolean = true;
  @Input() startPage: number = 1;
  @Input() totalPages: number = 1;

  @Output() filterClick = new EventEmitter<void>();
  @Output() loadMore = new EventEmitter<void>();

  constructor() {
    // Registrar iconos de ionicons
    addIcons({ options, warning });
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

