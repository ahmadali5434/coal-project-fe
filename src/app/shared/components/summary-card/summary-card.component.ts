import { CommonModule, } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-summary-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatIcon, 
  ],
  templateUrl: './summary-card.component.html',
})
export class SummaryCardComponent {
  @Input() title: string = '';
  @Input() data: Record<string, any> = {};
  @Input() imageKey: string | null = null;

  @Output() edit = new EventEmitter<void>();

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  prettifyKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  prettifyValue(value: any): string {
    // If value is a Date object
    if (value instanceof Date) {
      return value.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    }
  
    // If value is a string and looks like a date
    if (typeof value === 'string') {
      const maybeDate = new Date(value);
      if (!isNaN(maybeDate.getTime()) && value.includes('GMT')) {
        return maybeDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
      }
    }
    return value;
  }

  onEdit() {
    this.edit.emit();
  }
  
}
