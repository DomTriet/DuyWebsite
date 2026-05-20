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
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">RESTATE</a>
          <a routerLink="/forum" class="inline-flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-semibold transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại
          </a>
        </div>
      </nav>

      <div class="max-w-4xl mx-auto px-6 py-20">
        <!-- Header -->
        <div class="mb-16">
          <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-4">Viết bài mới</h1>
          <p class="text-lg text-gray-600">Chia sẻ kinh nghiệm và thảo luận với cộng đồng</p>
        </div>

        <!-- Form -->
        <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="bg-white rounded-2xl border border-gray-200 p-10 shadow-lg">
          <!-- Title -->
          <div class="mb-6">
            <label for="title" class="block text-sm font-semibold text-gray-900 mb-2">Tiêu đề</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title" 
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
              placeholder="Tiêu đề bài viết..."
            >
            <p *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="text-red-600 text-xs mt-1.5">Vui lòng nhập tiêu đề</p>
          </div>

          <!-- Content -->
          <div class="mb-8">
            <label for="content" class="block text-sm font-semibold text-gray-900 mb-2">Nội dung</label>
            <textarea 
              id="content" 
              formControlName="content" 
              rows="10" 
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none" 
              placeholder="Chia sẻ kinh nghiệm hoặc câu hỏi của bạn..."
            ></textarea>
            <p *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched" class="text-red-600 text-xs mt-1.5">Vui lòng nhập nội dung</p>
            <p class="text-xs text-gray-500 mt-2">Bài viết sẽ được duyệt trước khi công khai</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <a routerLink="/forum" class="text-gray-600 hover:text-gray-900 font-medium transition-colors">Hủy</a>
            <button 
              type="submit" 
              [disabled]="postForm.invalid || isSubmitting" 
              class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
            >
              <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isSubmitting ? 'Đang gửi...' : 'Gửi bài viết' }}
            </button>
          </div>
        </form>

        <!-- Guidelines -->
        <div class="mt-12 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <p class="font-semibold text-indigo-900 mb-2">Hướng dẫn đăng bài</p>
          <ul class="text-sm text-indigo-800 space-y-1">
            <li>• Nội dung phải lịch sự và có giá trị</li>
            <li>• Không spam hoặc quảng cáo trái phép</li>
            <li>• Tuân thủ quy định của cộng đồng</li>
          </ul>
        </div>
      </div>
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
