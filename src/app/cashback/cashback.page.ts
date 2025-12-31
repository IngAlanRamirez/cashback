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
    FormsModule
  ]
})
export class CashbackPage {
  // Signal para controlar el tab activo
  selectedTab = signal<'resumen' | 'promo'>('resumen');

  constructor() { }

  /**
   * Cambia el tab activo
   */
  onTabChange(event: CustomEvent) {
    const value = event.detail.value;
    this.selectedTab.set(value as 'resumen' | 'promo');
  }
}
