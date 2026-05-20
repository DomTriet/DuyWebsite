import { Component, OnInit, inject, ViewContainerRef, ViewChild, Type, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeStateService } from '../core/services/theme-state.service';

@Component({
  selector: 'app-theme-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container #themeContainer></ng-container>
    
    <div *ngIf="isLoading" class="min-h-screen bg-white flex flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-gray-600 text-sm">Đang tải...</p>
      </div>
    </div>
  `
})
export class ThemeContainerComponent implements OnInit {
  @ViewChild('themeContainer', { read: ViewContainerRef, static: true }) themeContainer!: ViewContainerRef;
  
  private route = inject(ActivatedRoute);
  private themeStateService = inject(ThemeStateService);
  private cdr = inject(ChangeDetectorRef);
  isLoading = true;

  ngOnInit() {
    // Lấy toàn bộ Object Project từ ThemeResolver đã cấu hình ở file routing
    this.route.data.subscribe(data => {
      const projectData = data['theme'] || { theme_id: 'minimalist' };
      const themeId = projectData.theme_id || 'minimalist';
      
      // Cập nhật State Service để chia sẻ dữ liệu toàn cục
      this.themeStateService.setProjectState(projectData.id || null, themeId);
      
      this.loadThemeComponent(themeId, projectData);
    });
  }

  async loadThemeComponent(themeId: string, projectData: any) {
    this.isLoading = true;
    this.themeContainer.clear(); // Xóa giao diện cũ nếu có

    try {
      // DYNAMIC COMPONENT LOADER: Tải lười (Lazy Load) file JS dựa trên tên theme
      let componentType: Type<any>;
      if (themeId === 'luxury') {
        componentType = (await import('./luxury/luxury.component')).LuxuryComponent;
      } else if (themeId === 'eco-green') {
        componentType = (await import('./eco-green/eco-green.component')).EcoGreenComponent;
      } else {
        componentType = (await import('./minimalist/minimalist.component')).MinimalistComponent;
      }
      
      const componentRef = this.themeContainer.createComponent(componentType);
      // Data Passing: Truyền dữ liệu Project xuống component Theme con
      componentRef.setInput('project', projectData);
    } catch (error) {
      console.error('Lỗi khi nạp theme, chuyển về Minimalist...', error);
      const fallback = (await import('./minimalist/minimalist.component')).MinimalistComponent;
      const componentRef = this.themeContainer.createComponent(fallback);
      componentRef.setInput('project', projectData);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Ép Angular render ngay lập tức sau khi load xong component
    }
  }
}
