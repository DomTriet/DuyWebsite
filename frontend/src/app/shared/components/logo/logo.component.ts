import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    /* ── inline text variant (nav / footer) ── */
    .logo-wrap { display: inline-flex; flex-direction: column; gap: 1px; text-decoration: none; }
    .logo-main { display: flex; align-items: center; gap: 6px; }
    .logo-prefix {
      font-family: 'Space Grotesk', system-ui, sans-serif;
      font-size: 0.55rem; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: #6B7280;
    }
    .logo-name {
      font-family: 'Lora', Georgia, serif;
      font-weight: 700; letter-spacing: -0.02em; color: #0D0D0D;
    }
    .logo-dot { color: #B8860B; font-size: 1.1em; line-height: 1; }
    .logo-slogan {
      font-family: 'Lora', Georgia, serif;
      font-style: italic; font-size: 0.6rem; color: #9CA3AF;
      letter-spacing: 0.01em; line-height: 1;
    }
    :host(.light) .logo-prefix { color: rgba(247,246,243,0.55); }
    :host(.light) .logo-name   { color: #F7F6F3; }
    :host(.light) .logo-slogan { color: rgba(247,246,243,0.45); }

    /* ── full SVG variant ── */
    .logo-full img { display: block; width: 100%; height: auto; }
  `],
  template: `
    <!-- Full SVG logo (for splash screens, about page, marketing) -->
    <div *ngIf="variant === 'full'" class="logo-full" [style.max-width]="fullWidth">
      <img src="assets/logo.svg" alt="Điểm Tâm BĐS — Nơi mọi ngôi nhà tìm được chủ nhân"/>
    </div>

    <!-- Inline text logo (for nav, footer, admin sidebar) -->
    <span *ngIf="variant !== 'full'" class="logo-wrap">
      <span class="logo-main">
        <span class="logo-prefix">Bất Động Sản</span>
        <span class="logo-name" [style.font-size]="size">Điểm Tâm</span>
        <span class="logo-dot" aria-hidden="true">•</span>
      </span>
      <span *ngIf="showSlogan" class="logo-slogan">Nơi mọi ngôi nhà tìm được chủ nhân</span>
    </span>
  `
})
export class LogoComponent {
  /** 'inline' (default) — text-based for nav/footer; 'full' — SVG file for marketing */
  @Input() variant: 'inline' | 'full' = 'inline';
  /** Font size for the 'Điểm Tâm' wordmark in inline variant */
  @Input() size = '1.1rem';
  /** Show slogan line below the wordmark (inline variant only) */
  @Input() showSlogan = false;
  /** Max width of the full SVG variant */
  @Input() fullWidth = '400px';
}
