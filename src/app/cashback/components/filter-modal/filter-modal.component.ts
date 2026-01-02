import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, 
  restaurantOutline, 
  medicalOutline, 
  callOutline 
} from 'ionicons/icons';
import { PeriodService } from '../../services/period.service';
import { TranslationService } from '../../i18n/translation.service';

export interface FilterPeriod {
  label: string;
  value: string;
}

export interface FilterCategory {
  label: string;
  value: string;
  icon?: string;
}

const MODAL_MAX_HEIGHT = 407;
const BREAKPOINT_OFFSET = 0.15;

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon
  ]
})
export class FilterModalComponent {
  private periodService = inject(PeriodService);
  readonly translate = inject(TranslationService);
  
  @Input() 
  set isOpen(value: boolean) {
    this._isOpen.set(value);
    // Cuando se abre el modal, inicializar con los filtros actuales si se proporcionan
    if (value && this.currentPeriod && this.currentCategory) {
      this.selectedPeriod.set(this.currentPeriod);
      this.selectedCategory.set(this.currentCategory);
    }
  }
  get isOpen(): boolean {
    return this._isOpen();
  }
  private _isOpen = signal<boolean>(false);

  @Input() currentPeriod: string = 'current';
  @Input() currentCategory: string = 'all';

  @Output() close = new EventEmitter<void>();
  @Output() filtersApplied = new EventEmitter<{ period: string; category: string }>();

  selectedPeriod = signal<string>('current');
  selectedCategory = signal<string>('all');

  /**
   * Calcula los periodos dinámicamente basados en la fecha actual
   * Usa PeriodService para centralizar la lógica
   */
  readonly periods = computed<FilterPeriod[]>(() => {
    return this.periodService.getAvailablePeriods();
  });

  /**
   * Categorías disponibles para filtrar
   * Las etiquetas se obtienen del servicio de traducción
   */
  readonly categories = computed<FilterCategory[]>(() => [
    { label: this.translate.t('filters.todos'), value: 'all' },
    { label: this.translate.t('filters.supermercados'), value: 'Sup', icon: 'cart-outline' },
    { label: this.translate.t('filters.restaurantes'), value: 'Res', icon: 'restaurant-outline' },
    { label: this.translate.t('filters.farmacias'), value: 'Far', icon: 'medical-outline' },
    { label: this.translate.t('filters.telecomunicaciones'), value: 'Tel', icon: 'call-outline' }
  ]);

  modalBreakpoint = computed(() => {
    if (typeof window === 'undefined') return 0.55;
    
    const screenHeight = window.innerHeight;
    const percentage = MODAL_MAX_HEIGHT / screenHeight;
    
    if (screenHeight < 600) {
      return Math.max(0.7, Math.min(0.9, percentage + 0.2));
    }
    if (screenHeight < 700) {
      return Math.max(0.6, Math.min(0.85, percentage + 0.1));
    }
    return Math.max(0.45, Math.min(0.65, percentage));
  });

  maxBreakpoint = computed(() => 
    Math.min(this.modalBreakpoint() + BREAKPOINT_OFFSET, 0.9)
  );

  constructor() {
    addIcons({ cartOutline, restaurantOutline, medicalOutline, callOutline });
  }

  selectPeriod(value: string): void {
    this.selectedPeriod.set(value);
  }

  selectCategory(value: string): void {
    this.selectedCategory.set(value);
  }

  applyFilters(): void {
    this.filtersApplied.emit({
      period: this.selectedPeriod(),
      category: this.selectedCategory()
    });
    this.closeModal();
  }

  closeModal(): void {
    this._isOpen.set(false);
    this.close.emit();
  }
}
