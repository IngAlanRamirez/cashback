import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircle, close } from 'ionicons/icons';

@Component({
  selector: 'app-info-banner',
  templateUrl: './info-banner.component.html',
  styleUrls: ['./info-banner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class InfoBannerComponent {
  // Estado interno del banner (visible/oculto)
  private _isOpen = signal<boolean>(true);
  
  @Input() 
  set isOpen(value: boolean) {
    this._isOpen.set(value);
  }
  
  get isOpen(): boolean {
    return this._isOpen();
  }

  @Input() message: string = 
    'Recuerda que el Cashback de tus compras será depositado en tu cuenta Santander antes del día 15 de cada mes.';

  @Input() dismissible: boolean = true;

  @Output() close = new EventEmitter<void>();

  constructor() {
    // Registrar iconos de ionicons
    addIcons({ informationCircle, close });
  }

  /**
   * Cierra el banner y emite el evento
   */
  closeBanner(): void {
    if (this.dismissible) {
      this._isOpen.set(false);
      this.close.emit();
    }
  }
}

