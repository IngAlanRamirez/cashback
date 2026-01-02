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
import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';
import { InfoBannerComponent } from './components/info-banner/info-banner.component';
import { CardInfoComponent } from './components/card-info/card-info.component';
import { AccumulatedCashbackComponent } from './components/accumulated-cashback/accumulated-cashback.component';
import { MonthlyCashbackByStoreComponent } from './components/monthly-cashback-by-store/monthly-cashback-by-store.component';
import { TransactionsListComponent } from './components/transactions-list/transactions-list.component';
import { CardSelectionComponent } from './components/card-selection/card-selection.component';
import { FilterModalComponent } from './components/filter-modal/filter-modal.component';
import { PromotionsSliderComponent } from './components/promotions-slider/promotions-slider.component';
import { PromotionDetailModalComponent } from './components/promotion-detail-modal/promotion-detail-modal.component';
import { Product } from './models/product';
import { CashBackAmounts } from './models/cashback-amounts';
import { ActivityAmountCashBack } from './models/activity-amount-cashback';
import { Purchase } from './models/purchase';
import { Promotion } from './models/promotion';

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
    TransactionsListComponent,
    CardSelectionComponent,
    FilterModalComponent,
    PromotionsSliderComponent,
    PromotionDetailModalComponent
  ]
})
export class CashbackPage {
  constructor() {
    // Registrar iconos de ionicons
    addIcons({ chevronBackOutline });
  }

  // Signal para controlar el tab activo
  selectedTab = signal<'resumen' | 'promo'>('resumen');
  
  // Signal para controlar la visibilidad del banner
  isBannerOpen = signal<boolean>(true);
  
  // Signal para controlar la visibilidad del modal de selección de tarjetas
  isCardSelectionOpen = signal<boolean>(false);
  
  // Signal para controlar la visibilidad del modal de filtros
  isFilterModalOpen = signal<boolean>(false);
  
  // Signal para controlar la visibilidad del modal de detalle de promoción
  isPromotionDetailModalOpen = signal<boolean>(false);
  
  // Signal para la promoción seleccionada
  selectedPromotion = signal<Promotion | null>(null);
  
  // Datos mock para desarrollo
  mockProduct: Product = {
    type: 'CREDIT',
    cardIdentification: {
      displayNumber: '1234567890127896'
    },
    image: {
      imageNumber: '74141001253'
    },
    product: {
      name: 'Rockstar Credit'
    },
    associatedAccounts: [{
      account: {
        contract: {
          contractId: 'contract-1'
        },
        typeCode: 'CREDIT',
        statusInfo: {
          statusCode: 'ACTIVE'
        },
        balances: []
      }
    }]
  };
  
