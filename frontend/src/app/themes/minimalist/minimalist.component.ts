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
  selector: 'app-minimalist-theme',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent, TranslateModule, FormsModule],
  styles: [`
    :host {
      --ink: #0F0F0F;
      --ink-2: #3A3A3A;
      --subtle: #8A8A8A;
      --rule: #E4E4E0;
      --bg: #FAFAF8;
      --white: #FFFFFF;
      --blue: #0052CC;
      --f-head: 'Cormorant Garamond', Georgia, serif;
      --f-body: 'Be Vietnam Pro', system-ui, sans-serif;
    }

    * { box-sizing: border-box; }
    .font-head { font-family: var(--f-head); }
    .font-body { font-family: var(--f-body); }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }

    /* ── Nav ── */
    .min-nav {
      position: sticky; top: 0; z-index: 50;
      background: color-mix(in srgb, var(--white) 95%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--rule);
    }
    .min-nav-link {
      font-family: var(--f-body);
      font-size: 0.8rem; font-weight: 400;
      color: var(--subtle); text-decoration: none;
      transition: color 0.2s;
      position: relative; padding-bottom: 2px;
    }
    .min-nav-link::after {
      content: ''; position: absolute;
      bottom: 0; left: 0; height: 1px;
      width: 0; background: var(--ink);
      transition: width 0.3s ease;
    }
    .min-nav-link:hover { color: var(--ink); }
    .min-nav-link:hover::after { width: 100%; }

    /* ── Hero ── */
    .min-hero {
      min-height: 92vh; display: grid;
      grid-template-columns: 1fr 1fr;
      background: var(--white);
    }
    @media (max-width: 900px) {
      .min-hero { grid-template-columns: 1fr; min-height: auto; }
      .min-hero-img-col { height: 56vw; min-height: 260px; }
    }
    .min-hero-text-col {
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 80px 7vw 80px 7vw;
      border-right: 1px solid var(--rule);
    }
    .min-hero-img-col { position: relative; overflow: hidden; }
    .min-hero-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 10s ease;
    }
    .min-hero-img-col:hover .min-hero-img { transform: scale(1.04); }
    .min-hero-overline {
      font-family: var(--f-body);
      font-size: 0.65rem; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--subtle);
      margin-bottom: 28px;
      display: flex; align-items: center; gap: 12px;
    }
    .min-hero-overline::before { content: ''; width: 24px; height: 1px; background: var(--subtle); }
    .min-hero-headline {
      font-family: var(--f-head);
      font-size: clamp(2.8rem, 6vw, 6rem);
      font-weight: 700; line-height: 0.95;
      letter-spacing: -0.03em; color: var(--ink);
      margin-bottom: 32px;
    }
    .min-hero-sub {
      font-family: var(--f-body);
      font-size: 0.95rem; color: var(--subtle);
      line-height: 1.75; max-width: 400px;
      margin-bottom: 48px;
    }
    .min-cta {
      display: inline-flex; align-items: center; gap: 12px;
      font-family: var(--f-body);
      font-size: 0.8rem; font-weight: 500;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--white); background: var(--ink);
      text-decoration: none;
      padding: 16px 32px;
      transition: background 0.25s;
    }
    .min-cta:hover { background: var(--blue); }

    /* ── Stats bar ── */
    .min-stats {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      border-bottom: 1px solid var(--rule);
      background: var(--bg);
    }
    .min-stat-item { padding: 36px 7vw; border-right: 1px solid var(--rule); }
    .min-stat-item:last-child { border-right: none; }
    .min-stat-num {
      font-family: var(--f-head);
      font-size: 3rem; font-weight: 700;
      letter-spacing: -0.04em; color: var(--ink);
      line-height: 1;
    }
    .min-stat-num em { color: var(--blue); font-style: normal; }
    .min-stat-label {
      font-family: var(--f-body);
      font-size: 0.7rem; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--subtle);
      margin-top: 8px;
    }

    /* ── Section header ── */
    .min-section-head {
      display: flex; align-items: baseline;
      justify-content: space-between;
      border-bottom: 1px solid var(--rule);
      padding-bottom: 20px; margin-bottom: 48px;
    }
    .min-section-title {
      font-family: var(--f-head);
      font-size: clamp(1.6rem, 3vw, 2.8rem);
      font-weight: 700; letter-spacing: -0.02em; color: var(--ink);
    }
    .min-section-count {
      font-family: var(--f-body);
      font-size: 0.7rem; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--subtle);
    }

    /* ── Property list items ── */
    .min-prop-row {
      display: grid; grid-template-columns: 200px 1fr auto;
      gap: 32px; align-items: center;
      border-bottom: 1px solid var(--rule);
      padding: 28px 0;
      transition: background 0.2s;
      text-decoration: none; color: inherit;
    }
    @media (max-width: 640px) {
      .min-prop-row { grid-template-columns: 100px 1fr; }
      .min-prop-price-col { display: none; }
    }
    .min-prop-row:hover { background: var(--bg); margin: 0 -24px; padding: 28px 24px; }
    .min-prop-img {
      width: 200px; height: 140px;
      object-fit: cover; display: block;
      transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
      overflow: hidden;
    }
    @media (max-width: 640px) { .min-prop-img { width: 100px; height: 80px; } }
    .min-prop-row:hover .min-prop-img { transform: scale(1.04); }
    .min-prop-title {
      font-family: var(--f-head);
      font-size: 1.15rem; font-weight: 600;
      letter-spacing: -0.01em; color: var(--ink);
      margin-bottom: 8px; line-height: 1.3;
    }
    .min-prop-meta {
      font-family: var(--f-body);
      font-size: 0.78rem; color: var(--subtle);
      display: flex; flex-wrap: wrap; gap: 16px;
    }
    .min-prop-price {
      font-family: var(--f-head);
      font-size: 1rem; font-weight: 600;
      color: var(--blue); white-space: nowrap;
    }

    /* ── Fav ── */
    .min-fav { border: none; background: none; padding: 0; cursor: pointer; color: var(--rule); transition: color 0.2s; }
    .min-fav:hover { color: var(--ink); }
    .min-fav.active { color: #ef4444; }

    /* ── Spinner ── */
    .min-spinner {
      width: 24px; height: 24px;
      border: 2px solid var(--rule);
      border-top-color: var(--ink);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  template: `
    <div class="font-body"
         style="min-height:100vh; background:var(--white); color:var(--ink);"
         [style.--ink]="cfg.tokens.colorText"
         [style.--blue]="cfg.tokens.colorPrimary"
         [style.--white]="cfg.tokens.colorBg"
         [style.--f-head]="fHead"
         [style.--f-body]="fBody">

      <!-- ── Nav ── -->
      <nav class="min-nav">
        <div style="max-width:1400px; margin:0 auto; padding:0 7vw; height:60px; display:flex; align-items:center; justify-content:space-between;">
          <a routerLink="/" class="font-head" style="font-size:1rem; font-weight:700; letter-spacing:-0.02em; color:var(--ink); text-decoration:none; display:flex; align-items:center; gap:10px;">
            <img *ngIf="cfg.tokens.logoUrl" [src]="cfg.tokens.logoUrl" alt="logo" style="height:26px; width:auto; object-fit:contain;">
            <span>{{ cfg.tokens.logoText || project?.name || 'Minimalist' }}</span>
          </a>
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/"        class="min-nav-link">{{ 'NAVBAR.HOME'    | translate }}</a>
            <a href="#listing"       class="min-nav-link">{{ 'THEME.SECTION.PROPERTIES' | translate }}</a>
            <a *ngFor="let s of projectSections" [href]="'#section-' + s.id" class="min-nav-link">{{ s.title }}</a>
            <a routerLink="/about"   class="min-nav-link">{{ 'NAVBAR.ABOUT'   | translate }}</a>
            <a routerLink="/contact" class="min-nav-link">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <!-- ── Blocks ── -->
      <ng-container *ngFor="let block of visibleBlocks()">
        <div [ngSwitch]="block.type">

          <!-- HERO -->
          <section *ngSwitchCase="'hero'" class="min-hero">
            <div class="min-hero-text-col">
              <p class="min-hero-overline fade-up" style="animation-delay:0.05s;">
                {{ block.props.subtitle ? '' : ('THEME.MINIMALIST.HERO_SUB' | translate) }}
              </p>
              <h1 class="min-hero-headline fade-up" style="animation-delay:0.15s;">
                {{ block.props.title || project?.name || ('THEME.MINIMALIST.DEFAULT_NAME' | translate) }}
              </h1>
              <p class="min-hero-sub fade-up" style="animation-delay:0.25s;">
                {{ block.props.subtitle || project?.description || ('THEME.MINIMALIST.DEFAULT_DESC' | translate) }}
              </p>
              <a [href]="block.props.ctaLink || '#listing'" class="min-cta fade-up" style="animation-delay:0.35s;">
                {{ block.props.ctaText || ('THEME.MINIMALIST.EXPLORE_NOW' | translate) }}
                <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
            </div>
            <div class="min-hero-img-col fade-up" style="animation-delay:0.1s;">
              <img [src]="block.props.image || 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85'"
                   class="min-hero-img" alt="Hero" loading="eager">
            </div>
          </section>

          <!-- STATS -->
          <div *ngSwitchCase="'stats'" class="min-stats">
            <ng-container *ngIf="block.props.items?.length; else defaultStats">
              <div *ngFor="let it of block.props.items; let i = index" class="min-stat-item fade-up" [style.animation-delay]="(0.1 + i*0.1) + 's'">
                <div class="min-stat-num">{{ it.value }}</div>
                <div class="min-stat-label">{{ it.label }}</div>
              </div>
            </ng-container>
            <ng-template #defaultStats>
              <div class="min-stat-item fade-up" style="animation-delay:0.1s;">
                <div class="min-stat-num">{{ properties.length }}<em>+</em></div>
                <div class="min-stat-label">{{ 'THEME.MINIMALIST.STAT_PROPS' | translate }}</div>
              </div>
              <div class="min-stat-item fade-up" style="animation-delay:0.2s;">
                <div class="min-stat-num"><em>A+</em></div>
                <div class="min-stat-label">{{ 'THEME.MINIMALIST.STAT_DESIGN' | translate }}</div>
              </div>
              <div class="min-stat-item fade-up" style="animation-delay:0.3s;">
                <div class="min-stat-num">24<em>/7</em></div>
                <div class="min-stat-label">{{ 'THEME.MINIMALIST.STAT_SERVICE' | translate }}</div>
              </div>
            </ng-template>
          </div>

          <!-- PROPERTIES -->
          <section *ngSwitchCase="'properties'" id="listing" style="padding:80px 7vw 120px; max-width:1400px; margin:0 auto;">
            <div class="min-section-head fade-up">
              <h2 class="min-section-title">{{ block.props.title || ('THEME.MINIMALIST.LISTING_TITLE' | translate) }}</h2>
              <span class="min-section-count">{{ 'THEME.COMMON.PROPERTIES_COUNT' | translate:{ n: properties.length } }}</span>
            </div>

            <!-- Filter bar -->
            <div *ngIf="block.props.showFilter !== false && !isLoading"
                 style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--rule);">
              <select [(ngModel)]="filter.propertyType" (ngModelChange)="applyFilter()" style="border:1px solid var(--rule);padding:8px 12px;font-size:0.8rem;color:var(--ink-2);background:white;min-width:120px;">
                <option [ngValue]="null">{{ 'THEME.FILTER.TYPE' | translate }}</option>
                <option *ngFor="let c of categories" [ngValue]="c.slug">{{ c.name }}</option>
              </select>
              <select [(ngModel)]="filter.minPrice" (ngModelChange)="applyFilter()" style="border:1px solid var(--rule);padding:8px 12px;font-size:0.8rem;color:var(--ink-2);background:white;min-width:120px;">
                <option [ngValue]="null">{{ 'THEME.FILTER.MIN_PRICE' | translate }}</option>
                <option [ngValue]="1000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 1 } }}</option>
                <option [ngValue]="2000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 2 } }}</option>
                <option [ngValue]="5000000000">{{ 'THEME.FILTER.BILLION_PLUS' | translate:{ n: 5 } }}</option>
              </select>
              <select [(ngModel)]="filter.maxPrice" (ngModelChange)="applyFilter()" style="border:1px solid var(--rule);padding:8px 12px;font-size:0.8rem;color:var(--ink-2);background:white;min-width:120px;">
                <option [ngValue]="null">{{ 'THEME.FILTER.MAX_PRICE' | translate }}</option>
                <option [ngValue]="2000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 2 } }}</option>
                <option [ngValue]="5000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 5 } }}</option>
                <option [ngValue]="10000000000">{{ 'THEME.FILTER.UNDER_BILLION' | translate:{ n: 10 } }}</option>
              </select>
              <select [(ngModel)]="filter.bedrooms" (ngModelChange)="applyFilter()" style="border:1px solid var(--rule);padding:8px 12px;font-size:0.8rem;color:var(--ink-2);background:white;min-width:120px;">
                <option [ngValue]="null">{{ 'THEME.FILTER.BEDROOMS' | translate }}</option>
                <option [ngValue]="1">{{ 'THEME.FILTER.BED_N' | translate:{ n: 1 } }}{{ bedroomCount(1) ? ' · ' + bedroomCount(1) : '' }}</option>
                <option [ngValue]="2">{{ 'THEME.FILTER.BED_N' | translate:{ n: 2 } }}{{ bedroomCount(2) ? ' · ' + bedroomCount(2) : '' }}</option>
                <option [ngValue]="3">{{ 'THEME.FILTER.BED_N' | translate:{ n: 3 } }}{{ bedroomCount(3) ? ' · ' + bedroomCount(3) : '' }}</option>
                <option [ngValue]="4">{{ 'THEME.FILTER.BED_PLUS' | translate:{ n: 4 } }}</option>
              </select>
              <select [(ngModel)]="filter.minArea" (ngModelChange)="applyFilter()" style="border:1px solid var(--rule);padding:8px 12px;font-size:0.8rem;color:var(--ink-2);background:white;min-width:120px;">
                <option [ngValue]="null">{{ 'THEME.FILTER.AREA_FROM' | translate }}</option>
                <option [ngValue]="50">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 50 } }}</option>
                <option [ngValue]="80">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 80 } }}</option>
                <option [ngValue]="120">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 120 } }}</option>
              </select>
              <select [(ngModel)]="filter.sort" (ngModelChange)="applyFilter()" style="border:1px solid var(--rule);padding:8px 12px;font-size:0.8rem;color:var(--ink-2);background:white;min-width:130px;">
                <option value="newest">{{ 'THEME.FILTER.SORT_NEWEST' | translate }}</option>
                <option value="price_asc">{{ 'THEME.FILTER.SORT_PRICE_ASC' | translate }}</option>
                <option value="price_desc">{{ 'THEME.FILTER.SORT_PRICE_DESC' | translate }}</option>
              </select>
              <button *ngIf="isFiltered" (click)="clearFilter()" style="border:1px solid var(--ink);background:var(--ink);color:white;padding:8px 16px;font-size:0.75rem;letter-spacing:0.1em;cursor:pointer;">
                {{ 'THEME.FILTER.CLEAR' | translate }} · {{ filteredProperties.length }}/{{ properties.length }}
              </button>
            </div>

            <div *ngIf="isLoading || isFiltering" style="padding:60px 0; display:flex; justify-content:center;"><div class="min-spinner"></div></div>

            <div *ngIf="!isLoading && !isFiltering">
              <a *ngFor="let prop of filteredProperties; let i = index"
                 [routerLink]="['/project', project?.slug || project?.id || prop.project_id, 'property', prop.slug]"
                 class="min-prop-row fade-up" [style.animation-delay]="(i * 0.07) + 's'">
                <div style="overflow:hidden; flex-shrink:0;">
                  <img [src]="getThumbnail(prop)" class="min-prop-img" [alt]="prop.title" loading="lazy">
                </div>
                <div>
                  <h3 class="min-prop-title line-clamp-2">{{ prop.title }}</h3>
                  <div class="min-prop-meta">
                    <span *ngIf="prop.attributes?.bedrooms">{{ prop.attributes.bedrooms }} {{ 'THEME.COMMON.BEDROOMS_FULL' | translate }}</span>
                    <span *ngIf="prop.attributes?.bathrooms">{{ prop.attributes.bathrooms }} WC</span>
                    <span *ngIf="prop.attributes?.area">{{ prop.attributes.area }} m²</span>
                    <span *ngIf="prop.attributes?.area && prop.price">{{ (prop.price / prop.attributes.area) | number:'1.0-0' }} ₫/m²</span>
                  </div>
                </div>
                <div class="min-prop-price-col" style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:12px;">
                  <span class="min-prop-price">{{ prop.price | number }} ₫</span>
                  <button (click)="toggleFav($event, prop.id)" class="min-fav" [class.active]="isFav(prop.id)" [attr.aria-label]="'THEME.DETAIL.FAVORITE' | translate">
                    <svg [attr.fill]="isFav(prop.id) ? 'currentColor' : 'none'" style="width:18px;height:18px;" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>
                </div>
              </a>
            </div>

            <div *ngIf="!isLoading && !isFiltering && filteredProperties.length === 0" style="padding:80px 0; text-align:center; border-top:1px solid var(--rule);">
              <p class="font-head" style="font-size:2rem; font-weight:700; color:var(--rule); letter-spacing:-0.04em;">— {{ 'THEME.COMMON.NO_DATA' | translate }} —</p>
              <p style="margin-top:12px; font-size:0.875rem; color:var(--subtle);">{{ 'THEME.COMMON.NO_MATCH' | translate }}</p>
            </div>
          </section>

          <!-- SECTIONS -->
          <ng-container *ngSwitchCase="'sections'">
            <section *ngFor="let s of projectSections" [id]="'section-' + s.id"
                     style="padding:72px 7vw; max-width:1400px; margin:0 auto; border-top:1px solid var(--rule);">
              <div class="min-section-head fade-up">
                <h2 class="min-section-title">{{ s.title }}</h2>
                <span class="min-section-count">{{ 'THEME.SECTION_TYPE.' + s.section_type | translate }}</span>
              </div>
              <div style="display:grid; grid-template-columns:1fr; gap:32px;" [style.grid-template-columns]="s.image_url ? '1.4fr 1fr' : '1fr'">
                <div>
                  <p *ngIf="s.content" style="font-size:0.95rem; color:var(--ink-2); line-height:1.8; white-space:pre-wrap; max-width:640px;">{{ s.content }}</p>
                  <div *ngIf="s.section_type === 'developer' && s.metadata" style="margin-top:20px; font-size:0.85rem; color:var(--subtle); line-height:1.9;">
                    <div *ngIf="s.metadata.name"><strong style="color:var(--ink);">{{ 'THEME.COMMON.DEVELOPER' | translate }}:</strong> {{ s.metadata.name }}</div>
                    <div *ngIf="s.metadata.established_year"><strong style="color:var(--ink);">{{ 'THEME.COMMON.ESTABLISHED' | translate }}:</strong> {{ s.metadata.established_year }}</div>
                    <div *ngIf="s.metadata.website"><a [href]="s.metadata.website" target="_blank" style="color:var(--blue);">{{ s.metadata.website }}</a></div>
                  </div>
                  <div *ngIf="s.section_type === 'location' && s.metadata?.address" style="margin-top:16px; font-size:0.9rem; color:var(--ink-2);">📍 {{ s.metadata.address }}</div>
                  <div *ngIf="s.section_type === 'location' && s.metadata?.map_embed_url" style="margin-top:16px;">
                    <iframe [src]="safe(s.metadata.map_embed_url)" style="width:100%; height:320px; border:1px solid var(--rule);" loading="lazy"></iframe>
                  </div>
                  <ul *ngIf="sectionItems(s).length" style="margin-top:16px; list-style:none; padding:0; columns:2; column-gap:32px;">
                    <li *ngFor="let it of sectionItems(s)" style="font-size:0.88rem; color:var(--ink-2); padding:6px 0; break-inside:avoid;">— {{ it }}</li>
                  </ul>
                </div>
                <div *ngIf="s.image_url"><img [src]="s.image_url" [alt]="s.title" style="width:100%; height:100%; max-height:360px; object-fit:cover;"></div>
              </div>
            </section>
          </ng-container>

          <!-- BLOGS -->
          <ng-container *ngSwitchCase="'blogs'">
            <section *ngIf="projectBlogs.length" style="padding:72px 7vw; max-width:1400px; margin:0 auto; border-top:1px solid var(--rule);">
              <div class="min-section-head fade-up">
                <h2 class="min-section-title">{{ block.props.title || ('THEME.SECTION.NEWS' | translate) }}</h2>
                <a routerLink="/blogs" class="min-section-count" style="text-decoration:none;">{{ 'THEME.COMMON.VIEW_ALL' | translate }} →</a>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:28px;">
                <a *ngFor="let b of projectBlogs" [routerLink]="['/blogs', b.slug]" style="text-decoration:none; color:inherit;">
                  <img [src]="getBlogImage(b)" [alt]="b.title" style="width:100%; height:180px; object-fit:cover; margin-bottom:14px;">
                  <h3 class="min-prop-title line-clamp-2">{{ b.title }}</h3>
                  <p style="font-size:0.75rem; color:var(--subtle); margin-top:6px;">{{ b.created_at | date:'dd/MM/yyyy' }}</p>
                </a>
              </div>
            </section>
          </ng-container>

          <!-- GALLERY -->
          <ng-container *ngSwitchCase="'gallery'">
            <section *ngIf="(block.props.images || []).length" style="padding:72px 7vw; max-width:1400px; margin:0 auto; border-top:1px solid var(--rule);">
              <div class="min-section-head fade-up" *ngIf="block.props.title"><h2 class="min-section-title">{{ block.props.title }}</h2></div>
              <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px;">
                <img *ngFor="let img of block.props.images" [src]="img" alt="gallery" style="width:100%; height:220px; object-fit:cover;">
              </div>
            </section>
          </ng-container>

          <!-- TEXT -->
          <section *ngSwitchCase="'text'" style="padding:72px 7vw; max-width:1400px; margin:0 auto; border-top:1px solid var(--rule);">
            <div class="min-section-head fade-up" *ngIf="block.props.heading"><h2 class="min-section-title">{{ block.props.heading }}</h2></div>
            <p style="font-size:1rem; color:var(--ink-2); line-height:1.85; white-space:pre-wrap; max-width:720px;">{{ block.props.body }}</p>
          </section>

          <!-- CTA -->
          <section *ngSwitchCase="'cta'" style="padding:90px 7vw; background:var(--ink); color:var(--white); text-align:center;">
            <h2 class="font-head" style="font-size:clamp(1.8rem,4vw,3rem); font-weight:700; letter-spacing:-0.02em; margin-bottom:24px;">{{ block.props.title }}</h2>
            <a *ngIf="block.props.buttonText" [routerLink]="block.props.buttonLink || '/contact'" class="min-cta" style="background:var(--white); color:var(--ink);">{{ block.props.buttonText }}</a>
          </section>

        </div>
      </ng-container>

      <!-- ── Footer ── -->
      <footer style="border-top:1px solid var(--rule); padding:40px 7vw; background:var(--bg);">
        <div style="max-width:1400px; margin:0 auto; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div>
            <span class="font-head" style="font-size:0.875rem; font-weight:700; letter-spacing:-0.01em;">{{ cfg.tokens.logoText || project?.name || 'Minimalist' }}</span>
            <p *ngIf="cfg.footer.text" style="font-size:0.78rem; color:var(--subtle); margin-top:6px; max-width:520px;">{{ cfg.footer.text }}</p>
          </div>
          <div *ngIf="cfg.footer.showContact" style="font-size:0.72rem; color:var(--subtle); text-align:right; letter-spacing:0.05em;">
            <div *ngIf="cfg.footer.phone">📞 {{ cfg.footer.phone }}</div>
            <div *ngIf="cfg.footer.email">✉️ {{ cfg.footer.email }}</div>
            <div *ngIf="!cfg.footer.phone && !cfg.footer.email" style="text-transform:uppercase;">© 2025</div>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class MinimalistComponent implements OnInit, OnChanges {
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
  get fHead(): string { return `"${this.cfg?.tokens?.fontHead || 'Cormorant Garamond'}", Georgia, serif`; }
  get fBody(): string { return `"${this.cfg?.tokens?.fontBody || 'Be Vietnam Pro'}", system-ui, sans-serif`; }

  ngOnChanges() { this.cfg = normalizeLayoutFor(this.project?.layout_config, 'minimalist'); }

  private loadProperties() {
    this.isFiltering = true;
    this.cdr.markForCheck();
    const params: Record<string, any> = { limit: 50 };
    if (this.project?.id)        params['project_id']    = this.project.id;
    if (this.filter.minPrice)    params['min_price']     = this.filter.minPrice;
    if (this.filter.maxPrice)    params['max_price']     = this.filter.maxPrice;
    if (this.filter.bedrooms)    params['bedrooms']      = this.filter.bedrooms;
    if (this.filter.minArea)     params['min_area']      = this.filter.minArea;
    if (this.filter.maxArea)     params['max_area']      = this.filter.maxArea;
    if (this.filter.propertyType) params['property_type'] = this.filter.propertyType;
    if (this.filter.sort)        params['sort']          = this.filter.sort;
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
    return img?.value || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=75';
  }
  sectionItems(s: any): string[] { return Array.isArray(s?.metadata?.items) ? s.metadata.items : []; }
  safe(url: string): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }

  ngOnInit() {
    if (!this.cfg) this.cfg = normalizeLayoutFor(this.project?.layout_config, 'minimalist');
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
    return 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=600&q=75';
  }

  isFav(id: string): boolean { return this.favoriteService.isFavorite(id); }
  toggleFav(event: Event, id: string) { event.preventDefault(); event.stopPropagation(); this.favoriteService.toggleFavorite(id); this.cdr.markForCheck(); }
}
