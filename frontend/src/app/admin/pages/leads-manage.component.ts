import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-leads-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">Quản lý khách hàng</h1>
        <p class="text-gray-600 mt-2">Theo dõi và cập nhật thông tin khách hàng (Leads)</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Khách hàng</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Bất động sản quan tâm</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Ghi chú</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm">Trạng thái</th>
                <th class="px-6 py-4 font-bold text-gray-900 text-sm text-right">Lưu</th>
              </tr>
            </thead>
            
            <tbody *ngIf="isLoading" class="divide-y divide-gray-200">
              <tr *ngFor="let i of [1,2,3]" class="hover:bg-gray-50/50 animate-pulse">
                <td class="px-6 py-4"><div class="h-10 bg-gray-200 rounded-lg w-full"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-6 py-4"><div class="h-16 bg-gray-200 rounded-lg w-full"></div></td>
                <td class="px-6 py-4"><div class="h-8 bg-gray-200 rounded-lg w-24"></div></td>
                <td class="px-6 py-4"><div class="h-8 bg-gray-200 rounded-lg w-16 ml-auto"></div></td>
              </tr>
            </tbody>

            <tbody *ngIf="!isLoading && leads.length === 0" class="divide-y divide-gray-200">
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">Chưa có khách hàng nào</td>
              </tr>
            </tbody>

            <tbody *ngIf="!isLoading && leads.length > 0" class="divide-y divide-gray-200">
              <tr *ngFor="let lead of leads" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                  <p class="text-sm font-bold text-gray-900">{{ lead.customer_name }}</p>
                  <p class="text-xs text-gray-600">{{ lead.customer_phone || '-' }} • {{ lead.customer_email || '-' }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700 font-bold">
                  {{ lead.properties?.title || '(Đã xóa)' }}
                </td>
                <td class="px-6 py-4">
                  <textarea [(ngModel)]="lead.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none" placeholder="Ghi chú..."></textarea>
                </td>
                <td class="px-6 py-4">
                  <select [(ngModel)]="lead.status" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-gray-900 outline-none">
                    <option value="new">Mới</option>
                    <option value="contacted">Đã liên hệ</option>
                    <option value="interested">Đang tư vấn</option>
                    <option value="closed">Đã chốt</option>
                    <option value="lost">Hủy</option>
                  </select>
                </td>
                <td class="px-6 py-4 text-right">
                  <button (click)="updateLead(lead)" class="px-4 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors">
                    Lưu
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LeadsManageComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  leads: any[] = [];
  isLoading = true;

  ngOnInit() { this.loadLeads(); }
  loadLeads() {
    this.api.get<any>('/leads').subscribe({
      next: (res: any) => { 
        this.leads = res.data || (Array.isArray(res) ? res : []); 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => { console.error('Lỗi tải leads:', err); this.isLoading = false; this.cdr.detectChanges(); }
    });
  }
  updateLead(lead: any) {
    this.api.put<any>(`/leads/${lead.id}`, { status: lead.status, notes: lead.notes }).subscribe({
      next: () => this.toast.success('Cập nhật trạng thái và ghi chú thành công!'),
      error: (err) => this.toast.error('Lỗi: ' + (err.error?.error || 'Lỗi hệ thống'))
    });
  }
}
