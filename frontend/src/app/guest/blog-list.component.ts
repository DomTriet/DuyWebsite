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
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <!-- Back Button -->
        <a routerLink="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-12 transition-colors group">
          <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Trở về trang chủ
        </a>

        <!-- Header Section -->
        <div class="text-center mb-16">
          <h1 class="text-5xl font-bold text-gray-900 mb-4">Tin tức & Chuyên trang</h1>
          <p class="text-xl text-gray-600">Cập nhật những thông tin thị trường, dự án và kinh nghiệm đầu tư bất động sản mới nhất.</p>
        </div>

        <!-- Skeleton Loading -->
        <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="animate-pulse">
            <div class="bg-gray-200 rounded-2xl h-56 mb-4"></div>
            <div class="bg-gray-200 rounded h-4 w-24 mb-3"></div>
            <div class="bg-gray-200 rounded h-6 w-3/4 mb-2"></div>
            <div class="bg-gray-200 rounded h-4 w-full"></div>
          </div>
        </div>

        <!-- Blog Grid -->
        <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let blog of blogs" class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <!-- Thumbnail -->
            <a [routerLink]="['/blogs', blog.slug]" class="block relative h-56 overflow-hidden bg-gray-200">
              <img *ngIf="getThumbnail(blog)" [ngSrc]="getThumbnail(blog)" width="600" height="400" priority class="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" alt="Blog Thumbnail">
            </a>

            <!-- Content -->
            <div class="p-6 flex flex-col h-full">
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-block w-2 h-2 bg-indigo-600 rounded-full"></span>
                <p class="text-sm text-gray-500 font-medium">{{ blog.created_at | date:'dd/MM/yyyy' }}</p>
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                <a [routerLink]="['/blogs', blog.slug]">{{ blog.title }}</a>
              </h2>
              <p class="text-gray-600 text-sm line-clamp-2 flex-grow mb-4">Bật mí những kinh nghiệm quý báu từ các chuyên gia bất động sản</p>
              <a [routerLink]="['/blogs', blog.slug]" class="inline-flex items-center text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors group/link">
                Đọc thêm
                <svg class="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </a>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && blogs.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v4m6 0a2 2 0 01-2-2V8a2 2 0 012-2h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 00-.293.707V20a2 2 0 01-2 2z"></path></svg>
          <p class="text-gray-600 text-lg">Chưa có bài viết nào</p>
        </div>
      </div>
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
