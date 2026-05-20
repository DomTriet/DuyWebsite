import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteService } from '../../core/services/favorite.service';

@Component({
  selector: 'app-eco-green-theme',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent, TranslateModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
    
    :host {
      --theme-primary: #f0fdf4;
      --theme-accent: #15803d;
      --rounded-box: 1.5rem;
      font-family: 'Quicksand', sans-serif;
    }
    .bg-theme { background-color: var(--theme-primary); }
    .text-accent { color: var(--theme-accent); }
    .bg-accent { background-color: var(--theme-accent); }
    .rounded-theme { border-radius: var(--rounded-box); }
    
    /* Họa tiết lá cây (Nature pattern) dệt dạng SVG siêu nhẹ */
    .bg-nature-pattern {
      background-color: #15803d;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-54.627 54.627-.83-.83L54.627 0zM29.5 0l29.5 29.5-.83.83L28.67 0h.83zM0 29.5L29.5 59h-.83L0 30.33V29.5zm59 29.5L60 59v1h-1z' fill='%2322c55e' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
    }
  `],
  template: `
    <div class="min-h-screen bg-theme text-green-900 pb-24">
      
      <!-- Eco Header với họa tiết thiên nhiên -->
      <header class="bg-nature-pattern text-white py-16 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <!-- Navigation -->
        <nav class="absolute top-6 left-6 z-20 hidden md:flex gap-6 items-center text-sm font-bold text-white/90 tracking-wide">
          <a routerLink="/" class="hover:text-white transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
          <a routerLink="/about" class="hover:text-white transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
          <a routerLink="/blogs" class="hover:text-white transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
          <a routerLink="/contact" class="hover:text-white transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
        </nav>
        <div class="absolute top-6 right-6 z-20">
          <app-language-selector></app-language-selector>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent"></div>
        <div class="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center mt-8 mb-12">
          <span class="px-4 py-1.5 bg-green-50/20 rounded-full text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm border border-green-100/30">
            {{ 'THEME.ECO_GREEN.BADGE' | translate }}
          </span>
          <h1 class="text-5xl md:text-6xl font-bold mb-6 tracking-tight">{{ project?.name || 'Eco-Green Project' }}</h1>
          <p class="text-xl text-green-50 font-medium max-w-2xl leading-relaxed">
            {{ project?.description }}
          </p>
        </div>
      </header>

      <!-- Bộ sưu tập BĐS Sinh thái -->
      <main class="max-w-7xl mx-auto px-6 mt-16">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-3xl font-bold text-green-800 mb-2">{{ 'THEME.ECO_GREEN.LISTING_TITLE' | translate }}</h2>
            <p class="text-green-600 font-medium">{{ 'THEME.ECO_GREEN.LISTING_SUB' | translate }}</p>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600"></div>
        </div>

        <!-- Grid Layout với Bo góc tròn -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let prop of properties" class="bg-white rounded-theme overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-green-100 group">
            <!-- Image Container -->
            <div class="block relative h-64 overflow-hidden">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                <img [src]="getThumbnail(prop)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Eco Property">
              </a>
              
              <!-- Nút thả tim -->
              <button (click)="toggleFav($event, prop.id)" class="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
                <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-green-600'" class="w-4 h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
              <!-- Nhãn (Badge) xanh lá mượt mà -->
              <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-green-700 shadow-sm flex items-center gap-1.5">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg>
                {{ 'THEME.ECO_GREEN.ECO_BADGE' | translate }}
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-6">
              <div class="flex justify-between items-start mb-3">
                <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]">
                  <h3 class="text-xl font-bold text-green-900 group-hover:text-green-600 transition-colors line-clamp-1">{{ prop.title }}</h3>
                </a>
              </div>
              <div class="text-2xl font-bold text-accent mb-4">{{ prop.price | number }} ₫</div>
              <p class="text-green-700/70 text-sm line-clamp-2 mb-6 font-medium">{{ prop.description }}</p>
              
              <!-- Các tiện ích xanh -->
              <div class="flex gap-4 pt-4 border-t border-green-50 text-sm font-semibold text-green-800">
                <span *ngIf="prop.attributes?.area" class="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                  {{ prop.attributes.area }} m²
                </span>
                <span *ngIf="prop.attributes?.bedrooms" class="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                  {{ prop.attributes.bedrooms }} {{ 'THEME.ECO_GREEN.BEDROOMS' | translate }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  `
})
export class EcoGreenComponent implements OnInit {
  @Input() project: any;
  
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private favoriteService = inject(FavoriteService);
  properties: any[] = [];
  isLoading = true;

  ngOnInit() {
    const endpoint = this.project?.id ? `/properties?project_id=${this.project.id}` : '/properties';
    this.api.get<any>(endpoint).subscribe({ next: (res) => { this.properties = res.data || []; this.isLoading = false; this.cdr.markForCheck(); }, error: () => { this.isLoading = false; this.cdr.markForCheck(); } });
  }

  getThumbnail(prop: any): string {
    const thumb = prop.property_media?.find((m: any) => m.is_thumbnail);
    return thumb ? thumb.media_url : (prop.property_media?.[0]?.media_url || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
  }

  isFav(propertyId: string): boolean {
    return this.favoriteService.isFavorite(propertyId);
  }

  toggleFav(event: Event, propertyId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteService.toggleFavorite(propertyId);
    this.cdr.markForCheck();
  }
}