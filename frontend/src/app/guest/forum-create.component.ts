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
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div class="max-w-4xl mx-auto px-6 py-16">
        <!-- Back Button -->
        <a routerLink="/forum" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-12 transition-colors group">
          <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Trở về cộng đồng
        </a>

        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-5xl font-bold text-gray-900 mb-3">Viết bài mới</h1>
          <p class="text-xl text-gray-600">Chia sẻ kinh nghiệm và thảo luận với cộng đồng của chúng tôi</p>
        </div>

        <!-- Form -->
        <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-10">
          <!-- Title Field -->
          <div class="mb-8">
            <label for="title" class="block text-sm font-semibold text-gray-900 mb-3">Tiêu đề bài viết *</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400" 
              placeholder="VD: Kinh nghiệm đầu tư đất nền ven đô..."
            >
            <p *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="text-red-600 text-sm mt-2 flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
              Vui lòng nhập tiêu đề
            </p>
          </div>

          <!-- Content Field -->
          <div class="mb-8">
            <label for="content" class="block text-sm font-semibold text-gray-900 mb-3">Nội dung *</label>
            <textarea 
              id="content" 
              formControlName="content" 
              rows="12" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 resize-none" 
              placeholder="Chia sẻ kinh nghiệm, câu hỏi hoặc bất kỳ thông tin hữu ích nào..."
            ></textarea>
            <p *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched" class="text-red-600 text-sm mt-2 flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
              Vui lòng nhập nội dung
            </p>
            <p class="text-xs text-gray-500 mt-2">Lưu ý: Bài viết sẽ được duyệt trước khi công khai</p>
          </div>

          <!-- Submit Section -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-200">
            <a routerLink="/forum" class="text-gray-600 hover:text-gray-900 font-medium transition-colors">Hủy</a>
            <button 
              type="submit" 
              [disabled]="postForm.invalid || isSubmitting" 
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isSubmitting ? 'Đang gửi...' : 'Gửi bài viết' }}
            </button>
          </div>
        </form>

        <!-- Info Box -->
        <div class="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div class="flex gap-3">
            <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <p class="font-semibold text-blue-900 mb-1">Lưu ý</p>
              <p class="text-blue-800 text-sm">Vui lòng đảm bảo nội dung là có giá trị, lịch sự và không vi phạm các quy định của cộng đồng. Bài viết spam sẽ bị xóa.</p>
            </div>
          </div>
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
