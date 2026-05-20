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
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">RESTATE</a>
          <div class="hidden md:flex gap-10 items-center">
            <a routerLink="/" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.HOME' | translate }}</a>
            <a routerLink="/about" class="text-sm font-semibold text-indigo-600">{{ 'NAVBAR.ABOUT' | translate }}</a>
            <a routerLink="/blogs" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a>
            <a routerLink="/forum" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.COMMUNITY' | translate }}</a>
            <a routerLink="/contact" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a>
          </div>
          <div class="flex items-center gap-4">
            <app-language-selector></app-language-selector>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-indigo-50 to-white py-24 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" class="h-full w-full"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
        </div>
        <div class="max-w-6xl mx-auto px-6 relative">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full mb-6">{{ 'NAVBAR.ABOUT' | translate }}</span>
            <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">Về chúng tôi</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Pro-RealEstate là nền tảng Bất động sản công nghệ cao, kết nối thông minh giữa người mua, người bán và các dự án chất lượng.</p>
          </div>
          <div class="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="w-full h-full object-cover" alt="About Us">
          </div>
        </div>
      </section>

      <!-- Core Values Section -->
      <section class="max-w-6xl mx-auto px-6 py-24">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black text-gray-900 mb-4">Giá trị cốt lõi</h2>
          <p class="text-lg text-gray-600">Ba trụ cột của sứ mệnh Pro-RealEstate</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="group rounded-xl border border-gray-200 bg-white p-8 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
            <div class="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
              <svg class="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Công nghệ</h3>
            <p class="text-gray-600 leading-relaxed">Ứng dụng AI và Machine Learning để tối ưu hóa trải nghiệm người dùng và cung cấp khuyến nghị cá nhân hóa.</p>
          </div>

          <div class="group rounded-xl border border-gray-200 bg-white p-8 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
            <div class="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
              <svg class="w-7 h-7 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Minh bạch</h3>
            <p class="text-gray-600 leading-relaxed">Độc lập, công khai và công bằng - mọi giao dịch được xác thực và báo cáo một cách rõ ràng.</p>
          </div>

          <div class="group rounded-xl border border-gray-200 bg-white p-8 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
            <div class="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <svg class="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">An toàn</h3>
            <p class="text-gray-600 leading-relaxed">Bảo vệ dữ liệu người dùng với mã hóa end-to-end và tuân thủ tiêu chuẩn bảo mật quốc tế.</p>
          </div>
        </div>
      </section>

      <!-- Mission & Vision -->
      <section class="bg-gray-50 py-24">
        <div class="max-w-6xl mx-auto px-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="group rounded-2xl border-2 border-gray-200 bg-white p-10 hover:border-indigo-600 transition-all duration-300">
              <span class="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg mb-6">SỨ MỆNH</span>
              <h3 class="text-3xl font-black text-gray-900 mb-6">Kết nối & Phát triển</h3>
              <p class="text-lg text-gray-600 leading-relaxed mb-6">Tập hợp các dự án bất động sản chất lượng cao, kết nối thông minh giữa các nhà đầu tư, nhà phát triển và khách hàng để tạo nên hệ sinh thái bất động sản minh bạch và công bằng.</p>
              <div class="w-1 h-1 rounded-full bg-indigo-600"></div>
            </div>

            <div class="group rounded-2xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-600 to-indigo-700 p-10 shadow-xl">
              <span class="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-bold rounded-lg mb-6">TẦM NHÌN</span>
              <h3 class="text-3xl font-black text-white mb-6">Dẫn đầu Đông Nam Á</h3>
              <p class="text-lg text-indigo-100 leading-relaxed mb-6">Trở thành nền tảng bất động sản hàng đầu Đông Nam Á, cung cấp giải pháp toàn diện cho tất cả nhu cầu bất động sản của khách hàng với công nghệ tự động hóa cao.</p>
              <div class="w-1 h-1 rounded-full bg-white/50"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Section (Optional) -->
      <section class="max-w-6xl mx-auto px-6 py-24">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black text-gray-900 mb-4">Đội ngũ của chúng tôi</h2>
          <p class="text-lg text-gray-600">Những chuyên gia tận tâm với bất động sản</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div *ngFor="let i of [1,2,3]" class="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-300">
            <div class="h-64 bg-gradient-to-br from-indigo-400 to-indigo-600 relative overflow-hidden">
              <div class="w-full h-full flex items-center justify-center text-6xl text-white/30">👤</div>
            </div>
            <div class="p-6">
              <h4 class="text-lg font-bold text-gray-900">Chuyên gia {{i}}</h4>
              <p class="text-sm text-gray-600 mt-1">Lĩnh vực bất động sản</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-indigo-600 text-white py-20">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-4xl font-black mb-4">Bắt đầu ngay hôm nay</h2>
          <p class="text-xl text-indigo-100 mb-8">Khám phá hàng ngàn bất động sản chất lượng</p>
          <a routerLink="/" class="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-50 transition-all">Xem dự án</a>
        </div>
      </section>
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
