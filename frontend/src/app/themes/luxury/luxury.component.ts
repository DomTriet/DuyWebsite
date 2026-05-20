import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteService } from '../../core/services/favorite.service';

@Component({
  selector: 'app-luxury-theme',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent, TranslateModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
    
    :host {
      --theme-primary: #0f172a;
      --theme-accent: #d4af37;
    }
    .text-accent { color: var(--theme-accent); }
    .bg-accent { background-color: var(--theme-accent); }
    .border-accent { border-color: var(--theme-accent); }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-sans { font-family: 'Inter', sans-serif; }

    /* Luxury animations */
    @keyframes fadeUpLuxury {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(-60px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes goldGlow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
      }
      50% {
        box-shadow: 0 0 40px rgba(212, 175, 55, 0.4);
      }
    }

    .animate-fade-up-luxury {
      animation: fadeUpLuxury 0.8s ease-out forwards;
    }

    .animate-slide-right {
      animation: slideInRight 0.8s ease-out forwards;
    }

    .luxury-card {
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .luxury-card:hover {
      transform: translateY(-12px);
      border-color: var(--theme-accent);
    }

    .luxury-card:hover img {
      transform: scale(1.05);
    }

    .gold-accent-underline {
      position: relative;
    }

    .gold-accent-underline::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 40px;
      height: 2px;
      background-color: var(--theme-accent);
      transition: width 0.6s ease-out;
    }

    .gold-accent-underline:hover::after {
      width: 100%;
    }
  `],
  template: `
    <div class="min-h-screen bg-black text-white">
      
      <!-- Luxury Header with Enhanced Styling -->
      <header class="absolute top-0 w-full z-50 py-8 px-8 md:px-12 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent backdrop-blur-md border-b border-white/10">
        <div class="text-3xl font-serif text-accent font-bold tracking-widest">
          {{ project?.name || 'LUXURY' }}
        </div>
        <nav class="hidden md:flex gap-10 items-center text-sm font-sans tracking-widest text-gray-300">
          <a routerLink="/" class="hover:text-accent transition-all duration-300 relative group">{{ 'NAVBAR.HOME' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-500"></span></a>
          <a routerLink="/about" class="hover:text-accent transition-all duration-300 relative group">{{ 'NAVBAR.ABOUT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-500"></span></a>
          <a routerLink="/blogs" class="hover:text-accent transition-all duration-300 relative group">{{ 'NAVBAR.NEWS' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-500"></span></a>
          <a routerLink="/contact" class="hover:text-accent transition-all duration-300 relative group">{{ 'NAVBAR.CONTACT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-500"></span></a>
          <app-language-selector></app-language-selector>
        </nav>
      </header>

      <!-- Premium Hero Section with Parallax -->
      <section class="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <!-- Enhanced gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0f172a]/80 z-10"></div>
        <!-- Accent glow effect -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl z-0"></div>
        
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
             class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700" alt="Hero">
        
        <div class="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <p class="text-accent tracking-[0.35em] text-xs md:text-sm mb-8 uppercase font-sans font-semibold animate-fade-up-luxury" style="animation-delay: 0.1s;">{{ 'THEME.LUXURY.HERO_SUB' | translate }}</p>
          <h1 class="text-6xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight animate-fade-up-luxury" style="animation-delay: 0.3s;">
            {{ project?.name || 'Khởi Nguồn Tinh Hoa' }}
          </h1>
          <p class="text-lg md:text-xl font-sans text-gray-200 font-light mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-up-luxury" style="animation-delay: 0.5s;">
            {{ project?.description || 'Khám phá bộ sưu tập những bất động sản đẳng cấp nhất.' }}
          </p>
          <a href="#listing" class="inline-flex items-center gap-3 border-2 border-accent text-accent px-10 py-4 font-sans tracking-widest text-sm font-semibold hover:bg-accent hover:text-[#0f172a] transition-all duration-500 hover:shadow-2xl animate-fade-up-luxury group" style="animation-delay: 0.7s;">
            {{ 'THEME.LUXURY.EXPLORE_NOW' | translate }}
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </a>
        </div>
      </section>

      <!-- Premium About Section -->
      <section id="about" class="py-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center bg-[#0f172a]">
        <div class="flex-1">
          <p class="text-accent tracking-[0.2em] text-xs uppercase font-sans font-semibold mb-6">Về dự án</p>
          <h2 class="text-5xl md:text-6xl font-serif text-white mb-8 leading-tight gold-accent-underline" [innerHTML]="'THEME.LUXURY.ABOUT_TITLE' | translate"></h2>
          <div class="font-sans text-gray-300 text-lg leading-relaxed space-y-6">
            <p>{{ project?.description }}</p>
            <p class="text-gray-400 text-base">Trải nghiệm sống đẳng cấp với những tiện ích tối tân và vị trí đắc địa.</p>
          </div>
          
          <!-- Amenities highlights -->
          <div class="grid grid-cols-2 gap-4 mt-10">
            <div class="border border-accent/30 hover:border-accent px-6 py-4 transition-colors group cursor-default">
              <div class="text-accent font-serif text-2xl font-bold mb-1 group-hover:text-white transition-colors">Bảo Mật</div>
              <div class="text-gray-400 text-sm">24/7 An ninh</div>
            </div>
            <div class="border border-accent/30 hover:border-accent px-6 py-4 transition-colors group cursor-default">
              <div class="text-accent font-serif text-2xl font-bold mb-1 group-hover:text-white transition-colors">Tiện Ích</div>
              <div class="text-gray-400 text-sm">Đầy đủ dịch vụ</div>
            </div>
            <div class="border border-accent/30 hover:border-accent px-6 py-4 transition-colors group cursor-default">
              <div class="text-accent font-serif text-2xl font-bold mb-1 group-hover:text-white transition-colors">Vị Trí</div>
              <div class="text-gray-400 text-sm">Trung tâm</div>
            </div>
            <div class="border border-accent/30 hover:border-accent px-6 py-4 transition-colors group cursor-default">
              <div class="text-accent font-serif text-2xl font-bold mb-1 group-hover:text-white transition-colors">Thiết Kế</div>
              <div class="text-gray-400 text-sm">Hiện đại</div>
            </div>
          </div>
        </div>
        
        <!-- Premium image with borders -->
        <div class="flex-1 relative group">
          <div class="absolute -inset-6 border-2 border-accent/20 group-hover:border-accent/50 z-0 transition-all duration-700 hidden lg:block"></div>
          <div class="absolute -inset-2 border border-accent/40 z-0 hidden lg:block"></div>
          <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               class="relative z-10 w-full h-auto object-cover shadow-2xl group-hover:shadow-amber-900/30 transition-all duration-700" alt="About Project">
        </div>
      </section>

      <!-- Premium Properties Listing -->
      <section id="listing" class="py-32 bg-[#0a0f1c] relative">
        <!-- Accent glow background -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div class="text-center mb-20">
            <p class="text-accent tracking-[0.2em] text-xs uppercase font-sans font-semibold mb-6 inline-block">Bộ sưu tập độc quyền</p>
            <h2 class="text-5xl md:text-6xl font-serif text-white mb-6">{{ 'THEME.LUXURY.LISTING_TITLE' | translate }}</h2>
            <p class="font-sans text-gray-400 text-lg max-w-2xl mx-auto">{{ 'THEME.LUXURY.LISTING_SUB' | translate }}</p>
          </div>

          <!-- Enhanced Loading Spinner -->
          <div *ngIf="isLoading" class="flex justify-center py-20">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-2 border-accent/20 rounded-full animate-spin"></div>
              <div class="absolute inset-2 border-2 border-transparent border-t-accent rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 2s;"></div>
            </div>
          </div>

          <!-- Premium Grid Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <article *ngFor="let prop of properties; let i = index" class="group bg-[#0f172a] border border-gray-800 luxury-card" [style.animation]="'fadeUpLuxury 0.8s ease-out ' + (i * 0.15) + 's backwards'">
              
              <!-- Premium Image Section -->
              <div class="block relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-black to-gray-900">
                <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block w-full h-full absolute inset-0 z-0">
                  <img [src]="getThumbnail(prop)" class="w-full h-full object-cover transform group-hover:scale-120 transition-transform duration-700" alt="Property">
                </a>
                
                <!-- Favorite button with enhanced styling -->
                <button (click)="toggleFav($event, prop.id)" class="absolute top-5 right-5 z-10 p-3 rounded-full bg-black/50 backdrop-blur hover:bg-black/80 transition-all border border-white/20 hover:border-accent group/heart">
                  <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current scale-125' : 'text-gray-300 group-hover/heart:text-accent group-hover/heart:scale-110'" class="w-5 h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                
                <!-- Sophisticated gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"></div>
                
                <!-- Title & Price overlay -->
                <div class="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-3">
                  <h3 class="text-2xl font-serif text-white group-hover:text-accent transition-colors duration-500 line-clamp-2">{{ prop.title }}</h3>
                  <p class="text-accent font-sans font-bold text-2xl">{{ prop.price | number }} ₫</p>
                </div>
              </div>
              
              <!-- Premium Information Section -->
              <div class="p-8 font-sans bg-[#0f172a]">
                <!-- Features grid -->
                <div class="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-800">
                  <div *ngIf="prop.attributes?.bedrooms" class="text-center group/feature hover:border-b-2 hover:border-accent pb-2 transition-all">
                    <svg class="w-5 h-5 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    <div class="text-sm font-semibold text-gray-300 group-hover/feature:text-white">{{ prop.attributes.bedrooms }}</div>
                    <div class="text-xs text-gray-500">Phòng</div>
                  </div>
                  <div *ngIf="prop.attributes?.bathrooms" class="text-center group/feature hover:border-b-2 hover:border-accent pb-2 transition-all">
                    <svg class="w-5 h-5 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <div class="text-sm font-semibold text-gray-300 group-hover/feature:text-white">{{ prop.attributes.bathrooms }}</div>
                    <div class="text-xs text-gray-500">Toilet</div>
                  </div>
                  <div *ngIf="prop.attributes?.area" class="text-center group/feature hover:border-b-2 hover:border-accent pb-2 transition-all">
                    <svg class="w-5 h-5 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    <div class="text-sm font-semibold text-gray-300 group-hover/feature:text-white">{{ prop.attributes.area }}</div>
                    <div class="text-xs text-gray-500">m²</div>
                  </div>
                </div>
                
                <!-- Description -->
                <p class="text-sm text-gray-400 line-clamp-2 leading-relaxed">{{ prop.description }}</p>
              </div>
            </article>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && properties.length === 0" class="text-center py-24">
            <div class="text-6xl font-serif text-accent mb-4">✧</div>
            <p class="text-gray-300 text-lg font-sans font-semibold mb-2">Chưa có bất động sản</p>
            <p class="text-gray-500">Bộ sưu tập độc quyền sắp ra mắt</p>
          </div>
        </div>
      </section>

    </div>
  `
})
export class LuxuryComponent implements OnInit {
  @Input() project: any;
  
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private favoriteService = inject(FavoriteService);
  properties: any[] = [];
  isLoading = true;

  ngOnInit() {
    // Gọi API lấy danh sách sản phẩm. Ưu tiên lọc theo dự án hiện tại
    const endpoint = this.project?.id ? `/properties?project_id=${this.project.id}` : '/properties';
    this.api.get<any>(endpoint).subscribe({
      next: (res) => {
        this.properties = res.data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  getThumbnail(prop: any): string {
    if (prop.property_media && prop.property_media.length > 0) {
      const thumb = prop.property_media.find((m: any) => m.is_thumbnail);
      return thumb ? thumb.media_url : prop.property_media[0].media_url;
    }
    // Fallback ảnh mẫu nếu BĐS chưa có ảnh
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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
