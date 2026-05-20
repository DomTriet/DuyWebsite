import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">Nhật ký hệ thống</h1>
        <p class="text-gray-600 mt-2">Theo dõi hoạt động của người dùng và quản trị viên</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Thời gian</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Tài khoản</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Hành động</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Chi tiết</th>
              </tr>
            </thead>
            
            <tbody *ngIf="isLoading" class="divide-y divide-gray-200">
              <tr *ngFor="let i of [1,2,3,4,5]" class="hover:bg-gray-50/50 animate-pulse">
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-48"></div></td>
                <td class="px-6 py-4"><div class="h-6 bg-gray-200 rounded-full w-32"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-full"></div></td>
              </tr>
            </tbody>

            <tbody *ngIf="!isLoading && logs.length === 0" class="divide-y divide-gray-200">
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">Không có dữ liệu</td>
              </tr>
            </tbody>

            <tbody *ngIf="!isLoading && logs.length > 0" class="divide-y divide-gray-200 text-sm">
              <tr *ngFor="let log of logs" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-gray-700 font-mono">
                  {{ log.created_at | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-900">{{ log.profiles?.full_name || log.profiles?.username || 'System' }}</span>
                    <span class="text-xs text-gray-500 font-mono">[{{ log.profiles?.role || 'N/A' }}]</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 text-xs font-bold rounded-lg border" [ngClass]="getActionClass(log.action)">
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-700">{{ log.details }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SystemLogsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  logs: any[] = [];
  isLoading = true;

  ngOnInit() { this.loadLogs(); }
  loadLogs() {
    this.api.get<any>('/logs').subscribe({
      next: (res: any) => { 
        this.logs = res.data || (Array.isArray(res) ? res : []); 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => { console.error('Lỗi tải logs:', err); this.isLoading = false; this.cdr.detectChanges(); }
    });
  }
  getActionClass(action: string): string {
    if (action.includes('CREATE') || action.includes('INSERT')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-600 border-blue-200';
    if (action.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}
