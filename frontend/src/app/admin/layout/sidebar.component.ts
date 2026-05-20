import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col fixed left-0 top-0 shadow-xl z-50 border-r border-slate-700">
      <!-- Logo -->
      <div class="p-6 border-b border-slate-700">
        <h1 class="text-2xl font-black bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">RESTATE</h1>
        <p class="text-xs text-slate-400 mt-1">Admin Panel</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <!-- Public Forum Link -->
        <a routerLink="/forum" class="block px-4 py-3 text-indigo-300 rounded-lg hover:bg-slate-700/50 font-bold mb-6 transition-colors">
          <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"></path></svg>
          Xem Diễn đàn
        </a>

        <!-- Common Menu -->
        <div>
          <a routerLink="/admin/dashboard" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
            Trang chủ
          </a>
          <a routerLink="/admin/properties" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.987 1.488a1 1 0 001.187-1.41l-7-14z"></path></svg>
            Quản lý BĐS
          </a>
          <a routerLink="/admin/leads" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z"></path></svg>
            Khách hàng
          </a>
          <a routerLink="/admin/blogs-manage" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm10.793-1.293a1 1 0 111.414 1.414L12.414 9l1.793 1.793a1 1 0 11-1.414 1.414L11 10.414l-1.793 1.793a1 1 0 111.414 1.414L12.414 11l1.793 1.793a1 1 0 11-1.414 1.414L11 12.414l-1.793 1.793a1 1 0 01-1.414-1.414L9.586 11 7.793 9.207a1 1 0 011.414-1.414L9 9.586l1.793-1.793z"></path></svg>
            Blog & Tin tức
          </a>
          <a routerLink="/admin/account-settings" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>
            Cài đặt
          </a>
        </div>

        <!-- Admin Only -->
        <ng-container *ngIf="isAdmin">
          <div class="mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-4">Quản Trị</div>
          <a routerLink="/admin/projects" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-sm">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"></path></svg>
            Dự án & Danh mục
          </a>
          <a routerLink="/admin/users" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-sm">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
            Quản lý User
          </a>
          <a routerLink="/admin/agent-requests" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-sm">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
            Yêu cầu Môi giới
          </a>
          <a routerLink="/admin/forum-approval" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-sm">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM14 5a1 1 0 01 0 2h-1v1a1 1 0 11-2 0V7h-1a1 1 0 110-2h1V4a1 1 0 012 0v1h1z" clip-rule="evenodd"></path></svg>
            Duyệt Diễn Đàn
          </a>
          <a routerLink="/admin/translations-manage" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-sm">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.455 11.742C3.254 10.855 2.787 9.418 3.636 8.203 5.358 5.487 8.5 4 11.5 4c.823 0 1.623.076 2.39.216l2.294-2.294a1 1 0 111.414 1.414l-16 16a1 1 0 01-1.414-1.414l2.294-2.294C4.19 15.721 4 14.647 4 13.5c0-2.738 1.237-5.63 3.455-7.258zm7.586 3.586c1.19-1.19 1.902-2.956 1.902-4.744 0-1.566-.516-3.016-1.385-4.195l1.763 1.763a1 1 0 001.414-1.414L12.464 4.05C11.716 4.017 10.973 4 10.25 4 7.873 4 5.581 4.986 4.05 6.517l8.991 8.991zM5 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"></path></svg>
            Dịch thuật
          </a>
          <a routerLink="/admin/system-logs" class="block px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-sm">
            <svg class="w-4 h-4 inline mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>
            Nhật ký Hệ thống
          </a>
        </ng-container>
      </nav>
    </div>
  `
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get isAdmin() {
    return this.authService.currentUser?.role === 'admin';
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
