/**
 * Enums y tipos para mejorar type safety en toda la aplicación
 */

/**
 * Períodos disponibles para filtrar transacciones
 */
export enum CashbackPeriod {
  CURRENT = 'current',
  PREVIOUS = 'previous',
  PREVIOUS_2 = 'previous-2'
}

/**
 * Códigos de categoría de establecimientos
 */
export enum CategoryCode {
  ALL = 'all',
  SUPERMARKET = 'Sup',
  RESTAURANT = 'Res',
  PHARMACY = 'Far',
  TELECOMMUNICATIONS = 'Tel',
  GAS_STATION = 'Gas',
  ENTERTAINMENT = 'Ent'
}

/**
 * Tipos de tarjeta
 */
export enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

/**
 * Tabs disponibles en la página de cashback
 */
export enum CashbackTab {
  RESUMEN = 'resumen',
  PROMOCIONES = 'promo'
}

/**
 * Estados de carga para operaciones asíncronas
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

