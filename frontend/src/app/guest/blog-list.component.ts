import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">RESTATE</a>
          <a routerLink="/" class="inline-flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-semibold transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại
          </a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <span class="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full mb-6">Tin tức & Chuyên trang</span>
          <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-6">Cập nhật bất động sản</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">Những insight và kinh nghiệm từ thị trường bất động sản Việt Nam</p>
        </div>
      </section>

      <!-- Content -->
      <section class="max-w-6xl mx-auto px-6 py-20">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="rounded-xl overflow-hidden bg-gray-100 h-80 animate-pulse"></div>
        </div>

        <!-- Blog Grid -->
        <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article 
            *ngFor="let blog of blogs; let i = index" 
            class="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:border-indigo-300 transition-all duration-300"
            [style.animation]="'fadeInUp 0.5s ease-out ' + (i * 0.05) + 's backwards'">
            
            <!-- Thumbnail -->
            <a [routerLink]="['/blogs', blog.slug]" class="block relative h-56 overflow-hidden bg-gray-200">
              <img *ngIf="getThumbnail(blog)" [ngSrc]="getThumbnail(blog)" width="600" height="400" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Blog">
              <div *ngIf="!getThumbnail(blog)" class="w-full h-full bg-gradient-to-br from-indigo-200 to-indigo-100 flex items-center justify-center">
                <svg class="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </a>

            <!-- Content -->
            <div class="p-6 flex flex-col h-full">
              <div class="flex items-center gap-3 mb-4">
                <time class="text-xs font-semibold text-gray-500 uppercase">{{ blog.created_at | date:'dd/MM/yyyy' }}</time>
                <span class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 font-bold rounded">Tin tức</span>
              </div>
              <a [routerLink]="['/blogs', blog.slug]">
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3">{{ blog.title }}</h3>
              </a>
              <p class="text-gray-600 text-sm line-clamp-2 flex-grow mb-5">Cập nhật tin tức, kinh nghiệm và hướng dẫn chi tiết</p>
              <a [routerLink]="['/blogs', blog.slug]" class="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors group/link">
                Đọc bài
                <svg class="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </a>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && blogs.length === 0" class="text-center py-20">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v4m6 0a2 2 0 01-2-2V8a2 2 0 012-2h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 00-.293.707V20a2 2 0 01-2 2z"></path></svg>
          <p class="text-gray-600 text-lg">Chưa có bài viết nào</p>
        </div>
      </section>
    </div>
  `
})
export class BlogListComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  blogs: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.seoService.setMeta({
      title: 'Tin tức Bất động sản',
      desc: 'Cập nhật những thông tin thị trường, dự án và kinh nghiệm đầu tư Bất động sản mới nhất.',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    });

    this.api.get<any>('/blogs').subscribe({
      next: (res) => { this.blogs = res.data || []; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  getThumbnail(blog: any): string {
    const imageBlock = blog.content_blocks?.find((b: any) => b.type === 'image');
    return imageBlock ? imageBlock.value : 'https://via.placeholder.com/600x400?text=No+Image';
  }
}
