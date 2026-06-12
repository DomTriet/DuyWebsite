import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';

type Filter = 'all' | 'pending' | 'published' | 'draft';

@Component({
  selector: 'app-blog-manage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .tab { padding: 8px 18px; font-size: 0.8rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.18s; border: none; background: transparent; color: #64748b; }
    .tab:hover { background: #f1f5f9; color: #334155; }
    .tab.active { background: #4f46e5; color: white; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
    .badge-published { background: #d1fae5; color: #065f46; }
    .badge-pending   { background: #fef3c7; color: #92400e; }
    .badge-draft     { background: #f1f5f9; color: #475569; }
    .btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.18s; }
    .btn-approve  { background: #d1fae5; color: #065f46; }
    .btn-approve:hover  { background: #10b981; color: white; }
    .btn-reject   { background: #fee2e2; color: #991b1b; }
    .btn-reject:hover   { background: #ef4444; color: white; }
    .btn-edit     { background: #e0e7ff; color: #3730a3; }
    .btn-edit:hover     { background: #6366f1; color: white; }
    .btn-delete   { background: #fee2e2; color: #991b1b; }
    .btn-delete:hover   { background: #ef4444; color: white; }
    .btn-preview  { background: #f0f9ff; color: #0369a1; }
    .btn-preview:hover  { background: #0ea5e9; color: white; }
    .row-pending { background: #fffbeb; }
  `],
  template: `
    <div class="space-y-5">

      <!-- Page header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Blog & Tin tức</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ isAdmin ? 'Duyệt và quản lý toàn bộ bài viết' : 'Quản lý bài viết của bạn' }}
            <span *ngIf="pendingCount > 0" class="ml-2 inline-flex items-center gap-1 text-amber-600 font-semibold">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
              {{ pendingCount }} bài chờ duyệt
            </span>
          </p>
        </div>
        <a routerLink="/admin/blogs-manage/create"
           class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Viết bài mới
        </a>
      </div>

      <!-- Filter tabs -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-2">
        <button class="tab" [class.active]="activeFilter==='all'"       (click)="setFilter('all')">
          Tất cả <span class="ml-1 text-gray-400 font-normal">({{ blogs.length }})</span>
        </button>
        <button class="tab" [class.active]="activeFilter==='pending'"   (click)="setFilter('pending')">
          ⏳ Chờ duyệt <span class="ml-1 text-amber-500 font-normal">({{ pendingCount }})</span>
        </button>
        <button class="tab" [class.active]="activeFilter==='published'" (click)="setFilter('published')">
          ✅ Đã xuất bản <span class="ml-1 text-gray-400 font-normal">({{ publishedCount }})</span>
        </button>
        <button class="tab" [class.active]="activeFilter==='draft'"     (click)="setFilter('draft')">
          📝 Bản nháp <span class="ml-1 text-gray-400 font-normal">({{ draftCount }})</span>
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th class="px-5 py-3">Bài viết</th>
                <th class="px-5 py-3 hidden sm:table-cell">Tác giả</th>
                <th class="px-5 py-3">Trạng thái</th>
                <th class="px-5 py-3 hidden md:table-cell">Ngày tạo</th>
                <th class="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr *ngIf="isLoading">
                <td colspan="5" class="px-5 py-12 text-center">
                  <div class="inline-block w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                </td>
              </tr>

              <!-- Empty -->
              <tr *ngIf="!isLoading && filtered.length === 0">
                <td colspan="5" class="px-5 py-12 text-center text-gray-400">
                  <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Không có bài viết nào
                </td>
              </tr>

              <!-- Rows -->
              <tr *ngFor="let blog of filtered"
                  class="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                  [class.row-pending]="blog.status === 'pending'">

                <!-- Title -->
                <td class="px-5 py-4 max-w-xs">
                  <div class="flex items-start gap-3">
                    <!-- Thumbnail -->
                    <div class="w-12 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                      <img *ngIf="getThumbnail(blog)" [src]="getThumbnail(blog)"
                           class="w-full h-full object-cover" alt="">
                      <div *ngIf="!getThumbnail(blog)"
                           class="w-full h-full flex items-center justify-center text-gray-300">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg>
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-gray-800 line-clamp-2 leading-snug">{{ blog.title }}</p>
                      <p class="text-xs text-gray-400 mt-0.5 truncate">/blogs/{{ blog.slug }}</p>
                    </div>
                  </div>
                </td>

                <!-- Author -->
                <td class="px-5 py-4 hidden sm:table-cell">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0">
                      {{ (blog.profiles?.full_name || 'A')[0].toUpperCase() }}
                    </div>
                    <span class="text-gray-700 text-sm">{{ blog.profiles?.full_name || 'Ẩn danh' }}</span>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-5 py-4">
                  <span class="badge"
                    [ngClass]="{
                      'badge-published': blog.status === 'published',
                      'badge-pending':   blog.status === 'pending',
                      'badge-draft':     blog.status === 'draft'
                    }">
                    <span *ngIf="blog.status === 'published'">✅ Đã xuất bản</span>
                    <span *ngIf="blog.status === 'pending'">⏳ Chờ duyệt</span>
                    <span *ngIf="blog.status === 'draft'">📝 Bản nháp</span>
                  </span>
                </td>

                <!-- Date -->
                <td class="px-5 py-4 hidden md:table-cell text-gray-500 text-xs">
                  {{ blog.created_at | date:'dd/MM/yyyy' }}
                </td>

                <!-- Actions -->
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-1.5 flex-wrap">

                    <!-- Preview -->
                    <a [href]="'/blogs/' + blog.slug" target="_blank" class="btn btn-preview" title="Xem bài viết">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      Xem
                    </a>

                    <!-- Approve (admin + pending only) -->
                    <button *ngIf="isAdmin && blog.status === 'pending'"
                            (click)="approve(blog.id)" class="btn btn-approve">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Duyệt
                    </button>

                    <!-- Reject (admin + pending only) -->
                    <button *ngIf="isAdmin && blog.status === 'pending'"
                            (click)="reject(blog.id)" class="btn btn-reject">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      Từ chối
                    </button>

                    <!-- Unpublish (admin + published) -->
                    <button *ngIf="isAdmin && blog.status === 'published'"
                            (click)="setStatus(blog.id, 'draft')" class="btn btn-reject" title="Gỡ xuất bản">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                      Gỡ
                    </button>

                    <!-- Edit -->
                    <a [routerLink]="['/admin/blogs-manage/edit', blog.id]" class="btn btn-edit">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Sửa
                    </a>

                    <!-- Delete -->
                    <button (click)="deleteBlog(blog.id)" class="btn btn-delete">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div *ngIf="toast"
         class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all"
         [ngClass]="toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'">
      <svg *ngIf="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <svg *ngIf="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      {{ toast.msg }}
    </div>
  `
})
export class BlogManageComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private confirm = inject(ConfirmService);

  blogs: any[] = [];
  isLoading = true;
  activeFilter: Filter = 'all';
  toast: { type: 'success' | 'error'; msg: string } | null = null;

  get isAdmin() { return this.authService.currentUser?.role === 'admin'; }
  get pendingCount()   { return this.blogs.filter(b => b.status === 'pending').length; }
  get publishedCount() { return this.blogs.filter(b => b.status === 'published').length; }
  get draftCount()     { return this.blogs.filter(b => b.status === 'draft').length; }

  get filtered() {
    if (this.activeFilter === 'all') return this.blogs;
    return this.blogs.filter(b => b.status === this.activeFilter);
  }

  setFilter(f: Filter) { this.activeFilter = f; }

  ngOnInit() { this.loadBlogs(); }

  loadBlogs() {
    this.isLoading = true;
    this.api.get<any>('/blogs/manage').subscribe({
      next: (res: any) => {
        this.blogs = res.data || [];
        this.isLoading = false;
        // Auto-switch to pending tab if there are pending blogs
        if (this.pendingCount > 0 && this.activeFilter === 'all') this.activeFilter = 'pending';
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  approve(id: string) { this.setStatus(id, 'published'); }
  reject(id: string)  { this.setStatus(id, 'rejected'); }

  setStatus(id: string, status: string) {
    this.api.put<any>(`/blogs/${id}/approve`, { status }).subscribe({
      next: () => {
        this.showToast('success', status === 'published' ? 'Đã duyệt bài viết!' : status === 'rejected' ? 'Đã từ chối bài viết' : 'Đã cập nhật trạng thái');
        this.loadBlogs();
      },
      error: (err: any) => { this.showToast('error', err.error?.error || 'Lỗi cập nhật trạng thái'); }
    });
  }

  async deleteBlog(id: string) {
    if (!await this.confirm.ask({ title: 'Xóa bài viết', message: 'Bạn có chắc muốn xóa bài viết này?', confirmText: 'Xóa', danger: true })) return;
    this.api.delete<any>(`/blogs/${id}`).subscribe({
      next: () => { this.showToast('success', 'Đã xóa bài viết'); this.loadBlogs(); },
      error: (err: any) => { this.showToast('error', err.error?.error || 'Lỗi khi xóa'); }
    });
  }

  getThumbnail(blog: any): string | null {
    return blog.content_blocks?.find((b: any) => b.type === 'image')?.value || null;
  }

  private showToast(type: 'success' | 'error', msg: string) {
    this.toast = { type, msg };
    this.cdr.detectChanges();
    setTimeout(() => { this.toast = null; this.cdr.detectChanges(); }, 3000);
  }
}
