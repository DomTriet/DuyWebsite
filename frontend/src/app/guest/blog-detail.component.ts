import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { LanguageService } from '../core/services/language.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../core/services/toast.service';
import { GuestNavComponent } from '../shared/components/guest-nav/guest-nav.component';
import { GuestFooterComponent } from '../shared/components/guest-footer/guest-footer.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, GuestNavComponent, GuestFooterComponent],
  styles: [`
    :host { display: block; }
    .blog-headline { font-family: 'Lora', Georgia, serif; font-style: italic; }
    .section-label { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.02em; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #9CA3AF; text-decoration: none; letter-spacing: 0.03em; transition: color 0.2s; }
    .back-link:hover { color: #0D0D0D; }
    .share-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 700; color: #374151; background: #F7F6F3; border: 1px solid #E5E4E0; border-radius: 8px; padding: 8px 16px; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
    .share-btn:hover { background: #EBEBEB; border-color: #D1D0CB; }
    .related-card { display: block; background: #fff; border-radius: 14px; border: 1px solid #EBEBEB; padding: 20px; text-decoration: none; transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s; }
    .related-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }
  `],
  template: `
    <div class="min-h-screen flex flex-col bg-white">
      <app-guest-nav active="blogs"></app-guest-nav>

      <div *ngIf="blog" class="flex-1 max-w-3xl mx-auto w-full px-6" style="padding-top:52px; padding-bottom:80px;">
        <!-- Back Button -->
        <a routerLink="/blogs" class="back-link" style="margin-bottom:40px; display:inline-flex;">
          <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m0 0l7-7m-7 7l7 7"/></svg>
          {{ 'BLOG_DETAIL.BACK' | translate }}
        </a>

        <!-- Article Header -->
        <header style="margin-bottom:48px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:18px;">
            <span style="display:inline-block; width:6px; height:6px; background:#0D0D0D; border-radius:50%;"></span>
            <time style="font-size:0.78rem; color:#9CA3AF; font-weight:500; letter-spacing:0.05em;">{{ blog.created_at | date:'dd/MM/yyyy HH:mm' }}</time>
          </div>

          <h1 class="blog-headline" style="font-size:clamp(2rem,5.5vw,3.4rem); font-weight:700; color:#0D0D0D; line-height:1.2; margin-bottom:24px;">{{ blog.title }}</h1>

          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
            <span *ngIf="isTranslated"
                  style="display:inline-flex; align-items:center; gap:6px; font-size:0.72rem; font-weight:600; color:#92400E; background:#FFFBEB; border:1px solid #FDE68A; padding:6px 12px; border-radius:20px;">
              <svg style="width:11px;height:11px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
              {{ 'BLOG_DETAIL.AUTO_TRANS' | translate }}
            </span>

            <button (click)="shareBlog()" class="share-btn">
              <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              {{ 'BLOG_DETAIL.SHARE' | translate }}
            </button>
          </div>
        </header>

        <!-- Article Content -->
        <article style="background:#fff; border-radius:20px; border:1px solid #EBEBEB; padding:40px 48px; margin-bottom:56px;" class="prose-article">
          <div class="prose prose-lg max-w-none prose-gray">
            <ng-container *ngFor="let block of blog.content_blocks">
              <div *ngIf="block.type === 'text'" [innerHTML]="sanitizeHtml(block.value)" style="margin-bottom:28px; color:#374151; line-height:1.85; font-size:1.05rem;"></div>
              <h2 *ngIf="block.type === 'heading'" class="section-label" style="font-size:1.6rem; font-weight:700; color:#0D0D0D; margin-top:48px; margin-bottom:20px; padding-top:32px; border-top:1px solid #EBEBEB;">{{ block.value }}</h2>
              <figure *ngIf="block.type === 'image'" style="margin: 40px 0;">
                <img [src]="block.value" style="width:100%; border-radius:16px; box-shadow:0 12px 32px rgba(0,0,0,0.1); object-fit:cover;" alt="Blog Image">
              </figure>
              <div *ngIf="block.type === 'video' && getYoutubeId(block.value)" style="margin:40px 0; border-radius:16px; overflow:hidden; box-shadow:0 12px 32px rgba(0,0,0,0.1);">
                <iframe [src]="getSafeYoutubeUrl(getYoutubeId(block.value))" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:450px;"></iframe>
              </div>
            </ng-container>
          </div>
        </article>

        <!-- Related Articles -->
        <div *ngIf="relatedBlogs.length > 0" style="margin-bottom:56px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
            <span style="display:inline-block; width:3px; height:22px; background:#0D0D0D; border-radius:2px;"></span>
            <h3 class="section-label" style="font-size:1.1rem; font-weight:700; color:#0D0D0D; margin:0;">{{ 'BLOG_DETAIL.RELATED' | translate }}</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a *ngFor="let r of relatedBlogs" [routerLink]="['/blogs', r.slug]" class="related-card group">
              <time style="font-size:0.72rem; color:#9CA3AF; font-weight:500;">{{ r.created_at | date:'dd/MM/yyyy' }}</time>
              <h4 class="section-label" style="font-size:0.875rem; font-weight:600; color:#0D0D0D; margin-top:8px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; line-height:1.5; transition:color 0.2s;" class="group-hover:text-gray-500">{{ r.title }}</h4>
              <span style="display:inline-flex; align-items:center; gap:4px; margin-top:12px; font-size:0.75rem; font-weight:700; color:#374151;">
                {{ 'BLOG_DETAIL.READ_MORE' | translate }}
                <svg style="width:11px;height:11px;transition:transform 0.2s;" class="group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </span>
            </a>
          </div>
        </div>

        <!-- CTA Section (dark editorial) -->
        <div style="background:#0D0D0D; border-radius:20px; padding:56px 48px; text-align:center;">
          <p style="font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#666; margin-bottom:14px;">Bất Động Sản Điểm Tâm</p>
          <h3 class="blog-headline" style="font-size:clamp(1.5rem,4vw,2.2rem); font-weight:700; color:#F7F6F3; margin-bottom:12px;">{{ 'BLOG_DETAIL.CTA_TITLE' | translate }}</h3>
          <p style="color:#999; margin-bottom:28px; font-size:0.95rem; line-height:1.7;">{{ 'BLOG_DETAIL.CTA_SUB' | translate }}</p>
          <a routerLink="/blogs" style="display:inline-block; background:#F7F6F3; color:#0D0D0D; padding:13px 28px; border-radius:10px; font-weight:700; font-size:0.875rem; text-decoration:none; transition:background 0.2s;" onmouseover="this.style.background='#EBEBEB'" onmouseout="this.style.background='#F7F6F3'">
            {{ 'BLOG_DETAIL.CTA_BTN' | translate }}
          </a>
        </div>
      </div>

      <app-guest-footer></app-guest-footer>
    </div>
  `
})
export class BlogDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);
  private languageService = inject(LanguageService);
  private translateService = inject(TranslateService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  blog: any = null;
  originalBlog: any = null;
  isTranslated = false;
  relatedBlogs: any[] = [];

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.api.get<any>(`/blogs?slug=${slug}`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.blog = res.data?.[0] || null;
        if (!this.blog) return;

        this.originalBlog = JSON.parse(JSON.stringify(this.blog));
        this.updateSeo();
        this.loadTranslation();
        this.loadRelatedBlogs();

        this.translateService.onLangChange
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.loadTranslation());

        this.cdr.markForCheck();
      },
      error: () => { this.cdr.markForCheck(); }
    });
  }

  private loadRelatedBlogs() {
    this.api.get<any>(`/blogs/${this.blog.id}/related?limit=3`).subscribe({
      next: (res) => { this.relatedBlogs = res.data || []; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  private loadTranslation() {
    if (this.languageService.currentLang === 'vi') {
      this.blog.title = this.originalBlog.title;
      this.blog.content_blocks = this.originalBlog.content_blocks;
      this.isTranslated = false;
      this.updateSeo();
      this.cdr.markForCheck();
      return;
    }

    this.languageService.getDynamicTranslation('blog', this.blog.id)?.subscribe(res => {
      if (!res.fallback && res.data) {
        this.blog.title = res.data.title ?? this.originalBlog.title;
        this.blog.content_blocks = res.data.content_blocks ?? this.originalBlog.content_blocks;
        // Nếu bản dịch chưa được duyệt — hiển thị badge cảnh báo
        this.isTranslated = !res.approved;
      } else {
        this.blog.title = this.originalBlog.title;
        this.blog.content_blocks = this.originalBlog.content_blocks;
        this.isTranslated = false;
      }
      this.updateSeo();
      this.cdr.markForCheck();
    });
  }

  private updateSeo() {
    if (!this.blog) return;
    const firstText = this.blog.content_blocks?.find((b: any) => b.type === 'text')?.value || '';
    const cleanText = firstText.replace(/<[^>]*>?/gm, '').substring(0, 160);
    const firstImg = this.blog.content_blocks?.find((b: any) => b.type === 'image')?.value;
    this.seoService.setMeta({ title: this.blog.title, desc: cleanText, image: firstImg });
  }

  shareBlog() {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({ title: this.blog.title, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => this.toast.success(this.translateService.instant('THEME.DETAIL.LINK_COPIED')));
    }
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getYoutubeId(url: string): string | null {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeYoutubeUrl(videoId: string | null): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }
}
