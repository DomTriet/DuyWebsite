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
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">RESTATE</a>
          <a routerLink="/forum/create" class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all">Viết bài</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-indigo-50 to-white py-20 px-6">
        <div class="max-w-6xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-6">Cộng đồng thảo luận</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">Chia sẻ kinh nghiệm, đặt câu hỏi và thảo luận về bất động sản cùng cộng đồng</p>
        </div>
      </section>

      <!-- Content -->
      <section class="max-w-6xl mx-auto px-6 py-20">
        <!-- Posts List -->
        <div class="space-y-6">
          <div 
            *ngFor="let post of posts; let i = index" 
            class="group rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-indigo-300 transition-all duration-300 overflow-hidden"
            [style.animation]="'fadeInUp 0.5s ease-out ' + (i * 0.05) + 's backwards'">
            
            <!-- Post Body -->
            <div class="p-8">
              <!-- Author & Date -->
              <div class="flex items-center gap-3 mb-4">
                <img [src]="post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + post.profiles?.username" class="w-10 h-10 rounded-full object-cover">
                <div class="text-sm">
                  <p class="font-semibold text-gray-900">{{ post.profiles?.username || 'Member' }}</p>
                  <p class="text-gray-500">{{ post.created_at | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>

              <!-- Title & Content -->
              <a [routerLink]="['/forum', post.id]" class="block mb-4 group/link">
                <h2 class="text-2xl font-bold text-gray-900 group-hover/link:text-indigo-600 transition-colors mb-2 line-clamp-2">{{ post.title }}</h2>
                <p class="text-gray-600 line-clamp-3">{{ post.content }}</p>
              </a>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center gap-6 text-sm text-gray-600">
                  <span class="flex items-center gap-2 hover:text-indigo-600 cursor-pointer transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    Like
                  </span>
                  <a [routerLink]="['/forum', post.id]" class="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Comment
                  </a>
                </div>
                <a [routerLink]="['/forum', post.id]" class="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">View →</a>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="posts.length === 0" class="text-center py-20">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-5l-4 4z"></path></svg>
            <p class="text-gray-600 text-lg mb-6">Chưa có bài viết nào</p>
            <a routerLink="/forum/create" class="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all">Viết bài đầu tiên</a>
          </div>
        </div>
      </section>
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
