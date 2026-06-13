import { Component, inject, HostListener, computed, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LightboxService } from '../../services/lightbox.service';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .lb-overlay {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      animation: lbFadeIn .18s ease;
    }
    @keyframes lbFadeIn { from { opacity:0; } to { opacity:1; } }
    .lb-img-wrap {
      position: relative; display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%;
    }
    .lb-img {
      max-width: 92vw; max-height: 88vh;
      object-fit: contain; border-radius: 4px;
      transition: transform .2s ease;
      cursor: grab;
      user-select: none;
    }
    .lb-img:active { cursor: grabbing; }
    .lb-btn {
      position: fixed; background: rgba(255,255,255,0.12); border: none;
      color: #fff; cursor: pointer; border-radius: 50%;
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      transition: background .15s; font-size: 18px;
    }
    .lb-btn:hover { background: rgba(255,255,255,0.24); }
    .lb-close { top: 16px; right: 16px; }
    .lb-prev { left: 16px; top: 50%; transform: translateY(-50%); }
    .lb-next { right: 16px; top: 50%; transform: translateY(-50%); }
    .lb-zoom-bar {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px;
      background: rgba(0,0,0,0.55); border-radius: 30px; padding: 8px 16px;
    }
    .lb-zoom-btn {
      background: rgba(255,255,255,0.15); border: none; color: #fff;
      cursor: pointer; border-radius: 50%; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; transition: background .15s;
    }
    .lb-zoom-btn:hover { background: rgba(255,255,255,0.3); }
    .lb-zoom-label { color: rgba(255,255,255,0.7); font-size: 13px; min-width: 42px; text-align: center; }
    .lb-counter {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.5); border-radius: 20px; padding: 4px 14px;
      color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 600;
    }
  `],
  template: `
    <div *ngIf="state().open" class="lb-overlay" (click)="onOverlayClick($event)">
      <span class="lb-counter" *ngIf="state().images.length > 1">
        {{ state().index + 1 }} / {{ state().images.length }}
      </span>

      <button class="lb-btn lb-close" (click)="close()" aria-label="Đóng">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <button *ngIf="state().images.length > 1" class="lb-btn lb-prev" (click)="prev($event)" aria-label="Ảnh trước">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <div class="lb-img-wrap" (click)="$event.stopPropagation()">
        <img class="lb-img"
             [src]="currentImage()"
             [style.transform]="'scale(' + zoom() + ')'"
             (wheel)="onWheel($event)"
             alt="Ảnh full size"
             draggable="false">
      </div>

      <button *ngIf="state().images.length > 1" class="lb-btn lb-next" (click)="next($event)" aria-label="Ảnh tiếp theo">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      <div class="lb-zoom-bar" (click)="$event.stopPropagation()">
        <button class="lb-zoom-btn" (click)="zoomOut()" aria-label="Thu nhỏ">−</button>
        <span class="lb-zoom-label">{{ zoomPercent() }}%</span>
        <button class="lb-zoom-btn" (click)="zoomIn()" aria-label="Phóng to">+</button>
        <button class="lb-zoom-btn" (click)="resetZoom()" aria-label="Đặt lại" title="Reset zoom" style="font-size:12px;">⟳</button>
      </div>
    </div>
  `
})
export class LightboxComponent {
  private svc = inject(LightboxService);
  private platformId = inject(PLATFORM_ID);

  readonly state = this.svc.state;
  readonly currentImage = computed(() => this.state().images[this.state().index] ?? '');

  readonly zoom = signal(1);
  readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.state().open) return;
    if (e.key === 'Escape')      this.close();
    if (e.key === 'ArrowRight')  this.svc.next();
    if (e.key === 'ArrowLeft')   this.svc.prev();
    if (e.key === '+' || e.key === '=') this.zoomIn();
    if (e.key === '-')           this.zoomOut();
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('lb-overlay')) this.close();
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.zoom.update(z => Math.min(4, Math.max(0.3, +(z + delta).toFixed(1))));
  }

  close()     { this.svc.close(); this.zoom.set(1); }
  next(e: Event) { e.stopPropagation(); this.svc.next(); this.zoom.set(1); }
  prev(e: Event) { e.stopPropagation(); this.svc.prev(); this.zoom.set(1); }
  zoomIn()    { this.zoom.update(z => Math.min(4, +(z + 0.25).toFixed(2))); }
  zoomOut()   { this.zoom.update(z => Math.max(0.3, +(z - 0.25).toFixed(2))); }
  resetZoom() { this.zoom.set(1); }
}
