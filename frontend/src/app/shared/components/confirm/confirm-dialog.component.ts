import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

/**
 * Hộp thoại xác nhận toàn cục. Gắn 1 lần ở app-root.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .cf-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(15,23,42,0.55); backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
      animation: cfFade .18s ease;
    }
    @keyframes cfFade { from { opacity: 0; } to { opacity: 1; } }
    .cf-box {
      background: #fff; border-radius: 16px; max-width: 420px; width: 100%;
      box-shadow: 0 24px 60px rgba(0,0,0,0.3); overflow: hidden;
      animation: cfPop .22s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes cfPop { from { opacity:0; transform: scale(.94) translateY(8px); } to { opacity:1; transform:none; } }
    .cf-pad { padding: 24px 24px 20px; }
    .cf-ico { width: 46px; height: 46px; border-radius: 12px; display:flex; align-items:center; justify-content:center; margin-bottom: 14px; }
    .cf-ico.danger { background:#fee2e2; color:#dc2626; }
    .cf-ico.normal { background:#eef2ff; color:#4f46e5; }
    .cf-title { font-size: 1.1rem; font-weight: 800; color:#111827; margin-bottom: 6px; }
    .cf-msg { font-size: 0.88rem; color:#4b5563; line-height: 1.6; }
    .cf-actions { display:flex; gap:10px; justify-content:flex-end; padding: 0 24px 20px; }
    .cf-btn { padding: 9px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: none; transition: all .15s; }
    .cf-cancel { background:#f3f4f6; color:#374151; }
    .cf-cancel:hover { background:#e5e7eb; }
    .cf-ok { background:#4f46e5; color:#fff; }
    .cf-ok:hover { background:#4338ca; }
    .cf-ok.danger { background:#dc2626; }
    .cf-ok.danger:hover { background:#b91c1c; }
  `],
  template: `
    <ng-container *ngIf="(confirm.state$ | async) as s">
    <div class="cf-overlay" *ngIf="s.open" (click)="cancel()">
      <div class="cf-box" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <div class="cf-pad">
          <div class="cf-ico" [class.danger]="s.danger" [class.normal]="!s.danger">
            <svg style="width:24px;height:24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div class="cf-title">{{ s.title || 'Xác nhận' }}</div>
          <div class="cf-msg">{{ s.message }}</div>
        </div>
        <div class="cf-actions">
          <button class="cf-btn cf-cancel" (click)="cancel()">{{ s.cancelText || 'Hủy' }}</button>
          <button class="cf-btn cf-ok" [class.danger]="s.danger" (click)="ok()">{{ s.confirmText || 'Xác nhận' }}</button>
        </div>
      </div>
    </div>
    </ng-container>
  `
})
export class ConfirmDialogComponent {
  confirm = inject(ConfirmService);

  ok() { this.confirm.respond(true); }
  cancel() { this.confirm.respond(false); }

  @HostListener('document:keydown.escape')
  onEsc() { this.cancel(); }
}
