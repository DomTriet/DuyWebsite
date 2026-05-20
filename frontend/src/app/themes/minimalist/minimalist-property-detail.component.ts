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
  `],
  template: `
    <div class="min-h-screen bg-white text-gray-900 pb-24" *ngIf="property">
      
      <!-- Minimalist Header -->
      <header class="py-6 px-6 max-w-6xl mx-auto flex justify-between items-center bg-white z-50">
        <a routerLink=".." class="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Quay lại
        </a>
      </header>

      <main class="max-w-6xl mx-auto px-6 pt-4">
        
        <!-- Header Info -->
        <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div class="flex-1 w-full min-w-0">
            <div class="flex items-start justify-between gap-4">
              <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-2 flex-1 break-words">{{ property.title }}</h1>
              <button (click)="toggleFav()" class="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 mt-1">
                <svg [ngClass]="isFav ? 'text-red-500 fill-current' : 'text-gray-400'" class="w-8 h-8 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
              <button (click)="shareProperty()" class="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 mt-1" title="Chia sẻ">
                <svg class="w-8 h-8 text-gray-400 hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              </button>
            </div>
            <p class="text-gray-500 font-medium">{{ property.categories?.name || 'Nhà phố' }}</p>
          </div>
          <div class="text-3xl font-bold tracking-tight">
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
          <h2 class="text-2xl font-bold tracking-tight mb-6">Tổng quan</h2>
          <p class="text-gray-600 leading-relaxed whitespace-pre-wrap mb-12 text-lg font-light">{{ property.description }}</p>

          <h2 class="text-2xl font-bold tracking-tight mb-6">Thông số chi tiết</h2>
          <dl class="divide-y divide-gray-200 border-t border-b border-gray-200 mb-16">
            <div *ngIf="property.attributes?.area" class="py-4 flex justify-between">
              <dt class="text-gray-500">{{ 'ATTRIBUTES.AREA' | translate }}</dt>
              <dd class="font-medium">{{ property.attributes.area }} m²</dd>
            </div>
            <div *ngIf="property.attributes?.floors" class="py-4 flex justify-between">
              <dt class="text-gray-500">{{ 'ATTRIBUTES.FLOORS' | translate }}</dt>
              <dd class="font-medium">{{ property.attributes.floors }}</dd>
            </div>
            <div *ngIf="property.attributes?.bedrooms" class="py-4 flex justify-between">
              <dt class="text-gray-500">{{ 'ATTRIBUTES.BEDROOMS' | translate }}</dt>
              <dd class="font-medium">{{ property.attributes.bedrooms }}</dd>
            </div>
            <div *ngIf="property.attributes?.bathrooms" class="py-4 flex justify-between">
              <dt class="text-gray-500">{{ 'ATTRIBUTES.BATHROOMS' | translate }}</dt>
              <dd class="font-medium">{{ property.attributes.bathrooms }}</dd>
            </div>
            <div *ngIf="property.attributes?.frontage" class="py-4 flex justify-between">
              <dt class="text-gray-500">{{ 'ATTRIBUTES.FRONTAGE' | translate }}</dt>
              <dd class="font-medium">{{ property.attributes.frontage }} m</dd>
            </div>
            <div *ngIf="property.attributes?.street_width" class="py-4 flex justify-between">
              <dt class="text-gray-500">{{ 'ATTRIBUTES.STREET_WIDTH' | translate }}</dt>
              <dd class="font-medium">{{ property.attributes.street_width }} m</dd>
            </div>
          </dl>

          <!-- Vị trí -->
          <h2 class="text-2xl font-bold tracking-tight mb-6">Vị trí</h2>
          <div class="w-full h-64 bg-gray-100 mb-16 flex items-center justify-center relative overflow-hidden border border-gray-200">
             <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="absolute inset-0 w-full h-full object-cover opacity-60 filter grayscale" alt="Map">
             <div class="relative z-10 bg-white px-6 py-3 shadow-md text-gray-900 font-bold flex items-center gap-2">
               <svg class="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
               Vị trí Trung tâm
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