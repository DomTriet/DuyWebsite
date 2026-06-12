import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { UploadService } from '../../core/services/upload.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomThemeComponent } from '../../themes/custom/custom.component';
import { MinimalistComponent } from '../../themes/minimalist/minimalist.component';
import { LuxuryComponent } from '../../themes/luxury/luxury.component';
import { EcoGreenComponent } from '../../themes/eco-green/eco-green.component';
import {
  LayoutConfig, LayoutBlock, BlockType, FONT_OPTIONS, BLOCK_PALETTE,
  normalizeLayoutFor, defaultBlock, blockLabel
} from '../../themes/custom/custom-layout.model';

/**
 * Theme Builder — trình dựng giao diện Custom Theme với live preview.
 * Trái: bảng điều khiển (tokens, blocks kéo-thả, footer). Phải: xem trước trực tiếp.
 */
@Component({
  selector: 'app-theme-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomThemeComponent, MinimalistComponent, LuxuryComponent, EcoGreenComponent],
  styles: [`
    .tb-wrap { display:grid; grid-template-columns: 380px 1fr; height: calc(100vh - 0px); }
    @media (max-width: 1024px) { .tb-wrap { grid-template-columns: 1fr; height:auto; } }
    .tb-panel { border-right:1px solid #e5e7eb; background:#f9fafb; overflow-y:auto; height:100%; }
    .tb-preview { overflow:auto; background:#e5e7eb; height:100%; }
    .tb-sec { border-bottom:1px solid #e5e7eb; padding:16px; }
    .tb-h { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#6b7280; margin-bottom:12px; }
    .tb-lbl { font-size:0.72rem; font-weight:600; color:#374151; margin-bottom:4px; display:block; }
    .tb-in { width:100%; padding:7px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:0.82rem; }
    .tb-row { display:flex; align-items:center; gap:8px; }
    .tb-block { background:white; border:1px solid #e5e7eb; border-radius:8px; padding:10px 12px; margin-bottom:8px; cursor:grab; }
    .tb-block.sel { border-color:#4f46e5; box-shadow:0 0 0 2px rgba(79,70,229,0.15); }
    .tb-block.drag { opacity:0.4; }
    .tb-ico { width:28px; height:28px; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; }
    .tb-add { display:flex; align-items:center; gap:8px; width:100%; text-align:left; background:white; border:1px dashed #c7c9d1; border-radius:8px; padding:9px 12px; margin-bottom:6px; cursor:pointer; font-size:0.82rem; color:#374151; }
    .tb-add:hover { border-color:#4f46e5; color:#4f46e5; }
    .tb-color { width:38px; height:34px; border:1px solid #d1d5db; border-radius:6px; padding:2px; cursor:pointer; background:white; }
  `],
  template: `
    <div *ngIf="!loading" class="tb-wrap">

      <!-- ── Panel điều khiển ── -->
      <div class="tb-panel">
        <!-- Header -->
        <div class="tb-sec" style="position:sticky; top:0; background:#f9fafb; z-index:5;">
          <a routerLink="/admin/projects" style="font-size:0.75rem; color:#6b7280; text-decoration:none;">← Dự án</a>
          <div class="tb-row" style="justify-content:space-between; margin-top:8px;">
            <h2 style="font-size:1.05rem; font-weight:700; color:#111827;">{{ project?.name }}</h2>
            <button (click)="save()" [disabled]="saving" style="background:#4f46e5; color:white; border:none; padding:8px 16px; border-radius:8px; font-size:0.82rem; font-weight:600; cursor:pointer;">
              {{ saving ? 'Đang lưu...' : '💾 Lưu' }}
            </button>
          </div>
          <p *ngIf="savedMsg" style="font-size:0.72rem; color:#16a34a; margin-top:6px;">{{ savedMsg }}</p>
        </div>

        <!-- Tokens: màu & font -->
        <div class="tb-sec">
          <div class="tb-h">Màu sắc & Phông chữ</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div><label class="tb-lbl">Màu chủ đạo</label><input type="color" class="tb-color" [(ngModel)]="cfg.tokens.colorPrimary" (ngModelChange)="touch()"></div>
            <div><label class="tb-lbl">Màu nhấn</label><input type="color" class="tb-color" [(ngModel)]="cfg.tokens.colorAccent" (ngModelChange)="touch()"></div>
            <div><label class="tb-lbl">Nền</label><input type="color" class="tb-color" [(ngModel)]="cfg.tokens.colorBg" (ngModelChange)="touch()"></div>
            <div><label class="tb-lbl">Chữ</label><input type="color" class="tb-color" [(ngModel)]="cfg.tokens.colorText" (ngModelChange)="touch()"></div>
          </div>
          <div style="margin-top:10px;">
            <label class="tb-lbl">Font tiêu đề</label>
            <select class="tb-in" [(ngModel)]="cfg.tokens.fontHead" (ngModelChange)="touch()">
              <option *ngFor="let f of fonts" [value]="f">{{ f }}</option>
            </select>
          </div>
          <div style="margin-top:8px;">
            <label class="tb-lbl">Font nội dung</label>
            <select class="tb-in" [(ngModel)]="cfg.tokens.fontBody" (ngModelChange)="touch()">
              <option *ngFor="let f of fonts" [value]="f">{{ f }}</option>
            </select>
          </div>
        </div>

        <!-- Logo -->
        <div class="tb-sec">
          <div class="tb-h">Logo</div>
          <label class="tb-lbl">Tên thương hiệu (hiển thị nếu không có logo)</label>
          <input class="tb-in" [(ngModel)]="cfg.tokens.logoText" (ngModelChange)="touch()" placeholder="VD: Sunrise City">
          <div class="tb-row" style="margin-top:10px;">
            <input class="tb-in" [(ngModel)]="cfg.tokens.logoUrl" (ngModelChange)="touch()" placeholder="URL logo...">
            <label style="white-space:nowrap; background:#eef2ff; color:#4338ca; padding:7px 10px; border-radius:6px; font-size:0.75rem; cursor:pointer;">
              Tải lên<input type="file" hidden accept="image/*" (change)="upload($event, cfg.tokens, 'logoUrl')">
            </label>
          </div>
          <img *ngIf="cfg.tokens.logoUrl" [src]="cfg.tokens.logoUrl" style="height:34px; margin-top:8px; object-fit:contain;">
        </div>

        <!-- Blocks -->
        <div class="tb-sec">
          <div class="tb-h">Bố cục (kéo-thả để sắp xếp)</div>
          <div *ngFor="let b of cfg.blocks; let i = index"
               class="tb-block" [class.sel]="selectedId === b.id" [class.drag]="dragIndex === i"
               draggable="true"
               (dragstart)="onDragStart(i)" (dragover)="onDragOver($event, i)" (drop)="onDrop(i)" (dragend)="dragIndex = -1"
               (click)="selectedId = (selectedId === b.id ? null : b.id)">
            <div class="tb-row" style="justify-content:space-between;">
              <span style="font-size:0.82rem; font-weight:600; color:#374151;">⠿ {{ label(b.type) }}</span>
              <div class="tb-row">
                <button class="tb-ico" [style.background]="b.visible ? '#dcfce7' : '#f3f4f6'" (click)="toggleVisible($event, b)" [title]="b.visible ? 'Đang hiện' : 'Đang ẩn'">{{ b.visible ? '👁️' : '🚫' }}</button>
                <button class="tb-ico" style="background:#fee2e2;" (click)="removeBlock($event, i)" title="Xóa">🗑️</button>
              </div>
            </div>

            <!-- Editor props khi chọn block -->
            <div *ngIf="selectedId === b.id" (click)="$event.stopPropagation()" style="margin-top:10px; border-top:1px dashed #e5e7eb; padding-top:10px; cursor:default;">

              <ng-container [ngSwitch]="b.type">
                <!-- HERO -->
                <div *ngSwitchCase="'hero'">
                  <label class="tb-lbl">Ảnh nền</label>
                  <div class="tb-row"><input class="tb-in" [(ngModel)]="b.props.image" (ngModelChange)="touch()"><label style="white-space:nowrap;background:#eef2ff;color:#4338ca;padding:7px 10px;border-radius:6px;font-size:0.72rem;cursor:pointer;">📤<input type="file" hidden accept="image/*" (change)="upload($event, b.props, 'image')"></label></div>
                  <label class="tb-lbl" style="margin-top:8px;">Tiêu đề</label>
                  <input class="tb-in" [(ngModel)]="b.props.title" (ngModelChange)="touch()" placeholder="Mặc định: tên dự án">
                  <label class="tb-lbl" style="margin-top:8px;">Phụ đề</label>
                  <textarea class="tb-in" rows="2" [(ngModel)]="b.props.subtitle" (ngModelChange)="touch()"></textarea>
                  <div class="tb-row" style="margin-top:8px;">
                    <div style="flex:1;"><label class="tb-lbl">Nút CTA</label><input class="tb-in" [(ngModel)]="b.props.ctaText" (ngModelChange)="touch()"></div>
                    <div style="flex:1;"><label class="tb-lbl">Link</label><input class="tb-in" [(ngModel)]="b.props.ctaLink" (ngModelChange)="touch()"></div>
                  </div>
                </div>

                <!-- STATS -->
                <div *ngSwitchCase="'stats'">
                  <label class="tb-lbl">Các con số</label>
                  <div *ngFor="let it of b.props.items; let j = index" class="tb-row" style="margin-bottom:6px;">
                    <input class="tb-in" [(ngModel)]="it.value" (ngModelChange)="touch()" placeholder="24/7" style="flex:1;">
                    <input class="tb-in" [(ngModel)]="it.label" (ngModelChange)="touch()" placeholder="Nhãn" style="flex:2;">
                    <button class="tb-ico" style="background:#fee2e2;" (click)="b.props.items.splice(j,1); touch()">✕</button>
                  </div>
                  <button class="tb-add" (click)="b.props.items.push({value:'',label:''}); touch()">+ Thêm con số</button>
                </div>

                <!-- PROPERTIES -->
                <div *ngSwitchCase="'properties'">
                  <label class="tb-lbl">Tiêu đề mục</label>
                  <input class="tb-in" [(ngModel)]="b.props.title" (ngModelChange)="touch()">
                  <label class="tb-row" style="margin-top:10px; gap:6px; font-size:0.8rem; color:#374151;">
                    <input type="checkbox" [(ngModel)]="b.props.showFilter" (ngModelChange)="touch()"> Hiển thị bộ lọc
                  </label>
                </div>

                <!-- SECTIONS / BLOGS / GALLERY title -->
                <div *ngSwitchCase="'sections'"><label class="tb-lbl">Tiêu đề mục</label><input class="tb-in" [(ngModel)]="b.props.title" (ngModelChange)="touch()"></div>
                <div *ngSwitchCase="'blogs'"><label class="tb-lbl">Tiêu đề mục</label><input class="tb-in" [(ngModel)]="b.props.title" (ngModelChange)="touch()"></div>

                <!-- GALLERY -->
                <div *ngSwitchCase="'gallery'">
                  <label class="tb-lbl">Tiêu đề</label>
                  <input class="tb-in" [(ngModel)]="b.props.title" (ngModelChange)="touch()">
                  <label class="tb-lbl" style="margin-top:8px;">Ảnh</label>
                  <div *ngFor="let img of b.props.images; let j = index" class="tb-row" style="margin-bottom:6px;">
                    <input class="tb-in" [(ngModel)]="b.props.images[j]" (ngModelChange)="touch()" style="flex:1;">
                    <button class="tb-ico" style="background:#fee2e2;" (click)="b.props.images.splice(j,1); touch()">✕</button>
                  </div>
                  <label class="tb-add"><span>📤 Tải ảnh thêm vào thư viện</span><input type="file" hidden accept="image/*" (change)="uploadToArray($event, b.props.images)"></label>
                </div>

                <!-- TEXT -->
                <div *ngSwitchCase="'text'">
                  <label class="tb-lbl">Tiêu đề</label><input class="tb-in" [(ngModel)]="b.props.heading" (ngModelChange)="touch()">
                  <label class="tb-lbl" style="margin-top:8px;">Nội dung</label><textarea class="tb-in" rows="4" [(ngModel)]="b.props.body" (ngModelChange)="touch()"></textarea>
                </div>

                <!-- CTA -->
                <div *ngSwitchCase="'cta'">
                  <label class="tb-lbl">Tiêu đề</label><input class="tb-in" [(ngModel)]="b.props.title" (ngModelChange)="touch()">
                  <div class="tb-row" style="margin-top:8px;">
                    <div style="flex:1;"><label class="tb-lbl">Nút</label><input class="tb-in" [(ngModel)]="b.props.buttonText" (ngModelChange)="touch()"></div>
                    <div style="flex:1;"><label class="tb-lbl">Link</label><input class="tb-in" [(ngModel)]="b.props.buttonLink" (ngModelChange)="touch()"></div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>

          <!-- Palette thêm block -->
          <div style="margin-top:12px;">
            <div class="tb-h">+ Thêm thành phần</div>
            <button *ngFor="let p of palette" class="tb-add" (click)="addBlock(p.type)">
              <span>{{ p.icon }}</span><span>{{ p.label }}</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="tb-sec">
          <div class="tb-h">Chân trang (Footer)</div>
          <label class="tb-lbl">Mô tả ngắn</label>
          <textarea class="tb-in" rows="2" [(ngModel)]="cfg.footer.text" (ngModelChange)="touch()"></textarea>
          <label class="tb-row" style="margin-top:10px; gap:6px; font-size:0.8rem; color:#374151;">
            <input type="checkbox" [(ngModel)]="cfg.footer.showContact" (ngModelChange)="touch()"> Hiển thị liên hệ
          </label>
          <div *ngIf="cfg.footer.showContact" style="margin-top:8px;">
            <input class="tb-in" [(ngModel)]="cfg.footer.phone" (ngModelChange)="touch()" placeholder="Số điện thoại" style="margin-bottom:6px;">
            <input class="tb-in" [(ngModel)]="cfg.footer.email" (ngModelChange)="touch()" placeholder="Email">
          </div>
        </div>

        <!-- Trang chi tiết BĐS (chỉ Custom) -->
        <div class="tb-sec" *ngIf="project?.theme_id === 'custom'">
          <div class="tb-h">Trang chi tiết BĐS dùng theme</div>
          <select class="tb-in" [(ngModel)]="cfg.basePropertyTheme" (ngModelChange)="touch()">
            <option value="minimalist">Minimalist</option>
            <option value="luxury">Luxury</option>
            <option value="eco-green">Eco Green</option>
          </select>
        </div>
      </div>

      <!-- ── Live preview (render đúng theme của dự án) ── -->
      <div class="tb-preview" [ngSwitch]="project?.theme_id">
        <app-luxury-theme    *ngSwitchCase="'luxury'"    [project]="previewProject"></app-luxury-theme>
        <app-eco-green-theme *ngSwitchCase="'eco-green'" [project]="previewProject"></app-eco-green-theme>
        <app-custom-theme    *ngSwitchCase="'custom'"    [project]="previewProject"></app-custom-theme>
        <app-minimalist-theme *ngSwitchDefault           [project]="previewProject"></app-minimalist-theme>
      </div>
    </div>

    <div *ngIf="loading" style="display:flex; justify-content:center; align-items:center; height:60vh;">
      <div style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#4f46e5;border-radius:50%;animation:spin 0.7s linear infinite;"></div>
    </div>
  `
})
export class ThemeBuilderComponent implements OnInit {
  private api = inject(ApiService);
  private uploadService = inject(UploadService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  projectId!: string;
  project: any = null;
  cfg!: LayoutConfig;
  previewProject: any = null;
  loading = true;
  saving = false;
  savedMsg = '';
  selectedId: string | null = null;
  dragIndex = -1;

  fonts = FONT_OPTIONS;
  palette = BLOCK_PALETTE;

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.api.get<any>(`/projects/${this.projectId}`).subscribe({
      next: (res) => {
        this.project = res.data;
        this.cfg = normalizeLayoutFor(this.project?.layout_config, this.project?.theme_id || 'custom');
        this.refreshPreview();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  label(type: BlockType) { return blockLabel(type); }

  /** Cập nhật bản preview (clone config → object project mới để CustomTheme re-render) */
  touch() {
    this.refreshPreview();
  }
  private refreshPreview() {
    this.previewProject = { ...this.project, layout_config: JSON.parse(JSON.stringify(this.cfg)) };
  }

  // ── Block actions ──
  addBlock(type: BlockType) {
    const blk = defaultBlock(type);
    this.cfg.blocks.push(blk);
    this.selectedId = blk.id;
    this.touch();
  }
  removeBlock(ev: Event, i: number) {
    ev.stopPropagation();
    this.cfg.blocks.splice(i, 1);
    this.touch();
  }
  toggleVisible(ev: Event, b: LayoutBlock) {
    ev.stopPropagation();
    b.visible = !b.visible;
    this.touch();
  }

  // ── Drag & drop reorder (HTML5 native) ──
  onDragStart(i: number) { this.dragIndex = i; }
  onDragOver(ev: DragEvent, i: number) { ev.preventDefault(); }
  onDrop(i: number) {
    if (this.dragIndex < 0 || this.dragIndex === i) { this.dragIndex = -1; return; }
    const [moved] = this.cfg.blocks.splice(this.dragIndex, 1);
    this.cfg.blocks.splice(i, 0, moved);
    this.dragIndex = -1;
    this.touch();
  }

  // ── Upload helpers ──
  upload(event: any, target: any, key: string) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadService.uploadFile(file).subscribe({
      next: (res: any) => { target[key] = res.data.url; this.touch(); this.cdr.detectChanges(); },
      error: () => this.toast.error('Lỗi tải ảnh lên')
    });
  }
  uploadToArray(event: any, arr: string[]) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadService.uploadFile(file).subscribe({
      next: (res: any) => { arr.push(res.data.url); this.touch(); this.cdr.detectChanges(); },
      error: () => this.toast.error('Lỗi tải ảnh lên')
    });
  }

  // ── Save ──
  save() {
    this.saving = true;
    this.savedMsg = '';
    this.api.put<any>(`/projects/${this.projectId}`, { theme_id: this.project?.theme_id, layout_config: this.cfg }).subscribe({
      next: () => { this.saving = false; this.savedMsg = '✓ Đã lưu giao diện. Mở trang dự án để xem.'; this.toast.success('Đã lưu giao diện.'); this.cdr.detectChanges(); },
      error: (err: any) => { this.saving = false; this.toast.error(err.error?.error || 'Lỗi khi lưu giao diện'); this.cdr.detectChanges(); }
    });
  }
}
