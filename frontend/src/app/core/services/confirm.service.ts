import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (v: boolean) => void;
}

/**
 * Hộp thoại xác nhận trong app — thay thế confirm() của trình duyệt.
 * Dùng: `if (await this.confirm.ask({ message: '...' })) { ... }`
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private stateSubject = new BehaviorSubject<ConfirmState>({ open: false, message: '' });
  public readonly state$ = this.stateSubject.asObservable();

  ask(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.stateSubject.next({ ...options, open: true, resolve });
    });
  }

  /** Được gọi bởi dialog component khi người dùng chọn */
  respond(value: boolean) {
    const cur = this.stateSubject.getValue();
    cur.resolve?.(value);
    this.stateSubject.next({ open: false, message: '' });
  }
}
