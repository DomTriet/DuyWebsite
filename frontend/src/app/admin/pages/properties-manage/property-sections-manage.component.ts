import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { UploadService } from '../../../core/services/upload.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-property-sections-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .field-label { display: block; font-size: 0.78rem; font-weight: 500; color: #374151; margin-bottom: 5px; }
    .field-input {
      width: 100%; padding: 8px 12px;
      border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 0.85rem; outline: none; transition: border-color .15s;
    }
    .field-input:focus { border-color: #111; }
    .upload-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;
      background: #f9fafb; cursor: pointer; font-size: 0.82rem; color: #374151;
      white-space: nowrap; transition: background .15s, border-color .15s;
    }
    .upload-btn:hover { background: #f3f4f6; border-color: #9ca3af; }
  `],
  template: `
<!-- ── INLINE mode ───────────────────────────────────────────────────────── -->
<div *ngIf="inline" class="space-y-6">
  <ng-container *ngTemplateOutlet="formBlock"></ng-container>
  <ng-container *ngTemplateOutlet="listBlock"></ng-container>
</div>

<!-- ── MODAL mode ────────────────────────────────────────────────────────── -->
<div *ngIf="!inline"
     class="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
     (click)="close.emit()">
  <div class="bg-gray-50 rounded-xl shadow-xl w-full max-w-3xl my-8" (click)="$event.stopPropagation()">
    <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
      <div>
        <h3 class="text-lg font-bold text-gray-800">Nội dung chi tiết BĐS</h3>
        <p class="text-sm text-gray-500 truncate max-w-xs">{{ propertyTitle }}</p>
      </div>
      <button (click)="close.emit()" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
    </div>
    <div class="p-6 space-y-6">
      <ng-container *ngTemplateOutlet="formBlock"></ng-container>
      <ng-container *ngTemplateOutlet="listBlock"></ng-container>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════
     SHARED TEMPLATES
══════════════════════════════════════════════════════════ -->

<!-- Form: thêm / sửa một section -->
<ng-template #formBlock>
  <div [class]="inline
    ? 'bg-white rounded-xl border border-gray-200 p-5'
    : 'bg-white rounded-lg border border-gray-200 p-5'">
    <h4 class="font-semibold text-gray-800 mb-4 text-sm">
      {{ editingId ? 'Chỉnh sửa section' : 'Thêm section mới' }}
    </h4>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
      <div>
        <label class="field-label">Loại section</label>
        <select [(ngModel)]="form.section_type" class="field-input bg-white">
          <option *ngFor="let t of sectionTypes" [value]="t.value">{{ t.label }}</option>
        </select>
      </div>
      <div>
        <label class="field-label">Thứ tự hiển thị</label>
        <input [(ngModel)]="form.sort_order" type="number" class="field-input">
      </div>
    </div>

    <div class="mb-3">
      <label class="field-label">Tiêu đề <span class="text-red-500">*</span></label>
      <input [(ngModel)]="form.title" placeholder="VD: Điểm nổi bật của căn hộ" class="field-input">
    </div>

    <div class="mb-3">
      <label class="field-label">Nội dung mô tả</label>
      <textarea [(ngModel)]="form.content" rows="3" placeholder="Mô tả chi tiết..." class="field-input"></textarea>
    </div>

    <!-- Ảnh minh họa với upload trực tiếp -->
    <div class="mb-3">
      <label class="field-label">Ảnh minh họa</label>
      <div class="flex gap-2">
        <input [(ngModel)]="form.image_url" placeholder="https://... hoặc upload từ máy tính"
               class="field-input flex-1">
        <label class="upload-btn shrink-0">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          <span>Upload ảnh</span>
          <input type="file" class="hidden" accept="image/*"
                 (change)="onImageUpload($event)" [disabled]="isUploadingImage">
        </label>
      </div>
      <div *ngIf="isUploadingImage" class="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
        <svg class="animate-spin w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Đang tải ảnh lên...
      </div>
      <img *ngIf="form.image_url && !isUploadingImage" [src]="form.image_url"
           class="mt-2 rounded-lg h-28 w-full object-cover border border-gray-200" alt="Preview">
    </div>

    <!-- Metadata by section type -->
    <div *ngIf="form.section_type !== 'custom'"
         class="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-3">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Chi tiết: {{ typeLabel(form.section_type) }}
      </p>

      <div *ngIf="form.section_type === 'highlights'">
        <label class="field-label">Danh sách điểm nổi bật (mỗi dòng 1 mục)</label>
        <textarea [(ngModel)]="itemsText" rows="5"
                  placeholder="View hồ thoáng mát&#10;Nội thất cao cấp nhập khẩu&#10;Ban công rộng 8m²"
                  class="field-input"></textarea>
      </div>

      <div *ngIf="form.section_type === 'floor_plan'" class="space-y-2">
        <input [(ngModel)]="meta.area"   placeholder="Diện tích (m²)" class="field-input">
        <input [(ngModel)]="meta.floors" placeholder="Số tầng"         class="field-input">
        <p class="text-xs text-gray-400">Ảnh mặt bằng: dùng trường Ảnh minh họa ở trên.</p>
      </div>

      <div *ngIf="form.section_type === 'location'" class="space-y-2">
        <input [(ngModel)]="meta.address"       placeholder="Địa chỉ đầy đủ"                    class="field-input">
        <input [(ngModel)]="meta.map_embed_url" placeholder="Link nhúng Google Maps (embed URL)" class="field-input">
        <div class="grid grid-cols-2 gap-2">
          <input [(ngModel)]="meta.latitude"  placeholder="Vĩ độ"   class="field-input">
          <input [(ngModel)]="meta.longitude" placeholder="Kinh độ"  class="field-input">
        </div>
      </div>

      <div *ngIf="form.section_type === 'legal' || form.section_type === 'payment'">
        <label class="field-label">Danh sách mục (mỗi dòng 1 mục)</label>
        <textarea [(ngModel)]="itemsText" rows="5"
                  placeholder="Sổ hồng riêng&#10;Pháp lý đầy đủ&#10;Không tranh chấp"
                  class="field-input"></textarea>
      </div>

      <div *ngIf="form.section_type === 'virtual_tour'" class="space-y-2">
        <label class="field-label">Link nhúng Tour 360° / YouTube embed</label>
        <input [(ngModel)]="meta.embed_url" placeholder="https://www.youtube.com/embed/..."
               class="field-input">
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs text-gray-400">hoặc</span>
          <label class="upload-btn">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Upload video từ máy tính
            <input type="file" class="hidden" accept="video/*"
                   (change)="onVideoUpload($event)" [disabled]="isUploadingVideo">
          </label>
          <span *ngIf="isUploadingVideo" class="text-xs text-gray-500 animate-pulse">Đang upload...</span>
        </div>
      </div>
    </div>

    <div class="flex gap-2">
      <button (click)="saveSection()" [disabled]="!form.title.trim() || isSaving"
              class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
        {{ editingId ? 'Lưu thay đổi' : 'Thêm section' }}
      </button>
      <button *ngIf="editingId" (click)="resetForm()"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
        Hủy
      </button>
    </div>
  </div>
</ng-template>

<!-- List: sections hiện có -->
<ng-template #listBlock>
  <div>
    <h4 class="font-semibold text-gray-800 mb-3 text-sm">Các section ({{ sections.length }})</h4>
    <div *ngIf="sections.length === 0"
         class="text-sm text-gray-400 italic text-center py-8 bg-white rounded-lg border border-dashed border-gray-200">
      Chưa có section nào. Hãy thêm ở trên.
    </div>
    <ul class="space-y-2">
      <li *ngFor="let s of sections"
          class="bg-white rounded-lg border border-gray-200 p-3 flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              {{ typeLabel(s.section_type) }}
            </span>
            <span class="text-xs text-gray-400">#{{ s.sort_order }}</span>
          </div>
          <p class="font-medium text-gray-800 text-sm truncate">{{ s.title }}</p>
          <p *ngIf="s.content" class="text-xs text-gray-400 truncate mt-0.5">{{ s.content }}</p>
          <img *ngIf="s.image_url" [src]="s.image_url"
               class="mt-1.5 h-12 w-20 object-cover rounded border border-gray-100" alt="">
        </div>
        <div class="flex gap-1 shrink-0">
          <button (click)="editSection(s)"
                  class="px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100 border border-gray-200 transition-colors">
            Sửa
          </button>
          <button (click)="deleteSection(s.id)"
                  class="px-2.5 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 border border-red-100 transition-colors">
            Xóa
          </button>
        </div>
      </li>
    </ul>
  </div>
</ng-template>
  `
})
export class PropertySectionsManageComponent implements OnInit {
  @Input() propertyId!: string;
  @Input() propertyTitle = '';
  @Input() inline = false;
  @Output() close = new EventEmitter<void>();

  private api     = inject(ApiService);
  private upload  = inject(UploadService);
  private cdr     = inject(ChangeDetectorRef);
  private toast   = inject(ToastService);
  private confirm = inject(ConfirmService);

  sectionTypes = [
    { value: 'highlights',   label: 'Điểm nổi bật' },
    { value: 'floor_plan',   label: 'Mặt bằng' },
    { value: 'location',     label: 'Vị trí' },
    { value: 'legal',        label: 'Pháp lý' },
    { value: 'payment',      label: 'Thanh toán' },
    { value: 'virtual_tour', label: 'Tour 360°' },
    { value: 'custom',       label: 'Tùy chỉnh' },
  ];

  sections: any[] = [];
  editingId: string | null = null;
  isSaving         = false;
  isUploadingImage = false;
  isUploadingVideo = false;

  form: any  = this.emptyForm();
  meta: any  = {};
  itemsText  = '';

  ngOnInit(): void { this.loadSections(); }

  typeLabel(type: string): string {
    return this.sectionTypes.find(t => t.value === type)?.label || type;
  }

  loadSections(): void {
    this.api.get<any>(`/properties/${this.propertyId}/sections`).subscribe({
      next: (res: any) => { this.sections = res.data || []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  onImageUpload(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;
    this.isUploadingImage = true;
    this.cdr.detectChanges();

    this.upload.uploadFile(file).subscribe({
      next: (res) => {
        const url = res?.data?.url || res?.data?.secure_url;
        if (url) this.form.image_url = url;
        this.isUploadingImage = false;
        event.target.value    = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Lỗi upload ảnh. Vui lòng thử lại.');
        this.isUploadingImage = false;
        this.cdr.detectChanges();
      }
    });
  }

  onVideoUpload(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;
    this.isUploadingVideo = true;
    this.cdr.detectChanges();

    this.upload.uploadFile(file).subscribe({
      next: (res) => {
        const url = res?.data?.url || res?.data?.secure_url;
        if (url) this.meta.embed_url = url;
        this.isUploadingVideo = false;
        event.target.value    = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Lỗi upload video. Vui lòng thử lại.');
        this.isUploadingVideo = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildMetadata(): any {
    const t = this.form.section_type;
    if (t === 'highlights' || t === 'legal' || t === 'payment') {
      return { items: this.itemsText.split('\n').map((s: string) => s.trim()).filter(Boolean) };
    }
    if (t === 'floor_plan')   return { area: this.meta.area, floors: this.meta.floors };
    if (t === 'location')     return { address: this.meta.address, map_embed_url: this.meta.map_embed_url, latitude: this.meta.latitude, longitude: this.meta.longitude };
    if (t === 'virtual_tour') return { embed_url: this.meta.embed_url };
    return {};
  }

  saveSection(): void {
    if (!this.form.title.trim()) return;
    this.isSaving = true;
    const payload = { ...this.form, metadata: this.buildMetadata() };

    const req = this.editingId
      ? this.api.put<any>(`/properties/${this.propertyId}/sections/${this.editingId}`, payload)
      : this.api.post<any>(`/properties/${this.propertyId}/sections`, payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Đã cập nhật section' : 'Đã thêm section mới');
        this.resetForm();
        this.loadSections();
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: () => { this.toast.error('Có lỗi xảy ra'); this.isSaving = false; }
    });
  }

  editSection(s: any): void {
    this.editingId = s.id;
    this.form = { section_type: s.section_type, title: s.title, content: s.content || '', image_url: s.image_url || '', sort_order: s.sort_order };
    const md = s.metadata || {};
    this.meta = { ...md };
    const t = s.section_type;
    this.itemsText = (t === 'highlights' || t === 'legal' || t === 'payment') ? (md.items || []).join('\n') : '';
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.editingId = null;
    this.form      = this.emptyForm();
    this.meta      = {};
    this.itemsText = '';
  }

  async deleteSection(id: string): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Xóa section', message: 'Bạn có chắc muốn xóa section này?', confirmText: 'Xóa' });
    if (!ok) return;
    this.api.delete<any>(`/properties/${this.propertyId}/sections/${id}`).subscribe({
      next: () => { this.toast.success('Đã xóa section'); this.loadSections(); this.cdr.detectChanges(); },
      error: () => this.toast.error('Không thể xóa')
    });
  }

  private emptyForm(): any {
    return { section_type: 'highlights', title: '', content: '', image_url: '', sort_order: 0 };
  }
}
