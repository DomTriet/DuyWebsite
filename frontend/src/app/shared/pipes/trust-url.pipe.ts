import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'trustUrl', standalone: true })
export class TrustUrlPipe implements PipeTransform {
  private san = inject(DomSanitizer);
  transform(url: string): SafeResourceUrl {
    return this.san.bypassSecurityTrustResourceUrl(url);
  }
}
