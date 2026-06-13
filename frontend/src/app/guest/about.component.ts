import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../core/services/seo.service';
import { GuestNavComponent } from '../shared/components/guest-nav/guest-nav.component';
import { GuestFooterComponent } from '../shared/components/guest-footer/guest-footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, GuestNavComponent, GuestFooterComponent],
  styles: [`
    :host { display: block; }
    .page-title { font-family: 'Cormorant Garamond', Georgia, serif; letter-spacing: -0.02em; font-style: italic; }
    .editorial-title { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; }
    .value-card { border: 1px solid #EBEBEB; border-radius: 16px; background: #fff; padding: 28px; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s; }
    .value-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
    .icon-box { width: 48px; height: 48px; border-radius: 12px; background: #F0EFE9; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  `],
  template: `
    <div class="min-h-screen flex flex-col bg-white">
      <app-guest-nav active="about"></app-guest-nav>

      <!-- Hero -->
      <section style="background:#F7F6F3; border-bottom:1px solid #EBEBEB; padding:80px 24px;">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p style="font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#999; margin-bottom:16px;">
              {{ 'NAVBAR.ABOUT' | translate }}
            </p>
            <h1 class="page-title" style="font-size:clamp(2.2rem,5.5vw,3.8rem); font-weight:700; color:#0D0D0D; margin-bottom:18px; line-height:1.1;">{{ 'ABOUT_PAGE.HERO_TITLE' | translate }}</h1>
            <p style="font-size:1.05rem; color:#6B7280; line-height:1.8;">{{ 'ABOUT_PAGE.HERO_SUB' | translate }}</p>
          </div>
          <div style="border-radius:20px; overflow:hidden; height:clamp(200px,55vw,320px); box-shadow:0 24px 60px rgba(0,0,0,0.12);">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"
                 style="width:100%; height:100%; object-fit:cover;" alt="Về chúng tôi" loading="eager">
          </div>
        </div>
      </section>

      <!-- Core Values -->
      <section style="max-width:1152px; margin:0 auto; padding:80px 24px;">
        <div style="text-align:center; margin-bottom:52px;">
          <h2 class="page-title" style="font-size:clamp(1.6rem,4vw,2.4rem); font-weight:700; color:#0D0D0D; margin-bottom:10px;">{{ 'ABOUT_PAGE.VALUES_TITLE' | translate }}</h2>
          <p style="color:#6B7280; font-size:1rem;">{{ 'ABOUT_PAGE.VALUES_SUB' | translate }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let val of values" class="value-card">
            <div class="icon-box">
              <svg style="width:22px;height:22px;" [style.color]="val.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="val.icon"/>
              </svg>
            </div>
            <h3 class="page-title" style="font-size:1.1rem; font-weight:700; color:#0D0D0D; margin-bottom:8px;">{{ val.titleKey | translate }}</h3>
            <p style="color:#6B7280; font-size:0.9rem; line-height:1.7;">{{ val.descKey | translate }}</p>
          </div>
        </div>
      </section>

      <!-- Mission & Vision -->
      <section style="background:#F7F6F3; border-top:1px solid #EBEBEB; border-bottom:1px solid #EBEBEB; padding:80px 24px;">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style="background:#fff; border-radius:20px; border:1px solid #EBEBEB; padding:40px;">
            <p style="font-size:0.65rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#999; margin-bottom:14px;">{{ 'ABOUT_PAGE.MISSION_LABEL' | translate }}</p>
            <h3 class="page-title" style="font-size:1.5rem; font-weight:700; color:#0D0D0D; margin-bottom:14px;">{{ 'ABOUT_PAGE.MISSION_TITLE' | translate }}</h3>
            <p style="color:#6B7280; line-height:1.8;">{{ 'ABOUT_PAGE.MISSION_DESC' | translate }}</p>
          </div>
          <div style="background:#0D0D0D; border-radius:20px; padding:40px;">
            <p style="font-size:0.65rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#555; margin-bottom:14px;">{{ 'ABOUT_PAGE.VISION_LABEL' | translate }}</p>
            <h3 class="editorial-title" style="font-size:1.5rem; font-weight:700; color:#F7F6F3; margin-bottom:14px;">{{ 'ABOUT_PAGE.VISION_TITLE' | translate }}</h3>
            <p style="color:#888; line-height:1.8;">{{ 'ABOUT_PAGE.VISION_DESC' | translate }}</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section style="padding:80px 24px; text-align:center;">
        <div style="max-width:580px; margin:0 auto;">
          <h2 class="page-title" style="font-size:clamp(1.6rem,4vw,2.4rem); font-weight:700; color:#0D0D0D; margin-bottom:14px;">{{ 'ABOUT_PAGE.CTA_TITLE' | translate }}</h2>
          <p style="color:#6B7280; margin-bottom:28px; font-size:1rem; line-height:1.7;">{{ 'ABOUT_PAGE.CTA_SUB' | translate }}</p>
          <a routerLink="/" style="display:inline-block; background:#0D0D0D; color:#F7F6F3; padding:13px 32px; border-radius:10px; font-weight:700; font-size:0.9rem; text-decoration:none; transition:background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">
            {{ 'ABOUT_PAGE.CTA_BTN' | translate }}
          </a>
        </div>
      </section>

      <app-guest-footer></app-guest-footer>
    </div>
  `
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);

  values = [
    {
      titleKey: 'ABOUT_PAGE.VAL_TECH',
      descKey: 'ABOUT_PAGE.VAL_TECH_DESC',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: '#4F46E5', bgLight: '#EEF2FF'
    },
    {
      titleKey: 'ABOUT_PAGE.VAL_TRANS',
      descKey: 'ABOUT_PAGE.VAL_TRANS_DESC',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: '#059669', bgLight: '#D1FAE5'
    },
    {
      titleKey: 'ABOUT_PAGE.VAL_SAFE',
      descKey: 'ABOUT_PAGE.VAL_SAFE_DESC',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      color: '#7C3AED', bgLight: '#EDE9FE'
    },
  ];

  ngOnInit() {
    this.seoService.setMeta({
      title: 'Giới thiệu | Điểm Tâm BĐS',
      desc: 'Điểm Tâm BĐS là nền tảng bất động sản công nghệ cao, kết nối người mua và người bán thông minh, minh bạch và an toàn.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
    });
  }
}
