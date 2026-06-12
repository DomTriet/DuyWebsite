import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UploadService } from '../../core/services/upload.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Cài đặt tài khoản</h2>
        <button type="button" (click)="toggleEditMode()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors" [ngClass]="isEditMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'">
          {{ isEditMode ? 'Hủy chỉnh sửa' : 'Chỉnh sửa' }}
        </button>
      </div>
      
      <div *ngIf="successMessage" class="bg-emerald-50 text-emerald-700 p-4 rounded-lg mb-6 text-sm border border-emerald-200">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="bg-rose-50 text-rose-700 p-4 rounded-lg mb-6 text-sm border border-rose-200">
        {{ errorMessage }}
      </div>

      <!-- Skeleton Loading -->
      <div *ngIf="isInitialLoading" class="animate-pulse space-y-6">
        <div class="flex gap-6 items-center"><div class="w-20 h-20 bg-gray-200 rounded-full"></div><div class="w-32 h-10 bg-gray-200 rounded-lg"></div></div>
        <div><div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div><div class="h-10 bg-gray-200 rounded w-full"></div></div>
        <div><div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div><div class="h-10 bg-gray-200 rounded w-full"></div></div>
      </div>

      <form *ngIf="!isInitialLoading" [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Avatar -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
          <div class="flex items-center gap-6">
            <div class="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
              <img *ngIf="profileForm.get('avatar_url')?.value" [src]="profileForm.get('avatar_url')?.value" alt="Avatar" class="h-full w-full object-cover">
              <svg *ngIf="!profileForm.get('avatar_url')?.value" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <div *ngIf="isEditMode" class="flex flex-col">
              <label class="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors relative inline-block text-center w-36">
                <span *ngIf="!isUploadingAvatar">Thay đổi ảnh</span>
                <span *ngIf="isUploadingAvatar" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang tải...
                </span>
                <input type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)" [disabled]="isUploadingAvatar">
              </label>
              <p class="text-xs text-gray-500 mt-2">Khuyến nghị ảnh vuông, &lt; 2MB</p>
            </div>
          </div>
        </div>

        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Họ và Tên</label>
          <ng-container *ngIf="isEditMode">
            <input formControlName="full_name" type="text" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" placeholder="Nguyễn Văn A">
            <p *ngIf="profileForm.get('full_name')?.invalid && profileForm.get('full_name')?.touched" class="text-red-500 text-xs mt-1">Vui lòng nhập họ tên.</p>
          </ng-container>
          <div *ngIf="!isEditMode" class="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
            {{ profileForm.get('full_name')?.value || 'Chưa cập nhật' }}
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
          <ng-container *ngIf="isEditMode">
            <input formControlName="phone" type="text" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" placeholder="0901234567">
          </ng-container>
          <div *ngIf="!isEditMode" class="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
            {{ profileForm.get('phone')?.value || 'Chưa cập nhật' }}
          </div>
        </div>

        <div *ngIf="isEditMode" class="pt-4 flex justify-end">
          <button type="submit" [disabled]="profileForm.invalid || isLoading || isUploadingAvatar" class="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50">
            {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </form>

      <!-- Phần Đăng ký làm môi giới (Chỉ hiển thị cho Member) -->
      <div *ngIf="isMember" class="mt-12 pt-8 border-t border-gray-200">
        <h3 class="text-xl font-bold text-gray-800 mb-2">Đăng ký làm Môi giới</h3>
        <p class="text-gray-500 text-sm mb-6">Trở thành môi giới của Điểm Tâm BĐS để quản lý và đăng bán bất động sản.</p>

        <div *ngIf="requestSuccess" class="bg-emerald-50 text-emerald-700 p-4 rounded-lg mb-6 text-sm border border-emerald-200">{{ requestSuccess }}</div>
        <div *ngIf="requestError" class="bg-rose-50 text-rose-700 p-4 rounded-lg mb-6 text-sm border border-rose-200">{{ requestError }}</div>

        <form *ngIf="!requestSuccess" [formGroup]="agentRequestForm" (ngSubmit)="onRequestSubmit()" class="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Số năm kinh nghiệm</label>
            <input formControlName="experience_years" type="number" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" placeholder="Ví dụ: 3">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Khu vực hoạt động</label>
            <input formControlName="area" type="text" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" placeholder="Quận 1, TP.HCM">
          </div>
          <div class="flex justify-end">
            <button type="submit" [disabled]="agentRequestForm.invalid || isSubmittingRequest" class="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50">
              {{ isSubmittingRequest ? 'Đang gửi...' : 'Gửi yêu cầu' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AccountSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private uploadService = inject(UploadService);
  private cdr = inject(ChangeDetectorRef);

  profileForm: FormGroup = this.fb.group({
    full_name: ['', Validators.required],
    phone: [''],
    avatar_url: ['']
  });

  isLoading = false;
  isUploadingAvatar = false;
  isEditMode = false;
  isInitialLoading = true;
  successMessage = '';
  errorMessage = '';
  
  get isMember() { return this.authService.currentUser?.role === 'member'; }

  agentRequestForm: FormGroup = this.fb.group({
    experience_years: ['', Validators.required],
    area: ['', Validators.required]
  });
  isSubmittingRequest = false;
  requestSuccess = '';
  requestError = '';

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.isInitialLoading = true;
    this.api.get<any>('/profiles/me').subscribe({
      next: (res) => {
        const user = res.data || res;
        if (user) {
          this.profileForm.patchValue({
            full_name: user.full_name || '',
            phone: user.phone || '',
            avatar_url: user.avatar_url || ''
          });
          setTimeout(() => {
            this.authService.updateCurrentUser(user);
          });
        }
        this.isInitialLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải thông tin profile', err);
        this.isInitialLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.successMessage = '';
    this.errorMessage = '';
    if (!this.isEditMode) {
      this.fetchProfile(); // Load lại data nếu bị hủy bỏ giữa chừng
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploadingAvatar = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const file = files[0];
    this.uploadService.uploadFile(file).subscribe({
      next: (res) => {
        // Trích xuất URL từ res.data.url theo chuẩn cấu trúc API mới
        const url = res.data?.url || res.data?.secure_url || res.secure_url || res.url;
        this.profileForm.patchValue({ avatar_url: url });
        this.isUploadingAvatar = false;
        this.cdr.detectChanges(); // Ép Angular cập nhật UI ngay lập tức để tránh lỗi NG0100
      },
      error: (err) => {
        console.error('Lỗi upload avatar:', err);
        this.errorMessage = 'Lỗi khi upload ảnh. Vui lòng thử lại!';
        this.isUploadingAvatar = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.api.put<any>('/profiles/me', this.profileForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Cập nhật thông tin thành công!';
        setTimeout(() => {
          this.authService.updateCurrentUser(this.profileForm.value);
        });
        this.isEditMode = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Có lỗi xảy ra khi cập nhật hồ sơ.';
        this.cdr.detectChanges();
      }
    });
  }

  onRequestSubmit() {
    if (this.agentRequestForm.invalid) return;
    this.isSubmittingRequest = true;
    this.requestSuccess = '';
    this.requestError = '';

    this.api.post<any>('/leads/agent-requests', { request_data: this.agentRequestForm.value }).subscribe({
      next: () => {
        this.isSubmittingRequest = false;
        this.requestSuccess = 'Đã gửi yêu cầu thành công! Vui lòng chờ quản trị viên phê duyệt.';
        this.agentRequestForm.reset();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmittingRequest = false;
        this.requestError = err.error?.error || 'Có lỗi xảy ra khi gửi yêu cầu.';
        this.cdr.detectChanges();
      }
    });
  }
}