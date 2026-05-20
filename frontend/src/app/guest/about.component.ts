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
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <!-- Navbar -->
      <nav class="bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div class="flex items-center gap-10">
          <a routerLink="/" class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent tracking-tighter">PRO</a>
          <div class="hidden md:flex gap-8 font-medium text-gray-600">
            <a routerLink="/" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.HOME' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/about" class="text-indigo-600 relative group">{{ 'NAVBAR.ABOUT' | translate }}<span class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span></a>
            <a routerLink="/blogs" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.NEWS' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/forum" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.COMMUNITY' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
            <a routerLink="/contact" class="hover:text-indigo-600 transition-colors relative group">{{ 'NAVBAR.CONTACT' | translate }}<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span></a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <app-language-selector></app-language-selector>
        </div>
      </nav>

      <div class="max-w-5xl mx-auto px-6 py-20">
        <!-- Header Section -->
        <div class="text-center mb-16">
          <h1 class="text-5xl font-bold text-gray-900 mb-6">{{ 'NAVBAR.ABOUT' | translate }}</h1>
          <p class="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Pro-RealEstate là nền tảng Bất động sản công nghệ cao, cung cấp các giải pháp kết nối người mua và người bán thông minh, minh bạch và an toàn.
          </p>
        </div>

        <!-- Featured Image -->
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="w-full rounded-3xl shadow-xl mb-16 object-cover h-96" alt="About Us">

        <!-- Content Sections -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div class="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Công nghệ hiện đại</h3>
            <p class="text-gray-600 leading-relaxed">Ứng dụng các công nghệ AI và Machine Learning để tối ưu hóa trải nghiệm người dùng.</p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Giá cạnh tranh</h3>
            <p class="text-gray-600 leading-relaxed">Cam kết cung cấp dịch vụ chất lượng cao với giá cạnh tranh nhất trên thị trường.</p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Đáng tin cậy</h3>
            <p class="text-gray-600 leading-relaxed">Minh bạch, an toàn và đáng tin cậy - những giá trị cốt lõi của Pro-RealEstate.</p>
          </div>
        </div>

        <!-- Mission & Vision -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <div class="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-8 border border-indigo-100">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Sứ mệnh</h3>
            <p class="text-gray-700 text-lg leading-relaxed">Tập hợp các dự án bất động sản chất lượng cao, kết nối thông minh giữa các nhà đầu tư, nhà phát triển và khách hàng cuối cùng để tạo nên một hệ sinh thái bất động sản minh bạch và công bằng.</p>
          </div>

          <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h3 class="text-2xl font-bold mb-4">Tầm nhìn</h3>
            <p class="text-indigo-100 text-lg leading-relaxed">Trở thành nền tảng bất động sản hàng đầu Đông Nam Á, cung cấp giải pháp toàn diện cho tất cả nhu cầu bất động sản của khách hàng với công nghệ tự động hóa cao.</p>
          </div>
        </div>
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
