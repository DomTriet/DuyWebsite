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
    <div class="max-w-7xl mx-auto px-4 py-12">
      <a routerLink="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Trở về trang chủ
      </a>

      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Tin tức & Chuyên trang Bất động sản</h1>
        <p class="text-lg text-gray-600">Cập nhật những thông tin thị trường, kinh nghiệm đầu tư mới nhất.</p>
      </div>

      <!-- Skeleton Loading -->
      <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="animate-pulse bg-gray-100 rounded-2xl h-80"></div>
      </div>

      <!-- Blog Grid -->
      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article *ngFor="let blog of blogs" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
          <a [routerLink]="['/blogs', blog.slug]" class="block relative h-56 overflow-hidden bg-gray-200">
            <!-- Tìm block image đầu tiên làm ảnh bìa -->
            <img *ngIf="getThumbnail(blog)" [ngSrc]="getThumbnail(blog)" width="600" height="400" priority class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt="Blog Thumbnail">
          </a>
          <div class="p-6">
            <p class="text-sm text-indigo-600 font-medium mb-2">{{ blog.created_at | date:'dd/MM/yyyy' }}</p>
            <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
              <a [routerLink]="['/blogs', blog.slug]">{{ blog.title }}</a>
            </h2>
          </div>
        </article>
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