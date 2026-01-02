import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Purchase } from '../models/purchase';
import { CashBackAmounts } from '../models/cashback-amounts';
import { ActivityAmountCashBack } from '../models/activity-amount-cashback';
import { PeriodService } from './period.service';
import { validateTransactionFilters, isValidPage } from '../utils/validators';
import { CashbackPeriod, CategoryCode } from '../models/enums';

export interface TransactionFilters {
  period: CashbackPeriod | string; // Permite string para compatibilidad
  category: CategoryCode | string; // Permite string para compatibilidad
}

export interface TransactionPagination {
  page: number;
  pageSize: number;
  total: number;
}

interface CacheEntry {
  data: Purchase[];
  timestamp: number;
  filters: TransactionFilters;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private periodService = inject(PeriodService);
  
  // Constantes para paginación
  static readonly DEFAULT_PAGE_SIZE = 10;
  private readonly pageSize = TransactionsService.DEFAULT_PAGE_SIZE;
  private readonly cacheExpirationTime = 5 * 60 * 1000; // 5 minutos en milisegundos
  
  // Constantes para simulación de delay de red
  private static readonly MIN_DELAY_MS = 200;
  private static readonly MAX_DELAY_MS = 700;
  private static readonly MIN_DELAY_MS_FAST = 100;
  private static readonly MAX_DELAY_MS_FAST = 400;
  
  // Constantes para generación de transacciones
  private static readonly MIN_TRANSACTIONS = 15;
  private static readonly MAX_TRANSACTIONS = 50;
  private static readonly MIN_TRANSACTIONS_FAST = 10;
  private static readonly MAX_TRANSACTIONS_FAST = 40;
  
  // Constantes para cálculo de cashback anual
  private static readonly ANNUAL_MULTIPLIER_MIN = 2;
  private static readonly ANNUAL_MULTIPLIER_MAX = 5;
  
  // Caché de transacciones filtradas
  private transactionsCache = new Map<string, CacheEntry>();
  
  // Nombres de establecimientos por categoría
  private readonly merchantNames: Record<string, string[]> = {
    'Sup': ['WALMART', 'SORIANA', 'COMERCIAL MEXICANA', 'CITY CLUB', 'COSTCO', 'LA COMER', 'BODEGA AURRERA'],
    'Res': ['VIPS', 'SANBORNS', 'EL PORTÓN', 'TOK\'S', 'ITALIANNIS', 'CHILI\'S', 'APPLEBEE\'S', 'DOMINO\'S'],
    'Far': ['FARMACIAS GUADALAJARA', 'FARMACIA DEL AHORRO', 'SIMILARES', 'FARMACIA SAN PABLO', 'BENAVÍDES'],
    'Tel': ['TELCEL', 'MOVISTAR', 'AT&T', 'UNEFON', 'VIRGIN MOBILE', 'BAIT'],
    'Gas': ['PEMEX', 'BP', 'SHELL', 'MOBIL', 'GULF'],
    'Ent': ['CINEMEX', 'CINEPOLIS', 'TICKETMASTER', 'LIVE NATION']
  };

  // Porcentajes de cashback por categoría
  private readonly cashbackPercentages: Record<string, number> = {
    'Sup': 1,
    'Res': 2,
    'Far': 1.5,
    'Tel': 2,
    'Gas': 1,
    'Ent': 1
  };

