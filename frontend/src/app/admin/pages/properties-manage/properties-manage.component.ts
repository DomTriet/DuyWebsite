import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { PropertySectionsManageComponent } from './property-sections-manage.component';

@Component({
  selector: 'app-properties-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, PropertySectionsManageComponent],
  template: `
    <div class="max-w-7xl mx-auto mt-4">

      <!-- Tiêu đề & Nút thêm mới -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Danh sách Bất động sản</h2>
          <p class="text-gray-500 text-sm mt-1">Quản lý tất cả bất động sản trong hệ thống.</p>
        </div>
        <button (click)="openCreate()" class="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Thêm Bất động sản
        </button>
      </div>

      <!-- Bảng dữ liệu -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th class="px-6 py-4 font-semibold">Bất động sản</th>
                <th class="px-6 py-4 font-semibold">Dự án & Danh mục</th>
                <th class="px-6 py-4 font-semibold">Giá (VNĐ)</th>
                <th class="px-6 py-4 font-semibold">Trạng thái</th>
                <th class="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>

            <!-- Skeleton Loading -->
            <tbody *ngIf="isLoading" class="divide-y divide-gray-100">
              <tr *ngFor="let i of [1,2,3,4,5]" class="animate-pulse">
                <td class="px-6 py-4"><div class="h-10 bg-gray-200 rounded w-full"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-20"></div></td>
                <td class="px-6 py-4"><div class="h-6 bg-gray-200 rounded-full w-16"></div></td>
                <td class="px-6 py-4"><div class="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
              </tr>
            </tbody>

            <!-- Empty state -->
            <tbody *ngIf="!isLoading && properties.length === 0">
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  Chưa có bất động sản nào. Hãy thêm mới ngay!
                </td>
              </tr>
            </tbody>

            <!-- Dữ liệu thực -->
            <tbody *ngIf="!isLoading && properties.length > 0" class="divide-y divide-gray-100">
              <tr *ngFor="let prop of properties" class="hover:bg-gray-50 transition-colors">

                <!-- Hình ảnh & Tiêu đề -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      <img *ngIf="prop.property_media && prop.property_media.length > 0"
                           [src]="prop.property_media[0].media_url"
                           class="w-full h-full object-cover">
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-800 line-clamp-1" [title]="prop.title">{{ prop.title }}</p>
                      <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ prop.slug }}</p>
                    </div>
                  </div>
                </td>

                <!-- Dự án & Danh mục -->
                <td class="px-6 py-4">
                  <p class="text-sm text-gray-800 font-medium">{{ prop.projects?.name || 'Không thuộc dự án' }}</p>
                  <p class="text-xs text-gray-600 mt-0.5 font-semibold">{{ prop.categories?.name || '' }}</p>
                </td>

                <!-- Giá -->
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-gray-800">{{ prop.price | number:'1.0-0' }}</span>
                </td>

                <!-- Trạng thái -->
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-600 border border-emerald-200': prop.status === 'available',
                          'bg-yellow-50 text-yellow-600 border border-yellow-200': prop.status === 'pending',
                          'bg-red-50 text-red-600 border border-red-200': prop.status === 'sold',
                          'bg-gray-100 text-gray-600 border border-gray-200': prop.status !== 'available' && prop.status !== 'pending' && prop.status !== 'sold'
                        }">
                    {{ prop.status === 'available' ? 'Đang bán' : prop.status === 'pending' ? 'Chờ duyệt' : prop.status === 'sold' ? 'Đã bán' : prop.status }}
                  </span>
                </td>

                <!-- Thao tác -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="openSections(prop)"
                            class="px-2.5 py-1 text-xs font-medium rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                            title="Quản lý nội dung section">
                      Nội dung
                    </button>
                    <button (click)="openEdit(prop)"
                            class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                            title="Chỉnh sửa chi tiết">
                      Sửa
                    </button>
                    <button (click)="deleteProperty(prop.id)"
                            class="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                            title="Xóa">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Phân trang -->
        <div *ngIf="meta && meta.totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-sm text-gray-500">Trang {{ meta.page }} / {{ meta.totalPages }} — {{ meta.total }} bất động sản</p>
          <div class="flex gap-2">
            <button (click)="loadProperties(meta.page - 1)" [disabled]="meta.page <= 1"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
              ← Trước
            </button>
            <button (click)="loadProperties(meta.page + 1)" [disabled]="meta.page >= meta.totalPages"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Tiếp →
            </button>
          </div>
        </div>
      </div>

      <!-- Modal quản lý property sections (shortcut từ danh sách) -->
      <app-property-sections-manage
        *ngIf="sectionsModalOpen"
        [propertyId]="sectionsPropertyId!"
        [propertyTitle]="sectionsPropertyTitle"
        (close)="sectionsModalOpen = false">
      </app-property-sections-manage>
    </div>
  `
})
export class PropertiesManageComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private router = inject(Router);

  properties: any[] = [];
  meta: any = null;
  isLoading = true;

  sectionsModalOpen = false;
  sectionsPropertyId: string | null = null;
  sectionsPropertyTitle = '';

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties(page: number = 1) {
    this.isLoading = true;
    this.api.get<any>('/properties', { manage: true, page, limit: 10 }).subscribe({
      next: (res) => {
        this.properties = res.data || [];
        this.meta = res.meta;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải danh sách BĐS:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreate() {
    this.router.navigate(['/admin/properties/create']);
  }

  openEdit(prop: any) {
    this.router.navigate(['/admin/properties/edit', prop.slug]);
  }

  openSections(prop: any) {
    this.sectionsPropertyId = prop.id;
    this.sectionsPropertyTitle = prop.title;
    this.sectionsModalOpen = true;
  }

  async deleteProperty(id: string) {
    const ok = await this.confirm.ask({
      title: 'Xóa bất động sản',
      message: 'Bạn có chắc chắn muốn xóa Bất động sản này? (Đưa vào thùng rác)',
      confirmText: 'Xóa', danger: true
    });
    if (!ok) return;
    this.api.delete<any>(`/properties/${id}`).subscribe({
      next: () => {
        this.toast.success('Đã xóa Bất động sản thành công.');
        this.loadProperties(this.meta?.page || 1);
      },
      error: () => this.toast.error('Lỗi xóa Bất động sản. Vui lòng thử lại.')
    });
  }
}
