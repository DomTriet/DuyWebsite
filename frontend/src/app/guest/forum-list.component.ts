import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div class="max-w-5xl mx-auto px-6 py-16">
        <!-- Back Button -->
        <a routerLink="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-12 transition-colors group">
          <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Trở về trang chủ
        </a>

        <!-- Header Section -->
        <div class="flex justify-between items-start md:items-center gap-6 mb-12 flex-col md:flex-row">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Cộng đồng & Thảo luận</h1>
            <p class="text-gray-600 text-lg">Chia sẻ kinh nghiệm và thảo luận với cộng đồng</p>
          </div>
          <a routerLink="/forum/create" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg whitespace-nowrap">Viết bài mới</a>
        </div>

        <!-- Forum Posts -->
        <div class="space-y-6">
          <div *ngFor="let post of posts" class="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-0.5">
            <!-- Post Header -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <img [src]="post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + post.profiles?.username" class="w-12 h-12 rounded-full bg-gray-200 object-cover border-2 border-gray-100">
                  <div>
                    <p class="font-semibold text-gray-900">{{ post.profiles?.username || 'Thành viên' }}</p>
                    <p class="text-xs text-gray-500">{{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Post Content -->
              <a [routerLink]="['/forum', post.id]" class="block group">
                <h2 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">{{ post.title }}</h2>
                <p class="text-gray-600 line-clamp-3 text-base leading-relaxed">{{ post.content }}</p>
              </a>
            </div>

            <!-- Post Footer -->
            <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-6">
                <span class="flex items-center gap-2 text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors text-sm font-medium">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  Thích
                </span>
                <a [routerLink]="['/forum', post.id]" class="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  Bình luận
                </a>
              </div>
              <a [routerLink]="['/forum', post.id]" class="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">Xem chi tiết →</a>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="posts.length === 0" class="text-center py-16">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-5l-4 4z"></path></svg>
            <p class="text-gray-600 text-lg">Chưa có bài viết nào, hãy viết bài đầu tiên!</p>
            <a routerLink="/forum/create" class="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">Viết bài mới</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForumListComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);
  posts: any[] = [];
  ngOnInit() { 
    this.seoService.setMeta({
      title: 'Cộng đồng thảo luận',
      desc: 'Tham gia Cộng đồng Pro-RealEstate để cùng chia sẻ, thảo luận và đánh giá các dự án Bất động sản trên toàn quốc.'
    });

    this.api.get<any>('/forum').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { this.posts = res.data || []; this.cdr.markForCheck(); },
      error: () => { this.cdr.markForCheck(); }
    }); 
  }
}
