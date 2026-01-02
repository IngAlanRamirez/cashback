import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type Language = 'es' | 'en';

export interface Translations {
  common: {
    cashback: string;
    resumen: string;
    promociones: string;
    filtrar: string;
    cancelar: string;
    aplicar: string;
    cerrar: string;
    continuar: string;
    verMas: string;
    conocerMas: string;
    cargando: string;
    volver: string;
  };
  banner: {
    message: string;
  };
  card: {
    enTuTarjeta: string;
    seleccionarTarjeta: string;
  };
  cashback: {
    acumuladoMensual: string;
    acumuladoAnual: string;
    mensualPorEstablecimiento: string;
    cargandoAcumulado: string;
    cargandoPorEstablecimiento: string;
  };
  transactions: {
    movimientos: string;
    montosEnMXN: string;
    filtrarMovimientos: string;
    noHayMovimientos: string;
    cargandoMas: string;
    cargandoTransacciones: string;
    disclaimer: string;
  };
  filters: {
    periodo: string;
    establecimiento: string;
    todos: string;
    supermercados: string;
    restaurantes: string;
    farmacias: string;
    telecomunicaciones: string;
    descripcion: string;
  };
  promotions: {
    exclusivas: string;
    rockstarRewards: string;
    verMasPromociones: string;
    estasPorSalir: string;
    disclaimerExit: string;
  };
  errors: {
    errorCargarDatos: string;
    errorCargarTransacciones: string;
    errorCalculos: string;
  };
  categories: {
    supermercados: string;
    restaurantes: string;
    farmacias: string;
    telecomunicaciones: string;
  };
}

