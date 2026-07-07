import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../core/services/seo.service';
import { GuestNavComponent } from '../shared/components/guest-nav/guest-nav.component';
import { GuestFooterComponent } from '../shared/components/guest-footer/guest-footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, GuestNavComponent, GuestFooterComponent],
  styles: [`
    :host { display: block; }
    .page-title { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.03em; }
    .contact-card { border: 1px solid #EBEBEB; border-radius: 18px; background: #fff; padding: 32px 24px; text-align: center; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s; }
    .contact-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
    .icon-wrap { width: 48px; height: 48px; border-radius: 12px; background: #F0EFE9; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  `],
  template: `
    <div class="min-h-screen flex flex-col bg-white">
      <app-guest-nav active="contact"></app-guest-nav>

      <!-- Hero -->
      <section style="background:#F7F6F3; border-bottom:1px solid #EBEBEB; padding:72px 24px; text-align:center;">
        <p style="font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#999; margin-bottom:16px;">
          {{ 'NAVBAR.CONTACT' | translate }}
        </p>
        <h1 class="page-title" style="font-size:clamp(2rem,6vw,3.6rem); font-weight:700; color:#0D0D0D; margin-bottom:14px; line-height:1.1;">{{ 'CONTACT_PAGE.HERO_TITLE' | translate }}</h1>
        <p style="color:#6B7280; font-size:1.05rem; max-width:480px; margin:0 auto; line-height:1.75;">{{ 'CONTACT_PAGE.HERO_SUB' | translate }}</p>
      </section>

      <!-- Contact cards -->
      <section class="flex-1" style="max-width:960px; margin:0 auto; width:100%; padding:72px 24px;">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" style="margin-bottom:48px;">
          <div *ngFor="let c of contacts" class="contact-card">
            <div class="icon-wrap">
              <svg style="width:22px;height:22px;color:#374151;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" [attr.d]="c.icon"/>
              </svg>
            </div>
            <h3 class="page-title" style="font-size:0.9rem; font-weight:700; color:#0D0D0D; margin-bottom:6px;">{{ c.titleKey | translate }}</h3>
            <p style="color:#374151; font-weight:600; font-size:0.9rem; margin-bottom:4px;">{{ c.value }}</p>
            <p *ngIf="c.noteKey" style="font-size:0.75rem; color:#9CA3AF;">{{ c.noteKey | translate }}</p>
          </div>
        </div>

        <!-- CTA (dark editorial) -->
        <div style="background:#0D0D0D; border-radius:20px; padding:52px 40px; text-align:center;">
          <p style="font-size:0.65rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#555; margin-bottom:12px;">Bất Động Sản Điểm Tâm</p>
          <h2 class="page-title" style="font-size:clamp(1.5rem,4vw,2rem); font-weight:700; color:#F7F6F3; margin-bottom:10px;">{{ 'CONTACT_PAGE.CTA_TITLE' | translate }}</h2>
          <p style="color:#888; margin-bottom:24px; font-size:0.9rem; line-height:1.7;">{{ 'CONTACT_PAGE.CTA_SUB' | translate }}</p>
          <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px;">
            <a routerLink="/blogs" style="background:#F7F6F3; color:#0D0D0D; padding:11px 24px; border-radius:8px; font-size:0.85rem; font-weight:700; text-decoration:none; transition:background 0.2s;" onmouseover="this.style.background='#EBEBEB'" onmouseout="this.style.background='#F7F6F3'">
              {{ 'CONTACT_PAGE.READ_BLOG' | translate }}
            </a>
            <a routerLink="/about" style="background:transparent; color:#F7F6F3; padding:11px 24px; border-radius:8px; font-size:0.85rem; font-weight:700; border:1px solid rgba(255,255,255,0.2); text-decoration:none; transition:border-color 0.2s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.4)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'">
              {{ 'NAVBAR.ABOUT' | translate }}
            </a>
          </div>
        </div>
      </section>

      <app-guest-footer></app-guest-footer>
    </div>
  `
})
export class ContactComponent implements OnInit {
  private seoService = inject(SeoService);

  contacts = [
    {
      titleKey: 'CONTACT_PAGE.HOTLINE',
      value: '0975 982 592 — 0983 123 306',
      noteKey: null,
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
    },
    {
      titleKey: 'CONTACT_PAGE.EMAIL',
      value: 'bdsdiemtam@gmail.com',
      noteKey: 'CONTACT_PAGE.EMAIL_NOTE',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      titleKey: 'CONTACT_PAGE.ADDRESS',
      value: 'Nguyễn Xuân Khoát, Tân Phú, TP.HCM',
      noteKey: 'CONTACT_PAGE.ADDRESS_NOTE',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z'
    },
  ];

  ngOnInit() {
    this.seoService.setMeta({
      title: 'Liên hệ | Điểm Tâm BĐS',
      desc: 'Liên hệ Điểm Tâm BĐS để được tư vấn bất động sản. Hotline: 0975 982 592.',
    });
  }
}
