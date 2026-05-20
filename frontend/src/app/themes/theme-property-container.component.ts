import { Component, OnInit, inject, ViewContainerRef, ViewChild, Type, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  @ViewChild('themePropertyContainer', { read: ViewContainerRef, static: true }) themePropertyContainer!: ViewContainerRef;
  
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  isLoading = true;

  ngOnInit() {
    this.route.data.subscribe(data => {
      const projectData = data['theme'] || { theme_id: 'minimalist' };
      this.loadThemeDetailComponent(projectData.theme_id || 'minimalist');
    });
  }

  async loadThemeDetailComponent(themeId: string) {
    this.isLoading = true;
    this.themePropertyContainer.clear();

    try {
      let componentType: Type<any>;
      if (themeId === 'luxury') componentType = (await import('./luxury/luxury-property-detail.component')).LuxuryPropertyDetailComponent;
      else if (themeId === 'eco-green') componentType = (await import('./eco-green/eco-green-property-detail.component')).EcoGreenPropertyDetailComponent;
      else componentType = (await import('./minimalist/minimalist-property-detail.component')).MinimalistPropertyDetailComponent;
      
      this.themePropertyContainer.createComponent(componentType);
    } catch (error) {
      const fallback = (await import('./minimalist/minimalist-property-detail.component')).MinimalistPropertyDetailComponent;
      this.themePropertyContainer.createComponent(fallback);
    } finally { 
      this.isLoading = false; 
      this.cdr.detectChanges(); 
    }
  }
}