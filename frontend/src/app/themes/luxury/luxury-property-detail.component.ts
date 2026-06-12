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
  selector: 'app-luxury-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LeadFormComponent, AgentCardComponent, TranslateModule, TrustUrlPipe],
  styles: [`
    :host {
      --gold: #C9A84C;
      --gold-light: #E8C97A;
      --black: #0A0A0A;
      --surface: #111111;
      --surface-2: #181818;
      --cream: #EDE8DF;
      --muted: #888880;
      --border: rgba(201,168,76,0.18);
    }

    .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

    @keyframes revealUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .reveal-up { animation: revealUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }

    /* ── Navigation ── */
    .lux-nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(10,10,10,0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid #1A1A1A;
    }

    /* ── Gallery ── */
    .gallery-main {
      width: 100%; height: 72vh; min-height: 480px;
      position: relative; overflow: hidden; background: #050505;
    }
    .gallery-main-img {
      width: 100%; height: 100%;
      object-fit: cover; transition: opacity 0.5s ease;
    }
    .gallery-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(10,10,10,0.7) 100%);
      pointer-events: none;
    }
    .gallery-count {
      position: absolute; bottom: 24px; right: 24px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.7rem; letter-spacing: 0.2em;
      color: rgba(237,232,223,0.6);
      background: rgba(10,10,10,0.6);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
    }

    /* thumbnail strip */
    .thumb-strip {
      display: flex; gap: 6px; overflow-x: auto;
      padding: 10px 0; scrollbar-width: none;
    }
    .thumb-strip::-webkit-scrollbar { display: none; }
    .thumb-item {
      flex-shrink: 0; width: 88px; height: 60px;
      object-fit: cover; cursor: pointer;
      opacity: 0.45;
      border: 1px solid transparent;
      transition: opacity 0.3s, border-color 0.3s;
    }
    .thumb-item.active  { opacity: 1; border-color: var(--gold); }
    .thumb-item:hover   { opacity: 0.8; }

    /* ── Attribute pills ── */
    .attr-item {
      border: 1px solid #1E1E1E;
      padding: 20px 24px;
    }
    .attr-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.6rem; letter-spacing: 0.25em;
      text-transform: uppercase; color: var(--muted);
      margin-bottom: 10px;
    }
    .attr-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem; font-weight: 300;
      color: var(--cream); line-height: 1;
    }
    .attr-unit {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem; color: var(--muted); margin-left: 4px;
    }

    /* ── Sidebar lead form ── */
    .lead-sidebar {
      position: sticky; top: 80px;
      background: var(--surface);
      border: 1px solid #1E1E1E;
      padding: 28px;
    }

    /* ── Action buttons ── */
    .action-btn {
      width: 42px; height: 42px;
      border: 1px solid #2A2A2A;
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: border-color 0.3s;
    }
    .action-btn:hover { border-color: var(--gold); }

    /* ── Section heading ── */
    .section-h {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.6rem; font-style: italic; font-weight: 300;
      color: var(--cream); margin-bottom: 20px;
    }
    .section-rule { height: 1px; background: #1E1E1E; margin-bottom: 28px; }

    @media (max-width: 767px) {
      .gallery-main { height: 55vw; min-height: 260px; }
      .attr-value   { font-size: 1.5rem; }
    }
  `],
  template: `
    <div *ngIf="property" class="font-body" style="min-height:100vh; background:var(--black); color:var(--cream);">

      <!-- ── Nav ── -->
      <nav class="lux-nav">
        <div style="max-width:1400px; margin:0 auto; padding:0 6vw; height:64px; display:flex; align-items:center; justify-content:space-between; gap:16px;">
          <a routerLink=".." style="display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--muted); font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; transition:color 0.3s;"
             onmouseenter="this.style.color='var(--cream)'" onmouseleave="this.style.color='var(--muted)'">
            <svg style="width:18px;height:18px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            {{ 'THEME.DETAIL.BACK_COLLECTION' | translate }}
          </a>
          <div class="font-display hidden md:block"
               style="font-size:1.1rem; font-style:italic; font-weight:300; color:var(--cream); max-width:480px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            {{ property.title }}
          </div>
          <div style="width:120px;"></div>
        </div>
      </nav>

      <!-- ── Gallery ── -->
      <ng-container [ngSwitch]="galleryLayout">

      <!-- Lưới -->
      <div *ngSwitchCase="'grid'" style="background:var(--surface); padding:4px;">
        <div style="max-width:1500px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:4px;">
          <img *ngFor="let img of property.property_media" [src]="img.media_url" style="width:100%; height:320px; object-fit:cover;" [alt]="property.title">
        </div>
      </div>

      <!-- 1 ảnh lớn -->
      <div *ngSwitchCase="'single'" class="gallery-main">
        <img [src]="activeImage" class="gallery-main-img" [alt]="property.title">
        <div class="gallery-overlay"></div>
      </div>

      <!-- Mặc định -->
      <ng-container *ngSwitchDefault>
      <div class="gallery-main">
        <img [src]="activeImage" class="gallery-main-img" [alt]="property.title">
        <div class="gallery-overlay"></div>
        <span class="gallery-count">
          {{ currentIndex + 1 }} / {{ property.property_media?.length || 1 }}
        </span>

        <!-- Prev / Next arrows -->
        <button *ngIf="property.property_media?.length > 1"
                (click)="prevImage()"
                style="position:absolute; left:20px; top:50%; transform:translateY(-50%); background:rgba(10,10,10,0.55); border:1px solid rgba(255,255,255,0.1); width:48px; height:48px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:border-color 0.3s; backdrop-filter:blur(6px);"
                onmouseenter="this.style.borderColor='var(--gold)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.1)'"
                [attr.aria-label]="'THEME.DETAIL.PREV_IMAGE' | translate">
          <svg style="width:20px;height:20px;color:var(--cream);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button *ngIf="property.property_media?.length > 1"
                (click)="nextImage()"
                style="position:absolute; right:20px; top:50%; transform:translateY(-50%); background:rgba(10,10,10,0.55); border:1px solid rgba(255,255,255,0.1); width:48px; height:48px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:border-color 0.3s; backdrop-filter:blur(6px);"
                onmouseenter="this.style.borderColor='var(--gold)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.1)'"
                [attr.aria-label]="'THEME.DETAIL.NEXT_IMAGE' | translate">
          <svg style="width:20px;height:20px;color:var(--cream);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Thumbnail strip -->
      <div *ngIf="property.property_media?.length > 1"
           style="background:var(--surface); border-bottom:1px solid #1A1A1A; padding:0 6vw;">
        <div class="thumb-strip" style="max-width:1400px; margin:0 auto;">
          <img *ngFor="let img of property.property_media; let i = index"
               [src]="img.media_url"
               (click)="selectImage(img.media_url, i)"
               [ngClass]="{'active': activeImage === img.media_url}"
               class="thumb-item" [alt]="'THEME.DETAIL.IMAGE_N' | translate:{ n: i+1 }">
        </div>
      </div>
      </ng-container>

      </ng-container>

      <!-- ── Main content ── -->
      <div style="max-width:1400px; margin:0 auto; padding:64px 6vw 120px;">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">

          <!-- Left: details -->
          <div class="lg:col-span-2 space-y-14">

            <!-- Header -->
            <header class="reveal-up">
              <div style="font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--gold); margin-bottom:14px; display:flex; align-items:center; gap:12px;">
                <span style="display:block; width:24px; height:1px; background:var(--gold);"></span>
                {{ property.categories?.name || ('THEME.SECTION.PROPERTIES' | translate) }}
              </div>
              <div class="flex items-start justify-between gap-4 flex-wrap">
                <h1 class="font-display"
                    style="font-size:clamp(2rem,4vw,3.5rem); font-weight:300; font-style:italic; color:var(--cream); line-height:1.15; flex:1; min-width:200px;">
                  {{ property.title }}
                </h1>
                <div style="display:flex; gap:10px; padding-top:6px;">
                  <button (click)="toggleFav()" class="action-btn" [attr.aria-label]="'THEME.DETAIL.FAVORITE' | translate">
                    <svg [style.color]="isFav ? '#ef4444' : 'var(--muted)'"
                         [attr.fill]="isFav ? 'currentColor' : 'none'"
                         style="width:18px;height:18px; transition:color 0.3s;"
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>
                  <button (click)="shareProperty()" class="action-btn" [attr.aria-label]="'THEME.DETAIL.SHARE' | translate">
                    <svg style="width:18px;height:18px;color:var(--muted);transition:color 0.3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div style="margin-top:20px; font-family:'DM Sans',sans-serif; font-size:1.75rem; font-weight:500; color:var(--gold);">
                {{ property.price | number }} ₫
              </div>
            </header>

            <!-- Attributes -->
            <section class="reveal-up" style="animation-delay:0.1s;">
              <div style="height:1px; background:linear-gradient(to right,var(--gold),transparent); margin-bottom:28px;"></div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div *ngIf="property.attributes?.bedrooms" class="attr-item">
                  <div class="attr-label">{{ 'ATTRIBUTES.BEDROOMS' | translate }}</div>
                  <div class="attr-value">{{ property.attributes.bedrooms }}<span class="attr-unit">PN</span></div>
                </div>
                <div *ngIf="property.attributes?.bathrooms" class="attr-item">
                  <div class="attr-label">{{ 'ATTRIBUTES.BATHROOMS' | translate }}</div>
                  <div class="attr-value">{{ property.attributes.bathrooms }}<span class="attr-unit">WC</span></div>
                </div>
                <div *ngIf="property.attributes?.area" class="attr-item">
                  <div class="attr-label">{{ 'ATTRIBUTES.AREA' | translate }}</div>
                  <div class="attr-value">{{ property.attributes.area }}<span class="attr-unit">m²</span></div>
                </div>
                <div *ngIf="property.attributes?.balcony_direction" class="attr-item">
                  <div class="attr-label">{{ 'ATTRIBUTES.BALCONY_DIR' | translate }}</div>
                  <div class="attr-value" style="font-size:1.3rem;">{{ property.attributes.balcony_direction }}</div>
                </div>
              </div>

              <!-- Extra JSONB attributes -->
              <div *ngIf="extraAttributes.length > 0"
                   class="grid grid-cols-2 md:grid-cols-3 gap-3" style="margin-top:12px;">
                <div *ngFor="let attr of extraAttributes" class="attr-item">
                  <div class="attr-label">{{ attr.key }}</div>
                  <div class="attr-value" style="font-size:1.2rem;">{{ attr.value }}</div>
                </div>
              </div>

              <div style="height:1px; background:#1E1E1E; margin-top:28px;"></div>
            </section>

            <!-- Description -->
            <section class="reveal-up" style="animation-delay:0.2s;">
              <h2 class="section-h">{{ 'THEME.DETAIL.OVERVIEW' | translate }}</h2>
              <div style="color:rgba(237,232,223,0.65); line-height:1.9; font-size:1rem; font-weight:300; white-space:pre-wrap;">
                {{ property.description }}
              </div>
            </section>

            <!-- Location — address + live map embed -->
            <section class="reveal-up" style="animation-delay:0.3s;">
              <h2 class="section-h">{{ 'THEME.DETAIL.PROJECT_LOCATION' | translate }}</h2>

              <!-- Address chip -->
              <div *ngIf="property.address" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;color:var(--text-muted);font-size:0.9rem;line-height:1.6;">
                <svg style="width:16px;height:16px;flex-shrink:0;margin-top:2px;color:var(--gold);" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ property.address }}</span>
              </div>

              <!-- Live Google Maps embed -->
              <div *ngIf="property.map_embed_url" style="width:100%;height:300px;overflow:hidden;border:1px solid var(--border);">
                <iframe [src]="property.map_embed_url | trustUrl" width="100%" height="300"
                        style="border:0;filter:grayscale(0.2);" loading="lazy" allowfullscreen></iframe>
              </div>

              <!-- Placeholder when no map configured -->
              <div *ngIf="!property.map_embed_url" style="position:relative;width:100%;height:260px;overflow:hidden;background:#0D0D0D;">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=60"
                     style="width:100%;height:100%;object-fit:cover;opacity:0.3;" [alt]="'THEME.DETAIL.MAP' | translate">
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                  <div style="background:rgba(10,10,10,0.75);border:1px solid var(--border);padding:12px 28px;font-family:'DM Sans',sans-serif;font-size:0.7rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:10px;backdrop-filter:blur(8px);">
                    <svg style="width:14px;height:14px;flex-shrink:0;" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                    {{ 'THEME.DETAIL.PRIME_LOCATION' | translate }}
                  </div>
                </div>
              </div>
            </section>

            <!-- Property Sections -->
            <ng-container *ngIf="property.property_sections && property.property_sections.length > 0">
              <section *ngFor="let sec of $any(property.property_sections)" class="reveal-up" style="border-top:1px solid var(--border);padding-top:32px;">
                <h2 class="section-h">{{ $any(sec).title }}</h2>

                <img *ngIf="$any(sec).image_url" [src]="$any(sec).image_url" [alt]="$any(sec).title"
                     style="width:100%;max-height:380px;object-fit:cover;margin-bottom:20px;">

                <p *ngIf="$any(sec).content"
                   style="color:rgba(237,232,223,0.65);line-height:1.9;font-size:1rem;font-weight:300;white-space:pre-wrap;margin-bottom:16px;">
                  {{ $any(sec).content }}
                </p>

                <ul *ngIf="$any(sec).metadata?.items?.length" style="margin:0;padding-left:20px;">
                  <li *ngFor="let item of $any(sec).metadata.items"
                      style="color:rgba(237,232,223,0.65);font-size:0.95rem;margin-bottom:8px;line-height:1.7;">{{ item }}</li>
                </ul>

                <div *ngIf="$any(sec).section_type === 'location' && $any(sec).metadata?.map_embed_url"
                     style="width:100%;height:300px;overflow:hidden;">
                  <iframe [src]="$any(sec).metadata.map_embed_url | trustUrl" width="100%" height="300" style="border:0;filter:grayscale(0.3);" loading="lazy"></iframe>
                </div>

                <div *ngIf="$any(sec).section_type === 'virtual_tour' && $any(sec).metadata?.embed_url"
                     style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
                  <iframe [src]="$any(sec).metadata.embed_url | trustUrl" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
                </div>
              </section>
            </ng-container>
          </div>

          <!-- Right: sticky sidebar -->
          <aside>
            <div class="lead-sidebar">
              <app-agent-card *ngIf="property.agent" [agentInfo]="property.agent"></app-agent-card>
              <div *ngIf="!preview" [class.mt-6]="property.agent">
                <app-lead-form [propertyId]="property.id" [agentId]="property.agent_id"></app-lead-form>
              </div>
            </div>
          </aside>
        </div>
      </div>

    </div>
  `
})
export class LuxuryPropertyDetailComponent implements OnInit {
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
  activeImage: string = '';
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
    if (slug) {
      this.api.get<any>(`/properties/${slug}`).subscribe(res => {
        this.property = res.data;
        this.initFromProperty();
        this.cdr.markForCheck();
      });
    }
  }

  private initFromProperty() {
    this.originalProperty = JSON.parse(JSON.stringify(this.property));
    const thumb = this.property?.property_media?.find((m: any) => m.is_thumbnail);
    const firstMedia = this.property?.property_media?.[0];
    this.activeImage = thumb?.media_url ?? firstMedia?.media_url
      ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    this.currentIndex = 0;
    this.isFav = this.property?.id ? this.favoriteService.isFavorite(this.property.id) : false;
    if (!this.preview) {
      this.loadTranslation();
      this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadTranslation());
    }
  }

  selectImage(url: string, index: number) {
    this.activeImage = url;
    this.currentIndex = index;
  }

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
    // Luôn dùng tiêu đề/mô tả gốc (tiếng Việt) cho meta SEO — không đổi theo ngôn ngữ UI
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
      this.updateSeo();
      this.cdr.markForCheck();
      return;
    }
    this.languageService.getDynamicTranslation('property', this.property.id)?.subscribe(res => {
      if (!res.fallback) {
        this.property.title = res.data.title;
        this.property.description = res.data.description;
      } else {
        this.property.title = this.originalProperty.title;
        this.property.description = this.originalProperty.description;
      }
      this.updateSeo();
      this.cdr.markForCheck();
    });
  }
}
