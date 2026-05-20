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
  `],
  template: `
    <div class="min-h-screen bg-black text-white">
      
      <!-- 1. Header (Absolute đè lên Banner) -->
      <header class="absolute top-0 w-full z-50 py-6 px-8 flex justify-between items-center bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div class="text-2xl font-serif text-accent font-bold tracking-widest uppercase">
          {{ project?.name || 'LUXURY' }}
        </div>
        <nav class="hidden md:flex gap-8 items-center text-sm font-sans tracking-widest text-gray-300">
          <a routerLink="/" class="hover:text-accent transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
          <a routerLink="/about" class="hover:text-accent transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
          <a routerLink="/blogs" class="hover:text-accent transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
          <a routerLink="/contact" class="hover:text-accent transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          <app-language-selector></app-language-selector>
        </nav>
      </header>

      <!-- 2. Hero Banner (h-screen) -->
      <section class="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0f172a] z-10"></div>
        <!-- Gợi ý: Có thể thay thẻ img thành <video autoplay loop muted> nếu có link video dự án -->
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
             class="absolute inset-0 w-full h-full object-cover z-0" alt="Hero">
        
        <div class="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20" data-aos="fade-up">
          <p class="text-accent tracking-[0.3em] text-sm md:text-base mb-6 uppercase font-sans">{{ 'THEME.LUXURY.HERO_SUB' | translate }}</p>
          <h1 class="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
            {{ project?.name || 'Khởi Nguồn Tinh Hoa' }}
          </h1>
          <p class="text-lg font-sans text-gray-300 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
            {{ project?.description || 'Khám phá bộ sưu tập những bất động sản đẳng cấp nhất.' }}
          </p>
          <a href="#listing" class="inline-block border border-accent text-accent px-8 py-3.5 font-sans tracking-widest text-sm hover:bg-accent hover:text-[#0f172a] transition-all duration-300">
            {{ 'THEME.LUXURY.EXPLORE_NOW' | translate }}
          </a>
        </div>
      </section>

      <!-- 3. Khối Giới thiệu Dự án (About) -->
      <section id="about" class="py-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center bg-[#0f172a]">
        <div class="flex-1">
          <h2 class="text-3xl md:text-5xl font-serif text-accent mb-8 leading-tight" [innerHTML]="'THEME.LUXURY.ABOUT_TITLE' | translate"></h2>
          <div class="font-sans text-gray-400 text-lg leading-relaxed space-y-6">
            <p>{{ project?.description }}</p>
          </div>
        </div>
        <div class="flex-1 relative">
          <div class="absolute -inset-4 border border-accent/30 z-0 hidden lg:block"></div>
          <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               class="relative z-10 w-full h-auto object-cover shadow-2xl" alt="About Project">
        </div>
      </section>

      <!-- 4. Lưới Danh sách Bất động sản (Listing) -->
      <section id="listing" class="py-24 bg-[#0a0f1c]">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-serif text-accent mb-4">{{ 'THEME.LUXURY.LISTING_TITLE' | translate }}</h2>
            <p class="font-sans text-gray-400">{{ 'THEME.LUXURY.LISTING_SUB' | translate }}</p>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="isLoading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>

          <!-- Grid Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <article *ngFor="let prop of properties" class="group bg-[#0f172a] border border-gray-800 transition-all hover:border-accent">
              
              <!-- Khung Ảnh tỷ lệ 4:3 -->
              <div class="block relative aspect-[4/3] overflow-hidden">
                <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block w-full h-full absolute inset-0 z-0">
                  <img [src]="getThumbnail(prop)" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt="Property">
                </a>
                
                <!-- Nút Thả tim -->
                <button (click)="toggleFav($event, prop.id)" class="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-colors border border-white/10">
                  <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-gray-300 hover:text-accent'" class="w-5 h-5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                
                <!-- Gradient Đen mờ từ dưới lên -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-0"></div>
                <!-- Tiêu đề & Giá đè lên ảnh -->
                <div class="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                  <h3 class="text-xl font-serif text-white group-hover:text-accent transition-colors truncate pr-4">{{ prop.title }}</h3>
                  <p class="text-accent font-sans font-bold text-lg whitespace-nowrap">{{ prop.price | number }} ₫</p>
                </div>
              </div>
              
              <!-- Thông tin chi tiết bóc tách từ JSONB -->
              <div class="p-6 font-sans">
                <div class="flex items-center gap-6 text-sm text-gray-300 mb-5 border-b border-gray-800 pb-5">
                  <span *ngIf="prop.attributes?.bedrooms" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    {{ prop.attributes.bedrooms }} {{ 'THEME.LUXURY.BEDROOMS' | translate }}
                  </span>
                  <span *ngIf="prop.attributes?.bathrooms" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    {{ prop.attributes.bathrooms }} {{ 'THEME.LUXURY.BATHROOMS' | translate }}
                  </span>
                  <span *ngIf="prop.attributes?.area" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    {{ prop.attributes.area }} m²
                  </span>
                </div>
                <p class="text-sm text-gray-500 line-clamp-2 leading-relaxed">{{ prop.description }}</p>
              </div>
            </article>
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