import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UploadService } from '../../core/services/upload.service';
import { ToastService } from '../../core/services/toast.service';

interface ContentBlock { type: 'header' | 'text' | 'image' | 'video'; value: string; }

@Component({
  selector: 'app-blog-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto py-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'Chỉnh sửa Blog' : 'Viết Blog Mới' }}</h2>
        <div class="space-x-3">
          <button (click)="isPreview = !isPreview" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition">
            {{ isPreview ? '✏️ Quay lại chỉnh sửa' : '👁️ Xem trước (Preview)' }}
          </button>
          <button (click)="saveBlog()" [disabled]="isSaving || !title.trim()" class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition disabled:opacity-50">
            {{ isSaving ? 'Đang lưu...' : 'Đăng bài' }}
          </button>
        </div>
      </div>

      <!-- EDIT MODE -->
      <div *ngIf="!isPreview" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết</label>
          <input [(ngModel)]="title" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-900 text-xl font-bold" placeholder="Nhập tiêu đề thu hút...">
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Thuộc dự án (tùy chọn)</label>
          <select [(ngModel)]="projectId" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-900 bg-white">
            <option value="">— Không gắn dự án —</option>
            <option *ngFor="let proj of projects" [value]="proj.id">{{ proj.name }}</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Bài viết sẽ hiển thị trong mục "Tin tức dự án" trên trang chi tiết dự án.</p>
        </div>

        <!-- Layout Builder -->
        <div class="border-t border-gray-100 pt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Nội dung bài viết (Layout Builder)</h3>
          
          <div *ngFor="let block of blocks; let i = index" class="relative group p-4 mb-4 border border-gray-200 rounded-lg hover:border-gray-400 bg-gray-50 transition-colors">
            <!-- Toolbar di chuyển & Xóa -->
            <button (click)="removeBlock(i)" class="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa block">✕</button>
            <div class="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="moveBlock(i, -1)" *ngIf="i > 0" class="bg-gray-200 p-1 rounded hover:bg-gray-300 text-gray-600" title="Lên">▲</button>
              <button (click)="moveBlock(i, 1)" *ngIf="i < blocks.length - 1" class="bg-gray-200 p-1 rounded hover:bg-gray-300 text-gray-600" title="Xuống">▼</button>
            </div>

            <!-- Render Input Fields -->
            <div [ngSwitch]="block.type">
              <div *ngSwitchCase="'header'">
                <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-semibold uppercase mb-2 inline-block">Tiêu đề phụ</span>
                <input [(ngModel)]="block.value" placeholder="Nhập tiêu đề phụ..." class="w-full bg-transparent border-b border-gray-300 focus:border-gray-900 outline-none py-1 text-lg font-bold">
              </div>
              <div *ngSwitchCase="'text'">
                <span class="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded font-semibold uppercase mb-2 inline-block">Đoạn văn</span>
                <textarea [(ngModel)]="block.value" placeholder="Viết nội dung..." rows="4" class="w-full p-3 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-gray-900"></textarea>
              </div>
              <div *ngSwitchCase="'image'">
                <span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-semibold uppercase mb-2 inline-block">Hình ảnh</span>
                <div class="flex gap-2 mb-2">
                  <input [(ngModel)]="block.value" placeholder="Dán URL hình ảnh..." class="flex-1 p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-gray-900">
                  <label class="px-4 py-2 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition text-sm font-medium text-gray-700 flex items-center">
                    <span *ngIf="!isUploading">Tải ảnh lên</span>
                    <span *ngIf="isUploading">Đang tải...</span>
                    <input type="file" class="hidden" accept="image/*" (change)="uploadImage($event, block)" [disabled]="isUploading">
                  </label>
                </div>
                <img *ngIf="block.value" [src]="block.value" class="max-h-48 mx-auto rounded shadow-sm">
              </div>
              <div *ngSwitchCase="'video'">
                <span class="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded font-semibold uppercase mb-2 inline-block">Video Youtube</span>
                <input [(ngModel)]="block.value" placeholder="Dán URL Youtube dạng nhúng (Ví dụ: https://www.youtube.com/embed/xxxxx)" class="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-gray-900">
                <div class="mt-3 text-sm text-gray-600 bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <strong class="text-orange-800 flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Hướng dẫn chèn video:</strong>
                  <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>Tải video của bạn lên YouTube và đặt quyền riêng tư là <strong>Công khai (Public)</strong> hoặc <strong>Không công khai (Unlisted)</strong>.</li>
                    <li>Trên YouTube, nhấn nút <strong>Chia sẻ (Share)</strong> -> Chọn <strong>Nhúng (Embed)</strong>.</li>
                    <li>Copy đoạn link nằm trong thuộc tính <code>src="..."</code> (VD: <code class="bg-white px-1 py-0.5 rounded border border-gray-200">https://www.youtube.com/embed/Mã-Video</code>) và dán vào ô bên trên.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Component Bar -->
          <div class="flex flex-wrap gap-3 mt-6 justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl">
            <span class="w-full text-center text-gray-500 text-sm mb-2 block font-medium">Thêm Component vào Layout</span>
            <button (click)="addBlock('header')" class="px-4 py-2 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-gray-700 shadow-sm font-bold">H Tiêu đề phụ</button>
            <button (click)="addBlock('text')" class="px-4 py-2 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-gray-700 shadow-sm font-bold">¶ Đoạn văn</button>
            <button (click)="addBlock('image')" class="px-4 py-2 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-gray-700 shadow-sm font-bold">🖼️ Hình ảnh</button>
            <button (click)="addBlock('video')" class="px-4 py-2 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-gray-700 shadow-sm font-bold">▶️ Video</button>
          </div>
        </div>
      </div>

      <!-- PREVIEW MODE -->
      <div *ngIf="isPreview" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
        <div class="mb-4 text-sm text-gray-700 font-semibold uppercase tracking-wider">👁️ Live Preview</div>
        <h1 class="text-4xl font-extrabold text-gray-900 mb-8 leading-tight">{{ title || 'Chưa có tiêu đề' }}</h1>
        
        <div class="space-y-6 text-gray-800 leading-relaxed text-lg">
          <ng-container *ngFor="let block of blocks">
            <h2 *ngIf="block.type === 'header'" class="text-2xl font-bold mt-8 mb-4 text-gray-900">{{ block.value }}</h2>
            <p *ngIf="block.type === 'text'" class="whitespace-pre-wrap">{{ block.value }}</p>
            <img *ngIf="block.type === 'image'" [src]="block.value" class="w-full rounded-xl shadow-md my-8">
            <div *ngIf="block.type === 'video'" class="my-8">
              <iframe [src]="getSafeUrl(block.value)" class="w-full h-[450px] rounded-xl shadow-md" frameborder="0" allowfullscreen></iframe>
            </div>
          </ng-container>
          <div *ngIf="blocks.length === 0" class="text-gray-400 italic text-center py-12">Chưa có nội dung Component.</div>
        </div>
      </div>
    </div>
  `
})
export class BlogEditorComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private uploadService = inject(UploadService);
  private cdr = inject(ChangeDetectorRef);

  title: string = '';
  propertyId: string = '';
  projectId: string = '';
  projects: any[] = [];
  blocks: ContentBlock[] = [];
  isPreview = false;
  isSaving = false;
  isUploading = false;
  isEditMode = false;
  blogId: string | null = null;

  ngOnInit() {
    this.loadProjects();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true; this.blogId = id; this.loadBlogData(id);
      } else {
        this.addBlock('text'); // Gợi ý block đầu tiên
      }
    });
  }

  loadProjects() {
    this.api.get<any>('/projects').subscribe({
      next: (res: any) => { this.projects = res.data || []; this.cdr.detectChanges(); }
    });
  }

  loadBlogData(id: string) {
    this.api.get<any>(`/blogs/${id}`).subscribe({
      next: (res: any) => {
        const blog = res.data;
        if (blog) {
          this.title = blog.title;
          this.projectId = blog.project_id || '';
          this.blocks = blog.content_blocks || [];
          this.cdr.detectChanges(); // Ép UI điền dữ liệu bài viết cũ vào ô nhập
        }
      },
      error: (err: any) => this.toast.error(err.error?.error || 'Không thể tải dữ liệu bài viết')
    });
  }

  addBlock(type: 'header' | 'text' | 'image' | 'video') { this.blocks.push({ type, value: '' }); }
  removeBlock(index: number) { this.blocks.splice(index, 1); }
  moveBlock(index: number, dir: number) {
    const ni = index + dir;
    if (ni < 0 || ni >= this.blocks.length) return;
    [this.blocks[index], this.blocks[ni]] = [this.blocks[ni], this.blocks[index]];
  }

  getSafeUrl(url: string) { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }

  uploadImage(event: any, block: ContentBlock) {
    const file = event.target.files[0];
    if (!file) return;
    
    this.isUploading = true;
    this.cdr.detectChanges(); // Ép UI cập nhật trạng thái "Đang tải..."
    this.uploadService.uploadFile(file).subscribe({
      next: (res: any) => {
        block.value = res.data.url; // Tự động điền URL Cloudinary vào input
        this.isUploading = false;
        this.cdr.detectChanges(); // Ép UI hiển thị ảnh ngay lập tức
      },
      error: (err: any) => {
        this.toast.error(err.error?.error || 'Lỗi tải ảnh lên!');
        this.isUploading = false;
        this.cdr.detectChanges(); // Ép UI tắt trạng thái tải
      }
    });
  }

  saveBlog() {
    if (!this.title.trim()) return;
    this.isSaving = true;
    const payload = { title: this.title, content_blocks: this.blocks, project_id: this.projectId || null };
    const req = this.isEditMode ? this.api.put<any>(`/blogs/${this.blogId}`, payload) : this.api.post<any>('/blogs', payload);

    req.subscribe({
      next: () => { this.toast.success(this.authService.currentUser?.role === 'admin' ? 'Đã xuất bản bài viết!' : 'Bài viết đang chờ duyệt!'); this.router.navigate(['/admin/blogs-manage']); },
      error: (err: any) => { this.isSaving = false; this.toast.error(err.error?.error || 'Có lỗi xảy ra khi lưu bài viết.'); this.cdr.detectChanges(); }
    });
  }
}