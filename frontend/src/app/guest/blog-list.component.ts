import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { GuestNavComponent } from '../shared/components/guest-nav/guest-nav.component';
import { GuestFooterComponent } from '../shared/components/guest-footer/guest-footer.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, GuestNavComponent, GuestFooterComponent],
  styles: [`
    :host { display: block; }
    .blog-title { font-family: 'Lora', Georgia, serif; }
    .section-title { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.025em; }
    .blog-card { border: 1px solid #EBEBEB; border-radius: 18px; overflow: hidden; background: #fff; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s; display: flex; flex-direction: column; }
    .blog-card:hover { transform: translateY(-4px); box-shadow: 0 18px 44px rgba(0,0,0,0.09); }
    .read-more { display: inline-flex; align-items: center; gap: 6px; font-size: 0.825rem; font-weight: 700; color: #0D0D0D; text-decoration: none; letter-spacing: -0.01em; }
    .read-more:hover { gap: 10px; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    .reveal { animation: revealUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
  `],
  template: `
    <div class="min-h-screen flex flex-col bg-white">
      <app-guest-nav active="blogs"></app-guest-nav>

      <!-- Hero -->
      <section style="background:#F7F6F3; padding: 80px 24px 72px; border-bottom: 1px solid #EBEBEB;">
        <div style="max-width:640px; margin:0 auto; text-align:center;" class="reveal">
          <p style="font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#999; margin-bottom:16px;">
            {{ 'BLOG_LIST.BADGE' | translate }}
          </p>
          <h1 class="blog-title" style="font-size:clamp(2.2rem,6vw,4rem); font-weight:700; color:#0D0D0D; margin-bottom:18px; line-height:1.15; font-style:italic;">
            {{ 'BLOG_LIST.TITLE' | translate }}
          </h1>
          <p style="font-size:1.05rem; color:#6B7280; line-height:1.75; max-width:480px; margin:0 auto;">{{ 'BLOG_LIST.SUB' | translate }}</p>
        </div>
      </section>

      <!-- Content -->
      <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6" style="padding-top:56px; padding-bottom:80px;">

        <!-- Skeleton -->
        <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="animate-pulse">
            <div style="background:#EBEBEB; border-radius:18px; height:clamp(180px,55vw,220px); margin-bottom:16px;"></div>
            <div style="background:#EBEBEB; border-radius:5px; height:12px; width:80px; margin-bottom:12px;"></div>
            <div style="background:#EBEBEB; border-radius:5px; height:20px; width:75%; margin-bottom:8px;"></div>
            <div style="background:#EBEBEB; border-radius:5px; height:12px; width:100%; margin-bottom:6px;"></div>
            <div style="background:#EBEBEB; border-radius:5px; height:12px; width:65%;"></div>
          </div>
        </div>

        <!-- Grid -->
        <div *ngIf="!isLoading && blogs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let blog of blogs" class="group blog-card">
            <a [routerLink]="['/blogs', blog.slug]" style="display:block; position:relative; height:clamp(180px,55vw,220px); overflow:hidden; background:#F0EFE9; flex-shrink:0;">
              <img *ngIf="getThumbnail(blog)" [src]="getThumbnail(blog)"
                   style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s cubic-bezier(0.16,1,0.3,1);" class="group-hover:scale-105"
                   [alt]="blog.title" loading="lazy">
              <div *ngIf="!getThumbnail(blog)" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#D4D4D4;">
                <svg style="width:48px;height:48px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            </a>
            <div style="padding:22px 24px 24px; display:flex; flex-direction:column; flex:1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; font-size:0.78rem; color:#9CA3AF; font-weight:500;">
                <time>{{ blog.created_at | date:'dd/MM/yyyy' }}</time>
                <span *ngIf="blog.profiles?.full_name" style="color:#D4D4D4;">·</span>
                <span *ngIf="blog.profiles?.full_name">{{ blog.profiles.full_name }}</span>
              </div>
              <h2 class="blog-title" style="font-size:1.15rem; font-weight:700; color:#0D0D0D; line-height:1.4; margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; flex:1; transition:color 0.2s; font-style:italic;" class="group-hover:text-gray-500">
                <a [routerLink]="['/blogs', blog.slug]" style="text-decoration:none; color:inherit;">{{ blog.title }}</a>
              </h2>
              <a [routerLink]="['/blogs', blog.slug]" class="read-more" style="margin-top:auto; transition:gap 0.2s; min-height:44px; display:inline-flex; align-items:center;">
                {{ 'BLOG_LIST.READ_MORE' | translate }}
                <svg style="width:14px;height:14px;transition:transform 0.2s;" class="group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
            </div>
          </article>
        </div>

        <!-- Empty -->
        <div *ngIf="!isLoading && blogs.length === 0" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:96px 0;text-align:center;">
          <svg style="width:56px;height:56px;color:#E5E4E0;margin-bottom:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v4m2 4h.01M15 17h6m-3-3v6"/></svg>
          <p style="color:#6B7280;font-size:1rem;font-weight:600;">{{ 'BLOG_LIST.EMPTY' | translate }}</p>
          <p style="color:#9CA3AF;font-size:0.875rem;margin-top:4px;">{{ 'BLOG_LIST.EMPTY_SUB' | translate }}</p>
        </div>
      </main>

      <app-guest-footer></app-guest-footer>
    </div>
  `
})
export class BlogListComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);

  blogs: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.seoService.setMeta({
      title: 'Tin tức Bất động sản',
      desc: 'Cập nhật những thông tin thị trường, dự án và kinh nghiệm đầu tư Bất động sản mới nhất.',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80'
    });

    this.api.get<any>('/blogs').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.blogs = res.data || []; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  getThumbnail(blog: any): string | null {
    return blog.content_blocks?.find((b: any) => b.type === 'image')?.value || null;
  }
}
