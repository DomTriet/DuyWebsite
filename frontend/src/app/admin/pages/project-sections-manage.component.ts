import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

/**
 * Modal quản lý các Section nội dung của 1 dự án (Chủ đầu tư, Vị trí, Tiện ích, Pháp lý...).
 * Trường hiển thị trong form thay đổi theo section_type (trường cố định theo loại).
 */
@Component({
  selector: 'app-project-sections-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" (click)="close.emit()">
      <div class="bg-gray-50 rounded-xl shadow-xl w-full max-w-3xl my-8" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Nội dung dự án</h3>
            <p class="text-sm text-gray-500">{{ projectName }}</p>
          </div>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div class="p-6 space-y-6">

          <!-- Form thêm/sửa -->
          <div class="bg-white rounded-lg border border-gray-200 p-5">
            <h4 class="font-semibold text-gray-800 mb-4">{{ editingId ? 'Chỉnh sửa section' : 'Thêm section mới' }}</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Loại section</label>
                <select [(ngModel)]="form.section_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                  <option *ngFor="let t of sectionTypes" [value]="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Thứ tự hiển thị</label>
                <input [(ngModel)]="form.sort_order" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              </div>
            </div>

            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-600 mb-1">Tiêu đề <span class="text-red-500">*</span></label>
              <input [(ngModel)]="form.title" placeholder="VD: Chủ đầu tư uy tín" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            </div>

            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-600 mb-1">Nội dung mô tả</label>
              <textarea [(ngModel)]="form.content" rows="3" placeholder="Mô tả chi tiết..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
            </div>

            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-600 mb-1">Ảnh minh họa (URL)</label>
              <input [(ngModel)]="form.image_url" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            </div>

            <!-- Trường cố định theo loại -->
            <div class="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-3" *ngIf="form.section_type !== 'overview' && form.section_type !== 'custom'">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Thông tin {{ typeLabel(form.section_type) }}</p>

              <!-- developer -->
              <div *ngIf="form.section_type === 'developer'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input [(ngModel)]="meta.name" placeholder="Tên chủ đầu tư" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <input [(ngModel)]="meta.website" placeholder="Website" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <input [(ngModel)]="meta.logo_url" placeholder="Logo (URL)" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <input [(ngModel)]="meta.established_year" placeholder="Năm thành lập" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              </div>

              <!-- location -->
              <div *ngIf="form.section_type === 'location'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input [(ngModel)]="meta.address" placeholder="Địa chỉ" class="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <input [(ngModel)]="meta.map_embed_url" placeholder="Link nhúng Google Maps (embed)" class="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <input [(ngModel)]="meta.latitude" placeholder="Vĩ độ (latitude)" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <input [(ngModel)]="meta.longitude" placeholder="Kinh độ (longitude)" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              </div>

              <!-- amenities / legal / payment → danh sách item -->
              <div *ngIf="form.section_type === 'amenities' || form.section_type === 'legal' || form.section_type === 'payment'">
                <label class="block text-xs font-medium text-gray-600 mb-1">Danh sách (mỗi dòng 1 mục)</label>
                <textarea [(ngModel)]="itemsText" rows="4" placeholder="Hồ bơi&#10;Phòng gym&#10;Công viên" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
              </div>
            </div>

            <div class="flex gap-2">
              <button (click)="saveSection()" [disabled]="!form.title.trim() || isSaving"
                      class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                {{ editingId ? 'Lưu thay đổi' : 'Thêm section' }}
              </button>
              <button *ngIf="editingId" (click)="resetForm()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Hủy</button>
            </div>
          </div>

          <!-- Danh sách section hiện có -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Các section ({{ sections.length }})</h4>
            <div *ngIf="sections.length === 0" class="text-sm text-gray-400 italic text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
              Chưa có section nào. Hãy thêm ở trên.
            </div>
            <ul class="space-y-2">
              <li *ngFor="let s of sections" class="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-700 bg-gray-50 px-2 py-0.5 rounded">{{ typeLabel(s.section_type) }}</span>
                    <span class="text-xs text-gray-400">#{{ s.sort_order }}</span>
                  </div>
                  <p class="font-medium text-gray-800 truncate mt-0.5">{{ s.title }}</p>
                </div>
                <div class="flex gap-1 shrink-0">
                  <button (click)="editSection(s)" class="px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">Sửa</button>
                  <button (click)="deleteSection(s.id)" class="px-2.5 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100">Xóa</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectSectionsManageComponent implements OnInit {
  @Input() projectId!: string;
  @Input() projectName = '';
  @Output() close = new EventEmitter<void>();

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  sectionTypes = [
    { value: 'overview',  label: 'Tổng quan' },
    { value: 'developer', label: 'Chủ đầu tư' },
    { value: 'location',  label: 'Vị trí' },
    { value: 'amenities', label: 'Tiện ích' },
    { value: 'legal',     label: 'Pháp lý' },
    { value: 'payment',   label: 'Thanh toán' },
    { value: 'custom',    label: 'Tùy chỉnh' },
  ];

  sections: any[] = [];
  editingId: string | null = null;
  isSaving = false;

  form: any = { section_type: 'overview', title: '', content: '', image_url: '', sort_order: 0 };
  meta: any = {};
  itemsText = '';

  ngOnInit() { this.loadSections(); }

  typeLabel(type: string): string {
    return this.sectionTypes.find(t => t.value === type)?.label || type;
  }

  loadSections() {
    this.api.get<any>(`/projects/${this.projectId}/sections`).subscribe({
      next: (res: any) => { this.sections = res.data || []; this.cdr.detectChanges(); }
    });
  }

  private buildMetadata(): any {
    const t = this.form.section_type;
    if (t === 'developer') return { name: this.meta.name, website: this.meta.website, logo_url: this.meta.logo_url, established_year: this.meta.established_year };
    if (t === 'location')  return { address: this.meta.address, map_embed_url: this.meta.map_embed_url, latitude: this.meta.latitude, longitude: this.meta.longitude };
    if (t === 'amenities' || t === 'legal' || t === 'payment') {
      return { items: this.itemsText.split('\n').map(s => s.trim()).filter(Boolean) };
    }
    return {};
  }

  saveSection() {
    if (!this.form.title.trim()) return;
    this.isSaving = true;
    const payload = {
      section_type: this.form.section_type,
      title: this.form.title,
      content: this.form.content,
      image_url: this.form.image_url,
      sort_order: Number(this.form.sort_order) || 0,
      metadata: this.buildMetadata()
    };
    const req = this.editingId
      ? this.api.put<any>(`/projects/sections/${this.editingId}`, payload)
      : this.api.post<any>(`/projects/${this.projectId}/sections`, payload);

    req.subscribe({
      next: () => { this.isSaving = false; this.toast.success(this.editingId ? 'Đã cập nhật section.' : 'Đã thêm section.'); this.resetForm(); this.loadSections(); },
      error: (err: any) => { this.isSaving = false; this.toast.error(err.error?.error || 'Lỗi khi lưu section'); this.cdr.detectChanges(); }
    });
  }

  editSection(s: any) {
    this.editingId = s.id;
    this.form = { section_type: s.section_type, title: s.title, content: s.content || '', image_url: s.image_url || '', sort_order: s.sort_order || 0 };
    this.meta = { ...(s.metadata || {}) };
    this.itemsText = Array.isArray(s.metadata?.items) ? s.metadata.items.join('\n') : '';
    this.cdr.detectChanges();
  }

  async deleteSection(id: string) {
    if (!await this.confirm.ask({ title: 'Xóa section', message: 'Xóa section này?', confirmText: 'Xóa', danger: true })) return;
    this.api.delete<any>(`/projects/sections/${id}`).subscribe({
      next: () => { this.toast.success('Đã xóa section.'); this.loadSections(); },
      error: () => this.toast.error('Lỗi khi xóa section.')
    });
  }

  resetForm() {
    this.editingId = null;
    this.form = { section_type: 'overview', title: '', content: '', image_url: '', sort_order: 0 };
    this.meta = {};
    this.itemsText = '';
  }
}
