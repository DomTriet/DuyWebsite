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
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-6">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-12">
          <h1 class="text-3xl font-black bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent mb-2">RESTATE</h1>
          <p class="text-gray-600">Quản lý bất động sản hiện đại</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
          <h2 class="text-2xl font-black text-gray-900 mb-2 text-center">Quên mật khẩu?</h2>
          <p class="text-sm text-gray-600 text-center mb-8">Nhập email của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu</p>
          
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {{ successMessage }}
          </div>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2" for="email">Email</label>
              <input formControlName="email" id="email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="your@email.com">
              <p *ngIf="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched" class="text-red-600 text-xs mt-1.5">Email không hợp lệ</p>
            </div>

            <!-- Submit Button -->
            <button [disabled]="forgotForm.invalid || isLoading || countdown > 0" class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-8" type="submit">
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <ng-container *ngIf="isLoading">Đang gửi yêu cầu...</ng-container>
              <ng-container *ngIf="!isLoading && countdown === 0">Gửi liên kết khôi phục</ng-container>
              <ng-container *ngIf="!isLoading && countdown > 0">Gửi lại sau {{ countdown }}s</ng-container>
            </button>
          </form>

          <!-- Back to Login -->
          <div class="text-center text-sm mt-8">
            <a routerLink="/auth/login" class="text-indigo-600 font-semibold hover:text-indigo-700">Quay lại đăng nhập</a>
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

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  countdown = 0;
  private countdownSub?: Subscription;

  onSubmit() {
    if (this.forgotForm.invalid || this.countdown > 0) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư mục Spam)!';
        this.startCountdown(60);
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Không thể gửi yêu cầu. Có thể email này chưa được đăng ký.';
        this.cdr.detectChanges();
      }
    });
  }

  startCountdown(seconds: number) {
    this.countdown = seconds;
    if (this.countdownSub) this.countdownSub.unsubscribe();
    
    this.countdownSub = timer(1000, 1000).pipe(take(seconds)).subscribe({
      next: () => {
        this.countdown--;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.countdown = 0;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
    }
  }
}