  /**
   * Genera una fecha aleatoria dentro de un rango
   */
  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Genera una transacción fake con datos aleatorios pero realistas.
   * 
   * Este método crea una transacción simulada con la siguiente estructura:
   * - ID único basado en timestamp e índice
   * - Establecimiento aleatorio de la categoría especificada
   * - Fecha dentro del rango proporcionado
   * - Monto aleatorio entre 50 y 2000 pesos
   * - Porcentaje de cashback según la categoría
   * - Cálculo automático del monto de cashback
   * 
   * **Categorías soportadas**:
   * - `Sup`: Supermercados (1% cashback)
   * - `Res`: Restaurantes (2% cashback)
   * - `Far`: Farmacias (1.5% cashback)
   * - `Tel`: Telecomunicaciones (2% cashback)
   * - `Gas`: Gasolineras (1% cashback)
   * - `Ent`: Entretenimiento (1% cashback)
   * 
   * **Parámetros**:
   * - `categoryCode`: Código de categoría (Sup, Res, Far, Tel, etc.)
   * - `date`: Fecha de la transacción
   * - `index`: Índice único para generar IDs únicos
   * 
   * **Retorna**: Un objeto `Purchase` completo con todos los campos requeridos.
   * 
   * @param {string} categoryCode - Código de categoría del establecimiento
   * @param {Date} date - Fecha de la transacción
   * @param {number} index - Índice único para generar IDs
   * @returns {Purchase} Objeto Purchase con datos simulados
   * @example
   * const transaction = this.generateFakeTransaction('Sup', new Date(), 0);
   * // Retorna: { cardTransactionId: 'TXN-1234567890-0', merchant: { name: 'WALMART', ... }, ... }
   */
  private generateFakeTransaction(
    categoryCode: string,
    date: Date,
    index: number
  ): Purchase {
    const merchants = this.merchantNames[categoryCode] || ['ESTABLECIMIENTO'];
    const merchantName = merchants[Math.floor(Math.random() * merchants.length)];
    const percentage = this.cashbackPercentages[categoryCode] || 1;
    
    // Monto aleatorio entre 50 y 2000 pesos
    const amount = Math.round((Math.random() * 1950 + 50) * 100) / 100;
    const cashbackAmount = Math.round((amount * percentage / 100) * 100) / 100;

    return {
      cardTransactionId: `TXN-${Date.now()}-${index}`,
      acquirerReferenceNumber: `ARN${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      orderDate: date.toISOString(),
      amount: {
        amount: amount,
        currency: 'MXN'
      },
      clearing: {
        cashBackPercentage: percentage,
        cashBackAmount: {
          amount: cashbackAmount,
          currency: 'MXN'
        }
      },
      merchant: {
        name: merchantName,
        categoryCode: categoryCode,
        categoryDescription: this.getCategoryDescription(categoryCode)
      }
    };
  }

  /**
   * Obtiene la descripción de la categoría
   */
  private getCategoryDescription(categoryCode: string): string {
    const descriptions: Record<string, string> = {
      'Sup': 'Supermercados',
      'Res': 'Restaurantes',
      'Far': 'Farmacias',
      'Tel': 'Telecomunicaciones',
      'Gas': 'Gasolineras',
      'Ent': 'Entretenimiento'
    };
    return descriptions[categoryCode] || 'Otros';
  }

  /**
   * Obtiene el rango de fechas según el periodo
   * @deprecated Usar PeriodService.getDateRange() en su lugar
   */
  private getDateRange(period: string): { start: Date; end: Date } {
    return this.periodService.getDateRange(period as 'current' | 'previous' | 'previous-2');
  }

  /**
   * Obtiene las categorías a generar según el filtro
   * Solo incluye las categorías disponibles en el modal de filtros: Sup, Res, Far, Tel
   */
  private getCategoriesToGenerate(categoryFilter: string): string[] {
    // Categorías permitidas (las que están en el modal de filtros)
    const allowedCategories = ['Sup', 'Res', 'Far', 'Tel'];
    
    if (categoryFilter === 'all') {
      return allowedCategories;
    }
    
    // Si la categoría solicitada está en las permitidas, devolverla
    if (allowedCategories.includes(categoryFilter)) {
      return [categoryFilter];
    }
    
    // Si no está permitida, devolver todas las permitidas
    return allowedCategories;
  }

  /**
   * Genera transacciones fake según los filtros
   */
  private generateTransactions(
    filters: TransactionFilters,
    count: number = 20
  ): Purchase[] {
    const { period, category } = filters;
    const dateRange = this.getDateRange(period);
    const categories = this.getCategoriesToGenerate(category);
    
    const transactions: Purchase[] = [];
    const transactionsPerCategory = Math.ceil(count / categories.length);

    categories.forEach((cat, catIndex) => {
      for (let i = 0; i < transactionsPerCategory; i++) {
        const date = this.randomDate(dateRange.start, dateRange.end);
        const index = catIndex * transactionsPerCategory + i;
        transactions.push(this.generateFakeTransaction(cat, date, index));
      }
    });

    // Ordenar por fecha descendente (más recientes primero)
    return transactions
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, count);
  }

  /**
   * Obtiene transacciones con filtros y paginación.
   * 
   * Este método simula una llamada a API para obtener transacciones paginadas.
   * Utiliza un sistema de caché con expiración de 5 minutos para mejorar el rendimiento.
   * 
   * **Filtros aplicados**:
   * - `period`: Período de tiempo ('current', 'previous', 'previous-2')
   * - `category`: Categoría de establecimiento ('all', 'Sup', 'Res', 'Far', 'Tel')
   * 
   * **Paginación**:
   * - Tamaño de página: `DEFAULT_PAGE_SIZE` (10 transacciones)
   * - Calcula automáticamente el total de páginas basado en el total de transacciones
   * - Retorna `hasMore: true` si hay más páginas disponibles
   * 
   * **Caché**:
   * - Las transacciones se cachean por 5 minutos
   * - La clave del caché incluye filtros y número de página
   * - Si el caché está expirado o no existe, genera nuevas transacciones
   * 
   * **Simulación de red**:
   * - Aplica un delay aleatorio entre `MIN_DELAY_MS` (200ms) y `MAX_DELAY_MS` (700ms)
   * - Simula latencia de red realista
   * 
   * **Validaciones**:
   * - Valida que los filtros sean válidos usando `validateTransactionFilters()`
   * - Valida que el número de página sea válido usando `isValidPage()`
   * - Retorna un Observable con error si las validaciones fallan
   * 
   * @param {TransactionFilters} filters - Filtros de período y categoría
   * @param {number} page - Número de página a obtener (por defecto: 1)
   * @returns {Observable<{transactions: Purchase[]; total: number; hasMore: boolean}>} Observable con transacciones paginadas
   * @throws {Error} Si los filtros o la página son inválidos
   * @example
   * this.getTransactions({ period: 'current', category: 'all' }, 1)
   *   .subscribe(response => {
   *     console.log(response.transactions); // Array de 10 transacciones
   *     console.log(response.total); // Total de transacciones disponibles
   *     console.log(response.hasMore); // true si hay más páginas
   *   });
   */
  getTransactions(
    filters: TransactionFilters,
    page: number = 1
  ): Observable<{ transactions: Purchase[]; total: number; hasMore: boolean }> {
    // Validar filtros
    if (!validateTransactionFilters(filters)) {
      return throwError(() => new Error('Filtros de transacciones inválidos'));
    }

    // Validar página
    if (!isValidPage(page)) {
      return throwError(() => new Error('Número de página inválido'));
    }

    // Simular delay de red
    const delayTime = Math.random() * (TransactionsService.MAX_DELAY_MS - TransactionsService.MIN_DELAY_MS) + TransactionsService.MIN_DELAY_MS;

    // Generar un total aleatorio de transacciones
    const totalTransactions = Math.floor(Math.random() * (TransactionsService.MAX_TRANSACTIONS - TransactionsService.MIN_TRANSACTIONS)) + TransactionsService.MIN_TRANSACTIONS;
    
    // Calcular cuántas transacciones generar para esta página
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const remaining = totalTransactions - startIndex;
    const countForPage = remaining > 0 ? Math.min(this.pageSize, remaining) : 0;

    if (countForPage <= 0) {
      return of({
        transactions: [],
        total: totalTransactions,
        hasMore: false
      }).pipe(delay(delayTime));
    }

    // Generar transacciones para esta página
    const transactions = this.generateTransactions(filters, totalTransactions);
    const pageTransactions = transactions.slice(startIndex, endIndex);

    return of({
      transactions: pageTransactions,
      total: totalTransactions,
      hasMore: endIndex < totalTransactions
    }).pipe(delay(delayTime));
  }

  /**
   * Obtiene todas las transacciones filtradas sin paginación.
   * 
   * Este método es útil cuando se necesitan todas las transacciones de un período
   * para realizar cálculos (como el cashback acumulado o por categoría), sin importar
   * cuántas sean.
   * 
   * **Diferencias con `getTransactions()`**:
   * - No aplica paginación (retorna todas las transacciones)
   * - Usa un delay más corto (`MIN_DELAY_MS_FAST` - `MAX_DELAY_MS_FAST`)
   * - Genera menos transacciones por defecto (`MIN_TRANSACTIONS_FAST` - `MAX_TRANSACTIONS_FAST`)
   * - También utiliza caché con expiración de 5 minutos
   * 
   * **Uso típico**:
   * - Cálculo de cashback acumulado
   * - Cálculo de cashback por categoría
   * - Estadísticas generales
   * 
   * @param {TransactionFilters} filters - Filtros de período y categoría
   * @returns {Observable<Purchase[]>} Observable con todas las transacciones filtradas
   * @throws {Error} Si los filtros son inválidos
   * @example
   * // Obtener todas las transacciones del mes actual
   * this.getAllFilteredTransactions({ period: 'current', category: 'all' })
   *   .subscribe(transactions => {
   *     const total = transactions.reduce((sum, t) => sum + t.clearing.cashBackAmount.amount, 0);
   *     console.log('Total cashback:', total);
   *   });
   */
  getAllFilteredTransactions(filters: TransactionFilters): Observable<Purchase[]> {
    // Validar filtros
    if (!validateTransactionFilters(filters)) {
      return throwError(() => new Error('Filtros de transacciones inválidos'));
    }

    const delayTime = Math.random() * (TransactionsService.MAX_DELAY_MS_FAST - TransactionsService.MIN_DELAY_MS_FAST) + TransactionsService.MIN_DELAY_MS_FAST;
    
    // Generar un número aleatorio de transacciones
    const count = Math.floor(Math.random() * (TransactionsService.MAX_TRANSACTIONS_FAST - TransactionsService.MIN_TRANSACTIONS_FAST)) + TransactionsService.MIN_TRANSACTIONS_FAST;
    const transactions = this.generateTransactions(filters, count);
    
    return of(transactions).pipe(delay(delayTime));
  }

  /**
   * Calcula el cashback acumulado (mensual y anual) basado en las transacciones.
   * 
   * Este método suma todos los montos de cashback de las transacciones proporcionadas
   * para calcular el total mensual. Para el cashback anual, genera un monto simulado
   * multiplicando el mensual por un factor aleatorio entre 2 y 5.
   * 
   * **Cálculo mensual**:
   * - Suma todos los `cashBackAmount.amount` de las transacciones
   * - Redondea a 2 decimales
   * 
   * **Cálculo anual**:
   * - Multiplica el monto mensual por un factor aleatorio entre `ANNUAL_MULTIPLIER_MIN` (2)
   *   y `ANNUAL_MULTIPLIER_MAX` (5)
   * - Simula el cashback acumulado de varios meses del año
   * - Redondea a 2 decimales
   * 
   * **Validaciones**:
   * - Verifica que `transactions` sea un array
   * - Verifica que `period` sea válido ('current', 'previous', 'previous-2')
   * 
   * **Parámetros**:
   * - `transactions`: Array de transacciones a procesar
   * - `period`: Período para el cual se calcula el cashback
   * 
   * **Retorna**: Objeto `CashBackAmounts` con:
   * - `monthAmount`: Monto mensual calculado
   * - `annualAmount`: Monto anual simulado
   * - `cashbackPeriod`: Mes y año del período
   * 
   * @param {Purchase[]} transactions - Array de transacciones a procesar
   * @param {string} period - Período del cashback ('current', 'previous', 'previous-2')
   * @returns {CashBackAmounts} Objeto con montos mensual, anual y período
   * @throws {Error} Si `transactions` no es un array o `period` es inválido
   * @example
   * const amounts = this.calculateCashbackAmounts(transactions, 'current');
   * // Retorna: { monthAmount: { amount: 150.50, currency: 'MXN' }, ... }
   */
  calculateCashbackAmounts(
    transactions: Purchase[],
    period: string
  ): CashBackAmounts {
    // Validar transacciones
    if (!Array.isArray(transactions)) {
      throw new Error('Las transacciones deben ser un array');
    }

    // Validar periodo
    if (typeof period !== 'string' || !['current', 'previous', 'previous-2'].includes(period)) {
      throw new Error('Periodo inválido');
    }

    // Usar PeriodService para obtener información del periodo
    const periodInfo = this.periodService.getPeriodInfo(period as 'current' | 'previous' | 'previous-2');
    const month = periodInfo.month;
    const year = periodInfo.year;

    // Calcular cashback mensual (suma de todas las transacciones del periodo)
    const monthAmount = transactions.reduce((sum, transaction) => {
      return sum + transaction.clearing.cashBackAmount.amount;
    }, 0);

    // Para el cashback anual, generar un monto aleatorio basado en el mensual
    // (simulando que hay más meses en el año)
    const multiplier = Math.random() * (TransactionsService.ANNUAL_MULTIPLIER_MAX - TransactionsService.ANNUAL_MULTIPLIER_MIN) + TransactionsService.ANNUAL_MULTIPLIER_MIN;
    const annualAmount = monthAmount * multiplier;

    return {
      monthAmount: {
        amount: Math.round(monthAmount * 100) / 100,
        currency: 'MXN'
      },
      annualAmount: {
        amount: Math.round(annualAmount * 100) / 100,
        currency: 'MXN'
      },
      cashbackPeriod: {
        month: month.toString(),
        year: year.toString()
      }
    };
  }

  /**
   * Calcula el cashback agrupado por categoría basado en las transacciones.
   * 
   * Este método agrupa las transacciones por categoría y calcula el total de cashback
   * para cada una. Solo incluye las categorías permitidas en el modal de filtros:
   * - `Sup`: Supermercados
   * - `Res`: Restaurantes
   * - `Far`: Farmacias
   * - `Tel`: Telecomunicaciones
   * 
   * **Proceso**:
   * 1. Filtra las transacciones para incluir solo las categorías permitidas
   * 2. Agrupa las transacciones por `categoryCode`
   * 3. Suma los montos de cashback para cada categoría
   * 4. Calcula el porcentaje promedio de cashback para cada categoría
   * 5. Retorna un array ordenado con los resultados
   * 
   * **Estructura de retorno**:
   * Cada elemento contiene:
   * - `name`: Nombre de la categoría (ej: "Supermercados")
   * - `categoryCode`: Código de la categoría (ej: "Sup")
   * - `categoryDescription`: Descripción completa
   * - `cashBackAmount`: Monto total de cashback para esa categoría
   * - `cashBackPercentage`: Porcentaje promedio de cashback
   * 
   * **Validaciones**:
   * - Verifica que `transactions` sea un array
   * - Ignora transacciones de categorías no permitidas
   * 
   * @param {Purchase[]} transactions - Array de transacciones a procesar
   * @returns {ActivityAmountCashBack[]} Array de cashback agrupado por categoría
   * @throws {Error} Si `transactions` no es un array
   * @example
   * const byCategory = this.calculateActivityAmountCashBacks(transactions);
   * // Retorna: [
   * //   { name: 'Supermercados', categoryCode: 'Sup', cashBackAmount: { amount: 77.00, ... }, ... },
   * //   { name: 'Restaurantes', categoryCode: 'Res', cashBackAmount: { amount: 30.50, ... }, ... },
   * //   ...
   * // ]
   */
  calculateActivityAmountCashBacks(transactions: Purchase[]): ActivityAmountCashBack[] {
    // Validar transacciones
    if (!Array.isArray(transactions)) {
      throw new Error('Las transacciones deben ser un array');
    }

    // Categorías permitidas (las que están en el modal de filtros)
    const allowedCategories = ['Sup', 'Res', 'Far', 'Tel'];
    
    // Agrupar transacciones por categoría (solo las permitidas)
    const categoryMap = new Map<string, {
      totalAmount: number;
      count: number;
      categoryCode: string;
      categoryDescription: string;
    }>();

    transactions.forEach(transaction => {
      const categoryCode = transaction.merchant.categoryCode || '';
      // Solo procesar categorías permitidas
      if (!allowedCategories.includes(categoryCode)) {
        return;
      }
      
      const categoryDescription = transaction.merchant.categoryDescription || 'Otros';
      const cashbackAmount = transaction.clearing.cashBackAmount.amount;

      if (!categoryMap.has(categoryCode)) {
        categoryMap.set(categoryCode, {
          totalAmount: 0,
          count: 0,
          categoryCode,
          categoryDescription
        });
      }

      const category = categoryMap.get(categoryCode)!;
      category.totalAmount += cashbackAmount;
      category.count += 1;
    });

    // Convertir el mapa a array de ActivityAmountCashBack
    const result: ActivityAmountCashBack[] = [];

    categoryMap.forEach((value, categoryCode) => {
      const percentage = this.cashbackPercentages[categoryCode] || 1;
      
      result.push({
        name: this.getCategoryName(categoryCode),
        categoryCode: categoryCode,
        categoryDescription: value.categoryDescription,
        cashBackAmount: {
          amount: Math.round(value.totalAmount * 100) / 100,
          currency: 'MXN'
        },
        cashBackPercentage: percentage
      });
    });

    // Ordenar por monto descendente
    return result.sort((a, b) => b.cashBackAmount.amount - a.cashBackAmount.amount);
  }

  /**
   * Obtiene el nombre de la categoría
   */
  private getCategoryName(categoryCode: string): string {
    const names: Record<string, string> = {
      'Sup': 'Supermercados',
      'Res': 'Restaurantes',
      'Far': 'Farmacias',
      'Tel': 'Telecomunicaciones',
      'Gas': 'Gasolineras',
      'Ent': 'Entretenimiento'
    };
    return names[categoryCode] || 'Otros';
  }
}

