import { Component, Input, OnInit, OnChanges, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FavoriteService } from '../../core/services/favorite.service';
import { LanguageService } from '../../core/services/language.service';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutConfig, LayoutBlock, normalizeLayoutFor } from '../custom/custom-layout.model';

@Component({
  selector: 'app-eco-green-theme',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent, TranslateModule, FormsModule],
  styles: [`
    :host {
      --forest:    #1A3A2A;
      --leaf:      #2D6A4F;
      --sage:      #52B788;
      --mint:      #B7E4C7;
      --cream:     #F8F4EC;
      --parchment: #EFE9DC;
      --bark:      #5C4033;
      --muted:     #7A8C7E;
      --white:     #FFFFFF;
      --f-head: 'Lora', Georgia, serif;
      --f-body: 'Inter', system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    .font-head { font-family: var(--f-head); }
    .font-body { font-family: var(--f-body); }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.85s cubic-bezier(0.16,1,0.3,1) both; }

    .eco-nav { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--forest) 96%, transparent); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(82,183,136,0.2); }
    .eco-nav-link { font-family: var(--f-body); font-size: 0.75rem; font-weight: 400; color: rgba(183,228,199,0.7); text-decoration: none; transition: color 0.3s; }
    .eco-nav-link:hover { color: var(--mint); }

    .eco-hero { position: relative; height: 100svh; min-height: 580px; overflow: hidden; }
    .eco-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.05); transition: transform 14s ease; }
    .eco-hero:hover .eco-hero-img { transform: scale(1); }
    .eco-hero-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(26,58,42,0.72) 0%, rgba(26,58,42,0.35) 50%, rgba(26,58,42,0.8) 100%); }
    .eco-hero-content { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; padding: 0 7vw 10vh; max-width: 1400px; margin: 0 auto; }
    .eco-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(82,183,136,0.2); border: 1px solid rgba(82,183,136,0.4); padding: 7px 16px; font-family: var(--f-body); font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--mint); margin-bottom: 28px; }
    .eco-headline { font-family: var(--f-head); font-size: clamp(3rem, 8vw, 7.5rem); font-weight: 400; font-style: italic; line-height: 1.0; letter-spacing: -0.01em; color: var(--cream); margin-bottom: 28px; }
    .eco-hero-sub { font-family: var(--f-body); font-size: 0.95rem; font-weight: 300; color: rgba(248,244,236,0.7); max-width: 440px; line-height: 1.75; margin-bottom: 44px; }
    .eco-cta { display: inline-flex; align-items: center; gap: 14px; background: var(--sage); color: var(--forest); font-family: var(--f-body); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; padding: 16px 36px; transition: background 0.3s; }
    .eco-cta:hover { background: var(--mint); }

    .eco-features { background: var(--forest); display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); border-top: 1px solid rgba(82,183,136,0.2); }
    .eco-feat-item { padding: 40px 7vw; border-right: 1px solid rgba(82,183,136,0.15); }
    .eco-feat-item:last-child { border-right: none; }
    .eco-feat-icon { width: 36px; height: 36px; border: 1px solid rgba(82,183,136,0.4); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: var(--sage); }
    .eco-feat-title { font-family: var(--f-head); font-style: italic; font-size: 1.1rem; color: var(--cream); margin-bottom: 8px; }
    .eco-feat-desc { font-family: var(--f-body); font-size: 0.8rem; color: var(--muted); line-height: 1.65; }

    .eco-section-label { font-family: var(--f-body); font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--sage); display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .eco-section-label::before { content: ''; width: 20px; height: 1px; background: var(--sage); flex-shrink: 0; }
    .eco-section-title { font-family: var(--f-head); font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 400; font-style: italic; color: var(--forest); line-height: 1.15; }

    .eco-card { background: var(--white); border: 1px solid #E8E2D8; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s; overflow: hidden; }
    .eco-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(26,58,42,0.1); }
    .eco-card-img-wrap { aspect-ratio: 4/3; overflow: hidden; position: relative; }
    .eco-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
    .eco-card:hover .eco-card-img { transform: scale(1.05); }
    .eco-label { position: absolute; top: 14px; left: 14px; background: var(--sage); color: var(--white); font-family: var(--f-body); font-size: 0.6rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; padding: 5px 12px; }
    .eco-fav { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.85); backdrop-filter: blur(6px); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .eco-fav:hover { background: var(--white); }
    .eco-card-body { padding: 20px 22px 24px; }
    .eco-card-title { font-family: var(--f-head); font-style: italic; font-size: 1.15rem; color: var(--forest); margin-bottom: 6px; line-height: 1.35; transition: color 0.25s; }
    .eco-card:hover .eco-card-title { color: var(--leaf); }
    .eco-card-price { font-family: var(--f-body); font-size: 0.95rem; font-weight: 600; color: var(--leaf); margin-bottom: 14px; }
    .eco-card-rule { height: 1px; background: #EDE7DB; margin-bottom: 14px; }
    .eco-card-meta { font-family: var(--f-body); font-size: 0.72rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: 12px; }

    .eco-spinner { width: 32px; height: 32px; border: 2px solid var(--mint); border-top-color: var(--leaf); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .eco-chip { border:1px solid #DDD7CC; padding:8px 12px; font-size:0.8rem; color:var(--forest); background:white; border-radius:4px; min-width:120px; }

    @media (max-width: 767px) {
      .eco-hero-content { padding: 0 24px 8vh; }
      .eco-headline { font-size: clamp(2.4rem,10vw,4rem); }
      .eco-hero-sub { display: none; }
    }
  `],
  template: `
    <div class="font-body"
         style="min-height:100vh; background:var(--cream);"
         [style.--cream]="cfg.tokens.colorBg"
         [style.--forest]="cfg.tokens.colorText"
         [style.--leaf]="cfg.tokens.colorPrimary"
         [style.--sage]="cfg.tokens.colorAccent"
         [style.--f-head]="fHead"
         [style.--f-body]="fBody">

      <!-- Nav -->
      <nav class="eco-nav">
        <div style="max-width:1400px; margin:0 auto; padding:0 7vw; height:62px; display:flex; align-items:center; justify-content:space-between;">
          <a routerLink="/" class="font-head" style="font-size:1.1rem; font-style:italic; font-weight:400; color:var(--mint); text-decoration:none; display:flex; align-items:center; gap:10px;">
            <img *ngIf="cfg.tokens.logoUrl" [src]="cfg.tokens.logoUrl" alt="logo" style="height:26px; width:auto; object-fit:contain;">
            <span>{{ cfg.tokens.logoText || project?.name || 'Eco Green' }}</span>
          </a>
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/"        class="eco-nav-link">{{ 'NAVBAR.HOME'    | translate }}</a>
            <a href="#listing"       class="eco-nav-link">{{ 'THEME.SECTION.PROPERTIES' | translate }}</a>
            <a *ngFor="let s of projectSections" [href]="'#section-' + s.id" class="eco-nav-link">{{ s.title }}</a>
            <a routerLink="/about"   class="eco-nav-link">{{ 'NAVBAR.ABOUT'   | translate }}</a>
            <a routerLink="/contact" class="eco-nav-link">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <!-- ── Blocks ── -->
      <ng-container *ngFor="let block of visibleBlocks()">
        <div [ngSwitch]="block.type">

          <!-- HERO -->
          <section *ngSwitchCase="'hero'" class="eco-hero">
            <img [src]="block.props.image || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=85'"
                 class="eco-hero-img" alt="Nature hero" loading="eager">
            <div class="eco-hero-overlay"></div>
            <div class="eco-hero-content w-full">
              <div class="eco-badge fade-up" style="animation-delay:0.05s;">
                <svg style="width:10px;height:10px;" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
                {{ 'THEME.ECO.BADGE' | translate }}
              </div>
              <h1 class="eco-headline fade-up" style="animation-delay:0.2s;">{{ block.props.title || project?.name || ('THEME.ECO_GREEN.DEFAULT_NAME' | translate) }}</h1>
              <p class="eco-hero-sub fade-up" style="animation-delay:0.35s;">{{ block.props.subtitle || project?.description || ('THEME.ECO_GREEN.DEFAULT_DESC' | translate) }}</p>
              <a [href]="block.props.ctaLink || '#listing'" class="eco-cta fade-up" style="animation-delay:0.5s;">
                {{ block.props.ctaText || ('THEME.ECO.EXPLORE_NOW' | translate) }}
                <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
            </div>
          </section>

          <!-- STATS (skin: features band) -->
          <div *ngSwitchCase="'stats'" class="eco-features">
            <ng-container *ngIf="block.props.items?.length; else ecoDefaultFeatures">
              <div *ngFor="let it of block.props.items" class="eco-feat-item fade-up">
                <div class="eco-feat-title">{{ it.value }}</div>
                <div class="eco-feat-desc">{{ it.label }}</div>
              </div>
            </ng-container>
            <ng-template #ecoDefaultFeatures>
              <div class="eco-feat-item fade-up" style="animation-delay:0.1s;">
                <div class="eco-feat-icon"><svg style="width:18px;height:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02l.707.707M1 12h1m18 0h1M4.22 19.78l.707-.707M18.95 5.05l.707-.707"/></svg></div>
                <div class="eco-feat-title">{{ 'THEME.ECO_GREEN.FEAT_ENERGY' | translate }}</div>
                <div class="eco-feat-desc">{{ 'THEME.ECO_GREEN.FEAT_ENERGY_DESC' | translate }}</div>
              </div>
              <div class="eco-feat-item fade-up" style="animation-delay:0.2s;">
                <div class="eco-feat-icon"><svg style="width:18px;height:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg></div>
                <div class="eco-feat-title">{{ 'THEME.ECO_GREEN.FEAT_COMMUNITY' | translate }}</div>
                <div class="eco-feat-desc">{{ 'THEME.ECO_GREEN.FEAT_COMMUNITY_DESC' | translate }}</div>
              </div>
              <div class="eco-feat-item fade-up" style="animation-delay:0.3s;">
                <div class="eco-feat-icon"><svg style="width:18px;height:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div>
                <div class="eco-feat-title">{{ 'THEME.ECO_GREEN.FEAT_SMART' | translate }}</div>
                <div class="eco-feat-desc">{{ 'THEME.ECO_GREEN.FEAT_SMART_DESC' | translate }}</div>
              </div>
            </ng-template>
          </div>

          <!-- PROPERTIES -->
          <section *ngSwitchCase="'properties'" id="listing" style="padding:80px 7vw 120px; background:var(--parchment);">
            <div style="max-width:1400px; margin:0 auto;">
              <div style="margin-bottom:52px;">
                <p class="eco-section-label fade-up" style="animation-delay:0.05s;">{{ 'THEME.COMMON.PROPERTIES' | translate }}</p>
                <h2 class="eco-section-title fade-up" style="animation-delay:0.15s;">{{ block.props.title || ('THEME.ECO.LISTING_TITLE' | translate) }}</h2>
              </div>

              <div *ngIf="block.props.showFilter !== false && !isLoading" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #DDD7CC;">
                <select class="eco-chip" [(ngModel)]="filter.propertyType" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.TYPE' | translate }}</option>
                  <option *ngFor="let c of categories" [ngValue]="c.slug">{{ c.name }}</option>
                </select>
                <select class="eco-chip" [(ngModel)]="filter.minPrice" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.MIN_PRICE' | translate }}</option>
                  <option [ngValue]="1000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 1 } }}</option>
                  <option [ngValue]="2000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 2 } }}</option>
                  <option [ngValue]="5000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 5 } }}</option>
                </select>
                <select class="eco-chip" [(ngModel)]="filter.maxPrice" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.MAX_PRICE' | translate }}</option>
                  <option [ngValue]="2000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 2 } }}</option>
                  <option [ngValue]="5000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 5 } }}</option>
                  <option [ngValue]="10000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 10 } }}</option>
                </select>
                <select class="eco-chip" [(ngModel)]="filter.bedrooms" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.BEDROOMS' | translate }}</option>
                  <option [ngValue]="1">{{ 'THEME.FILTER.BED_N' | translate:{ n: 1 } }}{{ bedroomCount(1) ? ' · ' + bedroomCount(1) : '' }}</option>
                  <option [ngValue]="2">{{ 'THEME.FILTER.BED_N' | translate:{ n: 2 } }}{{ bedroomCount(2) ? ' · ' + bedroomCount(2) : '' }}</option>
                  <option [ngValue]="3">{{ 'THEME.FILTER.BED_N' | translate:{ n: 3 } }}{{ bedroomCount(3) ? ' · ' + bedroomCount(3) : '' }}</option>
                  <option [ngValue]="4">{{ 'THEME.FILTER.BED_PLUS' | translate:{ n: 4 } }}</option>
                </select>
                <select class="eco-chip" [(ngModel)]="filter.minArea" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.AREA_FROM' | translate }}</option>
                  <option [ngValue]="50">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 50 } }}</option>
                  <option [ngValue]="80">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 80 } }}</option>
                  <option [ngValue]="120">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 120 } }}</option>
                </select>
                <select class="eco-chip" style="min-width:140px;" [(ngModel)]="filter.sort" (ngModelChange)="applyFilter()">
                  <option value="newest">{{ 'THEME.FILTER.SORT_NEWEST' | translate }}</option>
                  <option value="price_asc">{{ 'THEME.FILTER.SORT_PRICE_ASC' | translate }}</option>
                  <option value="price_desc">{{ 'THEME.FILTER.SORT_PRICE_DESC' | translate }}</option>
                </select>
                <button *ngIf="isFiltered" (click)="clearFilter()" style="background:var(--sage);color:white;border:none;padding:8px 16px;font-size:0.75rem;border-radius:4px;cursor:pointer;">
                  {{ 'THEME.FILTER.CLEAR' | translate }} · {{ filteredProperties.length }}/{{ properties.length }}
                </button>
              </div>

              <div *ngIf="isLoading || isFiltering" style="display:flex;justify-content:center;padding:60px 0;"><div class="eco-spinner"></div></div>

              <div *ngIf="!isLoading && !isFiltering" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <article *ngFor="let prop of filteredProperties; let i = index" class="eco-card fade-up" [style.animation-delay]="(i * 0.09) + 's'">
                  <div class="eco-card-img-wrap">
                    <a [routerLink]="['/project', project?.slug || project?.id || prop.project_id, 'property', prop.slug]" style="display:block;height:100%;">
                      <img [src]="getThumbnail(prop)" class="eco-card-img" [alt]="prop.title" loading="lazy">
                    </a>
                    <span class="eco-label">Eco Living</span>
                    <button (click)="toggleFav($event, prop.id)" class="eco-fav" [attr.aria-label]="'THEME.DETAIL.FAVORITE' | translate">
                      <svg [attr.fill]="isFav(prop.id) ? '#ef4444' : 'none'" [style.color]="isFav(prop.id) ? '#ef4444' : 'var(--muted)'" style="width:16px;height:16px;" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="eco-card-body">
                    <a [routerLink]="['/project', project?.slug || project?.id || prop.project_id, 'property', prop.slug]" style="text-decoration:none;"><h3 class="eco-card-title line-clamp-2">{{ prop.title }}</h3></a>
                    <div class="eco-card-price">{{ prop.price | number }} ₫</div>
                    <div class="eco-card-rule"></div>
                    <div class="eco-card-meta">
                      <span *ngIf="prop.attributes?.bedrooms">{{ prop.attributes.bedrooms }} PN</span>
                      <span *ngIf="prop.attributes?.bathrooms">{{ prop.attributes.bathrooms }} WC</span>
                      <span *ngIf="prop.attributes?.area">{{ prop.attributes.area }} m²</span>
                    </div>
                  </div>
                </article>
              </div>

              <div *ngIf="!isLoading && !isFiltering && filteredProperties.length === 0" style="text-align:center; padding:80px 0;">
                <div class="font-head" style="font-size:3rem; font-style:italic; color:var(--mint); opacity:0.5; margin-bottom:16px;">~</div>
                <p class="font-head" style="font-style:italic; font-size:1.1rem; color:var(--leaf);">{{ 'THEME.COMMON.NO_MATCH' | translate }}</p>
              </div>
            </div>
          </section>

          <!-- SECTIONS -->
          <ng-container *ngSwitchCase="'sections'">
            <section *ngFor="let s of projectSections" [id]="'section-' + s.id" style="padding:80px 7vw; background:white; border-top:1px solid #DDD7CC;">
              <div style="max-width:1400px; margin:0 auto;">
                <p class="eco-section-label">{{ 'THEME.SECTION_TYPE.' + s.section_type | translate }}</p>
                <h2 class="eco-section-title" style="margin-bottom:28px;">{{ s.title }}</h2>
                <div style="display:grid; gap:36px;" [style.grid-template-columns]="s.image_url ? '1.4fr 1fr' : '1fr'">
                  <div>
                    <p *ngIf="s.content" class="font-head" style="color:var(--leaf); font-size:1rem; line-height:1.9; white-space:pre-wrap; max-width:640px;">{{ s.content }}</p>
                    <div *ngIf="s.section_type === 'developer' && s.metadata" style="margin-top:18px; font-size:0.88rem; color:var(--forest); line-height:2;">
                      <div *ngIf="s.metadata.name"><strong>{{ 'THEME.COMMON.DEVELOPER' | translate }}:</strong> {{ s.metadata.name }}</div>
                      <div *ngIf="s.metadata.established_year"><strong>{{ 'THEME.COMMON.ESTABLISHED' | translate }}:</strong> {{ s.metadata.established_year }}</div>
                      <div *ngIf="s.metadata.website"><a [href]="s.metadata.website" target="_blank" style="color:var(--sage);">{{ s.metadata.website }}</a></div>
                    </div>
                    <div *ngIf="s.section_type === 'location' && s.metadata?.address" style="margin-top:16px; color:var(--forest); font-size:0.9rem;">📍 {{ s.metadata.address }}</div>
                    <div *ngIf="s.section_type === 'location' && s.metadata?.map_embed_url" style="margin-top:16px;">
                      <iframe [src]="safe(s.metadata.map_embed_url)" style="width:100%; height:320px; border:1px solid #DDD7CC; border-radius:8px;" loading="lazy"></iframe>
                    </div>
                    <ul *ngIf="sectionItems(s).length" style="margin-top:16px; list-style:none; padding:0; columns:2; column-gap:36px;">
                      <li *ngFor="let it of sectionItems(s)" style="color:var(--leaf); font-size:0.9rem; padding:6px 0; break-inside:avoid;"><span style="color:var(--sage);">●</span> {{ it }}</li>
                    </ul>
                  </div>
                  <div *ngIf="s.image_url"><img [src]="s.image_url" [alt]="s.title" style="width:100%; height:100%; max-height:360px; object-fit:cover; border-radius:8px;"></div>
                </div>
              </div>
            </section>
          </ng-container>

          <!-- BLOGS -->
          <ng-container *ngSwitchCase="'blogs'">
            <section *ngIf="projectBlogs.length" style="padding:80px 7vw; background:var(--parchment); border-top:1px solid #DDD7CC;">
              <div style="max-width:1400px; margin:0 auto;">
                <div class="flex items-end justify-between" style="margin-bottom:40px;">
                  <div>
                    <p class="eco-section-label">{{ 'THEME.COMMON.UPDATED' | translate }}</p>
                    <h2 class="eco-section-title">{{ block.props.title || ('THEME.SECTION.NEWS' | translate) }}</h2>
                  </div>
                  <a routerLink="/blogs" style="color:var(--sage); font-size:0.8rem; text-decoration:none;">{{ 'THEME.COMMON.VIEW_ALL' | translate }} →</a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a *ngFor="let b of projectBlogs" [routerLink]="['/blogs', b.slug]" class="eco-card" style="text-decoration:none;">
                    <div class="eco-card-img-wrap"><img [src]="getBlogImage(b)" class="eco-card-img" [alt]="b.title" loading="lazy"></div>
                    <div class="eco-card-body"><h3 class="eco-card-title line-clamp-2">{{ b.title }}</h3><p style="font-size:0.75rem; color:var(--muted); margin-top:8px;">{{ b.created_at | date:'dd/MM/yyyy' }}</p></div>
                  </a>
                </div>
              </div>
            </section>
          </ng-container>

          <!-- GALLERY -->
          <ng-container *ngSwitchCase="'gallery'">
            <section *ngIf="(block.props.images || []).length" style="padding:80px 7vw; background:white; border-top:1px solid #DDD7CC;">
              <div style="max-width:1400px; margin:0 auto;">
                <h2 class="eco-section-title" *ngIf="block.props.title" style="margin-bottom:28px;">{{ block.props.title }}</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <img *ngFor="let img of block.props.images" [src]="img" alt="gallery" style="width:100%; height:240px; object-fit:cover; border-radius:8px;">
                </div>
              </div>
            </section>
          </ng-container>

          <!-- TEXT -->
          <section *ngSwitchCase="'text'" style="padding:80px 7vw; background:white; border-top:1px solid #DDD7CC;">
            <div style="max-width:760px; margin:0 auto;">
              <h2 class="eco-section-title" *ngIf="block.props.heading" style="margin-bottom:24px;">{{ block.props.heading }}</h2>
              <p class="font-head" style="color:var(--leaf); font-size:1.05rem; line-height:1.9; white-space:pre-wrap;">{{ block.props.body }}</p>
            </div>
          </section>

          <!-- CTA -->
          <section *ngSwitchCase="'cta'" style="padding:90px 7vw; text-align:center; background:var(--forest);">
            <h2 class="font-head" style="font-style:italic; font-size:clamp(1.8rem,4vw,3rem); color:var(--mint); margin-bottom:26px;">{{ block.props.title }}</h2>
            <a *ngIf="block.props.buttonText" [routerLink]="block.props.buttonLink || '/contact'" class="eco-cta">{{ block.props.buttonText }}</a>
          </section>

        </div>
      </ng-container>

      <!-- Footer -->
      <footer style="background:var(--forest); border-top:1px solid rgba(82,183,136,0.2); padding:44px 7vw;">
        <div style="max-width:1400px; margin:0 auto; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div>
            <span class="font-head" style="font-style:italic; font-size:1.1rem; color:var(--mint);">{{ cfg.tokens.logoText || project?.name || 'Eco Green' }}</span>
            <p *ngIf="cfg.footer.text" style="font-size:0.78rem; color:var(--muted); margin-top:6px; max-width:520px;">{{ cfg.footer.text }}</p>
          </div>
          <div style="font-family:var(--f-body); font-size:0.7rem; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; text-align:right;">
            <ng-container *ngIf="cfg.footer.showContact && (cfg.footer.phone || cfg.footer.email)">
              <div *ngIf="cfg.footer.phone">📞 {{ cfg.footer.phone }}</div>
              <div *ngIf="cfg.footer.email">✉️ {{ cfg.footer.email }}</div>
            </ng-container>
            <div *ngIf="!cfg.footer.phone && !cfg.footer.email">{{ 'THEME.ECO_GREEN.COPYRIGHT' | translate }}</div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class EcoGreenComponent implements OnInit, OnChanges {
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
  private originalProject: any = null;
  filter = { minPrice: null as number | null, maxPrice: null as number | null, bedrooms: null as number | null, minArea: null as number | null, maxArea: null as number | null, propertyType: null as string | null, sort: 'newest' as string };
  get isFiltered() { return this.filter.minPrice !== null || this.filter.maxPrice !== null || this.filter.bedrooms !== null || this.filter.minArea !== null || this.filter.maxArea !== null || this.filter.propertyType !== null; }
  applyFilter() { this.loadProperties(); }
  clearFilter() { this.filter = { minPrice: null, maxPrice: null, bedrooms: null, minArea: null, maxArea: null, propertyType: null, sort: 'newest' }; this.loadProperties(); }

  visibleBlocks(): LayoutBlock[] { return (this.cfg?.blocks || []).filter(b => b.visible); }
  get fHead(): string { return `"${this.cfg?.tokens?.fontHead || 'Lora'}", Georgia, serif`; }
  get fBody(): string { return `"${this.cfg?.tokens?.fontBody || 'Inter'}", system-ui, sans-serif`; }

  ngOnChanges() { this.cfg = normalizeLayoutFor(this.project?.layout_config, 'eco-green'); }

  private loadProperties() {
    this.isFiltering = true;
    this.cdr.markForCheck();
    const params: Record<string, any> = { limit: 50 };
    if (this.project?.id)       params['project_id']    = this.project.id;
    if (this.filter.minPrice)   params['min_price']     = this.filter.minPrice;
    if (this.filter.maxPrice)   params['max_price']     = this.filter.maxPrice;
    if (this.filter.bedrooms)   params['bedrooms']      = this.filter.bedrooms;
    if (this.filter.minArea)    params['min_area']      = this.filter.minArea;
    if (this.filter.maxArea)    params['max_area']      = this.filter.maxArea;
    if (this.filter.propertyType) params['property_type'] = this.filter.propertyType;
    if (this.filter.sort)       params['sort']          = this.filter.sort;
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

  private applySectionTranslations() {
    this.projectSections = this.rawSections.map(s => ({ ...s }));
    this.cdr.markForCheck();
    if (this.languageService.currentLang === 'vi' || !this.rawSections.length) return;
    this.rawSections.forEach((s, idx) => {
      this.languageService.getDynamicTranslation('project_section', s.id)
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          if (res && !res.fallback && res.data) {
            this.projectSections[idx] = { ...this.rawSections[idx], title: res.data.title ?? this.rawSections[idx].title, content: res.data.description ?? this.rawSections[idx].content };
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
  getBlogImage(blog: any): string {
    const img = (blog?.content_blocks || []).find((b: any) => b.type === 'image' && b.value);
    return img?.value || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=75';
  }
  sectionItems(s: any): string[] { return Array.isArray(s?.metadata?.items) ? s.metadata.items : []; }
  safe(url: string): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }

  ngOnInit() {
    if (!this.cfg) this.cfg = normalizeLayoutFor(this.project?.layout_config, 'eco-green');
    if (this.project) {
      this.originalProject = { ...this.project };
      this.loadProjectTranslation();
      this.translateService.onLangChange
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => { this.loadProjectTranslation(); this.applySectionTranslations(); });
    }
    if (!this.loaded) {
      this.loaded = true;
      this.loadProperties();
      this.loadCategories();
      this.loadFacets();
      this.loadProjectSections();
      this.loadProjectBlogs();
    }
  }

  private loadProjectTranslation() {
    if (this.languageService.currentLang === 'vi' || !this.project?.id) {
      if (this.originalProject) this.project = { ...this.originalProject };
      this.cdr.markForCheck();
      return;
    }
    this.languageService.getDynamicTranslation('project', this.project.id)?.subscribe(res => {
      if (!res.fallback && res.data) {
        this.project = { ...this.project, name: res.data.title ?? this.project.name, description: res.data.description ?? this.project.description };
      } else {
        this.project = { ...this.originalProject };
      }
      this.cdr.markForCheck();
    });
  }

  getThumbnail(prop: any): string {
    if (prop.property_media?.length) {
      const thumb = prop.property_media.find((m: any) => m.is_thumbnail);
      return thumb ? thumb.media_url : prop.property_media[0].media_url;
    }
    return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80';
  }

  isFav(id: string): boolean { return this.favoriteService.isFavorite(id); }
  toggleFav(event: Event, id: string) { event.preventDefault(); event.stopPropagation(); this.favoriteService.toggleFavorite(id); this.cdr.markForCheck(); }
}
