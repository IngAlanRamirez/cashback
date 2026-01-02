import { TransactionFilters } from '../services/transactions.service';
import { CashbackData } from '../services/cashback-data.service';
import { Product } from '../models/product';
import { CashBackAmounts } from '../models/cashback-amounts';
import { ActivityAmountCashBack } from '../models/activity-amount-cashback';
import { Purchase } from '../models/purchase';
import { Promotion } from '../models/promotion';
import { CashbackPeriod, CategoryCode } from '../models/enums';

/**
 * Valida que un periodo sea válido
 */
export function isValidPeriod(period: string): period is 'current' | 'previous' | 'previous-2' {
  return period === CashbackPeriod.CURRENT || 
         period === CashbackPeriod.PREVIOUS || 
         period === CashbackPeriod.PREVIOUS_2;
}

/**
 * Valida que una categoría sea válida
 */
export function isValidCategory(category: string): boolean {
  const validCategories = [
    CategoryCode.ALL,
    CategoryCode.SUPERMARKET,
    CategoryCode.RESTAURANT,
    CategoryCode.PHARMACY,
    CategoryCode.TELECOMMUNICATIONS
  ];
  return validCategories.includes(category as CategoryCode);
}

/**
 * Valida los filtros de transacciones
 */
export function validateTransactionFilters(filters: unknown): filters is TransactionFilters {
  if (!filters || typeof filters !== 'object') {
    return false;
  }

  const f = filters as Record<string, unknown>;
  
  if (typeof f['period'] !== 'string' || !isValidPeriod(f['period'] as string)) {
    return false;
  }

  if (typeof f['category'] !== 'string' || !isValidCategory(f['category'] as string)) {
    return false;
  }

  return true;
}

/**
 * Valida que un número de página sea válido
 */
export function isValidPage(page: unknown): page is number {
  return typeof page === 'number' && page > 0 && Number.isInteger(page);
}

/**
 * Valida que un Product tenga la estructura mínima requerida
 */
export function isValidProduct(product: unknown): product is Product {
  if (!product || typeof product !== 'object') {
    return false;
  }

  const p = product as Record<string, unknown>;
  
  // Validar que tenga al menos type y product.name
  if (typeof p['type'] !== 'string') {
    return false;
  }

  if (p['product'] && typeof p['product'] === 'object') {
    const prod = p['product'] as Record<string, unknown>;
    if (typeof prod['name'] !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Valida que CashBackAmounts tenga la estructura mínima requerida
 */
export function isValidCashbackAmounts(amounts: unknown): amounts is CashBackAmounts {
  if (!amounts || typeof amounts !== 'object') {
    return false;
  }

  const a = amounts as Record<string, unknown>;
  
  // Validar monthAmount
  if (!a['monthAmount'] || typeof a['monthAmount'] !== 'object') {
    return false;
  }
  const month = a['monthAmount'] as Record<string, unknown>;
  if (typeof month['amount'] !== 'number' || typeof month['currency'] !== 'string') {
    return false;
  }

  // Validar annualAmount
  if (!a['annualAmount'] || typeof a['annualAmount'] !== 'object') {
    return false;
  }
  const annual = a['annualAmount'] as Record<string, unknown>;
  if (typeof annual['amount'] !== 'number' || typeof annual['currency'] !== 'string') {
    return false;
  }

  return true;
}

/**
 * Valida que un array de ActivityAmountCashBack sea válido
 */
export function isValidActivityAmountCashBacks(items: unknown): items is ActivityAmountCashBack[] {
  if (!Array.isArray(items)) {
    return false;
  }

  // Validar que todos los elementos tengan la estructura mínima
  return items.every(item => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    const i = item as Record<string, unknown>;
    return (
      typeof i['name'] === 'string' &&
      typeof i['categoryCode'] === 'string' &&
      i['cashBackAmount'] &&
      typeof i['cashBackAmount'] === 'object'
    );
  });
}

/**
 * Valida que un array de Purchase sea válido
 */
export function isValidPurchases(purchases: unknown): purchases is Purchase[] {
  if (!Array.isArray(purchases)) {
    return false;
  }

  // Validar que todos los elementos tengan la estructura mínima
  return purchases.every(purchase => {
    if (!purchase || typeof purchase !== 'object') {
      return false;
    }
    const p = purchase as Record<string, unknown>;
    return (
      typeof p['cardTransactionId'] === 'string' &&
      p['amount'] &&
      typeof p['amount'] === 'object' &&
      p['clearing'] &&
      typeof p['clearing'] === 'object' &&
      p['merchant'] &&
      typeof p['merchant'] === 'object'
    );
  });
}

/**
 * Valida que un array de Promotion sea válido
 */
export function isValidPromotions(promotions: unknown): promotions is Promotion[] {
  if (!Array.isArray(promotions)) {
    return false;
  }

  // Validar que todos los elementos tengan la estructura mínima
  return promotions.every(promotion => {
    if (!promotion || typeof promotion !== 'object') {
      return false;
    }
    const p = promotion as Record<string, unknown>;
    return typeof p['promotionId'] === 'string';
  });
}

/**
 * Valida la estructura completa de CashbackData
 */
export function isValidCashbackData(data: unknown): data is CashbackData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const d = data as Record<string, unknown>;
  
  // Validar product
  if (!isValidProduct(d['product'])) {
    return false;
  }

  // Validar products (array)
  if (!Array.isArray(d['products'])) {
    return false;
  }
  if (!(d['products'] as unknown[]).every(p => isValidProduct(p))) {
    return false;
  }

  // Validar cashbackAmounts
  if (!isValidCashbackAmounts(d['cashbackAmounts'])) {
    return false;
  }

  // Validar activityAmountCashBacks (array)
  if (!isValidActivityAmountCashBacks(d['activityAmountCashBacks'])) {
    return false;
  }

  // Validar purchases (array) - opcional, puede estar vacío
  if (d['purchases'] !== undefined && !isValidPurchases(d['purchases'])) {
    return false;
  }

  // Validar promotions (array) - opcional
  if (d['promotions'] !== undefined && !isValidPromotions(d['promotions'])) {
    return false;
  }

  // Validar rockStarRewards (array) - opcional
  if (d['rockStarRewards'] !== undefined && !isValidPromotions(d['rockStarRewards'])) {
    return false;
  }

  return true;
}

