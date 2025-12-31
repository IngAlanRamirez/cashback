import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/angular/standalone';
import { InfoBannerComponent } from './components/info-banner/info-banner.component';
import { CardInfoComponent } from './components/card-info/card-info.component';
import { AccumulatedCashbackComponent } from './components/accumulated-cashback/accumulated-cashback.component';
import { MonthlyCashbackByStoreComponent } from './components/monthly-cashback-by-store/monthly-cashback-by-store.component';
import { TransactionsListComponent } from './components/transactions-list/transactions-list.component';
import { Product } from './models/product';
import { CashBackAmounts } from './models/cashback-amounts';
import { ActivityAmountCashBack } from './models/activity-amount-cashback';
import { Purchase } from './models/purchase';

@Component({
  selector: 'app-cashback',
  templateUrl: './cashback.page.html',
  styleUrls: ['./cashback.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule, 
    FormsModule,
    InfoBannerComponent,
    CardInfoComponent,
    AccumulatedCashbackComponent,
    MonthlyCashbackByStoreComponent,
    TransactionsListComponent
  ]
})
export class CashbackPage {
  // Signal para controlar el tab activo
  selectedTab = signal<'resumen' | 'promo'>('resumen');
  
  // Signal para controlar la visibilidad del banner
  isBannerOpen = signal<boolean>(true);
  
  // Datos mock para desarrollo
  mockProduct: Product = {
    type: 'CREDIT',
    cardIdentification: {
      displayNumber: '1234567890122930'
    },
    image: {
      imageNumber: '74141001253'
    },
    product: {
      name: 'LikeU'
    }
  };
  
  mockProducts: Product[] = [this.mockProduct];
  
  mockCashbackAmounts: CashBackAmounts = {
    monthAmount: {
      amount: 346.80,
      currency: 'MXN'
    },
    annualAmount: {
      amount: 1250.50,
      currency: 'MXN'
    },
    cashbackPeriod: {
      month: '4', // Abril
      year: '2025'
    }
  };

  mockActivityAmountCashBacks: ActivityAmountCashBack[] = [
    {
      name: 'Supermercados',
      categoryCode: 'Sup',
      categoryDescription: 'Supermercados',
      cashBackAmount: {
        amount: 77.00,
        currency: 'MXN'
      },
      cashBackPercentage: 1
    },
    {
      name: 'Restaurantes',
      categoryCode: 'Res',
      categoryDescription: 'Restaurantes',
      cashBackAmount: {
        amount: 30.50,
        currency: 'MXN'
      },
      cashBackPercentage: 5
    },
    {
      name: 'Farmacias',
      categoryCode: 'Far',
      categoryDescription: 'Farmacias',
      cashBackAmount: {
        amount: 27.00,
        currency: 'MXN'
      },
      cashBackPercentage: 6
    },
    {
      name: 'Telecomunicaciones',
      categoryCode: 'Tel',
      categoryDescription: 'Telecomunicaciones',
      cashBackAmount: {
        amount: 15.00,
        currency: 'MXN'
      },
      cashBackPercentage: 4
    }
  ];

  mockPurchases: Purchase[] = [
    {
      cardTransactionId: '1',
      acquirerReferenceNumber: 'ARN001',
      orderDate: '2025-04-25T10:30:00Z',
      amount: {
        amount: 180.00,
        currency: 'MXN'
      },
      clearing: {
        cashBackPercentage: 2,
        cashBackAmount: {
          amount: 3.60,
          currency: 'MXN'
        }
      },
      merchant: {
        name: 'TELCEL',
        categoryCode: 'Tel',
        categoryDescription: 'Telecomunicaciones'
      }
    },
    {
      cardTransactionId: '2',
      acquirerReferenceNumber: 'ARN002',
      orderDate: '2025-04-23T14:20:00Z',
      amount: {
        amount: 340.00,
        currency: 'MXN'
      },
      clearing: {
        cashBackPercentage: 2,
        cashBackAmount: {
          amount: 6.80,
          currency: 'MXN'
        }
      },
      merchant: {
        name: 'FARMACIAS GUADALAJARA',
        categoryCode: 'Far',
        categoryDescription: 'Farmacias'
      }
    },
    {
      cardTransactionId: '3',
      acquirerReferenceNumber: 'ARN003',
      orderDate: '2025-04-20T19:15:00Z',
      amount: {
        amount: 220.00,
        currency: 'MXN'
      },
      clearing: {
        cashBackPercentage: 2,
        cashBackAmount: {
          amount: 4.40,
          currency: 'MXN'
        }
      },
      merchant: {
        name: 'VIPS',
        categoryCode: 'Res',
        categoryDescription: 'Restaurantes'
      }
    },
    {
      cardTransactionId: '4',
      acquirerReferenceNumber: 'ARN004',
      orderDate: '2025-04-19T12:00:00Z',
      amount: {
        amount: 620.00,
        currency: 'MXN'
      },
      clearing: {
        cashBackPercentage: 4,
        cashBackAmount: {
          amount: 24.80,
          currency: 'MXN'
        }
      },
      merchant: {
        name: 'WALMART',
        categoryCode: 'Sup',
        categoryDescription: 'Supermercados'
      }
    }
  ];

  constructor() { }

  /**
   * Cambia el tab activo
   */
  onTabChange(event: CustomEvent) {
    const value = event.detail.value;
    this.selectedTab.set(value as 'resumen' | 'promo');
  }

  /**
   * Maneja el cierre del banner
   */
  onBannerClose(): void {
    this.isBannerOpen.set(false);
  }

  /**
   * Maneja el click en la tarjeta
   */
  onCardClick(): void {
    console.log('Card clicked - Abrir modal de selección de tarjetas');
    // TODO: Implementar modal para seleccionar tarjeta
  }

  /**
   * Maneja el click en el botón de filtro
   */
  onFilterClick(): void {
    console.log('Filter clicked - Abrir modal de filtros');
    // TODO: Implementar modal de filtros
  }

  /**
   * Maneja la carga de más movimientos
   */
  onLoadMore(): void {
    console.log('Load more clicked - Cargar más transacciones');
    // TODO: Implementar carga de más transacciones
  }
}
