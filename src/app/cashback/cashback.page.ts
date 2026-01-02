import { Component, signal, inject, OnInit } from '@angular/core';
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
import { CashbackDataService } from './services/cashback-data.service';
import { TransactionsService, TransactionFilters } from './services/transactions.service';
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
export class CashbackPage implements OnInit {
  private cashbackDataService = inject(CashbackDataService);
  private transactionsService = inject(TransactionsService);

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
  
  // Signals para los datos cargados desde JSON
  mockProduct = signal<Product>({
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
  });
  
  mockProducts = signal<Product[]>([]);
  mockCashbackAmounts = signal<CashBackAmounts>({
    monthAmount: {
      amount: 0,
      currency: 'MXN'
    },
    annualAmount: {
      amount: 0,
      currency: 'MXN'
    },
    cashbackPeriod: {
      month: '1',
      year: '2025'
    }
  });
  mockActivityAmountCashBacks = signal<ActivityAmountCashBack[]>([]);
  
  // Datos iniciales (se reemplazarán al cargar desde JSON)
  private initialActivityAmountCashBacks: ActivityAmountCashBack[] = [
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

  // Transacciones dinámicas desde el servicio
  filteredPurchases = signal<Purchase[]>([]);
  currentFilters = signal<{ period: string; category: string }>({
    period: 'current',
    category: 'all'
  });
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  isLoadingTransactions = signal<boolean>(false);
  hasMoreTransactions = signal<boolean>(false);
  
  // Datos iniciales (se reemplazarán al cargar desde JSON)
  private initialPurchases: Purchase[] = [
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

  mockPromotions = signal<Promotion[]>([]);
  mockRockStarRewards = signal<Promotion[]>([]);

  /**
   * Inicializa los datos desde el JSON
   */
  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Carga los datos desde el servicio
   */
  loadData(): void {
    this.cashbackDataService.getCashbackData().subscribe({
      next: (data) => {
        this.mockProduct.set(data.product);
        this.mockProducts.set(data.products);
        this.mockCashbackAmounts.set(data.cashbackAmounts);
        this.mockActivityAmountCashBacks.set(data.activityAmountCashBacks);
        this.mockPromotions.set(data.promotions);
        this.mockRockStarRewards.set(data.rockStarRewards);
        
        // Cargar transacciones dinámicas
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        // Usar datos iniciales en caso de error
        this.mockActivityAmountCashBacks.set(this.initialActivityAmountCashBacks);
        // Cargar transacciones dinámicas incluso si hay error
        this.loadTransactions();
      }
    });
  }

  /**
   * Carga las transacciones desde el servicio con los filtros actuales
   */
  loadTransactions(page: number = 1, append: boolean = false): void {
    this.isLoadingTransactions.set(true);
    const filters = this.currentFilters();
    
    this.transactionsService.getTransactions(filters, page).subscribe({
      next: (response) => {
        if (append) {
          // Agregar nuevas transacciones a las existentes
          this.filteredPurchases.update(purchases => [...purchases, ...response.transactions]);
        } else {
          // Reemplazar todas las transacciones
          this.filteredPurchases.set(response.transactions);
        }
        
        // Calcular total de páginas
        const totalPages = Math.ceil(response.total / 10); // 10 es el pageSize del servicio
        this.totalPages.set(totalPages);
        this.currentPage.set(page);
        this.hasMoreTransactions.set(response.hasMore);
        this.isLoadingTransactions.set(false);

        // Si no es append, actualizar los cálculos de cashback
        if (!append) {
          this.updateCashbackCalculations();
        }
      },
      error: (error) => {
        console.error('Error al cargar transacciones:', error);
        this.isLoadingTransactions.set(false);
      }
    });
  }

  /**
   * Actualiza los cálculos de cashback acumulado y por categoría
   */
  updateCashbackCalculations(): void {
    const filters = this.currentFilters();

    // Para el cashback acumulado, obtener TODAS las transacciones del periodo (sin filtro de categoría)
    const filtersForAccumulated: TransactionFilters = {
      period: filters.period,
      category: 'all' // Siempre usar 'all' para el acumulado
    };

    // Para el cashback por categoría, usar los filtros actuales (puede incluir filtro de categoría)
    const filtersForCategory = filters;

    // Obtener transacciones para el acumulado (todas las categorías)
    this.transactionsService.getAllFilteredTransactions(filtersForAccumulated).subscribe({
      next: (allTransactionsForAccumulated) => {
        // Calcular cashback acumulado con TODAS las transacciones del periodo
        const cashbackAmounts = this.transactionsService.calculateCashbackAmounts(
          allTransactionsForAccumulated,
          filters.period
        );
        this.mockCashbackAmounts.set(cashbackAmounts);

        // Si el filtro de categoría es 'all', usar las mismas transacciones para el cashback por categoría
        // Si hay un filtro de categoría específico, obtener solo esas transacciones
        if (filters.category === 'all') {
          // Calcular cashback por categoría con todas las transacciones
          const activityAmountCashBacks = this.transactionsService.calculateActivityAmountCashBacks(
            allTransactionsForAccumulated
          );
          this.mockActivityAmountCashBacks.set(activityAmountCashBacks);
        } else {
          // Obtener transacciones filtradas por categoría para el cashback por categoría
          this.transactionsService.getAllFilteredTransactions(filtersForCategory).subscribe({
            next: (filteredTransactions) => {
              const activityAmountCashBacks = this.transactionsService.calculateActivityAmountCashBacks(
                filteredTransactions
              );
              this.mockActivityAmountCashBacks.set(activityAmountCashBacks);
            },
            error: (error) => {
              console.error('Error al calcular cashback por categoría:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al calcular cashback acumulado:', error);
      }
    });
  }

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
    if (this.mockProducts().length > 1) {
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
    this.mockProduct.set(product);
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
    // Actualizar filtros actuales
    this.currentFilters.set(filters);
    // Cargar transacciones con los nuevos filtros (resetear a página 1)
    this.loadTransactions(1, false);
    this.isFilterModalOpen.set(false);
  }

  /**
   * Maneja la carga de más movimientos
   */
  onLoadMore(): void {
    if (this.hasMoreTransactions() && !this.isLoadingTransactions()) {
      const nextPage = this.currentPage() + 1;
      this.loadTransactions(nextPage, true);
    }
  }


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
