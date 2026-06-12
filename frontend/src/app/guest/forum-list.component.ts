import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <!-- Back Button -->
        <a routerLink="/" class="inline-flex items-center text-gray-500 hover:text-gray-900 font-semibold mb-10 sm:mb-12 transition-colors group">
          <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ 'FORUM_PAGE.BACK_HOME' | translate }}
        </a>

        <!-- Header Section -->
        <div class="flex justify-between items-start md:items-center gap-6 mb-12 flex-col md:flex-row">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{{ 'FORUM_PAGE.TITLE' | translate }}</h1>
            <p class="text-gray-600 text-lg">{{ 'FORUM_PAGE.SUB' | translate }}</p>
          </div>
          <a routerLink="/forum/create" style="background:#0D0D0D; color:#F7F6F3; padding:12px 22px; border-radius:8px; font-weight:700; font-size:0.875rem; text-decoration:none; white-space:nowrap; transition:background 0.2s; min-height:44px; display:inline-flex; align-items:center;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">{{ 'FORUM_PAGE.NEW_POST' | translate }}</a>
        </div>

        <!-- Forum Posts -->
        <div class="space-y-6">
          <div *ngFor="let post of posts" class="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-0.5">
            <!-- Post Header -->
            <div class="p-4 sm:p-6 border-b border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <img [src]="post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + post.profiles?.username" class="w-12 h-12 rounded-full bg-gray-200 object-cover border-2 border-gray-100">
                  <div>
                    <p class="font-semibold text-gray-900">{{ post.profiles?.username || ('FORUM_PAGE.MEMBER' | translate) }}</p>
                    <p class="text-xs text-gray-500">{{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Post Content -->
              <a [routerLink]="['/forum', post.id]" class="block group">
                <h2 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors line-clamp-2">{{ post.title }}</h2>
                <p class="text-gray-600 line-clamp-3 text-base leading-relaxed">{{ post.content }}</p>
              </a>
            </div>

            <!-- Post Footer -->
            <div class="px-4 sm:px-6 py-3 bg-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-2 sm:gap-6">
                <span class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors text-sm font-medium min-h-[44px] px-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  {{ 'FORUM_PAGE.LIKE' | translate }}
                </span>
                <a [routerLink]="['/forum', post.id]" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium min-h-[44px] px-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  {{ 'FORUM_PAGE.COMMENT' | translate }}
                </a>
              </div>
              <a [routerLink]="['/forum', post.id]" style="color:#374151; font-weight:700; font-size:0.8rem; text-decoration:none; min-height:44px; display:inline-flex; align-items:center; padding:0 4px;" onmouseover="this.style.color='#0D0D0D'" onmouseout="this.style.color='#374151'">{{ 'FORUM_PAGE.VIEW_DETAIL' | translate }} →</a>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="posts.length === 0" class="text-center py-16">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-5l-4 4z"></path></svg>
            <p class="text-gray-600 text-lg">{{ 'FORUM_PAGE.EMPTY' | translate }}</p>
            <a routerLink="/forum/create" style="margin-top:24px; display:inline-block; background:#0D0D0D; color:#F7F6F3; padding:12px 22px; border-radius:8px; font-weight:700; font-size:0.875rem; text-decoration:none;">{{ 'FORUM_PAGE.NEW_POST' | translate }}</a>
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
      desc: 'Tham gia Cộng đồng Điểm Tâm BĐS để cùng chia sẻ, thảo luận và đánh giá các dự án Bất động sản trên toàn quốc.'
    });

    this.api.get<any>('/forum').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { this.posts = res.data || []; this.cdr.markForCheck(); },
      error: () => { this.cdr.markForCheck(); }
    }); 
  }
}
