import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-action-for-delete-edit',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './action-for-delte-edt.html',
})
export class ActionForDeleteEdit implements ICellRendererAngularComp {
  params: any;
  label = '';

  agInit(params: any): void {
    this.params = params;
    this.label = params.label || '';
  }

  refresh(): boolean {
    return false;
  }

  edit(): void {
    if (this.params?.onEdit) {
      this.params.onEdit(this.params.data);
    }
  }

  delete(): void {
    if (this.params?.onDelete) {
      this.params.onDelete(this.params.data);
    }
  }
}
