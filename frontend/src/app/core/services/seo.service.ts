import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  setMeta(config: { title: string, desc: string, image?: string }) {
    // Cập nhật Title trang
    this.titleService.setTitle(`${config.title} | Pro-RealEstate`);

    // Cập nhật Meta Description cho Google Bot
    this.metaService.updateTag({ name: 'description', content: config.desc });

    // Cập nhật OpenGraph cho Facebook / Zalo Share
    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.desc });
    
    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
    }
    
    if (isPlatformBrowser(this.platformId)) {
      this.metaService.updateTag({ property: 'og:url', content: window.location.href });
    }
  }
}