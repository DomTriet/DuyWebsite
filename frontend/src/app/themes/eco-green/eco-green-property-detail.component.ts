import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LeadFormComponent } from '../../guest/lead-form.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { AgentCardComponent } from '../../guest/agent-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../core/services/seo.service';
import { FavoriteService } from '../../core/services/favorite.service';

@Component({
  selector: 'app-eco-green-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LeadFormComponent, AgentCardComponent, TranslateModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
    
    :host {
      --theme-primary: #f0fdf4;
      --theme-accent: #15803d;
      --rounded-box: 1.5rem;
      font-family: 'Quicksand', sans-serif;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .eco-gallery-hover img:hover {
      transform: scale(1.08);
      box-shadow: 0 10px 30px rgba(21, 128, 61, 0.3);
    }

    .eco-attribute {
      transition: all 0.4s ease;
    }

    .eco-attribute:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(21, 128, 61, 0.15);
    }
  `],
  template: `
    <div class="min-h-screen bg-green-50 text-green-900 pb-24" *ngIf="property">
      
      <!-- Enhanced Navigation -->
      <nav class="py-6 px-6 max-w-7xl mx-auto flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-green-100">
        <a routerLink=".." class="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-bold transition-all bg-white px-5 py-2 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Quay về bộ sưu tập
        </a>
      </nav>

      <main class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
        
        <!-- Left Side: Enhanced Content & Images -->
        <div class="lg:col-span-2 space-y-12">
          <!-- Enhanced Hero Image Gallery -->
          <div class="eco-gallery-hover rounded-[2.5rem] overflow-hidden shadow-2xl relative bg-green-100 h-[55vh]">
            <img [src]="getMedia(0)" class="w-full h-full object-cover transition-transform duration-700" alt="Main Image">
            <!-- Gradient overlay on hover -->
            <div class="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Thumbnail carousel -->
            <div class="absolute bottom-6 left-6 right-6 flex gap-3 overflow-x-auto pb-2">
              <img *ngFor="let img of property.property_media?.slice(1, 5)" 
                   [src]="img.media_url" 
                   class="w-24 h-24 object-cover rounded-xl border-3 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" 
                   alt="Thumbnail">
            </div>
          </div>

          <!-- Title & Enhanced Info -->
          <div class="animate-fade-in">
            <div class="flex items-center gap-3 mb-5 justify-between flex-wrap">
              <span class="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full hover:bg-green-700 transition-colors">🌱 {{ property.categories?.name || 'Sinh Thái' }}</span>
              <div class="flex gap-3">
                <button (click)="toggleFav()" class="p-3 rounded-full hover:bg-green-100 transition-all hover:scale-110">
                  <svg [ngClass]="isFav ? 'text-red-500 fill-current scale-125' : 'text-green-600'" class="w-7 h-7 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                <button (click)="shareProperty()" class="p-3 rounded-full hover:bg-green-100 transition-all hover:scale-110" title="Chia sẻ">
                  <svg class="w-7 h-7 text-green-600 hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </button>
              </div>
            </div>
            <h1 class="text-5xl md:text-6xl font-black text-green-900 mb-5 leading-tight">{{ property.title }}</h1>
            <div class="text-4xl font-bold text-green-700 inline-block px-5 py-2 bg-green-100/50 rounded-xl">{{ property.price | number }} ₫</div>
          </div>

          <!-- Enhanced ECO Attributes Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div *ngIf="property.attributes?.area" class="eco-attribute bg-gradient-to-br from-green-50 to-green-100/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center border-2 border-green-200 hover:border-green-600">
              <svg class="w-10 h-10 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              <span class="text-xs text-green-700 font-bold uppercase tracking-wider">Diện tích</span>
              <span class="text-2xl font-black text-green-900 mt-2">{{ property.attributes.area }} m²</span>
            </div>
            
            <div *ngIf="property.attributes?.green_area" class="eco-attribute bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center border-2 border-emerald-200 hover:border-emerald-600">
              <svg class="w-10 h-10 text-emerald-600 mb-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg>
              <span class="text-xs text-emerald-700 font-bold uppercase tracking-wider">Mật độ xanh</span>
              <span class="text-2xl font-black text-emerald-900 mt-2">{{ property.attributes.green_area }}</span>
            </div>

            <div *ngIf="property.attributes?.lake_view" class="eco-attribute bg-gradient-to-br from-blue-50 to-blue-100/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center border-2 border-blue-200 hover:border-blue-600">
              <svg class="w-10 h-10 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              <span class="text-xs text-blue-700 font-bold uppercase tracking-wider">Cảnh quan</span>
              <span class="text-xl font-black text-blue-900 mt-2">{{ 'ATTRIBUTES.VIEW_LAKE' | translate }}</span>
            </div>

            <div *ngIf="property.attributes?.security_247" class="eco-attribute bg-gradient-to-br from-green-50 to-green-100/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center border-2 border-green-200 hover:border-green-600">
              <svg class="w-10 h-10 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span class="text-xs text-green-700 font-bold uppercase tracking-wider">An ninh</span>
              <span class="text-2xl font-black text-green-900 mt-2">24/7</span>
            </div>
          </div>

          <!-- Enhanced Description -->
          <div class="bg-gradient-to-br from-white to-green-50 p-10 rounded-2xl shadow-lg border-2 border-green-100 animate-fade-in" style="animation-delay: 0.2s;">
            <h2 class="text-3xl font-bold mb-6 text-green-900 flex items-center gap-3">
              <span class="text-3xl">🏡</span>
              Không gian sống
            </h2>
            <p class="text-green-900/85 leading-relaxed text-lg whitespace-pre-wrap font-medium line-height-8">{{ property.description }}</p>
          </div>

          <!-- Enhanced Location & Map Section -->
          <div class="bg-white p-10 rounded-2xl shadow-lg border-2 border-green-100 animate-fade-in" style="animation-delay: 0.4s;">
             <h2 class="text-3xl font-bold mb-8 text-green-900 flex items-center gap-3">
               <span class="text-3xl">📍</span>
               Vị trí & Bản đồ
             </h2>
             <div class="w-full h-72 bg-green-50 rounded-2xl border-3 border-green-200 flex items-center justify-center relative overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="Map">
                <div class="relative z-10 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl text-green-800 font-black flex items-center gap-3 hover:shadow-2xl transition-all hover:scale-105">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                  Vị trí vàng trung tâm
                </div>
             </div>
          </div>
        </div>

        <!-- Right Side: Lead Form Sidebar -->
        <aside class="relative space-y-8">
          <app-agent-card *ngIf="property.agent" [agentInfo]="property.agent"></app-agent-card>
          <div class="sticky top-10 bg-white rounded-[2rem] shadow-xl p-2 border-4 border-green-50 overflow-hidden">
            <app-lead-form [propertyId]="property.id" [agentId]="property.agent_id"></app-lead-form>
          </div>
        </aside>
      </main>
    </div>
  `
})
export class EcoGreenPropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);
  private seoService = inject(SeoService);
  private favoriteService = inject(FavoriteService);
  
  property: any = null;
  originalProperty: any = null;
  isFav = false;
  
  ngOnInit() { 
    const slug = this.route.snapshot.paramMap.get('slug'); 
    if (slug) {
      this.api.get<any>(`/properties/${slug}`).subscribe(res => { 
        this.property = res.data; 
        this.originalProperty = JSON.parse(JSON.stringify(res.data));
        this.isFav = this.favoriteService.isFavorite(this.property.id);
        
        this.loadTranslation();
        this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          this.loadTranslation();
        });

        this.cdr.markForCheck(); 
      }); 
    } 
  }

  toggleFav() {
    this.favoriteService.toggleFavorite(this.property.id);
    this.isFav = this.favoriteService.isFavorite(this.property.id);
  }

  shareProperty() {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({ title: this.property.title, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('Đã sao chép đường dẫn!'));
    }
  }

  updateSeo() {
    this.seoService.setMeta({
      title: this.property.title,
      desc: this.property.description?.substring(0, 160) || '',
      image: this.getMedia(0)
    });
  }

  loadTranslation() {
    if (this.languageService.currentLang === 'vi') {
      this.property.title = this.originalProperty.title;
      this.property.description = this.originalProperty.description;
      this.updateSeo();
      this.cdr.markForCheck(); return;
    }
    this.languageService.getDynamicTranslation('property', this.property.id)?.subscribe(res => {
      if (!res.fallback) { this.property.title = res.data.title; this.property.description = res.data.description; }
      this.updateSeo();
      this.cdr.markForCheck();
    });
  }
  getMedia(index: number): string { const fallback = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'; if (!this.property?.property_media || this.property.property_media.length === 0) return fallback; return index < this.property.property_media.length ? this.property.property_media[index].media_url : this.property.property_media[0].media_url; }
}
