import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
   */
  readonly periods = computed<FilterPeriod[]>(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // Mes actual
    const currentMonthDate = new Date(currentYear, currentMonth, 1);
    const currentMonthName = format(currentMonthDate, 'MMMM', { locale: es });
    const currentMonthCapitalized = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

    // Mes anterior
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthDate = new Date(previousYear, previousMonth, 1);
    const previousMonthName = format(previousMonthDate, 'MMMM', { locale: es });
    const previousMonthCapitalized = previousMonthName.charAt(0).toUpperCase() + previousMonthName.slice(1);

    // Mes anterior al anterior
    const previousMonth2 = previousMonth === 0 ? 11 : previousMonth - 1;
    const previousYear2 = previousMonth === 0 ? previousYear - 1 : previousYear;
    const previousMonth2Date = new Date(previousYear2, previousMonth2, 1);
    const previousMonth2Name = format(previousMonth2Date, 'MMMM', { locale: es });
    const previousMonth2Capitalized = previousMonth2Name.charAt(0).toUpperCase() + previousMonth2Name.slice(1);

    return [
      { label: currentMonthCapitalized, value: 'current' },
      { label: previousMonthCapitalized, value: 'previous' },
      { label: previousMonth2Capitalized, value: 'previous-2' }
    ];
  });

  readonly categories: readonly FilterCategory[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Supermercados', value: 'Sup', icon: 'cart-outline' },
    { label: 'Restaurantes', value: 'Res', icon: 'restaurant-outline' },
    { label: 'Farmacias', value: 'Far', icon: 'medical-outline' },
    { label: 'Telecomunicaciones', value: 'Tel', icon: 'call-outline' }
  ] as const;

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
