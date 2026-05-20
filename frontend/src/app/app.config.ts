import { ApplicationConfig, importProvidersFrom, PLATFORM_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, HttpClient, withFetch } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import viTrans from '../assets/i18n/vi.json';
import enTrans from '../assets/i18n/en.json';
import koTrans from '../assets/i18n/ko.json';
import zhTrans from '../assets/i18n/zh.json';

export class CustomTranslateLoader implements TranslateLoader {
  constructor() {}
  getTranslation(lang: string): Observable<any> {
    switch(lang) {
      case 'en': return of(enTrans);
      case 'ko': return of(koTrans);
      case 'zh': return of(zhTrans);
      default: return of(viTrans);
    }
  }
}

// Cấu hình bộ nạp file ngôn ngữ tĩnh từ thư mục assets/i18n/
export function HttpLoaderFactory() {
  return new CustomTranslateLoader();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Kích hoạt hệ thống Routing
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // Kích hoạt tính năng Hydration SSR
    provideClientHydration(withEventReplay()),
    // Kích hoạt HttpClient kèm theo Auth Interceptor
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    // Đăng ký Module Đa ngôn ngữ
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
        }
      })
    )
  ]
};