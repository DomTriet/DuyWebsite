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
    <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 py-12">
      <div class="max-w-6xl mx-auto px-6">
        <!-- Header Section -->
        <div class="flex justify-between items-start md:items-center gap-6 mb-12 flex-col md:flex-row">
          <div class="flex items-center gap-4">
            <a routerLink="/" class="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-lg transition-colors border border-gray-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <div>
              <h1 class="text-4xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
              <p class="text-gray-600 mt-1">Quản lý thông tin và cấu hình tài khoản của bạn</p>
            </div>
          </div>
          <button (click)="logout()" class="text-white font-semibold flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-all hover:shadow-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Đăng xuất
          </button>
        </div>

        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <ng-container *ngIf="!isLoading && profile">
          <!-- Admin/Agent Dashboard Banner -->
          <div *ngIf="profile.role === 'admin' || profile.role === 'agent'" class="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white mb-12 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-6">
            <div>
              <h2 class="text-2xl font-bold mb-2">Khu vực Quản trị (Dashboard)</h2>
              <p class="text-indigo-100">Bạn có quyền truy cập vào hệ thống quản lý bất động sản và khách hàng.</p>
            </div>
            <a routerLink="/admin" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-all hover:shadow-lg whitespace-nowrap">Vào Dashboard</a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <!-- Profile Card (Left) -->
            <div class="col-span-1">
              <div class="bg-white rounded-2xl shadow-md border border-gray-100 text-center overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-50 to-indigo-100 h-24"></div>
                <div class="px-6 pb-6 -mt-12 relative z-10">
                  <img [src]="profile.avatar_url || 'https://ui-avatars.com/api/?name=' + profile.full_name + '&size=128&background=e0e7ff&color=4f46e5'" class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white object-cover shadow-lg">
                  <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ profile.full_name }}</h2>
                  <p class="text-gray-600 mb-4 text-sm">{{ profile.email }}</p>
                  <span class="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">{{ profile.role }}</span>
                </div>
              </div>
            </div>

            <!-- Forms & Settings (Right) -->
            <div class="col-span-1 md:col-span-2 space-y-8">
              
              <!-- Profile Update Form -->
              <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Cập nhật thông tin
                </h3>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                  <div class="space-y-5 mb-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 mb-2">Họ và tên</label>
                      <input type="text" formControlName="full_name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 mb-2">Số điện thoại</label>
                      <input type="text" formControlName="phone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                    </div>
                  </div>
                  <button type="submit" [disabled]="isSaving" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                    <span *ngIf="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                  </button>
                </form>
              </div>

              <!-- Agent Registration Form (Members Only) -->
              <div *ngIf="profile.role === 'member'" class="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                <h3 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Nâng cấp thành Môi giới
                </h3>
                <p class="text-gray-600 mb-6">Trở thành đối tác của Pro-RealEstate để có quyền đăng bán và quản lý bất động sản.</p>
                
                <!-- Status Messages -->
                <div *ngIf="requestSubmitted" 
                     [ngClass]="{'bg-green-50 border-green-200 text-green-700': agentRequestStatus === 'pending' || !agentRequestStatus, 'bg-red-50 border-red-200 text-red-700': agentRequestStatus === 'rejected'}"
                     class="border p-5 rounded-xl mb-6 flex items-start gap-3">
                  <svg *ngIf="agentRequestStatus === 'pending' || !agentRequestStatus" class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <svg *ngIf="agentRequestStatus === 'rejected'" class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <p class="font-semibold" *ngIf="agentRequestStatus === 'pending' || !agentRequestStatus">Đang chờ duyệt</p>
                    <p class="font-semibold" *ngIf="agentRequestStatus === 'rejected'">Yêu cầu bị từ chối</p>
                    <p class="text-sm" *ngIf="agentRequestStatus === 'pending' || !agentRequestStatus">Yêu cầu của bạn đã được gửi. Admin sẽ liên hệ với bạn trong 24-48 giờ.</p>
                    <p class="text-sm" *ngIf="agentRequestStatus === 'rejected'">Yêu cầu đã bị từ chối. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.</p>
                  </div>
                </div>

                <!-- Application Form -->
                <form *ngIf="!requestSubmitted" [formGroup]="agentForm" (ngSubmit)="submitAgentRequest()">
                  <div class="space-y-5 mb-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 mb-2">Số năm kinh nghiệm *</label>
                      <input type="number" formControlName="experience_years" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="Nhập số năm kinh nghiệm">
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 mb-2">Khu vực hoạt động *</label>
                      <input type="text" formControlName="area" placeholder="VD: Quận 1, Quận 2, TP.HCM" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                    </div>
                  </div>
                  <button type="submit" [disabled]="agentForm.invalid || isRequesting" class="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                    <span *ngIf="isRequesting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isRequesting ? 'Đang gửi...' : 'Gửi yêu cầu xét duyệt' }}
                  </button>
                </form>
              </div>

            </div>
            
            <!-- Favorites Section -->
            <div class="col-span-1 md:col-span-3 bg-white rounded-2xl shadow-md border border-gray-100 p-8 mt-4">
              <h3 class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <svg class="w-7 h-7 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Bất động sản đã lưu ({{ favoriteProperties.length }})
              </h3>
              
              <!-- Empty State -->
              <div *ngIf="favoriteProperties.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <p class="text-gray-600 font-medium mb-2">Bạn chưa lưu bất động sản nào</p>
                <p class="text-gray-500 text-sm mb-4">Hãy lưu những bất động sản yêu thích để theo dõi sau</p>
                <a routerLink="/" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all">Khám phá bất động sản</a>
              </div>

              <!-- Properties Grid -->
              <div *ngIf="favoriteProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let fav of favoriteProperties" class="group rounded-xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all bg-white">
                  <a [routerLink]="['/project', fav.properties?.project_id, 'property', fav.properties?.slug]" class="block relative h-32 overflow-hidden bg-gray-200">
                    <img [src]="getFavThumbnail(fav.properties)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                  </a>
                  <div class="p-4">
                    <h4 class="font-bold text-gray-900 line-clamp-2 text-sm mb-2 group-hover:text-indigo-600 transition-colors" [title]="fav.properties?.title">{{ fav.properties?.title }}</h4>
                    <p class="text-indigo-600 font-bold text-lg mb-3">{{ fav.properties?.price | number }} ₫</p>
                    <a [routerLink]="['/project', fav.properties?.project_id, 'property', fav.properties?.slug]" class="inline-flex items-center text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors">
                      Xem chi tiết
                      <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
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
