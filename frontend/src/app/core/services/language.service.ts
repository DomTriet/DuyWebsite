import { Injectable, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  private activeLang = 'vi';

  constructor() {
    this.translate.addLangs(['vi', 'en', 'ko', 'zh']);
    this.translate.setDefaultLang('vi');

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang') || 'vi';
      this.activeLang = savedLang;
      this.translate.use(savedLang);
    } else {
      this.translate.use('vi');
    }
    this.syncHtmlLang(this.activeLang);
  }

  switchLanguage(lang: string) {
    this.activeLang = lang;
    this.translate.use(lang);
    this.syncHtmlLang(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }

  /** Đồng bộ thuộc tính <html lang="..."> cho SEO & screen reader */
  private syncHtmlLang(lang: string) {
    this.document?.documentElement?.setAttribute('lang', lang);
  }
  
  get currentLang() { return this.activeLang; }

  getDynamicTranslation(entityType: string, entityId: string) {
    if (this.currentLang === 'vi') return null; // Không cần dịch nếu đang là tiếng Việt
    return this.api.get<any>(`/translations?entity_type=${entityType}&entity_id=${entityId}&lang_code=${this.currentLang}`);
  }
}