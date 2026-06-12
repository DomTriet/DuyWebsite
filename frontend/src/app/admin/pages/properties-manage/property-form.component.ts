import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UploadService } from '../../../core/services/upload.service';
import { ToastService } from '../../../core/services/toast.service';
import { TrustUrlPipe } from '../../../shared/pipes/trust-url.pipe';
import { PropertySectionsManageComponent } from './property-sections-manage.component';

interface AttrField { key: string; label: string; type: 'number' | 'text'; placeholder?: string; }

const ATTRIBUTE_PRESETS: Record<string, AttrField[]> = {
  'can-ho': [
    { key: 'bedrooms',          label: 'Phòng ngủ',       type: 'number', placeholder: 'VD: 2' },
    { key: 'bathrooms',         label: 'Phòng tắm',       type: 'number', placeholder: 'VD: 2' },
    { key: 'area',              label: 'Diện tích (m²)',   type: 'number', placeholder: 'VD: 75' },
    { key: 'floor',             label: 'Tầng',             type: 'number', placeholder: 'VD: 12' },
    { key: 'balcony_direction', label: 'Hướng ban công',   type: 'text',   placeholder: 'VD: Đông Nam' },
    { key: 'furniture',         label: 'Nội thất',         type: 'text',   placeholder: 'VD: Đầy đủ' },
  ],
  'biet-thu': [
    { key: 'bedrooms',  label: 'Phòng ngủ',          type: 'number', placeholder: 'VD: 4' },
    { key: 'bathrooms', label: 'Phòng tắm',          type: 'number', placeholder: 'VD: 4' },
    { key: 'area',      label: 'Diện tích sàn (m²)', type: 'number', placeholder: 'VD: 250' },
    { key: 'land_area', label: 'Diện tích đất (m²)', type: 'number', placeholder: 'VD: 300' },
    { key: 'floors',    label: 'Số tầng',             type: 'number', placeholder: 'VD: 3' },
    { key: 'frontage',  label: 'Mặt tiền (m)',        type: 'number', placeholder: 'VD: 10' },
  ],
  'nha-pho': [
    { key: 'bedrooms',     label: 'Phòng ngủ',     type: 'number', placeholder: 'VD: 3' },
    { key: 'bathrooms',    label: 'Phòng tắm',     type: 'number', placeholder: 'VD: 3' },
    { key: 'area',         label: 'Diện tích (m²)',type: 'number', placeholder: 'VD: 90' },
    { key: 'floors',       label: 'Số tầng',        type: 'number', placeholder: 'VD: 4' },
    { key: 'frontage',     label: 'Mặt tiền (m)',   type: 'number', placeholder: 'VD: 5' },
    { key: 'street_width', label: 'Lộ giới (m)',    type: 'number', placeholder: 'VD: 8' },
  ],
  'dat-nen': [
    { key: 'area',         label: 'Diện tích (m²)', type: 'number', placeholder: 'VD: 100' },
    { key: 'frontage',     label: 'Mặt tiền (m)',   type: 'number', placeholder: 'VD: 5' },
    { key: 'street_width', label: 'Lộ giới (m)',    type: 'number', placeholder: 'VD: 12' },
    { key: 'direction',    label: 'Hướng',           type: 'text',   placeholder: 'VD: Đông Nam' },
    { key: 'legal',        label: 'Pháp lý',         type: 'text',   placeholder: 'VD: Sổ đỏ' },
  ],
  'shophouse': [
    { key: 'area',         label: 'Diện tích (m²)', type: 'number', placeholder: 'VD: 120' },
    { key: 'floors',       label: 'Số tầng',         type: 'number', placeholder: 'VD: 4' },
    { key: 'frontage',     label: 'Mặt tiền (m)',   type: 'number', placeholder: 'VD: 6' },
    { key: 'street_width', label: 'Lộ giới (m)',    type: 'number', placeholder: 'VD: 20' },
  ],
  'default': [
    { key: 'bedrooms',  label: 'Phòng ngủ',      type: 'number', placeholder: 'VD: 2' },
    { key: 'bathrooms', label: 'Phòng tắm',      type: 'number', placeholder: 'VD: 2' },
    { key: 'area',      label: 'Diện tích (m²)', type: 'number', placeholder: 'VD: 80' },
    { key: 'floors',    label: 'Số tầng',         type: 'number', placeholder: 'VD: 1' },
  ],
};

