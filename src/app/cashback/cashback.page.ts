import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
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
  IonLabel,
  IonSpinner
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
import { ErrorFallbackComponent } from './components/error-fallback/error-fallback.component';
import { CashbackStateService } from './services/cashback-state.service';
import { Product } from './models/product';
import { Promotion } from './models/promotion';
import { CashbackTab, CashbackPeriod, CategoryCode, LoadingState } from './models/enums';
import { TranslationService } from './i18n/translation.service';

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
    IonSpinner,
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
    PromotionDetailModalComponent,
    ErrorFallbackComponent
  ]
})
export class CashbackPage implements OnInit, OnDestroy {
  // Servicio de estado que maneja toda la lógica de negocio
  readonly stateService = inject(CashbackStateService);
  
  // Servicio de traducción
  readonly translate = inject(TranslationService);
  
  // Exponer enums para uso en template
  readonly CashbackTab = CashbackTab;
  readonly LoadingState = LoadingState;

  constructor() {
    // Registrar iconos de ionicons
    addIcons({ chevronBackOutline });
  }
  
  /**
   * Limpia todas las suscripciones cuando el componente se destruye
   */
  ngOnDestroy(): void {
    // El servicio maneja sus propias suscripciones
  }

  // ========== ESTADO DE UI (solo UI, no lógica de negocio) ==========
  
  // Signal para controlar el tab activo
  selectedTab = signal<CashbackTab>(CashbackTab.RESUMEN);
  
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
  
  // ========== ACCESO A DATOS DEL SERVICIO DE ESTADO ==========
  // Exponemos los signals del servicio para binding en el template
  
  // Productos
  get mockProduct() { return this.stateService.currentProduct; }
  get mockProducts() { return this.stateService.products; }
  
  // Cashback
  get mockCashbackAmounts() { return this.stateService.cashbackAmounts; }
  get mockActivityAmountCashBacks() { return this.stateService.activityAmountCashBacks; }
  
  // Transacciones
  get filteredPurchases() { return this.stateService.filteredPurchases; }
  get currentFilters() { return this.stateService.currentFilters; }
  get currentPage() { return this.stateService.currentPage; }
  get totalPages() { return this.stateService.totalPages; }
  get hasMoreTransactions() { return this.stateService.hasMoreTransactions; }
  
  // Promociones
  get mockPromotions() { return this.stateService.promotions; }
  get mockRockStarRewards() { return this.stateService.rockStarRewards; }
  
  // Estados de carga
  get isLoadingTransactions() { return this.stateService.isLoadingTransactions; }
  get isLoadingInitialData() { return this.stateService.isLoadingInitialData; }
  get isLoadingCashbackCalculations() { return this.stateService.isLoadingCashbackCalculations; }

  /**
   * Inicializa los datos desde el JSON
   */
  ngOnInit(): void {
    // Delegar al servicio de estado
    this.stateService.loadInitialData();
  }

  /**
   * Cambia el tab activo
   */
  onTabChange(event: CustomEvent) {
    const value = event.detail.value;
    this.selectedTab.set(value as CashbackTab);
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
    this.stateService.selectProduct(product);
    this.isCardSelectionOpen.set(false);
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
  onFiltersApplied(filters: { period: CashbackPeriod | string; category: CategoryCode | string }): void {
    // Delegar al servicio de estado
    this.stateService.applyFilters(filters);
    this.isFilterModalOpen.set(false);
  }

  /**
   * Maneja la carga de más movimientos
   */
  onLoadMore(): void {
    // Delegar al servicio de estado
    this.stateService.loadMoreTransactions();
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
