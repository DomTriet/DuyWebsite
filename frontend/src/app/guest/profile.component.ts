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
    <div class="min-h-screen bg-white py-12">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 mb-12">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">RESTATE</a>
          <button (click)="logout()" class="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all">Đăng xuất</button>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-6">
        <!-- Header Section -->
        <div class="mb-16">
          <h1 class="text-6xl font-black text-gray-900 mb-2">Hồ sơ cá nhân</h1>
          <p class="text-lg text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <ng-container *ngIf="!isLoading && profile">
          <!-- Dashboard Banner -->
          <div *ngIf="profile.role === 'admin' || profile.role === 'agent'" class="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-12 text-white mb-16 flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">Dashboard quản trị</h2>
              <p class="text-indigo-100">Quản lý bất động sản và khách hàng của bạn</p>
            </div>
            <a routerLink="/admin" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-all">Đi tới Dashboard</a>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <!-- Profile Card -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden text-center">
                <div class="bg-gradient-to-r from-indigo-100 to-indigo-50 h-28"></div>
                <div class="px-8 pb-8 -mt-14 relative z-10">
                  <img [src]="profile.avatar_url || 'https://ui-avatars.com/api/?name=' + profile.full_name + '&size=128&background=e0e7ff&color=4f46e5'" class="w-32 h-32 rounded-2xl mx-auto mb-4 border-4 border-white object-cover shadow-lg">
                  <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ profile.full_name }}</h2>
                  <p class="text-gray-600 text-sm mb-4">{{ profile.email }}</p>
                  <span class="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg uppercase">{{ profile.role }}</span>
                </div>
              </div>
            </div>

            <!-- Forms -->
            <div class="lg:col-span-2 space-y-8">
              
              <!-- Update Form -->
              <div class="bg-white rounded-2xl border border-gray-200 p-8">
                <h3 class="text-xl font-bold text-gray-900 mb-6">Cập nhật thông tin</h3>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-5">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Họ và tên</label>
                    <input type="text" formControlName="full_name" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Số điện thoại</label>
                    <input type="text" formControlName="phone" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                  </div>
                  <button type="submit" [disabled]="isSaving" class="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <span *ngIf="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                  </button>
                </form>
              </div>

              <!-- Agent Upgrade -->
              <div *ngIf="profile.role === 'member'" class="bg-white rounded-2xl border border-gray-200 p-8">
                <h3 class="text-xl font-bold text-gray-900 mb-3">Nâng cấp thành Môi giới</h3>
                <p class="text-gray-600 mb-6">Trở thành đối tác để quản lý bất động sản.</p>
                
                <!-- Status -->
                <div *ngIf="requestSubmitted" 
                     [ngClass]="{'bg-green-50 border-green-200 text-green-700': agentRequestStatus === 'pending' || !agentRequestStatus, 'bg-red-50 border-red-200 text-red-700': agentRequestStatus === 'rejected'}"
                     class="border p-4 rounded-xl mb-6 text-sm">
                  <p class="font-semibold">{{ agentRequestStatus === 'rejected' ? 'Yêu cầu bị từ chối' : 'Đang chờ duyệt' }}</p>
                </div>

                <!-- Form -->
                <form *ngIf="!requestSubmitted" [formGroup]="agentForm" (ngSubmit)="submitAgentRequest()" class="space-y-5">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Số năm kinh nghiệm</label>
                    <input type="number" formControlName="experience_years" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Khu vực hoạt động</label>
                    <input type="text" formControlName="area" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                  </div>
                  <button type="submit" [disabled]="agentForm.invalid || isRequesting" class="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <span *ngIf="isRequesting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isRequesting ? 'Đang gửi...' : 'Gửi yêu cầu' }}
                  </button>
                </form>
              </div>

            </div>

          <!-- Favorites -->
          <div class="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <svg class="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              Đã lưu ({{ favoriteProperties.length }})
            </h3>
              
              <!-- Empty -->
              <div *ngIf="favoriteProperties.length === 0" class="text-center py-16 bg-gray-50 rounded-xl">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <p class="text-gray-600 font-medium mb-1">Chưa lưu bất động sản</p>
                <p class="text-gray-500 text-sm mb-6">Khám phá và lưu những bất động sản yêu thích</p>
                <a routerLink="/" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all">Khám phá ngay</a>
              </div>

              <!-- Grid -->
              <div *ngIf="favoriteProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let fav of favoriteProperties" class="group rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all bg-white">
                  <a [routerLink]="['/project', fav.properties?.project_id, 'property', fav.properties?.slug]" class="block relative h-40 overflow-hidden bg-gray-200">
                    <img [src]="getFavThumbnail(fav.properties)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                  </a>
                  <div class="p-5">
                    <h4 class="font-bold text-gray-900 line-clamp-2 text-sm mb-3 group-hover:text-indigo-600 transition-colors">{{ fav.properties?.title }}</h4>
                    <p class="text-indigo-600 font-bold text-lg mb-4">{{ fav.properties?.price | number }} ₫</p>
                    <a [routerLink]="['/project', fav.properties?.project_id, 'property', fav.properties?.slug]" class="text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors">Xem chi tiết →</a>
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
