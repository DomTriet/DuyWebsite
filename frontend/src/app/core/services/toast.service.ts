import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

/**
 * Thông báo nổi tức thời (toast) trong app — thay thế alert() của trình duyệt.
 * Tự động ẩn sau `duration` ms. Khác với NotificationService (trung tâm chuông lưu lịch sử).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public readonly toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  private push(type: ToastType, message: string, title?: string, duration = 4000) {
    const toast: Toast = { id: this.nextId++, type, message, title, duration };
    this.toastsSubject.next([...this.toastsSubject.getValue(), toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string, title?: string) { this.push('success', message, title); }
  error(message: string, title?: string)   { this.push('error', message, title, 6000); }
  warning(message: string, title?: string) { this.push('warning', message, title, 5000); }
  info(message: string, title?: string)    { this.push('info', message, title); }

  dismiss(id: number) {
    this.toastsSubject.next(this.toastsSubject.getValue().filter(t => t.id !== id));
  }
}
