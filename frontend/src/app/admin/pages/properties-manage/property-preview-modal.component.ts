import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinimalistPropertyDetailComponent } from '../../../themes/minimalist/minimalist-property-detail.component';
import { LuxuryPropertyDetailComponent } from '../../../themes/luxury/luxury-property-detail.component';
import { EcoGreenPropertyDetailComponent } from '../../../themes/eco-green/eco-green-property-detail.component';

@Component({
  selector: 'app-property-preview-modal',
  standalone: true,
  imports: [CommonModule, MinimalistPropertyDetailComponent, LuxuryPropertyDetailComponent, EcoGreenPropertyDetailComponent],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-[9999] bg-black/70 flex flex-col" (click)="close.emit()">
      <!-- Thanh công cụ -->
      <div class="flex items-center justify-between px-5 py-3 bg-gray-900 text-white shadow-lg" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-3">
          <span class="font-semibold">👁 Xem trước trang chi tiết</span>
          <span class="text-xs px-2 py-1 rounded-full bg-gray-800">{{ themeLabel }}</span>
        </div>
        <button (click)="close.emit()" class="text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-sm">
          Đóng
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Nội dung preview (cuộn) -->
      <div class="flex-1 overflow-y-auto bg-white" (click)="$event.stopPropagation()">
        <ng-container [ngSwitch]="theme">
          <app-luxury-property-detail *ngSwitchCase="'luxury'" [property]="property" [preview]="true"></app-luxury-property-detail>
          <app-eco-green-property-detail *ngSwitchCase="'eco-green'" [property]="property" [preview]="true"></app-eco-green-property-detail>
          <app-minimalist-property-detail *ngSwitchDefault [property]="property" [preview]="true"></app-minimalist-property-detail>
        </ng-container>
      </div>
    </div>
  `
})
export class PropertyPreviewModalComponent {
  @Input() open = false;
  @Input() property: any = null;
  @Input() theme = 'minimalist';
  @Output() close = new EventEmitter<void>();

  get themeLabel(): string {
    if (this.theme === 'luxury') return 'Luxury';
    if (this.theme === 'eco-green') return 'Eco Green';
    return 'Minimalist';
  }
}
