import { Component, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-guest-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent, LogoComponent],
  styles: [`
    .nav-link {
      position: relative; font-size: 0.85rem; font-weight: 500;
      color: #374151; text-decoration: none; transition: color 0.2s;
      padding-bottom: 2px;
    }
    .nav-link::after {
      content: ''; position: absolute; bottom: -2px; left: 0;
      width: 0; height: 2px; background: #0D0D0D;
      transition: width 0.25s ease;
    }
    .nav-link:hover { color: #0D0D0D; }
    .nav-link:hover::after { width: 100%; }
    .nav-link.active { color: #0D0D0D; }
    .nav-link.active::after { width: 100%; }
    .acct-menu {
      position: absolute; right: 0; top: calc(100% + 8px); min-width: 200px;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.12); overflow: hidden; z-index: 60;
      animation: acctPop .16s ease;
    }
    @keyframes acctPop { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform:none; } }
    .acct-item {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 11px 16px; font-size: 0.86rem; font-weight: 600; color: #374151;
      background: none; border: none; cursor: pointer; text-align: left; transition: background .12s;
    }
    .acct-item:hover { background: #f9fafb; }
    .acct-item.danger { color: #dc2626; }
    .acct-item.danger:hover { background: #fef2f2; }
  `],
  template: `
    <nav class="sticky top-0 z-50 bg-white/96 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        <!-- Logo -->
        <a routerLink="/" style="text-decoration:none; flex-shrink:0;">
          <app-logo size="1.05rem"></app-logo>
        </a>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-8">
          <a routerLink="/"       class="nav-link" [class.active]="active === 'home'">{{ 'NAVBAR.HOME'    | translate }}</a>
          <a routerLink="/about"  class="nav-link" [class.active]="active === 'about'">{{ 'NAVBAR.ABOUT'   | translate }}</a>
          <a routerLink="/blogs"  class="nav-link" [class.active]="active === 'blogs'">{{ 'NAVBAR.NEWS'    | translate }}</a>
          <a routerLink="/contact" class="nav-link" [class.active]="active === 'contact'">{{ 'NAVBAR.CONTACT' | translate }}</a>
          <a *ngIf="forumEnabled$ | async" routerLink="/forum" class="nav-link" [class.active]="active === 'forum'">{{ 'NAVBAR.COMMUNITY' | translate }}</a>
        </div>

        <!-- Right: lang + auth -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <app-language-selector></app-language-selector>

          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/auth/login"
               class="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {{ 'NAVBAR.LOGIN' | translate }}
            </a>
            <a routerLink="/auth/register"
               style="background:#0D0D0D; color:#F7F6F3; padding:8px 16px; border-radius:8px; font-size:0.85rem; font-weight:700; text-decoration:none; transition:background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">
              {{ 'NAVBAR.REGISTER' | translate }}
            </a>
          </ng-container>

          <!-- Đã đăng nhập: menu tài khoản -->
          <div *ngIf="isLoggedIn" class="relative">
            <button (click)="menuOpen = !menuOpen"
                    [attr.aria-label]="(menuOpen ? 'Đóng menu tài khoản' : 'Mở menu tài khoản')"
                    [attr.aria-expanded]="menuOpen"
                    style="display:flex; align-items:center; gap:8px; background:#0D0D0D; color:#F7F6F3; padding:6px 12px 6px 8px; border-radius:8px; font-size:0.85rem; font-weight:700; border:none; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">
              <span class="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold uppercase">
                {{ userInitial }}
              </span>
              <span class="hidden sm:inline max-w-[120px] truncate">{{ userName || ('NAVBAR.PROFILE' | translate) }}</span>
              <svg class="w-4 h-4 transition-transform" [class.rotate-180]="menuOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Backdrop để click ra ngoài đóng menu -->
            <div *ngIf="menuOpen" class="fixed inset-0 z-50" (click)="menuOpen = false"></div>

            <div *ngIf="menuOpen" class="acct-menu">
              <a routerLink="/profile" (click)="menuOpen = false" class="acct-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                {{ 'NAVBAR.PROFILE' | translate }}
              </a>
              <a *ngIf="isStaff" routerLink="/admin" (click)="menuOpen = false" class="acct-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"/>
                </svg>
                Trang quản trị
              </a>
              <button (click)="logout()" class="acct-item danger">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                {{ 'NAVBAR.LOGOUT' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class GuestNavComponent implements OnInit {
  @Input() active: 'home' | 'about' | 'blogs' | 'contact' | 'forum' | '' = '';

  private auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  private settings = inject(SettingsService);
  private destroyRef = inject(DestroyRef);

  forumEnabled$: Observable<boolean> = this.settings.getSetting('forum_enabled');
  isLoggedIn = false;
  isStaff = false;
  userName = '';
  userInitial = 'U';
  menuOpen = false;

  ngOnInit() {
    // Trạng thái đăng nhập phản ứng theo AuthService → cập nhật ngay khi login/logout, không cần reload.
    this.auth.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.isLoggedIn = !!user;
      const role = (user as any)?.role;
      this.isStaff = role === 'admin' || role === 'agent';
      this.userName = (user as any)?.full_name || (user as any)?.email || '';
      this.userInitial = (this.userName || 'U').trim().charAt(0).toUpperCase() || 'U';
      this.menuOpen = false;
    });
  }

  async logout() {
    this.menuOpen = false;
    const ok = await this.confirm.ask({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất?',
      confirmText: 'Đăng xuất'
    });
    if (ok) this.auth.logout('/').subscribe();
  }
}
