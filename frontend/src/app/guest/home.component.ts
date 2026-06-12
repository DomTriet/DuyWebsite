import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { GuestNavComponent } from '../shared/components/guest-nav/guest-nav.component';
import { GuestFooterComponent } from '../shared/components/guest-footer/guest-footer.component';
import { SeoService } from '../core/services/seo.service';
import { FavoriteService } from '../core/services/favorite.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule, GuestNavComponent, GuestFooterComponent],
  styles: [`
    :host { display: block; }
    .hero-title { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.035em; line-height: 1.05; }
    .section-title { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.025em; }
    .field { border: 1.5px solid #E5E4E0; border-radius: 10px; padding: 12px 14px; font-size: 0.875rem; background: #fff; transition: border-color 0.2s; width: 100%; color: #111; appearance: none; min-height: 44px; }
    .field:focus { outline: none; border-color: #111; }
    .search-wrap { box-shadow: 0 2px 40px rgba(0,0,0,0.08); }
    .suggest-item:hover { background: #F8F7F5; }
    .chip { display: inline-block; background: rgba(13,13,13,0.72); backdrop-filter: blur(4px); color: #fff; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; }
    .prop-card { border: 1px solid #EBEBEB; border-radius: 18px; overflow: hidden; background: #fff; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s; }
    .prop-card:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(0,0,0,0.10); border-color: #D4D4D4; }
    .proj-card { border: 1px solid #EBEBEB; border-radius: 20px; background: #fff; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s; display: flex; flex-direction: column; }
    .proj-card:hover { transform: translateY(-6px); box-shadow: 0 24px 56px rgba(0,0,0,0.11); }
    .price-tag { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 700; letter-spacing: -0.02em; color: #0D0D0D; }
    .brand-btn { display: block; text-align: center; background: #0D0D0D; color: #fff !important; border-radius: 10px; font-weight: 700; font-size: 0.875rem; padding: 12px 20px; border: none; cursor: pointer; transition: background 0.2s; text-decoration: none; min-height: 44px; }
    .brand-btn:hover { background: #2A2A2A; }
    .reveal { animation: revealUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .slider-wrap { display:flex; overflow-x:hidden; scroll-snap-type:x mandatory; scroll-behavior:smooth; width:100%; }
    .slide { flex-shrink:0; width:100%; scroll-snap-align:start; position:relative; min-height:480px; display:flex; align-items:center; justify-content:center; }
    .slide-bg { position:absolute; inset:0; background-size:cover; background-position:center; }
    .slide-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.45); }
    .slide-content { position:relative; z-index:2; text-align:center; padding:40px 24px; max-width:640px; }
    .slider-dot { width:8px; height:8px; border-radius:9999px; background:rgba(255,255,255,0.4); border:none; cursor:pointer; padding:0; transition:all 0.2s; }
    .slider-dot.active { background:#fff; width:24px; }
  `],
  template: `
    <div class="min-h-screen flex flex-col bg-white">
      <app-guest-nav active="home"></app-guest-nav>

      <!-- ── Hero Slider (nếu có banner) ── -->
      <section *ngIf="banners.length > 0" style="position:relative;background:#111;">
        <div #sliderEl class="slider-wrap" id="heroSlider">
          <div *ngFor="let b of banners" class="slide">
            <div class="slide-bg" [style.background-image]="'url(' + b.image_url + ')'"></div>
            <div class="slide-overlay"></div>
            <div class="slide-content">
              <h1 style="font-family:'Lora',Georgia,serif;font-size:clamp(2rem,5vw,3.6rem);font-weight:700;color:#F7F6F3;margin-bottom:14px;line-height:1.15;">{{ b.title }}</h1>
              <p *ngIf="b.subtitle" style="font-size:1rem;color:rgba(247,246,243,0.8);margin-bottom:28px;line-height:1.7;">{{ b.subtitle }}</p>
              <a *ngIf="b.cta_link" [routerLink]="b.cta_link"
                 style="display:inline-block;background:#F7F6F3;color:#0D0D0D;font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;font-size:0.9rem;padding:12px 28px;border-radius:10px;text-decoration:none;transition:background 0.2s;">
                {{ b.cta_text || 'Khám phá ngay' }}
              </a>
            </div>
          </div>
        </div>
        <!-- Dots -->
        <div *ngIf="banners.length > 1" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:10;">
          <button *ngFor="let b of banners; let i = index"
                  class="slider-dot" [class.active]="currentSlide === i"
                  (click)="goToSlide(i)"
                  [attr.aria-label]="'Slide ' + (i+1)">
          </button>
        </div>
      </section>

      <!-- ── Hero + Search ── -->
      <section style="position:relative; background:#0f0d0a; overflow:hidden;">
        <!-- Background image -->
        <div style="position:absolute; inset:0; background:url('assets/images/hero-bg.png') center/cover no-repeat; transform:scale(1.02);"></div>
        <!-- Vignette: tối ở tâm (nổi chữ), trong dần ra cạnh (ảnh rõ) -->
        <div style="position:absolute; inset:0; background: radial-gradient(ellipse 70% 60% at 50% 42%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.08) 75%, transparent 100%);"></div>
        <!-- Cạnh trên/dưới mờ nhẹ để blend vào trang -->
        <div style="position:absolute; inset:0; background: linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.28) 100%);"></div>

        <div class="max-w-5xl mx-auto" style="position:relative; z-index:2; padding: clamp(80px,12vw,120px) 16px clamp(64px,10vw,96px);">

          <div class="text-center reveal" style="margin-bottom:52px;">
            <p style="font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.6); margin-bottom:18px;">
              Bất Động Sản Điểm Tâm
            </p>
            <h1 class="hero-title" style="font-size: clamp(2.6rem, 7vw, 5.5rem); font-weight: 900; color: #F7F6F3; margin-bottom: 20px; text-shadow: 0 2px 24px rgba(0,0,0,0.45);">
              {{ 'HOME.HERO_TITLE' | translate }}
            </h1>
            <p style="font-size: 1.05rem; color: rgba(247,246,243,0.82); max-width: 500px; margin: 0 auto; line-height: 1.75; text-shadow: 0 1px 10px rgba(0,0,0,0.35);">
              {{ 'HOME.HERO_DESC' | translate }}
            </p>
          </div>

          <!-- Search widget -->
          <div class="bg-white rounded-2xl search-wrap" style="padding: 24px; border: 1px solid rgba(0,0,0,0.07);">
            <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style="margin-bottom:12px;">

                <!-- Keyword + autocomplete -->
                <div class="lg:col-span-2" style="position:relative;">
                  <div style="display:flex; align-items:center; border:1.5px solid #E5E4E0; border-radius:10px; overflow:hidden; background:#fff; transition:border-color 0.2s;">
                    <svg style="width:15px;height:15px;color:#9CA3AF;margin-left:14px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input type="text" formControlName="search"
                           [placeholder]="'HOME.SEARCH_PLACEHOLDER' | translate"
                           (input)="onSearchInput()"
                           (focus)="showSuggestions = suggestions.length > 0"
                           (blur)="hideSuggestionsDelay()"
                           style="flex:1;padding:11px 14px;font-size:0.875rem;background:transparent;border:none;outline:none;color:#111;">
                    <button *ngIf="searchForm.value.search" type="button" (click)="clearSearchInput()" aria-label="Xóa nội dung tìm kiếm" style="margin-right:10px;color:#9CA3AF;background:none;border:none;cursor:pointer;">
                      <svg aria-hidden="true" style="width:15px;height:15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <!-- Autocomplete dropdown -->
                  <div *ngIf="showSuggestions && suggestions.length > 0"
                       style="position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1px solid #E5E4E0;border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,0.10);z-index:50;overflow:hidden;">
                    <a *ngFor="let s of suggestions" [routerLink]="['/project', s.projects?.slug || s.project_id, 'property', s.slug]"
                       class="suggest-item" style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:background 0.15s;border-bottom:1px solid #F5F4F2;text-decoration:none;">
                      <div style="width:38px;height:30px;border-radius:6px;background:#F0EFE9;overflow:hidden;flex-shrink:0;">
                        <img *ngIf="getSuggestThumb(s)" [src]="getSuggestThumb(s)" style="width:100%;height:100%;object-fit:cover;">
                      </div>
                      <div style="min-width:0;">
                        <p style="font-size:0.85rem;font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ s.title }}</p>
                        <p class="price-tag" style="font-size:0.78rem;">{{ s.price | number }} ₫</p>
                      </div>
                    </a>
                  </div>
                </div>

                <input type="number" formControlName="min_price" [placeholder]="'HOME.MIN_PRICE' | translate" class="field">
                <input type="number" formControlName="max_price" [placeholder]="'HOME.MAX_PRICE' | translate" class="field">
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <select formControlName="bedrooms" class="field">
                  <option value="">{{ 'HOMEX.BEDROOMS' | translate }}</option>
                  <option value="1">{{ 'THEME.FILTER.BED_N' | translate:{ n: 1 } }}</option>
                  <option value="2">{{ 'THEME.FILTER.BED_N' | translate:{ n: 2 } }}</option>
                  <option value="3">{{ 'THEME.FILTER.BED_N' | translate:{ n: 3 } }}</option>
                  <option value="4">{{ 'THEME.FILTER.BED_PLUS' | translate:{ n: 4 } }}</option>
                </select>
                <select formControlName="property_type" class="field">
                  <option value="">{{ 'HOMEX.PROP_TYPE' | translate }}</option>
                  <option value="can-ho">{{ 'HOMEX.TYPE_APARTMENT' | translate }}</option>
                  <option value="biet-thu">{{ 'HOMEX.TYPE_VILLA' | translate }}</option>
                  <option value="dat-nen">{{ 'HOMEX.TYPE_LAND' | translate }}</option>
                  <option value="shophouse">{{ 'HOMEX.TYPE_SHOPHOUSE' | translate }}</option>
                  <option value="nha-pho">{{ 'HOMEX.TYPE_TOWNHOUSE' | translate }}</option>
                </select>
                <select formControlName="min_area" class="field">
                  <option value="">{{ 'HOMEX.AREA' | translate }} (từ)</option>
                  <option value="30">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 30 } }}</option>
                  <option value="50">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 50 } }}</option>
                  <option value="80">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 80 } }}</option>
                  <option value="100">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 100 } }}</option>
                  <option value="150">{{ 'THEME.FILTER.AREA_PLUS' | translate:{ n: 150 } }}</option>
                </select>
                <select formControlName="max_area" class="field">
                  <option value="">{{ 'HOMEX.AREA' | translate }} (đến)</option>
                  <option value="50">≤ 50 m²</option>
                  <option value="80">≤ 80 m²</option>
                  <option value="100">≤ 100 m²</option>
                  <option value="150">≤ 150 m²</option>
                  <option value="200">≤ 200 m²</option>
                  <option value="300">≤ 300 m²</option>
                </select>
                <select formControlName="sort" class="field">
                  <option value="newest">{{ 'HOMEX.SORT_NEWEST' | translate }}</option>
                  <option value="oldest">{{ 'HOMEX.SORT_OLDEST' | translate }}</option>
                  <option value="price_asc">{{ 'HOMEX.SORT_PRICE_ASC' | translate }}</option>
                  <option value="price_desc">{{ 'HOMEX.SORT_PRICE_DESC' | translate }}</option>
                </select>
                <button type="submit" class="brand-btn col-span-2 lg:col-span-1" style="display:flex;align-items:center;justify-content:center;gap:8px;">
                  <svg *ngIf="!isSearching" style="width:15px;height:15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <span *ngIf="isSearching" style="width:15px;height:15px;border:2px solid rgba(255,255,255,0.35);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;flex-shrink:0;"></span>
                  {{ 'HOME.SEARCH_BTN' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- ── Search Results ── -->
      <section *ngIf="hasSearched" class="flex-1 max-w-7xl mx-auto w-full px-6" style="padding-top:64px;padding-bottom:80px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-bottom:40px;">
          <div>
            <h2 class="section-title" style="font-size:1.75rem;font-weight:900;color:#0D0D0D;">{{ 'HOME.SEARCH_RESULTS' | translate }}</h2>
            <p style="color:#9CA3AF;font-size:0.875rem;margin-top:4px;">
              <span *ngIf="!isSearching">{{ 'HOMEX.RESULT_META' | translate:{ total: (searchMeta.total | number), page: searchMeta.page, pages: searchMeta.totalPages } }}</span>
              <span *ngIf="isSearching">{{ 'HOMEX.SEARCHING' | translate }}</span>
            </p>
          </div>
          <button (click)="clearSearch()" style="display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:10px;background:#F5F4F2;color:#374151;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;transition:background 0.15s;">
            <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            {{ 'HOMEX.CLEAR_SEARCH' | translate }}
          </button>
        </div>

        <!-- Skeleton -->
        <div *ngIf="isSearching" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="animate-pulse">
            <div style="background:#EBEBEB;border-radius:18px;height:220px;margin-bottom:12px;"></div>
            <div style="background:#EBEBEB;border-radius:6px;height:14px;width:50%;margin-bottom:8px;"></div>
            <div style="background:#EBEBEB;border-radius:6px;height:18px;width:75%;margin-bottom:8px;"></div>
            <div style="background:#EBEBEB;border-radius:6px;height:14px;width:35%;"></div>
          </div>
        </div>

        <!-- Results grid -->
        <div *ngIf="!isSearching && searchedProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let prop of searchedProperties" class="group prop-card">
            <div style="position:relative;height:220px;overflow:hidden;background:#F0EFE9;">
              <a [routerLink]="['/project', prop.projects?.slug || prop.project_id, 'property', prop.slug]" style="display:block;width:100%;height:100%;">
                <img [src]="getPropThumbnail(prop)" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s cubic-bezier(0.16,1,0.3,1);" class="group-hover:scale-105" loading="lazy">
              </a>
              <button (click)="toggleFav($event, prop.id)"
                      [attr.aria-label]="isFav(prop.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
                      style="position:absolute;top:10px;right:10px;padding:11px;border-radius:50%;background:rgba(255,255,255,0.9);backdrop-filter:blur(4px);border:none;cursor:pointer;line-height:0;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;">
                <svg aria-hidden="true" [ngClass]="isFav(prop.id) ? 'text-red-500 fill-current' : 'text-gray-400'" style="width:18px;height:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
              <span *ngIf="prop.attributes?.property_type || prop.categories?.name" class="chip" style="position:absolute;top:12px;left:12px;">
                {{ prop.attributes?.property_type || prop.categories?.name }}
              </span>
            </div>
            <div style="padding:20px 22px 22px;">
              <a [routerLink]="['/project', prop.projects?.slug || prop.project_id, 'property', prop.slug]" style="text-decoration:none;">
                <h3 style="font-weight:700;color:#0D0D0D;line-height:1.4;font-size:0.925rem;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color 0.2s;" class="group-hover:text-gray-500">{{ prop.title }}</h3>
              </a>
              <div class="price-tag" style="font-size:1.05rem;margin-bottom:12px;">{{ prop.price | number }} ₫</div>
              <div style="display:flex;gap:12px;font-size:0.78rem;color:#9CA3AF;">
                <span *ngIf="prop.attributes?.bedrooms">🛏 {{ prop.attributes.bedrooms }} PN</span>
                <span *ngIf="prop.attributes?.area">📐 {{ prop.attributes.area }} m²</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="!isSearching && searchedProperties.length === 0" style="display:flex;flex-direction:column;align-items:center;padding:80px 0;text-align:center;">
          <svg style="width:52px;height:52px;color:#E5E4E0;margin-bottom:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <p style="color:#6B7280;font-size:1rem;font-weight:600;">{{ 'HOME.NO_RESULTS' | translate }}</p>
          <p style="color:#9CA3AF;font-size:0.875rem;margin-top:4px;">{{ 'HOMEX.NO_RESULT_SUB' | translate }}</p>
          <button (click)="clearSearch()" style="margin-top:16px;color:#0D0D0D;font-size:0.875rem;font-weight:700;background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px;">{{ 'HOMEX.CLEAR_FILTER' | translate }}</button>
        </div>

        <!-- Pagination -->
        <div *ngIf="!isSearching && searchMeta.totalPages > 1" style="display:flex;justify-content:center;gap:8px;margin-top:48px;">
          <button *ngFor="let p of paginationPages" (click)="goToPage(p)"
                  style="width:44px;height:44px;border-radius:10px;font-size:0.875rem;font-weight:700;border:none;cursor:pointer;transition:all 0.15s;"
                  [style.background]="p === searchMeta.page ? '#0D0D0D' : '#F5F4F2'"
                  [style.color]="p === searchMeta.page ? '#fff' : '#374151'">
            {{ p }}
          </button>
        </div>
      </section>

      <!-- ── Featured Projects (khi chưa search) ── -->
      <ng-container *ngIf="!hasSearched">
        <section class="max-w-7xl mx-auto w-full px-6" style="padding-top:80px;padding-bottom:80px;">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:52px;">
            <div>
              <p style="font-size:0.7rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9CA3AF;margin-bottom:10px;">{{ 'HOMEX.FEATURED_SUB' | translate }}</p>
              <h2 class="section-title" style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;color:#0D0D0D;">{{ 'HOME.FEATURED_PROJECTS' | translate }}</h2>
            </div>
            <button type="button" (click)="scrollToSearch()" class="hidden sm:flex" style="align-items:center;gap:6px;font-size:0.875rem;font-weight:700;color:#0D0D0D;background:none;border:none;cursor:pointer;letter-spacing:-0.01em;">
              {{ 'HOME.VIEW_ALL' | translate }}
              <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
          </div>

          <div *ngIf="isLoading" style="display:flex;justify-content:center;padding:64px 0;">
            <div style="width:28px;height:28px;border:3px solid #E5E4E0;border-top-color:#0D0D0D;border-radius:50%;animation:spin 0.7s linear infinite;"></div>
          </div>

          <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let project of projects" class="group proj-card">
              <div style="padding:28px 28px 20px;flex:1;">
                <span style="display:inline-block;background:#F0EFE9;color:#777;font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:5px 10px;border-radius:7px;margin-bottom:18px;">
                  {{ project.theme_id }}
                </span>
                <h3 class="section-title" style="font-size:1.2rem;font-weight:800;color:#0D0D0D;margin-bottom:10px;transition:color 0.2s;" [class.group-hover:text-gray-500]="true">{{ project.name }}</h3>
                <p style="color:#6B7280;font-size:0.875rem;line-height:1.65;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">{{ project.description || ('HOMEX.PROJECT_DEFAULT_DESC' | translate) }}</p>
              </div>
              <div style="padding:0 28px 28px;border-top:1px solid #F0EFE9;margin-top:auto;padding-top:20px;">
                <a [routerLink]="['/project', project.slug || project.id]" class="brand-btn">
                  {{ 'HOME.EXPLORE_PROJECT' | translate }} →
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA — dark editorial -->
        <section style="background:#0D0D0D;padding:96px 24px;text-align:center;">
          <div style="max-width:580px;margin:0 auto;">
            <p style="font-size:0.7rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#444;margin-bottom:18px;">Bất Động Sản Điểm Tâm</p>
            <h2 class="hero-title" style="font-size:clamp(1.9rem,5vw,3.2rem);font-weight:900;color:#F7F6F3;margin-bottom:18px;">{{ 'HOMEX.CTA_TITLE' | translate }}</h2>
            <p style="color:#666;font-size:1rem;line-height:1.75;margin-bottom:36px;">{{ 'HOMEX.CTA_SUB' | translate }}</p>
            <button (click)="scrollToSearch()" style="display:inline-block;padding:14px 36px;background:#F7F6F3;color:#0D0D0D;font-weight:700;font-size:0.925rem;border-radius:12px;border:none;cursor:pointer;transition:background 0.2s;letter-spacing:-0.01em;">
              {{ 'HOMEX.CTA_BTN' | translate }} →
            </button>
          </div>
        </section>
      </ng-container>

      <app-guest-footer></app-guest-footer>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private seoService = inject(SeoService);
  private favoriteService = inject(FavoriteService);
  private destroyRef = inject(DestroyRef);

  banners: any[] = [];
  currentSlide = 0;
  private sliderTimer: any;

  projects: any[] = [];
  searchedProperties: any[] = [];
  suggestions: any[] = [];
  showSuggestions = false;
  hasSearched = false;
  isLoading = true;
  isSearching = false;

  searchMeta = { total: 0, page: 1, totalPages: 1, limit: 12 };
  get paginationPages() {
    return Array.from({ length: Math.min(this.searchMeta.totalPages, 7) }, (_, i) => i + 1);
  }

  private suggestSubject = new Subject<string>();

  searchForm: FormGroup = this.fb.group({
    search: [''], min_price: [''], max_price: [''],
    bedrooms: [''], property_type: [''], min_area: [''], max_area: [''],
    sort: ['newest']
  });

  ngOnInit() {
    this.seoService.setMeta({
      title: 'Trang chủ | Điểm Tâm BĐS',
      desc: 'Nền tảng Bất động sản công nghệ cao, kết nối người mua và người bán thông minh, minh bạch.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    });

    this.api.get<any>('/banners').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.banners = res.data || [];
        if (this.banners.length > 1) this.startSlider();
        this.cdr.markForCheck();
      },
      error: () => {}
    });

    this.api.get<any>('/projects').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.projects = res.data || []; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });

    this.suggestSubject.pipe(
      debounceTime(280),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => this.fetchSuggestions(term));
  }

  onSearchInput() {
    const term = this.searchForm.value.search?.trim();
    if (term && term.length >= 2) {
      this.suggestSubject.next(term);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  private fetchSuggestions(term: string) {
    this.api.get<any>('/properties/suggestions', { q: term, limit: 6 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.suggestions = res.data || [];
          this.showSuggestions = this.suggestions.length > 0;
          this.cdr.markForCheck();
        }
      });
  }

  hideSuggestionsDelay() {
    setTimeout(() => { this.showSuggestions = false; this.cdr.markForCheck(); }, 200);
  }

  clearSearchInput() {
    this.searchForm.patchValue({ search: '' });
    this.suggestions = [];
    this.showSuggestions = false;
  }

  onSearch(page = 1) {
    const { search, min_price, max_price, bedrooms, property_type, min_area, max_area, sort } = this.searchForm.value;
    const params: Record<string, any> = { page, limit: this.searchMeta.limit, sort: sort || 'newest' };
    if (search)        params['search'] = search;
    if (min_price)     params['min_price'] = min_price;
    if (max_price)     params['max_price'] = max_price;
    if (bedrooms)      params['bedrooms'] = bedrooms;
    if (property_type) params['property_type'] = property_type;
    if (min_area)      params['min_area'] = min_area;
    if (max_area)      params['max_area'] = max_area;

    this.isSearching = true;
    this.hasSearched = true;
    this.showSuggestions = false;
    this.cdr.markForCheck();

    this.api.get<any>('/properties', params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.searchedProperties = res.data || [];
        this.searchMeta = { ...this.searchMeta, ...res.meta };
        this.isSearching = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isSearching = false; this.cdr.markForCheck(); }
    });
  }

  goToPage(page: number) { this.onSearch(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  clearSearch() {
    this.searchForm.reset({ sort: 'newest' });
    this.searchedProperties = [];
    this.hasSearched = false;
    this.suggestions = [];
    this.cdr.markForCheck();
  }

  scrollToSearch() { document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' }); }

  getSuggestThumb(prop: any): string | null {
    const thumb = prop.property_media?.find((m: any) => m.is_thumbnail);
    return thumb?.media_url ?? prop.property_media?.[0]?.media_url ?? null;
  }

  getPropThumbnail(prop: any): string {
    const thumb = prop.property_media?.find((m: any) => m.is_thumbnail);
    return thumb?.media_url ?? prop.property_media?.[0]?.media_url
      ?? 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
  }

  isFav(propertyId: string): boolean { return this.favoriteService.isFavorite(propertyId); }

  toggleFav(event: Event, propertyId: string) {
    event.preventDefault(); event.stopPropagation();
    this.favoriteService.toggleFavorite(propertyId);
    this.cdr.markForCheck();
  }

  private startSlider() {
    this.sliderTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.banners.length;
      this.scrollToSlide(this.currentSlide);
      this.cdr.markForCheck();
    }, 5000);
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.scrollToSlide(index);
    clearInterval(this.sliderTimer);
    if (this.banners.length > 1) this.startSlider();
  }

  private scrollToSlide(index: number) {
    const el = document.getElementById('heroSlider');
    if (el) el.scrollLeft = el.offsetWidth * index;
  }

  ngOnDestroy() {
    clearInterval(this.sliderTimer);
  }
}
