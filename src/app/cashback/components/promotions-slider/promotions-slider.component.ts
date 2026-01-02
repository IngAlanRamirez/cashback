import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionCardComponent } from '../promotion-card/promotion-card.component';
import { Promotion } from '../../models/promotion';

@Component({
  selector: 'app-promotions-slider',
  templateUrl: './promotions-slider.component.html',
  styleUrls: ['./promotions-slider.component.scss'],
  standalone: true,
  imports: [CommonModule, PromotionCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PromotionsSliderComponent {
  @Input() promotions: Promotion[] = [];
  @Input() title: string = '';
  @Input() showViewMore: boolean = true;
  
  @Output() viewMoreClick = new EventEmitter<void>();

  /**
   * Maneja el click en "Ver más"
   */
  onViewMore(): void {
    this.viewMoreClick.emit();
  }
}

