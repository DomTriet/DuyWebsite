import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Notification {
  id: number;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  public readonly notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  public readonly unreadCount$: Observable<number> = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );

  constructor() { }

  /**
   * Thêm một thông báo mới vào đầu danh sách.
   * @param title Tiêu đề thông báo
   * @param message Nội dung chi tiết
   * @param link Đường dẫn khi bấm vào thông báo
   */
  addNotification(title: string, message: string, link?: string): void {
    const newNotification: Notification = {
      id: this.nextId++,
      title,
      message,
      link,
      read: false,
      timestamp: new Date()
    };
    const currentNotifications = this.notificationsSubject.getValue();
    // Thêm vào đầu mảng để thông báo mới nhất luôn ở trên cùng
    this.notificationsSubject.next([newNotification, ...currentNotifications]);
  }

  /**
   * Đánh dấu một thông báo là đã đọc.
   * @param id ID của thông báo
   */
  markAsRead(id: number): void {
    const currentNotifications = this.notificationsSubject.getValue();
    const updatedNotifications = currentNotifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc.
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.getValue();
    if (currentNotifications.every(n => n.read)) return;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updatedNotifications);
  }
}