/**
 * Servicio de traducción para internacionalización (i18n)
 * 
 * Este servicio maneja la carga y acceso a traducciones en múltiples idiomas.
 * Por defecto usa español (es), pero puede cambiarse a inglés (en) o extenderse
 * para soportar más idiomas.
 * 
 * **Uso**:
 * ```typescript
 * // En un componente
 * constructor(private translate: TranslationService) {}
 * 
 * // En el template
 * {{ translate.t('common.cashback') }}
 * 
 * // O usando el método en el componente
 * const text = this.translate.t('common.cashback');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);
  
  // Idioma actual (por defecto español)
  private currentLanguage = signal<Language>('es');
  
  // Traducciones cargadas
  private translationsCache = new Map<Language, Translations>();
  private translations$ = signal<Translations | null>(null);
  
  /**
   * Traducciones por defecto en español (para uso inmediato mientras se cargan del archivo)
   */
  private readonly defaultTranslations: Translations = {
    common: {
      cashback: 'Cashback',
      resumen: 'Resumen',
      promociones: 'Promociones',
      filtrar: 'Filtrar',
      cancelar: 'Cancelar',
      aplicar: 'Aplicar filtros',
      cerrar: 'Cerrar',
      continuar: 'Continuar',
      verMas: 'Ver más',
      conocerMas: 'Conocer más',
      cargando: 'Cargando...',
      volver: 'Volver atrás'
    },
    banner: {
      message: 'Recuerda que el Cashback de tus compras será depositado en tu cuenta RockStar antes del día 15 de cada mes.'
    },
    card: {
      enTuTarjeta: 'En tu tarjeta',
      seleccionarTarjeta: 'Seleccionar tarjeta'
    },
    cashback: {
      acumuladoMensual: 'Acumulado mensual',
      acumuladoAnual: 'Acumulado anual',
      mensualPorEstablecimiento: 'Mensual por establecimiento',
      cargandoAcumulado: 'Cargando cashback acumulado...',
      cargandoPorEstablecimiento: 'Cargando cashback por establecimiento...'
    },
    transactions: {
      movimientos: 'Movimientos',
      montosEnMXN: 'Montos en MXN',
      filtrarMovimientos: 'Filtrar movimientos',
      noHayMovimientos: 'No hay movimientos disponibles',
      cargandoMas: 'Cargando más transacciones...',
      cargandoTransacciones: 'Cargando transacciones...',
      disclaimer: 'Tus compras se reflejarán en 24 a 48 h hábiles.'
    },
    filters: {
      periodo: 'Periodo',
      establecimiento: 'Establecimiento',
      todos: 'Todos',
      supermercados: 'Supermercados',
      restaurantes: 'Restaurantes',
      farmacias: 'Farmacias',
      telecomunicaciones: 'Telecomunicaciones',
      descripcion: 'Selecciona un período y un tipo de establecimiento para filtrar tus movimientos de cashback'
    },
    promotions: {
      exclusivas: 'Promociones exclusivas',
      rockstarRewards: 'RockStar Rewards',
      verMasPromociones: 'Ver más promociones de',
      estasPorSalir: 'Estás por salir del sitio',
      disclaimerExit: 'Por tu seguridad, cerraremos tu sesión en el sitio para dirigirte al sitio de promociones RockStar Cashback.'
    },
    errors: {
      errorCargarDatos: 'Error al cargar los datos. Por favor, intenta de nuevo.',
      errorCargarTransacciones: 'Error al cargar las transacciones. Por favor, intenta de nuevo.',
      errorCalculos: 'Error al calcular el cashback. Por favor, intenta de nuevo.'
    },
    categories: {
      supermercados: 'Supermercados',
      restaurantes: 'Restaurantes',
      farmacias: 'Farmacias',
      telecomunicaciones: 'Telecomunicaciones'
    }
  };
  
  /**
   * Idioma actual como signal readonly
   */
  readonly language = this.currentLanguage.asReadonly();
  
  /**
   * Traducciones actuales como signal readonly
   */
  readonly translations = this.translations$.asReadonly();
  
  /**
   * Constructor - Inicializa con traducciones por defecto y carga las del archivo
   */
  constructor() {
    // Inicializar con traducciones por defecto inmediatamente
    this.translations$.set(this.defaultTranslations);
    // Cargar traducciones del archivo en segundo plano
    this.loadLanguage('es').subscribe();
  }
  
  /**
   * Carga las traducciones para un idioma específico
   * 
   * @param lang - Idioma a cargar ('es' o 'en')
   * @returns Observable que emite cuando las traducciones están cargadas
   */
  loadLanguage(lang: Language): Observable<Translations> {
    // Si ya están en caché, usarlas directamente
    if (this.translationsCache.has(lang)) {
      const cached = this.translationsCache.get(lang)!;
      this.translations$.set(cached);
      this.currentLanguage.set(lang);
      return of(cached);
    }
    
    // Cargar desde el archivo JSON
    return this.http.get<Translations>(`/assets/i18n/${lang}.json`)
      .pipe(
        map((translations) => {
          // Guardar en caché
          this.translationsCache.set(lang, translations);
          this.translations$.set(translations);
          this.currentLanguage.set(lang);
          return translations;
        }),
        catchError((error) => {
          // Solo mostrar error en desarrollo
          if (!environment.production) {
            console.error(`Error loading translations for ${lang}:`, error);
          }
          // Si falla, usar traducciones por defecto y mantenerlas
          if (lang === 'es') {
            // Si es español y falla, mantener las traducciones por defecto
            this.translations$.set(this.defaultTranslations);
            return of(this.defaultTranslations);
          }
          // Si es otro idioma y falla, intentar cargar español
          return this.loadLanguage('es');
        }),
        shareReplay(1)
      );
  }
  
  /**
   * Obtiene una traducción por su clave
   * 
   * La clave debe seguir el formato 'seccion.clave', por ejemplo:
   * - 'common.cashback'
   * - 'transactions.movimientos'
   * - 'filters.periodo'
   * 
   * @param key - Clave de la traducción (formato: 'seccion.clave')
   * @param params - Parámetros opcionales para interpolación (futuro)
   * @returns Texto traducido o la clave si no se encuentra
   * 
   * @example
   * this.translate.t('common.cashback') // Retorna: "Cashback"
   * this.translate.t('transactions.movimientos') // Retorna: "Movimientos"
   */
  t(key: string, params?: Record<string, string | number>): string {
    // Usar traducciones actuales o las por defecto
    const translations = this.translations$() || this.defaultTranslations;
    
    // Dividir la clave en sección y subclave
    const parts = key.split('.');
    if (parts.length !== 2) {
      // Solo mostrar warning en desarrollo
      if (!environment.production) {
        console.warn(`Invalid translation key format: ${key}. Expected format: 'section.key'`);
      }
      return key;
    }
    
    const [section, subKey] = parts;
    
    // Acceder a la traducción de forma segura
    const sectionObj = (translations as any)[section];
    if (!sectionObj || typeof sectionObj !== 'object') {
      // Solo mostrar warning en desarrollo
      if (!environment.production) {
        console.warn(`Translation section '${section}' not found for key: ${key}`);
      }
      return key;
    }
    
    const translation = sectionObj[subKey];
    if (typeof translation !== 'string') {
      // Solo mostrar warning en desarrollo
      if (!environment.production) {
        console.warn(`Translation key '${key}' not found or is not a string`);
      }
      return key;
    }
    
    // Interpolación de parámetros (si se implementa en el futuro)
    if (params) {
      return this.interpolate(translation, params);
    }
    
    return translation;
  }
  
  /**
   * Interpola parámetros en una cadena de traducción
   * 
   * @param template - Plantilla con placeholders {{param}}
   * @param params - Objeto con los valores a interpolar
   * @returns Cadena con parámetros interpolados
   * 
   * @example
   * this.interpolate('Hello {{name}}', { name: 'World' }) // Retorna: "Hello World"
   */
  private interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }
  
  /**
   * Cambia el idioma actual
   * 
   * @param lang - Nuevo idioma ('es' o 'en')
   * @returns Observable que emite cuando el idioma está cargado
   */
  setLanguage(lang: Language): Observable<Translations> {
    if (this.currentLanguage() === lang && this.translations$()) {
      return of(this.translations$()!);
    }
    return this.loadLanguage(lang);
  }
  
  /**
   * Obtiene el idioma actual
   * 
   * @returns Idioma actual ('es' o 'en')
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }
}

