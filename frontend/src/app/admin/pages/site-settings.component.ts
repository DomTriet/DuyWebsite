import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:680px;">
      <div style="margin-bottom:32px;">
        <h1 style="font-family:'Space Grotesk',system-ui,sans-serif;font-size:1.5rem;font-weight:800;color:#0D0D0D;letter-spacing:-0.02em;margin-bottom:4px;">Cài đặt Website</h1>
        <p style="font-size:0.875rem;color:#6B7280;">Bật hoặc tắt các tính năng trên website khách.</p>
      </div>

      <!-- Feature Toggles Card -->
      <div style="background:#fff;border:1px solid #E5E4E0;border-radius:16px;padding:28px;">
        <h2 style="font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9CA3AF;margin-bottom:20px;">Tính năng</h2>

        <!-- Forum toggle -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #F5F4F2;">
          <div>
            <div style="font-size:0.95rem;font-weight:600;color:#111;margin-bottom:4px;">Diễn đàn cộng đồng</div>
            <div style="font-size:0.8rem;color:#6B7280;max-width:380px;">Khi bật, link "Cộng đồng" sẽ xuất hiện trong menu điều hướng và footer. Bài viết vẫn cần Admin duyệt trước khi công khai.</div>
          </div>
          <button
            (click)="toggleForum()"
            [disabled]="saving"
            [style.opacity]="saving ? '0.6' : '1'"
            [style.background]="forumEnabled ? '#0D0D0D' : '#E5E7EB'"
            style="position:relative;display:inline-flex;align-items:center;flex-shrink:0;width:52px;height:28px;border:none;border-radius:9999px;cursor:pointer;transition:background 0.2s;margin-left:20px;"
            [attr.aria-label]="forumEnabled ? 'Tắt Forum' : 'Bật Forum'"
            [attr.aria-pressed]="forumEnabled">
            <span
              [style.transform]="forumEnabled ? 'translateX(26px)' : 'translateX(4px)'"
              style="display:inline-block;width:20px;height:20px;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:transform 0.2s;">
            </span>
          </button>
        </div>

        <div style="padding-top:16px;">
          <div style="font-size:0.78rem;color:#9CA3AF;display:flex;align-items:center;gap:6px;">
            <svg style="width:14px;height:14px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Thay đổi có hiệu lực ngay lập tức đối với tất cả người dùng.
          </div>
        </div>
      </div>
    </div>
  `
})
export class SiteSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  forumEnabled = false;
  saving = false;

  ngOnInit() {
    this.settingsService.getSetting('forum_enabled').subscribe(val => {
      this.forumEnabled = !!val;
      this.cdr.markForCheck();
    });
  }

  toggleForum() {
    if (this.saving) return;
    this.saving = true;
    const newVal = !this.forumEnabled;
    this.settingsService.updateSetting('forum_enabled', newVal).subscribe({
      next: () => {
        this.forumEnabled = newVal;
        this.saving = false;
        this.toast.success(newVal ? 'Đã bật Forum công khai.' : 'Đã tắt Forum.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.toast.error('Lỗi khi lưu cài đặt.');
        this.cdr.markForCheck();
      }
    });
  }
}
