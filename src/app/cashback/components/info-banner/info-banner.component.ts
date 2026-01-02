import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-info-banner',
  templateUrl: './info-banner.component.html',
  styleUrls: ['./info-banner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class InfoBannerComponent {
  // Servicio de traducción
  readonly translate = inject(TranslationService);
  
  // Estado interno del banner (visible/oculto)
  private _isOpen = signal<boolean>(true);
  
  @Input() 
  set isOpen(value: boolean) {
    this._isOpen.set(value);
  }
  
  get isOpen(): boolean {
    return this._isOpen();
  }

  @Input() message: string = '';
  
  /**
   * Obtiene el mensaje del banner, usando el input si está definido o la traducción por defecto
   */
  get bannerMessage(): string {
    return this.message || this.translate.t('banner.message');
  }

  @Input() dismissible: boolean = true;

  @Output() close = new EventEmitter<void>();

  constructor() {
    // Registrar iconos de ionicons (solo close, el info usa SVG personalizado)
    addIcons({ close });
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

