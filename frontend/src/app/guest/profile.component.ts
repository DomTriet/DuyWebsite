import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4">
        <div class="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <div class="flex items-center gap-4">
            <a routerLink="/" class="text-gray-500 hover:text-indigo-600 bg-white p-2 rounded-lg shadow-sm border border-gray-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <h1 class="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          </div>
          <button (click)="logout()" class="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 bg-red-50 px-4 py-2 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Đăng xuất
          </button>
        </div>

        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <ng-container *ngIf="!isLoading && profile">
          <!-- Banner nhảy vào Dashboard dành cho Admin/Agent -->
          <div *ngIf="profile.role === 'admin' || profile.role === 'agent'" class="bg-indigo-600 rounded-2xl p-6 text-white mb-8 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4">
            <div>
              <h2 class="text-xl font-bold mb-1">Khu vực Quản trị (Dashboard)</h2>
              <p class="text-indigo-100 text-sm">Bạn có quyền truy cập vào hệ thống quản lý bất động sản và khách hàng.</p>
            </div>
            <a routerLink="/admin" class="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap">Vào Dashboard</a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Cột trái: Thông tin hiển thị -->
            <div class="col-span-1">
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <img [src]="profile.avatar_url || 'https://ui-avatars.com/api/?name=' + profile.full_name + '&size=128&background=e0e7ff&color=4f46e5'" class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-50 object-cover">
                <h2 class="text-xl font-bold text-gray-900 mb-1">{{ profile.full_name }}</h2>
                <p class="text-gray-500 mb-3 text-sm">{{ profile.email }}</p>
                <span class="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">{{ profile.role }}</span>
              </div>
            </div>

            <!-- Cột phải: Form cập nhật & Yêu cầu Môi giới -->
            <div class="col-span-1 md:col-span-2 space-y-8">
              
              <!-- Form Cập nhật hồ sơ -->
              <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 class="text-xl font-bold text-gray-900 mb-6">Cập nhật thông tin</h3>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                  <div class="space-y-5 mb-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      <input type="text" formControlName="full_name" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input type="text" formControlName="phone" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow">
                    </div>
                  </div>
                  <button type="submit" [disabled]="isSaving" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    <span *ngIf="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                  </button>
                </form>
              </div>

              <!-- Form Đăng ký làm Môi giới (Chỉ hiển thị cho Member) -->
              <div *ngIf="profile.role === 'member'" class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Đăng ký làm Môi giới</h3>
                <p class="text-gray-500 mb-6 text-sm">Trở thành đối tác của Pro-RealEstate để có quyền đăng bán và quản lý BĐS.</p>
                
                <div *ngIf="requestSubmitted" 
                     [ngClass]="{'bg-green-50 border-green-100 text-green-700': agentRequestStatus === 'pending' || !agentRequestStatus, 'bg-red-50 border-red-100 text-red-700': agentRequestStatus === 'rejected'}"
                     class="border p-4 rounded-xl mb-4 flex items-center gap-3">
                  <svg *ngIf="agentRequestStatus === 'pending' || !agentRequestStatus" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <svg *ngIf="agentRequestStatus === 'rejected'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span *ngIf="agentRequestStatus === 'pending' || !agentRequestStatus">Yêu cầu của bạn đã được gửi và đang chờ Admin duyệt.</span>
                  <span *ngIf="agentRequestStatus === 'rejected'">Yêu cầu của bạn đã bị từ chối bởi Ban quản trị. Vui lòng liên hệ hỗ trợ.</span>
                </div>

                <form *ngIf="!requestSubmitted" [formGroup]="agentForm" (ngSubmit)="submitAgentRequest()">
                  <div class="space-y-5 mb-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Số năm kinh nghiệm *</label>
                      <input type="number" formControlName="experience_years" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Khu vực hoạt động *</label>
                      <input type="text" formControlName="area" placeholder="VD: Quận 1, Quận 2, TP.HCM" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    </div>
                  </div>
                  <button type="submit" [disabled]="agentForm.invalid || isRequesting" class="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                    <span *ngIf="isRequesting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isRequesting ? 'Đang gửi...' : 'Gửi yêu cầu xét duyệt' }}
                  </button>
                </form>
              </div>

            </div>
            
            <!-- Khu vực quản lý Yêu thích -->
            <div class="col-span-1 md:col-span-3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-2">
              <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg class="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Bất động sản đã lưu
              </h3>
              <div *ngIf="favoriteProperties.length === 0" class="text-gray-500 text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Bạn chưa lưu bất động sản nào.
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let fav of favoriteProperties" class="border border-gray-100 rounded-xl flex gap-4 p-4 hover:shadow-md transition-shadow bg-gray-50/50">
                  <img [src]="getFavThumbnail(fav.properties)" class="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-gray-200">
                  <div class="flex flex-col justify-between w-full overflow-hidden">
                    <div>
                      <h4 class="font-bold text-gray-900 line-clamp-2 text-sm mb-1" [title]="fav.properties?.title">{{ fav.properties?.title }}</h4>
                      <p class="text-indigo-600 font-bold text-sm">{{ fav.properties?.price | number }} ₫</p>
                    </div>
                    <a [routerLink]="['/project', fav.properties?.project_id, 'property', fav.properties?.slug]" class="text-xs text-gray-500 hover:text-indigo-600 font-medium inline-flex items-center gap-1 mt-2">
                      Xem chi tiết <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  profile: any = null;
  isLoading = true;
  isSaving = false;
  isRequesting = false;
  requestSubmitted = false;
  agentRequestStatus: string | null = null;
  favoriteProperties: any[] = [];

  profileForm: FormGroup = this.fb.group({ full_name: [''], phone: [''] });
  agentForm: FormGroup = this.fb.group({ experience_years: ['', Validators.required], area: ['', Validators.required] });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        this.router.navigate(['/auth/login']);
        return;
      }

      this.api.get<any>('/profiles/me').subscribe({
        next: (res) => {
          this.profile = res.data;
          this.profileForm.patchValue({ full_name: this.profile?.full_name, phone: this.profile?.phone });          

          // [NÂNG CẤP] Lấy trạng thái yêu cầu làm Agent trực tiếp từ Database
          if (this.profile?.role === 'member') {
            this.api.get<any>(`/leads/agent-requests/status`).subscribe(reqStatus => {
              if (reqStatus.data) {
                this.agentRequestStatus = reqStatus.data.status;
                if (this.agentRequestStatus !== 'approved') {
                  this.requestSubmitted = true;
                }
                this.cdr.detectChanges();
              }
            });
          }
          
          // Lấy danh sách BĐS yêu thích
          this.api.get<any>('/favorites').subscribe(favRes => {
            this.favoriteProperties = favRes.data || [];
            this.cdr.detectChanges();
          });

          this.isLoading = false; 
          this.cdr.detectChanges();
        },
        error: (err) => { this.clearSession(); }
      });
    }
  }

  updateProfile() {
    this.isSaving = true;
    this.api.put<any>('/profiles/me', this.profileForm.value).subscribe({
      next: (res) => { 
        // Fallback giữ nguyên dữ liệu trên UI nếu API không trả về res.data
        if (res.data) { this.profile = res.data; }
        else { this.profile.full_name = this.profileForm.value.full_name; this.profile.phone = this.profileForm.value.phone; }
        
        this.isSaving = false; 
        this.cdr.detectChanges(); // Ép render DOM NGAY LẬP TỨC
        alert('Cập nhật thông tin thành công!'); 
      },
      error: () => { this.isSaving = false; this.cdr.detectChanges(); alert('Có lỗi xảy ra.'); }
    });
  }

  submitAgentRequest() {
    if (this.agentForm.invalid) return;
    this.isRequesting = true;
    this.api.post<any>('/leads/agent-requests', { request_data: this.agentForm.value }).subscribe({
      next: () => { 
        this.isRequesting = false; 
        this.requestSubmitted = true; 
        this.cdr.detectChanges();
      },
      error: () => { this.isRequesting = false; this.cdr.detectChanges(); alert('Có lỗi xảy ra.'); }
    });
  }

  logout() {
    this.api.post('/auth/logout', {}).subscribe({ next: () => this.clearSession(), error: () => this.clearSession() });
  }
  
  clearSession() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/auth/login']);
  }

  getFavThumbnail(prop: any): string {
    const thumb = prop?.property_media?.find((m: any) => m.is_thumbnail);
    return thumb ? thumb.media_url : (prop?.property_media?.[0]?.media_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80');
  }
}