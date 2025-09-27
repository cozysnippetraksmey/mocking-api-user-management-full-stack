import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class]="'toast-' + toast.type">
          <div class="toast-content">
            <div class="toast-icon">
              @if (toast.type === 'success') {
                <span>✓</span>
              } @else if (toast.type === 'error') {
                <span>✗</span>
              } @else if (toast.type === 'info') {
                <span>ℹ</span>
              } @else if (toast.type === 'warning') {
                <span>⚠</span>
              }
            </div>
            <div class="toast-text">
              <div class="toast-title">{{ toast.title }}</div>
              <div class="toast-message">{{ toast.message }}</div>
            </div>
            <button class="toast-close" (click)="toastService.remove(toast.id)">×</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      min-width: 300px;
      max-width: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      gap: 12px;
    }

    .toast-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      flex-shrink: 0;
    }

    .toast-text {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .toast-message {
      font-size: 13px;
      opacity: 0.9;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .toast-close:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .toast-success {
      background-color: #d4edda;
      border-left: 4px solid #28a745;
    }

    .toast-success .toast-icon {
      background-color: #28a745;
      color: white;
    }

    .toast-success .toast-title,
    .toast-success .toast-message {
      color: #155724;
    }

    .toast-error {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
    }

    .toast-error .toast-icon {
      background-color: #dc3545;
      color: white;
    }

    .toast-error .toast-title,
    .toast-error .toast-message {
      color: #721c24;
    }

    .toast-info {
      background-color: #d1ecf1;
      border-left: 4px solid #17a2b8;
    }

    .toast-info .toast-icon {
      background-color: #17a2b8;
      color: white;
    }

    .toast-info .toast-title,
    .toast-info .toast-message {
      color: #0c5460;
    }

    .toast-warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .toast-warning .toast-icon {
      background-color: #ffc107;
      color: #212529;
    }

    .toast-warning .toast-title,
    .toast-warning .toast-message {
      color: #856404;
    }

    @media (max-width: 768px) {
      .toast-container {
        right: 10px;
        left: 10px;
      }

      .toast {
        min-width: unset;
      }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
