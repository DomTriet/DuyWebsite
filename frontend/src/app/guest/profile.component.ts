import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, DestroyRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../core/services/api.service';
import { ToastService } from '../core/services/toast.service';
import { AuthService } from '../core/services/auth.service';
import { GuestNavComponent } from '../shared/components/guest-nav/guest-nav.component';
import { GuestFooterComponent } from '../shared/components/guest-footer/guest-footer.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule, GuestNavComponent, GuestFooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <app-guest-nav></app-guest-nav>

      <div class="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <!-- Header Section -->
        <div class="mb-16">
          <h1 class="text-6xl font-black text-gray-900 mb-2">{{ 'PROFILE_PAGE.TITLE' | translate }}</h1>
          <p class="text-lg text-gray-600">{{ 'PROFILE_PAGE.SUB' | translate }}</p>
        </div>

        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>

        <ng-container *ngIf="!isLoading && profile">
          <!-- Dashboard Banner -->
          <div *ngIf="profile.role === 'admin' || profile.role === 'agent'" style="background:#0D0D0D; border-radius:18px; padding:40px 48px; color:#F7F6F3; margin-bottom:40px; display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap;">
            <div>
              <h2 style="font-size:1.25rem; font-weight:700; margin-bottom:6px; font-family:'Space Grotesk',system-ui,sans-serif;">{{ 'PROFILE_PAGE.DASHBOARD_TITLE' | translate }}</h2>
              <p style="color:#888; font-size:0.9rem;">{{ 'PROFILE_PAGE.DASHBOARD_SUB' | translate }}</p>
            </div>
            <a routerLink="/admin" style="background:#F7F6F3; color:#0D0D0D; padding:11px 24px; border-radius:8px; font-weight:700; font-size:0.875rem; text-decoration:none; white-space:nowrap;">{{ 'PROFILE_PAGE.GO_DASHBOARD' | translate }}</a>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <!-- Profile Card -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden text-center">
                <div style="background:#F0EFE9; height:112px;"></div>
                <div class="px-8 pb-8 -mt-14 relative z-10">
                  <img [src]="profile.avatar_url || 'https://ui-avatars.com/api/?name=' + profile.full_name + '&size=128&background=F0EFE9&color=0D0D0D'" class="w-32 h-32 rounded-2xl mx-auto mb-4 border-4 border-white object-cover shadow-lg">
                  <h2 class="text-2xl font-bold text-gray-900 mb-1" style="font-family:'Space Grotesk',system-ui,sans-serif;">{{ profile.full_name }}</h2>
                  <p class="text-gray-600 text-sm mb-4">{{ profile.email }}</p>
                  <span style="display:inline-block; padding:5px 12px; background:#F0EFE9; color:#374151; font-size:0.7rem; font-weight:700; border-radius:6px; text-transform:uppercase; letter-spacing:0.08em;">{{ profile.role }}</span>
                </div>
              </div>
            </div>

            <!-- Forms -->
            <div class="lg:col-span-2 space-y-8">
              
              <!-- Update Form -->
              <div class="bg-white rounded-2xl border border-gray-200 p-8">
                <h3 class="text-xl font-bold text-gray-900 mb-6">{{ 'PROFILE_PAGE.UPDATE_INFO' | translate }}</h3>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-5">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'PROFILE_PAGE.FULL_NAME' | translate }}</label>
                    <input type="text" formControlName="full_name" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'PROFILE_PAGE.PHONE' | translate }}</label>
                    <input type="text" formControlName="phone" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all">
                  </div>
                  <button type="submit" [disabled]="isSaving" style="width:100%; background:#0D0D0D; color:#F7F6F3; padding:12px 24px; border-radius:10px; font-weight:700; font-size:0.9rem; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 0.2s; opacity:1;" [style.opacity]="isSaving ? '0.6' : '1'" onmouseover="if(!this.disabled)this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">
                    <span *ngIf="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isSaving ? ('PROFILE_PAGE.SAVING' | translate) : ('PROFILE_PAGE.SAVE' | translate) }}
                  </button>
                </form>
              </div>

              <!-- Agent Upgrade -->
              <div *ngIf="profile.role === 'member'" class="bg-white rounded-2xl border border-gray-200 p-8">
                <h3 class="text-xl font-bold text-gray-900 mb-3">{{ 'PROFILE_PAGE.UPGRADE_TITLE' | translate }}</h3>
                <p class="text-gray-600 mb-6">{{ 'PROFILE_PAGE.UPGRADE_SUB' | translate }}</p>
                
                <!-- Status -->
                <div *ngIf="requestSubmitted" 
                     [ngClass]="{'bg-green-50 border-green-200 text-green-700': agentRequestStatus === 'pending' || !agentRequestStatus, 'bg-red-50 border-red-200 text-red-700': agentRequestStatus === 'rejected'}"
                     class="border p-4 rounded-xl mb-6 text-sm">
                  <p class="font-semibold">{{ agentRequestStatus === 'rejected' ? ('PROFILE_PAGE.REQ_REJECTED' | translate) : ('PROFILE_PAGE.REQ_PENDING' | translate) }}</p>
                </div>

                <!-- Form -->
                <form *ngIf="!requestSubmitted" [formGroup]="agentForm" (ngSubmit)="submitAgentRequest()" class="space-y-5">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'PROFILE_PAGE.EXP_YEARS' | translate }}</label>
                    <input type="number" formControlName="experience_years" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'PROFILE_PAGE.AREA' | translate }}</label>
                    <input type="text" formControlName="area" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all">
                  </div>
                  <button type="submit" [disabled]="agentForm.invalid || isRequesting" class="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <span *ngIf="isRequesting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isRequesting ? ('PROFILE_PAGE.SENDING' | translate) : ('PROFILE_PAGE.SEND_REQUEST' | translate) }}
                  </button>
                </form>
              </div>

            </div>

          <!-- Favorites -->
          <div class="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <svg class="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              {{ 'PROFILE_PAGE.SAVED' | translate }} ({{ favoriteProperties.length }})
            </h3>
              
              <!-- Empty -->
              <div *ngIf="favoriteProperties.length === 0" class="text-center py-16 bg-gray-50 rounded-xl">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <p class="text-gray-600 font-medium mb-1">{{ 'PROFILE_PAGE.NO_FAV_TITLE' | translate }}</p>
                <p class="text-gray-500 text-sm mb-6">{{ 'PROFILE_PAGE.NO_FAV_SUB' | translate }}</p>
                <a routerLink="/" style="display:inline-block; background:#0D0D0D; color:#F7F6F3; padding:10px 22px; border-radius:8px; font-weight:700; font-size:0.875rem; text-decoration:none;">{{ 'PROFILE_PAGE.EXPLORE_NOW' | translate }}</a>
              </div>

              <!-- Grid -->
              <div *ngIf="favoriteProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let fav of favoriteProperties" class="group rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all bg-white" style="transition:transform 0.3s cubic-bezier(0.16,1,0.3,1),box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''">
                  <a [routerLink]="['/project', fav.properties?.project_id, 'property', fav.properties?.slug]" class="block relative h-40 overflow-hidden bg-gray-200">
                    <img [src]="getFavThumbnail(fav.properties)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                  </a>
                  <div class="p-5">
                    <h4 class="font-bold text-gray-900 line-clamp-2 text-sm mb-3 group-hover:text-gray-600 transition-colors">{{ fav.properties?.title }}</h4>
                    <p style="color:#0D0D0D; font-weight:700; font-size:1.05rem; margin-bottom:14px; font-family:'Space Grotesk',system-ui,sans-serif;">{{ fav.properties?.price | number }} ₫</p>
                    <a [routerLink]="['/project', fav.properties?.project_id, 'property', fav.properties?.slug]" style="color:#374151; font-weight:700; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">{{ 'PROFILE_PAGE.VIEW_DETAIL' | translate }} →</a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </ng-container>
      </div>

      <app-guest-footer></app-guest-footer>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

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

      this.api.get<any>('/profiles/me').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.profile = res.data;
          this.profileForm.patchValue({ full_name: this.profile?.full_name, phone: this.profile?.phone });          

          // [NÂNG CẤP] Lấy trạng thái yêu cầu làm Agent trực tiếp từ Database
          if (this.profile?.role === 'member') {
            this.api.get<any>(`/leads/agent-requests/status`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(reqStatus => {
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
          this.api.get<any>('/favorites').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(favRes => {
            this.favoriteProperties = favRes.data || [];
            this.cdr.detectChanges();
          });

          this.isLoading = false; 
          this.cdr.detectChanges();
        },
        error: (err) => { this.auth.clearSession('/auth/login'); }
      });
    }
  }

  updateProfile() {
    this.isSaving = true;
    this.api.put<any>('/profiles/me', this.profileForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { 
        // Fallback giữ nguyên dữ liệu trên UI nếu API không trả về res.data
        if (res.data) { this.profile = res.data; }
        else { this.profile.full_name = this.profileForm.value.full_name; this.profile.phone = this.profileForm.value.phone; }
        
        this.isSaving = false; 
        this.cdr.detectChanges(); // Ép render DOM NGAY LẬP TỨC
        this.toast.success(this.translate.instant('PROFILE_PAGE.UPDATE_SUCCESS'));
      },
      error: () => { this.isSaving = false; this.cdr.detectChanges(); this.toast.error(this.translate.instant('PROFILE_PAGE.ERROR')); }
    });
  }

  submitAgentRequest() {
    if (this.agentForm.invalid) return;
    this.isRequesting = true;
    this.api.post<any>('/leads/agent-requests', { request_data: this.agentForm.value }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isRequesting = false;
        this.requestSubmitted = true;
        this.toast.success('Đã gửi yêu cầu nâng cấp môi giới. Vui lòng chờ Admin duyệt.');
        this.cdr.detectChanges();
      },
      error: () => { this.isRequesting = false; this.cdr.detectChanges(); this.toast.error(this.translate.instant('PROFILE_PAGE.ERROR')); }
    });
  }

  logout() {
    // Dùng AuthService để đồng bộ trạng thái đăng nhập toàn app (navbar, guard...).
    this.auth.logout('/').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  getFavThumbnail(prop: any): string {
    const thumb = prop?.property_media?.find((m: any) => m.is_thumbnail);
    return thumb ? thumb.media_url : (prop?.property_media?.[0]?.media_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80');
  }
}
