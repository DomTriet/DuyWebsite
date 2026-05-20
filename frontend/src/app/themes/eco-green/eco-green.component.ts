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
    <div class="min-h-screen bg-theme text-green-900 pb-24">
      
      <!-- Enhanced Eco Header with Parallax -->
      <header class="bg-nature-pattern parallax-bg text-white py-20 px-6 md:px-12 rounded-b-[4rem] shadow-2xl relative overflow-hidden" style="background-position: center 0;">
        <!-- Animated background elements -->
        <div class="absolute top-10 right-10 opacity-20">
          <svg class="w-32 h-32 leaf-animate text-green-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm3.5-9c.8 0 1.5-.7 1.5-1.5S16.8 8 16 8s-1.5.7-1.5 1.5.7 1.5 1.5 1.5zm-7 0c.8 0 1.5-.7 1.5-1.5S9.8 8 9 8 7.5 8.7 7.5 9.5 8.2 11 9 11z"></path></svg>
        </div>
        <div class="absolute bottom-10 left-5 opacity-10">
          <svg class="w-48 h-48 leaf-animate" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"></circle></svg>
        </div>

        <!-- Navigation -->
        <nav class="absolute top-6 left-6 z-20 hidden md:flex gap-8 items-center text-sm font-semibold text-white/90 tracking-wide">
          <a routerLink="/" class="hover:text-white transition-colors relative group">{{ 'NAVBAR.HOME' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-200 group-hover:w-full transition-all duration-300"></span></a>
          <a routerLink="/about" class="hover:text-white transition-colors relative group">{{ 'NAVBAR.ABOUT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-200 group-hover:w-full transition-all duration-300"></span></a>
          <a routerLink="/blogs" class="hover:text-white transition-colors relative group">{{ 'NAVBAR.NEWS' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-200 group-hover:w-full transition-all duration-300"></span></a>
          <a routerLink="/contact" class="hover:text-white transition-colors relative group">{{ 'NAVBAR.CONTACT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-200 group-hover:w-full transition-all duration-300"></span></a>
        </nav>
        <div class="absolute top-6 right-6 z-20">
          <app-language-selector></app-language-selector>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-green-900/60 via-green-900/30 to-transparent"></div>
        
        <!-- Hero content with animations -->
        <div class="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center mt-12 mb-16">
          <span class="px-5 py-2 bg-green-50/20 rounded-full text-sm font-bold tracking-widest mb-8 backdrop-blur-md border border-green-200/40 inline-block animate-slide-in">
            🌱 {{ 'THEME.ECO_GREEN.BADGE' | translate }}
          </span>
          <h1 class="text-6xl md:text-7xl font-black mb-8 tracking-tighter text-white leading-tight" [style.animation]="'slideInUp 0.7s ease-out 0.2s backwards'">{{ project?.name || 'Eco-Green Project' }}</h1>
          <p class="text-xl text-green-50 font-medium max-w-3xl leading-relaxed mb-8" [style.animation]="'slideInUp 0.7s ease-out 0.4s backwards'">
            {{ project?.description }}
          </p>
          <a href="#listing" class="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-all hover:shadow-xl hover:-translate-y-1" [style.animation]="'slideInUp 0.7s ease-out 0.6s backwards'">
            Khám phá bây giờ
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </a>
        </div>
      </header>

      <!-- Eco Properties Collection -->
      <main id="listing" class="max-w-7xl mx-auto px-6 mt-20">
        <div class="flex justify-between items-end mb-16">
          <div>
            <h2 class="text-4xl md:text-5xl font-black text-green-900 mb-3">{{ 'THEME.ECO_GREEN.LISTING_TITLE' | translate }}</h2>
            <p class="text-green-700 font-semibold text-lg">{{ 'THEME.ECO_GREEN.LISTING_SUB' | translate }}</p>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center py-16">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
            <div class="absolute inset-2 rounded-full bg-green-50 flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10.5 1.5H9.5A8.5 8.5 0 001 10.5v1A8.5 8.5 0 009.5 20h1a8.5 8.5 0 008.5-8.5v-1A8.5 8.5 0 0010.5 1.5z"></path></svg>
            </div>
          </div>
        </div>

        <!-- Grid with Stagger Animation -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article 
            *ngFor="let prop of properties; let i = index" 
            class="bg-white rounded-2xl overflow-hidden shadow-lg border border-green-100 group eco-card-hover"
            [style.animation]="'slideInUp 0.6s ease-out ' + (i * 0.1) + 's backwards'">
            
            <!-- Image Container with Overlay -->
            <div class="block relative h-72 overflow-hidden bg-green-100">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]" class="block w-full h-full">
                <img [src]="getThumbnail(prop)" class="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" alt="Eco Property">
              </a>
              
              <!-- Gradient overlay on hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <!-- Favorite button -->
              <button (click)="toggleFav($event, prop.id)" class="absolute top-5 left-5 z-10 p-2.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all shadow-md hover:shadow-lg hover:scale-110">
                <svg [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-green-600'" class="w-5 h-5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>

              <!-- Eco badge -->
              <div class="absolute top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 group-hover:translate-y-[-4px] transition-transform duration-300">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg>
                Eco
              </div>
              
              <!-- Price tag -->
              <div class="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full font-black text-green-700 shadow-lg text-lg">{{ prop.price | number }} ₫</div>
            </div>
            
            <!-- Content Section -->
            <div class="p-7">
              <a [routerLink]="['/project', project?.id || prop.project_id, 'property', prop.slug]">
                <h3 class="text-xl font-black text-green-900 group-hover:text-green-600 transition-colors line-clamp-2 mb-2">{{ prop.title }}</h3>
              </a>
              <p class="text-green-700/70 text-sm line-clamp-2 mb-5 leading-relaxed">{{ prop.description }}</p>
              
              <!-- Features Grid -->
              <div class="grid grid-cols-2 gap-3 pt-5 border-t border-green-100">
                <div *ngIf="prop.attributes?.area" class="bg-green-50 px-4 py-2.5 rounded-lg text-center hover:bg-green-100 transition-colors">
                  <div class="text-xs text-green-600 font-semibold uppercase tracking-wider">Diện tích</div>
                  <div class="text-lg font-black text-green-900">{{ prop.attributes.area }} m²</div>
                </div>
                <div *ngIf="prop.attributes?.bedrooms" class="bg-green-50 px-4 py-2.5 rounded-lg text-center hover:bg-green-100 transition-colors">
                  <div class="text-xs text-green-600 font-semibold uppercase tracking-wider">Phòng ngủ</div>
                  <div class="text-lg font-black text-green-900">{{ prop.attributes.bedrooms }}</div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && properties.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🌿</div>
          <p class="text-green-700 text-lg font-semibold mb-2">Chưa có bất động sản nào</p>
          <p class="text-green-600">Vui lòng quay lại sau để khám phá những dự án sinh thái sắp ra mắt</p>
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
