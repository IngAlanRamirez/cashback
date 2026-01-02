import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { CashbackDataService } from './cashback-data.service';
import { TransactionsService, TransactionFilters } from './transactions.service';
import { NotificationService } from './notification.service';
import { LoggerService } from './logger.service';
import { Product } from '../models/product';
import { CashBackAmounts } from '../models/cashback-amounts';
import { ActivityAmountCashBack } from '../models/activity-amount-cashback';
import { Purchase } from '../models/purchase';
import { Promotion } from '../models/promotion';
import { CashbackPeriod, CategoryCode, LoadingState } from '../models/enums';
import { TransactionsService as TS } from './transactions.service';

/**
 * Servicio que maneja el estado y la lógica de negocio de la página de cashback
 * Separa las responsabilidades del componente, que solo se encarga de la UI
 */
@Injectable({
  providedIn: 'root'
})
export class CashbackStateService implements OnDestroy {
  private cashbackDataService = inject(CashbackDataService);
  private transactionsService = inject(TransactionsService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);
  
  // Subject para gestionar la desuscripción de observables
  private destroy$ = new Subject<void>();

  // ========== ESTADO DE DATOS ==========
  
  // Producto actual y lista de productos
  readonly currentProduct = signal<Product>(this.getDefaultProduct());
  readonly products = signal<Product[]>([]);
  
  // Montos de cashback
  readonly cashbackAmounts = signal<CashBackAmounts>(this.getDefaultCashbackAmounts());
  readonly activityAmountCashBacks = signal<ActivityAmountCashBack[]>([]);
  
  // Transacciones
  readonly filteredPurchases = signal<Purchase[]>([]);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly hasMoreTransactions = signal<boolean>(false);
  
  // Promociones
  readonly promotions = signal<Promotion[]>([]);
  readonly rockStarRewards = signal<Promotion[]>([]);
  
  // ========== ESTADO DE FILTROS ==========
  
  readonly currentFilters = signal<{ period: CashbackPeriod | string; category: CategoryCode | string }>({
    period: CashbackPeriod.CURRENT,
    category: CategoryCode.ALL
  });
  
  // ========== ESTADO DE CARGA ==========
  
  readonly loadingStateInitialData = signal<LoadingState>(LoadingState.LOADING);
  readonly loadingStateTransactions = signal<LoadingState>(LoadingState.IDLE);
  readonly loadingStateCashbackCalculations = signal<LoadingState>(LoadingState.IDLE);
  
  // Computed signals para compatibilidad
  readonly isLoadingInitialData = computed(() => 
    this.loadingStateInitialData() === LoadingState.LOADING
  );
  readonly isLoadingTransactions = computed(() => 
    this.loadingStateTransactions() === LoadingState.LOADING
  );
  readonly isLoadingCashbackCalculations = computed(() => 
    this.loadingStateCashbackCalculations() === LoadingState.LOADING
  );
  
  // ========== DATOS INICIALES ==========
  
  private readonly initialActivityAmountCashBacks: ActivityAmountCashBack[] = [
    {
      name: 'Supermercados',
      categoryCode: 'Sup',
      categoryDescription: 'Supermercados',
      cashBackAmount: { amount: 77.00, currency: 'MXN' },
      cashBackPercentage: 1
    },
    {
      name: 'Restaurantes',
      categoryCode: 'Res',
      categoryDescription: 'Restaurantes',
      cashBackAmount: { amount: 30.50, currency: 'MXN' },
      cashBackPercentage: 5
    },
    {
      name: 'Farmacias',
      categoryCode: 'Far',
      categoryDescription: 'Farmacias',
      cashBackAmount: { amount: 27.00, currency: 'MXN' },
      cashBackPercentage: 6
    },
    {
      name: 'Telecomunicaciones',
      categoryCode: 'Tel',
      categoryDescription: 'Telecomunicaciones',
      cashBackAmount: { amount: 15.00, currency: 'MXN' },
      cashBackPercentage: 4
    }
  ];
  
  // ========== MÉTODOS PÚBLICOS ==========
  
