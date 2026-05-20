import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../shared/components/language-selector/language-selector.component';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div class="flex items-center gap-8">
          <a routerLink="/" class="text-2xl font-bold text-indigo-600 tracking-tighter">PRO-REALESTATE</a>
          <div class="hidden md:flex gap-6 font-medium text-gray-600">
            <a routerLink="/" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
            <a routerLink="/about" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
            <a routerLink="/blogs" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
            <a routerLink="/forum" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.COMMUNITY' | translate }}</a>
            <a routerLink="/contact" class="text-indigo-600 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <div class="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">{{ 'NAVBAR.CONTACT' | translate }}</h1>
        <div class="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-left">
          <p class="text-lg text-gray-700 mb-6 flex items-center gap-3"><span class="font-bold">Hotline:</span> 1900 1234 5678</p>
          <p class="text-lg text-gray-700 mb-6 flex items-center gap-3"><span class="font-bold">Email:</span> contact&#64;pro-realestate.com</p>
          <p class="text-lg text-gray-700 flex items-center gap-3"><span class="font-bold">Địa chỉ:</span> 123 Đường Nguyễn Văn Linh, Quận 1, TP.HCM</p>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
  private seoService = inject(SeoService);
  ngOnInit() {
    this.seoService.setMeta({
      title: 'Liên hệ',
      desc: 'Liên hệ ngay với Pro-RealEstate để được tư vấn các dự án Bất động sản tốt nhất. Hotline: 1900 1234 5678.',
    });
  }
}