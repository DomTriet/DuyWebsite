import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { LanguageSelectorComponent } from '../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../core/services/seo.service';
import { FavoriteService } from '../core/services/favorite.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LanguageSelectorComponent, TranslateModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">RESTATE</a>
          <div class="hidden md:flex gap-10 items-center">
            <a routerLink="/" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
            <a routerLink="/about" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
            <a routerLink="/blogs" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
            <a routerLink="/forum" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.COMMUNITY' | translate }}</a>
            <a routerLink="/contact" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
          <div class="flex items-center gap-4">
            <app-language-selector></app-language-selector>
            <ng-container *ngIf="!isLoggedIn">
              <a routerLink="/auth/login" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors hidden sm:inline">{{ 'NAVBAR.LOGIN' | translate }}</a>
              <a routerLink="/auth/register" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">{{ 'NAVBAR.REGISTER' | translate }}</a>
            </ng-container>
            <ng-container *ngIf="isLoggedIn">
              <a routerLink="/profile" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">{{ 'NAVBAR.PROFILE' | translate }}</a>
            </ng-container>
          </div>
        </div>
      </nav>

      <!-- Hero Section with Search -->
      <section class="bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="h-full w-full"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
        </div>
        <div class="max-w-6xl mx-auto px-6 py-24 relative">
          <div class="text-center mb-16">
            <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">{{ 'HOME.HERO_TITLE' | translate }}</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{{ 'HOME.HERO_DESC' | translate }}</p>
          </div>
          
          <!-- Search Widget -->
          <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="lg:col-span-2">
                <input type="text" formControlName="search" [placeholder]="'HOME.SEARCH_PLACEHOLDER' | translate" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              </div>
              <input type="number" formControlName="min_price" [placeholder]="'HOME.MIN_PRICE' | translate" class="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <div class="flex gap-3">
                <input type="number" formControlName="max_price" [placeholder]="'HOME.MAX_PRICE' | translate" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <button type="submit" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all">Tìm</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Search Results or Featured Projects -->
      <ng-container *ngIf="searchedProperties.length > 0">
        <!-- Search Results Section -->
        <section class="max-w-7xl mx-auto px-6 py-20">
          <div class="flex justify-between items-center mb-12">
            <div>
              <h2 class="text-4xl font-black text-gray-900 mb-2">{{ 'HOME.SEARCH_RESULTS' | translate }}</h2>
              <p class="text-gray-600">{{ 'HOME.FOUND_PROPS' | translate:{count: searchedProperties.length} }}</p>
            </div>
            <button (click)="clearSearch()" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Xóa bộ lọc
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let prop of searchedProperties; let i = index" class="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-300" [style.animation]="'fadeInUp 0.5s ease-out ' + (i * 0.05) + 's backwards'">
              <div class="relative h-64 overflow-hidden bg-gray-200">
                <a [routerLink]="['/project', prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                  <img [src]="getPropThumbnail(prop)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                </a>
                <button (click)="toggleFav($event, prop.id)" class="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-all hover:scale-110">
                  <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-gray-400'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
              </div>
              <div class="p-6">
                <a [routerLink]="['/project', prop.project_id, 'property', prop.slug]" class="block mb-2">
                  <h3 class="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{{ prop.title }}</h3>
                </a>
                <p class="text-gray-600 text-sm line-clamp-2 mb-4">{{ prop.description }}</p>
                <div class="text-2xl font-black text-indigo-600">{{ prop.price | number }} ₫</div>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <!-- Featured Projects Section -->
      <ng-container *ngIf="searchedProperties.length === 0">
        <section class="max-w-7xl mx-auto px-6 py-24">
          <div class="text-center mb-16">
            <h2 class="text-5xl font-black text-gray-900 mb-4">{{ 'HOME.FEATURED_PROJECTS' | translate }}</h2>
            <p class="text-xl text-gray-600">Khám phá các dự án bất động sản nổi bật</p>
          </div>

          <div *ngIf="isLoading" class="flex justify-center py-16">
            <div class="relative w-10 h-10">
              <div class="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>

          <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let project of projects; let i = index" class="group rounded-xl border border-gray-200 bg-white hover:shadow-xl hover:border-indigo-300 transition-all duration-300" [style.animation]="'fadeInUp 0.5s ease-out ' + (i * 0.05) + 's backwards'">
              <div class="p-8 flex flex-col h-full">
                <div class="mb-auto">
                  <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4 uppercase">{{ project.theme_id }}</span>
                  <h3 class="text-2xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{{ project.name }}</h3>
                  <p class="text-gray-600 line-clamp-3">{{ project.description || 'Dự án mang đến trải nghiệm sống tuyệt vời.' }}</p>
                </div>
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <a [routerLink]="['/project', project.id]" class="block w-full py-3 text-center bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all">
                    {{ 'HOME.EXPLORE_PROJECT' | translate }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="bg-indigo-600 text-white py-20">
          <div class="max-w-4xl mx-auto px-6 text-center">
            <h2 class="text-4xl font-black mb-4">Bạn là người bán?</h2>
            <p class="text-xl text-indigo-100 mb-8">Liệt kê bất động sản của bạn ngay hôm nay</p>
            <a href="#" class="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-50 transition-all">Bắt đầu bán</a>
          </div>
        </section>
      </ng-container>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);
  private favoriteService = inject(FavoriteService);
  
  projects: any[] = [];
  searchedProperties: any[] = [];
  isLoading = true;
  isLoggedIn = false;

  searchForm: FormGroup = this.fb.group({
    search: [''],
    min_price: [''],
    max_price: ['']
  });

  ngOnInit() {
    // Kiểm tra trạng thái đăng nhập một cách an toàn để tránh lỗi SSR
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem('access_token');
    }

    this.seoService.setMeta({
      title: 'Trang chủ',
      desc: 'Nền tảng Bất động sản công nghệ cao, kết nối người mua và người bán thông minh, minh bạch.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    });

    this.api.get<any>('/projects').subscribe({
      next: (res) => { this.projects = res.data || []; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  onSearch() {
    const { search, min_price, max_price } = this.searchForm.value;
    let query = '/properties?';
    if (search) query += `search=${encodeURIComponent(search)}&`;
    if (min_price) query += `min_price=${min_price}&`;
    if (max_price) query += `max_price=${max_price}&`;
    
    this.api.get<any>(query).subscribe({
      next: (res) => { this.searchedProperties = res.data || []; this.cdr.markForCheck(); },
      error: (err) => console.error(err)
    });
  }

  clearSearch() {
    this.searchForm.reset();
    this.searchedProperties = [];
    this.cdr.markForCheck();
  }

  getPropThumbnail(prop: any): string {
    const thumb = prop.property_media?.find((m: any) => m.is_thumbnail);
    return thumb ? thumb.media_url : (prop.property_media?.[0]?.media_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80');
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
