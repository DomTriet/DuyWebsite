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
  selector: 'app-luxury-theme',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent, TranslateModule, FormsModule],
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
      --f-display: 'Cormorant Garamond', Georgia, serif;
      --f-body: 'Be Vietnam Pro', system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    .font-display { font-family: var(--f-display); }
    .font-body    { font-family: var(--f-body); }

    @keyframes revealUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes revealFade { from { opacity: 0; } to { opacity: 1; } }
    .reveal-up   { animation: revealUp  0.9s cubic-bezier(0.16,1,0.3,1) both; }
    .reveal-fade { animation: revealFade 1.2s ease both; }

    .lux-nav { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--black) 92%, transparent); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); }
    .lux-nav-link { font-family: var(--f-body); font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); transition: color 0.3s; text-decoration: none; }
    .lux-nav-link:hover { color: var(--cream); }

    .lux-hero { position: relative; height: 100svh; min-height: 600px; overflow: hidden; }
    .lux-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); transition: transform 12s ease; }
    .lux-hero:hover .lux-hero-img { transform: scale(1); }
    .lux-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 40%, rgba(10,10,10,0.85) 100%); }
    .lux-hero-content { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; padding: 0 6vw 10vh; max-width: 1400px; margin: 0 auto; }
    .lux-eyebrow { font-family: var(--f-body); font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .lux-eyebrow::before { content: ''; display: block; width: 36px; height: 1px; background: var(--gold); }
    .lux-headline { font-family: var(--f-display); font-size: clamp(3.5rem, 9vw, 8.5rem); font-weight: 300; font-style: italic; line-height: 0.95; letter-spacing: -0.02em; color: var(--cream); margin-bottom: 32px; }
    .lux-hero-sub { font-family: var(--f-body); font-size: 1rem; font-weight: 300; color: rgba(237,232,223,0.65); max-width: 480px; line-height: 1.7; margin-bottom: 48px; }
    .lux-cta { font-family: var(--f-body); font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--cream); text-decoration: none; display: inline-flex; align-items: center; gap: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(237,232,223,0.3); transition: border-color 0.4s, color 0.3s; }
    .lux-cta:hover { color: var(--gold); border-color: var(--gold); }
    .lux-cta-arrow { width: 32px; height: 1px; background: currentColor; position: relative; transition: width 0.4s ease; }
    .lux-cta:hover .lux-cta-arrow { width: 52px; }
    .lux-cta-arrow::after { content: ''; position: absolute; right: 0; top: -3px; width: 6px; height: 6px; border-top: 1px solid currentColor; border-right: 1px solid currentColor; transform: rotate(45deg); }

    .lux-stat-label { font-family: var(--f-body); font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
    .lux-stat-num { font-family: var(--f-display); font-size: 2.8rem; font-weight: 300; color: var(--cream); line-height: 1; }
    .lux-stat-num span { color: var(--gold); font-style: italic; }

    .lux-section-label { font-family: var(--f-body); font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .lux-section-label::before { content: ''; width: 28px; height: 1px; background: var(--gold); flex-shrink: 0; }
    .lux-section-title { font-family: var(--f-display); font-size: clamp(2.4rem, 5vw, 4.5rem); font-weight: 300; font-style: italic; color: var(--cream); line-height: 1.1; }

    .lux-card { background: var(--surface); border: 1px solid transparent; transition: border-color 0.5s, transform 0.5s cubic-bezier(0.16,1,0.3,1); overflow: hidden; }
    .lux-card:hover { border-color: var(--border); transform: translateY(-6px); }
    .lux-card-img-wrap { overflow: hidden; aspect-ratio: 3 / 4; position: relative; }
    .lux-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.9s cubic-bezier(0.16,1,0.3,1); }
    .lux-card:hover .lux-card-img { transform: scale(1.06); }
    .lux-card-badge { position: absolute; top: 20px; left: 20px; font-family: var(--f-body); font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; background: var(--gold); color: var(--black); padding: 5px 12px; font-weight: 600; }
    .lux-fav-btn { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; background: rgba(10,10,10,0.6); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.3s, background 0.3s; }
    .lux-fav-btn:hover { border-color: var(--gold); background: rgba(10,10,10,0.9); }
    .lux-card-body { padding: 24px 24px 28px; border-top: 1px solid #1E1E1E; }
    .lux-card-title { font-family: var(--f-display); font-size: 1.35rem; font-weight: 400; color: var(--cream); line-height: 1.3; margin-bottom: 8px; transition: color 0.3s; }
    .lux-card:hover .lux-card-title { color: var(--gold-light); }
    .lux-card-price { font-family: var(--f-body); font-size: 1rem; font-weight: 500; color: var(--gold); margin-bottom: 18px; }
    .lux-card-divider { height: 1px; background: #1E1E1E; margin-bottom: 18px; }
    .lux-card-meta { font-family: var(--f-body); font-size: 0.75rem; color: var(--muted); display: flex; gap: 20px; }
    .lux-card-meta-item { display: flex; align-items: center; gap: 6px; }

    .lux-spinner { width: 40px; height: 40px; border: 1px solid rgba(201,168,76,0.15); border-top-color: var(--gold); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 767px) {
      .lux-hero-content { padding: 0 24px 8vh; }
      .lux-headline { letter-spacing: -0.01em; }
      .lux-hero-sub { display: none; }
    }
    .lux-chip { background:var(--surface-2); color:var(--cream); border:1px solid #2A2A2A; padding:8px 14px; font-family: var(--f-body); font-size:0.75rem; letter-spacing:0.05em; min-width:130px; }
  `],
  template: `
    <div class="min-h-screen font-body"
         style="background: var(--black); color: var(--cream);"
         [style.--black]="cfg.tokens.colorBg"
         [style.--cream]="cfg.tokens.colorText"
         [style.--gold]="cfg.tokens.colorAccent"
         [style.--gold-light]="cfg.tokens.colorAccent"
         [style.--f-display]="fHead"
         [style.--f-body]="fBody">

      <!-- ── Navigation ── -->
      <nav class="lux-nav">
        <div style="max-width:1400px; margin:0 auto; padding:0 6vw;" class="flex items-center justify-between h-16">
          <a routerLink="/" class="font-display" style="font-size:1.25rem; font-style:italic; font-weight:300; color:var(--cream); letter-spacing:0.04em; text-decoration:none; display:flex; align-items:center; gap:10px;">
            <img *ngIf="cfg.tokens.logoUrl" [src]="cfg.tokens.logoUrl" alt="logo" style="height:26px; width:auto; object-fit:contain;">
            <span>{{ cfg.tokens.logoText || project?.name || 'Luxury' }}</span>
          </a>
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/"       class="lux-nav-link">{{ 'NAVBAR.HOME'    | translate }}</a>
            <a href="#listing"      class="lux-nav-link">{{ 'THEME.SECTION.PROPERTIES' | translate }}</a>
            <a *ngFor="let s of projectSections" [href]="'#section-' + s.id" class="lux-nav-link">{{ s.title }}</a>
            <a routerLink="/about"  class="lux-nav-link">{{ 'NAVBAR.ABOUT'   | translate }}</a>
            <a routerLink="/contact" class="lux-nav-link">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <!-- ── Blocks ── -->
      <ng-container *ngFor="let block of visibleBlocks()">
        <div [ngSwitch]="block.type">

          <!-- HERO -->
          <section *ngSwitchCase="'hero'" class="lux-hero">
            <img [src]="block.props.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85'"
                 class="lux-hero-img reveal-fade" alt="Hero" loading="eager">
            <div class="lux-hero-overlay"></div>
            <div class="lux-hero-content w-full">
              <p class="lux-eyebrow reveal-up" style="animation-delay:0.1s;">{{ 'THEME.LUXURY.HERO_SUB' | translate }}</p>
              <h1 class="lux-headline reveal-up" style="animation-delay:0.25s;">{{ block.props.title || project?.name || ('THEME.LUXURY.DEFAULT_NAME' | translate) }}</h1>
              <p class="lux-hero-sub reveal-up" style="animation-delay:0.4s;">{{ block.props.subtitle || project?.description || ('THEME.LUXURY.DEFAULT_DESC' | translate) }}</p>
              <a [href]="block.props.ctaLink || '#listing'" class="lux-cta reveal-up" style="animation-delay:0.55s;">
                {{ block.props.ctaText || ('THEME.LUXURY.EXPLORE_NOW' | translate) }}
                <span class="lux-cta-arrow"></span>
              </a>
            </div>
          </section>

          <!-- STATS -->
          <div *ngSwitchCase="'stats'" style="background:var(--surface); border-bottom:1px solid #1A1A1A;">
            <div style="max-width:1400px; margin:0 auto; padding:0 6vw;">
              <div *ngIf="block.props.items?.length; else luxDefaultStats" class="grid divide-x" style="border-color:#1A1A1A; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));">
                <div *ngFor="let it of block.props.items" class="py-10 px-8 reveal-up">
                  <div class="lux-stat-label mb-3">{{ it.label }}</div>
                  <div class="lux-stat-num">{{ it.value }}</div>
                </div>
              </div>
              <ng-template #luxDefaultStats>
                <div class="grid grid-cols-3 divide-x" style="border-color:#1A1A1A;">
                  <div class="py-10 pr-8 reveal-up" style="animation-delay:0.2s;">
                    <div class="lux-stat-label mb-3">{{ 'THEME.LUXURY.STAT_PROPS' | translate }}</div>
                    <div class="lux-stat-num">{{ properties.length }}<span>+</span></div>
                  </div>
                  <div class="py-10 px-8 reveal-up" style="animation-delay:0.35s;">
                    <div class="lux-stat-label mb-3">{{ 'THEME.LUXURY.STAT_STATUS' | translate }}</div>
                    <div class="lux-stat-num" style="font-size:1.6rem; padding-top:0.5rem;"><span>{{ 'THEME.LUXURY.STAT_ACTIVE' | translate }}</span></div>
                  </div>
                  <div class="py-10 pl-8 reveal-up" style="animation-delay:0.5s;">
                    <div class="lux-stat-label mb-3">{{ 'THEME.LUXURY.STAT_SERVICE' | translate }}</div>
                    <div class="lux-stat-num">24<span>/7</span></div>
                  </div>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- PROPERTIES -->
          <section *ngSwitchCase="'properties'" id="listing" style="padding: 100px 6vw 140px; background:var(--surface);">
            <div style="max-width:1400px; margin:0 auto;">
              <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                  <p class="lux-section-label reveal-up" style="animation-delay:0.05s;">{{ 'THEME.LUXURY.COLLECTION_LABEL' | translate }}</p>
                  <h2 class="lux-section-title reveal-up" style="animation-delay:0.15s;">{{ block.props.title || ('THEME.LUXURY.LISTING_TITLE' | translate) }}</h2>
                </div>
                <p style="color:var(--muted); font-size:0.875rem; max-width:320px; line-height:1.7; flex-shrink:0;" class="reveal-up">{{ 'THEME.LUXURY.LISTING_SUB' | translate }}</p>
              </div>

              <div *ngIf="block.props.showFilter !== false && !isLoading" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:32px; padding-bottom:24px; border-bottom:1px solid #1E1E1E;">
                <select class="lux-chip" [(ngModel)]="filter.propertyType" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.TYPE' | translate }}</option>
                  <option *ngFor="let c of categories" [ngValue]="c.slug">{{ c.name }}</option>
                </select>
                <select class="lux-chip" [(ngModel)]="filter.minPrice" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.MIN_PRICE' | translate }}</option>
                  <option [ngValue]="1000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 1 } }}</option>
                  <option [ngValue]="2000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 2 } }}</option>
                  <option [ngValue]="5000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 5 } }}</option>
                  <option [ngValue]="10000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 10 } }}</option>
                </select>
                <select class="lux-chip" [(ngModel)]="filter.maxPrice" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.MAX_PRICE' | translate }}</option>
                  <option [ngValue]="2000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 2 } }}</option>
                  <option [ngValue]="5000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 5 } }}</option>
                  <option [ngValue]="10000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 10 } }}</option>
                  <option [ngValue]="20000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 20 } }}</option>
                </select>
                <select class="lux-chip" [(ngModel)]="filter.bedrooms" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.BEDROOMS' | translate }}</option>
                  <option [ngValue]="1">{{ 'THEME.FILTER.BED_N' | translate:{ n: 1 } }}{{ bedroomCount(1) ? ' · ' + bedroomCount(1) : '' }}</option>
                  <option [ngValue]="2">{{ 'THEME.FILTER.BED_N' | translate:{ n: 2 } }}{{ bedroomCount(2) ? ' · ' + bedroomCount(2) : '' }}</option>
                  <option [ngValue]="3">{{ 'THEME.FILTER.BED_N' | translate:{ n: 3 } }}{{ bedroomCount(3) ? ' · ' + bedroomCount(3) : '' }}</option>
                  <option [ngValue]="4">{{ 'THEME.FILTER.BED_PLUS' | translate:{ n: 4 } }}</option>
                </select>
                <select class="lux-chip" [(ngModel)]="filter.minArea" (ngModelChange)="applyFilter()">
                  <option [ngValue]="null">{{ 'THEME.FILTER.AREA_FROM' | translate }}</option>
                  <option [ngValue]="30">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 30 } }}</option>
                  <option [ngValue]="50">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 50 } }}</option>
                  <option [ngValue]="80">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 80 } }}</option>
                  <option [ngValue]="120">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 120 } }}</option>
                </select>
                <select class="lux-chip" style="min-width:140px;" [(ngModel)]="filter.sort" (ngModelChange)="applyFilter()">
                  <option value="newest">{{ 'THEME.FILTER.SORT_NEWEST' | translate }}</option>
                  <option value="price_asc">{{ 'THEME.FILTER.SORT_PRICE_ASC' | translate }}</option>
                  <option value="price_desc">{{ 'THEME.FILTER.SORT_PRICE_DESC' | translate }}</option>
                </select>
                <button *ngIf="isFiltered" (click)="clearFilter()" style="background:transparent;border:1px solid rgba(201,168,76,0.3);color:var(--gold);padding:8px 16px;font-family:var(--f-body);font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;">
                  {{ 'THEME.FILTER.CLEAR' | translate }} ({{ filteredProperties.length }}/{{ properties.length }})
                </button>
              </div>

              <div *ngIf="isLoading || isFiltering" class="flex justify-center" style="padding:80px 0;"><div class="lux-spinner"></div></div>

              <div *ngIf="!isLoading && !isFiltering" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <article *ngFor="let prop of filteredProperties; let i = index" class="lux-card reveal-up" [style.animation-delay]="(i * 0.1) + 's'">
                  <div class="lux-card-img-wrap">
                    <a [routerLink]="['/project', project?.slug || project?.id || prop.project_id, 'property', prop.slug]" style="display:block; height:100%;">
                      <img [src]="getThumbnail(prop)" class="lux-card-img" [alt]="prop.title" loading="lazy">
                    </a>
                    <span *ngIf="prop.attributes?.property_type || prop.categories?.name" class="lux-card-badge">{{ prop.attributes?.property_type || prop.categories?.name }}</span>
                    <button (click)="toggleFav($event, prop.id)" class="lux-fav-btn" [attr.aria-label]="'THEME.DETAIL.FAVORITE' | translate">
                      <svg [style.color]="isFav(prop.id) ? '#ef4444' : 'var(--muted)'" [attr.fill]="isFav(prop.id) ? 'currentColor' : 'none'" style="width:18px;height:18px; transition:color 0.3s;" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="lux-card-body">
                    <a [routerLink]="['/project', project?.slug || project?.id || prop.project_id, 'property', prop.slug]" style="text-decoration:none;"><h3 class="lux-card-title line-clamp-2">{{ prop.title }}</h3></a>
                    <div class="lux-card-price">{{ prop.price | number }} ₫</div>
                    <div class="lux-card-divider"></div>
                    <div class="lux-card-meta">
                      <span *ngIf="prop.attributes?.bedrooms" class="lux-card-meta-item">{{ prop.attributes.bedrooms }} {{ 'THEME.LUXURY.BEDROOMS' | translate }}</span>
                      <span *ngIf="prop.attributes?.bathrooms" class="lux-card-meta-item">{{ prop.attributes.bathrooms }} {{ 'THEME.LUXURY.BATHROOMS' | translate }}</span>
                      <span *ngIf="prop.attributes?.area" class="lux-card-meta-item">{{ prop.attributes.area }} m²</span>
                    </div>
                  </div>
                </article>
              </div>

              <div *ngIf="!isLoading && !isFiltering && filteredProperties.length === 0" class="text-center reveal-fade" style="padding:100px 0;">
                <div class="font-display" style="font-size:4rem; font-style:italic; color:var(--gold); opacity:0.4; margin-bottom:20px;">✦</div>
                <p style="font-size:1.125rem; color:var(--cream); margin-bottom:8px;">{{ 'THEME.COMMON.NO_MATCH_SHORT' | translate }}</p>
                <p style="font-size:0.875rem; color:var(--muted);">{{ 'THEME.COMMON.ADJUST_FILTER' | translate }}</p>
              </div>
            </div>
          </section>

          <!-- SECTIONS -->
          <ng-container *ngSwitchCase="'sections'">
            <section *ngFor="let s of projectSections" [id]="'section-' + s.id" style="padding:90px 6vw; border-top:1px solid #1A1A1A;">
              <div style="max-width:1400px; margin:0 auto;">
                <p class="lux-section-label">{{ 'THEME.SECTION_TYPE.' + s.section_type | translate }}</p>
                <h2 class="lux-section-title" style="margin-bottom:32px;">{{ s.title }}</h2>
                <div style="display:grid; gap:40px;" [style.grid-template-columns]="s.image_url ? '1.3fr 1fr' : '1fr'">
                  <div>
                    <p *ngIf="s.content" style="color:var(--muted); font-size:0.95rem; line-height:1.9; white-space:pre-wrap; max-width:640px;">{{ s.content }}</p>
                    <div *ngIf="s.section_type === 'developer' && s.metadata" style="margin-top:20px; color:var(--cream); font-size:0.85rem; line-height:2;">
                      <div *ngIf="s.metadata.name"><span style="color:var(--gold);">{{ 'THEME.COMMON.DEVELOPER' | translate }}:</span> {{ s.metadata.name }}</div>
                      <div *ngIf="s.metadata.established_year"><span style="color:var(--gold);">{{ 'THEME.COMMON.ESTABLISHED' | translate }}:</span> {{ s.metadata.established_year }}</div>
                      <div *ngIf="s.metadata.website"><a [href]="s.metadata.website" target="_blank" style="color:var(--gold);">{{ s.metadata.website }}</a></div>
                    </div>
                    <div *ngIf="s.section_type === 'location' && s.metadata?.address" style="margin-top:18px; color:var(--cream); font-size:0.9rem;">📍 {{ s.metadata.address }}</div>
                    <div *ngIf="s.section_type === 'location' && s.metadata?.map_embed_url" style="margin-top:18px;">
                      <iframe [src]="safe(s.metadata.map_embed_url)" style="width:100%; height:340px; border:1px solid #2A2A2A;" loading="lazy"></iframe>
                    </div>
                    <ul *ngIf="sectionItems(s).length" style="margin-top:18px; list-style:none; padding:0; columns:2; column-gap:40px;">
                      <li *ngFor="let it of sectionItems(s)" style="color:var(--muted); font-size:0.9rem; padding:7px 0; break-inside:avoid;"><span style="color:var(--gold);">✦</span> {{ it }}</li>
                    </ul>
                  </div>
                  <div *ngIf="s.image_url" class="relative">
                    <div style="position:absolute; inset:-12px; border:1px solid var(--border); pointer-events:none;"></div>
                    <img [src]="s.image_url" [alt]="s.title" class="relative" style="z-index:1; width:100%; height:100%; max-height:380px; object-fit:cover;">
                  </div>
                </div>
              </div>
            </section>
          </ng-container>

          <!-- BLOGS -->
          <ng-container *ngSwitchCase="'blogs'">
            <section *ngIf="projectBlogs.length" style="padding:90px 6vw; border-top:1px solid #1A1A1A; background:var(--surface);">
              <div style="max-width:1400px; margin:0 auto;">
                <div class="flex items-end justify-between mb-12">
                  <div>
                    <p class="lux-section-label">{{ 'THEME.COMMON.UPDATED' | translate }}</p>
                    <h2 class="lux-section-title">{{ block.props.title || ('THEME.SECTION.NEWS' | translate) }}</h2>
                  </div>
                  <a routerLink="/blogs" style="color:var(--gold); font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none;">{{ 'THEME.COMMON.VIEW_ALL' | translate }} →</a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a *ngFor="let b of projectBlogs" [routerLink]="['/blogs', b.slug]" class="lux-card" style="text-decoration:none;">
                    <div class="lux-card-img-wrap"><img [src]="getBlogImage(b)" class="lux-card-img" [alt]="b.title" loading="lazy"></div>
                    <div class="lux-card-body"><h3 class="lux-card-title line-clamp-2">{{ b.title }}</h3><p style="color:var(--muted); font-size:0.75rem; margin-top:8px;">{{ b.created_at | date:'dd/MM/yyyy' }}</p></div>
                  </a>
                </div>
              </div>
            </section>
          </ng-container>

          <!-- GALLERY -->
          <ng-container *ngSwitchCase="'gallery'">
            <section *ngIf="(block.props.images || []).length" style="padding:90px 6vw; border-top:1px solid #1A1A1A;">
              <div style="max-width:1400px; margin:0 auto;">
                <h2 class="lux-section-title" *ngIf="block.props.title" style="margin-bottom:32px;">{{ block.props.title }}</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <img *ngFor="let img of block.props.images" [src]="img" alt="gallery" style="width:100%; height:280px; object-fit:cover;">
                </div>
              </div>
            </section>
          </ng-container>

          <!-- TEXT -->
          <section *ngSwitchCase="'text'" style="padding:90px 6vw; border-top:1px solid #1A1A1A;">
            <div style="max-width:880px; margin:0 auto;">
              <h2 class="lux-section-title" *ngIf="block.props.heading" style="margin-bottom:28px;">{{ block.props.heading }}</h2>
              <p style="color:rgba(237,232,223,0.7); font-size:1.05rem; line-height:1.9; font-weight:300; white-space:pre-wrap;">{{ block.props.body }}</p>
            </div>
          </section>

          <!-- CTA -->
          <section *ngSwitchCase="'cta'" style="padding:110px 6vw; text-align:center; border-top:1px solid var(--border); background:var(--surface);">
            <h2 class="lux-section-title" style="margin-bottom:28px;">{{ block.props.title }}</h2>
            <a *ngIf="block.props.buttonText" [routerLink]="block.props.buttonLink || '/contact'" class="lux-cta" style="justify-content:center;">{{ block.props.buttonText }} <span class="lux-cta-arrow"></span></a>
          </section>

        </div>
      </ng-container>

      <!-- ── Footer ── -->
      <footer style="border-top:1px solid #1A1A1A; padding:48px 6vw;">
        <div style="max-width:1400px; margin:0 auto; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px;">
          <div>
            <span class="font-display" style="font-size:1.1rem; font-style:italic; color:var(--muted);">{{ cfg.tokens.logoText || project?.name || 'Luxury' }}</span>
            <p *ngIf="cfg.footer.text" style="font-size:0.78rem; color:var(--muted); margin-top:6px; max-width:520px;">{{ cfg.footer.text }}</p>
          </div>
          <div style="font-size:0.7rem; letter-spacing:0.15em; color:var(--muted); text-transform:uppercase; text-align:right;">
            <ng-container *ngIf="cfg.footer.showContact && (cfg.footer.phone || cfg.footer.email)">
              <div *ngIf="cfg.footer.phone">📞 {{ cfg.footer.phone }}</div>
              <div *ngIf="cfg.footer.email">✉️ {{ cfg.footer.email }}</div>
            </ng-container>
            <div *ngIf="!cfg.footer.phone && !cfg.footer.email">{{ 'THEME.LUXURY.COPYRIGHT' | translate }}</div>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class LuxuryComponent implements OnInit, OnChanges {
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
  get isFiltered(): boolean { return this.filter.minPrice !== null || this.filter.maxPrice !== null || this.filter.bedrooms !== null || this.filter.minArea !== null || this.filter.maxArea !== null || this.filter.propertyType !== null; }
  applyFilter() { this.loadProperties(); }
  clearFilter() { this.filter = { minPrice: null, maxPrice: null, bedrooms: null, minArea: null, maxArea: null, propertyType: null, sort: 'newest' }; this.loadProperties(); }

  visibleBlocks(): LayoutBlock[] { return (this.cfg?.blocks || []).filter(b => b.visible); }
  get fHead(): string { return `"${this.cfg?.tokens?.fontHead || 'Cormorant Garamond'}", Georgia, serif`; }
  get fBody(): string { return `"${this.cfg?.tokens?.fontBody || 'Be Vietnam Pro'}", system-ui, sans-serif`; }

  ngOnChanges() { this.cfg = normalizeLayoutFor(this.project?.layout_config, 'luxury'); }

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
    return img?.value || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=75';
  }
  sectionItems(s: any): string[] { return Array.isArray(s?.metadata?.items) ? s.metadata.items : []; }
  safe(url: string): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }

  ngOnInit() {
    if (!this.cfg) this.cfg = normalizeLayoutFor(this.project?.layout_config, 'luxury');
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
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  }

  isFav(propertyId: string): boolean { return this.favoriteService.isFavorite(propertyId); }
  toggleFav(event: Event, propertyId: string) { event.preventDefault(); event.stopPropagation(); this.favoriteService.toggleFavorite(propertyId); this.cdr.markForCheck(); }
}
