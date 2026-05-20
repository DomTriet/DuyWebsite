import { Component, Input, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteService } from '../../core/services/favorite.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    
    /* Eco Nature Pattern */
    .bg-nature-pattern {
      background: linear-gradient(135deg, #15803d 0%, #166534 50%, #15803d 100%);
      background-image: 
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-54.627 54.627-.83-.83L54.627 0zM29.5 0l29.5 29.5-.83.83L28.67 0h.83zM0 29.5L29.5 59h-.83L0 30.33V29.5zm59 29.5L60 59v1h-1z' fill='%2322c55e' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
    }

    /* Scroll Animation */
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes leafFloat {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-10px) rotate(2deg);
      }
    }

    .animate-slide-in {
      animation: slideInUp 0.6s ease-out forwards;
    }

    .leaf-animate {
      animation: leafFloat 3s ease-in-out infinite;
    }

    /* Parallax effect */
    .parallax-bg {
      background-attachment: fixed;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }

    /* Hover effect for cards */
    .eco-card-hover {
      transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
    }

    .eco-card-hover:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(21, 128, 61, 0.15);
    }
  `],
  template: `
    <div class="min-h-screen bg-white text-green-900">
      
      <!-- Modern Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">ECO-GREEN</a>
          <div class="hidden md:flex gap-10 items-center">
            <a routerLink="/" class="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
            <a routerLink="/about" class="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
            <a routerLink="/blogs" class="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
            <a routerLink="/contact" class="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <!-- Hero Section with Nature Gradient -->
      <section class="bg-gradient-to-br from-green-50 via-emerald-50 to-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-30">
          <svg viewBox="0 0 100 100" class="h-full w-full"><defs><pattern id="leaves" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10,5 Q15,5 18,10 Q15,15 10,15 Q5,15 2,10 Q5,5 10,5" fill="currentColor"/></pattern></defs><rect width="100%" height="100%" fill="url(#leaves)" class="text-green-200"/></svg>
        </div>
        <div class="max-w-6xl mx-auto px-6 py-24 relative">
          <div class="text-center">
            <span class="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full mb-6">🌱 {{ 'THEME.ECO_GREEN.BADGE' | translate }}</span>
            <h1 class="text-5xl md:text-6xl font-black text-green-900 mb-6 leading-tight">{{ project?.name || 'Dự án sinh thái' }}</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">{{ project?.description }}</p>
            <a href="#listing" class="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all">Khám phá ngay</a>
          </div>
        </div>
      </section>

      <!-- Highlight Features -->
      <section class="max-w-6xl mx-auto px-6 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="group rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-8 hover:shadow-lg transition-all">
            <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:scale-110 transition-all">
              <svg class="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-green-900 mb-2">Năng lượng xanh</h3>
            <p class="text-gray-600 text-sm">Công trình thi ết kế bền vững với năng lượng tái tạo.</p>
          </div>
          <div class="group rounded-xl border border-green-200 bg-gradient-to-br from-emerald-50 to-white p-8 hover:shadow-lg transition-all">
            <div class="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:scale-110 transition-all">
              <svg class="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-emerald-900 mb-2">Cộng đồng sinh thái</h3>
            <p class="text-gray-600 text-sm">Cư dân thân thiện, tất cả vì một tương lai xanh.</p>
          </div>
          <div class="group rounded-xl border border-green-200 bg-gradient-to-br from-teal-50 to-white p-8 hover:shadow-lg transition-all">
            <div class="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:scale-110 transition-all">
              <svg class="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-teal-900 mb-2">Thiết kế thông minh</h3>
            <p class="text-gray-600 text-sm">Công nghệ IoT và quản lý thông minh cho cuộc sống hiện đại.</p>
          </div>
        </div>
      </section>

      <!-- Properties Listing -->
      <main id="listing" class="max-w-7xl mx-auto px-6 py-20">
        <div class="mb-16">
          <h2 class="text-4xl font-black text-green-900 mb-3">{{ 'THEME.ECO_GREEN.LISTING_TITLE' | translate }}</h2>
          <p class="text-gray-600 text-lg">{{ 'THEME.ECO_GREEN.LISTING_SUB' | translate }}</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-16">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 border-4 border-green-100 rounded-full animate-spin border-t-green-600"></div>
          </div>
        </div>

        <!-- Properties Grid -->
        <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let prop of properties; let i = index" 
            class="group rounded-xl overflow-hidden border border-green-200 bg-white hover:shadow-xl hover:border-green-400 transition-all duration-300"
            [style.animation]="'fadeInUp 0.5s ease-out ' + (i * 0.05) + 's backwards'">
            
            <div class="relative h-64 overflow-hidden bg-gray-100">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                <img [src]="getThumbnail(prop)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
              </a>
              <button (click)="toggleFav($event, prop.id)" class="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-all hover:scale-110">
                <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-green-600'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
              <div class="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">🌱 Eco</div>
            </div>
            
            <div class="p-6">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]">
                <h3 class="text-lg font-bold text-green-900 group-hover:text-green-600 transition-colors line-clamp-2 mb-2">{{ prop.title }}</h3>
              </a>
              <p class="text-gray-600 text-sm line-clamp-2 mb-4">{{ prop.description }}</p>
              <div class="text-2xl font-black text-green-600 mb-4">{{ prop.price | number }} ₫</div>
              
              <div class="grid grid-cols-2 gap-3 pt-4 border-t border-green-100">
                <div *ngIf="prop.attributes?.area" class="text-center">
                  <div class="text-xs text-gray-600 font-semibold">Diện tích</div>
                  <div class="font-bold text-green-900">{{ prop.attributes.area }} m²</div>
                </div>
                <div *ngIf="prop.attributes?.bedrooms" class="text-center">
                  <div class="text-xs text-gray-600 font-semibold">Phòng ngủ</div>
                  <div class="font-bold text-green-900">{{ prop.attributes.bedrooms }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && properties.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🌿</div>
          <p class="text-green-700 text-lg font-semibold">Chưa có bất động sản nào</p>
          <p class="text-gray-600">Dự án sắp ra mắt những căn hộ sinh thái mới</p>
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
  private destroyRef = inject(DestroyRef);
  properties: any[] = [];
  isLoading = true;

  ngOnInit() {
    const endpoint = this.project?.id ? `/properties?project_id=${this.project.id}` : '/properties';
    this.api.get<any>(endpoint).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (res) => { this.properties = res.data || []; this.isLoading = false; this.cdr.markForCheck(); }, error: () => { this.isLoading = false; this.cdr.markForCheck(); } });
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
