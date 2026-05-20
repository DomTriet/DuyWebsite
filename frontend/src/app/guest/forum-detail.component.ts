import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100" *ngIf="post">
      <div class="max-w-4xl mx-auto px-6 py-16">
        <!-- Back Button -->
        <a routerLink="/forum" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-12 transition-colors group">
          <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Trở về cộng đồng
        </a>

        <!-- Post Content -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-10">
          <!-- Post Header -->
          <div class="p-8 md:p-10 border-b border-gray-100">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{{ post.title }}</h1>
            
            <!-- Author Info -->
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-4">
                <img [src]="post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + post.profiles?.username" class="w-14 h-14 rounded-full border-2 border-gray-100 object-cover">
                <div>
                  <p class="font-bold text-gray-900">{{ post.profiles?.username || 'Thành viên' }}</p>
                  <p class="text-sm text-gray-500">{{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
              
              <!-- Like Button -->
              <button (click)="toggleLike()" [ngClass]="{'bg-red-50 text-red-600': isLiked, 'text-gray-600 hover:text-red-600 hover:bg-red-50': !isLiked}" class="flex items-center gap-2 font-semibold transition-all px-4 py-2 rounded-lg border" [ngClass]="{'border-red-200': isLiked, 'border-gray-200': !isLiked}">
                <svg class="w-6 h-6" [attr.fill]="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                {{ isLiked ? 'Đã thích' : 'Thích' }}
              </button>
            </div>
          </div>

          <!-- Post Body -->
          <div class="p-8 md:p-10">
            <div class="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap mb-8">{{ post.content }}</div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="mb-10">
          <h3 class="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-5l-4 4z"></path></svg>
            Bình luận ({{ comments.length }})
          </h3>
          
          <!-- Comment Form -->
          <form [formGroup]="commentForm" (ngSubmit)="submitComment()" class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <textarea formControlName="content" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-gray-400 focus:outline-none transition-all" placeholder="Chia sẻ suy nghĩ của bạn..."></textarea>
            <div class="flex justify-end mt-4">
              <button type="submit" [disabled]="commentForm.invalid || isSubmitting" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ isSubmitting ? 'Đang gửi...' : 'Gửi bình luận' }}
              </button>
            </div>
          </form>

          <!-- Comments List -->
          <div class="space-y-6">
            <div *ngFor="let c of comments" class="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-start gap-4 mb-4">
                <img [src]="c.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + c.profiles?.username" class="w-12 h-12 rounded-full flex-shrink-0 border-2 border-gray-100 object-cover">
                <div class="flex-grow">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-gray-900">{{ c.profiles?.username }}</span>
                    <span class="text-xs text-gray-500">{{ c.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <p class="text-gray-800 leading-relaxed whitespace-pre-wrap">{{ c.content }}</p>
                </div>
              </div>
            </div>

            <!-- No Comments State -->
            <div *ngIf="comments.length === 0" class="text-center py-12">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-5l-4 4z"></path></svg>
              <p class="text-gray-600">Chưa có bình luận nào, hãy bình luận đầu tiên!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForumDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  post: any = null;
  comments: any[] = [];
  isLiked = false;
  isSubmitting = false;

  commentForm: FormGroup = this.fb.group({ content: ['', Validators.required] });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/forum/${id}`).subscribe({
        next: (res) => { this.post = res.data; this.cdr.markForCheck(); },
        error: () => { this.cdr.markForCheck(); }
      });
      this.api.get<any>(`/forum/${id}/comments`).subscribe({
        next: (res) => { this.comments = res.data || []; this.cdr.markForCheck(); },
        error: () => { this.cdr.markForCheck(); }
      });
    }
  }

  toggleLike() {
    this.isLiked = !this.isLiked; // Optimistic UI: Đổi UI ngay lập tức
    this.cdr.markForCheck();
    this.api.post(`/forum/${this.post.id}/react`, {}).subscribe({ 
      next: () => { this.cdr.markForCheck(); },
      error: () => { this.isLiked = !this.isLiked; this.cdr.markForCheck(); } 
    }); // Rollback nếu lỗi
  }

  submitComment() {
    if (this.commentForm.invalid) return;
    this.isSubmitting = true;
    this.api.post<any>(`/forum/${this.post.id}/comments`, this.commentForm.value).subscribe({
      next: (res) => {
        // Immutable array update + CDR ép UI làm mới ngay lập tức
        this.comments = [...this.comments, { ...res.data, profiles: { username: 'Bạn (Vừa xong)' }, created_at: new Date() }];
        this.commentForm.reset();
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      error: () => { alert('Lỗi gửi bình luận'); this.isSubmitting = false; this.cdr.markForCheck(); }
    });
  }
}
