import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LogoComponent } from '../logo/logo.component';
import { SettingsService } from '../../../core/services/settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-guest-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LogoComponent],
  template: `
    <footer style="background:#0D0D0D; color:#666; margin-top:auto;">
      <div style="max-width:1152px; margin:0 auto; padding:56px 24px 40px;">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8" style="margin-bottom:40px;">

          <!-- Brand -->
          <div class="col-span-2 md:col-span-1">
            <div class="logo-light" style="margin-bottom:10px;">
              <app-logo variant="compact" compactWidth="170px" compactHeight="41" [light]="true"></app-logo>
            </div>
            <p style="font-size:0.875rem; line-height:1.7; color:#555;">{{ 'FOOTER.TAGLINE' | translate }}</p>
          </div>

          <!-- Links -->
          <div>
            <h4 class="text-white text-sm font-semibold mb-4 uppercase tracking-wider">{{ 'FOOTER.EXPLORE' | translate }}</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/"       class="hover:text-white transition-colors">{{ 'NAVBAR.HOME' | translate }}</a></li>
              <li><a routerLink="/about"  class="hover:text-white transition-colors">{{ 'NAVBAR.ABOUT' | translate }}</a></li>
              <li><a routerLink="/blogs"  class="hover:text-white transition-colors">{{ 'NAVBAR.NEWS' | translate }}</a></li>
              <li><a routerLink="/contact" class="hover:text-white transition-colors">{{ 'NAVBAR.CONTACT' | translate }}</a></li>
              <li *ngIf="forumEnabled$ | async"><a routerLink="/forum" class="hover:text-white transition-colors">{{ 'NAVBAR.COMMUNITY' | translate }}</a></li>
            </ul>
          </div>

          <!-- Account -->
          <div>
            <h4 class="text-white text-sm font-semibold mb-4 uppercase tracking-wider">{{ 'FOOTER.ACCOUNT' | translate }}</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/auth/login"    class="hover:text-white transition-colors">{{ 'NAVBAR.LOGIN' | translate }}</a></li>
              <li><a routerLink="/auth/register" class="hover:text-white transition-colors">{{ 'NAVBAR.REGISTER' | translate }}</a></li>
              <li><a routerLink="/profile"       class="hover:text-white transition-colors">{{ 'NAVBAR.PROFILE' | translate }}</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-white text-sm font-semibold mb-4 uppercase tracking-wider">{{ 'NAVBAR.CONTACT' | translate }}</h4>
            <ul class="space-y-2 text-sm">
              <li style="white-space:nowrap;">📞 0975 982 592</li>
              <li style="white-space:nowrap; padding-left:1.4rem;">0983 123 306</li>
              <li>✉️ bdsdiemtam&#64;gmail.com</li>
              <li>📍 TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 pt-6 flex flex-wrap justify-between items-center gap-3 text-xs">
          <span>{{ 'FOOTER.COPYRIGHT' | translate }}</span>
          <span>{{ 'FOOTER.DESIGNED_BY' | translate }}</span>
        </div>
      </div>
    </footer>
  `
})
export class GuestFooterComponent {
  private settings = inject(SettingsService);
  forumEnabled$: Observable<boolean> = this.settings.getSetting('forum_enabled');
}