type Tab = 'basic' | 'address' | 'media' | 'sections';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TrustUrlPipe, PropertySectionsManageComponent],
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }

    .tab-btn {
      padding: 10px 18px;
      font-size: 0.82rem; font-weight: 500; color: #6b7280;
      border-bottom: 2px solid transparent; white-space: nowrap;
      transition: color .15s, border-color .15s;
    }
    .tab-btn:hover { color: #111; }
    .tab-btn.active { color: #111; border-bottom-color: #111; }

    .field-label { display: block; font-size: 0.8rem; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .field-input {
      width: 100%; padding: 9px 12px;
      border-radius: 8px; border: 1px solid #d1d5db;
      font-size: 0.875rem; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .field-input:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(17,17,17,.07); }
    .field-input.ng-invalid.ng-touched { border-color: #ef4444; }

    .section-head {
      font-size: 0.6rem; letter-spacing: .15em; text-transform: uppercase;
      color: #9ca3af; margin-bottom: 16px;
      display: flex; align-items: center; gap: 10px;
    }
    .section-head::after { content: ''; flex: 1; height: 1px; background: #f3f4f6; }

    .media-thumb { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 4/3; background: #f3f4f6; }
    .media-thumb img, .media-thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }
    .media-thumb .overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,.5);
      display: flex; align-items: center; justify-content: center; gap: 6px;
      opacity: 0; transition: opacity .15s;
    }
    .media-thumb:hover .overlay { opacity: 1; }

    .drop-zone {
      border: 2px dashed #d1d5db; border-radius: 10px; background: #fafafa; cursor: pointer;
      transition: border-color .15s, background .15s;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 28px 20px; gap: 6px; text-align: center;
    }
    .drop-zone:hover { border-color: #9ca3af; background: #f3f4f6; }

    .preview-card { border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
  `],
  template: `
<div class="flex bg-gray-50 overflow-hidden" style="min-height:calc(100vh - 64px)">

  <!-- ═══════════════════════ LEFT: Form ═══════════════════════════════════ -->
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

    <!-- Sticky header -->
    <div class="bg-white border-b px-6 py-4 flex items-center justify-between gap-4 shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <a routerLink="/admin/properties" class="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h2 class="font-bold text-gray-900 text-lg truncate">
          {{ isEditMode ? 'Chỉnh sửa Bất động sản' : 'Thêm Bất động sản mới' }}
        </h2>
      </div>
      <button type="button" (click)="onSubmit()" [disabled]="isUploading || isSubmitting"
              class="flex items-center gap-2 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shrink-0">
        <svg *ngIf="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu BĐS') }}
      </button>
    </div>

    <!-- Tab nav -->
    <div class="bg-white border-b overflow-x-auto shrink-0">
      <div class="flex px-4">
        <button *ngFor="let t of tabs" [class.active]="activeTab === t.id"
                type="button" class="tab-btn" (click)="activeTab = t.id">
          {{ t.label }}
          <span *ngIf="t.id === 'media' && uploadedMedia.length"
                class="ml-1.5 text-[0.65rem] bg-gray-800 text-white rounded-full px-1.5 py-0.5">
            {{ uploadedMedia.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div *ngIf="errorMessage"
         class="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 shrink-0">
      <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      {{ errorMessage }}
      <button type="button" (click)="errorMessage=''" class="ml-auto text-red-400 hover:text-red-700 text-lg leading-none">×</button>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto">

      <!-- ─── FORM wrapper (tabs 1-3) ──────────────────────────────── -->
      <form [formGroup]="propertyForm" class="p-6">

        <!-- TAB 1 ── Thông tin cơ bản ─────────────────────────────── -->
        <div *ngIf="activeTab === 'basic'" class="space-y-6">

          <div>
            <label class="field-label">Tiêu đề Bất động sản <span class="text-red-500">*</span></label>
            <input formControlName="title" type="text" class="field-input"
                   placeholder="VD: Căn hộ cao cấp Vinhomes Central Park...">
            <p *ngIf="f['title'].invalid && f['title'].touched" class="text-red-500 text-xs mt-1">Vui lòng nhập tiêu đề</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="field-label">Giá (VNĐ) <span class="text-red-500">*</span></label>
              <input formControlName="price" type="number" class="field-input" placeholder="2500000000">
              <p *ngIf="f['price'].invalid && f['price'].touched" class="text-red-500 text-xs mt-1">Vui lòng nhập giá hợp lệ</p>
            </div>
            <div>
              <label class="field-label">Danh mục <span class="text-red-500">*</span></label>
              <select formControlName="category_id" (change)="rebuildAttrFields()" class="field-input bg-white">
                <option value="">-- Chọn danh mục --</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
              <p *ngIf="f['category_id'].invalid && f['category_id'].touched" class="text-red-500 text-xs mt-1">Vui lòng chọn danh mục</p>
            </div>
            <div>
              <label class="field-label">Trạng thái</label>
              <select formControlName="status" class="field-input bg-white">
                <option value="available">Đang bán / cho thuê</option>
                <option value="sold">Đã bán</option>
                <option value="rented">Đã cho thuê</option>
                <option value="reserved">Đặt cọc</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="field-label">Dự án</label>
              <select formControlName="project_id" class="field-input bg-white">
                <option value="">-- Không thuộc dự án --</option>
                <option *ngFor="let proj of projects" [value]="proj.id">{{ proj.name }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">Theme trang chi tiết</label>
              <select formControlName="detail_theme" class="field-input bg-white">
                <option [ngValue]="null">Kế thừa từ dự án (mặc định)</option>
                <option value="minimalist">Minimalist</option>
                <option value="luxury">Luxury</option>
                <option value="eco-green">Eco Green</option>
                <option value="custom">Custom</option>
              </select>
              <p class="text-xs text-gray-400 mt-1">Ghi đè theme riêng cho trang chi tiết của BĐS này.</p>
            </div>
          </div>

          <div>
            <label class="field-label">Mô tả chi tiết</label>
            <textarea formControlName="description" rows="5" class="field-input"
                      placeholder="Mô tả về tiện ích, vị trí, điểm nổi bật của Bất động sản..."></textarea>
          </div>

          <!-- Thông số kỹ thuật động -->
          <div class="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
            <div class="flex items-center justify-between mb-4">
              <p class="section-head mb-0">Thông số kỹ thuật</p>
              <button type="button" (click)="showAddField = true"
                      *ngIf="!showAddField"
                      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Thêm trường
              </button>
            </div>

            <!-- Grid các trường hiện tại -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" *ngIf="attrFields.length > 0">
              <div *ngFor="let field of attrFields" class="relative group">
                <div class="flex items-center justify-between mb-1">
                  <label class="field-label mb-0">{{ field.label }}</label>
                  <button type="button" (click)="removeAttrField(field.key)"
                          class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-base leading-none ml-1"
                          title="Xóa trường này">×</button>
                </div>
                <input [type]="field.type" [placeholder]="field.placeholder || ''"
                       [(ngModel)]="attrValues[field.key]" [ngModelOptions]="{ standalone: true }"
                       class="field-input">
              </div>
            </div>

            <!-- Trạng thái rỗng -->
            <div *ngIf="attrFields.length === 0 && !showAddField"
                 class="text-sm text-gray-400 italic bg-white border border-dashed border-gray-200 rounded-lg p-4 text-center">
              Chưa có thông số nào. Chọn Danh mục để áp dụng preset hoặc nhấn <strong>Thêm trường</strong> để tự thêm.
            </div>

            <!-- Form thêm trường tùy chỉnh -->
            <div *ngIf="showAddField"
                 class="mt-4 flex flex-wrap gap-3 items-end p-4 bg-white border border-dashed border-gray-300 rounded-lg">
              <div class="flex-1 min-w-[140px]">
                <label class="field-label">Tên thông số</label>
                <input type="text" [(ngModel)]="newFieldLabel" [ngModelOptions]="{ standalone: true }"
                       placeholder="VD: Hướng cửa chính" class="field-input" #newLabelInput>
              </div>
              <div class="flex-1 min-w-[140px]">
                <label class="field-label">Giá trị</label>
                <input type="text" [(ngModel)]="newFieldValue" [ngModelOptions]="{ standalone: true }"
                       placeholder="VD: Tây Nam" class="field-input"
                       (keydown.enter)="addCustomField()">
              </div>
              <div class="flex gap-2">
                <button type="button" (click)="addCustomField()"
                        class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Thêm
                </button>
                <button type="button" (click)="showAddField = false; newFieldLabel = ''; newFieldValue = ''"
                        class="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2 ── Địa chỉ & Bản đồ ─────────────────────────────── -->
        <div *ngIf="activeTab === 'address'" class="space-y-6">

          <div>
            <label class="field-label">Địa chỉ đầy đủ</label>
            <input formControlName="address" type="text" class="field-input"
                   placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM">
            <p class="text-xs text-gray-400 mt-1.5">Địa chỉ hiển thị nổi bật trên trang chi tiết Bất động sản.</p>
          </div>

          <!-- Google Maps Helper -->
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
            <div class="flex items-start gap-2.5">
              <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h4 class="font-semibold text-amber-800 text-sm">Trợ giúp tạo bản đồ nhúng</h4>
                <p class="text-xs text-amber-700 mt-0.5">Dán link Google Maps hoặc nhấn "Tạo từ địa chỉ" để tạo URL nhúng tự động.</p>
              </div>
            </div>
            <div class="flex gap-2">
              <input [(ngModel)]="mapsRawUrl" [ngModelOptions]="{standalone:true}"
                     placeholder="https://maps.google.com/... hoặc link share từ Google Maps"
                     class="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white outline-none focus:border-amber-500">
              <button type="button" (click)="generateMapEmbed()"
                      class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                Tạo embed ↗
              </button>
            </div>
            <button type="button" (click)="generateFromAddress()"
                    class="text-xs text-amber-700 underline hover:text-amber-900">
              Tạo bản đồ từ địa chỉ đã nhập ↑
            </button>
          </div>

          <div>
            <label class="field-label">URL nhúng bản đồ (Google Maps Embed)</label>
            <div class="flex gap-2">
              <input formControlName="map_embed_url" type="text" class="field-input flex-1"
                     placeholder="https://maps.google.com/maps?q=...&output=embed">
              <button *ngIf="propertyForm.value.map_embed_url" type="button"
                      (click)="propertyForm.patchValue({map_embed_url:''})"
                      class="px-3 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-300 rounded-lg transition-colors shrink-0">
                Xóa
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1.5">Dạng: <code class="bg-gray-100 px-1 rounded">...?q=TÊN_ĐỊA_CHỈ&output=embed</code></p>
          </div>

          <!-- Live Map Preview -->
          <div *ngIf="propertyForm.value.map_embed_url">
            <p class="section-head">Xem trước bản đồ</p>
            <div class="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe [src]="propertyForm.value.map_embed_url | trustUrl"
                      width="100%" height="340" style="border:0;display:block;" loading="lazy"
                      allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <p class="text-xs text-gray-400 mt-2 text-center">Bản đồ sẽ hiển thị như thế này trên trang chi tiết BĐS</p>
          </div>

          <div *ngIf="!propertyForm.value.map_embed_url"
               class="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16 gap-3 text-center">
            <svg class="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            <p class="text-sm font-medium text-gray-400">Chưa có bản đồ</p>
            <p class="text-xs text-gray-300">Dùng trợ giúp phía trên để tạo URL nhúng</p>
          </div>
        </div>

        <!-- TAB 3 ── Hình ảnh & Media ──────────────────────────────── -->
        <div *ngIf="activeTab === 'media'" class="space-y-8">

          <!-- Gallery layout selector -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p class="section-head mb-3">Bố cục Gallery</p>
            <div class="grid grid-cols-3 gap-3">
              <label *ngFor="let opt of galleryLayoutOptions"
                     class="cursor-pointer rounded-lg border-2 p-3 text-center transition-all"
                     [class.border-gray-900]="(attrValues['gallery_layout'] || 'default') === opt.value"
                     [class.bg-white]="(attrValues['gallery_layout'] || 'default') === opt.value"
                     [class.border-gray-200]="(attrValues['gallery_layout'] || 'default') !== opt.value">
                <input type="radio" name="gallery_layout" [value]="opt.value"
                       [(ngModel)]="attrValues['gallery_layout']" [ngModelOptions]="{standalone:true}"
                       class="sr-only">
                <span class="text-xl block mb-1">{{ opt.icon }}</span>
                <span class="text-xs font-semibold text-gray-700">{{ opt.label }}</span>
                <p class="text-xs text-gray-400 mt-0.5">{{ opt.desc }}</p>
              </label>
            </div>
          </div>

          <!-- Images section -->
          <div>
            <p class="section-head">Hình ảnh</p>
            <label class="drop-zone block mb-4">
              <svg class="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-sm text-gray-500 font-medium">Click để chọn ảnh <span class="text-gray-400 font-normal">hoặc kéo thả</span></p>
              <p class="text-xs text-gray-400">JPG, PNG, WEBP — Chọn nhiều ảnh cùng lúc — Ảnh đầu tiên = thumbnail</p>
              <input type="file" class="hidden" accept="image/*" multiple
                     (change)="onImagesSelected($event)" [disabled]="isUploading" />
            </label>

            <!-- Upload progress bar -->
            <div *ngIf="isUploading && uploadTarget === 'image'"
                 class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div class="flex items-center gap-2">
                <svg class="animate-spin w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p class="text-sm text-gray-700 font-medium">Đang tải ảnh lên... {{ uploadProgress }}%</p>
              </div>
              <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gray-800 rounded-full transition-all duration-300" [style.width.%]="uploadProgress"></div>
              </div>
            </div>

            <!-- Images grid -->
            <div *ngIf="imageMedia.length" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              <div *ngFor="let url of imageMedia" class="media-thumb group">
                <img [src]="url" alt="Ảnh BĐS">
                <div class="overlay">
                  <button type="button" (click)="setThumbnail(url)" title="Đặt làm thumbnail"
                          class="p-1.5 bg-white/90 rounded-lg text-gray-700 hover:bg-white">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
                    </svg>
                  </button>
                  <button type="button" (click)="removeMedia(url)" title="Xóa"
                          class="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div *ngIf="imageMedia.indexOf(url) === 0"
                     class="absolute top-1.5 left-1.5 bg-gray-900 text-white text-[0.6rem] px-1.5 py-0.5 rounded font-semibold">
                  Thumbnail
                </div>
              </div>
            </div>
            <p *ngIf="!imageMedia.length" class="text-sm text-gray-400 italic text-center py-4">Chưa có ảnh nào</p>
          </div>

          <!-- Videos section -->
          <div class="border-t border-gray-100 pt-6">
            <p class="section-head">Video</p>
            <p class="text-xs text-gray-400 mb-4">Upload video từ máy tính (MP4, WebM) hoặc nhập URL YouTube/Vimeo embed.</p>

            <label class="drop-zone block mb-4">
              <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <p class="text-sm text-gray-500 font-medium">Click để chọn video</p>
              <p class="text-xs text-gray-400">MP4, WebM, MOV</p>
              <input type="file" class="hidden" accept="video/*"
                     (change)="onVideoSelected($event)" [disabled]="isUploading" />
            </label>

            <div *ngIf="isUploading && uploadTarget === 'video'"
                 class="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <svg class="animate-spin w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p class="text-sm text-gray-700 font-medium">Đang tải video lên...</p>
            </div>

            <div class="flex gap-2 mb-4">
              <input [(ngModel)]="videoUrlInput" [ngModelOptions]="{standalone:true}"
                     placeholder="https://www.youtube.com/embed/... hoặc URL trực tiếp"
                     class="flex-1 field-input"
                     (keydown.enter)="$event.preventDefault(); addVideoUrl()">
              <button type="button" (click)="addVideoUrl()"
                      class="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 transition-colors whitespace-nowrap">
                Thêm URL
              </button>
            </div>

            <div *ngIf="videoMedia.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div *ngFor="let url of videoMedia" class="media-thumb group">
                <ng-container *ngIf="isYouTube(url) || isVimeo(url); else directVideo">
                  <iframe [src]="url | trustUrl" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
                </ng-container>
                <ng-template #directVideo>
                  <video [src]="url" muted preload="metadata" class="w-full h-full object-cover"></video>
                </ng-template>
                <div class="overlay">
                  <button type="button" (click)="removeMedia(url)"
                          class="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p *ngIf="!videoMedia.length" class="text-sm text-gray-400 italic text-center py-4">Chưa có video nào</p>
          </div>
        </div>

      </form>

      <!-- TAB 4 ── Nội dung Sections (outside form to avoid nested form) -->
      <div *ngIf="activeTab === 'sections'" class="p-6">
        <ng-container *ngIf="isEditMode && propertyId; else sectionsPlaceholder">
          <app-property-sections-manage
            [propertyId]="propertyId"
            [propertyTitle]="propertyForm.value.title"
            [inline]="true">
          </app-property-sections-manage>
        </ng-container>
        <ng-template #sectionsPlaceholder>
          <div class="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-700">Lưu Bất động sản trước</p>
              <p class="text-sm text-gray-400 mt-1 max-w-sm">Sau khi lưu, bạn có thể quản lý nội dung sections (Điểm nổi bật, Mặt bằng, Vị trí, Pháp lý...) ngay tại đây.</p>
            </div>
            <button type="button" (click)="onSubmit()"
                    class="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Lưu ngay →
            </button>
          </div>
        </ng-template>
      </div>

    </div><!-- /scrollable content -->
  </div><!-- /left column -->

  <!-- ═════════════════════ RIGHT: Live Preview ═════════════════════════════ -->
  <div class="hidden xl:flex flex-col w-80 2xl:w-96 border-l bg-white overflow-y-auto shrink-0">
    <div class="px-5 py-4 border-b">
      <p class="text-xs font-bold uppercase tracking-widest text-gray-400">Xem trước</p>
    </div>

    <div class="p-4 flex-1">
      <!-- Preview card -->
      <div class="preview-card">

        <!-- Thumbnail -->
        <div class="h-44 bg-gray-100 relative overflow-hidden">
          <img *ngIf="previewThumbnail" [src]="previewThumbnail" class="w-full h-full object-cover" alt="Preview">
          <div *ngIf="!previewThumbnail"
               class="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
            </svg>
            <p class="text-xs text-gray-300">Chưa có ảnh</p>
          </div>
          <span *ngIf="previewStatus"
                [class]="'absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded ' + statusBadgeClass">
            {{ previewStatus }}
          </span>
        </div>

        <!-- Info -->
        <div class="p-4 space-y-2">
          <span *ngIf="previewCategory"
                class="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
            {{ previewCategory }}
          </span>
          <h3 class="font-bold text-gray-900 text-sm leading-snug">{{ previewTitle }}</h3>
          <p class="text-base font-bold text-gray-900">{{ previewPrice }}</p>
          <p *ngIf="previewAddress" class="text-xs text-gray-500 flex items-start gap-1.5">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
            {{ previewAddress }}
          </p>
          <div *ngIf="previewAttributes.length" class="flex flex-wrap gap-1.5 pt-1">
            <span *ngFor="let a of previewAttributes"
                  class="text-xs bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              {{ a.label }}: <strong>{{ a.value }}</strong>
            </span>
          </div>
        </div>

        <!-- Mini Map -->
        <div *ngIf="previewMapUrl" class="border-t overflow-hidden" style="height:150px;">
          <iframe [src]="previewMapUrl | trustUrl" width="100%" height="150"
                  style="border:0;display:block;" loading="lazy"
                  allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>

      <!-- Media count -->
      <div class="mt-3 flex gap-3 text-xs text-gray-400">
        <span *ngIf="imageMedia.length">📷 {{ imageMedia.length }} ảnh</span>
        <span *ngIf="videoMedia.length">🎬 {{ videoMedia.length }} video</span>
      </div>

      <!-- Quick nav tabs -->
      <div class="mt-4 space-y-1">
        <button *ngFor="let t of tabs" type="button" (click)="activeTab = t.id"
                [class]="'w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ' + (activeTab === t.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50')">
          {{ t.label }}
          <span *ngIf="t.id === 'sections' && !isEditMode" class="ml-1 opacity-60">(lưu BĐS trước)</span>
        </button>
      </div>
    </div>
  </div>

</div>
  `
})
export class PropertyFormComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private api           = inject(ApiService);
  private uploadService = inject(UploadService);
  private router        = inject(Router);
  private route         = inject(ActivatedRoute);
  private cdr           = inject(ChangeDetectorRef);
  private toast         = inject(ToastService);

  propertyForm: FormGroup = this.fb.group({
    title:         ['', Validators.required],
    price:         ['', [Validators.required, Validators.min(0)]],
    category_id:   ['', Validators.required],
    project_id:    [''],
    description:   [''],
    address:       [''],
    map_embed_url: [''],
    status:        ['available'],
    detail_theme:  [null],
  });

  get f() { return this.propertyForm.controls; }

  activeTab: Tab = 'basic';
  tabs = [
    { id: 'basic'    as Tab, label: 'Thông tin' },
    { id: 'address'  as Tab, label: 'Địa chỉ & Bản đồ' },
    { id: 'media'    as Tab, label: 'Hình ảnh & Media' },
    { id: 'sections' as Tab, label: 'Nội dung Sections' },
  ];

  categories:    any[] = [];
  projects:      any[] = [];
  uploadedMedia: string[] = [];
  isUploading    = false;
  uploadProgress = 0;
  uploadTarget: 'image' | 'video' | null = null;
  isSubmitting   = false;
  errorMessage   = '';
  isEditMode     = false;
  propertyId     = '';

  mapsRawUrl    = '';
  videoUrlInput = '';

  galleryLayoutOptions = [
    { value: 'default', label: 'Mặc định',  icon: '🖼️', desc: 'Slider cuộn ngang' },
    { value: 'grid',    label: 'Lưới',      icon: '⊞',  desc: 'Hiển thị lưới ảnh' },
    { value: 'single',  label: 'Đơn',       icon: '📷', desc: 'Ảnh bìa lớn duy nhất' },
  ];

  attrFields: AttrField[] = [];
  attrValues: Record<string, any> = {};
  showAddField = false;
  newFieldLabel = '';
  newFieldValue = '';

  // ── Computed ──────────────────────────────────────────────────────────────
  get imageMedia(): string[] { return this.uploadedMedia.filter(u => !this.isVideo(u)); }
  get videoMedia(): string[] { return this.uploadedMedia.filter(u => this.isVideo(u)); }

  isVideo(url: string):   boolean { return /\.(mp4|webm|mov|avi|mkv)$/i.test(url) || this.isYouTube(url) || this.isVimeo(url); }
  isYouTube(url: string): boolean { return url.includes('youtube.com') || url.includes('youtu.be'); }
  isVimeo(url: string):   boolean { return url.includes('vimeo.com'); }

  // ── Live Preview getters ──────────────────────────────────────────────────
  get previewTitle(): string {
    return this.propertyForm.value.title || 'Tiêu đề Bất động sản';
  }
  get previewPrice(): string {
    const p = Number(this.propertyForm.value.price);
    if (!p) return 'Chưa có giá';
    if (p >= 1_000_000_000) return (p / 1_000_000_000).toFixed(p % 1_000_000_000 ? 2 : 0) + ' tỷ VNĐ';
    if (p >= 1_000_000)     return (p / 1_000_000).toFixed(0) + ' triệu VNĐ';
    return new Intl.NumberFormat('vi-VN').format(p) + ' VNĐ';
  }
  get previewCategory(): string {
    const id = this.propertyForm.value.category_id;
    return this.categories.find(c => String(c.id) === String(id))?.name || '';
  }
  get previewThumbnail(): string { return this.imageMedia[0] || ''; }
  get previewAddress():   string { return this.propertyForm.value.address || ''; }
  get previewMapUrl():    string { return this.propertyForm.value.map_embed_url || ''; }
  get previewStatus(): string {
    const map: Record<string,string> = {
      available: 'Đang bán', sold: 'Đã bán', rented: 'Đã cho thuê', reserved: 'Đặt cọc'
    };
    return map[this.propertyForm.value.status] || '';
  }
  get statusBadgeClass(): string {
    const s = this.propertyForm.value.status;
    if (s === 'sold' || s === 'rented') return 'bg-red-100 text-red-700';
    if (s === 'reserved') return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  }
  get previewAttributes(): Array<{label: string; value: any}> {
    const LABELS: Record<string,string> = {
      bedrooms: 'PN', bathrooms: 'PT', area: 'DT(m²)', floors: 'Tầng',
      floor: 'Tầng', frontage: 'MT(m)', land_area: 'Đất(m²)'
    };
    return Object.entries(this.attrValues)
      .filter(([, v]) => v !== '' && v != null)
      .slice(0, 4)
      .map(([k, v]) => ({ label: LABELS[k] || k, value: v }));
  }

  // ── Category preset ───────────────────────────────────────────────────────
  private presetKey(): string {
    const id  = this.propertyForm.value.category_id;
    const cat = this.categories.find(c => String(c.id) === String(id));
    const hint = `${cat?.slug || ''} ${cat?.name || ''}`.toLowerCase();
    if (/can-ho|căn hộ|apartment/.test(hint))  return 'can-ho';
    if (/biet-thu|biệt thự|villa/.test(hint))  return 'biet-thu';
    if (/nha-pho|nhà phố|town/.test(hint))     return 'nha-pho';
    if (/dat-nen|đất nền|land/.test(hint))     return 'dat-nen';
    if (/shophouse|shop/.test(hint))            return 'shophouse';
    return 'default';
  }

  rebuildAttrFields(): void {
    const preset = ATTRIBUTE_PRESETS[this.presetKey()] || ATTRIBUTE_PRESETS['default'];
    const fields: AttrField[] = [...preset];
    for (const key of Object.keys(this.attrValues)) {
      if (this.attrValues[key] !== '' && this.attrValues[key] != null && !fields.some(f => f.key === key)) {
        fields.push({ key, label: key, type: 'text' });
      }
    }
    this.attrFields = fields;
  }

  addCustomField(): void {
    const label = this.newFieldLabel.trim();
    if (!label) return;
    const key = label
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      || `field_${Date.now()}`;
    const uniqueKey = this.attrFields.some(f => f.key === key)
      ? `${key}_${Date.now()}`
      : key;
    this.attrFields = [...this.attrFields, { key: uniqueKey, label, type: 'text', placeholder: '' }];
    this.attrValues[uniqueKey] = this.newFieldValue.trim();
    this.newFieldLabel = '';
    this.newFieldValue = '';
    this.showAddField = false;
    this.cdr.detectChanges();
  }

  removeAttrField(key: string): void {
    this.attrFields = this.attrFields.filter(f => f.key !== key);
    delete this.attrValues[key];
    this.cdr.detectChanges();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.api.get<any>('/properties/categories').subscribe({
      next: (res) => { this.categories = res.data || []; this.rebuildAttrFields(); this.cdr.detectChanges(); },
      error: () => {}
    });
    this.api.get<any>('/projects').subscribe({
      next: (res) => { this.projects = res.data || []; this.cdr.detectChanges(); },
      error: () => {}
    });

    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.isEditMode = true;
      this.api.get<any>(`/properties/${slug}`).subscribe({
        next: (res) => {
          const prop = res.data;
          this.propertyId = prop.id;
          this.propertyForm.patchValue({
            title:         prop.title        || '',
            price:         prop.price        || '',
            category_id:   prop.category_id  || '',
            project_id:    prop.project_id   || '',
            description:   prop.description  || '',
            address:       prop.address      || '',
            map_embed_url: prop.map_embed_url || '',
            status:        prop.status       || 'available',
            detail_theme:  prop.detail_theme  ?? null,
          });
          this.attrValues = { ...(prop.attributes || {}) };
          this.rebuildAttrFields();
          if (prop.property_media?.length) {
            this.uploadedMedia = prop.property_media.map((m: any) => m.media_url);
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Không thể tải thông tin Bất động sản.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ── Map helpers ───────────────────────────────────────────────────────────
  generateMapEmbed(): void {
    const raw  = this.mapsRawUrl.trim();
    const addr = (this.propertyForm.value.address || '').trim();
    let embed  = '';

    if (raw) {
      const coord = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coord) {
        embed = `https://maps.google.com/maps?q=${coord[1]},${coord[2]}&output=embed&hl=vi`;
      } else {
        const q = raw.match(/[?&]q=([^&]+)/);
        if (q) embed = `https://maps.google.com/maps?q=${q[1]}&output=embed&hl=vi`;
      }
    }
    if (!embed && addr) {
      embed = `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&output=embed&hl=vi`;
    }
    if (embed) {
      this.propertyForm.patchValue({ map_embed_url: embed });
      this.mapsRawUrl = '';
      this.cdr.detectChanges();
    } else {
      this.toast.error('Không thể tạo URL bản đồ. Hãy nhập địa chỉ hoặc link Google Maps.');
    }
  }

  generateFromAddress(): void {
    const addr = (this.propertyForm.value.address || '').trim();
    if (!addr) { this.toast.error('Hãy nhập địa chỉ trước.'); return; }
    this.propertyForm.patchValue({
      map_embed_url: `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&output=embed&hl=vi`
    });
    this.cdr.detectChanges();
  }

  // ── Media ─────────────────────────────────────────────────────────────────
  async onImagesSelected(event: any): Promise<void> {
    const files: FileList = event.target.files;
    if (!files?.length) return;

    this.isUploading   = true;
    this.uploadTarget  = 'image';
    this.uploadProgress = 0;
    this.cdr.detectChanges();

    for (let i = 0; i < files.length; i++) {
      this.uploadProgress = Math.round((i / files.length) * 100);
      this.cdr.detectChanges();
      try {
        const res = await this.uploadService.uploadFile(files[i]).toPromise();
        const url = res?.data?.url || res?.data?.secure_url;
        if (url) this.uploadedMedia.push(url);
      } catch {
        this.toast.error(`Lỗi upload ảnh ${i + 1}`);
      }
    }

    this.uploadProgress = 100;
    this.isUploading   = false;
    this.uploadTarget  = null;
    event.target.value = '';
    this.cdr.detectChanges();
  }

  onVideoSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;
    this.isUploading  = true;
    this.uploadTarget = 'video';
    this.cdr.detectChanges();

    this.uploadService.uploadFile(file).subscribe({
      next: (res) => {
        const url = res?.data?.url || res?.data?.secure_url;
        if (url) this.uploadedMedia.push(url);
        this.isUploading  = false;
        this.uploadTarget = null;
        event.target.value = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Lỗi khi upload video. Vui lòng thử lại.');
        this.isUploading  = false;
        this.uploadTarget = null;
        this.cdr.detectChanges();
      }
    });
  }

  addVideoUrl(): void {
    const url = this.videoUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) { this.toast.error('URL không hợp lệ'); return; }
    this.uploadedMedia.push(url);
    this.videoUrlInput = '';
  }

  setThumbnail(url: string): void {
    const idx = this.uploadedMedia.indexOf(url);
    if (idx <= 0) return;
    this.uploadedMedia.splice(idx, 1);
    this.uploadedMedia.unshift(url);
  }

  removeMedia(url: string): void {
    this.uploadedMedia = this.uploadedMedia.filter(u => u !== url);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      this.activeTab    = 'basic';
      this.errorMessage = 'Vui lòng điền đầy đủ: Tiêu đề, Giá và Danh mục.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const attributes: Record<string, any> = {};
    for (const [k, v] of Object.entries(this.attrValues)) {
      if (v !== '' && v != null) attributes[k] = v;
    }

    const payload = { ...this.propertyForm.value, attributes, media: this.uploadedMedia };

    if (this.isEditMode) {
      this.api.put<any>(`/properties/${this.propertyId}`, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toast.success('Cập nhật Bất động sản thành công!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.error || 'Có lỗi xảy ra khi cập nhật.';
          this.toast.error(this.errorMessage);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.api.post<any>('/properties', payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.toast.success('Thêm Bất động sản thành công! Chuyển sang chỉnh sửa để quản lý nội dung sections.');
          const newSlug = res.data?.slug;
          if (newSlug) this.router.navigate(['/admin/properties/edit', newSlug]);
          else         this.router.navigate(['/admin/properties']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.error || 'Có lỗi xảy ra khi lưu Bất động sản.';
          this.toast.error(this.errorMessage);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
