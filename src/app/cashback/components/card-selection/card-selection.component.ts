import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ActionSheetController,
  ActionSheetButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline, chevronForward } from 'ionicons/icons';
import { Product } from '../../models/product';

@Component({
  selector: 'app-card-selection',
  templateUrl: './card-selection.component.html',
  styleUrls: ['./card-selection.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class CardSelectionComponent {
  private actionSheetCtrl = inject(ActionSheetController);
  
  private _products = signal<Product[]>([]);
  private _currentProduct = signal<Product | null>(null);

  constructor() {
    // Registrar iconos de ionicons
    addIcons({ cardOutline, chevronForward });
  }

  @Input() 
  set isOpen(value: boolean) {
    this._isOpen.set(value);
    if (value) {
      this.presentActionSheet();
    }
  }
  get isOpen(): boolean {
    return this._isOpen();
  }
  private _isOpen = signal<boolean>(false);

  @Input() 
  set products(value: Product[]) {
    this._products.set(value || []);
  }
  get products(): Product[] {
    return this._products();
  }

  @Input() 
  set currentProduct(value: Product | null) {
    this._currentProduct.set(value);
  }
  get currentProduct(): Product | null {
    return this._currentProduct();
  }

  @Output() close = new EventEmitter<void>();
  @Output() productSelected = new EventEmitter<Product>();

  // Computed para obtener las tarjetas disponibles
  availableProducts = computed(() => {
    const products = this._products();
    const currentProduct = this._currentProduct();
    
    if (!products || products.length === 0) {
      return [];
    }
    
    if (!currentProduct) {
      return products;
    }
    
    const currentContractId = currentProduct.associatedAccounts?.[0]?.account?.contract?.contractId;
    
    if (!currentContractId) {
      return products;
    }
    
    return products.filter(product => {
      const productContractId = product.associatedAccounts?.[0]?.account?.contract?.contractId;
      return productContractId && productContractId !== currentContractId;
    });
  });


  /**
   * Presenta el action sheet con las tarjetas disponibles
   */
  async presentActionSheet() {
    const products = this.availableProducts();
    
    if (products.length === 0) {
      this.closeModal();
      return;
    }

    const buttons: ActionSheetButton[] = products.map(product => {
      const cardText = this.getCardDisplayText(product);
      const cardImage = this.getCardImage(product);
      
      return {
        text: cardText,
        icon: 'card-outline',
        cssClass: 'card-selection-button',
        handler: () => {
          this.onProductSelect(product);
          return true;
        },
        // Agregar datos personalizados para la imagen
        data: {
          image: cardImage,
          product: product
        }
      } as ActionSheetButton;
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona tu tarjeta',
      buttons: buttons,
      cssClass: 'card-selection-action-sheet',
      mode: 'md',
      backdropDismiss: true
    });

    await actionSheet.present();

    // Agregar imágenes de tarjetas a los botones después de presentar
    setTimeout(() => {
      const buttons = document.querySelectorAll('.card-selection-action-sheet .action-sheet-button.card-selection-button');
      buttons.forEach((button, index) => {
        const product = products[index];
        if (product && !button.querySelector('.card-image')) {
          const cardImage = this.getCardImage(product);
          const buttonInner = button.querySelector('.button-inner') || button;
          
          // Crear elemento de imagen
          const img = document.createElement('img');
          img.className = 'card-image';
          img.src = cardImage;
          img.alt = this.getCardDisplayText(product);
          img.width = 48;
          img.height = 30;
          img.loading = 'lazy';
          img.style.cssText = 'width: 48px; height: 30px; object-fit: contain; object-position: center; border-radius: 6px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); mix-blend-mode: multiply; filter: brightness(1.1) contrast(1.1); background: transparent;';
          
          // Insertar imagen antes del texto y agregar chevron después del texto
          const textElement = button.querySelector('.action-sheet-button-inner');
          if (textElement) {
            const wrapper = document.createElement('div');
            wrapper.className = 'button-inner';
            wrapper.style.cssText = 'display: flex; align-items: center; gap: 6px; width: 100%;';
            wrapper.appendChild(img);
            
            // Clonar el elemento de texto y hacer que ocupe el espacio disponible
            const clonedText = textElement.cloneNode(true) as HTMLElement;
            clonedText.style.cssText = 'flex: 1; min-width: 0; margin-left: 0; padding-left: 0;';
            wrapper.appendChild(clonedText);
            
            // Crear y agregar el icono chevron-forward después del texto, alineado a la derecha
            const chevronIcon = document.createElement('ion-icon');
            chevronIcon.setAttribute('name', 'chevron-forward');
            chevronIcon.style.cssText = 'font-size: 20px; color: #92949c; flex-shrink: 0;';
            wrapper.appendChild(chevronIcon);
            
            textElement.replaceWith(wrapper);
          } else {
            button.insertBefore(img, button.firstChild);
            
            // Si no hay textElement, agregar chevron al final del botón
            const chevronIcon = document.createElement('ion-icon');
            chevronIcon.setAttribute('name', 'chevron-forward');
            chevronIcon.style.cssText = 'font-size: 20px; color: #92949c; flex-shrink: 0; margin-left: auto;';
            button.appendChild(chevronIcon);
          }
        }
      });
    }, 100);

    // Agregar botón cancelar al header después de presentar
    setTimeout(() => {
      const headerElement = document.querySelector('.card-selection-action-sheet .action-sheet-title') as HTMLElement;
      if (headerElement && !headerElement.querySelector('.cancel-header-btn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-header-btn';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.style.cssText = 'position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #ec0000; font-size: 16px; font-weight: 400; cursor: pointer; padding: 0;';
        cancelBtn.addEventListener('click', () => {
          actionSheet.dismiss();
          this.closeModal();
        });
        headerElement.style.position = 'relative';
        headerElement.appendChild(cancelBtn);
      }
    }, 150);

    // Escuchar cuando se cierra el action sheet
    const { role } = await actionSheet.onDidDismiss();
    if (role === 'backdrop' || role === 'dismiss') {
      this.closeModal();
    }
  }

  /**
   * Obtiene el texto de visualización para la tarjeta
   */
  getCardDisplayText(product: Product): string {
    const name = this.formatProductName(product.product?.name || '', product);
    const type = this.getCardType(product);
    const lastFour = this.getLastFourDigits(product);
    return `${name} - ${type} *${lastFour}`;
  }

  /**
   * Obtiene la ruta de la imagen de la tarjeta basada en el tipo y nombre
   */
  getCardImage(product: Product): string {
    const productName = product.product?.name?.toLowerCase() || '';
    const type = product.type?.toUpperCase() || '';
    
    // Mapeo de tarjetas a imágenes
    // Las imágenes deben estar en src/assets/images/cards/
    if (type === 'CREDIT' && productName.includes('famous')) {
      return '/assets/images/cards/card-2.png'; // Rockstar Famous Credit - Tarjeta con gradiente teal-naranja
    } else if (type === 'CREDIT') {
      return '/assets/images/cards/card-1.png'; // Rockstar Credit - Tarjeta negra con efectos dorados
    } else if (type === 'DEBIT') {
      return '/assets/images/cards/card-3.png'; // Rockstar Debit Plus - Tarjeta con gradiente azul-magenta
    }
    
    // Imagen por defecto
    return '/assets/images/cards/card-1.png';
  }

  /**
   * Formatea el nombre del producto
   */
  formatProductName(name: string, product: Product): string {
    const productName = name.toLowerCase();
    const type = product.type?.toUpperCase() || '';
    
    // Mapeo de nombres según el tipo y nombre del producto
    if (type === 'CREDIT') {
      if (productName.includes('famous')) {
        return 'Rockstar Famous Credit';
      } else {
        return 'Rockstar Credit';
      }
    } else if (type === 'DEBIT') {
      return 'Rockstar Debit Plus';
    }
    
    // Si no coincide, retornar el nombre original truncado
    return name.length > 22 ? name.substring(0, 22) + '...' : name;
  }

  /**
   * Obtiene el tipo de tarjeta (TDC o TDD)
   */
  getCardType(product: Product): string {
    return product.type?.toUpperCase() === 'CREDIT' ? 'TDC' : 'TDD';
  }

  /**
   * Obtiene los últimos 4 dígitos de la tarjeta
   */
  getLastFourDigits(product: Product): string {
    return product.cardIdentification?.displayNumber?.slice(-4) || '****';
  }

  /**
   * Maneja la selección de una tarjeta
   */
  onProductSelect(product: Product): void {
    this.productSelected.emit(product);
    this.closeModal();
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this._isOpen.set(false);
    this.close.emit();
  }
}
