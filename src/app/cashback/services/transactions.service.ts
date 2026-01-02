import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Purchase } from '../models/purchase';
import { CashBackAmounts } from '../models/cashback-amounts';
import { ActivityAmountCashBack } from '../models/activity-amount-cashback';

export interface TransactionFilters {
  period: string;
  category: string;
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
  private readonly pageSize = 10;
  private readonly cacheExpirationTime = 5 * 60 * 1000; // 5 minutos en milisegundos
  
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
   * Genera una transacción fake
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
   */
  private getDateRange(period: string): { start: Date; end: Date } {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    switch (period) {
      case 'current':
        // Mes actual
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
        };
      case 'previous':
        // Mes anterior
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return {
          start: new Date(previousYear, previousMonth, 1),
          end: new Date(previousYear, previousMonth + 1, 0, 23, 59, 59)
        };
      case 'previous-2':
        // Mes anterior al anterior
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const previousMonth2 = prevMonth === 0 ? 11 : prevMonth - 1;
        const previousYear2 = prevMonth === 0 ? prevYear - 1 : prevYear;
        return {
          start: new Date(previousYear2, previousMonth2, 1),
          end: new Date(previousYear2, previousMonth2 + 1, 0, 23, 59, 59)
        };
      default:
        // Por defecto, mes actual
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
        };
    }
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
   * Obtiene transacciones con filtros y paginación
   */
  getTransactions(
    filters: TransactionFilters,
    page: number = 1
  ): Observable<{ transactions: Purchase[]; total: number; hasMore: boolean }> {
    // Simular delay de red
    const delayTime = Math.random() * 500 + 200; // 200-700ms

    // Generar un total aleatorio de transacciones (entre 15 y 50)
    const totalTransactions = Math.floor(Math.random() * 35) + 15;
    
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
   * Obtiene todas las transacciones filtradas (sin paginación, para filtrado completo)
   */
  getAllFilteredTransactions(filters: TransactionFilters): Observable<Purchase[]> {
    const delayTime = Math.random() * 300 + 100; // 100-400ms
    
    // Generar un número aleatorio de transacciones
    const count = Math.floor(Math.random() * 30) + 10; // 10-40 transacciones
    const transactions = this.generateTransactions(filters, count);
    
    return of(transactions).pipe(delay(delayTime));
  }

  /**
   * Calcula el cashback acumulado (mensual y anual) basado en las transacciones
   */
  calculateCashbackAmounts(
    transactions: Purchase[],
    period: string
  ): CashBackAmounts {
    // Calcular el mes y año del periodo
    const now = new Date();
    const currentYear = now.getFullYear();
    let month: number;
    let year: number;

    switch (period) {
      case 'current':
        month = now.getMonth() + 1; // Mes actual (1-12)
        year = currentYear;
        break;
      case 'previous':
        // Mes anterior
        const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        month = previousMonth + 1;
        year = now.getMonth() === 0 ? currentYear - 1 : currentYear;
        break;
      case 'previous-2':
        // Mes anterior al anterior
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;
        const previousMonth2 = prevMonth === 0 ? 11 : prevMonth - 1;
        month = previousMonth2 + 1;
        year = prevMonth === 0 ? prevYear - 1 : prevYear;
        break;
      default:
        month = now.getMonth() + 1;
        year = currentYear;
    }

    // Calcular cashback mensual (suma de todas las transacciones del periodo)
    const monthAmount = transactions.reduce((sum, transaction) => {
      return sum + transaction.clearing.cashBackAmount.amount;
    }, 0);

    // Para el cashback anual, generar un monto aleatorio basado en el mensual
    // (simulando que hay más meses en el año)
    const annualAmount = monthAmount * (Math.random() * 3 + 2); // Entre 2x y 5x el mensual

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
   * Calcula el cashback por categoría basado en las transacciones
   * Solo incluye las categorías permitidas: Sup, Res, Far, Tel
   */
  calculateActivityAmountCashBacks(transactions: Purchase[]): ActivityAmountCashBack[] {
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

