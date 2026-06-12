import { Component, OnInit, inject, ViewContainerRef, ViewChild, Type, ChangeDetectorRef, DestroyRef, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-theme-property-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container #themePropertyContainer></ng-container>
    <div *ngIf="isLoading" class="min-h-screen flex items-center justify-center bg-white">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  `
})
export class ThemePropertyContainerComponent implements OnInit {
  @ViewChild('themePropertyContainer', { read: ViewContainerRef, static: true })
  themePropertyContainer!: ViewContainerRef;

  private route      = inject(ActivatedRoute);
  private cdr        = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private api        = inject(ApiService);

  private isDestroyed = false;
  isLoading = true;

  ngOnInit() {
    this.destroyRef.onDestroy(() => { this.isDestroyed = true; });

    const projectData = this.route.snapshot.data['theme'] || { theme_id: 'minimalist' };
    // Theme theo dự án (custom → basePropertyTheme)
    let projectTheme = projectData.theme_id || 'minimalist';
    if (projectTheme === 'custom') {
      projectTheme = projectData.layout_config?.basePropertyTheme || 'minimalist';
    }

    const slug = this.route.snapshot.paramMap.get('slug');

    // SSR: skip — Angular sẽ hydrate ở browser
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    if (!slug) {
      this.loadThemeDetailComponent(projectTheme, null);
      return;
    }

    // Lấy BĐS trước để biết detail_theme riêng (nếu có)
    this.api.get<any>(`/properties/${slug}`).subscribe({
      next: res => {
        const property = res?.data ?? null;
        const themeId = property?.detail_theme || projectTheme;
        this.loadThemeDetailComponent(themeId, property);
      },
      error: () => {
        this.loadThemeDetailComponent(projectTheme, null);
      }
    });
  }

  async loadThemeDetailComponent(themeId: string, property: any) {
    if (this.isDestroyed) return;

    this.isLoading = true;
    this.themePropertyContainer.clear();

    try {
      let componentType: Type<any>;

      if (themeId === 'luxury') {
        componentType = (await import('./luxury/luxury-property-detail.component')).LuxuryPropertyDetailComponent;
      } else if (themeId === 'eco-green') {
        componentType = (await import('./eco-green/eco-green-property-detail.component')).EcoGreenPropertyDetailComponent;
      } else {
        componentType = (await import('./minimalist/minimalist-property-detail.component')).MinimalistPropertyDetailComponent;
      }

      if (this.isDestroyed) return;

      const ref = this.themePropertyContainer.createComponent(componentType);
      if (property) ref.setInput('property', property);
    } catch (error) {
      console.error('[ThemePropertyContainer] Lỗi nạp theme, dùng Minimalist fallback:', error);

      if (this.isDestroyed) return;

      const fallback = (await import('./minimalist/minimalist-property-detail.component')).MinimalistPropertyDetailComponent;

      if (this.isDestroyed) return;

      const ref = this.themePropertyContainer.createComponent(fallback);
      if (property) ref.setInput('property', property);
    } finally {
      if (!this.isDestroyed) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }
  }
}
