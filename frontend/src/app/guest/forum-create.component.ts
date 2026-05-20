import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-forum-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <a routerLink="/forum" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Trở về cộng đồng
      </a>
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Viết bài mới</h1>

      <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết *</label>
          <input type="text" id="title" formControlName="title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="VD: Kinh nghiệm đầu tư đất nền ven đô...">
          <p *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="text-red-500 text-xs mt-1">Vui lòng nhập tiêu đề.</p>
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
          <textarea id="content" formControlName="content" rows="10" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="Chia sẻ kinh nghiệm của bạn..."></textarea>
          <p *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched" class="text-red-500 text-xs mt-1">Vui lòng nhập nội dung.</p>
        </div>
        <div class="flex justify-end">
          <button type="submit" [disabled]="postForm.invalid || isSubmitting" class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isSubmitting ? 'Đang gửi...' : 'Gửi bài viết' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class ForumCreateComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isSubmitting = false;
  postForm: FormGroup = this.fb.group({ title: ['', Validators.required], content: ['', Validators.required] });

  submitPost() {
    if (this.postForm.invalid) { this.postForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.api.post('/forum', this.postForm.value).subscribe({
      next: () => { alert('Bài viết của bạn đã được gửi và đang chờ duyệt. Cảm ơn bạn đã đóng góp!'); this.router.navigate(['/forum']); },
      error: (err) => { console.error(err); alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại. (Lưu ý: Bạn chỉ có thể đăng 1 bài/phút)'); this.isSubmitting = false; }
    });
  }
}