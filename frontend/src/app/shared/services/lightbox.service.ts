import { Injectable, signal } from '@angular/core';

export interface LightboxState {
  open: boolean;
  images: string[];
  index: number;
}

@Injectable({ providedIn: 'root' })
export class LightboxService {
  readonly state = signal<LightboxState>({ open: false, images: [], index: 0 });

  open(images: string[], index = 0) {
    this.state.set({ open: true, images, index });
  }

  close() {
    this.state.update(s => ({ ...s, open: false }));
  }

  next() {
    this.state.update(s => ({ ...s, index: (s.index + 1) % s.images.length }));
  }

  prev() {
    this.state.update(s => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }));
  }
}
