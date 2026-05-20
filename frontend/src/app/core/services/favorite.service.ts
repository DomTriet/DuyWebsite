import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Nếu đã đăng nhập, lấy mảng ID từ DB về để đồng bộ
        this.api.get<any>('/favorites/ids').subscribe({
          next: (res) => {
            this.favoritesSubject.next(res.data || []);
            localStorage.setItem('favorites', JSON.stringify(res.data || []));
          }
        });
      } else {
        const saved = localStorage.getItem('favorites');
        if (saved) this.favoritesSubject.next(JSON.parse(saved));
      }
    }
  }

  toggleFavorite(propertyId: string) {
    const current = this.favoritesSubject.value;
    const index = current.indexOf(propertyId);
    const next = index > -1 ? current.filter(id => id !== propertyId) : [...current, propertyId];
    
    // Optimistic UI: Đổi UI ngay lập tức
    this.favoritesSubject.next(next);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('favorites', JSON.stringify(next));

    // Đồng bộ ngầm lên server nếu có token
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('access_token') : null;
    if (token) {
      this.api.post('/favorites/toggle', { property_id: propertyId }).subscribe({
        error: () => {
          // Rollback nếu Server lỗi
          this.favoritesSubject.next(current);
          if (isPlatformBrowser(this.platformId)) localStorage.setItem('favorites', JSON.stringify(current));
        }
      });
    }
  }

  isFavorite(propertyId: string): boolean {
    return this.favoritesSubject.value.includes(propertyId);
  }
}