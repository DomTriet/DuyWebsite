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

    /* Minimalist Animations - Subtle and Refined */
    @keyframes minimalistFadeIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes subtleScale {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.02);
      }
    }

    @keyframes expandUnderline {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }

    .animate-minimalist-fade {
      animation: minimalistFadeIn 0.5s ease-out forwards;
    }

    /* Minimalist card hover effect */
    .minimalist-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-color: rgb(229, 231, 235);
    }

    .minimalist-card:hover {
      border-color: rgb(17, 24, 39);
      background-color: rgb(249, 250, 251);
    }

    /* Underline expansion */
    .minimalist-underline {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .minimalist-underline::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1.5px;
      background-color: var(--theme-accent);
      transition: width 0.4s ease-out;
    }

    .minimalist-underline:hover::after {
      width: 100%;
    }

    /* Price per m2 color */
    .price-per-m2 {
      color: rgb(107, 114, 128);
      font-weight: 500;
    }
  `],
  template: `
    <div class="min-h-screen bg-white text-gray-900 pb-24">
      
      <!-- Minimalist Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div class="text-2xl font-black tracking-tight text-gray-900">MINIMAL</div>
          <div class="hidden md:flex gap-12 items-center text-sm font-medium">
            <a routerLink="/" class="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a routerLink="/about" class="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            <a routerLink="/blogs" class="text-gray-600 hover:text-gray-900 transition-colors">Blog</a>
            <a routerLink="/contact" class="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="py-24 px-6 text-center border-b border-gray-100">
        <h1 class="text-6xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">{{ project?.name || 'Minimalist Living' }}</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{{ project?.description }}</p>
      </section>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 py-20">
        <!-- Listing Header -->
        <div class="mb-16">
          <h2 class="text-4xl font-black text-gray-900 mb-2">Properties</h2>
          <div class="w-12 h-1 bg-gray-900"></div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-gray-100 h-80 rounded-lg animate-pulse"></div>
        </div>

        <!-- Properties Grid -->
        <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let prop of properties; let i = index" 
            class="group border border-gray-200 overflow-hidden hover:border-gray-900 transition-all duration-300"
            [style.animation]="'fadeInUp 0.5s ease-out ' + (i * 0.05) + 's backwards'">
            
            <!-- Image -->
            <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block h-64 overflow-hidden bg-gray-100">
              <img [src]="getThumbnail(prop)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </a>

            <!-- Content -->
            <div class="p-8">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]">
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 mb-3">{{ prop.title }}</h3>
              </a>
              <p class="text-sm text-gray-600 line-clamp-2 mb-6">{{ prop.description }}</p>
              
              <!-- Price -->
              <div class="text-2xl font-black text-gray-900 mb-6">{{ prop.price | number }} ₫</div>

              <!-- Specs -->
              <div class="space-y-2 text-sm">
                <div *ngIf="prop.attributes?.area" class="flex justify-between">
                  <span class="text-gray-600">Area</span>
                  <span class="font-semibold text-gray-900">{{ prop.attributes.area }} m²</span>
                </div>
                <div *ngIf="prop.attributes?.bedrooms" class="flex justify-between">
                  <span class="text-gray-600">Bedrooms</span>
                  <span class="font-semibold text-gray-900">{{ prop.attributes.bedrooms }}</span>
                </div>
              </div>

              <!-- Favorite button -->
              <button (click)="toggleFav($event, prop.id)" class="mt-6 w-full py-2 border border-gray-200 hover:border-gray-900 text-gray-900 font-semibold rounded transition-all">
                {{ isFav(prop.id) ? '★ Favorited' : '☆ Add to Favorites' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && properties.length === 0" class="text-center py-20">
          <p class="text-gray-600 text-lg mb-4">No properties available</p>
        </div>
      </div>
          {{ (project?.name || 'MINIMALIST') | uppercase }}.
        </div>
        <nav class="hidden md:flex gap-12 items-center text-sm font-medium text-gray-600">
          <a routerLink="/" class="minimalist-underline hover:text-gray-900 transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
          <a routerLink="/about" class="minimalist-underline hover:text-gray-900 transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
          <a routerLink="/blogs" class="minimalist-underline hover:text-gray-900 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
          <a routerLink="/contact" class="minimalist-underline hover:text-gray-900 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          <app-language-selector></app-language-selector>
        </nav>
      </header>

      <!-- Whitespace-Focused Hero Section -->
      <section id="about" class="max-w-5xl mx-auto px-6 pt-40 pb-32 text-center">
        <p class="text-sm uppercase tracking-[0.2em] text-gray-400 font-semibold mb-6 animate-minimalist-fade">Bất động sản</p>
        <h1 class="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 mb-10 leading-tight animate-minimalist-fade" style="animation-delay: 0.1s;">
          {{ project?.name || ('THEME.MINIMALIST.HERO_TITLE' | translate) }}
        </h1>
        <p class="text-xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed mb-16 animate-minimalist-fade" style="animation-delay: 0.2s;">
          {{ project?.description }}
        </p>
        <a href="#listing" class="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 animate-minimalist-fade" style="animation-delay: 0.3s;">
          Khám phá →
        </a>
      </section>

      <!-- Clean Listing Section -->
      <section id="listing" class="max-w-5xl mx-auto px-6 border-t border-gray-200 pt-32 pb-24">
        <div class="mb-16">
          <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-3">{{ 'THEME.MINIMALIST.LISTING_TITLE' | translate }}</h2>
          <p class="text-gray-500 text-lg">{{ 'THEME.MINIMALIST.LISTING_SUB' | translate }}</p>
        </div>

        <!-- Refined Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-16">
          <div class="relative w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        </div>

        <!-- Clean List Layout with Stagger Animation -->
        <div class="flex flex-col gap-6">
          <article 
            *ngFor="let prop of properties; let i = index" 
            class="group flex flex-col md:flex-row gap-8 items-start md:items-center minimalist-card border p-6 hover:bg-gray-50 bg-white"
            [style.animation]="'minimalistFadeIn 0.5s ease-out ' + (i * 0.08) + 's backwards'">
            
            <!-- Clean Square Image -->
            <div class="relative w-full md:w-64 md:h-64 aspect-square flex-shrink-0 overflow-hidden bg-gray-100">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                <img [src]="getThumbnail(prop)" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Property">
              </a>
              
              <!-- Subtle favorite button -->
              <button (click)="toggleFav($event, prop.id)" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-all shadow-sm border border-gray-300 hover:border-gray-900">
                <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current scale-110' : 'text-gray-400 group-hover:text-gray-900'" class="w-5 h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            
            <!-- Information Section -->
            <div class="flex-1 w-full">
              <div class="flex justify-between items-start mb-2 gap-4">
                <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]">
                  <h3 class="text-2xl font-bold text-gray-900 minimalist-underline">{{ prop.title }}</h3>
                </a>
                <div class="text-xl font-bold text-gray-900 whitespace-nowrap">{{ prop.price | number }} ₫</div>
              </div>
              
              <!-- Metadata -->
              <div class="text-sm font-medium text-gray-600 mb-4 flex items-center gap-4">
                <span *ngIf="prop.categories?.name">{{ prop.categories.name }}</span>
                <span *ngIf="prop.attributes?.area && prop.price" class="price-per-m2">
                  {{ (prop.price / prop.attributes.area) | number:'1.0-0' }} ₫/m²
                </span>
              </div>
              
              <!-- Description -->
              <p class="text-gray-600 line-clamp-2 leading-relaxed mb-6">{{ prop.description }}</p>
              
              <!-- Clean Features Grid -->
              <div class="flex flex-wrap gap-3 text-sm text-gray-700 border-t border-gray-200 pt-4">
                <span *ngIf="prop.attributes?.area" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span class="text-gray-500 text-xs">Diện tích:</span> {{ prop.attributes.area }} m²
                </span>
                <span *ngIf="prop.attributes?.bedrooms" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span class="text-gray-500 text-xs">Phòng ngủ:</span> {{ prop.attributes.bedrooms }}
                </span>
                <span *ngIf="prop.attributes?.bathrooms" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span class="text-gray-500 text-xs">Phòng tắm:</span> {{ prop.attributes.bathrooms }}
                </span>
                <span *ngIf="prop.attributes?.floors" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span class="text-gray-500 text-xs">Tầng:</span> {{ prop.attributes.floors }}
                </span>
                <span *ngIf="prop.attributes?.frontage" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span class="text-gray-500 text-xs">Mặt tiền:</span> {{ prop.attributes.frontage }}m
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && properties.length === 0" class="text-center py-20">
          <p class="text-gray-500 text-lg font-light mb-2">Không có bất động sản nào</p>
          <p class="text-gray-400 text-sm">Vui lòng quay lại sau</p>
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
