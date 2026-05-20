import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
      <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ 'LEAD_FORM.TITLE' | translate }}</h3>
      <p class="text-gray-600 text-sm mb-6">Điền thông tin để được hỗ trợ tư vấn</p>
      
      <!-- Success Message -->
      <div *ngIf="showSuccess" class="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top">
        <svg class="w-6 h-6 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
          <p class="font-semibold">Thành công!</p>
          <p class="text-sm">{{ 'LEAD_FORM.SUCCESS_MSG' | translate }}</p>
        </div>
      </div>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()" *ngIf="!showSuccess" class="space-y-5">
        <!-- Name Field -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEAD_FORM.NAME_LABEL' | translate }} *</label>
          <input 
            type="text" 
            formControlName="customer_name" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400" 
            [placeholder]="'LEAD_FORM.NAME_PLACEHOLDER' | translate"
          >
          <p *ngIf="leadForm.get('customer_name')?.invalid && leadForm.get('customer_name')?.touched" class="text-red-600 text-sm mt-1 flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            {{ 'LEAD_FORM.NAME_REQUIRED' | translate }}
          </p>
        </div>

        <!-- Phone Field -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEAD_FORM.PHONE_LABEL' | translate }} *</label>
          <input 
            type="tel" 
            formControlName="customer_phone" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400" 
            [placeholder]="'LEAD_FORM.PHONE_PLACEHOLDER' | translate"
          >
          <p *ngIf="leadForm.get('customer_phone')?.hasError('required') && leadForm.get('customer_phone')?.touched" class="text-red-600 text-sm mt-1 flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            {{ 'LEAD_FORM.PHONE_REQUIRED' | translate }}
          </p>
          <p *ngIf="leadForm.get('customer_phone')?.hasError('pattern') && leadForm.get('customer_phone')?.touched" class="text-red-600 text-sm mt-1 flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            {{ 'LEAD_FORM.PHONE_INVALID' | translate }}
          </p>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEAD_FORM.EMAIL_LABEL' | translate }}</label>
          <input 
            type="email" 
            formControlName="customer_email" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400" 
            [placeholder]="'LEAD_FORM.EMAIL_PLACEHOLDER' | translate"
          >
          <p *ngIf="leadForm.get('customer_email')?.invalid && leadForm.get('customer_email')?.touched" class="text-red-600 text-sm mt-1 flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            {{ 'LEAD_FORM.EMAIL_INVALID' | translate }}
          </p>
        </div>

        <!-- Message Field -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEAD_FORM.MESSAGE_LABEL' | translate }}</label>
          <textarea 
            formControlName="message" 
            rows="4" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 resize-none" 
            [placeholder]="'LEAD_FORM.MESSAGE_PLACEHOLDER' | translate"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          [disabled]="leadForm.invalid || isSubmitting" 
          class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
        >
          <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSubmitting ? ('LEAD_FORM.SUBMITTING_BTN' | translate) : ('LEAD_FORM.SUBMIT_BTN' | translate) }}
        </button>
      </form>
    </div>
  `
})
export class LeadFormComponent {
  @Input() propertyId!: string;
  @Input() agentId?: string; // Tùy chọn, API backend sẽ tự xác định nếu thiếu

  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  isSubmitting = false;
  showSuccess = false;

  leadForm: FormGroup = this.fb.group({
    customer_name: ['', Validators.required],
    customer_phone: ['', [Validators.required, Validators.pattern(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)]],
    customer_email: ['', [Validators.email]],
    message: ['Tôi muốn nhận báo giá chi tiết và đi xem nhà.']
  });

  onSubmit() {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    
    const payload = {
      ...this.leadForm.value,
      property_id: this.propertyId,
      agent_id: this.agentId
    };

    this.api.post<any>('/leads', payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccess = true;
        this.leadForm.reset();
        
        // Ẩn thông báo sau 5 giây để người dùng có thể gửi yêu cầu khác nếu muốn
        setTimeout(() => {
          this.showSuccess = false;
          this.leadForm.patchValue({ message: 'Tôi muốn nhận báo giá chi tiết và đi xem nhà.' });
        }, 5000);
      },
      error: (err: any) => {
        console.error('Lỗi gửi lead:', err);
        this.isSubmitting = false;
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    });
  }
}
