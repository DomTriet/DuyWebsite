import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-agent-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">Duyệt yêu cầu môi giới</h1>
        <p class="text-gray-600 mt-2">Xét duyệt đơn đăng ký trở thành môi giới từ thành viên</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-6 py-4 font-bold text-gray-900 text-sm">Yêu cầu từ</th>
              <th class="px-6 py-4 font-bold text-gray-900 text-sm">Kinh nghiệm</th>
              <th class="px-6 py-4 font-bold text-gray-900 text-sm">Khu vực</th>
              <th class="px-6 py-4 font-bold text-gray-900 text-sm">Ngày nộp</th>
              <th class="px-6 py-4 font-bold text-gray-900 text-sm text-right">Quyết định</th>
            </tr>
          </thead>
          
          <tbody *ngIf="isLoading" class="divide-y divide-gray-200">
            <tr *ngFor="let i of [1,2,3]" class="hover:bg-gray-50/50 animate-pulse">
              <td colspan="5" class="px-6 py-4"><div class="h-8 bg-gray-200 rounded-lg w-full"></div></td>
            </tr>
          </tbody>

          <tbody *ngIf="!isLoading && requests.length === 0" class="divide-y divide-gray-200">
            <tr><td colspan="5" class="px-6 py-12 text-center text-gray-500">Không có yêu cầu chờ duyệt</td></tr>
          </tbody>

          <tbody *ngIf="!isLoading" class="divide-y divide-gray-200">
            <tr *ngFor="let req of requests" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-gray-900">{{ req.profiles?.full_name || 'N/A' }}</p>
                <p class="text-xs text-gray-600">{{ req.profiles?.phone || '-' }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700 font-semibold">{{ req.request_data?.experience_years || 0 }} năm</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ req.request_data?.area || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ req.created_at | date:'dd/MM/yyyy' }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button (click)="updateStatus(req.id, 'approved')" class="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-bold text-sm transition-all">Chấp thuận</button>
                  <button (click)="updateStatus(req.id, 'rejected')" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold text-sm transition-all">Từ chối</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AgentRequestsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  requests: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.api.get<any>('/leads/agent-requests').subscribe({
      next: (res: any) => { 
        this.requests = res.data || (Array.isArray(res) ? res : []); 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => { console.error('Lỗi tải agent requests:', err); this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  updateStatus(id: string, status: 'approved' | 'rejected') {
    const actionStr = status === 'approved' ? 'Phê duyệt' : 'Từ chối';
    if (confirm(`Bạn có chắc muốn ${actionStr} yêu cầu này?`)) {
      this.api.put<any>(`/leads/agent-requests/${id}/status`, { status }).subscribe({
        next: () => this.loadRequests(),
        error: (err) => alert(`${actionStr} thất bại: ` + (err.error?.error || 'Lỗi hệ thống'))
      });
    }
  }
}
