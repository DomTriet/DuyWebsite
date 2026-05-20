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
  selector: 'app-luxury-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LeadFormComponent, AgentCardComponent, TranslateModule],
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

    @keyframes luxuryFadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-luxury-fade {
      animation: luxuryFadeIn 0.8s ease-out forwards;
    }

    .thumbnail-active {
      border-color: var(--theme-accent);
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
    }

    .attribute-luxury {
      transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .attribute-luxury:hover {
      border-color: var(--theme-accent);
      transform: translateY(-4px);
    }
  `],
  template: `
    <div class="min-h-screen bg-[#0a0f1c] text-gray-300 font-sans pb-24" *ngIf="property">
      
      <!-- Navigation Bar -->
      <nav class="py-6 px-8 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50">
        <a routerLink=".." class="text-accent hover:text-white transition-colors flex items-center gap-2 text-sm tracking-widest uppercase">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Trở về bộ sưu tập
        </a>
        <div class="font-serif text-xl text-white truncate max-w-md hidden md:block">{{ property.title }}</div>
      </nav>

      <!-- Hero Image Gallery (Coverflow CSS-based) -->
      <div class="w-full h-[60vh] md:h-[75vh] relative overflow-hidden bg-black group select-none">
        <!-- Main Active Image -->
        <img [src]="activeImage" class="w-full h-full object-cover opacity-80 transition-opacity duration-700 ease-in-out" alt="Property Cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent"></div>
        
        <!-- Thumbnails Slider overlay at bottom -->
        <div class="absolute bottom-8 left-0 w-full px-8 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          <img *ngFor="let img of property.property_media" 
               [src]="img.media_url" 
               (click)="activeImage = img.media_url"
               class="w-32 h-20 object-cover cursor-pointer border-2 transition-all duration-300"
               [ngClass]="activeImage === img.media_url ? 'border-accent opacity-100 scale-105 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'">
        </div>
      </div>

      <!-- Main Content Layout -->
      <div class="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        <!-- Left Column: Details & JSONB Attributes -->
        <div class="lg:col-span-2 space-y-12">
          <header>
            <div class="text-accent tracking-widest text-sm mb-4 uppercase">{{ property.categories?.name || 'Tuyệt tác' }}</div>
            
            <div class="flex justify-between items-start gap-4">
              <h1 class="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight flex-1">{{ property.title }}</h1>
              <button (click)="toggleFav()" class="p-3 rounded-full border border-gray-700 hover:border-accent transition-colors group bg-black/50 backdrop-blur mt-2">
                <svg class="w-6 h-6 transition-colors" [ngClass]="isFav ? 'text-red-500 fill-current' : 'text-gray-400 group-hover:text-accent'" viewBox="0 0 24 24" stroke="currentColor" [attr.fill]="isFav ? 'currentColor' : 'none'"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
              <button (click)="shareProperty()" class="p-3 rounded-full border border-gray-700 hover:border-blue-400 transition-colors group bg-black/50 backdrop-blur mt-2" title="Chia sẻ">
                <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              </button>
            </div>

            <div class="text-3xl font-bold text-accent font-sans">{{ property.price | number }} ₫</div>
          </header>

          <!-- Enhanced Premium Attributes -->
          <section class="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-gray-700/50 py-12 animate-luxury-fade" style="animation-delay: 0.3s;">
            
            <div *ngIf="property.attributes?.bedrooms" class="attribute-luxury flex flex-col gap-4 p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-accent rounded-lg">
              <svg class="w-8 h-8 text-accent self-start" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span class="text-gray-400 text-xs uppercase tracking-widest font-semibold">{{ 'ATTRIBUTES.BEDROOMS' | translate }}</span>
              <div class="text-3xl text-white font-light font-serif">{{ property.attributes.bedrooms }}</div>
            </div>
            
            <div *ngIf="property.attributes?.bathrooms" class="attribute-luxury flex flex-col gap-4 p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-accent rounded-lg">
              <svg class="w-8 h-8 text-accent self-start" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span class="text-gray-400 text-xs uppercase tracking-widest font-semibold">{{ 'ATTRIBUTES.BATHROOMS' | translate }}</span>
              <div class="text-3xl text-white font-light font-serif">{{ property.attributes.bathrooms }}</div>
            </div>

            <div *ngIf="property.attributes?.area" class="attribute-luxury flex flex-col gap-4 p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-accent rounded-lg">
              <svg class="w-8 h-8 text-accent self-start" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              <span class="text-gray-400 text-xs uppercase tracking-widest font-semibold">{{ 'ATTRIBUTES.AREA' | translate }}</span>
              <div class="text-3xl text-white font-light font-serif">{{ property.attributes.area }} <span class="text-base text-gray-400">m²</span></div>
            </div>

            <div *ngIf="property.attributes?.balcony_direction" class="attribute-luxury flex flex-col gap-4 p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-accent rounded-lg">
              <svg class="w-8 h-8 text-accent self-start" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              <span class="text-gray-400 text-xs uppercase tracking-widest font-semibold">{{ 'ATTRIBUTES.BALCONY_DIR' | translate }}</span>
              <div class="text-2xl text-white font-light font-serif">{{ property.attributes.balcony_direction }}</div>
            </div>

          </section>

          <!-- Enhanced Description Text -->
          <section class="animate-luxury-fade" style="animation-delay: 0.5s;">
            <h2 class="text-4xl font-serif text-white mb-8">Tổng quan không gian sống</h2>
            <div class="prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed whitespace-pre-wrap font-light border-l-4 border-accent pl-8">
              {{ property.description }}
            </div>
          </section>

          <!-- Enhanced Location & Map -->
          <section class="animate-luxury-fade" style="animation-delay: 0.7s;">
             <h2 class="text-4xl font-serif text-white mb-8">Vị trí dự án</h2>
             <div class="w-full h-72 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 hover:border-accent/50 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-30 hover:opacity-50 transition-opacity" alt="Map">
                <div class="relative z-10 bg-black/70 backdrop-blur-md px-8 py-4 rounded-lg border border-accent text-accent font-sans font-bold flex items-center gap-3 hover:bg-black/90 transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                  Tọa độ Độc tôn - Vị Trí Chiến Lược
                </div>
             </div>
          </section>
        </div>

        <!-- Right Column: Lead Form (Sticky) -->
        <aside class="relative space-y-8">
          <app-agent-card *ngIf="property.agent" [agentInfo]="property.agent"></app-agent-card>
          <!-- Wrap LeadForm in a container to add padding and make it sticky -->
          <div class="sticky top-24 bg-[#0f172a] rounded-xl p-2 border border-gray-800 shadow-2xl">
             <app-lead-form [propertyId]="property.id" [agentId]="property.agent_id"></app-lead-form>
          </div>
        </aside>
      </div>
    </div>
  `
})
export class LuxuryPropertyDetailComponent implements OnInit {
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
  activeImage: string = '';
  isFav = false;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.api.get<any>(`/properties/${slug}`).subscribe(res => {
        this.property = res.data;
        // Deep copy để lưu giữ lại bản gốc Tiếng Việt
        this.originalProperty = JSON.parse(JSON.stringify(res.data));
        // Auto select thumbnail or first image
        const thumb = this.property?.property_media?.find((m: any) => m.is_thumbnail);
        this.activeImage = thumb ? thumb.media_url : (this.property?.property_media?.[0]?.media_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
        this.isFav = this.favoriteService.isFavorite(this.property.id);
        
        this.loadTranslation();
        
        // Lắng nghe sự kiện người dùng bấm Nút Cờ đổi ngôn ngữ
        this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          this.loadTranslation();
        });
        
        this.cdr.markForCheck(); // Đánh dấu cần render, an toàn hơn detectChanges
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
      image: this.activeImage
    });
  }

  loadTranslation() {
    if (this.languageService.currentLang === 'vi') {
      this.property.title = this.originalProperty.title;
      this.property.description = this.originalProperty.description;
      this.updateSeo();
      this.cdr.markForCheck();
      return;
    }
    
    this.languageService.getDynamicTranslation('property', this.property.id)?.subscribe(res => {
      if (!res.fallback) {
        this.property.title = res.data.title;
        this.property.description = res.data.description;
      } else {
        console.warn('Bản dịch Tiếng Anh đang chờ Admin duyệt. Hiển thị ngôn ngữ gốc (Fallback).');
        this.property.title = this.originalProperty.title;
        this.property.description = this.originalProperty.description;
      }
      this.updateSeo();
      this.cdr.markForCheck();
    });
  }
}
