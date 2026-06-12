import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-block z-50">
      <!-- Nút Trigger -->
      <button class="flex items-center gap-2 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-colors backdrop-blur-md border border-gray-400/20 text-sm font-medium">
        <img [src]="getFlagUrl(currentLang)" alt="flag" class="w-5 h-auto rounded-sm shadow-sm">
        <span class="uppercase tracking-wider text-current">{{ currentLang }}</span>
        <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      <!-- Dropdown Content (Hiện khi Hover) -->
      <div class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
        <div class="p-2 space-y-1 text-left">
          <button (click)="switchLang('vi')" [ngClass]="{'bg-gray-100 text-gray-900 font-semibold': currentLang === 'vi', 'text-gray-700 hover:bg-gray-50': currentLang !== 'vi'}" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <img src="https://flagcdn.com/w20/vn.png" alt="VN" class="w-5 h-auto rounded-sm shadow-sm"> Tiếng Việt
          </button>
          <button (click)="switchLang('en')" [ngClass]="{'bg-gray-100 text-gray-900 font-semibold': currentLang === 'en', 'text-gray-700 hover:bg-gray-50': currentLang !== 'en'}" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <img src="https://flagcdn.com/w20/us.png" alt="EN" class="w-5 h-auto rounded-sm shadow-sm"> English
          </button>
          <button (click)="switchLang('ko')" [ngClass]="{'bg-gray-100 text-gray-900 font-semibold': currentLang === 'ko', 'text-gray-700 hover:bg-gray-50': currentLang !== 'ko'}" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <img src="https://flagcdn.com/w20/kr.png" alt="KR" class="w-5 h-auto rounded-sm shadow-sm"> 한국어
          </button>
          <button (click)="switchLang('zh')" [ngClass]="{'bg-gray-100 text-gray-900 font-semibold': currentLang === 'zh', 'text-gray-700 hover:bg-gray-50': currentLang !== 'zh'}" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <img src="https://flagcdn.com/w20/cn.png" alt="CN" class="w-5 h-auto rounded-sm shadow-sm"> 中文
          </button>
        </div>
      </div>
    </div>
  `
})
export class LanguageSelectorComponent {
  private languageService = inject(LanguageService);

  get currentLang() { return this.languageService.currentLang; }
  switchLang(lang: string) { this.languageService.switchLanguage(lang); }
  
  getFlagUrl(lang: string): string {
    const flags: any = { 'vi': 'vn', 'en': 'us', 'ko': 'kr', 'zh': 'cn' };
    return `https://flagcdn.com/w20/${flags[lang] || 'vn'}.png`;
  }
}