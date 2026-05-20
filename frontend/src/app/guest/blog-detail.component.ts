import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white" *ngIf="blog">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">RESTATE</a>
          <a routerLink="/blogs" class="inline-flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-semibold transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại
          </a>
        </div>
      </nav>

      <!-- Article Header -->
      <header class="max-w-4xl mx-auto px-6 py-16">
        <div class="flex items-center gap-3 mb-6">
          <time class="text-sm font-semibold text-gray-600 uppercase">{{ blog.created_at | date:'dd/MM/yyyy' }}</time>
          <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Bài viết</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8">{{ blog.title }}</h1>
        <button (click)="shareBlog()" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          Chia sẻ
        </button>
      </header>

      <!-- Article Content -->
      <article class="max-w-4xl mx-auto px-6 pb-20">
        <div class="space-y-8">
          <ng-container *ngFor="let block of blog.content_blocks">
            
            <!-- Text Block -->
            <div *ngIf="block.type === 'text'" [innerHTML]="sanitizeHtml(block.value)" class="text-gray-800 leading-relaxed text-lg prose prose-invert"></div>
            
            <!-- Heading Block -->
            <h2 *ngIf="block.type === 'heading'" class="text-3xl font-bold text-gray-900 mt-8 pt-6 border-t border-gray-200">{{ block.value }}</h2>
            
            <!-- Image Block -->
            <figure *ngIf="block.type === 'image'" class="rounded-xl overflow-hidden shadow-lg">
              <img [src]="block.value" class="w-full h-96 object-cover" alt="Blog Image">
            </figure>
            
            <!-- Video Block (YouTube) -->
            <div *ngIf="block.type === 'video' && getYoutubeId(block.value)" class="rounded-xl overflow-hidden shadow-lg">
              <iframe [src]="getSafeYoutubeUrl(getYoutubeId(block.value))" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-96"></iframe>
            </div>

          </ng-container>
        </div>
      </article>

      <!-- CTA Section -->
      <section class="bg-indigo-600 text-white py-20">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h3 class="text-3xl font-black mb-4">Có câu hỏi?</h3>
          <p class="text-lg text-indigo-100 mb-8">Tham gia cộng đồng của chúng tôi để thảo luận và nhận tư vấn từ chuyên gia</p>
          <a routerLink="/forum" class="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-50 transition-all">Tham gia thảo luận</a>
        </div>
      </section>
    </div>
  `
})
export class BlogDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);
  private cdr = inject(ChangeDetectorRef);
  
  blog: any = null;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      // API lấy chi tiết Blog (Bạn có thể cần tạo endpoint này ở BUS nếu chưa có, hoặc lọc từ GET /blogs)
      this.api.get<any>(`/blogs?slug=${slug}`).subscribe({
        next: (res) => { 
          this.blog = res.data?.[0] || null; 
          if (this.blog) {
            // Tự động tìm đoạn Text đầu tiên làm Description
            const firstText = this.blog.content_blocks?.find((b: any) => b.type === 'text')?.value || '';
            const cleanText = firstText.replace(/<[^>]*>?/gm, '').substring(0, 160);
            
            // Tự động tìm Image đầu tiên làm Thumbnail
            const firstImg = this.blog.content_blocks?.find((b: any) => b.type === 'image')?.value;
            
            this.seoService.setMeta({
              title: this.blog.title,
              desc: cleanText,
              image: firstImg
            });
            this.cdr.markForCheck();
          }
        },
        error: () => { this.cdr.markForCheck(); }
      });
    }
  }

  shareBlog() {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({ title: this.blog.title, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('Đã sao chép đường dẫn!'));
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
