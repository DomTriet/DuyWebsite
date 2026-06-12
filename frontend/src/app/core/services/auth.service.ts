import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { Session, User } from '../models/User';
import { BehaviorSubject, Observable, tap, switchMap, of, map, catchError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private toast = inject(ToastService);
  
  // Quản lý trạng thái User hiện hành
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  private timeoutId: any;
  private readonly TIMEOUT_MS = 15 * 60 * 1000; // 15 phút

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const resetFn = () => this.resetInactivityTimeout();
      window.addEventListener('mousemove', resetFn);
      window.addEventListener('keydown', resetFn);
      window.addEventListener('click', resetFn);
      window.addEventListener('scroll', resetFn);
      this.resetInactivityTimeout();
    }
  }

  public resetInactivityTimeout() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.currentUserSubject.value) {
      this.timeoutId = setTimeout(() => {
        this.toast.warning('Phiên làm việc đã hết hạn do không có tương tác. Vui lòng đăng nhập lại.', 'Phiên hết hạn');
        this.logout('/auth/login').subscribe();
      }, this.TIMEOUT_MS);
    }
  }

  updateCurrentUser(userData: Partial<User>) {
    const current = this.currentUser;
    if (current) {
      const updated = { ...current, ...userData };
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('user', JSON.stringify(updated));
      }
      this.currentUserSubject.next(updated);
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: any): Observable<any> {
    return this.api.post<any>('/auth/login', credentials).pipe(
      switchMap(response => {
        const session = response.session || response.data?.session || response;
        const user = response.user || response.data?.user || session?.user;
        
        if (session && session.access_token) {
          // 1. Lưu token trước để Interceptor có thể đính kèm vào Header cho request kế tiếp
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', session.access_token);
          }
          
          // 2. Gọi API lấy profile từ DB để đồng bộ Role chuẩn xác nhất từ bảng public.profiles
          return this.api.get<any>('/profiles/me').pipe(
            map(profileRes => {
              const dbProfile = profileRes.data || {};
              // Ưu tiên sử dụng role và thông tin từ DB đè lên session cũ
              const normalizedUser = { ...user, ...dbProfile }; 
              
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('user', JSON.stringify(normalizedUser));
              }
              this.currentUserSubject.next(normalizedUser);
              this.resetInactivityTimeout();
              
              return response; // Trả về response gốc cho Component xử lý
            }),
            catchError(() => of(response)) // Nếu lỗi lấy profile, vẫn cho phép đăng nhập qua
          );
        }
        
        return of(response);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.api.post<any>('/auth/register', data);
  }

  logout(redirectTo: string = '/'): Observable<any> {
    // Luôn đăng xuất phía client DÙ API có lỗi (token hết hạn → /auth/logout trả 401).
    // Nếu chỉ dựa vào thành công của API thì người dùng sẽ kẹt không thoát được.
    return this.api.post<any>('/auth/logout', {}).pipe(
      catchError(() => of(null)),
      tap(() => {
        this.clearSession(redirectTo);
        this.toast.success('Bạn đã đăng xuất.');
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.api.post<any>('/auth/forgot-password', { email });
  }

  resetPassword(new_password: string): Observable<any> {
    return this.api.post<any>('/auth/reset-password', { new_password });
  }

  clearSession(redirectTo: string = '/auth/login'): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.router.navigate([redirectTo]);
  }
}