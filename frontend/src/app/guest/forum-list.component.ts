import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <a routerLink="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Trở về trang chủ
      </a>

      <div class="flex justify-between items-center mb-8 border-b pb-4">
        <h1 class="text-3xl font-bold text-gray-900">Cộng đồng & Thảo luận</h1>
        <a routerLink="/forum/create" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Viết bài mới</a>
      </div>

      <div class="space-y-6">
        <div *ngFor="let post of posts" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
          <div class="flex items-center gap-3 mb-4">
            <img [src]="post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + post.profiles?.username" class="w-10 h-10 rounded-full bg-gray-200">
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ post.profiles?.username || 'Thành viên' }}</p>
              <p class="text-xs text-gray-500">{{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
          
          <a [routerLink]="['/forum', post.id]" class="block group">
            <h2 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">{{ post.title }}</h2>
            <p class="text-gray-600 line-clamp-3 mb-4">{{ post.content }}</p>
          </a>
          
          <div class="flex items-center gap-6 text-sm font-medium text-gray-500">
            <span class="flex items-center gap-1 hover:text-indigo-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              Like
            </span>
            <a [routerLink]="['/forum', post.id]" class="flex items-center gap-1 hover:text-indigo-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Bình luận
            </a>
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
  posts: any[] = [];
  ngOnInit() { 
    this.seoService.setMeta({
      title: 'Cộng đồng thảo luận',
      desc: 'Tham gia Cộng đồng Pro-RealEstate để cùng chia sẻ, thảo luận và đánh giá các dự án Bất động sản trên toàn quốc.'
    });

    this.api.get<any>('/forum').subscribe({
      next: res => { this.posts = res.data || []; this.cdr.markForCheck(); },
      error: () => { this.cdr.markForCheck(); }
    }); 
  }
}