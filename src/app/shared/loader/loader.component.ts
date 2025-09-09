import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="app-loader-overlay" *ngIf="loader.isLoading()">
      <mat-progress-spinner
        mode="indeterminate"
        diameter="64"
        strokeWidth="6"
        aria-label="Loading">
      </mat-progress-spinner>
    </div>
  `,
  styles: [`
    .app-loader-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
      z-index: 9999;
    }
  `],
})
export class LoaderComponent {
  loader = inject(LoaderService);
}
