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
  selector: 'app-minimalist-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LeadFormComponent, AgentCardComponent, TranslateModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    :host {
      --theme-primary: #ffffff;
      --theme-accent: #111827;
      font-family: 'Inter', sans-serif;
    }

    @keyframes minimalistSlide {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-minimal-fade {
      animation: minimalistSlide 0.5s ease-out forwards;
    }

    .spec-row {
      transition: all 0.3s ease;
    }

    .spec-row:hover {
      background-color: rgb(249, 250, 251);
    }
  `],
  template: `
    <div class="min-h-screen bg-white text-gray-900 pb-24" *ngIf="property">
      
      <!-- Clean Minimalist Header -->
      <header class="py-6 px-6 max-w-6xl mx-auto flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-gray-200">
        <a routerLink=".." class="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all hover:scale-105">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Quay lại
        </a>
      </header>

      <main class="max-w-6xl mx-auto px-6 pt-8">
        
        <!-- Enhanced Header Info -->
        <div class="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-8 animate-minimal-fade">
          <div class="flex-1 w-full min-w-0">
            <div class="flex items-start justify-between gap-4">
              <h1 class="text-5xl md:text-6xl font-black tracking-tight mb-3 flex-1 break-words text-gray-900">{{ property.title }}</h1>
              <div class="flex gap-3 flex-shrink-0 mt-2">
                <button (click)="toggleFav()" class="p-2.5 rounded-full hover:bg-gray-200 transition-all hover:scale-110">
                  <svg [ngClass]="isFav ? 'text-red-500 fill-current scale-125' : 'text-gray-500'" class="w-7 h-7 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                <button (click)="shareProperty()" class="p-2.5 rounded-full hover:bg-gray-200 transition-all hover:scale-110" title="Chia sẻ">
                  <svg class="w-7 h-7 text-gray-500 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </button>
              </div>
            </div>
            <p class="text-gray-600 font-semibold text-sm uppercase tracking-wide">{{ property.categories?.name || 'Nhà phố' }}</p>
          </div>
          <div class="text-4xl font-black tracking-tight text-gray-900 border-b-2 border-gray-900 pb-2">
            {{ property.price | number }} ₫
          </div>
        </div>

        <!-- Airbnb Style Image Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[50vh] md:h-[60vh] mb-16">
          <div class="relative w-full h-full overflow-hidden bg-gray-100 group">
            <img [src]="getMedia(0)" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cover">
          </div>
          <div class="hidden md:grid grid-rows-2 gap-4 h-full">
            <div class="relative w-full h-full overflow-hidden bg-gray-100 group">
              <img [src]="getMedia(1)" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Image 2">
            </div>
            <div class="relative w-full h-full overflow-hidden bg-gray-100 group">
              <img [src]="getMedia(2)" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Image 3">
            </div>
          </div>
        </div>

        <!-- Single Column Centered Layout -->
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold tracking-tight mb-8 animate-minimal-fade" style="animation-delay: 0.1s;">Tổng quan</h2>
          <p class="text-gray-700 leading-relaxed whitespace-pre-wrap mb-16 text-lg font-light animate-minimal-fade" style="animation-delay: 0.2s;">{{ property.description }}</p>

          <h2 class="text-3xl font-bold tracking-tight mb-8 animate-minimal-fade" style="animation-delay: 0.3s;">Thông số chi tiết</h2>
          <dl class="divide-y divide-gray-200 border-y border-gray-200 mb-16 animate-minimal-fade" style="animation-delay: 0.4s;">
            <div *ngIf="property.attributes?.area" class="spec-row py-5 flex justify-between items-center px-2 hover:px-4 transition-all">
              <dt class="text-gray-600 font-medium">{{ 'ATTRIBUTES.AREA' | translate }}</dt>
              <dd class="font-bold text-gray-900 text-lg">{{ property.attributes.area }} <span class="text-sm text-gray-500 font-normal">m²</span></dd>
            </div>
            <div *ngIf="property.attributes?.floors" class="spec-row py-5 flex justify-between items-center px-2 hover:px-4 transition-all">
              <dt class="text-gray-600 font-medium">{{ 'ATTRIBUTES.FLOORS' | translate }}</dt>
              <dd class="font-bold text-gray-900 text-lg">{{ property.attributes.floors }}</dd>
            </div>
            <div *ngIf="property.attributes?.bedrooms" class="spec-row py-5 flex justify-between items-center px-2 hover:px-4 transition-all">
              <dt class="text-gray-600 font-medium">{{ 'ATTRIBUTES.BEDROOMS' | translate }}</dt>
              <dd class="font-bold text-gray-900 text-lg">{{ property.attributes.bedrooms }}</dd>
            </div>
            <div *ngIf="property.attributes?.bathrooms" class="spec-row py-5 flex justify-between items-center px-2 hover:px-4 transition-all">
              <dt class="text-gray-600 font-medium">{{ 'ATTRIBUTES.BATHROOMS' | translate }}</dt>
              <dd class="font-bold text-gray-900 text-lg">{{ property.attributes.bathrooms }}</dd>
            </div>
            <div *ngIf="property.attributes?.frontage" class="spec-row py-5 flex justify-between items-center px-2 hover:px-4 transition-all">
              <dt class="text-gray-600 font-medium">{{ 'ATTRIBUTES.FRONTAGE' | translate }}</dt>
              <dd class="font-bold text-gray-900 text-lg">{{ property.attributes.frontage }} <span class="text-sm text-gray-500 font-normal">m</span></dd>
            </div>
            <div *ngIf="property.attributes?.street_width" class="spec-row py-5 flex justify-between items-center px-2 hover:px-4 transition-all">
              <dt class="text-gray-600 font-medium">{{ 'ATTRIBUTES.STREET_WIDTH' | translate }}</dt>
              <dd class="font-bold text-gray-900 text-lg">{{ property.attributes.street_width }} <span class="text-sm text-gray-500 font-normal">m</span></dd>
            </div>
          </dl>

          <!-- Location Section -->
          <h2 class="text-3xl font-bold tracking-tight mb-8 animate-minimal-fade" style="animation-delay: 0.5s;">Vị trí</h2>
          <div class="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-50 mb-16 flex items-center justify-center relative overflow-hidden border-2 border-gray-200 hover:border-gray-900 transition-all rounded-lg animate-minimal-fade" style="animation-delay: 0.6s;">
             <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-40 hover:opacity-60 transition-opacity filter grayscale" alt="Map">
             <div class="relative z-10 bg-white px-8 py-4 shadow-lg border-2 border-gray-900 text-gray-900 font-bold flex items-center gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all">
               <svg class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
               Vị trí trung tâm
             </div>
          </div>

          <!-- Contact Inline Bottom -->
          <h2 class="text-2xl font-bold tracking-tight mb-6">Liên hệ Môi giới</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div class="md:col-span-1">
              <app-agent-card *ngIf="property.agent" [agentInfo]="property.agent"></app-agent-card>
            </div>
            <div class="md:col-span-2 bg-gray-50 border border-gray-200 p-8">
               <app-lead-form [propertyId]="property.id" [agentId]="property.agent_id"></app-lead-form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class MinimalistPropertyDetailComponent implements OnInit {
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

        this.cdr.markForCheck(); // Đánh dấu cần render, an toàn hơn detectChanges
      });
    }
  }

  toggleFav() {
    this.favoriteService.toggleFavorite(this.property.id);
    this.isFav = this.favoriteService.isFavorite(this.property.id);
    this.cdr.markForCheck();
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
      this.cdr.markForCheck();
      return;
    }
    
    this.languageService.getDynamicTranslation('property', this.property.id)?.subscribe(res => {
      if (!res.fallback) {
        this.property.title = res.data.title;
        this.property.description = res.data.description;
      }
      this.updateSeo();
      this.cdr.markForCheck();
    });
  }

  getMedia(index: number): string {
    const fallback = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    if (!this.property?.property_media || this.property.property_media.length === 0) return fallback;
    return index < this.property.property_media.length ? this.property.property_media[index].media_url : this.property.property_media[0].media_url;
  }
}
