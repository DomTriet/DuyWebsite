import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500; color: #94a3b8;
      text-decoration: none; transition: all 0.18s;
    }
    .nav-item:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; }
    .nav-item.active { background: rgba(255,255,255,0.12); color: #F7F6F3; font-weight: 600; }
    .nav-item svg { flex-shrink: 0; opacity: 0.6; }
    .nav-item.active svg { opacity: 1; }
    .section-label {
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: #475569; padding: 0 14px;
      margin: 20px 0 8px;
    }
  `],
  template: `
    <aside class="h-screen w-64 bg-slate-900 flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800">

      <!-- Logo -->
      <div class="px-5 py-5 border-b border-slate-800">
        <div style="font-family:'Space Grotesk',system-ui,sans-serif; font-size:1.0rem; font-weight:800; letter-spacing:-0.03em; color:#F7F6F3;">Điểm Tâm BĐS</div>
        <div class="text-xs text-slate-500 mt-0.5">Admin Dashboard</div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

        <!-- Chung -->
        <div class="section-label">Menu chính</div>

        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          Dashboard
        </a>

        <a routerLink="/admin/properties" routerLinkActive="active" class="nav-item">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"/>
          </svg>
          Quản lý BĐS
        </a>

        <a routerLink="/admin/leads" routerLinkActive="active" class="nav-item">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
          Khách hàng
        </a>

        <a routerLink="/admin/blogs-manage" routerLinkActive="active" class="nav-item">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd"/>
            <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"/>
          </svg>
          Blog & Tin tức
          <span *ngIf="pendingBlogCount > 0"
                class="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {{ pendingBlogCount }}
          </span>
        </a>

        <a routerLink="/admin/account-settings" routerLinkActive="active" class="nav-item">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
          </svg>
          Cài đặt
        </a>

        <!-- Admin only -->
        <ng-container *ngIf="isAdmin">
          <div class="section-label">Quản trị</div>

          <a routerLink="/admin/projects" routerLinkActive="active" class="nav-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
            </svg>
            Dự án & Danh mục
          </a>

          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"/>
            </svg>
            Quản lý User
          </a>

          <a routerLink="/admin/agent-requests" routerLinkActive="active" class="nav-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            Yêu cầu Môi giới
          </a>

          <a routerLink="/admin/translations-manage" routerLinkActive="active" class="nav-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78 18.87 18.87 0 001.724 4.78c.341.37.741.7 1.176.97a1 1 0 01-1.01 1.72A10.976 10.976 0 017.97 16.06 18.87 18.87 0 016 11.28a18.87 18.87 0 01-1.97 4.78 10.976 10.976 0 01-1.19 1.42 1 1 0 01-1.41-1.41 8.93 8.93 0 001.01-.97 18.87 18.87 0 001.724-4.78A18.87 18.87 0 003.422 6H3a1 1 0 010-2h3V3a1 1 0 011-1zm8 5a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L15 13.586V8a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Dịch thuật
          </a>

          <a routerLink="/admin/system-logs" routerLinkActive="active" class="nav-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
            Nhật ký Hệ thống
          </a>

          <a routerLink="/admin/homepage-banners" routerLinkActive="active" class="nav-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
            </svg>
            Banner Trang Chủ
          </a>

          <a routerLink="/admin/site-settings" routerLinkActive="active" class="nav-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            Cài đặt Website
          </a>
        </ng-container>
      </nav>

      <!-- User info bottom -->
      <div class="px-4 py-4 border-t border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ userInitial }}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-slate-200 truncate">{{ userName }}</div>
            <div class="text-xs text-slate-500">{{ isAdmin ? 'Admin' : 'Agent' }}</div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private authService = inject(AuthService);

  get isAdmin() { return this.authService.currentUser?.role === 'admin'; }
  get userName() { return this.authService.currentUser?.full_name || 'User'; }
  get userInitial() { return (this.userName[0] || 'U').toUpperCase(); }
  pendingBlogCount = 0; // sẽ được set từ header/dashboard khi cần
}
