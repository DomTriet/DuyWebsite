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
    <div class="min-h-screen bg-white text-green-900 pb-24" *ngIf="property">
      
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink=".." class="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại
          </a>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 py-12">
        
        <!-- Left Side: Content & Images -->
        <div class="lg:col-span-2 space-y-12">
          <!-- Hero Image Gallery -->
          <div class="rounded-2xl overflow-hidden shadow-xl relative bg-gray-100 h-96">
            <img [src]="getMedia(0)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            
            <!-- Thumbnail Carousel -->
            <div class="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-1">
              <img *ngFor="let img of property.property_media?.slice(1, 5)" 
                   [src]="img.media_url" 
                   class="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform flex-shrink-0">
            </div>
          </div>

          <!-- Title & Info -->
          <div>
            <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
              <span class="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full">🌱 {{ property.categories?.name || 'Sinh Thái' }}</span>
              <div class="flex gap-2">
                <button (click)="toggleFav()" class="p-2 rounded-lg hover:bg-green-100 transition-all hover:scale-110">
                  <svg [ngClass]="isFav ? 'text-red-500 fill-current' : 'text-green-600'" class="w-6 h-6 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                <button (click)="shareProperty()" class="p-2 rounded-lg hover:bg-green-100 transition-all hover:scale-110">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </button>
              </div>
            </div>
            <h1 class="text-4xl md:text-5xl font-black text-green-900 mb-4">{{ property.title }}</h1>
            <div class="text-3xl font-black text-green-600">{{ property.price | number }} ₫</div>
          </div>

          <!-- ECO Attributes Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div *ngIf="property.attributes?.area" class="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200 text-center hover:shadow-md transition-all">
              <div class="text-2xl font-black text-green-600 mb-1">{{ property.attributes.area }}</div>
              <div class="text-xs font-semibold text-gray-600 uppercase">m² Diện tích</div>
            </div>
            
            <div *ngIf="property.attributes?.bedrooms" class="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-200 text-center hover:shadow-md transition-all">
              <div class="text-2xl font-black text-emerald-600 mb-1">{{ property.attributes.bedrooms }}</div>
              <div class="text-xs font-semibold text-gray-600 uppercase">Phòng ngủ</div>
            </div>

            <div *ngIf="property.attributes?.green_area" class="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl border border-teal-200 text-center hover:shadow-md transition-all">
              <div class="text-2xl font-black text-teal-600 mb-1">{{ property.attributes.green_area }}</div>
              <div class="text-xs font-semibold text-gray-600 uppercase">Mật độ xanh</div>
            </div>

            <div *ngIf="property.attributes?.lake_view" class="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200 text-center hover:shadow-md transition-all">
              <div class="text-2xl font-black text-blue-600 mb-1">Có</div>
              <div class="text-xs font-semibold text-gray-600 uppercase">Cảnh hồ</div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border border-green-200">
            <h2 class="text-2xl font-black text-green-900 mb-5">Thông tin chi tiết</h2>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ property.description }}</p>
          </div>

          <!-- Location Section -->
          <div class="bg-white p-8 rounded-xl border border-green-200">
            <h2 class="text-2xl font-black text-green-900 mb-6">Vị trí</h2>
            <div class="w-full h-64 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
              <div class="text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                <p class="text-sm">Vị trí trung tâm</p>
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
