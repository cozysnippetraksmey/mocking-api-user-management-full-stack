import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 1;

  show(type: Toast['type'], title: string, message: string, duration: number = 4000): void {
    const toast: Toast = {
      id: this.idCounter++,
      type,
      title,
      message,
      duration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message, 6000); // Error messages stay longer
  }

  info(title: string, message: string): void {
    this.show('info', title, message);
  }

  warning(title: string, message: string): void {
    this.show('warning', title, message, 5000);
  }

  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
