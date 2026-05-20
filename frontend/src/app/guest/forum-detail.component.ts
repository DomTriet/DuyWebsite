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
    <div class="max-w-4xl mx-auto px-4 py-8" *ngIf="post">
      <!-- Back Button -->
      <a routerLink="/forum" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Trở về cộng đồng
      </a>

      <!-- Post Content -->
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ post.title }}</h1>
        <div class="flex items-center gap-4 mb-8 border-b pb-6">
          <img [src]="post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + post.profiles?.username" class="w-12 h-12 rounded-full">
          <div>
            <p class="font-bold text-gray-900">{{ post.profiles?.username || 'Thành viên' }}</p>
            <p class="text-sm text-gray-500">{{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
        </div>
        
        <div class="prose max-w-none text-gray-800 text-lg mb-8 whitespace-pre-wrap">{{ post.content }}</div>
        
        <!-- Optimistic UI Toggle Like -->
        <button (click)="toggleLike()" [ngClass]="{'text-red-500': isLiked, 'text-gray-500 hover:text-red-500': !isLiked}" class="flex items-center gap-2 font-medium transition-colors p-2 rounded-lg hover:bg-red-50">
          <svg class="w-6 h-6" [attr.fill]="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          {{ isLiked ? 'Đã thích' : 'Thích bài viết' }}
        </button>
      </div>

      <!-- Comments Section -->
      <h3 class="text-xl font-bold text-gray-900 mb-6">Bình luận ({{ comments.length }})</h3>
      
      <!-- Comment Form -->
      <form [formGroup]="commentForm" (ngSubmit)="submitComment()" class="mb-8 flex gap-4">
        <img src="https://ui-avatars.com/api/?name=You" class="w-10 h-10 rounded-full flex-shrink-0 hidden sm:block">
        <div class="flex-grow">
          <textarea formControlName="content" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Viết bình luận của bạn..."></textarea>
          <div class="flex justify-end mt-2">
            <button type="submit" [disabled]="commentForm.invalid || isSubmitting" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">Gửi bình luận</button>
          </div>
        </div>
      </form>

      <!-- Comments List -->
      <div class="space-y-6">
        <div *ngFor="let c of comments" class="flex gap-4 bg-gray-50 p-4 rounded-xl">
          <img [src]="c.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + c.profiles?.username" class="w-10 h-10 rounded-full flex-shrink-0">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900 text-sm">{{ c.profiles?.username }}</span>
              <span class="text-xs text-gray-500">{{ c.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <p class="text-gray-800 text-sm whitespace-pre-wrap">{{ c.content }}</p>
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