import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID, DestroyRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
      <p class="text-gray-500 text-sm mt-1">Dữ liệu thống kê mới nhất tính đến thời điểm hiện tại.</p>
    </div>
    
    <!-- Skeleton Loading -->
    <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div *ngFor="let i of [1,2,3,4]" class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div *ngIf="!isLoading && stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Properties Stat -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Bất động sản</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.properties || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Leads Stat (Real-time) -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-green-500 hover:shadow-md transition-shadow relative overflow-hidden">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-50 text-green-600 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Khách hàng (Leads)</p>
            <p class="text-2xl font-bold text-gray-800 transition-all duration-500">{{ stats.leads || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Admin Only Stats -->
      <ng-container *ngIf="isAdmin">
        <!-- Pending Forum Posts -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Bài viết chờ duyệt</p>
              <p class="text-2xl font-bold text-gray-800">{{ stats.pending_posts || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Pending Agent Requests -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Y/C Môi giới mới</p>
              <p class="text-2xl font-bold text-gray-800">{{ stats.pending_agents || 0 }}</p>
            </div>
          </div>
        </div>
      </ng-container>
    </div>

    <!-- Phần Biểu đồ (Tailwind CSS Horizontal Bar Chart) -->
    <div *ngIf="!isLoading && stats" class="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-800">Biểu đồ phân bổ dữ liệu</h3>
        <p class="text-sm text-gray-500">Tỷ trọng các luồng dữ liệu trên toàn hệ thống.</p>
      </div>

      <div class="space-y-5">
        <!-- Properties Chart -->
        <div>
          <div class="flex justify-between text-sm mb-1.5">
            <span class="font-semibold text-gray-700">Bất động sản đã đăng</span>
            <span class="font-bold text-blue-600">{{ getPercentage(stats.properties) }}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div class="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" [style.width.%]="getPercentage(stats.properties)"></div>
          </div>
        </div>

        <!-- Leads Chart -->
        <div>
          <div class="flex justify-between text-sm mb-1.5">
            <span class="font-semibold text-gray-700">Khách hàng (Leads)</span>
            <span class="font-bold text-green-600">{{ getPercentage(stats.leads) }}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div class="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out" [style.width.%]="getPercentage(stats.leads)"></div>
          </div>
        </div>

        <!-- Admin Only Charts -->
        <ng-container *ngIf="isAdmin">
          <div>
            <div class="flex justify-between text-sm mb-1.5">
              <span class="font-semibold text-gray-700">Tương tác Cộng đồng (Bài viết chờ duyệt)</span>
              <span class="font-bold text-amber-600">{{ getPercentage(stats.pending_posts) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div class="bg-amber-500 h-3 rounded-full transition-all duration-1000 ease-out" [style.width.%]="getPercentage(stats.pending_posts)"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-sm mb-1.5">
              <span class="font-semibold text-gray-700">Phát triển Mạng lưới (Y/c Môi giới)</span>
              <span class="font-bold text-purple-600">{{ getPercentage(stats.pending_agents) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div class="bg-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" [style.width.%]="getPercentage(stats.pending_agents)"></div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);

  stats: any = null;
  isLoading = true;
  private socketSub?: Subscription;

  get isAdmin() {
    if (isPlatformBrowser(this.platformId)) {
      return this.authService.currentUser?.role === 'admin';
    }
    return false;
  }

  ngOnInit() {
    // CHỈ GỌI API KHI ĐANG Ở TRÌNH DUYỆT (Client-side)
    if (isPlatformBrowser(this.platformId)) {
      this.api.get<any>('/stats').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.stats = res.data || res;
          this.isLoading = false;
          this.cdr.detectChanges(); // Ép Angular cập nhật giao diện
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu thống kê:', err);
          this.stats = {}; // Gán object rỗng để hiển thị các số 0, tránh kẹt Skeleton Loading
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
      this.socketSub = this.socketService.listen('app_notification').subscribe((notification: any) => {
        if (this.stats) { 
           if (notification.type === 'new_lead') this.stats.leads = (this.stats.leads || 0) + 1; 
           if (notification.type === 'new_post') this.stats.pending_posts = (this.stats.pending_posts || 0) + 1; 
           this.cdr.detectChanges(); 
        }
      });
    } else {
      // On server, we start with loading state and do nothing else.
      // The client will take over and fetch the real data.
      this.isLoading = true;
    }
  }

  ngOnDestroy() { if (this.socketSub) this.socketSub.unsubscribe(); }

  // Hàm tính tổng để chia tỷ lệ biểu đồ
  get totalStats(): number {
    if (!this.stats) return 0;
    const props = this.stats.properties || 0;
    const leads = this.stats.leads || 0;
    const posts = this.isAdmin ? (this.stats.pending_posts || 0) : 0;
    const agents = this.isAdmin ? (this.stats.pending_agents || 0) : 0;
    return props + leads + posts + agents;
  }

  getPercentage(val: number): number {
    const total = this.totalStats;
    if (total === 0 || !val) return 0;
    return Math.round((val / total) * 100);
  }
}