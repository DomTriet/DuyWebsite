import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm/confirm-dialog.component';
import { LightboxComponent } from './shared/components/lightbox/lightbox.component';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastContainerComponent, ConfirmDialogComponent, LightboxComponent],
  template: `
    <div id="route-progress" [style.width]="progressWidth" [style.opacity]="progressVisible ? '1' : '0'"></div>
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-confirm-dialog></app-confirm-dialog>
    <app-lightbox></app-lightbox>
  `
})
export class AppComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  progressWidth = '0%';
  progressVisible = false;
  private progressTimer: any;

  ngOnInit() {
    this.settingsService.loadSettings();

    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        clearTimeout(this.progressTimer);
        this.progressVisible = true;
        this.progressWidth = '0%';
        this.progressTimer = setTimeout(() => { this.progressWidth = '70%'; }, 10);
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.progressWidth = '100%';
        this.progressTimer = setTimeout(() => { this.progressVisible = false; this.progressWidth = '0%'; }, 320);
      }
    });
  }
}
