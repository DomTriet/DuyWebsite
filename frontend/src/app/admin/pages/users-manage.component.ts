import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-users-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">Quản lý người dùng</h1>
        <p class="text-gray-600 mt-2">Quản lý quyền hạn và thông tin các thành viên</p>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <!-- Table Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Người dùng</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Số điện thoại</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Cập nhật</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm text-right">Quyền hạn</th>
              </tr>
            </thead>
            
            <!-- Loading -->
            <tbody *ngIf="isLoading" class="divide-y divide-gray-200">
              <tr *ngFor="let i of [1,2,3,4]" class="hover:bg-gray-50 transition-colors animate-pulse">
                <td class="px-6 py-4"><div class="h-10 bg-gray-200 rounded-lg w-48"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-6 py-4"><div class="h-8 bg-gray-200 rounded w-32 ml-auto"></div></td>
              </tr>
            </tbody>

            <!-- Data -->
            <tbody *ngIf="!isLoading" class="divide-y divide-gray-200">
              <tr *ngFor="let user of users" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img *ngIf="user.avatar_url" [src]="user.avatar_url" class="w-10 h-10 rounded-full object-cover border border-gray-300">
                    <div *ngIf="!user.avatar_url" class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {{ (user.full_name || user.username || 'U').substring(0,2).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">{{ user.full_name || user.username || 'N/A' }}</p>
                      <p class="text-xs text-gray-500 font-mono">{{ user.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ user.phone || '-' }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ user.updated_at | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 text-right">
                  <select [ngModel]="user.role" (ngModelChange)="changeRole(user.id, $event)" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer font-semibold transition-all">
                    <option value="member">Thành viên</option>
                    <option value="agent">Môi giới</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersManageComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  users: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.get<any>('/profiles').subscribe({
      next: (res: any) => { 
        this.users = res.data || (Array.isArray(res) ? res : []); 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => { console.error('Lỗi tải users:', err); this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  changeRole(userId: string, newRole: string) {
    if (confirm(`Bạn có chắc muốn đổi quyền người dùng này thành ${newRole.toUpperCase()}?`)) {
      this.api.put<any>(`/profiles/${userId}/role`, { role: newRole }).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('Đổi quyền thất bại: ' + (err.error?.error || 'Lỗi hệ thống'))
      });
    }
  }
}
