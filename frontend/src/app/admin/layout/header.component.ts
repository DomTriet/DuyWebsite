import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Notification, NotificationService } from '../../core/services/notification.service';
import { SocketService } from '../../core/services/socket.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <header class="bg-white border-b border-gray-200 z-10 py-4 px-6 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <button class="md:hidden text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="hidden sm:block">
          <h2 class="text-lg font-bold text-gray-900">Chào mừng, {{ userName }}!</h2>
          <p class="text-xs text-gray-500 mt-0.5">Quản lý dự án bất động sản</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Notification -->
        <div class="relative">
          <button (click)="toggleNotifications()" class="text-gray-600 hover:text-gray-900 transition-colors relative p-2 rounded-lg hover:bg-gray-100 focus:outline-none">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span *ngIf="unreadCount > 0" class="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
          </button>

          <!-- Notification Dropdown -->
          <div *ngIf="showNotifications" @dropdownAnimation class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div class="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50">
              <h3 class="font-bold text-gray-800">Thông báo</h3>
              <button (click)="markAllAsRead()" class="text-xs text-gray-500 hover:text-gray-900 font-medium focus:outline-none">Đánh dấu đã đọc</button>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <div *ngIf="notifications.length === 0" class="p-8 text-center text-gray-500">
                Không có thông báo mới.
              </div>
              <a *ngFor="let notification of notifications" [routerLink]="notification.link" (click)="markAsRead(notification.id)"
                 class="flex items-start gap-4 p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors cursor-pointer"
                 [ngClass]="{'bg-white': notification.read, 'bg-gray-50/60': !notification.read}">
                <div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" [ngClass]="notification.read ? 'bg-gray-300' : 'bg-gray-700'"></div>
                <div class="flex-1">
                  <p class="font-semibold text-gray-800 text-sm">{{ notification.title }}</p>
                  <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                  <p class="text-[10px] text-gray-400 mt-2">{{ notification.timestamp | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-6 w-px bg-gray-300"></div>

        <!-- Logout -->
        <button (click)="logout()" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all font-semibold text-sm">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  `,
  animations: [
    trigger('dropdownAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      transition('void <=> *', [
        animate('150ms ease-out')
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private confirm = inject(ConfirmService);

  showNotifications = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  private notificationSub?: Subscription;
  private unreadCountSub?: Subscription;
  private appNotifSub?: Subscription;

  get userName() { const u = this.authService.currentUser; return u?.full_name || u?.username || u?.email || 'User'; }
  
  ngOnInit(): void {
    this.notificationSub = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
    this.unreadCountSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    
    // Lắng nghe thông báo Real-time và lọc đối tượng
    this.appNotifSub = this.socketService.listen('app_notification').subscribe((notification: any) => {
      const user = this.authService.currentUser;
      if (!user) return;

      let shouldShow = false;

      // 1. Dành cho Admin (Các thông báo chung hệ thống)
      if (notification.targetRoles?.includes('admin') && user.role === 'admin') {
        shouldShow = true;
      }
      
      // 2. Dành cho đích danh một cá nhân (Agent được chia Lead, Tác giả nhận Like/Comment)
      if (notification.targetUserId && notification.targetUserId === user.id) {
        shouldShow = true;
      }

      // 3. Dành cho toàn bộ nhóm Role (Nếu không chỉ định đích danh)
      if (!notification.targetUserId && notification.targetRoles?.includes(user.role)) {
        shouldShow = true;
      }

      if (shouldShow) {
        this.notificationService.addNotification(notification.title, notification.message, notification.link);
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.unreadCountSub?.unsubscribe();
    this.appNotifSub?.unsubscribe();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
    this.showNotifications = false;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  async logout() {
    if (await this.confirm.ask({ title: 'Đăng xuất', message: 'Bạn có chắc chắn muốn đăng xuất?', confirmText: 'Đăng xuất' })) {
      this.authService.logout('/auth/login').subscribe();
    }
  }
}
