import { Component, inject, HostListener, computed, signal, effect, PLATFORM_ID } from '@angular/core';
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
      touch-action: none;
    }
    @keyframes lbFadeIn { from { opacity:0; } to { opacity:1; } }
    .lb-img-wrap {
      position: absolute; inset: 0; z-index: 1;
      display: flex; align-items: center; justify-content: center;
      touch-action: none;
    }
    .lb-img {
      max-width: 92vw; max-height: 82vh;
      object-fit: contain; border-radius: 4px;
      transition: transform .2s ease;
      user-select: none; pointer-events: none;
    }
    .lb-btn {
      position: fixed; z-index: 10;
      background: rgba(255,255,255,0.15); border: none;
      color: #fff; cursor: pointer; border-radius: 50%;
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s; font-size: 18px;
      -webkit-tap-highlight-color: transparent;
    }
    .lb-btn:hover, .lb-btn:active { background: rgba(255,255,255,0.32); }
    .lb-close { top: 16px; right: 16px; }
    .lb-prev { left: 12px; top: 50%; transform: translateY(-50%); }
    .lb-next { right: 12px; top: 50%; transform: translateY(-50%); }
    .lb-zoom-bar {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      z-index: 10;
      display: flex; align-items: center; gap: 8px;
      background: rgba(0,0,0,0.6); border-radius: 30px; padding: 8px 16px;
      -webkit-tap-highlight-color: transparent;
    }
    .lb-zoom-btn {
      background: rgba(255,255,255,0.15); border: none; color: #fff;
      cursor: pointer; border-radius: 50%; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; transition: background .15s;
      -webkit-tap-highlight-color: transparent;
    }
    .lb-zoom-btn:active { background: rgba(255,255,255,0.4); }
    .lb-zoom-label { color: rgba(255,255,255,0.7); font-size: 13px; min-width: 42px; text-align: center; }
    .lb-counter {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 10;
      background: rgba(0,0,0,0.5); border-radius: 20px; padding: 4px 14px;
      color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 600;
      pointer-events: none;
    }
  `],
  template: `
    <div *ngIf="state().open" class="lb-overlay" (click)="onOverlayClick($event)">

      <!-- Image layer (z-index: 1) — buttons rendered AFTER so they paint on top -->
      <div class="lb-img-wrap"
           (click)="$event.stopPropagation()"
           (touchstart)="onTouchStart($event)"
           (touchmove)="onTouchMove($event)"
           (touchend)="onTouchEnd()">
        <img class="lb-img"
             [src]="currentImage()"
             [style.transform]="'scale(' + zoom() + ')'"
             (wheel)="onWheel($event)"
             alt="Ảnh full size"
             draggable="false">
      </div>

      <!-- Controls — rendered after img-wrap → z-index: 10 → always on top -->
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

  private pinchStartDist = 0;
  private pinchStartZoom = 1;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        document.body.style.overflow = this.state().open ? 'hidden' : '';
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.state().open) return;
    if (e.key === 'Escape')           this.close();
    if (e.key === 'ArrowRight')       this.svc.next();
    if (e.key === 'ArrowLeft')        this.svc.prev();
    if (e.key === '+' || e.key === '=') this.zoomIn();
    if (e.key === '-')                this.zoomOut();
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('lb-overlay')) this.close();
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.zoom.update(z => Math.min(4, Math.max(0.3, +(z + delta).toFixed(1))));
  }

  onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      this.pinchStartDist = this.touchDist(e.touches);
      this.pinchStartZoom = this.zoom();
    }
  }

  onTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length !== 2) return;
    const dist = this.touchDist(e.touches);
    const scale = dist / this.pinchStartDist;
    this.zoom.set(Math.min(4, Math.max(0.3, +(this.pinchStartZoom * scale).toFixed(2))));
  }

  onTouchEnd() {
    this.pinchStartDist = 0;
  }

  private touchDist(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  close()          { this.svc.close(); this.zoom.set(1); }
  next(e: Event)   { e.stopPropagation(); this.svc.next(); this.zoom.set(1); }
  prev(e: Event)   { e.stopPropagation(); this.svc.prev(); this.zoom.set(1); }
  zoomIn()         { this.zoom.update(z => Math.min(4, +(z + 0.25).toFixed(2))); }
  zoomOut()        { this.zoom.update(z => Math.max(0.3, +(z - 0.25).toFixed(2))); }
  resetZoom()      { this.zoom.set(1); }
}
