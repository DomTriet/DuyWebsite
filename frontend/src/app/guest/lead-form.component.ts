import { Component, Input, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { ToastService } from '../core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-lg p-10">
      <h3 class="text-2xl font-black text-gray-900 mb-2">{{ 'LEAD_FORM.TITLE' | translate }}</h3>
      <p class="text-gray-600 text-sm mb-8">{{ 'LEADX.SUBTITLE' | translate }}</p>
      
      <!-- Success -->
      <div *ngIf="showSuccess" class="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-6 flex gap-3 animate-in fade-in">
        <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
        <div>
          <p class="font-bold">{{ 'LEADX.SUCCESS_TITLE' | translate }}</p>
          <p class="text-sm">{{ 'LEADX.SUCCESS_SUB' | translate }}</p>
        </div>
      </div>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()" *ngIf="!showSuccess" class="space-y-5">
        <!-- Name -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEADX.NAME_LABEL' | translate }}</label>
          <input
            type="text"
            formControlName="customer_name"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            [placeholder]="'LEADX.NAME_PLACEHOLDER' | translate"
          >
          <p *ngIf="leadForm.get('customer_name')?.invalid && leadForm.get('customer_name')?.touched" class="text-red-600 text-xs mt-1.5">{{ 'LEADX.NAME_REQUIRED' | translate }}</p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEADX.PHONE_LABEL' | translate }}</label>
          <input
            type="tel"
            formControlName="customer_phone"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            placeholder="0XXXXXXXXX"
          >
          <p *ngIf="leadForm.get('customer_phone')?.hasError('required') && leadForm.get('customer_phone')?.touched" class="text-red-600 text-xs mt-1.5">{{ 'LEAD_FORM.PHONE_REQUIRED' | translate }}</p>
          <p *ngIf="leadForm.get('customer_phone')?.hasError('pattern') && leadForm.get('customer_phone')?.touched" class="text-red-600 text-xs mt-1.5">{{ 'LEAD_FORM.PHONE_INVALID' | translate }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEAD_FORM.EMAIL_LABEL' | translate }}</label>
          <input
            type="email"
            formControlName="customer_email"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            placeholder="your@email.com"
          >
          <p *ngIf="leadForm.get('customer_email')?.invalid && leadForm.get('customer_email')?.touched" class="text-red-600 text-xs mt-1.5">{{ 'LEAD_FORM.EMAIL_INVALID' | translate }}</p>
        </div>

        <!-- Message -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">{{ 'LEADX.MESSAGE_LABEL' | translate }}</label>
          <textarea
            formControlName="message"
            rows="3"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
            [placeholder]="'LEADX.MESSAGE_PLACEHOLDER' | translate"
          ></textarea>
        </div>

        <!-- Submit -->
        <button 
          type="submit" 
          [disabled]="leadForm.invalid || isSubmitting" 
          style="width:100%;padding:12px 16px;background:#0D0D0D;color:#F7F6F3;border-radius:10px;font-weight:700;font-size:0.9rem;border:none;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;margin-top:28px;transition:background 0.2s;" [style.opacity]="(leadForm.invalid || isSubmitting) ? '0.55' : '1'" onmouseover="if(!this.disabled)this.style.background='#1a1a1a'" onmouseout="this.style.background='#0D0D0D'"
        >
          <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSubmitting ? ('LEAD_FORM.SUBMITTING_BTN' | translate) : ('LEADX.SUBMIT' | translate) }}
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
  private translate = inject(TranslateService);
  private toast = inject(ToastService);
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
        this.toast.error(this.translate.instant('LEADX.ERROR'));
      }
    });
  }
}