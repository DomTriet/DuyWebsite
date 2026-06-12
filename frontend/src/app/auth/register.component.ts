import { Component, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    @keyframes slideDown {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .alert-anim { animation: slideDown 0.2s ease; }
    .field-error { border-color: #ef4444 !important; }
    .strength-bar { height:3px; border-radius:9999px; transition:width 0.3s ease, background 0.3s ease; }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-12">
          <h1 class="text-3xl font-black text-gray-900 mb-2" style="font-family:'Lora',Georgia,serif;letter-spacing:-0.02em;">Điểm Tâm BĐS</h1>
          <p class="text-gray-500 text-sm">Nền tảng bất động sản cao cấp</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          <h2 class="text-2xl font-black text-gray-900 mb-8 text-center">Đăng ký tài khoản</h2>

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
            <div class="flex-1">
              <p class="font-semibold">Đăng ký thành công!</p>
              <p class="mt-0.5 text-emerald-700">Đang chuyển đến trang đăng nhập sau {{ redirectCountdown }}s...</p>
            </div>
          </div>

          <form *ngIf="!successMessage" [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Full Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">Họ và tên</label>
              <input formControlName="full_name" type="text"
                     [class.field-error]="f['full_name'].invalid && f['full_name'].touched"
                     class="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                     placeholder="Nguyễn Văn A">
              <p *ngIf="f['full_name'].invalid && f['full_name'].touched" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                Vui lòng nhập họ tên
              </p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
              <input formControlName="email" type="email"
                     [class.field-error]="f['email'].invalid && f['email'].touched"
                     (input)="errorMessage=''"
                     class="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                     placeholder="your@email.com">
              <p *ngIf="f['email'].invalid && f['email'].touched" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                {{ f['email'].errors?.['required'] ? 'Vui lòng nhập email' : 'Định dạng email không hợp lệ' }}
              </p>
            </div>

            <!-- Password + strength -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">Mật khẩu</label>
              <div class="relative">
                <input formControlName="password"
                       [type]="showPwd ? 'text' : 'password'"
                       [class.field-error]="f['password'].invalid && f['password'].touched"
                       class="w-full px-4 py-3 pr-11 min-h-[44px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                       placeholder="Tối thiểu 6 ký tự">
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

              <!-- Strength meter (chỉ hiện khi đang nhập) -->
              <div *ngIf="f['password'].value" class="mt-2">
                <div class="w-full bg-gray-100 rounded-full" style="height:3px;">
                  <div class="strength-bar" [style.width]="strength.pct" [style.background]="strength.color"></div>
                </div>
                <p class="text-xs mt-1" [style.color]="strength.color">{{ strength.label }}</p>
              </div>

              <p *ngIf="f['password'].invalid && f['password'].touched" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                {{ f['password'].errors?.['required'] ? 'Vui lòng nhập mật khẩu' : 'Mật khẩu tối thiểu 6 ký tự' }}
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">Xác nhận mật khẩu</label>
              <div class="relative">
                <input formControlName="confirm_password"
                       [type]="showConfirmPwd ? 'text' : 'password'"
                       [class.field-error]="confirmHasError"
                       class="w-full px-4 py-3 pr-11 min-h-[44px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                       placeholder="Nhập lại mật khẩu">
                <button type="button" (click)="showConfirmPwd=!showConfirmPwd"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  <svg *ngIf="!showConfirmPwd" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <svg *ngIf="showConfirmPwd" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                </button>
              </div>
              <p *ngIf="confirmHasError" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                {{ f['confirm_password'].errors?.['required'] ? 'Vui lòng nhập lại mật khẩu' : 'Mật khẩu không khớp' }}
              </p>
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="isLoading"
                    class="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 min-h-[44px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-6">
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
            </button>

            <p class="text-center text-sm text-gray-500 pt-2">
              Đã có tài khoản?
              <a routerLink="/auth/login" class="text-gray-800 font-bold hover:text-gray-900 ml-1">Đăng nhập</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  redirectCountdown = 3;
  showPwd = false;
  showConfirmPwd = false;

  private countdownSub?: Subscription;

  registerForm: FormGroup = this.fb.group({
    full_name:        ['', Validators.required],
    email:            ['', [Validators.required, Validators.email]],
    password:         ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  get f() { return this.registerForm.controls; }

  get confirmHasError(): boolean {
    const c = this.f['confirm_password'];
    return (c.invalid || !!this.registerForm.errors?.['mismatch']) && c.touched;
  }

  get strength(): { pct: string; color: string; label: string } {
    const pwd: string = this.f['password'].value || '';
    const len = pwd.length;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum   = /[0-9]/.test(pwd);
    const hasSpec  = /[^A-Za-z0-9]/.test(pwd);
    const score = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpec ? 1 : 0);
    if (len < 6)   return { pct: '25%',  color: '#ef4444', label: 'Quá yếu' };
    if (score <= 1) return { pct: '40%',  color: '#f97316', label: 'Yếu' };
    if (score === 2) return { pct: '65%', color: '#eab308', label: 'Trung bình' };
    if (score === 3) return { pct: '85%', color: '#22c55e', label: 'Mạnh' };
    return { pct: '100%', color: '#16a34a', label: 'Rất mạnh' };
  }

  passwordMatchValidator(g: AbstractControl) {
    const pw  = g.get('password')?.value;
    const cpw = g.get('confirm_password')?.value;
    return pw === cpw ? null : { mismatch: true };
  }

  onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'success';
        this.registerForm.reset();
        this.redirectCountdown = 3;
        this.cdr.detectChanges();

        this.countdownSub = timer(1000, 1000).pipe(take(3)).subscribe({
          next: () => { this.redirectCountdown--; this.cdr.detectChanges(); },
          complete: () => this.router.navigate(['/auth/login'])
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.mapRegisterError(err);
        this.cdr.detectChanges();
      }
    });
  }

  private mapRegisterError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    if (err.status === 429) return 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.';
    if (err.status === 409 || err.status === 400) {
      const msg = (err.error?.error || err.error?.message || '').toLowerCase();
      if (msg.includes('exist') || msg.includes('registered') || msg.includes('already') || msg.includes('duplicate')) {
        return 'Email này đã được đăng ký. Hãy thử đăng nhập hoặc dùng email khác.';
      }
    }
    if (err.status >= 500) return 'Lỗi hệ thống. Vui lòng thử lại sau ít phút.';
    return err.error?.error || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.';
  }

  ngOnDestroy() {
    this.countdownSub?.unsubscribe();
  }
}
