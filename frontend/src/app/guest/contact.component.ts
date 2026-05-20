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
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <!-- Navbar -->
      <nav class="bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div class="flex items-center gap-10">
          <a routerLink="/" class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent tracking-tighter">PRO</a>
          <div class="hidden md:flex gap-8 font-medium text-gray-600">
            <a routerLink="/" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.HOME' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/about" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.ABOUT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/blogs" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.NEWS' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/forum" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.COMMUNITY' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/contact" class="text-indigo-600 relative group">{{ 'NAVBAR.CONTACT' | translate }}<span class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span></a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-6 py-20">
        <!-- Hero Section -->
        <section class="text-center mb-20">
          <h1 class="text-6xl md:text-7xl font-black text-gray-900 mb-6">Liên hệ với chúng tôi</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">Chúng tôi luôn sẵn sàng hỗ trợ bạn với bất kỳ thắc mắc nào</p>
        </section>

        <!-- Contact Methods Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <!-- Phone -->
          <div class="group rounded-xl border border-gray-200 bg-white p-10 hover:shadow-lg hover:border-indigo-300 transition-all text-center">
            <div class="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
              <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Hotline</h3>
            <p class="text-indigo-600 font-bold text-lg mb-1">1900 1234 5678</p>
            <p class="text-sm text-gray-600">T2-T6: 9:00 AM - 6:00 PM</p>
          </div>

          <!-- Email -->
          <div class="group rounded-xl border border-gray-200 bg-white p-10 hover:shadow-lg hover:border-indigo-300 transition-all text-center">
            <div class="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
              <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p class="text-indigo-600 font-bold text-lg mb-1 break-all">contact@pro-re.com</p>
            <p class="text-sm text-gray-600">Phản hồi trong 24 giờ</p>
          </div>

          <!-- Address -->
          <div class="group rounded-xl border border-gray-200 bg-white p-10 hover:shadow-lg hover:border-indigo-300 transition-all text-center">
            <div class="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
              <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Địa chỉ</h3>
            <p class="font-semibold text-gray-900 mb-1">123 Đường Nguyễn Văn Linh</p>
            <p class="text-sm text-gray-600">Quận 1, TP.HCM, Việt Nam</p>
          </div>
        </div>

        <!-- CTA Section -->
        <section class="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-16 text-white text-center">
          <h2 class="text-4xl font-black mb-4">Khám phá thêm</h2>
          <p class="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">Tham khảo các bài viết hữu ích hoặc tham gia cộng đồng của chúng tôi</p>
          <div class="flex flex-wrap justify-center gap-4">
            <a routerLink="/blogs" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-all">Đọc blog</a>
            <a routerLink="/forum" class="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-all">Cộng đồng</a>
          </div>
        </section>
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
