import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto mt-8 px-4">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Cộng đồng thảo luận</h1>
          <p class="text-gray-500 mt-2">Nơi trao đổi, chia sẻ kinh nghiệm về bất động sản.</p>
        </div>
        <button (click)="goHome()" class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          🏠 Về trang chủ
        </button>
      </div>

      <!-- Form Đăng bài mới -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8" *ngIf="isLoggedIn">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Tạo bài viết mới</h2>
        
        <div *ngIf="successMsg" class="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200">
          {{ successMsg }}
        </div>
        <div *ngIf="errorMsg" class="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-200">
          {{ errorMsg }}
        </div>

        <form [formGroup]="postForm" (ngSubmit)="submitPost()">
          <div class="mb-4">
            <input formControlName="title" type="text" placeholder="Tiêu đề bài viết..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none">
          </div>
          <div class="mb-4">
            <textarea formControlName="content" rows="4" placeholder="Nội dung bài viết..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"></textarea>
          </div>
          <div class="flex justify-end">
            <button type="submit" [disabled]="postForm.invalid || isSubmitting" class="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {{ isSubmitting ? 'Đang gửi...' : 'Đăng bài' }}
            </button>
          </div>
        </form>
      </div>

      <div *ngIf="!isLoggedIn" class="bg-gray-50 rounded-xl p-6 mb-8 text-center border border-gray-200">
        <p class="text-gray-600 mb-4">Bạn cần đăng nhập để tham gia thảo luận cùng cộng đồng.</p>
        <a routerLink="/auth/login" class="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">Đăng nhập ngay</a>
      </div>

      <!-- Danh sách bài viết -->
      <div class="space-y-4">
        <div *ngIf="isLoading" class="animate-pulse space-y-4">
          <div *ngFor="let i of [1,2,3]" class="bg-gray-100 h-32 rounded-xl"></div>
        </div>

        <div *ngIf="!isLoading && posts.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
          Chưa có bài viết nào trên diễn đàn. Hãy là người đầu tiên!
        </div>

        <div *ngFor="let post of posts" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer" [routerLink]="['/forum', post.id]">
          <h3 class="text-xl font-bold text-gray-800 mb-2">{{ post.title }}</h3>
          <p class="text-gray-600 line-clamp-2 mb-4">{{ post.content }}</p>
          <div class="flex items-center text-sm text-gray-500 gap-4">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
                {{ (post.profiles?.full_name || 'U')[0] | uppercase }}
              </div>
              <span>{{ post.profiles?.full_name || 'Thành viên' }}</span>
            </div>
            <span>•</span>
            <span>{{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForumListComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  posts: any[] = [];
  isLoading = true;
  isSubmitting = false;
  successMsg = '';
  errorMsg = '';

  postForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required]
  });

  get isLoggedIn() { return !!this.authService.currentUser; }

  ngOnInit() { this.loadPosts(); }

  loadPosts() {
    this.isLoading = true;
    this.api.get<any>('/forum').subscribe({
      next: (res: any) => { this.posts = res.data || (Array.isArray(res) ? res : []); this.isLoading = false; this.cdr.detectChanges(); },
      error: (err: any) => { console.error('Lỗi tải forum posts:', err); this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  submitPost() {
    if (this.postForm.invalid) return;
    this.isSubmitting = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.api.post<any>('/forum', this.postForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMsg = 'Bài viết đã được gửi và đang chờ Ban quản trị phê duyệt.';
        this.postForm.reset();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMsg = err.error?.error || 'Không thể đăng bài lúc này. Vui lòng thử lại sau.';
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