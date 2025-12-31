import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ActionSheetController,
  ActionSheetButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline } from 'ionicons/icons';
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
    addIcons({ cardOutline });
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

    const buttons: ActionSheetButton[] = products.map(product => ({
      text: this.getCardDisplayText(product),
      icon: 'card-outline',
      handler: () => {
        this.onProductSelect(product);
        return true;
      }
    }));

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona tu tarjeta',
      buttons: buttons,
      cssClass: 'card-selection-action-sheet',
      mode: 'md',
      backdropDismiss: true
    });

    await actionSheet.present();

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
    }, 100);

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
   * Formatea el nombre del producto
   */
  formatProductName(name: string, product: Product): string {
    if (product.type?.toUpperCase() === 'CREDIT') {
      return 'LikeU';
    } else {
      return name.length > 22 ? name.substring(0, 22) + '...' : name;
    }
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
