import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

/**
 * Quản lý dịch thuật — gom nhóm theo từng entity.
 * Hiển thị bản gốc tiếng Việt trước, sau đó lần lượt Tiếng Anh → Tiếng Trung → Tiếng Hàn.
 */
@Component({
  selector: 'app-translations-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">Quản lý dịch thuật</h1>
        <p class="text-gray-600 mt-2">Mỗi mục gồm bản gốc tiếng Việt và các bản dịch Anh · Trung · Hàn. Sửa lại nếu máy dịch chưa chuẩn rồi phê duyệt.</p>
      </div>

      <div *ngIf="isLoading" class="text-center py-12 text-gray-500">Đang tải...</div>
      <div *ngIf="!isLoading && groups.length === 0" class="bg-white rounded-2xl p-12 text-center text-gray-600 border border-gray-200">
        Không có bản dịch nào chờ duyệt 🎉
      </div>

      <div class="space-y-8">
        <div *ngFor="let g of groups" class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

          <!-- Group header -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span class="font-black text-gray-900 uppercase tracking-wider text-sm">{{ entityLabel(g.entity_type) }}</span>
              <span class="text-xs text-gray-400 ml-3 font-mono">{{ g.entity_id }}</span>
            </div>
            <button (click)="approveGroup(g)" [disabled]="g._saving"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50">
              {{ g._saving ? 'Đang lưu...' : '✓ Lưu & duyệt cả nhóm' }}
            </button>
          </div>

          <div class="p-6 space-y-4">

            <!-- Bản gốc Tiếng Việt -->
            <div class="rounded-xl border-2 border-gray-300 bg-gray-50 overflow-hidden">
              <div class="px-4 py-2.5 bg-gray-200/70 flex items-center gap-2">
                <span class="text-base">🇻🇳</span>
                <span class="font-bold text-gray-800 text-sm">Tiếng Việt</span>
                <span class="text-xs text-gray-500">(bản gốc)</span>
              </div>
              <div class="p-4 space-y-3">
                <div *ngFor="let f of stringFields(g.source)">
                  <label class="block text-[0.65rem] font-bold text-gray-500 mb-1 uppercase tracking-wider">{{ fieldLabel(f) }}</label>
                  <div class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{{ g.source?.[f] || '—' }}</div>
                </div>
                <div *ngIf="hasBlocks(g.source)">
                  <label class="block text-[0.65rem] font-bold text-gray-500 mb-1 uppercase tracking-wider">Nội dung</label>
                  <div *ngFor="let b of textBlocks(g.source)" class="w-full px-3 py-2 mb-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{{ b.value || '—' }}</div>
                </div>
                <div *ngIf="!g.source" class="text-xs text-gray-400 italic">Không lấy được bản gốc (entity có thể đã bị xóa).</div>
              </div>
            </div>

            <!-- Các bản dịch: Anh → Trung → Hàn -->
            <div *ngFor="let t of g.langs" class="rounded-xl border overflow-hidden"
                 [class.border-amber-300]="!t.is_approved" [class.border-emerald-200]="t.is_approved">
              <div class="px-4 py-2.5 flex items-center justify-between gap-2"
                   [class.bg-amber-50]="!t.is_approved" [class.bg-emerald-50]="t.is_approved">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ flag(t.lang_code) }}</span>
                  <span class="font-bold text-gray-800 text-sm">{{ langLabel(t.lang_code) }}</span>
                  <span class="px-2 py-0.5 rounded-full text-[0.65rem] font-bold"
                        [class.bg-amber-200]="!t.is_approved" [class.text-amber-800]="!t.is_approved"
                        [class.bg-emerald-200]="t.is_approved" [class.text-emerald-800]="t.is_approved">
                    {{ t.is_approved ? 'Đã duyệt' : 'Chờ duyệt' }}
                  </span>
                </div>
                <button (click)="saveLang(g, t)" [disabled]="t._saving"
                        class="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                  {{ t._saving ? '...' : 'Lưu & Phê duyệt' }}
                </button>
              </div>
              <div class="p-4 space-y-3">
                <div *ngFor="let f of stringFields(t.translation_data)">
                  <label class="block text-[0.65rem] font-bold text-gray-500 mb-1 uppercase tracking-wider">{{ fieldLabel(f) }}</label>
                  <textarea [(ngModel)]="t.translation_data[f]" rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"></textarea>
                </div>
                <div *ngIf="hasBlocks(t.translation_data)">
                  <label class="block text-[0.65rem] font-bold text-gray-500 mb-1 uppercase tracking-wider">Nội dung</label>
                  <textarea *ngFor="let b of textBlocks(t.translation_data)" [(ngModel)]="b.value" rows="2"
                            class="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class TranslationsManageComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  groups: any[] = [];
  isLoading = true;

  private ENTITY_LABELS: Record<string, string> = {
    property: 'Bất động sản', project: 'Dự án', blog: 'Bài viết', project_section: 'Mục nội dung dự án'
  };
  private LANG_LABELS: Record<string, string> = { en: 'Tiếng Anh', zh: 'Tiếng Trung', ko: 'Tiếng Hàn' };
  private FLAGS: Record<string, string> = { en: '🇬🇧', zh: '🇨🇳', ko: '🇰🇷' };
  private FIELD_LABELS: Record<string, string> = { title: 'Tiêu đề', description: 'Mô tả', name: 'Tên' };

  ngOnInit() { this.loadPending(); }

  loadPending() {
    this.isLoading = true;
    this.api.get<any>('/translations/pending').subscribe({
      next: (res: any) => {
        this.groups = res.data || [];
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

  entityLabel(type: string): string { return this.ENTITY_LABELS[type] || type; }
  langLabel(code: string): string { return this.LANG_LABELS[code] || code.toUpperCase(); }
  flag(code: string): string { return this.FLAGS[code] || '🏳️'; }
  fieldLabel(key: string): string { return this.FIELD_LABELS[key] || key; }

  /** Các field dạng chuỗi (bỏ qua content_blocks) */
  stringFields(data: any): string[] {
    if (!data) return [];
    return Object.keys(data).filter(k => k !== 'content_blocks' && typeof data[k] !== 'object');
  }
  hasBlocks(data: any): boolean { return !!data && Array.isArray(data.content_blocks); }
  textBlocks(data: any): any[] {
    if (!this.hasBlocks(data)) return [];
    return data.content_blocks.filter((b: any) => b.type === 'text' || b.type === 'heading');
  }

  /** Lưu + duyệt 1 ngôn ngữ */
  saveLang(group: any, t: any) {
    t._saving = true;
    this.api.put<any>(`/translations/${t.id}`, { translation_data: t.translation_data }).subscribe({
      next: () => { t._saving = false; t.is_approved = true; this.toast.success('Đã lưu & duyệt bản dịch.'); this.cdr.detectChanges(); this.cleanupGroup(group); },
      error: (err) => { t._saving = false; this.toast.error('Lỗi lưu bản dịch: ' + (err.error?.error || 'Unknown')); this.cdr.detectChanges(); }
    });
  }

  /** Lưu + duyệt toàn bộ ngôn ngữ trong nhóm */
  approveGroup(group: any) {
    group._saving = true;
    const calls = group.langs.map((t: any) =>
      this.api.put<any>(`/translations/${t.id}`, { translation_data: t.translation_data })
    );
    forkJoin(calls).subscribe({
      next: () => { group._saving = false; group.langs.forEach((t: any) => t.is_approved = true); this.toast.success('Đã lưu & duyệt cả nhóm.'); this.cleanupGroup(group); this.cdr.detectChanges(); },
      error: (err) => { group._saving = false; this.toast.error('Lỗi duyệt nhóm: ' + (err.error?.error || 'Unknown')); this.cdr.detectChanges(); }
    });
  }

  /** Khi mọi ngôn ngữ trong nhóm đã duyệt → gỡ nhóm khỏi danh sách */
  private cleanupGroup(group: any) {
    if (group.langs.every((t: any) => t.is_approved)) {
      this.groups = this.groups.filter(g => g !== group);
      this.cdr.detectChanges();
    }
  }
}
