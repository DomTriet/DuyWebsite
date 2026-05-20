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
    :host {
      --theme-primary: #f0fdf4;
      --theme-accent: #15803d;
      --rounded-box: 1.5rem;
      font-family: 'Quicksand', sans-serif;
    }
  `],
  template: `
    <div class="min-h-screen bg-green-50 text-green-900 pb-24" *ngIf="property">
      
      <!-- Navigation -->
      <nav class="py-6 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <a routerLink=".." class="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Quay về
        </a>
      </nav>

      <main class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <!-- Left Side: Content & Images -->
        <div class="lg:col-span-2 space-y-10">
          <!-- Hero Image -->
          <div class="w-full h-[50vh] rounded-[2rem] overflow-hidden shadow-lg relative bg-green-100">
            <img [src]="getMedia(0)" class="w-full h-full object-cover" alt="Main Image">
            <div class="absolute bottom-4 left-4 flex gap-2">
              <img *ngFor="let img of property.property_media?.slice(1, 4)" [src]="img.media_url" class="w-20 h-20 object-cover rounded-2xl border-2 border-white shadow-md">
            </div>
          </div>

          <!-- Title & Basic Info -->
          <div>
            <div class="flex items-center gap-3 mb-4 justify-between">
              <span class="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">{{ property.categories?.name || 'Sinh Thái' }}</span>
              <div class="flex gap-2">
                <button (click)="toggleFav()" class="p-2 rounded-full hover:bg-green-100 transition-colors">
                  <svg [ngClass]="isFav ? 'text-red-500 fill-current' : 'text-green-600'" class="w-8 h-8 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                <button (click)="shareProperty()" class="p-2 rounded-full hover:bg-green-100 transition-colors" title="Chia sẻ">
                  <svg class="w-8 h-8 text-green-600 hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </button>
              </div>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold text-green-900 mb-4">{{ property.title }}</h1>
            <div class="text-3xl font-bold text-green-700">{{ property.price | number }} ₫</div>
          </div>

          <!-- ECO & JSONB Attributes (Light Green Grid) -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div *ngIf="property.attributes?.area" class="bg-green-100/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center border border-green-200">
              <svg class="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              <span class="text-xs text-green-700 font-semibold">{{ 'ATTRIBUTES.AREA' | translate | uppercase }}</span>
              <span class="text-lg font-bold text-green-900">{{ property.attributes.area }} m²</span>
            </div>
            
            <!-- JSONB Extractor: Mật độ xanh -->
            <div *ngIf="property.attributes?.green_area" class="bg-green-100/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center border border-green-200">
              <svg class="w-8 h-8 text-green-600 mb-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg>
              <span class="text-xs text-green-700 font-semibold">{{ 'ATTRIBUTES.GREEN_DENSITY' | translate | uppercase }}</span>
              <span class="text-lg font-bold text-green-900">{{ property.attributes.green_area }}</span>
            </div>

            <!-- JSONB Extractor: View Hồ -->
            <div *ngIf="property.attributes?.lake_view" class="bg-blue-50 p-4 rounded-3xl flex flex-col items-center justify-center text-center border border-blue-200">
              <svg class="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              <span class="text-xs text-blue-700 font-semibold">{{ 'ATTRIBUTES.LANDSCAPE' | translate | uppercase }}</span>
              <span class="text-lg font-bold text-blue-900">{{ 'ATTRIBUTES.VIEW_LAKE' | translate }}</span>
            </div>

            <!-- JSONB Extractor: An ninh 24/7 -->
            <div *ngIf="property.attributes?.security_247" class="bg-green-100/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center border border-green-200">
              <svg class="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span class="text-xs text-green-700 font-semibold">{{ 'ATTRIBUTES.SECURITY' | translate | uppercase }}</span>
              <span class="text-lg font-bold text-green-900">24/7</span>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-green-50">
            <h2 class="text-2xl font-bold mb-6 text-green-800">Không gian sống</h2>
            <p class="text-green-900/80 leading-loose text-lg whitespace-pre-wrap font-medium">{{ property.description }}</p>
          </div>

          <!-- Tích hợp Component Bản đồ Dự án Tĩnh (Giả lập bằng SVG/Ảnh) -->
          <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-green-50">
             <h2 class="text-2xl font-bold mb-6 text-green-800">Vị trí & Bản đồ</h2>
             <div class="w-full h-64 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50" alt="Map">
                <div class="relative z-10 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg text-green-800 font-bold flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                  Vị trí vàng trung tâm Sinh thái
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