import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export type PeriodType = 'current' | 'previous' | 'previous-2';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodInfo {
  month: number; // 1-12
  year: number;
  monthName: string; // Nombre del mes en español capitalizado
  dateRange: DateRange;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodService {
  /**
   * Obtiene el rango de fechas según el periodo
   */
  getDateRange(period: PeriodType): DateRange {
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
   * Obtiene información completa del periodo (mes, año, nombre, rango de fechas)
   */
  getPeriodInfo(period: PeriodType): PeriodInfo {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const dateRange = this.getDateRange(period);

    let month: number;
    let year: number;
    let monthDate: Date;

    switch (period) {
      case 'current':
        month = currentMonth + 1; // Mes actual (1-12)
        year = currentYear;
        monthDate = new Date(currentYear, currentMonth, 1);
        break;
      case 'previous':
        // Mes anterior
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        month = previousMonth + 1;
        year = currentMonth === 0 ? currentYear - 1 : currentYear;
        monthDate = new Date(year, previousMonth, 1);
        break;
      case 'previous-2':
        // Mes anterior al anterior
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const previousMonth2 = prevMonth === 0 ? 11 : prevMonth - 1;
        month = previousMonth2 + 1;
        year = prevMonth === 0 ? prevYear - 1 : prevYear;
        monthDate = new Date(year, previousMonth2, 1);
        break;
      default:
        month = currentMonth + 1;
        year = currentYear;
        monthDate = new Date(currentYear, currentMonth, 1);
    }

    const monthName = format(monthDate, 'MMMM', { locale: es });
    const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return {
      month,
      year,
      monthName: monthNameCapitalized,
      dateRange
    };
  }

  /**
   * Obtiene los periodos disponibles con sus etiquetas formateadas
   */
  getAvailablePeriods(): Array<{ label: string; value: PeriodType }> {
    const current = this.getPeriodInfo('current');
    const previous = this.getPeriodInfo('previous');
    const previous2 = this.getPeriodInfo('previous-2');

    return [
      { label: current.monthName, value: 'current' },
      { label: previous.monthName, value: 'previous' },
      { label: previous2.monthName, value: 'previous-2' }
    ];
  }
}

