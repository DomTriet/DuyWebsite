import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-6">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-12">
          <h1 class="text-3xl font-black bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent mb-2">RESTATE</h1>
          <p class="text-gray-600">Quản lý bất động sản hiện đại</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
          <h2 class="text-2xl font-black text-gray-900 mb-8 text-center">Đăng nhập</h2>
          
          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {{ errorMessage }}
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2" for="email">Email</label>
              <input formControlName="email" id="email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="your@email.com">
              <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-600 text-xs mt-1.5">Email không hợp lệ</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2" for="password">Mật khẩu</label>
              <input formControlName="password" id="password" type="password" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="••••••••">
              <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-600 text-xs mt-1.5">Mật khẩu tối thiểu 6 ký tự</p>
            </div>

            <!-- Submit Button -->
            <button [disabled]="loginForm.invalid || isLoading" class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-8" type="submit">
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isLoading ? 'Đang xác thực...' : 'Đăng nhập' }}
            </button>
          </form>

          <!-- Links -->
          <div class="mt-8 space-y-4 text-center text-sm">
            <a routerLink="/auth/forgot-password" class="block text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Quên mật khẩu?</a>
            <p class="text-gray-600">Chưa có tài khoản? <a routerLink="/auth/register" class="text-indigo-600 font-bold hover:text-indigo-700">Đăng ký ngay</a></p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      if (user.role === 'admin' || user.role === 'agent') {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
        next: () => {
        this.isLoading = false;
          
          const user = this.authService.currentUser;
          const role = user?.role;
          
        if (role === 'admin' || role === 'agent') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']); // Về trang chủ nếu là khách
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
      }
    });
  }
}
