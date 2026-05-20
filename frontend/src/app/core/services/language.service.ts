import { Injectable, inject, PLATFORM_ID } from '@angular/core';
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
  }

  switchLanguage(lang: string) {
    this.activeLang = lang;
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }
  
  get currentLang() { return this.activeLang; }

  getDynamicTranslation(entityType: string, entityId: string) {
    if (this.currentLang === 'vi') return null; // Không cần dịch nếu đang là tiếng Việt
    return this.api.get<any>(`/translations?entity_type=${entityType}&entity_id=${entityId}&lang_code=${this.currentLang}`);
  }
}