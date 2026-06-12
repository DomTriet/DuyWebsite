import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    @keyframes slideDown {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .alert-anim { animation: slideDown 0.2s ease; }
    .field-error { border-color: #ef4444 !important; }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-md">

        <!-- Back to home -->
        <a routerLink="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors group mb-8">
          <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Về trang chủ
        </a>

        <!-- Logo -->
        <div class="text-center mb-12">
          <h1 class="text-3xl font-black text-gray-900 mb-2" style="font-family:'Lora',Georgia,serif;letter-spacing:-0.02em;">Điểm Tâm BĐS</h1>
          <p class="text-gray-500 text-sm">Nền tảng bất động sản cao cấp</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          <h2 class="text-2xl font-black text-gray-900 mb-8 text-center">Đăng nhập</h2>

          <!-- Error Banner -->
          <div *ngIf="errorMessage" class="alert-anim flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 text-sm">
            <svg class="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
            <span class="flex-1">{{ errorMessage }}</span>
            <button (click)="errorMessage=''" class="text-red-400 hover:text-red-700 ml-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5" for="email">Email</label>
              <input formControlName="email" id="email" type="email"
                     [class.field-error]="f['email'].invalid && f['email'].touched"
                     (input)="errorMessage=''"
                     class="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                     placeholder="your@email.com">
              <p *ngIf="f['email'].invalid && f['email'].touched" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                {{ f['email'].errors?.['required'] ? 'Vui lòng nhập email' : 'Định dạng email không hợp lệ' }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-sm font-semibold text-gray-800" for="password">Mật khẩu</label>
                <a routerLink="/auth/forgot-password" class="text-xs text-gray-500 hover:text-gray-800 transition-colors">Quên mật khẩu?</a>
              </div>
              <div class="relative">
                <input formControlName="password" id="password"
                       [type]="showPwd ? 'text' : 'password'"
                       [class.field-error]="f['password'].invalid && f['password'].touched"
                       (input)="errorMessage=''"
                       class="w-full px-4 py-3 pr-11 min-h-[44px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                       placeholder="••••••••">
                <button type="button" (click)="showPwd=!showPwd"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  <svg *ngIf="!showPwd" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <svg *ngIf="showPwd" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                </button>
              </div>
              <p *ngIf="f['password'].invalid && f['password'].touched" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                {{ f['password'].errors?.['required'] ? 'Vui lòng nhập mật khẩu' : 'Mật khẩu tối thiểu 6 ký tự' }}
              </p>
            </div>

            <!-- Submit -->
            <button [disabled]="isLoading" type="submit"
                    class="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 min-h-[44px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-6">
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isLoading ? 'Đang xác thực...' : 'Đăng nhập' }}
            </button>
          </form>

          <!-- Links -->
          <p class="mt-8 text-center text-sm text-gray-500">
            Chưa có tài khoản?
            <a routerLink="/auth/register" class="text-gray-800 font-bold hover:text-gray-900 ml-1">Đăng ký ngay</a>
          </p>
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
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';
  showPwd = false;

  get f() { return this.loginForm.controls; }

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      if (user.role === 'admin' || user.role === 'agent') {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        const user = this.authService.currentUser;
        if (user?.role === 'admin' || user?.role === 'agent') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.mapLoginError(err);
      }
    });
  }

  private mapLoginError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    if (err.status === 429) return 'Quá nhiều lần thử đăng nhập. Vui lòng chờ vài phút rồi thử lại.';
    if (err.status === 401 || err.status === 400) {
      const msg = (err.error?.error || '').toLowerCase();
      if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong') || msg.includes('not found')) {
        return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      }
      if (msg.includes('disabled') || msg.includes('banned') || msg.includes('block')) {
        return 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.';
      }
      if (msg.includes('verify') || msg.includes('confirm') || msg.includes('email')) {
        return 'Vui lòng xác thực email trước khi đăng nhập.';
      }
    }
    if (err.status >= 500) return 'Lỗi hệ thống. Vui lòng thử lại sau ít phút.';
    return err.error?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
  }
}
