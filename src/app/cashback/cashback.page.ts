import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/angular/standalone';
import { InfoBannerComponent } from './components/info-banner/info-banner.component';
import { CardInfoComponent } from './components/card-info/card-info.component';
import { AccumulatedCashbackComponent } from './components/accumulated-cashback/accumulated-cashback.component';
import { Product } from './models/product';
import { CashBackAmounts } from './models/cashback-amounts';

@Component({
  selector: 'app-cashback',
  templateUrl: './cashback.page.html',
  styleUrls: ['./cashback.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule, 
    FormsModule,
    InfoBannerComponent,
    CardInfoComponent,
    AccumulatedCashbackComponent
  ]
})
export class CashbackPage {
  // Signal para controlar el tab activo
  selectedTab = signal<'resumen' | 'promo'>('resumen');
  
  // Signal para controlar la visibilidad del banner
  isBannerOpen = signal<boolean>(true);
  
  // Datos mock para desarrollo
  mockProduct: Product = {
    type: 'CREDIT',
    cardIdentification: {
      displayNumber: '1234567890122930'
    },
    image: {
      imageNumber: '74141001253'
    },
    product: {
      name: 'LikeU'
    }
  };
  
  mockProducts: Product[] = [this.mockProduct];
  
  mockCashbackAmounts: CashBackAmounts = {
    monthAmount: {
      amount: 346.80,
      currency: 'MXN'
    },
    annualAmount: {
      amount: 1250.50,
      currency: 'MXN'
    },
    cashbackPeriod: {
      month: '4', // Abril
      year: '2025'
    }
  };

  constructor() { }

  /**
   * Cambia el tab activo
   */
  onTabChange(event: CustomEvent) {
    const value = event.detail.value;
    this.selectedTab.set(value as 'resumen' | 'promo');
  }

  /**
   * Maneja el cierre del banner
   */
  onBannerClose(): void {
    this.isBannerOpen.set(false);
  }

  /**
   * Maneja el click en la tarjeta
   */
  onCardClick(): void {
    console.log('Card clicked - Abrir modal de selección de tarjetas');
    // TODO: Implementar modal para seleccionar tarjeta
  }
}
