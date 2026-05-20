import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteService } from '../../core/services/favorite.service';

@Component({
  selector: 'app-minimalist-theme',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent, TranslateModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    :host {
      --theme-primary: #ffffff;
      --theme-accent: #111827;
      font-family: 'Inter', sans-serif;
    }
  `],
  template: `
    <div class="min-h-screen bg-white text-gray-900 selection:bg-gray-900 selection:text-white pb-24">
      
      <!-- Minimalist Header -->
      <header class="py-8 px-6 md:px-12 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div class="text-xl font-bold tracking-tight">
          {{ project?.name || 'MINIMALIST.' }}
        </div>
        <nav class="hidden md:flex gap-10 items-center text-sm font-medium text-gray-500">
          <a routerLink="/" class="hover:text-gray-900 transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
          <a routerLink="/about" class="hover:text-gray-900 transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
          <a routerLink="/blogs" class="hover:text-gray-900 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
          <a routerLink="/contact" class="hover:text-gray-900 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          <app-language-selector></app-language-selector>
        </nav>
      </header>

      <!-- Hero Section (Whitespace & Typography Focus) -->
      <section id="about" class="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <h1 class="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 mb-8 leading-tight">
          {{ project?.name || ('THEME.MINIMALIST.HERO_TITLE' | translate) }}
        </h1>
        <p class="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed mb-12">
          {{ project?.description }}
        </p>
      </section>

      <!-- Listing Section (Flex-row, Square Images) -->
      <section id="listing" class="max-w-5xl mx-auto px-6 border-t border-gray-100 pt-24">
        <h2 class="text-3xl font-bold tracking-tight mb-2">{{ 'THEME.MINIMALIST.LISTING_TITLE' | translate }}</h2>
        <p class="text-gray-500 mb-12">{{ 'THEME.MINIMALIST.LISTING_SUB' | translate }}</p>

        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <!-- List Layout -->
        <div class="flex flex-col gap-8">
          <article *ngFor="let prop of properties" class="group flex flex-col md:flex-row gap-8 items-center border border-gray-200 p-4 hover:border-gray-900 transition-colors bg-white">
            
            <!-- Square Image -->
            <div class="relative w-full md:w-72 md:h-72 aspect-square flex-shrink-0 overflow-hidden bg-gray-100">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                <img [src]="getThumbnail(prop)" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Property">
              </a>
              <!-- Nút Thả tim -->
              <button (click)="toggleFav($event, prop.id)" class="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm border border-gray-100">
                <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-gray-400'" class="w-5 h-5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            
            <!-- Info (Right side) -->
            <div class="flex-1 py-4 w-full">
              <div class="flex justify-between items-start mb-2">
                <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]">
                  <h3 class="text-2xl font-bold text-gray-900 group-hover:underline decoration-2 underline-offset-4">{{ prop.title }}</h3>
                </a>
                <div class="text-xl font-bold whitespace-nowrap">{{ prop.price | number }} ₫</div>
              </div>
              
              <div class="text-sm font-medium text-gray-500 mb-6 flex gap-4">
                <span>{{ prop.categories?.name || 'Nhà phố' }}</span>
                <span *ngIf="prop.attributes?.area && prop.price">
                  • {{ (prop.price / prop.attributes.area) | number:'1.0-0' }} ₫/m²
                </span>
              </div>
              
              <p class="text-gray-600 line-clamp-2 leading-relaxed mb-6">{{ prop.description }}</p>
              
              <!-- Features Extractor -->
              <div class="flex flex-wrap gap-4 text-sm text-gray-700 border-t border-gray-100 pt-4">
                <span *ngIf="prop.attributes?.area" class="bg-gray-50 px-3 py-1">{{ prop.attributes.area }} m²</span>
                <span *ngIf="prop.attributes?.floors" class="bg-gray-50 px-3 py-1">{{ prop.attributes.floors }} Tầng</span>
                <span *ngIf="prop.attributes?.bedrooms" class="bg-gray-50 px-3 py-1">{{ prop.attributes.bedrooms }} PN</span>
                <span *ngIf="prop.attributes?.frontage" class="bg-gray-50 px-3 py-1">Mặt tiền {{ prop.attributes.frontage }}m</span>
              </div>
            </div>
          </article>
        </div>
      </section>

    </div>
  `
})
export class MinimalistComponent implements OnInit {
  @Input() project: any;
  
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private favoriteService = inject(FavoriteService);
  properties: any[] = [];
  isLoading = true;

  ngOnInit() {
    const endpoint = this.project?.id ? `/properties?project_id=${this.project.id}` : '/properties';
    this.api.get<any>(endpoint).subscribe({
      next: (res) => { this.properties = res.data || []; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  getThumbnail(prop: any): string {
    if (prop.property_media && prop.property_media.length > 0) {
      const thumb = prop.property_media.find((m: any) => m.is_thumbnail);
      return thumb ? thumb.media_url : prop.property_media[0].media_url;
    }
    return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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