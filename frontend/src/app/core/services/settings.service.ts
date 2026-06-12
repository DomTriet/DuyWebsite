import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = inject(ApiService);
  private settings$ = new BehaviorSubject<Record<string, any>>({});

  loadSettings(): void {
    this.api.get<any>('/settings').subscribe({
      next: res => this.settings$.next(res.data || {}),
      error: () => {}
    });
  }

  getSetting(key: string): Observable<any> {
    return this.settings$.pipe(map(s => s[key]));
  }

  updateSetting(key: string, value: any): Observable<any> {
    return new Observable(observer => {
      this.api.put<any>(`/settings/${key}`, { value }).subscribe({
        next: res => {
          const current = this.settings$.value;
          this.settings$.next({ ...current, [key]: value });
          observer.next(res);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }
}
