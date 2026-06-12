import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../core/services/api.service';
import { ToastService } from '../core/services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forum-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <a routerLink="/" style="font-family:'Lora',Georgia,serif; font-size:1.05rem; font-weight:700; letter-spacing:-0.02em; color:#0D0D0D; text-decoration:none;">Điểm Tâm BĐS</a>
          <a routerLink="/forum" class="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {{ 'FORUM.BACK' | translate }}
          </a>
        </div>
      </nav>

      <div class="max-w-4xl mx-auto px-6 py-20">
        <!-- Header -->
        <div class="mb-16">
          <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-4">{{ 'FORUM_PAGE.CREATE_TITLE' | translate }}</h1>
          <p class="text-lg text-gray-600">{{ 'FORUM_PAGE.CREATE_SUB' | translate }}</p>
        </div>

        <!-- Form -->
        <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="bg-white rounded-2xl border border-gray-200 p-10 shadow-lg">
          <!-- Title -->
          <div class="mb-6">
            <label for="title" class="block text-sm font-semibold text-gray-900 mb-2">{{ 'FORUM_PAGE.TITLE_LABEL' | translate }}</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              [placeholder]="'FORUM_PAGE.TITLE_PLACEHOLDER' | translate"
            >
            <p *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="text-red-600 text-xs mt-1.5">{{ 'FORUM_PAGE.TITLE_REQUIRED' | translate }}</p>
          </div>

          <!-- Content -->
          <div class="mb-8">
            <label for="content" class="block text-sm font-semibold text-gray-900 mb-2">{{ 'FORUM_PAGE.CONTENT_LABEL' | translate }}</label>
            <textarea
              id="content"
              formControlName="content"
              rows="10"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
              [placeholder]="'FORUM_PAGE.CONTENT_PLACEHOLDER' | translate"
            ></textarea>
            <p *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched" class="text-red-600 text-xs mt-1.5">{{ 'FORUM_PAGE.CONTENT_REQUIRED' | translate }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ 'FORUM_PAGE.REVIEW_NOTE' | translate }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <a routerLink="/forum" class="text-gray-600 hover:text-gray-900 font-medium transition-colors">{{ 'FORUM_PAGE.CANCEL' | translate }}</a>
            <button 
              type="submit" 
              [disabled]="postForm.invalid || isSubmitting" 
              style="background:#0D0D0D;color:#F7F6F3;padding:12px 28px;border-radius:8px;font-weight:700;font-size:0.9rem;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background 0.2s;" [style.opacity]="(postForm.invalid || isSubmitting) ? '0.5' : '1'"
            >
              <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isSubmitting ? ('FORUM_PAGE.SENDING' | translate) : ('FORUM_PAGE.SUBMIT' | translate) }}
            </button>
          </div>
        </form>

        <!-- Guidelines -->
        <div style="margin-top:40px; background:#F7F6F3; border:1px solid #EBEBEB; border-radius:14px; padding:24px;">
          <p style="font-weight:700; color:#0D0D0D; margin-bottom:10px; font-size:0.9rem;">{{ 'FORUM_PAGE.GUIDE_TITLE' | translate }}</p>
          <ul style="font-size:0.85rem; color:#555; line-height:1.8;" class="space-y-1">
            <li>• {{ 'FORUM_PAGE.GUIDE_1' | translate }}</li>
            <li>• {{ 'FORUM_PAGE.GUIDE_2' | translate }}</li>
            <li>• {{ 'FORUM_PAGE.GUIDE_3' | translate }}</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class ForumCreateComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  isSubmitting = false;
  postForm: FormGroup = this.fb.group({ title: ['', Validators.required], content: ['', Validators.required] });

  submitPost() {
    if (this.postForm.invalid) { this.postForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.api.post('/forum', this.postForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.toast.success(this.translate.instant('FORUM_PAGE.SUBMIT_SUCCESS')); this.router.navigate(['/forum']); },
      error: (err) => { console.error(err); this.toast.error(err.error?.message || this.translate.instant('FORUM_PAGE.SUBMIT_ERROR')); this.isSubmitting = false; }
    });
  }
}