  mockProducts: Product[] = [
    this.mockProduct,
    {
      type: 'DEBIT',
      cardIdentification: {
        displayNumber: '1234567890124123'
      },
      image: {
        imageNumber: '06001402555'
      },
      product: {
        name: 'Rockstar Debit Plus'
      },
      associatedAccounts: [{
        account: {
          contract: {
            contractId: 'contract-2'
          },
          typeCode: 'DEBIT',
          statusInfo: {
            statusCode: 'ACTIVE'
          },
          balances: []
        }
      }]
    },
    {
      type: 'CREDIT',
      cardIdentification: {
        displayNumber: '1234567890125241'
      },
      image: {
        imageNumber: 'other'
      },
      product: {
        name: 'Rockstar Famous Credit'
      },
      associatedAccounts: [{
        account: {
          contract: {
            contractId: 'contract-3'
          },
          typeCode: 'CREDIT',
          statusInfo: {
            statusCode: 'ACTIVE'
          },
          balances: []
        }
      }]
    }
  ];
  
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
    if (this.mockProducts.length > 1) {
      this.isCardSelectionOpen.set(true);
    }
  }

  /**
   * Maneja el cierre del modal de selección de tarjetas
   */
  onCardSelectionClose(): void {
    this.isCardSelectionOpen.set(false);
  }

  /**
   * Maneja la selección de una tarjeta
   */
  onProductSelected(product: Product): void {
    this.mockProduct = product;
    this.isCardSelectionOpen.set(false);
    // TODO: Aquí se actualizarían los datos de cashback según la tarjeta seleccionada
    console.log('Tarjeta seleccionada:', product);
  }

  /**
   * Maneja el click en el botón de filtro
   */
  onFilterClick(): void {
    this.isFilterModalOpen.set(true);
  }

  /**
   * Maneja el cierre del modal de filtros
   */
  onFilterModalClose(): void {
    this.isFilterModalOpen.set(false);
  }

  /**
   * Maneja la aplicación de filtros
   */
  onFiltersApplied(filters: { period: string; category: string }): void {
    console.log('Filtros aplicados:', filters);
    // TODO: Aplicar filtros a la lista de transacciones
    this.isFilterModalOpen.set(false);
  }

  /**
   * Maneja la carga de más movimientos
   */
  onLoadMore(): void {
    console.log('Load more clicked - Cargar más transacciones');
    // TODO: Implementar carga de más transacciones
  }

  // Datos mock de promociones
  mockPromotions: Promotion[] = [
    {
      promotionId: '1',
      description: 'Llena tu tanque y obtén 1% de cashback en gasolineras participantes.',
      percentage: 1,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 1,
      image: {
        imageNumber: 'images/promotions/pemex-gas-station.png'
      },
      merchant: {
        name: 'Gasolineras',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: false
    },
    {
      promotionId: '2',
      description: 'Recarga tu celular y obtén 2% de cashback en servicios de telecomunicaciones.',
      percentage: 2,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 2,
      image: {
        imageNumber: 'images/promotions/mobile-cashback.png'
      },
      merchant: {
        name: 'Telecomunicaciones',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: false
    },
    {
      promotionId: '3',
      description: 'Disfruta de entretenimiento y obtén 1% de cashback en cines, teatros y eventos.',
      percentage: 1,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 3,
      image: {
        imageNumber: 'images/promotions/entertainment.png'
      },
      merchant: {
        name: 'Entretenimiento',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: false
    },
    {
      promotionId: '4',
      description: 'Obtén 1% de cashback al hacer tu despensa con tu Rockstar Credit.',
      percentage: 1,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 4,
      image: {
        imageNumber: 'images/promotions/supermarket.jpeg'
      },
      merchant: {
        name: 'Supermercados',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: false
    },
    {
      promotionId: '5',
      description: 'Cumple ese antojo y obtén 2% de cashback con tu Rockstar Famous Credit.',
      percentage: 2,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 5,
      image: {
        imageNumber: 'images/promotions/restaurant.jpeg'
      },
      merchant: {
        name: 'Restaurantes',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: false
    },
    {
      promotionId: '6',
      description: 'Ahorra en medicamentos y productos de salud con 1.5% de cashback en farmacias participantes.',
      percentage: 1.5,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 6,
      image: {
        imageNumber: 'images/promotions/pharmacy.jpeg'
      },
      merchant: {
        name: 'Farmacias',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: false
    }
  ];

  // Datos mock de RockStar Rewards
  mockRockStarRewards: Promotion[] = [
    {
      promotionId: '7',
      description: 'El programa de lealtad que te premia con hasta 5 RockStar Points por todas tus compras.',
      percentage: 5,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 1,
      image: {
        imageNumber: 'images/promotions/rockstar-rewards.png'
      },
      merchant: {
        name: 'Acerca de RockStar Rewards',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: true
    },
    {
      promotionId: '8',
      description: 'Conoce todas las tarjetas participantes del programa RockStar Rewards.',
      percentage: 0,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 2,
      image: {
        imageNumber: 'images/promotions/rockstar-cards.png'
      },
      merchant: {
        name: 'Tarjetas Rockstar',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: true
    },
    {
      promotionId: '9',
      description: 'Canjea tus RockStar Points por productos exclusivos y experiencias únicas.',
      percentage: 0,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 3,
      image: {
        imageNumber: 'images/promotions/rockstar-products.png'
      },
      merchant: {
        name: 'Catálogo de Premios',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: true
    },
    {
      promotionId: '12',
      description: 'Únete al programa y disfruta de beneficios exclusivos todo el año.',
      percentage: 0,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 6,
      image: {
        imageNumber: 'images/promotions/rockstar-unete.png'
      },
      merchant: {
        name: 'Únete Ahora',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: true
    }
  ];

  /**
   * Maneja el click en "Ver más" de promociones
   */
  onPromotionsViewMore(): void {
    // Crear una promoción genérica para el modal
    const genericPromotion: Promotion = {
      promotionId: 'view-more-promotions',
      description: '',
      percentage: 0,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 0,
      image: {
        imageNumber: ''
      },
      merchant: {
        name: 'Promociones exclusivas',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: false
    };
    this.selectedPromotion.set(genericPromotion);
    this.isPromotionDetailModalOpen.set(true);
  }

  /**
   * Maneja el click en "Ver más" de RockStar Rewards
   */
  onRockStarRewardsViewMore(): void {
    // Crear una promoción genérica para el modal
    const genericPromotion: Promotion = {
      promotionId: 'view-more-rewards',
      description: '',
      percentage: 0,
      statusInfo: {
        statusCode: 'ACTIVE'
      },
      period: {
        startDate: '2025-01-01'
      },
      creationDate: '2025-01-01',
      expirationDate: '2025-12-31',
      position: 0,
      image: {
        imageNumber: ''
      },
      merchant: {
        name: 'RockStar Rewards',
        url: 'https://www.rockstar.com.mx/cashback/promociones-unicas/'
      },
      isUniqueRewards: true
    };
    this.selectedPromotion.set(genericPromotion);
    this.isPromotionDetailModalOpen.set(true);
  }

  /**
   * Maneja el click en una promoción
   */
  onPromotionClick(promotion: Promotion): void {
    this.selectedPromotion.set(promotion);
    this.isPromotionDetailModalOpen.set(true);
  }

  /**
   * Cierra el modal de detalle de promoción
   */
  onPromotionDetailModalClose(): void {
    this.isPromotionDetailModalOpen.set(false);
    this.selectedPromotion.set(null);
  }

  /**
   * Navega a la URL de la promoción
   */
  onPromotionNavigate(url: string): void {
    window.open(url, '_blank');
  }
}
