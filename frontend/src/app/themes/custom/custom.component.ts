import { Component, Input, OnInit, OnChanges, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/services/api.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { LanguageService } from '../../core/services/language.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { LayoutConfig, LayoutBlock, normalizeLayout } from './custom-layout.model';

/**
 * Custom Theme — render giao diện dự án theo cấu hình block-based (layout_config).
 * Dùng chung cho cả trang khách (theme-container) lẫn live-preview trong builder.
 */
@Component({
  selector: 'app-custom-theme',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, LanguageSelectorComponent],
  styles: [`
    :host { display: block; }
    .ct-root { min-height: 100vh; background: var(--c-bg); color: var(--c-text); font-family: var(--f-body), system-ui, sans-serif; }
    .ct-head { font-family: var(--f-head), system-ui, sans-serif; }
    .ct-nav { position: sticky; top: 0; z-index: 40; background: color-mix(in srgb, var(--c-bg) 92%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid color-mix(in srgb, var(--c-text) 12%, transparent); }
    .ct-nav-link { font-size: 0.82rem; color: color-mix(in srgb, var(--c-text) 65%, transparent); text-decoration: none; transition: color .2s; }
    .ct-nav-link:hover { color: var(--c-primary); }
    .ct-btn { display:inline-flex; align-items:center; gap:8px; background: var(--c-primary); color:#fff; text-decoration:none; padding:14px 28px; font-size:0.82rem; font-weight:600; letter-spacing:0.04em; border:none; cursor:pointer; transition: filter .2s; }
    .ct-btn:hover { filter: brightness(1.1); }
    .ct-sec { padding: 72px 7vw; max-width: 1400px; margin: 0 auto; }
    .ct-sec-title { font-family: var(--f-head), sans-serif; font-size: clamp(1.6rem,3vw,2.6rem); font-weight:700; letter-spacing:-0.02em; color: var(--c-text); margin-bottom: 8px; }
    .ct-rule { height:1px; background: color-mix(in srgb, var(--c-text) 12%, transparent); margin: 16px 0 40px; }
    .ct-card { background: color-mix(in srgb, var(--c-bg) 96%, var(--c-text)); border:1px solid color-mix(in srgb, var(--c-text) 10%, transparent); border-radius:10px; overflow:hidden; text-decoration:none; color:inherit; display:block; transition: transform .25s, box-shadow .25s; }
    .ct-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,0,0,0.1); }
    .ct-card-img { width:100%; height:200px; object-fit:cover; display:block; }
    .ct-chip { border:1px solid color-mix(in srgb, var(--c-text) 18%, transparent); background:var(--c-bg); color: var(--c-text); padding:8px 12px; font-size:0.8rem; border-radius:6px; min-width:120px; }
    .ct-spinner { width:26px; height:26px; border:2px solid color-mix(in srgb, var(--c-text) 18%, transparent); border-top-color: var(--c-primary); border-radius:50%; animation: ctspin .7s linear infinite; }
    @keyframes ctspin { to { transform: rotate(360deg); } }
    .ct-fav { border:none; background:none; cursor:pointer; color: color-mix(in srgb, var(--c-text) 30%, transparent); }
    .ct-fav.active { color:#ef4444; }
  `],
  template: `
    <div class="ct-root"
         [style.--c-primary]="cfg.tokens.colorPrimary"
         [style.--c-bg]="cfg.tokens.colorBg"
         [style.--c-text]="cfg.tokens.colorText"
         [style.--c-accent]="cfg.tokens.colorAccent"
         [style.--f-head]="fHead"
         [style.--f-body]="fBody">

      <!-- ── Nav ── -->
      <nav class="ct-nav">
        <div style="max-width:1400px;margin:0 auto;padding:0 7vw;height:62px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
          <a routerLink="/" class="ct-head" style="font-size:1.05rem;font-weight:700;letter-spacing:-0.02em;color:var(--c-text);text-decoration:none;display:flex;align-items:center;gap:10px;">
            <img *ngIf="cfg.tokens.logoUrl" [src]="cfg.tokens.logoUrl" alt="logo" style="height:30px;width:auto;object-fit:contain;">
            <span>{{ cfg.tokens.logoText || project?.name || ('THEME.CUSTOM.DEFAULT_PROJECT' | translate) }}</span>
          </a>
          <div class="hidden md:flex items-center gap-7">
            <a routerLink="/" class="ct-nav-link">{{ 'NAVBAR.HOME' | translate }}</a>
            <a *ngFor="let s of projectSections" [href]="'#section-' + s.id" class="ct-nav-link">{{ s.title }}</a>
            <a routerLink="/about" class="ct-nav-link">{{ 'NAVBAR.ABOUT' | translate }}</a>
            <a routerLink="/contact" class="ct-nav-link">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <!-- ── Blocks ── -->
      <ng-container *ngFor="let block of visibleBlocks()">
        <div [ngSwitch]="block.type">

          <!-- HERO -->
          <section *ngSwitchCase="'hero'" style="position:relative; min-height:78vh; display:flex; align-items:center; overflow:hidden;">
            <img [src]="block.props.image" alt="hero" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;">
            <div style="position:absolute; inset:0; background:linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15));"></div>
            <div style="position:relative; z-index:1; padding:0 7vw; max-width:760px; color:#fff;">
              <h1 class="ct-head" style="font-size:clamp(2.4rem,6vw,5rem); font-weight:700; line-height:1.02; letter-spacing:-0.03em; margin-bottom:20px;">
                {{ block.props.title || project?.name || ('THEME.CUSTOM.DEFAULT_HERO_TITLE' | translate) }}
              </h1>
              <p style="font-size:1.05rem; line-height:1.7; opacity:0.92; max-width:520px; margin-bottom:32px;">
                {{ block.props.subtitle || project?.description || '' }}
              </p>
              <a *ngIf="block.props.ctaText" [href]="block.props.ctaLink || '#listing'" class="ct-btn">
                {{ block.props.ctaText }}
                <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
            </div>
          </section>

          <!-- STATS -->
          <section *ngSwitchCase="'stats'" style="background: color-mix(in srgb, var(--c-text) 4%, var(--c-bg));">
            <div style="max-width:1400px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
              <div *ngFor="let it of (block.props.items || [])" style="padding:34px 7vw; border-right:1px solid color-mix(in srgb, var(--c-text) 10%, transparent);">
                <div class="ct-head" style="font-size:2.6rem; font-weight:700; color:var(--c-primary); line-height:1;">{{ it.value }}</div>
                <div style="font-size:0.72rem; letter-spacing:0.14em; text-transform:uppercase; color:color-mix(in srgb, var(--c-text) 55%, transparent); margin-top:8px;">{{ it.label }}</div>
              </div>
            </div>
          </section>

          <!-- PROPERTIES -->
          <section *ngSwitchCase="'properties'" id="listing" class="ct-sec">
            <h2 class="ct-sec-title">{{ block.props.title || ('THEME.SECTION.PROPERTIES' | translate) }}</h2>
            <div class="ct-rule"></div>

            <div *ngIf="block.props.showFilter !== false && !isLoading" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:28px;">
              <select class="ct-chip" [(ngModel)]="filter.propertyType" (ngModelChange)="applyFilter()">
                <option [ngValue]="null">{{ 'THEME.FILTER.TYPE' | translate }}</option>
                <option *ngFor="let c of categories" [ngValue]="c.slug">{{ c.name }}</option>
              </select>
              <select class="ct-chip" [(ngModel)]="filter.minPrice" (ngModelChange)="applyFilter()">
                <option [ngValue]="null">{{ 'THEME.FILTER.MIN_PRICE' | translate }}</option>
                <option [ngValue]="1000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 1 } }}</option><option [ngValue]="2000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 2 } }}</option><option [ngValue]="5000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 5 } }}</option>
              </select>
              <select class="ct-chip" [(ngModel)]="filter.maxPrice" (ngModelChange)="applyFilter()">
                <option [ngValue]="null">{{ 'THEME.FILTER.MAX_PRICE' | translate }}</option>
                <option [ngValue]="2000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 2 } }}</option><option [ngValue]="5000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 5 } }}</option><option [ngValue]="10000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 10 } }}</option>
              </select>
              <select class="ct-chip" [(ngModel)]="filter.bedrooms" (ngModelChange)="applyFilter()">
                <option [ngValue]="null">{{ 'THEME.FILTER.BEDROOMS' | translate }}</option>
                <option [ngValue]="1">{{ 'THEME.FILTER.BED_N' | translate:{ n: 1 } }}{{ bedroomCount(1) ? ' · ' + bedroomCount(1) : '' }}</option>
                <option [ngValue]="2">{{ 'THEME.FILTER.BED_N' | translate:{ n: 2 } }}{{ bedroomCount(2) ? ' · ' + bedroomCount(2) : '' }}</option>
                <option [ngValue]="3">{{ 'THEME.FILTER.BED_N' | translate:{ n: 3 } }}{{ bedroomCount(3) ? ' · ' + bedroomCount(3) : '' }}</option>
                <option [ngValue]="4">{{ 'THEME.FILTER.BED_PLUS' | translate:{ n: 4 } }}</option>
              </select>
              <select class="ct-chip" [(ngModel)]="filter.minArea" (ngModelChange)="applyFilter()">
                <option [ngValue]="null">{{ 'THEME.FILTER.AREA_FROM' | translate }}</option>
                <option [ngValue]="50">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 50 } }}</option><option [ngValue]="80">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 80 } }}</option><option [ngValue]="120">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 120 } }}</option>
              </select>
              <select class="ct-chip" [(ngModel)]="filter.sort" (ngModelChange)="applyFilter()">
                <option value="newest">{{ 'THEME.FILTER.SORT_NEWEST' | translate }}</option><option value="price_asc">{{ 'THEME.FILTER.SORT_PRICE_ASC' | translate }}</option><option value="price_desc">{{ 'THEME.FILTER.SORT_PRICE_DESC' | translate }}</option>
              </select>
              <button *ngIf="isFiltered" (click)="clearFilter()" class="ct-btn" style="padding:8px 16px; font-size:0.75rem;">{{ 'THEME.FILTER.CLEAR' | translate }} · {{ filteredProperties.length }}</button>
            </div>

            <div *ngIf="isLoading || isFiltering" style="display:flex; justify-content:center; padding:60px 0;"><div class="ct-spinner"></div></div>

            <div *ngIf="!isLoading && !isFiltering" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a *ngFor="let prop of filteredProperties" [routerLink]="['/project', project?.slug || project?.id || prop.project_id, 'property', prop.slug]" class="ct-card">
                <div style="position:relative;">
                  <img [src]="getThumbnail(prop)" class="ct-card-img" [alt]="prop.title" loading="lazy">
                  <button (click)="toggleFav($event, prop.id)" class="ct-fav" [class.active]="isFav(prop.id)" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.9); border-radius:50%; width:34px; height:34px;">
                    <svg [attr.fill]="isFav(prop.id) ? 'currentColor' : 'none'" style="width:18px;height:18px;margin:0 auto;" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  </button>
                </div>
                <div style="padding:18px 20px;">
                  <h3 class="ct-head line-clamp-2" style="font-size:1.05rem; font-weight:600; margin-bottom:8px;">{{ prop.title }}</h3>
                  <div style="color:var(--c-primary); font-weight:700; font-family:var(--f-head),sans-serif; margin-bottom:10px;">{{ prop.price | number }} ₫</div>
                  <div style="display:flex; gap:14px; font-size:0.78rem; color:color-mix(in srgb, var(--c-text) 60%, transparent);">
                    <span *ngIf="prop.attributes?.bedrooms">{{ prop.attributes.bedrooms }} PN</span>
                    <span *ngIf="prop.attributes?.bathrooms">{{ prop.attributes.bathrooms }} WC</span>
                    <span *ngIf="prop.attributes?.area">{{ prop.attributes.area }} m²</span>
                  </div>
                </div>
              </a>
            </div>
            <div *ngIf="!isLoading && !isFiltering && filteredProperties.length === 0" style="text-align:center; padding:60px 0; color:color-mix(in srgb, var(--c-text) 50%, transparent);">
              {{ 'THEME.COMMON.NO_MATCH_SHORT' | translate }}
            </div>
          </section>

          <!-- SECTIONS (project_sections) -->
          <section *ngSwitchCase="'sections'" class="ct-sec">
            <h2 class="ct-sec-title" *ngIf="block.props.title">{{ block.props.title }}</h2>
            <div class="ct-rule" *ngIf="block.props.title"></div>
            <div *ngFor="let s of projectSections" [id]="'section-' + s.id" style="padding:32px 0; border-bottom:1px solid color-mix(in srgb, var(--c-text) 10%, transparent);">
              <div style="display:grid; gap:28px;" [style.grid-template-columns]="s.image_url ? '1.4fr 1fr' : '1fr'">
                <div>
                  <p style="font-size:0.7rem; letter-spacing:0.14em; text-transform:uppercase; color:var(--c-primary); margin-bottom:8px;">{{ 'THEME.SECTION_TYPE.' + s.section_type | translate }}</p>
                  <h3 class="ct-head" style="font-size:1.4rem; font-weight:700; margin-bottom:14px;">{{ s.title }}</h3>
                  <p *ngIf="s.content" style="font-size:0.95rem; line-height:1.8; white-space:pre-wrap; color:color-mix(in srgb, var(--c-text) 80%, transparent); max-width:640px;">{{ s.content }}</p>
                  <div *ngIf="s.section_type === 'location' && s.metadata?.map_embed_url" style="margin-top:14px;">
                    <iframe [src]="safe(s.metadata.map_embed_url)" style="width:100%; height:300px; border:0;" loading="lazy"></iframe>
                  </div>
                  <ul *ngIf="sectionItems(s).length" style="margin-top:14px; list-style:none; padding:0; columns:2; column-gap:30px;">
                    <li *ngFor="let it of sectionItems(s)" style="padding:6px 0; font-size:0.88rem; break-inside:avoid;"><span style="color:var(--c-primary);">●</span> {{ it }}</li>
                  </ul>
                </div>
                <div *ngIf="s.image_url"><img [src]="s.image_url" [alt]="s.title" style="width:100%; height:100%; max-height:300px; object-fit:cover; border-radius:8px;"></div>
              </div>
            </div>
          </section>

          <!-- BLOGS -->
          <ng-container *ngSwitchCase="'blogs'">
          <section class="ct-sec" *ngIf="projectBlogs.length">
            <h2 class="ct-sec-title">{{ block.props.title || ('THEME.SECTION.NEWS' | translate) }}</h2>
            <div class="ct-rule"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a *ngFor="let b of projectBlogs" [routerLink]="['/blogs', b.slug]" class="ct-card">
                <img [src]="getBlogImage(b)" class="ct-card-img" [alt]="b.title" loading="lazy">
                <div style="padding:16px 20px;">
                  <h3 class="ct-head line-clamp-2" style="font-size:1rem; font-weight:600;">{{ b.title }}</h3>
                  <p style="font-size:0.74rem; color:color-mix(in srgb, var(--c-text) 55%, transparent); margin-top:8px;">{{ b.created_at | date:'dd/MM/yyyy' }}</p>
                </div>
              </a>
            </div>
          </section>
          </ng-container>

          <!-- GALLERY -->
          <ng-container *ngSwitchCase="'gallery'">
          <section class="ct-sec" *ngIf="(block.props.images || []).length">
            <h2 class="ct-sec-title" *ngIf="block.props.title">{{ block.props.title }}</h2>
            <div class="ct-rule" *ngIf="block.props.title"></div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <img *ngFor="let img of block.props.images" [src]="img" alt="gallery" style="width:100%; height:240px; object-fit:cover; border-radius:8px;">
            </div>
          </section>
          </ng-container>

          <!-- TEXT -->
          <section *ngSwitchCase="'text'" class="ct-sec">
            <h2 class="ct-sec-title" *ngIf="block.props.heading">{{ block.props.heading }}</h2>
            <div class="ct-rule" *ngIf="block.props.heading"></div>
            <p style="font-size:1.05rem; line-height:1.85; white-space:pre-wrap; color:color-mix(in srgb, var(--c-text) 85%, transparent); max-width:760px;">{{ block.props.body }}</p>
          </section>

          <!-- CTA -->
          <section *ngSwitchCase="'cta'" style="background:var(--c-primary); color:#fff; text-align:center; padding:80px 7vw;">
            <h2 class="ct-head" style="font-size:clamp(1.6rem,3vw,2.6rem); font-weight:700; margin-bottom:24px;">{{ block.props.title }}</h2>
            <a *ngIf="block.props.buttonText" [routerLink]="block.props.buttonLink || '/contact'" style="display:inline-block; background:#fff; color:var(--c-primary); padding:14px 34px; font-weight:600; text-decoration:none; border-radius:4px;">{{ block.props.buttonText }}</a>
          </section>

        </div>
      </ng-container>

      <!-- ── Footer ── -->
      <footer style="border-top:1px solid color-mix(in srgb, var(--c-text) 12%, transparent); padding:44px 7vw; background: color-mix(in srgb, var(--c-text) 4%, var(--c-bg));">
        <div style="max-width:1400px; margin:0 auto; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:14px;">
          <div>
            <div class="ct-head" style="font-weight:700; font-size:1rem;">{{ cfg.tokens.logoText || project?.name }}</div>
            <p *ngIf="cfg.footer.text" style="font-size:0.82rem; color:color-mix(in srgb, var(--c-text) 60%, transparent); margin-top:6px; max-width:520px;">{{ cfg.footer.text }}</p>
          </div>
          <div *ngIf="cfg.footer.showContact" style="font-size:0.82rem; color:color-mix(in srgb, var(--c-text) 70%, transparent); text-align:right;">
            <div *ngIf="cfg.footer.phone">📞 {{ cfg.footer.phone }}</div>
            <div *ngIf="cfg.footer.email">✉️ {{ cfg.footer.email }}</div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class CustomThemeComponent implements OnInit, OnChanges {
  @Input() project: any;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private favoriteService = inject(FavoriteService);
  private languageService = inject(LanguageService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  cfg!: LayoutConfig;
  properties: any[] = [];
  filteredProperties: any[] = [];
  categories: any[] = [];
  facets: any = null;
  projectSections: any[] = [];
  projectBlogs: any[] = [];
  isLoading = true;
  isFiltering = false;
  private loaded = false;

  filter = { minPrice: null as number | null, maxPrice: null as number | null, bedrooms: null as number | null, minArea: null as number | null, propertyType: null as string | null, sort: 'newest' as string };
  get isFiltered() { return this.filter.minPrice !== null || this.filter.maxPrice !== null || this.filter.bedrooms !== null || this.filter.minArea !== null || this.filter.propertyType !== null; }
  applyFilter() { this.loadProperties(); }
  clearFilter() { this.filter = { minPrice: null, maxPrice: null, bedrooms: null, minArea: null, propertyType: null, sort: 'newest' }; this.loadProperties(); }

  visibleBlocks(): LayoutBlock[] { return (this.cfg?.blocks || []).filter(b => b.visible); }
  get fHead(): string { return `"${this.cfg?.tokens?.fontHead || 'Space Grotesk'}"`; }
  get fBody(): string { return `"${this.cfg?.tokens?.fontBody || 'Inter'}"`; }

  ngOnChanges() {
    // Cập nhật config khi @Input project đổi (live-preview trong builder)
    this.cfg = normalizeLayout(this.project?.layout_config);
  }

  ngOnInit() {
    if (!this.cfg) this.cfg = normalizeLayout(this.project?.layout_config);
    if (!this.loaded) {
      this.loaded = true;
      this.loadProperties();
      this.loadCategories();
      this.loadFacets();
      this.loadProjectSections();
      this.loadProjectBlogs();
      this.translateService.onLangChange
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.applySectionTranslations());
    }
  }

  private loadProperties() {
    this.isFiltering = true;
    this.cdr.markForCheck();
    const params: Record<string, any> = { limit: 50 };
    if (this.project?.id)         params['project_id']    = this.project.id;
    if (this.filter.minPrice)     params['min_price']     = this.filter.minPrice;
    if (this.filter.maxPrice)     params['max_price']     = this.filter.maxPrice;
    if (this.filter.bedrooms)     params['bedrooms']      = this.filter.bedrooms;
    if (this.filter.minArea)      params['min_area']      = this.filter.minArea;
    if (this.filter.propertyType) params['property_type'] = this.filter.propertyType;
    if (this.filter.sort)         params['sort']          = this.filter.sort;
    this.api.get<any>('/properties', params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.properties = res.data || []; this.filteredProperties = [...this.properties]; this.isLoading = false; this.isFiltering = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.isFiltering = false; this.cdr.markForCheck(); }
    });
  }

  private loadCategories() {
    this.api.get<any>('/properties/categories').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.categories = res.data || []; this.cdr.markForCheck(); }
    });
  }
  private loadFacets() {
    const params: Record<string, any> = {};
    if (this.project?.id) params['project_id'] = this.project.id;
    this.api.get<any>('/properties/facets', params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.facets = res.data || null; this.cdr.markForCheck(); }
    });
  }
  private rawSections: any[] = [];
  private loadProjectSections() {
    if (!this.project?.id) return;
    this.api.get<any>(`/projects/${this.project.id}/sections`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.rawSections = res.data || []; this.applySectionTranslations(); }
    });
  }

  /** Áp bản dịch (title/content) cho section theo ngôn ngữ hiện tại; vi giữ bản gốc */
  private applySectionTranslations() {
    this.projectSections = this.rawSections.map(s => ({ ...s }));
    this.cdr.markForCheck();
    if (this.languageService.currentLang === 'vi' || !this.rawSections.length) return;
    this.rawSections.forEach((s, idx) => {
      this.languageService.getDynamicTranslation('project_section', s.id)
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          if (res && !res.fallback && res.data) {
            this.projectSections[idx] = {
              ...this.rawSections[idx],
              title: res.data.title ?? this.rawSections[idx].title,
              content: res.data.description ?? this.rawSections[idx].content
            };
            this.cdr.markForCheck();
          }
        });
    });
  }
  private loadProjectBlogs() {
    if (!this.project?.id) return;
    this.api.get<any>('/blogs', { project_id: this.project.id, limit: 3 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.projectBlogs = res.data || []; this.cdr.markForCheck(); }
    });
  }

  bedroomCount(n: number): number { return this.facets?.bedrooms?.[String(n)] || 0; }
  getThumbnail(prop: any): string {
    if (prop.property_media?.length) {
      const thumb = prop.property_media.find((m: any) => m.is_thumbnail);
      return thumb ? thumb.media_url : prop.property_media[0].media_url;
    }
    return 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=600&q=75';
  }
  getBlogImage(blog: any): string {
    const img = (blog?.content_blocks || []).find((b: any) => b.type === 'image' && b.value);
    return img?.value || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=75';
  }
  sectionItems(s: any): string[] { return Array.isArray(s?.metadata?.items) ? s.metadata.items : []; }
  safe(url: string): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }
  sectionTypeLabel(type: string): string {
    const map: Record<string, string> = { overview: 'Tổng quan', developer: 'Chủ đầu tư', location: 'Vị trí', amenities: 'Tiện ích', legal: 'Pháp lý', payment: 'Thanh toán', custom: '' };
    return map[type] || '';
  }
  isFav(id: string): boolean { return this.favoriteService.isFavorite(id); }
  toggleFav(event: Event, id: string) { event.preventDefault(); event.stopPropagation(); this.favoriteService.toggleFavorite(id); this.cdr.markForCheck(); }
}
