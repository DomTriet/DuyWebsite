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
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <!-- Navigation Bar -->
      <nav class="bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div class="flex items-center gap-10">
          <a routerLink="/" class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent tracking-tighter">PRO</a>
          <div class="hidden md:flex gap-8 font-medium text-gray-600">
            <a routerLink="/" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.HOME' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/about" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.ABOUT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/blogs" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.NEWS' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/forum" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.COMMUNITY' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/contact" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.CONTACT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <app-language-selector></app-language-selector>
          
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/auth/login" class="text-gray-600 font-medium hover:text-indigo-600 hidden sm:block transition-colors">{{ 'NAVBAR.LOGIN' | translate }}</a>
            <a routerLink="/auth/register" class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hidden sm:block">{{ 'NAVBAR.REGISTER' | translate }}</a>
          </ng-container>
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/profile" class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hidden sm:block">{{ 'NAVBAR.PROFILE' | translate }}</a>
          </ng-container>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white py-24 px-6 text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
        <div class="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl -z-10"></div>
        
        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">{{ 'HOME.HERO_TITLE' | translate }}</h1>
        <p class="text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">{{ 'HOME.HERO_DESC' | translate }}</p>
        
        <!-- Search Form -->
        <div class="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-2xl">
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" formControlName="search" [placeholder]="'HOME.SEARCH_PLACEHOLDER' | translate" class="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            <input type="number" formControlName="min_price" [placeholder]="'HOME.MIN_PRICE' | translate" class="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            <input type="number" formControlName="max_price" [placeholder]="'HOME.MAX_PRICE' | translate" class="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            <button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all hover:shadow-lg">{{ 'HOME.SEARCH_BTN' | translate }}</button>
          </form>
        </div>
      </div>

      <!-- Kết quả Tìm kiếm BĐS -->
      <div class="max-w-7xl mx-auto px-6 py-20" *ngIf="searchedProperties.length > 0">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-4xl font-bold text-gray-900 mb-3">{{ 'HOME.SEARCH_RESULTS' | translate }}</h2>
            <p class="text-gray-600 text-lg">{{ 'HOME.FOUND_PROPS' | translate:{count: searchedProperties.length} }}</p>
          </div>
          <button (click)="clearSearch()" class="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Xóa bộ lọc
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let prop of searchedProperties" class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div class="block relative h-56 overflow-hidden bg-gray-200">
              <a [routerLink]="['/project', prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                <img [src]="getPropThumbnail(prop)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Thumb">
              </a>
              <button (click)="toggleFav($event, prop.id)" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 backdrop-blur shadow-lg hover:bg-white transition-all hover:scale-110">
                <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-gray-400'" class="w-6 h-6 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
              <div class="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-lg font-bold text-indigo-700 shadow-lg pointer-events-none">{{ prop.price | number }} ₫</div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors"><a [routerLink]="['/project', prop.project_id, 'property', prop.slug]">{{ prop.title }}</a></h3>
              <p class="text-gray-600 text-sm line-clamp-2">{{ prop.description }}</p>
            </div>
          </article>
        </div>
      </div>

      <!-- Projects Section (Mặc định) -->
      <div class="max-w-7xl mx-auto px-6 py-20" *ngIf="searchedProperties.length === 0">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">{{ 'HOME.FEATURED_PROJECTS' | translate }}</h2>
          <p class="text-gray-600 text-lg">Khám phá các dự án bất động sản hàng đầu</p>
        </div>
        
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let project of projects" class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div class="p-8 flex flex-col h-full">
              <div class="mb-6">
                <span class="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                  {{ project.theme_id }} THEME
                </span>
                <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{{ project.name }}</h3>
                <p class="text-gray-600 line-clamp-3 leading-relaxed">{{ project.description || 'Dự án mang đến trải nghiệm sống tuyệt vời với tiện ích nội khu đa dạng.' }}</p>
              </div>
              <div class="mt-auto pt-6 border-t border-gray-100">
                <a [routerLink]="['/project', project.id]" class="block w-full text-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg">
                  {{ 'HOME.EXPLORE_PROJECT' | translate }}
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
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
