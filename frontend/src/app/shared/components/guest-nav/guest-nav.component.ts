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
      position: absolute; right: 0; top: calc(100% + 8px); min-width: 200px; max-width: calc(100vw - 24px);
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
    /* Hamburger */
    .hamburger {
      display: flex; flex-direction: column; gap: 5px; background: none; border: none;
      cursor: pointer; border-radius: 8px; min-width: 44px; min-height: 44px;
      align-items: center; justify-content: center; padding: 10px;
      transition: background .15s; flex-shrink: 0;
    }
    .hamburger:hover { background: #F7F6F3; }
    .hamburger span { display: block; width: 20px; height: 2px; background: #0D0D0D; border-radius: 2px; }
    @media (min-width: 768px) { .hamburger { display: none !important; } }
    /* Mobile Drawer */
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 150;
      backdrop-filter: blur(2px);
    }
    .mobile-drawer {
      position: fixed; top: 0; left: 0; bottom: 0; width: 78vw; max-width: 300px;
      background: #fff; z-index: 151; overflow-y: auto;
      box-shadow: 0 0 48px rgba(0,0,0,0.18);
      animation: drawerSlide .22s cubic-bezier(0.16,1,0.3,1);
      display: flex; flex-direction: column;
    }
    @keyframes drawerSlide {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }
    .drawer-link {
      display: flex; align-items: center; gap: 10px; padding: 13px 24px;
      font-size: 0.95rem; font-weight: 600; color: #374151;
      text-decoration: none; transition: background .12s; min-height: 44px;
      border: none; background: none; cursor: pointer; width: 100%; text-align: left;
    }
    .drawer-link:hover { background: #F7F6F3; color: #0D0D0D; }
    .drawer-link.active { background: #F7F6F3; color: #0D0D0D; }
    .drawer-divider { height: 1px; background: #EBEBEB; margin: 8px 24px; }
  `],
  template: `
    <nav class="sticky top-0 z-50 bg-white/96 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-3">

        <!-- Hamburger (mobile only) -->
        <button class="hamburger md:hidden" (click)="mobileMenuOpen = true"
                aria-label="Mở menu điều hướng" [attr.aria-expanded]="mobileMenuOpen">
          <span></span><span></span><span></span>
        </button>

        <!-- Logo — mr-auto on mobile pushes auth buttons to right -->
        <a routerLink="/" style="text-decoration:none; flex-shrink:0;" class="mr-auto md:mr-0">
          <app-logo variant="compact" compactWidth="160px" compactHeight="39"></app-logo>
        </a>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-8 flex-1 justify-center">
          <a routerLink="/"        class="nav-link" [class.active]="active === 'home'">{{ 'NAVBAR.HOME'      | translate }}</a>
          <a routerLink="/about"   class="nav-link" [class.active]="active === 'about'">{{ 'NAVBAR.ABOUT'    | translate }}</a>
          <a routerLink="/blogs"   class="nav-link" [class.active]="active === 'blogs'">{{ 'NAVBAR.NEWS'     | translate }}</a>
          <a routerLink="/contact" class="nav-link" [class.active]="active === 'contact'">{{ 'NAVBAR.CONTACT' | translate }}</a>
          <a *ngIf="forumEnabled$ | async" routerLink="/forum" class="nav-link" [class.active]="active === 'forum'">{{ 'NAVBAR.COMMUNITY' | translate }}</a>
        </div>

        <!-- Right: lang + auth -->
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <app-language-selector></app-language-selector>

          <ng-container *ngIf="!isLoggedIn">
            <!-- Login: desktop only — mobile uses drawer -->
            <a routerLink="/auth/login"
               class="hidden md:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {{ 'NAVBAR.LOGIN' | translate }}
            </a>
            <a routerLink="/auth/register"
               style="background:#0D0D0D; color:#F7F6F3; padding:11px 16px; border-radius:8px; font-size:0.85rem; font-weight:700; text-decoration:none; transition:background 0.2s; min-height:44px; display:inline-flex; align-items:center;"
               onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">
              {{ 'NAVBAR.REGISTER' | translate }}
            </a>
          </ng-container>

          <!-- Đã đăng nhập: menu tài khoản -->
          <div *ngIf="isLoggedIn" class="relative">
            <button (click)="menuOpen = !menuOpen"
                    [attr.aria-label]="menuOpen ? 'Đóng menu tài khoản' : 'Mở menu tài khoản'"
                    [attr.aria-expanded]="menuOpen"
                    style="display:flex; align-items:center; gap:8px; background:#0D0D0D; color:#F7F6F3; padding:6px 12px 6px 8px; border-radius:8px; font-size:0.85rem; font-weight:700; border:none; cursor:pointer; transition:background 0.2s;"
                    onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">
              <span class="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold uppercase">
                {{ userInitial }}
              </span>
              <span class="hidden sm:inline max-w-[120px] truncate">{{ userName || ('NAVBAR.PROFILE' | translate) }}</span>
              <svg class="w-4 h-4 transition-transform" [class.rotate-180]="menuOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

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

    <!-- Drawer Overlay -->
    <div *ngIf="mobileMenuOpen" class="drawer-overlay md:hidden" (click)="mobileMenuOpen = false"></div>

    <!-- Mobile Drawer -->
    <div *ngIf="mobileMenuOpen" class="mobile-drawer md:hidden" role="dialog" aria-modal="true" aria-label="Menu điều hướng">

      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 14px 14px 20px; border-bottom:1px solid #EBEBEB; flex-shrink:0;">
        <app-logo variant="compact" compactWidth="148px" compactHeight="36"></app-logo>
        <button (click)="mobileMenuOpen = false" aria-label="Đóng menu"
                style="background:none; border:none; cursor:pointer; padding:10px; border-radius:8px; min-width:44px; min-height:44px; display:flex; align-items:center; justify-content:center; color:#374151; transition:background .15s;"
                onmouseover="this.style.background='#F7F6F3'" onmouseout="this.style.background='transparent'">
          <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Nav Links -->
      <div style="flex:1; padding:8px 0; overflow-y:auto;">
        <a routerLink="/" (click)="mobileMenuOpen=false" class="drawer-link" [class.active]="active==='home'">
          <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          {{ 'NAVBAR.HOME' | translate }}
        </a>
        <a routerLink="/about" (click)="mobileMenuOpen=false" class="drawer-link" [class.active]="active==='about'">
          <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ 'NAVBAR.ABOUT' | translate }}
        </a>
        <a routerLink="/blogs" (click)="mobileMenuOpen=false" class="drawer-link" [class.active]="active==='blogs'">
          <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v4m2 4h.01M15 17h6m-3-3v6"/>
          </svg>
          {{ 'NAVBAR.NEWS' | translate }}
        </a>
        <a routerLink="/contact" (click)="mobileMenuOpen=false" class="drawer-link" [class.active]="active==='contact'">
          <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          {{ 'NAVBAR.CONTACT' | translate }}
        </a>
        <ng-container *ngIf="forumEnabled$ | async">
          <a routerLink="/forum" (click)="mobileMenuOpen=false" class="drawer-link" [class.active]="active==='forum'">
            <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
            </svg>
            {{ 'NAVBAR.COMMUNITY' | translate }}
          </a>
        </ng-container>

        <!-- Logged-in profile links -->
        <ng-container *ngIf="isLoggedIn">
          <div class="drawer-divider"></div>
          <a routerLink="/profile" (click)="mobileMenuOpen=false" class="drawer-link">
            <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {{ 'NAVBAR.PROFILE' | translate }}
          </a>
          <a *ngIf="isStaff" routerLink="/admin" (click)="mobileMenuOpen=false" class="drawer-link">
            <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"/>
            </svg>
            Trang quản trị
          </a>
        </ng-container>
      </div>

      <!-- Auth Buttons (bottom, not logged in) -->
      <div *ngIf="!isLoggedIn" style="padding:16px 20px; border-top:1px solid #EBEBEB; display:flex; flex-direction:column; gap:10px; flex-shrink:0;">
        <a routerLink="/auth/login" (click)="mobileMenuOpen=false"
           style="display:flex; align-items:center; justify-content:center; min-height:44px; border:1.5px solid #D1D5DB; border-radius:8px; font-size:0.9rem; font-weight:700; color:#374151; text-decoration:none; transition:background .15s;"
           onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
          {{ 'NAVBAR.LOGIN' | translate }}
        </a>
        <a routerLink="/auth/register" (click)="mobileMenuOpen=false"
           style="display:flex; align-items:center; justify-content:center; min-height:44px; background:#0D0D0D; border-radius:8px; font-size:0.9rem; font-weight:700; color:#F7F6F3; text-decoration:none; transition:background .15s;"
           onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'">
          {{ 'NAVBAR.REGISTER' | translate }}
        </a>
      </div>

      <!-- Logout (bottom, logged in) -->
      <div *ngIf="isLoggedIn" style="padding:16px 20px; border-top:1px solid #EBEBEB; flex-shrink:0;">
        <button (click)="logout()"
                style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; min-height:44px; background:none; border:1.5px solid #FCA5A5; border-radius:8px; font-size:0.9rem; font-weight:700; color:#DC2626; cursor:pointer; transition:background .15s;"
                onmouseover="this.style.background='#FFF1F2'" onmouseout="this.style.background='transparent'">
          <svg style="width:18px;height:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {{ 'NAVBAR.LOGOUT' | translate }}
        </button>
      </div>
    </div>
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
  mobileMenuOpen = false;

  ngOnInit() {
    this.auth.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.isLoggedIn = !!user;
      const role = (user as any)?.role;
      this.isStaff = role === 'admin' || role === 'agent';
      this.userName = (user as any)?.full_name || (user as any)?.email || '';
      this.userInitial = (this.userName || 'U').trim().charAt(0).toUpperCase() || 'U';
      this.menuOpen = false;
      this.mobileMenuOpen = false;
    });
  }

  async logout() {
    this.menuOpen = false;
    this.mobileMenuOpen = false;
    const ok = await this.confirm.ask({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất?',
      confirmText: 'Đăng xuất'
    });
    if (ok) this.auth.logout('/').subscribe();
  }
}
