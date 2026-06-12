import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    /* compact: SVG horizontal lockup (nav / footer) */
    .logo-compact { display: block; }
    .logo-compact svg { display: block; width: 100%; height: auto; }

    /* full: complete SVG identity (about, landing, marketing) */
    .logo-full { display: block; }
    .logo-full img { display: block; width: 100%; height: auto; }

    /* inline text fallback (admin sidebar) */
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
    :host(.light) .logo-prefix { color: rgba(247,246,243,0.55); }
    :host(.light) .logo-name   { color: #F7F6F3; }
  `],
  template: `
    <!-- Full SVG: entire design with both layouts (marketing / landing) -->
    <div *ngIf="variant === 'full'" class="logo-full" [style.max-width]="fullWidth">
      <img src="assets/logo.svg" alt="Điểm Tâm BĐS — Nơi mọi ngôi nhà tìm được chủ nhân"/>
    </div>

    <!-- Compact SVG: horizontal lockup cropped from the logo SVG (nav / footer) -->
    <div *ngIf="variant === 'compact'" class="logo-compact" [style.width]="compactWidth">
      <svg xmlns="https://www.w3.org/2000/svg" viewBox="155 355 490 115" [attr.height]="compactHeight">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600&amp;family=Space+Grotesk:wght@400;700&amp;display=swap');
          </style>
        </defs>
        <!-- Diamond / house mark -->
        <g transform="translate(190,410)">
          <path d="M 0 -22 L 16 0 L 0 22 L -16 0 Z" fill="none" [attr.stroke]="iconColor" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="4" [attr.fill]="iconColor"/>
          <path d="M -8 -11 L 0 -18 L 8 -11" fill="none" [attr.stroke]="iconColor" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <!-- "Điểm Tâm" -->
        <text x="235" y="392"
              font-family="'Lora', Georgia, serif" font-size="34" font-weight="600"
              [attr.fill]="nameColor">Điểm Tâm</text>
        <!-- "BẤT ĐỘNG SẢN" -->
        <text x="237" y="420"
              font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="700"
              letter-spacing="4" [attr.fill]="iconColor">BẤT ĐỘNG SẢN</text>
        <!-- tagline -->
        <text x="235" y="448"
              font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="400"
              [attr.fill]="sloganColor">Nơi mọi ngôi nhà tìm được chủ nhân</text>
      </svg>
    </div>

    <!-- Inline text: for admin sidebar or minimal contexts -->
    <span *ngIf="variant === 'inline'" class="logo-wrap">
      <span class="logo-main">
        <span class="logo-prefix">Bất Động Sản</span>
        <span class="logo-name" [style.font-size]="size">Điểm Tâm</span>
        <span style="color:#B8860B; font-size:1.1em; line-height:1;" aria-hidden="true">•</span>
      </span>
    </span>
  `
})
export class LogoComponent {
  /** 'compact' (default) — SVG horizontal lockup for nav/footer
   *  'full'    — complete SVG asset for marketing/about pages
   *  'inline'  — text-only fallback for admin sidebar */
  @Input() variant: 'compact' | 'full' | 'inline' = 'compact';

  /** Width of the compact SVG (nav/footer). Height scales proportionally. */
  @Input() compactWidth = '180px';
  @Input() compactHeight = '44';

  /** Max-width of the full SVG variant */
  @Input() fullWidth = '400px';

  /** Font size for inline variant only */
  @Input() size = '1.1rem';

  /** Color overrides for compact SVG — set automatically by :host(.light) via @Input */
  @Input() light = false;

  get iconColor()   { return this.light ? '#C9A227' : '#B8860B'; }
  get nameColor()   { return this.light ? '#F7F6F3' : '#0D0D0D'; }
  get sloganColor() { return this.light ? 'rgba(247,246,243,0.55)' : '#6B7280'; }
}
