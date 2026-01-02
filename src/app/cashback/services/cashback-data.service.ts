import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { Product } from '../models/product';
import { isValidCashbackData } from '../utils/validators';
import { CashBackAmounts } from '../models/cashback-amounts';
import { ActivityAmountCashBack } from '../models/activity-amount-cashback';
import { Purchase } from '../models/purchase';
import { Promotion } from '../models/promotion';

export interface CashbackData {
  product: Product;
  products: Product[];
  cashbackAmounts: CashBackAmounts;
  activityAmountCashBacks: ActivityAmountCashBack[];
  purchases: Purchase[];
  promotions: Promotion[];
  rockStarRewards: Promotion[];
}

@Injectable({
  providedIn: 'root'
})
export class CashbackDataService {
  private dataUrl = '/assets/data/cashback-data.json';
  private logger = inject(LoggerService);
  
  // Caché de datos usando shareReplay para evitar múltiples llamadas HTTP
  private dataCache$: Observable<CashbackData> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los datos de cashback desde el archivo JSON
   * Usa caché para evitar múltiples llamadas HTTP
   */
  getCashbackData(): Observable<CashbackData> {
    // Si ya existe caché, retornarlo
    if (!this.dataCache$) {
      this.dataCache$ = this.http.get<CashbackData>(this.dataUrl).pipe(
        shareReplay(1), // Cachea el último valor y lo comparte entre suscriptores
        map((data) => {
          // Validar estructura de datos
          if (!isValidCashbackData(data)) {
            this.logger.error('Estructura de datos de cashback inválida:', data);
            throw new Error('Estructura de datos de cashback inválida');
          }
          return data;
        }),
        catchError((error) => {
          this.logger.error('Error al cargar datos de cashback:', error);
          // Retornar datos vacíos en caso de error
          return of(this.getEmptyData());
        })
      );
    }
    return this.dataCache$;
  }

  /**
   * Limpia el caché de datos (útil para forzar recarga)
   */
  clearCache(): void {
    this.dataCache$ = null;
  }

  /**
   * Obtiene el producto actual
   */
  getProduct(): Observable<Product> {
    return this.getCashbackData().pipe(
      map(data => data.product)
    );
  }

  /**
   * Obtiene la lista de productos
   */
  getProducts(): Observable<Product[]> {
    return this.getCashbackData().pipe(
      map(data => data.products)
    );
  }

  /**
   * Obtiene los montos de cashback
   */
  getCashbackAmounts(): Observable<CashBackAmounts> {
    return this.getCashbackData().pipe(
      map(data => data.cashbackAmounts)
    );
  }

  /**
   * Obtiene los cashbacks por categoría
   */
  getActivityAmountCashBacks(): Observable<ActivityAmountCashBack[]> {
    return this.getCashbackData().pipe(
      map(data => data.activityAmountCashBacks)
    );
  }

  /**
   * Obtiene las compras/transacciones
   */
  getPurchases(): Observable<Purchase[]> {
    return this.getCashbackData().pipe(
      map(data => data.purchases)
    );
  }

  /**
   * Obtiene las promociones exclusivas
   */
  getPromotions(): Observable<Promotion[]> {
    return this.getCashbackData().pipe(
      map(data => data.promotions)
    );
  }

  /**
   * Obtiene las promociones de RockStar Rewards
   */
  getRockStarRewards(): Observable<Promotion[]> {
    return this.getCashbackData().pipe(
      map(data => data.rockStarRewards)
    );
  }

  /**
   * Retorna datos vacíos en caso de error
   */
  private getEmptyData(): CashbackData {
    return {
      product: {} as Product,
      products: [],
      cashbackAmounts: {} as CashBackAmounts,
      activityAmountCashBacks: [],
      purchases: [],
      promotions: [],
      rockStarRewards: []
    };
  }
}

