import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm/confirm-dialog.component';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-confirm-dialog></app-confirm-dialog>
  `
})
export class AppComponent implements OnInit {
  private settingsService = inject(SettingsService);

  ngOnInit() {
    this.settingsService.loadSettings();
  }
}
