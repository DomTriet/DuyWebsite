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
import { LightboxService } from '../../shared/services/lightbox.service';

@Component({
  selector: 'app-minimalist-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LeadFormComponent, AgentCardComponent, TranslateModule, TrustUrlPipe],
  styles: [`
    :host {
      --ink: #0F0F0F;
      --ink-2: #3A3A3A;
      --subtle: #8A8A8A;
      --rule: #E4E4E0;
      --bg: #FAFAF8;
      --white: #FFFFFF;
      --blue: #0052CC;
    }

    .font-head { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-body { font-family: 'Be Vietnam Pro', system-ui, sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) both; }

    .min-nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--rule);
    }

    /* Gallery */
    .gallery-wrap {
      display: grid; grid-template-columns: 1fr 180px;
      gap: 4px; height: 68vh; min-height: 420px;
      background: var(--bg);
    }
    @media (max-width: 768px) {
      .gallery-wrap { grid-template-columns: 1fr; height: auto; }
      .gallery-strip { display: none; }
    }
    .gallery-main-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: opacity 0.4s ease;
    }
    .gallery-strip {
      display: flex; flex-direction: column; gap: 4px;
      overflow-y: auto; scrollbar-width: none;
    }
    .gallery-strip::-webkit-scrollbar { display: none; }
    .thumb-img {
      width: 100%; height: 88px; object-fit: cover;
      cursor: pointer; opacity: 0.5;
      border: 2px solid transparent;
      transition: opacity 0.25s, border-color 0.25s;
      flex-shrink: 0;
    }
    .thumb-img.active { opacity: 1; border-color: var(--blue); }
    .thumb-img:hover   { opacity: 0.85; }

    /* Attr grid */
    .attr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap: 1px; background: var(--rule); }
    .attr-cell { background: var(--white); padding: 20px 16px; }
    .attr-label { font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--subtle); margin-bottom: 8px; }
    .attr-val   { font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); line-height: 1; }

    /* Action btn */
    .act-btn {
      width: 40px; height: 40px; border: 1px solid var(--rule);
      background: var(--white); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.2s;
    }
    .act-btn:hover { border-color: var(--ink); }

    /* Lead sidebar */
    .lead-sidebar {
      position: sticky; top: 76px;
      border: 1px solid var(--rule);
      background: var(--white);
    }
    .lead-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--rule);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.75rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--subtle);
    }
  `],
  template: `
    <div *ngIf="property" class="font-body" style="min-height:100vh; background:var(--bg);">

      <!-- Nav -->
      <nav class="min-nav">
        <div style="max-width:1400px; margin:0 auto; padding:0 5vw; height:60px; display:flex; align-items:center; justify-content:space-between; gap:16px;">
          <a routerLink=".." style="display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--subtle);font-size:0.78rem;letter-spacing:0.05em;transition:color 0.2s;"
             onmouseenter="this.style.color='var(--ink)'" onmouseleave="this.style.color='var(--subtle)'">
            <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            {{ 'THEME.DETAIL.BACK_LIST' | translate }}
          </a>
          <span class="font-head" style="font-size:0.9rem;font-weight:600;letter-spacing:-0.01em;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:500px;display:none;" class="hidden md:block">
            {{ property.title }}
          </span>
          <div style="display:flex;gap:8px;">
            <button (click)="toggleFav()" class="act-btn" [attr.aria-label]="'THEME.DETAIL.FAVORITE' | translate">
              <svg [attr.fill]="isFav ? '#ef4444' : 'none'"
                   [style.color]="isFav ? '#ef4444' : 'var(--subtle)'"
                   style="width:16px;height:16px;transition:color 0.2s;"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
            <button (click)="shareProperty()" class="act-btn" [attr.aria-label]="'THEME.DETAIL.SHARE' | translate">
              <svg style="width:16px;height:16px;color:var(--subtle);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div *ngSwitchCase="'grid'" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:4px; background:var(--bg);">
          <img *ngFor="let img of property.property_media; let i = index"
               [src]="img.media_url"
               (click)="openLightbox(i)"
               style="width:100%; height:260px; object-fit:cover; cursor:zoom-in;"
               [alt]="property.title">
        </div>
        <!-- 1 ảnh lớn -->
        <div *ngSwitchCase="'single'" style="height:68vh; min-height:420px; overflow:hidden; background:var(--bg); cursor:zoom-in; position:relative;" (click)="openLightbox(0)">
          <img [src]="activeImage" class="gallery-main-img" [alt]="property.title">
          <span style="position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,0.55);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;pointer-events:none;">
            🔍 Phóng to
          </span>
        </div>
        <!-- Mặc định: ảnh chính + dải thumbnail -->
        <div *ngSwitchDefault class="gallery-wrap">
          <div style="overflow:hidden; cursor:zoom-in; position:relative;" (click)="openLightbox()">
            <img [src]="activeImage" class="gallery-main-img" [alt]="property.title">
            <span style="position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,0.55);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;pointer-events:none;">
              🔍 Phóng to
            </span>
          </div>
          <div class="gallery-strip">
            <img *ngFor="let img of property.property_media; let i = index"
                 [src]="img.media_url"
                 (click)="selectImage(img.media_url, i)"
                 [ngClass]="{'active': activeImage === img.media_url}"
                 class="thumb-img" [alt]="'THEME.DETAIL.IMAGE_N' | translate:{ n: i+1 }">
          </div>
        </div>
      </ng-container>

      <!-- Content -->
      <div style="max-width:1400px; margin:0 auto; padding:56px 5vw 100px;">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <!-- Left -->
          <div class="lg:col-span-2 space-y-10 fade-up">

            <!-- Header -->
            <div>
              <div style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--subtle);margin-bottom:12px;">
                {{ property.categories?.name || ('THEME.SECTION.PROPERTIES' | translate) }}
              </div>
              <h1 class="font-head" style="font-size:clamp(1.8rem,3.5vw,3rem);font-weight:700;letter-spacing:-0.025em;color:var(--ink);line-height:1.1;margin-bottom:16px;">
                {{ property.title }}
              </h1>
              <div class="font-head" style="font-size:1.4rem;font-weight:700;color:var(--blue);letter-spacing:-0.02em;">
                {{ property.price | number }} ₫
              </div>
            </div>

            <!-- Attributes -->
            <div>
              <div class="attr-grid">
                <div *ngIf="property.attributes?.bedrooms" class="attr-cell">
                  <div class="attr-label">{{ 'ATTRIBUTES.BEDROOMS' | translate }}</div>
                  <div class="attr-val">{{ property.attributes.bedrooms }}</div>
                </div>
                <div *ngIf="property.attributes?.bathrooms" class="attr-cell">
                  <div class="attr-label">{{ 'ATTRIBUTES.BATHROOMS' | translate }}</div>
                  <div class="attr-val">{{ property.attributes.bathrooms }}</div>
                </div>
                <div *ngIf="property.attributes?.area" class="attr-cell">
                  <div class="attr-label">{{ 'ATTRIBUTES.AREA' | translate }}</div>
                  <div class="attr-val">{{ property.attributes.area }}<span style="font-size:0.9rem;color:var(--subtle);"> m²</span></div>
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
            </div>

            <!-- Description -->
            <div>
              <div style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--subtle);margin-bottom:16px;display:flex;align-items:center;gap:12px;">
                <span style="display:block;width:20px;height:1px;background:var(--rule);"></span>
                {{ 'THEME.DETAIL.DESCRIPTION' | translate }}
              </div>
              <div style="font-size:0.95rem;color:var(--ink-2);line-height:1.85;white-space:pre-wrap;font-weight:300;">
                {{ property.description }}
              </div>
            </div>

            <!-- Location: address + map (live data or placeholder) -->
            <div>
              <div style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--subtle);margin-bottom:16px;display:flex;align-items:center;gap:12px;">
                <span style="display:block;width:20px;height:1px;background:var(--rule);"></span>
                {{ 'THEME.DETAIL.LOCATION' | translate }}
              </div>

              <!-- Address chip -->
              <div *ngIf="property.address"
                   style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;">
                <svg style="width:16px;height:16px;color:var(--subtle);flex-shrink:0;margin-top:2px;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                <span style="font-size:0.9rem;color:var(--ink-2);line-height:1.6;">{{ property.address }}</span>
              </div>

              <!-- Live map embed -->
              <div *ngIf="property.map_embed_url"
                   style="width:100%;height:320px;overflow:hidden;border-radius:2px;">
                <iframe [src]="property.map_embed_url | trustUrl"
                        width="100%" height="320" style="border:0;display:block;"
                        loading="lazy" allowfullscreen
                        referrerpolicy="no-referrer-when-downgrade"></iframe>
              </div>

              <!-- Placeholder when no map -->
              <div *ngIf="!property.map_embed_url"
                   style="width:100%;height:220px;background:var(--rule);overflow:hidden;position:relative;">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=50"
                     style="width:100%;height:100%;object-fit:cover;opacity:0.4;" [alt]="'THEME.DETAIL.MAP' | translate">
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                  <span style="background:var(--white);border:1px solid var(--rule);padding:10px 20px;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--blue);">
                    {{ 'THEME.DETAIL.VIEW_MAP' | translate }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Property Sections -->
            <ng-container *ngIf="property.property_sections && property.property_sections.length > 0">
              <div *ngFor="let sec of $any(property.property_sections)" style="border-top:1px solid var(--rule);padding-top:32px;">
                <div style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--subtle);margin-bottom:16px;display:flex;align-items:center;gap:12px;">
                  <span style="display:block;width:20px;height:1px;background:var(--rule);"></span>
                  {{ $any(sec).title }}
                </div>

                <img *ngIf="$any(sec).image_url" [src]="$any(sec).image_url" [alt]="$any(sec).title"
                     style="width:100%;max-height:360px;object-fit:cover;border-radius:2px;margin-bottom:16px;">

                <p *ngIf="$any(sec).content" style="font-size:0.95rem;color:var(--ink-2);line-height:1.85;white-space:pre-wrap;font-weight:300;margin-bottom:12px;">{{ $any(sec).content }}</p>

                <ul *ngIf="$any(sec).metadata?.items?.length" style="margin:0;padding-left:20px;">
                  <li *ngFor="let item of $any(sec).metadata.items"
                      style="font-size:0.9rem;color:var(--ink-2);margin-bottom:6px;line-height:1.6;">{{ item }}</li>
                </ul>

                <div *ngIf="$any(sec).section_type === 'location' && $any(sec).metadata?.map_embed_url"
                     style="width:100%;height:300px;overflow:hidden;border-radius:2px;">
                  <iframe [src]="$any(sec).metadata.map_embed_url | trustUrl" width="100%" height="300" style="border:0;" loading="lazy"></iframe>
                </div>

                <div *ngIf="$any(sec).section_type === 'virtual_tour' && $any(sec).metadata?.embed_url"
                     style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:2px;">
                  <iframe [src]="$any(sec).metadata.embed_url | trustUrl" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Sidebar -->
          <aside>
            <div class="lead-sidebar">
              <app-agent-card *ngIf="property.agent" [agentInfo]="property.agent"></app-agent-card>
              <div *ngIf="!preview" class="lead-header">{{ 'THEME.DETAIL.REGISTER_CONSULT' | translate }}</div>
              <div *ngIf="!preview" style="padding:16px 24px 24px;">
                <app-lead-form [propertyId]="property.id" [agentId]="property.agent_id"></app-lead-form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `
})
export class MinimalistPropertyDetailComponent implements OnInit {
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

  private lightbox = inject(LightboxService);

  get galleryLayout(): string { return this.property?.attributes?.gallery_layout || 'default'; }

  get extraAttributes(): { key: string; value: any }[] {
    if (!this.property?.attributes) return [];
    const known = new Set(['bedrooms', 'bathrooms', 'area', 'balcony_direction', 'property_type']);
    return Object.entries(this.property.attributes)
      .filter(([k]) => !known.has(k))
      .map(([key, value]) => ({ key, value }));
  }

  ngOnInit() {
    // Nếu đã được truyền property (qua container hoặc preview) → dùng luôn, không fetch
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
      ?? 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80';
    this.isFav = this.property?.id ? this.favoriteService.isFavorite(this.property.id) : false;
    if (!this.preview) {
      this.loadTranslation();
      this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadTranslation());
    }
  }

  selectImage(url: string, idx?: number) {
    this.activeImage = url;
    this.currentIndex = idx ?? (this.property?.property_media?.findIndex((m: any) => m.media_url === url) ?? 0);
  }

  openLightbox(idx?: number) {
    const images = (this.property?.property_media || []).map((m: any) => m.media_url);
    if (!images.length) return;
    this.lightbox.open(images, idx ?? this.currentIndex);
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
