import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-translations-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">Quản lý dịch thuật</h1>
        <p class="text-gray-600 mt-2">Chỉnh sửa và phê duyệt bản dịch đa ngôn ngữ</p>
      </div>

      <div *ngIf="isLoading" class="text-center py-12 text-gray-500">Đang tải...</div>
      <div *ngIf="!isLoading && translations.length === 0" class="bg-white rounded-2xl p-12 text-center text-gray-600 border border-gray-200">
        Không có bản dịch chờ duyệt
      </div>

      <div class="space-y-6">
        <div *ngFor="let item of translations" class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all">
          <!-- Header -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <span class="font-black text-gray-900 uppercase tracking-wider text-sm">{{ item.entity_type }}</span>
              <span class="text-xs text-gray-500 ml-3">ID: {{ item.entity_id }}</span>
            </div>
            <span class="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs">{{ item.lang_code | uppercase }}</span>
          </div>

          <!-- Content -->
          <div class="p-8">
            <div *ngFor="let key of getKeys(item.translation_data)" class="mb-6">
              <label class="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">{{ key }}</label>
              <textarea [(ngModel)]="item.translation_data[key]" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end">
            <button (click)="saveAndApprove(item)" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all">
              Lưu & Phê duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TranslationsManageComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  translations: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.isLoading = true;
    this.api.get<any>('/translations/pending').subscribe({
      next: (res: any) => { 
        this.translations = res.data || (Array.isArray(res) ? res : []); 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => { 
        console.error('Lỗi tải translations:', err); 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  saveAndApprove(item: any) {
    // Cập nhật lại bản dịch
    this.api.put<any>(`/translations/${item.id}`, { translation_data: item.translation_data }).subscribe({
      next: () => {
        // Sau đó phê duyệt hiển thị
        this.api.put<any>(`/translations/${item.id}/approve`, {}).subscribe({
          next: () => {
            alert('Đã phê duyệt bản dịch thành công!');
            this.loadPending();
          },
          error: (err) => alert('Lỗi duyệt: ' + (err.error?.error || 'Unknown'))
        });
      },
      error: (err) => {
        alert('Lỗi lưu bản dịch: ' + (err.error?.error || 'Unknown'));
      }
    });
  }
}
