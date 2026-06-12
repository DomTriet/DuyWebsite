import { Component, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
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

          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-2">Quên mật khẩu?</h2>
            <p class="text-sm text-gray-500">Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
          </div>

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

          <!-- Success Banner -->
          <div *ngIf="successMessage" class="alert-anim flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl mb-6 text-sm">
            <svg class="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="font-semibold">Email đã được gửi!</p>
              <p class="mt-0.5 text-emerald-700">Vui lòng kiểm tra hộp thư đến (kể cả thư mục <strong>Spam / Junk</strong>) và làm theo hướng dẫn.</p>
            </div>
          </div>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5" for="email">Email tài khoản</label>
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

            <!-- Submit -->
            <button [disabled]="isLoading || countdown > 0" type="submit"
                    class="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 min-h-[44px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2">
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <ng-container *ngIf="isLoading">Đang gửi yêu cầu...</ng-container>
              <ng-container *ngIf="!isLoading && countdown === 0">Gửi liên kết đặt lại mật khẩu</ng-container>
              <ng-container *ngIf="!isLoading && countdown > 0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Gửi lại sau {{ countdown }}s
              </ng-container>
            </button>
          </form>

          <!-- Hints -->
          <div *ngIf="successMessage" class="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-xs text-gray-500 font-semibold mb-1">Không nhận được email?</p>
            <ul class="text-xs text-gray-500 space-y-1 list-disc list-inside">
              <li>Kiểm tra thư mục <strong>Spam / Junk</strong></li>
              <li>Đảm bảo địa chỉ email nhập đúng</li>
              <li>{{ countdown > 0 ? 'Gửi lại sau ' + countdown + 's' : 'Nhấn "Gửi lại" để thử lần nữa' }}</li>
            </ul>
          </div>

          <!-- Back -->
          <div class="text-center text-sm mt-8">
            <a routerLink="/auth/login" class="text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-1.5 font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              Quay lại đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get f() { return this.forgotForm.controls; }

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  countdown = 0;

  private countdownSub?: Subscription;

  onSubmit() {
    this.forgotForm.markAllAsTouched();
    if (this.forgotForm.invalid || this.countdown > 0) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'sent';
        this.startCountdown(60);
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.mapError(err);
        this.cdr.detectChanges();
      }
    });
  }

  private mapError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    if (err.status === 429) return 'Quá nhiều yêu cầu. Vui lòng chờ vài phút rồi thử lại.';
    if (err.status === 404) return 'Email này chưa được đăng ký trong hệ thống.';
    if (err.status >= 500) return 'Lỗi hệ thống. Vui lòng thử lại sau ít phút.';
    return err.error?.error || 'Không thể gửi yêu cầu. Vui lòng kiểm tra lại email hoặc thử lại sau.';
  }

  startCountdown(seconds: number) {
    this.countdown = seconds;
    this.countdownSub?.unsubscribe();
    this.countdownSub = timer(1000, 1000).pipe(take(seconds)).subscribe({
      next: () => { this.countdown--; this.cdr.detectChanges(); },
      complete: () => { this.countdown = 0; this.cdr.detectChanges(); }
    });
  }

  ngOnDestroy() {
    this.countdownSub?.unsubscribe();
  }
}
