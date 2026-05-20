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
    <div class="max-w-3xl mx-auto px-4 py-12" *ngIf="blog">
      <a routerLink="/blogs" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Trở về danh sách
      </a>

      <header class="mb-10">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">{{ blog.title }}</h1>
        <div class="flex items-center text-gray-500 text-sm">
          <span>Đăng lúc: {{ blog.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="mt-4">
          <button (click)="shareBlog()" class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors border border-gray-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Chia sẻ bài viết
          </button>
        </div>
      </header>

      <!-- Layout Builder Renderer -->
      <article class="prose prose-lg max-w-none prose-indigo">
        <ng-container *ngFor="let block of blog.content_blocks">
          
          <!-- Text Block -->
          <div *ngIf="block.type === 'text'" [innerHTML]="sanitizeHtml(block.value)" class="mb-6 text-gray-800 leading-relaxed"></div>
          
          <!-- Heading Block -->
          <h2 *ngIf="block.type === 'heading'" class="text-2xl font-bold text-gray-900 mt-10 mb-4">{{ block.value }}</h2>
          
          <!-- Image Block -->
          <figure *ngIf="block.type === 'image'" class="my-8">
            <img [src]="block.value" class="w-full rounded-2xl shadow-md object-cover" alt="Blog Image">
          </figure>
          
          <!-- Video Block (YouTube) -->
          <div *ngIf="block.type === 'video' && getYoutubeId(block.value)" class="my-8 aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-md">
            <iframe [src]="getSafeYoutubeUrl(getYoutubeId(block.value))" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-[400px]"></iframe>
          </div>

        </ng-container>
      </article>
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