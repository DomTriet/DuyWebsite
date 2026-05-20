import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-12">
          <h1 class="text-3xl font-black bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent mb-2">RESTATE</h1>
          <p class="text-gray-600">Quản lý bất động sản hiện đại</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
          <h2 class="text-2xl font-black text-gray-900 mb-8 text-center">Đăng ký tài khoản</h2>
          
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {{ successMessage }}
          </div>

          <form *ngIf="!successMessage" [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Họ và tên</label>
              <input formControlName="full_name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="Nguyễn Văn A">
              <p *ngIf="registerForm.get('full_name')?.invalid && registerForm.get('full_name')?.touched" class="text-red-600 text-xs mt-1.5">Vui lòng nhập tên</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input formControlName="email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="your@email.com">
              <p *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-red-600 text-xs mt-1.5">Email không hợp lệ</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Mật khẩu</label>
              <input formControlName="password" type="password" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="••••••••">
              <p *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-red-600 text-xs mt-1.5">Mật khẩu tối thiểu 6 ký tự</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Xác nhận mật khẩu</label>
              <input formControlName="confirm_password" type="password" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="••••••••">
              <p *ngIf="registerForm.errors?.['mismatch'] && registerForm.get('confirm_password')?.touched" class="text-red-600 text-xs mt-1.5">Mật khẩu không khớp</p>
            </div>

            <!-- Submit Button -->
            <button type="submit" [disabled]="registerForm.invalid || isLoading" class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-8">
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
            </button>

            <!-- Login Link -->
            <p class="text-center text-sm text-gray-600 pt-4">Đã có tài khoản? <a routerLink="/auth/login" class="text-indigo-600 font-bold hover:text-indigo-700">Đăng nhập</a></p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  registerForm: FormGroup = this.fb.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirm_password')?.value ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges(); // Ép UI cập nhật trạng thái Loading

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Đăng ký thành công! Đang tự động chuyển hướng đến trang đăng nhập...';
        this.registerForm.reset();
        this.cdr.detectChanges(); // Ép UI hiện màu xanh thành công

        // Chờ 3 giây để người dùng đọc thông báo rồi tự động redirect
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        // Kiểm tra lỗi trùng email từ API
        if (err.status === 400 || err.error?.message?.includes('registered')) {
          this.errorMessage = 'Email này đã được đăng ký hoặc không hợp lệ.';
        } else {
          this.errorMessage = err.error?.error || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.';
        }
        this.cdr.detectChanges(); // Ép UI hiện màu đỏ báo lỗi
      }
    });
  }
}
