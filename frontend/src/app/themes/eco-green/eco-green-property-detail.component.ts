import { Component, OnInit, Input, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LeadFormComponent } from '../../guest/lead-form.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../core/services/toast.service';
import { LanguageService } from '../../core/services/language.service';
import { AgentCardComponent } from '../../guest/agent-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../core/services/seo.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { TrustUrlPipe } from '../../shared/pipes/trust-url.pipe';

@Component({
  selector: 'app-eco-green-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LeadFormComponent, AgentCardComponent, TranslateModule, TrustUrlPipe],
  styles: [`
    :host {
      --forest:    #1A3A2A;
      --leaf:      #2D6A4F;
      --sage:      #52B788;
      --mint:      #B7E4C7;
      --cream:     #F8F4EC;
      --parchment: #EFE9DC;
      --muted:     #7A8C7E;
      --white:     #FFFFFF;
      --rule:      #DDD7CC;
    }

    .font-head { font-family: 'Lora', Georgia, serif; }
    .font-body { font-family: 'Inter', system-ui, sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) both; }

    /* Nav */
    .eco-nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(26,58,42,0.97);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(82,183,136,0.2);
    }

    /* Gallery */
    .gallery-hero {
      width: 100%; height: 70vh; min-height: 400px;
      position: relative; overflow: hidden;
      background: var(--forest);
    }
    .gallery-hero-img {
      width: 100%; height: 100%;
      object-fit: cover; transition: opacity 0.4s ease;
    }
    .gallery-hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 55%, rgba(26,58,42,0.6) 100%);
      pointer-events: none;
    }
    .gallery-count {
      position: absolute; bottom: 20px; right: 20px;
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem; letter-spacing: 0.15em;
      color: rgba(248,244,236,0.75);
      background: rgba(26,58,42,0.6);
      backdrop-filter: blur(8px);
      padding: 7px 16px;
    }

    /* Thumb strip */
    .thumb-strip {
      background: var(--forest);
      border-bottom: 1px solid rgba(82,183,136,0.15);
      padding: 8px 7vw;
    }
    .thumb-row {
      display: flex; gap: 6px; overflow-x: auto;
      scrollbar-width: none; max-width: 1400px; margin: 0 auto;
    }
    .thumb-row::-webkit-scrollbar { display: none; }
    .thumb-img {
      width: 80px; height: 54px;
      object-fit: cover; flex-shrink: 0; cursor: pointer;
      opacity: 0.4; border: 2px solid transparent;
      transition: opacity 0.25s, border-color 0.25s;
    }
    .thumb-img.active { opacity: 1; border-color: var(--sage); }
    .thumb-img:hover  { opacity: 0.75; }

    /* Attributes */
    .attr-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 1px; background: var(--rule);
      border: 1px solid var(--rule);
    }
    .attr-cell {
      background: var(--white); padding: 18px 16px;
    }
    .attr-label {
      font-family: 'Inter', sans-serif;
      font-size: 0.6rem; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--muted);
      margin-bottom: 8px;
    }
    .attr-val {
      font-family: 'Lora', serif; font-style: italic;
      font-size: 1.4rem; color: var(--forest); line-height: 1;
    }

    /* Action btn */
    .act-btn {
      width: 40px; height: 40px;
      border: 1px solid rgba(82,183,136,0.3);
      background: transparent; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.25s, background 0.25s;
    }
    .act-btn:hover {
      border-color: var(--sage);
      background: rgba(82,183,136,0.08);
    }

    /* Sidebar */
    .eco-sidebar {
      position: sticky; top: 76px;
      border: 1px solid var(--rule);
      background: var(--white);
      overflow: hidden;
    }
    .eco-sidebar-header {
      background: var(--leaf);
      padding: 16px 22px;
      font-family: 'Lora', serif; font-style: italic;
      font-size: 1rem; color: var(--cream);
    }

    @media (max-width: 767px) {
      .gallery-hero { height: 56vw; min-height: 240px; }
    }
  `],
  template: `
    <div *ngIf="property" class="font-body" style="min-height:100vh; background:var(--parchment);">

      <!-- Nav -->
      <nav class="eco-nav">
        <div style="max-width:1400px; margin:0 auto; padding:0 7vw; height:62px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <a routerLink=".."
             style="display:flex;align-items:center;gap:10px;text-decoration:none;color:rgba(183,228,199,0.7);font-size:0.75rem;letter-spacing:0.1em;transition:color 0.3s;"
             onmouseenter="this.style.color='var(--mint)'" onmouseleave="this.style.color='rgba(183,228,199,0.7)'">
            <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            {{ 'THEME.DETAIL.BACK_LIST' | translate }}
          </a>
          <span class="font-head" style="font-style:italic;font-size:0.95rem;color:var(--mint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:500px;">
            {{ property.title }}
          </span>
          <div style="display:flex;gap:8px;">
            <button (click)="toggleFav()" class="act-btn" [attr.aria-label]="'THEME.DETAIL.FAVORITE' | translate">
              <svg [attr.fill]="isFav ? '#ef4444' : 'none'"
                   [style.color]="isFav ? '#ef4444' : 'var(--mint)'"
                   style="width:17px;height:17px;" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
            <button (click)="shareProperty()" class="act-btn" [attr.aria-label]="'THEME.DETAIL.SHARE' | translate">
              <svg style="width:17px;height:17px;color:var(--mint);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <!-- Gallery -->
      <ng-container [ngSwitch]="galleryLayout">

      <!-- Lưới -->
      <div *ngSwitchCase="'grid'" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:4px; background:var(--bg-deep,#0f1f17);">
        <img *ngFor="let img of property.property_media" [src]="img.media_url" style="width:100%; height:280px; object-fit:cover;" [alt]="property.title">
      </div>

      <!-- 1 ảnh lớn -->
      <div *ngSwitchCase="'single'" class="gallery-hero">
        <img [src]="activeImage" class="gallery-hero-img" [alt]="property.title">
        <div class="gallery-hero-overlay"></div>
      </div>

      <!-- Mặc định -->
      <ng-container *ngSwitchDefault>
      <div class="gallery-hero">
        <img [src]="activeImage" class="gallery-hero-img" [alt]="property.title">
        <div class="gallery-hero-overlay"></div>
        <span class="gallery-count">{{ currentIndex + 1 }} / {{ property.property_media?.length || 1 }}</span>
        <button *ngIf="property.property_media?.length > 1" (click)="prevImage()"
                style="position:absolute;left:16px;top:50%;transform:translateY(-50%);background:rgba(26,58,42,0.55);border:1px solid rgba(82,183,136,0.3);width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px);"
                [attr.aria-label]="'THEME.DETAIL.PREV_IMAGE' | translate">
          <svg style="width:18px;height:18px;color:var(--mint);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button *ngIf="property.property_media?.length > 1" (click)="nextImage()"
                style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:rgba(26,58,42,0.55);border:1px solid rgba(82,183,136,0.3);width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px);"
                [attr.aria-label]="'THEME.DETAIL.NEXT_IMAGE' | translate">
          <svg style="width:18px;height:18px;color:var(--mint);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Thumb strip -->
      <div *ngIf="property.property_media?.length > 1" class="thumb-strip">
        <div class="thumb-row">
          <img *ngFor="let img of property.property_media; let i = index"
               [src]="img.media_url"
               (click)="selectImage(img.media_url, i)"
               [ngClass]="{'active': activeImage === img.media_url}"
               class="thumb-img" [alt]="'THEME.DETAIL.IMAGE_N' | translate:{ n: i+1 }">
        </div>
      </div>
      </ng-container>

      </ng-container>

      <!-- Content -->
      <div style="max-width:1400px; margin:0 auto; padding:56px 7vw 100px;">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-14">

          <!-- Left -->
          <div class="lg:col-span-2 space-y-12 fade-up">

            <!-- Header -->
            <header>
              <div style="font-family:'Inter',sans-serif;font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:var(--sage);margin-bottom:14px;display:flex;align-items:center;gap:10px;">
                <span style="width:16px;height:1px;background:var(--sage);display:block;"></span>
                {{ property.categories?.name || 'Eco Living' }}
              </div>
              <h1 class="font-head" style="font-size:clamp(1.9rem,3.5vw,3rem);font-weight:400;font-style:italic;color:var(--forest);line-height:1.15;margin-bottom:14px;">
                {{ property.title }}
              </h1>
              <div style="font-family:'Inter',sans-serif;font-size:1.3rem;font-weight:700;color:var(--leaf);">
                {{ property.price | number }} ₫
              </div>
            </header>

            <!-- Divider -->
            <div style="height:1px;background:linear-gradient(to right,var(--sage),transparent);"></div>

            <!-- Attributes -->
            <div class="attr-row">
              <div *ngIf="property.attributes?.bedrooms" class="attr-cell">
                <div class="attr-label">{{ 'ATTRIBUTES.BEDROOMS' | translate }}</div>
                <div class="attr-val">{{ property.attributes.bedrooms }}<span style="font-size:0.8rem;color:var(--muted);"> PN</span></div>
              </div>
              <div *ngIf="property.attributes?.bathrooms" class="attr-cell">
                <div class="attr-label">{{ 'ATTRIBUTES.BATHROOMS' | translate }}</div>
                <div class="attr-val">{{ property.attributes.bathrooms }}<span style="font-size:0.8rem;color:var(--muted);"> WC</span></div>
              </div>
              <div *ngIf="property.attributes?.area" class="attr-cell">
                <div class="attr-label">{{ 'ATTRIBUTES.AREA' | translate }}</div>
                <div class="attr-val">{{ property.attributes.area }}<span style="font-size:0.8rem;color:var(--muted);"> m²</span></div>
              </div>
              <div *ngIf="property.attributes?.balcony_direction" class="attr-cell">
                <div class="attr-label">{{ 'ATTRIBUTES.BALCONY_DIR' | translate }}</div>
                <div class="attr-val" style="font-size:1.1rem;">{{ property.attributes.balcony_direction }}</div>
              </div>
              <div *ngFor="let attr of extraAttributes" class="attr-cell">
                <div class="attr-label">{{ attr.key }}</div>
                <div class="attr-val" style="font-size:1.1rem;">{{ attr.value }}</div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <div style="font-family:'Inter',sans-serif;font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:var(--sage);margin-bottom:18px;display:flex;align-items:center;gap:10px;">
                <span style="width:16px;height:1px;background:var(--sage);display:block;"></span>
                {{ 'THEME.DETAIL.DESCRIPTION' | translate }}
              </div>
              <div style="font-size:0.95rem;color:#4A5A4E;line-height:1.9;white-space:pre-wrap;font-weight:300;">
                {{ property.description }}
              </div>
            </div>

            <!-- Location — address + live map embed -->
            <div>
              <div style="font-family:'Inter',sans-serif;font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:var(--sage);margin-bottom:18px;display:flex;align-items:center;gap:10px;">
                <span style="width:16px;height:1px;background:var(--sage);display:block;"></span>
                {{ 'THEME.DETAIL.LOCATION' | translate }}
              </div>

              <!-- Address chip -->
              <div *ngIf="property.address" style="display:flex;align-items:flex-start;gap:8px;margin-bottom:14px;color:#4A5A4E;font-size:0.9rem;line-height:1.6;">
                <svg style="width:15px;height:15px;flex-shrink:0;margin-top:2px;color:var(--sage);" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ property.address }}</span>
              </div>

              <!-- Live Google Maps embed -->
              <div *ngIf="property.map_embed_url" style="width:100%;height:280px;overflow:hidden;border-radius:4px;border:1px solid rgba(82,183,136,0.25);">
                <iframe [src]="property.map_embed_url | trustUrl" width="100%" height="280"
                        style="border:0;" loading="lazy" allowfullscreen></iframe>
              </div>

              <!-- Placeholder when no map configured -->
              <div *ngIf="!property.map_embed_url" style="width:100%;height:240px;overflow:hidden;position:relative;">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=50"
                     style="width:100%;height:100%;object-fit:cover;opacity:0.35;" [alt]="'THEME.DETAIL.MAP' | translate">
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                  <span style="background:rgba(26,58,42,0.7);border:1px solid rgba(82,183,136,0.4);padding:10px 22px;font-family:'Inter',sans-serif;font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--mint);backdrop-filter:blur(8px);">
                    {{ 'THEME.DETAIL.VIEW_MAP' | translate }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Property Sections -->
            <ng-container *ngIf="property.property_sections && property.property_sections.length > 0">
              <div *ngFor="let sec of $any(property.property_sections)" style="border-top:1px solid rgba(82,183,136,0.2);padding-top:28px;">
                <div style="font-family:'Inter',sans-serif;font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:var(--sage);margin-bottom:18px;display:flex;align-items:center;gap:10px;">
                  <span style="width:16px;height:1px;background:var(--sage);display:block;"></span>
                  {{ $any(sec).title }}
                </div>

                <img *ngIf="$any(sec).image_url" [src]="$any(sec).image_url" [alt]="$any(sec).title"
                     style="width:100%;max-height:360px;object-fit:cover;border-radius:4px;margin-bottom:16px;">

                <p *ngIf="$any(sec).content"
                   style="font-size:0.95rem;color:#4A5A4E;line-height:1.9;white-space:pre-wrap;font-weight:300;margin-bottom:12px;">
                  {{ $any(sec).content }}
                </p>

                <ul *ngIf="$any(sec).metadata?.items?.length" style="margin:0;padding-left:20px;">
                  <li *ngFor="let item of $any(sec).metadata.items"
                      style="font-size:0.9rem;color:#4A5A4E;margin-bottom:8px;line-height:1.7;">{{ item }}</li>
                </ul>

                <div *ngIf="$any(sec).section_type === 'location' && $any(sec).metadata?.map_embed_url"
                     style="width:100%;height:300px;overflow:hidden;border-radius:4px;">
                  <iframe [src]="$any(sec).metadata.map_embed_url | trustUrl" width="100%" height="300" style="border:0;" loading="lazy"></iframe>
                </div>

                <div *ngIf="$any(sec).section_type === 'virtual_tour' && $any(sec).metadata?.embed_url"
                     style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:4px;">
                  <iframe [src]="$any(sec).metadata.embed_url | trustUrl" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Sidebar -->
          <aside>
            <div class="eco-sidebar">
              <div *ngIf="!preview" class="eco-sidebar-header">{{ 'THEME.DETAIL.REGISTER_CONSULT' | translate }}</div>
              <app-agent-card *ngIf="property.agent" [agentInfo]="property.agent"></app-agent-card>
              <div *ngIf="!preview" style="padding:20px 22px 24px;">
                <app-lead-form [propertyId]="property.id" [agentId]="property.agent_id"></app-lead-form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `
})
export class EcoGreenPropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private toast = inject(ToastService);
  private languageService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);
  private seoService = inject(SeoService);
  private favoriteService = inject(FavoriteService);

  @Input() property: any = null;
  @Input() preview = false;
  originalProperty: any = null;
  activeImage = '';
  currentIndex = 0;
  isFav = false;

  get galleryLayout(): string { return this.property?.attributes?.gallery_layout || 'default'; }

  get extraAttributes(): { key: string; value: any }[] {
    if (!this.property?.attributes) return [];
    const known = new Set(['bedrooms', 'bathrooms', 'area', 'balcony_direction', 'property_type']);
    return Object.entries(this.property.attributes)
      .filter(([k]) => !known.has(k))
      .map(([key, value]) => ({ key, value }));
  }

  ngOnInit() {
    if (this.property) { this.initFromProperty(); return; }
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.api.get<any>(`/properties/${slug}`).subscribe(res => {
      this.property = res.data;
      this.initFromProperty();
      this.cdr.markForCheck();
    });
  }

  private initFromProperty() {
    this.originalProperty = JSON.parse(JSON.stringify(this.property));
    const thumb = this.property?.property_media?.find((m: any) => m.is_thumbnail);
    this.activeImage = thumb?.media_url ?? this.property?.property_media?.[0]?.media_url
      ?? 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80';
    this.currentIndex = 0;
    this.isFav = this.property?.id ? this.favoriteService.isFavorite(this.property.id) : false;
    if (!this.preview) {
      this.loadTranslation();
      this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadTranslation());
    }
  }

  selectImage(url: string, index: number) { this.activeImage = url; this.currentIndex = index; }

  prevImage() {
    const media = this.property?.property_media;
    if (!media?.length) return;
    this.currentIndex = (this.currentIndex - 1 + media.length) % media.length;
    this.activeImage = media[this.currentIndex].media_url;
  }

  nextImage() {
    const media = this.property?.property_media;
    if (!media?.length) return;
    this.currentIndex = (this.currentIndex + 1) % media.length;
    this.activeImage = media[this.currentIndex].media_url;
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
      navigator.clipboard.writeText(window.location.href).then(() => this.toast.success(this.translateService.instant('THEME.DETAIL.LINK_COPIED')));
    }
  }

  private updateSeo() {
    this.seoService.setMeta({
      title: this.originalProperty?.title || this.property.title,
      desc: (this.originalProperty?.description || this.property.description)?.substring(0, 160) || '',
      image: this.activeImage
    });
  }

  private loadTranslation() {
    if (this.languageService.currentLang === 'vi') {
      this.property.title = this.originalProperty.title;
      this.property.description = this.originalProperty.description;
      this.updateSeo(); this.cdr.markForCheck(); return;
    }
    this.languageService.getDynamicTranslation('property', this.property.id)?.subscribe(res => {
      this.property.title = res.fallback ? this.originalProperty.title : res.data.title;
      this.property.description = res.fallback ? this.originalProperty.description : res.data.description;
      this.updateSeo(); this.cdr.markForCheck();
    });
  }
}
