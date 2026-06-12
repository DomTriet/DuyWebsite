import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Hiển thị stack toast ở góc trên-phải màn hình. Gắn 1 lần ở app-root.
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .toast-wrap {
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px;
      max-width: 380px; width: calc(100vw - 40px); pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex; align-items: flex-start; gap: 12px;
      background: #fff; border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08);
      border-left: 4px solid var(--c); padding: 14px 16px;
      animation: toastIn .28s cubic-bezier(0.16,1,0.3,1);
    }
    .toast.leaving { animation: toastOut .25s ease forwards; }
    @keyframes toastIn { from { opacity:0; transform: translateX(24px); } to { opacity:1; transform:none; } }
    @keyframes toastOut { to { opacity:0; transform: translateX(24px); } }
    .toast-ico { width: 22px; height: 22px; flex-shrink: 0; color: var(--c); margin-top: 1px; }
    .toast-body { flex: 1; min-width: 0; }
    .toast-title { font-weight: 700; font-size: 0.85rem; color: #111827; margin-bottom: 2px; }
    .toast-msg { font-size: 0.82rem; color: #4b5563; line-height: 1.45; word-break: break-word; }
    .toast-close { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; flex-shrink: 0; }
    .toast-close:hover { color: #4b5563; }
    .t-success { --c: #16a34a; }
    .t-error   { --c: #dc2626; }
    .t-warning { --c: #d97706; }
    .t-info    { --c: #4f46e5; }
  `],
  template: `
    <div class="toast-wrap" aria-live="polite" aria-atomic="false">
      <div *ngFor="let t of toast.toasts$ | async" class="toast" [ngClass]="'t-' + t.type" role="alert">
        <svg class="toast-ico" fill="none" stroke="currentColor" viewBox="0 0 24 24" [ngSwitch]="t.type">
          <path *ngSwitchCase="'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <path *ngSwitchCase="'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <path *ngSwitchCase="'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <path *ngSwitchDefault stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="toast-body">
          <div *ngIf="t.title" class="toast-title">{{ t.title }}</div>
          <div class="toast-msg">{{ t.message }}</div>
        </div>
        <button class="toast-close" (click)="toast.dismiss(t.id)" aria-label="Đóng">
          <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toast = inject(ToastService);
}
