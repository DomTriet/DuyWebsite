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
    <div class="bg-white rounded-2xl border border-gray-200 shadow-lg p-10">
      <h3 class="text-2xl font-black text-gray-900 mb-2">Liên hệ tư vấn</h3>
      <p class="text-gray-600 text-sm mb-8">Chúng tôi sẽ hỗ trợ bạn nhanh chóng</p>
      
      <!-- Success -->
      <div *ngIf="showSuccess" class="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-6 flex gap-3 animate-in fade-in">
        <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
        <div>
          <p class="font-bold">Thành công!</p>
          <p class="text-sm">Chúng tôi sẽ liên hệ bạn sớm nhất</p>
        </div>
      </div>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()" *ngIf="!showSuccess" class="space-y-5">
        <!-- Name -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Tên *</label>
          <input 
            type="text" 
            formControlName="customer_name" 
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
            placeholder="Họ và tên"
          >
          <p *ngIf="leadForm.get('customer_name')?.invalid && leadForm.get('customer_name')?.touched" class="text-red-600 text-xs mt-1.5">Vui lòng nhập tên</p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Điện thoại *</label>
          <input 
            type="tel" 
            formControlName="customer_phone" 
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
            placeholder="0XXXXXXXXX"
          >
          <p *ngIf="leadForm.get('customer_phone')?.hasError('required') && leadForm.get('customer_phone')?.touched" class="text-red-600 text-xs mt-1.5">Vui lòng nhập số điện thoại</p>
          <p *ngIf="leadForm.get('customer_phone')?.hasError('pattern') && leadForm.get('customer_phone')?.touched" class="text-red-600 text-xs mt-1.5">Số điện thoại không hợp lệ</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Email</label>
          <input 
            type="email" 
            formControlName="customer_email" 
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
            placeholder="your@email.com"
          >
          <p *ngIf="leadForm.get('customer_email')?.invalid && leadForm.get('customer_email')?.touched" class="text-red-600 text-xs mt-1.5">Email không hợp lệ</p>
        </div>

        <!-- Message -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Tin nhắn</label>
          <textarea 
            formControlName="message" 
            rows="3" 
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none" 
            placeholder="Tin nhắn của bạn..."
          ></textarea>
        </div>

        <!-- Submit -->
        <button 
          type="submit" 
          [disabled]="leadForm.invalid || isSubmitting" 
          class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2 mt-8"
        >
          <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSubmitting ? 'Đang gửi...' : 'Gửi thông tin' }}
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
