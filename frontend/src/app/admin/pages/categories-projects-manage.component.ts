import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ProjectSectionsManageComponent } from './project-sections-manage.component';

@Component({
  selector: 'app-categories-projects-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ProjectSectionsManageComponent],
  template: `
    <div class="max-w-6xl mx-auto mt-4">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Quản lý Danh mục & Dự án</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Cột Danh mục -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Danh mục Bất động sản</h3>
          
          <form [formGroup]="catForm" (ngSubmit)="addCategory()" class="flex gap-2 mb-6">
            <input formControlName="name" type="text" placeholder="Tên danh mục mới (VD: Căn hộ)" class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none">
            <button type="submit" [disabled]="catForm.invalid || isAddingCat" class="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">Thêm</button>
          </form>

          <ul class="divide-y divide-gray-100">
            <li *ngFor="let cat of categories" class="py-3 flex justify-between items-center group">
              <div>
                <p class="font-medium text-gray-800">{{ cat.name }}</p>
                <p class="text-xs text-gray-500 font-mono">Slug: {{ cat.slug }}</p>
              </div>
              <button (click)="deleteCategory(cat.id)" class="text-red-500 hover:text-red-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity">Xóa</button>
            </li>
          </ul>
        </div>

        <!-- Cột Dự án -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Quản lý Dự án & Theme</h3>
          
          <form [formGroup]="projForm" (ngSubmit)="addProject()" class="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <input formControlName="name" type="text" placeholder="Tên dự án" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none">
            <select formControlName="theme_id" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none bg-white">
              <option value="minimalist">Theme: Minimalist (Nhà phố)</option>
              <option value="luxury">Theme: Luxury (Căn hộ cao cấp)</option>
              <option value="eco-green">Theme: Eco Green (Sinh thái)</option>
              <option value="custom">Theme: Custom (Tự thiết kế)</option>
            </select>
            <textarea formControlName="description" placeholder="Mô tả dự án..." rows="2" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"></textarea>
            <button type="submit" [disabled]="projForm.invalid || isAddingProj" class="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">Tạo Dự án Mới</button>
          </form>

          <ul class="divide-y divide-gray-100">
            <li *ngFor="let proj of projects" class="py-3 flex justify-between items-center group">
              <div>
                <p class="font-medium text-gray-800">{{ proj.name }}</p>
                <p class="text-xs text-gray-500">Theme: <span class="uppercase text-gray-700 font-semibold tracking-wider">{{ proj.theme_id }}</span></p>
              </div>
              <div class="flex items-center gap-1">
                <a [routerLink]="['/admin/projects', proj.id, 'builder']" class="text-violet-600 hover:text-violet-800 text-sm font-medium px-2 py-1.5 rounded hover:bg-violet-50">🎨 Tùy biến</a>
                <button (click)="manageSections(proj)" class="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1.5 rounded hover:bg-gray-50">Nội dung</button>
                <button (click)="deleteProject(proj.id)" class="text-red-500 hover:text-red-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity">Xóa</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal quản lý nội dung (section) dự án -->
    <app-project-sections-manage
      *ngIf="managingProject"
      [projectId]="managingProject.id"
      [projectName]="managingProject.name"
      (close)="managingProject = null">
    </app-project-sections-manage>
  `
})
export class CategoriesProjectsManageComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  categories: any[] = [];
  projects: any[] = [];
  
  catForm: FormGroup = this.fb.group({ name: ['', Validators.required] });
  projForm: FormGroup = this.fb.group({ 
    name: ['', Validators.required], 
    theme_id: ['minimalist', Validators.required],
    description: ['']
  });

  isAddingCat = false;
  isAddingProj = false;
  managingProject: any = null;

  manageSections(proj: any) { this.managingProject = proj; }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.get<any>('/properties/categories').subscribe({
      next: (res: any) => { this.categories = res.data; this.cdr.detectChanges(); }
    });
    this.api.get<any>('/projects').subscribe({
      next: (res: any) => { this.projects = res.data; this.cdr.detectChanges(); }
    });
  }

  addCategory() {
    if (this.catForm.invalid) return;
    this.isAddingCat = true;
    this.api.post<any>('/properties/categories', this.catForm.value).subscribe({
      next: () => {
        this.toast.success('Đã thêm danh mục.');
        this.catForm.reset(); this.isAddingCat = false; this.loadData();
      },
      error: (err) => { this.isAddingCat = false; this.toast.error(err.error?.error || 'Lỗi khi thêm danh mục.'); }
    });
  }

  async deleteCategory(id: string) {
    if (!await this.confirm.ask({ title: 'Xóa danh mục', message: 'Xóa danh mục này?', confirmText: 'Xóa', danger: true })) return;
    this.api.delete<any>(`/properties/categories/${id}`).subscribe({
      next: () => { this.toast.success('Đã xóa danh mục.'); this.loadData(); },
      error: () => this.toast.error('Lỗi khi xóa danh mục.')
    });
  }

  addProject() {
    if (this.projForm.invalid) return;
    this.isAddingProj = true;
    this.api.post<any>('/projects', this.projForm.value).subscribe({
      next: () => {
        this.toast.success('Đã tạo dự án mới.');
        this.projForm.reset({ theme_id: 'minimalist' }); this.isAddingProj = false; this.loadData();
      },
      error: (err) => { this.isAddingProj = false; this.toast.error(err.error?.error || 'Lỗi khi tạo dự án.'); }
    });
  }

  async deleteProject(id: string) {
    if (!await this.confirm.ask({ title: 'Xóa dự án', message: 'Xóa dự án này? Các bất động sản thuộc dự án sẽ được gỡ liên kết.', confirmText: 'Xóa', danger: true })) return;
    this.api.delete<any>(`/projects/${id}`).subscribe({
      next: () => { this.toast.success('Đã xóa dự án.'); this.loadData(); },
      error: () => this.toast.error('Lỗi khi xóa dự án.')
    });
  }
}