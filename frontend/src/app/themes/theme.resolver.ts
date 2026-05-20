import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../core/services/api.service';

/**
 * Theme Resolver: Nhận diện Theme ID trước khi nạp giao diện.
 * Nếu tìm thấy dự án, trả về theme_id (vd: 'luxury', 'eco-green').
 * Nếu không tìm thấy hoặc có lỗi, fallback về 'minimalist'.
 */
export const themeResolver: ResolveFn<any> = (route, state): Observable<any> => {
  const apiService = inject(ApiService);
  const router = inject(Router);
  
  // Lấy ID hoặc Slug của dự án từ thanh URL (Giả sử route là /project/:id)
  const projectId = route.paramMap.get('id');

  if (!projectId) {
    // Nếu không có projectId (ví dụ trang chủ chung), fallback về theme mặc định
    return of({ id: null, theme_id: 'minimalist', name: 'Default Theme' });
  }

  // Gọi API lấy thông tin dự án để kiểm tra xem dự án này đang được cấu hình dùng Theme nào
  return apiService.get<any>(`/projects/${projectId}`).pipe(
    map(res => res.data || { id: projectId, theme_id: 'minimalist' }),
    catchError(err => {
      console.error('[ThemeResolver] Không thể lấy thông tin dự án, đang chuyển về fallback theme...', err);
      return of({ id: projectId, theme_id: 'minimalist' });
    })
  );
};