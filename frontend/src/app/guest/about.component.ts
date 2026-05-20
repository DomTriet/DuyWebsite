import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../shared/components/language-selector/language-selector.component';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-about',
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
            <a routerLink="/about" class="text-indigo-600 transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a>
            <a routerLink="/blogs" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
            <a routerLink="/forum" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.COMMUNITY' | translate }}</a>
            <a routerLink="/contact" class="hover:text-indigo-600 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <div class="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">{{ 'NAVBAR.ABOUT' | translate }}</h1>
        <p class="text-lg text-gray-600 leading-relaxed mb-8">
          Pro-RealEstate là nền tảng Bất động sản công nghệ cao, cung cấp các giải pháp kết nối người mua và người bán thông minh, minh bạch và an toàn.
        </p>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="w-full rounded-3xl shadow-lg" alt="About Us">
      </div>
    </div>
  `
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);
  
  ngOnInit() {
    this.seoService.setMeta({
      title: 'Giới thiệu',
      desc: 'Pro-RealEstate là nền tảng Bất động sản công nghệ cao, cung cấp các giải pháp kết nối người mua và người bán thông minh, minh bạch và an toàn.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    });
  }
}