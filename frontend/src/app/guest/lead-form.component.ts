import { Component, Input, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">{{ 'LEAD_FORM.TITLE' | translate }}</h3>
      
      <!-- Success Message -->
      <div *ngIf="showSuccess" class="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-start gap-3">
        <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-sm font-medium">{{ 'LEAD_FORM.SUCCESS_MSG' | translate }}</p>
      </div>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()" *ngIf="!showSuccess">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'LEAD_FORM.NAME_LABEL' | translate }}</label>
            <input type="text" formControlName="customer_name" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" [placeholder]="'LEAD_FORM.NAME_PLACEHOLDER' | translate">
            <p *ngIf="leadForm.get('customer_name')?.invalid && leadForm.get('customer_name')?.touched" class="text-red-500 text-xs mt-1">{{ 'LEAD_FORM.NAME_REQUIRED' | translate }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'LEAD_FORM.PHONE_LABEL' | translate }}</label>
            <input type="tel" formControlName="customer_phone" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" [placeholder]="'LEAD_FORM.PHONE_PLACEHOLDER' | translate">
            <p *ngIf="leadForm.get('customer_phone')?.hasError('required') && leadForm.get('customer_phone')?.touched" class="text-red-500 text-xs mt-1">{{ 'LEAD_FORM.PHONE_REQUIRED' | translate }}</p>
            <p *ngIf="leadForm.get('customer_phone')?.hasError('pattern') && leadForm.get('customer_phone')?.touched" class="text-red-500 text-xs mt-1">{{ 'LEAD_FORM.PHONE_INVALID' | translate }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'LEAD_FORM.EMAIL_LABEL' | translate }}</label>
            <input type="email" formControlName="customer_email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" [placeholder]="'LEAD_FORM.EMAIL_PLACEHOLDER' | translate">
            <p *ngIf="leadForm.get('customer_email')?.invalid && leadForm.get('customer_email')?.touched" class="text-red-500 text-xs mt-1">{{ 'LEAD_FORM.EMAIL_INVALID' | translate }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'LEAD_FORM.MESSAGE_LABEL' | translate }}</label>
            <textarea formControlName="message" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" [placeholder]="'LEAD_FORM.MESSAGE_PLACEHOLDER' | translate"></textarea>
          </div>

          <button type="submit" [disabled]="leadForm.invalid || isSubmitting" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
            <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isSubmitting ? ('LEAD_FORM.SUBMITTING_BTN' | translate) : ('LEAD_FORM.SUBMIT_BTN' | translate) }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class LeadFormComponent {
  @Input() propertyId!: string;
  @Input() agentId?: string; // Tùy chọn, API backend sẽ tự xác định nếu thiếu

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

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

    this.api.post<any>('/leads', payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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