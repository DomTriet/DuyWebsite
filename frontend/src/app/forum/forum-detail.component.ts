import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" style="font-family:'Lora',Georgia,serif;font-size:1.1rem;font-weight:700;letter-spacing:-0.02em;color:#0D0D0D;text-decoration:none;">Điểm Tâm BĐS</a>
          <a routerLink="/forum" class="inline-flex items-center gap-2 text-gray-700 hover:text-gray-700 font-semibold transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại
          </a>
        </div>
      </nav>

      <!-- Loading -->
      <div *ngIf="isLoading" class="max-w-4xl mx-auto px-6 py-20">
        <div class="animate-pulse space-y-6">
          <div class="h-10 bg-gray-200 rounded-xl w-2/3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          <div class="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <!-- Not Found -->
      <div *ngIf="!isLoading && !post" class="max-w-4xl mx-auto px-6 py-20 text-center">
        <p class="text-gray-600 text-lg">Không tìm thấy bài viết</p>
      </div>

      <!-- Post Detail -->
      <div *ngIf="!isLoading && post" class="max-w-4xl mx-auto px-6 py-12">
        <!-- Post Header -->
        <article class="mb-16">
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-6">{{ post.title }}</h1>
          <div class="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
                {{ (post.profiles?.full_name || 'U')[0] | uppercase }}
              </div>
              <div>
                <p class="font-bold text-gray-900">{{ post.profiles?.full_name || 'Thành viên' }}</p>
                <p class="text-sm text-gray-500">{{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <div class="py-8 text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
            {{ post.content }}
          </div>

          <!-- Interactions -->
          <div class="flex items-center gap-3 pt-6 border-t border-gray-200">
            <button (click)="toggleReact()" [disabled]="!isLoggedIn || isReacting" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all" [ngClass]="hasReacted ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              <svg class="w-5 h-5" [attr.fill]="hasReacted ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              {{ hasReacted ? 'Đã thích' : 'Thích' }}
            </button>
            
            <button *ngIf="isLoggedIn" (click)="showReportForm = !showReportForm" class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Báo cáo
            </button>
          </div>

          <!-- Report Form -->
          <div *ngIf="showReportForm" class="mt-6 p-5 bg-red-50 rounded-xl border border-red-200">
            <h4 class="text-sm font-bold text-red-900 mb-3">Báo cáo bài viết</h4>
            <textarea [(ngModel)]="reportReason" rows="3" placeholder="Lý do báo cáo..." class="w-full px-4 py-3 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4"></textarea>
            <div class="flex justify-end gap-2">
              <button (click)="showReportForm = false" class="px-4 py-2 text-sm text-gray-600 hover:bg-red-100 rounded-lg transition-colors">Hủy</button>
              <button (click)="submitReport()" [disabled]="!reportReason.trim()" class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition-all">Gửi báo cáo</button>
            </div>
          </div>
        </article>

        <!-- Comments Section -->
        <section class="mt-16">
          <h2 class="text-2xl font-black text-gray-900 mb-8">Bình luận ({{ comments.length }})</h2>

          <!-- Comment Form -->
          <div *ngIf="isLoggedIn" class="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-10">
            <form [formGroup]="commentForm" (ngSubmit)="submitComment()">
              <textarea formControlName="content" rows="4" placeholder="Viết bình luận của bạn..." class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all mb-4 resize-none"></textarea>
              <div class="flex justify-end">
                <button type="submit" [disabled]="commentForm.invalid || isCommenting" class="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2">
                  <span *ngIf="isCommenting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {{ isCommenting ? 'Đang gửi...' : 'Gửi bình luận' }}
                </button>
              </div>
            </form>
          </div>
          
          <div *ngIf="!isLoggedIn" class="bg-gray-50 rounded-xl border border-gray-300 p-6 mb-10 text-center">
            <p class="text-gray-700">
              <a routerLink="/auth/login" class="text-gray-700 font-bold hover:text-gray-900">Đăng nhập</a> để tham gia bình luận
            </p>
          </div>

          <!-- Comments List -->
          <div class="space-y-5">
            <div *ngFor="let comment of comments" class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold flex-shrink-0">
                  {{ (comment.profiles?.full_name || 'U')[0] | uppercase }}
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-bold text-gray-900">{{ comment.profiles?.full_name || 'Thành viên' }}</p>
                      <p class="text-xs text-gray-500 mt-0.5">{{ comment.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                  </div>
                  <p class="text-gray-700 mt-3 whitespace-pre-wrap leading-relaxed">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class ForumDetailComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  post: any = null;
  comments: any[] = [];
  isLoading = true;
  isCommenting = false;
  isReacting = false;
  hasReacted = false;
  showReportForm = false;
  reportReason = '';

  commentForm: FormGroup = this.fb.group({
    content: ['', Validators.required]
  });

  get isLoggedIn() { return !!this.authService.currentUser; }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPostData(id);
      }
    });
  }

  loadPostData(id: string) {
    this.isLoading = true;
    this.api.get<any>(`/forum/${id}`).subscribe({
      next: (res: any) => {
        this.post = res.data || res;
        this.loadComments(id);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadComments(postId: string) {
    this.api.get<any>(`/forum/${postId}/comments`).subscribe({
      next: (res: any) => {
        this.comments = res.data || (Array.isArray(res) ? res : []);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitComment() {
    if (this.commentForm.invalid || !this.post) return;
    this.isCommenting = true;

    this.api.post<any>(`/forum/${this.post.id}/comments`, this.commentForm.value).subscribe({
      next: () => {
        this.isCommenting = false;
        this.commentForm.reset();
        this.loadComments(this.post.id);
      },
      error: (err: any) => {
        this.isCommenting = false;
        this.toast.error(err.error?.error || 'Lỗi khi gửi bình luận.');
        this.cdr.detectChanges();
      }
    });
  }

  toggleReact() {
    if (!this.post) return;
    this.isReacting = true;
    this.api.post<any>(`/forum/${this.post.id}/react`, {}).subscribe({
      next: () => {
        this.hasReacted = !this.hasReacted;
        this.isReacting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isReacting = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReport() {
    if (!this.post || !this.reportReason.trim()) return;
    this.api.post<any>(`/forum/${this.post.id}/report`, { reason: this.reportReason }).subscribe({
      next: () => {
        this.toast.success('Cảm ơn bạn đã báo cáo. Ban quản trị sẽ xem xét sớm nhất.');
        this.showReportForm = false;
        this.reportReason = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toast.error(err.error?.error || 'Lỗi khi gửi báo cáo.');
        this.cdr.detectChanges();
      }
    });
  }

  goHome() {
    const user = this.authService.currentUser;
    if (user && (user.role === 'admin' || user.role === 'agent')) {
      this.router.navigate(['/admin/properties-manage']);
    } else if (user && user.role === 'member') {
      this.router.navigate(['/admin/account-settings']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