  /**
   * Carga todos los datos iniciales desde el JSON.
   * 
   * Este método es el punto de entrada principal para cargar todos los datos estáticos
   * de la aplicación desde el archivo `cashback-data.json`. También dispara la carga
   * de transacciones dinámicas.
   * 
   * **Datos cargados**:
   * - Producto actual y lista de productos disponibles
   * - Montos de cashback iniciales
   * - Cashback por categoría inicial
   * - Promociones exclusivas
   * - Promociones RockStar Rewards
   * 
   * **Flujo de ejecución**:
   * 1. Establece el estado de carga a `LOADING`
   * 2. Obtiene los datos desde `CashbackDataService`
   * 3. Actualiza todos los signals con los datos recibidos
   * 4. Carga las transacciones dinámicas
   * 5. Establece el estado de carga a `SUCCESS` o `ERROR`
   * 
   * **Manejo de errores**:
   * - Si falla la carga, muestra una notificación de error al usuario
   * - Usa datos iniciales por defecto para `activityAmountCashBacks`
   * - Continúa cargando transacciones incluso si hay error
   * 
   * @example
   * // Llamar al inicializar el componente
   * this.stateService.loadInitialData();
   */
  loadInitialData(): void {
    this.loadingStateInitialData.set(LoadingState.LOADING);
    this.cashbackDataService.getCashbackData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.currentProduct.set(data.product);
          this.products.set(data.products);
          this.cashbackAmounts.set(data.cashbackAmounts);
          this.activityAmountCashBacks.set(data.activityAmountCashBacks);
          this.promotions.set(data.promotions);
          this.rockStarRewards.set(data.rockStarRewards);
          
          // Cargar transacciones dinámicas
          this.loadTransactions();
          this.loadingStateInitialData.set(LoadingState.SUCCESS);
        },
        error: (error) => {
          this.notificationService.showDataLoadError();
          this.activityAmountCashBacks.set(this.initialActivityAmountCashBacks);
          this.loadTransactions();
          this.loadingStateInitialData.set(LoadingState.ERROR);
        }
      });
  }
  
  /**
   * Carga las transacciones con los filtros actuales.
   * 
   * Este método obtiene transacciones paginadas desde el servicio, aplicando los filtros
   * de período y categoría que están actualmente activos en el estado.
   * 
   * **Parámetros**:
   * - `page`: Número de página a cargar (por defecto: 1)
   * - `append`: Si es `true`, agrega las nuevas transacciones a las existentes.
   *              Si es `false`, reemplaza todas las transacciones.
   * 
   * **Comportamiento**:
   * - Si `append` es `false` y la carga es exitosa, también actualiza los cálculos de cashback
   * - Actualiza el estado de paginación (página actual, total de páginas, si hay más páginas)
   * - Maneja estados de carga y errores apropiadamente
   * 
   * **Estados actualizados**:
   * - `filteredPurchases`: Lista de transacciones
   * - `currentPage`: Página actual
   * - `totalPages`: Total de páginas disponibles
   * - `hasMoreTransactions`: Si hay más páginas disponibles
   * - `loadingStateTransactions`: Estado de carga
   * 
   * @param {number} page - Número de página a cargar (por defecto: 1)
   * @param {boolean} append - Si es true, agrega transacciones; si es false, las reemplaza (por defecto: false)
   * @example
   * // Cargar primera página (reemplaza transacciones existentes)
   * this.stateService.loadTransactions(1, false);
   * 
   * // Cargar segunda página (agrega a las existentes)
   * this.stateService.loadTransactions(2, true);
   */
  loadTransactions(page: number = 1, append: boolean = false): void {
    this.loadingStateTransactions.set(LoadingState.LOADING);
    const filters = this.currentFilters();
    
    this.transactionsService.getTransactions(filters, page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (append) {
            this.filteredPurchases.update(purchases => [...purchases, ...response.transactions]);
          } else {
            this.filteredPurchases.set(response.transactions);
          }
          
          const totalPages = Math.ceil(response.total / TS.DEFAULT_PAGE_SIZE);
          this.totalPages.set(totalPages);
          this.currentPage.set(page);
          this.hasMoreTransactions.set(response.hasMore);
          this.loadingStateTransactions.set(LoadingState.SUCCESS);

          if (!append) {
            this.updateCashbackCalculations();
          }
        },
        error: (error) => {
          this.notificationService.showTransactionsLoadError();
          this.loadingStateTransactions.set(LoadingState.ERROR);
        }
      });
  }
  
  /**
   * Actualiza los cálculos de cashback acumulado y por categoría.
   * 
   * Este método realiza dos cálculos principales:
   * 1. **Cashback acumulado**: Calcula el total de cashback mensual y anual para TODAS las categorías
   *    del período seleccionado, independientemente del filtro de categoría aplicado.
   * 2. **Cashback por categoría**: Calcula el cashback agrupado por categoría. Si el filtro de categoría
   *    es 'all', usa todas las transacciones del período. Si hay un filtro específico, solo usa
   *    las transacciones de esa categoría.
   * 
   * **Flujo de ejecución**:
   * 1. Obtiene todas las transacciones del período (sin filtro de categoría) para el acumulado
   * 2. Calcula el cashback acumulado con esas transacciones
   * 3. Si el filtro de categoría es 'all', calcula el cashback por categoría con las mismas transacciones
   * 4. Si hay un filtro de categoría específico, obtiene solo esas transacciones y calcula el cashback por categoría
   * 
   * **Estados de carga**:
   * - Establece `loadingStateCashbackCalculations` a `LOADING` al inicio
   * - Establece a `SUCCESS` cuando los cálculos se completan
   * - Establece a `ERROR` si ocurre un error durante el proceso
   * 
   * **Nota**: Este método usa `switchMap` para evitar nested subscribes y mejorar la legibilidad del código.
   * 
   * @throws {Error} Si ocurre un error al obtener las transacciones o calcular los montos
   * @example
   * // Se llama automáticamente cuando se cargan transacciones o se aplican filtros
   * this.stateService.updateCashbackCalculations();
   */
  updateCashbackCalculations(): void {
    this.loadingStateCashbackCalculations.set(LoadingState.LOADING);
    const filters = this.currentFilters();

    const filtersForAccumulated: TransactionFilters = {
      period: filters.period,
      category: CategoryCode.ALL
    };

    const filtersForCategory = filters;

    this.transactionsService.getAllFilteredTransactions(filtersForAccumulated)
      .pipe(
        switchMap((allTransactionsForAccumulated) => {
          const cashbackAmounts = this.transactionsService.calculateCashbackAmounts(
            allTransactionsForAccumulated,
            filters.period
          );
          this.cashbackAmounts.set(cashbackAmounts);

          if (filters.category === CategoryCode.ALL || filters.category === 'all') {
            const activityAmountCashBacks = this.transactionsService.calculateActivityAmountCashBacks(
              allTransactionsForAccumulated
            );
            return of({ activityAmountCashBacks });
          } else {
            return this.transactionsService.getAllFilteredTransactions(filtersForCategory)
              .pipe(
                switchMap((filteredTransactions) => {
                  const activityAmountCashBacks = this.transactionsService.calculateActivityAmountCashBacks(
                    filteredTransactions
                  );
                  return of({ activityAmountCashBacks });
                })
              );
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ activityAmountCashBacks }) => {
          this.activityAmountCashBacks.set(activityAmountCashBacks);
          this.loadingStateCashbackCalculations.set(LoadingState.SUCCESS);
        },
        error: (error) => {
          this.notificationService.showCalculationError();
          this.loadingStateCashbackCalculations.set(LoadingState.ERROR);
        }
      });
  }
  
  /**
   * Aplica filtros y recarga transacciones
   */
  applyFilters(filters: { period: CashbackPeriod | string; category: CategoryCode | string }): void {
    this.logger.log('Filtros aplicados:', filters);
    
    const previousFilters = this.currentFilters();
    
    // Invalidar caché si los filtros cambiaron significativamente
    if (previousFilters.period !== filters.period || previousFilters.category !== filters.category) {
      // Invalidar caché del período anterior si cambió
      if (previousFilters.period !== filters.period) {
        this.transactionsService.invalidateCacheByPeriod(previousFilters.period);
      }
      
      // Invalidar caché de la categoría anterior si cambió
      if (previousFilters.category !== filters.category) {
        this.transactionsService.invalidateCacheByCategory(previousFilters.category);
      }
    }
    
    this.currentFilters.set(filters);
    this.loadTransactions(1, false);
  }
  
  /**
   * Carga más transacciones (paginación)
   */
  loadMoreTransactions(): void {
    if (this.hasMoreTransactions() && !this.isLoadingTransactions()) {
      const nextPage = this.currentPage() + 1;
      this.loadTransactions(nextPage, true);
    }
  }
  
  /**
   * Cambia el producto actual
   */
  selectProduct(product: Product): void {
    this.currentProduct.set(product);
    this.logger.log('Tarjeta seleccionada:', product);
    
    // Limpiar todo el caché cuando se cambia de tarjeta
    // ya que las transacciones pueden ser diferentes por tarjeta
    this.transactionsService.clearAllCache();
    
    // Recargar datos para la nueva tarjeta
    this.loadInitialData();
  }
  
  /**
   * Limpia todas las suscripciones cuando el servicio se destruye
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // ========== MÉTODOS PRIVADOS ==========
  
  /**
   * Retorna un producto por defecto
   */
  private getDefaultProduct(): Product {
    return {
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
  }
  
  /**
   * Retorna montos de cashback por defecto
   */
  private getDefaultCashbackAmounts(): CashBackAmounts {
    return {
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
    };
  }
}

