import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { UploadService } from '../../core/services/upload.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

interface Banner {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

@Component({
  selector: 'app-homepage-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .btn-primary { background:#0D0D0D; color:#F7F6F3; padding:9px 18px; border-radius:10px; font-size:0.85rem; font-weight:700; border:none; cursor:pointer; transition:background 0.2s; }
    .btn-primary:hover { background:#1a1a1a; }
    .btn-secondary { background:#F5F4F2; color:#374151; padding:9px 18px; border-radius:10px; font-size:0.85rem; font-weight:600; border:none; cursor:pointer; transition:background 0.2s; }
    .btn-secondary:hover { background:#ebe9e4; }
    .btn-danger { background:#fee2e2; color:#dc2626; padding:7px 14px; border-radius:8px; font-size:0.82rem; font-weight:600; border:none; cursor:pointer; transition:background 0.2s; }
    .btn-danger:hover { background:#fecaca; }
    .field { width:100%; padding:10px 12px; border:1.5px solid #E5E4E0; border-radius:10px; font-size:0.875rem; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
    .field:focus { border-color:#0D0D0D; }
    .banner-card { background:#fff; border:1px solid #E5E4E0; border-radius:14px; overflow:hidden; }
    .drag-handle { cursor:grab; color:#9CA3AF; padding:8px; }
  `],
  template: `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
        <div>
          <h1 style="font-family:'Space Grotesk',system-ui,sans-serif;font-size:1.5rem;font-weight:800;color:#0D0D0D;letter-spacing:-0.02em;margin-bottom:4px;">Banner Trang Chủ</h1>
          <p style="font-size:0.875rem;color:#6B7280;">Quản lý hình ảnh và nội dung slider trang chủ.</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Thêm Banner</button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12 text-gray-400">Đang tải...</div>

      <!-- Empty -->
      <div *ngIf="!loading && banners.length === 0" style="background:#F9F8F6;border-radius:16px;padding:48px;text-align:center;">
        <p style="color:#9CA3AF;font-size:0.95rem;">Chưa có banner nào. Nhấn "+ Thêm Banner" để bắt đầu.</p>
      </div>

      <!-- Banner list -->
      <div *ngIf="!loading && banners.length > 0" class="space-y-3">
        <div *ngFor="let b of banners; let i = index" class="banner-card">
          <div style="display:flex;align-items:center;gap:16px;padding:16px;">
            <!-- Preview image -->
            <div style="width:100px;height:60px;border-radius:8px;overflow:hidden;flex-shrink:0;background:#F5F4F2;">
              <img *ngIf="b.image_url" [src]="b.image_url" style="width:100%;height:100%;object-fit:cover;" [alt]="b.title || 'Banner'">
            </div>
            <!-- Info -->
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.9rem;font-weight:600;color:#111;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ b.title || '(Không có tiêu đề)' }}</div>
              <div style="font-size:0.78rem;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ b.subtitle || b.cta_link }}</div>
            </div>
            <!-- Sort order controls -->
            <div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;">
              <button (click)="moveUp(i)" [disabled]="i === 0" style="background:none;border:none;cursor:pointer;color:#6B7280;padding:2px 4px;font-size:0.7rem;" title="Lên trên">▲</button>
              <button (click)="moveDown(i)" [disabled]="i === banners.length - 1" style="background:none;border:none;cursor:pointer;color:#6B7280;padding:2px 4px;font-size:0.7rem;" title="Xuống dưới">▼</button>
            </div>
            <!-- Toggle active -->
            <button
              (click)="toggleActive(b)"
              [style.background]="b.is_active ? '#0D0D0D' : '#E5E7EB'"
              style="position:relative;display:inline-flex;align-items:center;flex-shrink:0;width:44px;height:24px;border:none;border-radius:9999px;cursor:pointer;transition:background 0.2s;"
              [attr.aria-label]="b.is_active ? 'Tắt banner' : 'Bật banner'">
              <span
                [style.transform]="b.is_active ? 'translateX(22px)' : 'translateX(3px)'"
                style="display:inline-block;width:18px;height:18px;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:transform 0.2s;">
              </span>
            </button>
            <!-- Actions -->
            <button class="btn-secondary" (click)="openForm(b)" style="flex-shrink:0;padding:7px 14px;">Sửa</button>
            <button class="btn-danger" (click)="deleteBanner(b)" style="flex-shrink:0;">Xoá</button>
          </div>
        </div>
      </div>

      <!-- Modal Form -->
      <div *ngIf="showForm" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#fff;border-radius:20px;padding:32px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;">
          <h2 style="font-size:1.15rem;font-weight:800;color:#0D0D0D;margin-bottom:24px;">{{ editingBanner?.id ? 'Chỉnh sửa Banner' : 'Thêm Banner mới' }}</h2>

          <!-- Image upload -->
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Ảnh Banner *</label>
            <div style="border:2px dashed #E5E4E0;border-radius:12px;padding:24px;text-align:center;">
              <img *ngIf="editingBanner?.image_url" [src]="editingBanner!.image_url" style="max-height:140px;border-radius:8px;margin:0 auto 12px;display:block;object-fit:cover;" alt="">
              <label style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;background:#F5F4F2;color:#374151;padding:8px 16px;border-radius:8px;font-size:0.85rem;font-weight:600;">
                <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {{ uploadingImage ? 'Đang tải...' : 'Chọn ảnh' }}
                <input type="file" accept="image/*" (change)="onFileSelect($event)" style="display:none;" [disabled]="uploadingImage">
              </label>
            </div>
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Tiêu đề</label>
            <input class="field" [(ngModel)]="editingBanner!.title" placeholder="Ví dụ: Dự án River Park mở bán đợt 1">
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Mô tả ngắn</label>
            <input class="field" [(ngModel)]="editingBanner!.subtitle" placeholder="Ví dụ: Căn hộ cao cấp ven sông, view toàn thành phố">
          </div>

          <div class="grid grid-cols-2 gap-3" style="margin-bottom:14px;">
            <div>
              <label style="display:block;font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Nút CTA</label>
              <input class="field" [(ngModel)]="editingBanner!.cta_text" placeholder="Khám phá ngay">
            </div>
            <div>
              <label style="display:block;font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Link CTA</label>
              <input class="field" [(ngModel)]="editingBanner!.cta_link" placeholder="/project/ten-du-an">
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
            <input type="checkbox" id="bannerActive" [(ngModel)]="editingBanner!.is_active" style="width:16px;height:16px;">
            <label for="bannerActive" style="font-size:0.875rem;font-weight:600;color:#374151;cursor:pointer;">Hiển thị ngay (is_active)</label>
          </div>

          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn-secondary" (click)="closeForm()">Huỷ</button>
            <button class="btn-primary" (click)="saveBanner()" [disabled]="saving || !editingBanner?.image_url">
              {{ saving ? 'Đang lưu...' : (editingBanner?.id ? 'Cập nhật' : 'Thêm mới') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomepageBannersComponent implements OnInit {
  private api = inject(ApiService);
  private uploadService = inject(UploadService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);

  banners: Banner[] = [];
  loading = true;
  saving = false;
  uploadingImage = false;
  showForm = false;
  editingBanner: Banner | null = null;

  ngOnInit() { this.loadBanners(); }

  loadBanners() {
    this.loading = true;
    this.api.get<any>('/banners/all').subscribe({
      next: res => { this.banners = res.data || []; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  openForm(banner?: Banner) {
    this.editingBanner = banner
      ? { ...banner }
      : { title: '', subtitle: '', image_url: '', cta_text: 'Khám phá ngay', cta_link: '/', sort_order: this.banners.length, is_active: true };
    this.showForm = true;
  }

  closeForm() { this.showForm = false; this.editingBanner = null; }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingImage = true;
    this.uploadService.uploadFile(file).subscribe({
      next: res => {
        this.editingBanner!.image_url = res.url;
        this.uploadingImage = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploadingImage = false;
        this.toast.error('Lỗi khi tải ảnh lên.');
        this.cdr.markForCheck();
      }
    });
  }

  saveBanner() {
    if (!this.editingBanner?.image_url) return;
    this.saving = true;
    const isEdit = !!this.editingBanner.id;
    const obs = isEdit
      ? this.api.put<any>(`/banners/${this.editingBanner.id}`, this.editingBanner)
      : this.api.post<any>('/banners', this.editingBanner);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(isEdit ? 'Đã cập nhật banner.' : 'Đã thêm banner mới.');
        this.closeForm();
        this.loadBanners();
      },
      error: () => {
        this.saving = false;
        this.toast.error('Lỗi khi lưu banner.');
        this.cdr.markForCheck();
      }
    });
  }

  toggleActive(banner: Banner) {
    this.api.put<any>(`/banners/${banner.id}`, { is_active: !banner.is_active }).subscribe({
      next: () => { banner.is_active = !banner.is_active; this.cdr.markForCheck(); },
      error: () => this.toast.error('Lỗi khi cập nhật.')
    });
  }

  async deleteBanner(banner: Banner) {
    const ok = await this.confirm.ask({ message: 'Xoá banner này?' });
    if (!ok) return;
    this.api.delete<any>(`/banners/${banner.id}`).subscribe({
      next: () => { this.toast.success('Đã xoá banner.'); this.loadBanners(); },
      error: () => this.toast.error('Lỗi khi xoá.')
    });
  }

  moveUp(index: number) {
    if (index === 0) return;
    [this.banners[index - 1], this.banners[index]] = [this.banners[index], this.banners[index - 1]];
    this.updateSortOrders();
  }

  moveDown(index: number) {
    if (index === this.banners.length - 1) return;
    [this.banners[index], this.banners[index + 1]] = [this.banners[index + 1], this.banners[index]];
    this.updateSortOrders();
  }

  private updateSortOrders() {
    this.banners.forEach((b, i) => {
      b.sort_order = i;
      if (b.id) {
        this.api.put<any>(`/banners/${b.id}`, { sort_order: i }).subscribe();
      }
    });
    this.cdr.markForCheck();
  }
}
