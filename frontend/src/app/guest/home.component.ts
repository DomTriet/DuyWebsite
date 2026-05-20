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
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation Bar -->
      <nav class="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div class="flex items-center gap-8">
          <a routerLink="/" class="text-2xl font-bold text-indigo-600 tracking-tighter">PRO-REALESTATE</a>
          <div class="hidden md:flex gap-6 font-medium text-gray-600">
            <a routerLink="/" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
            <a routerLink="/about" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
            <a routerLink="/blogs" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
            <a routerLink="/forum" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.COMMUNITY' | translate }}</a>
            <a routerLink="/contact" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <app-language-selector></app-language-selector>
          
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/auth/login" class="text-gray-600 font-medium hover:text-indigo-600 hidden sm:block">{{ 'NAVBAR.LOGIN' | translate }}</a>
            <a routerLink="/auth/register" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors hidden sm:block">{{ 'NAVBAR.REGISTER' | translate }}</a>
          </ng-container>
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/profile" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors hidden sm:block">{{ 'NAVBAR.PROFILE' | translate }}</a>
          </ng-container>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="bg-indigo-700 text-white py-24 px-6 text-center relative">
        <h1 class="text-5xl font-bold mb-6">{{ 'HOME.HERO_TITLE' | translate }}</h1>
        <p class="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">{{ 'HOME.HERO_DESC' | translate }}</p>
        
        <!-- Search Form -->
        <div class="max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-2xl">
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="text" formControlName="search" [placeholder]="'HOME.SEARCH_PLACEHOLDER' | translate" class="px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none">
            <input type="number" formControlName="min_price" [placeholder]="'HOME.MIN_PRICE' | translate" class="px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none">
            <input type="number" formControlName="max_price" [placeholder]="'HOME.MAX_PRICE' | translate" class="px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none">
            <button type="submit" class="bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">{{ 'HOME.SEARCH_BTN' | translate }}</button>
          </form>
        </div>
      </div>

      <!-- Kết quả Tìm kiếm BĐS -->
      <div class="max-w-7xl mx-auto px-6 py-16" *ngIf="searchedProperties.length > 0">
        <div class="flex justify-between items-end mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ 'HOME.SEARCH_RESULTS' | translate }}</h2>
            <p class="text-gray-500">{{ 'HOME.FOUND_PROPS' | translate:{count: searchedProperties.length} }}</p>
          </div>
          <button (click)="clearSearch()" class="text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Xóa bộ lọc
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let prop of searchedProperties" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
            <div class="block relative h-56 overflow-hidden">
              <a [routerLink]="['/project', prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                <img [src]="getPropThumbnail(prop)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Thumb">
              </a>
              <!-- Nút Thả tim -->
              <button (click)="toggleFav($event, prop.id)" class="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white transition-colors">
                <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-gray-400'" class="w-5 h-5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
              <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg font-bold text-indigo-700 shadow-sm pointer-events-none">{{ prop.price | number }} ₫</div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600"><a [routerLink]="['/project', prop.project_id, 'property', prop.slug]">{{ prop.title }}</a></h3>
              <p class="text-gray-500 text-sm line-clamp-2 mb-4">{{ prop.description }}</p>
            </div>
          </article>
        </div>
      </div>

      <!-- Projects Section (Mặc định) -->
      <div class="max-w-7xl mx-auto px-6 py-16" *ngIf="searchedProperties.length === 0">
        <h2 class="text-3xl font-bold text-gray-900 mb-10 text-center">{{ 'HOME.FEATURED_PROJECTS' | translate }}</h2>
        
        <div *ngIf="isLoading" class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let project of projects" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-8 flex flex-col h-full">
              <div class="mb-4">
                <span class="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
                  {{ project.theme_id }} THEME
                </span>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ project.name }}</h3>
                <p class="text-gray-500 line-clamp-3">{{ project.description || 'Dự án mang đến trải nghiệm sống tuyệt vời với tiện ích nội khu đa dạng.' }}</p>
              </div>
              <div class="mt-auto pt-6 border-t border-gray-100">
                <a [routerLink]="['/project', project.id]" class="block w-full text-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
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