import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeStateService {
  // Trạng thái dự án hiện tại (Dùng để filter danh sách BĐS ở các trang con)
  private currentProjectIdSource = new BehaviorSubject<string | null>(null);
  currentProjectId$ = this.currentProjectIdSource.asObservable();

  private currentThemeIdSource = new BehaviorSubject<string>('minimalist');
  currentThemeId$ = this.currentThemeIdSource.asObservable();

  // Trạng thái BĐS Yêu thích (Lưu vào localStorage)
  private favoritePropertiesSource = new BehaviorSubject<string[]>(this.loadFavorites());
  favoriteProperties$ = this.favoritePropertiesSource.asObservable();

  constructor() {}

  setProjectState(projectId: string | null, themeId: string) {
    this.currentProjectIdSource.next(projectId);
    this.currentThemeIdSource.next(themeId);
  }

  // -- Xử lý Tính năng Yêu thích (Favorites) --
  private loadFavorites(): string[] {
    if (typeof localStorage !== 'undefined') {
      const favs = localStorage.getItem('favorite_properties');
      return favs ? JSON.parse(favs) : [];
    }
    return [];
  }

  toggleFavorite(propertyId: string) {
    const currentFavs = this.favoritePropertiesSource.value;
    const newFavs = currentFavs.includes(propertyId) 
      ? currentFavs.filter(id => id !== propertyId) // Remove
      : [...currentFavs, propertyId];               // Add
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('favorite_properties', JSON.stringify(newFavs));
    }
    this.favoritePropertiesSource.next(newFavs);
  }

  isFavorite(propertyId: string): boolean {
    return this.favoritePropertiesSource.value.includes(propertyId);
  }
}