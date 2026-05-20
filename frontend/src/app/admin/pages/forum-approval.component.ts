import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-forum-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">Duyệt diễn đàn</h1>
        <p class="text-gray-600 mt-2">Quản lý bài viết chờ duyệt và báo cáo vi phạm</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-gray-200 mb-8">
        <button (click)="activeTab = 'pending'" [ngClass]="activeTab === 'pending' ? 'bg-white border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'" class="py-3 px-6 font-bold text-sm transition-all border-b-2 border-transparent">
          Bài viết chờ duyệt
        </button>
        <button (click)="activeTab = 'reports'" [ngClass]="activeTab === 'reports' ? 'bg-white border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'" class="py-3 px-6 font-bold text-sm transition-all border-b-2 border-transparent">
          Báo cáo vi phạm
        </button>
      </div>

      <!-- Pending Posts Tab -->
      <div *ngIf="activeTab === 'pending'" class="space-y-6">
        <div *ngIf="isLoading" class="text-center py-12 text-gray-500">Đang tải...</div>
        <div *ngIf="!isLoading && pendingPosts.length === 0" class="bg-white rounded-2xl p-12 text-center text-gray-600 border border-gray-200">
          Không có bài viết chờ duyệt
        </div>
        
        <div *ngFor="let post of pendingPosts" class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all">
          <!-- Post Header -->
          <div class="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-black text-gray-900">{{ post.title }}</h3>
              <p class="text-sm text-gray-600 mt-2">Đăng bởi <span class="font-bold text-gray-900">{{ post.profiles?.full_name || 'User' }}</span> • {{ post.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <span class="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-xs font-bold whitespace-nowrap ml-4">Chờ duyệt</span>
          </div>

          <!-- Post Content -->
          <div class="p-6 bg-gray-50 border-b border-gray-200">
            <p class="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
          </div>
          
          <!-- Actions -->
          <div class="p-6 flex justify-end gap-3 bg-white">
            <button (click)="deletePost(post.id)" class="px-6 py-2.5 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-all">Xóa bài</button>
            <button (click)="approvePost(post.id)" class="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold transition-all">Phê duyệt</button>
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div *ngIf="activeTab === 'reports'" class="space-y-6">
        <div *ngIf="isLoading" class="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
        <div *ngIf="!isLoading && pendingReports.length === 0" class="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
          Không có báo cáo vi phạm nào cần xử lý.
        </div>

        <div *ngFor="let report of pendingReports" class="bg-white rounded-xl shadow-sm border border-rose-100 p-6">
          <div class="flex items-start gap-4 mb-4">
            <div class="p-3 bg-rose-50 text-rose-500 rounded-full">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-gray-800">Lý do báo cáo: <span class="text-rose-600">{{ report.reason }}</span></h3>
              <p class="text-sm text-gray-500 mt-1">Người báo cáo: {{ report.profiles?.full_name || 'Ẩn danh' }} - {{ report.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <p class="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Nội dung bài viết bị báo cáo:</p>
            <h4 class="font-semibold text-gray-800">{{ report.forum_posts?.title }}</h4>
            <p class="text-sm text-gray-600 mt-1 truncate">{{ report.forum_posts?.content }}</p>
          </div>

          <div class="flex gap-3 justify-end border-t border-gray-100 pt-4">
            <button (click)="resolveReport(report.id, 'dismiss')" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Bỏ qua báo cáo</button>
            <button (click)="resolveReport(report.id, 'delete_post')" class="px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-sm font-medium transition-colors">Xóa bài viết</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForumApprovalComponent implements OnInit {
  activeTab: 'pending' | 'reports' = 'pending';
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  pendingPosts: any[] = [];
  pendingReports: any[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.api.get<any>('/forum/pending').subscribe({
      next: (res: any) => { this.pendingPosts = res.data || (Array.isArray(res) ? res : []); this.checkDone(); },
      error: () => this.checkDone()
    });
    
    this.api.get<any>('/forum/reports/pending').subscribe({
      next: (res: any) => { this.pendingReports = res.data || (Array.isArray(res) ? res : []); this.checkDone(); },
      error: () => this.checkDone()
    });
  }

  checkDone() {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  approvePost(id: string) {
    if (confirm('Phê duyệt bài viết này cho hiển thị lên diễn đàn?')) {
      this.api.put<any>(`/forum/${id}/approve`, {}).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Lỗi: ' + (err.error?.error || 'Không thể phê duyệt'))
      });
    }
  }

  deletePost(id: string) {
    if (confirm('Bạn chắc chắn muốn xóa bài viết này vĩnh viễn?')) {
      this.api.delete<any>(`/forum/${id}`).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Lỗi: ' + (err.error?.error || 'Không thể xóa'))
      });
    }
  }

  resolveReport(reportId: string, action: 'dismiss' | 'delete_post') {
    const actName = action === 'dismiss' ? 'Bỏ qua' : 'Xóa bài';
    if (confirm(`Bạn chắc chắn muốn ${actName} báo cáo này?`)) {
      this.api.put<any>(`/forum/reports/${reportId}/resolve`, { action }).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Lỗi: ' + (err.error?.error || 'Không thể xử lý'))
      });
    }
  }
}
