import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RbacService } from '../../../core/rbac.service';

export interface ActionConfig {
  type: 'view' | 'edit' | 'delete' | string; // can extend
  icon: string;
  label?: string;
  permission?: string;
  callback?: (data: any) => void;
}

@Component({
  selector: 'app-action-cell-renderer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './action-cell-renderer.component.html',
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {
  private readonly rbacService = inject(RbacService);
  params: any;
  actions: ActionConfig[] = [];

  agInit(params: any): void {
    this.params = params;
    // Expecting `actions` array from columnDef.cellRendererParams
    this.actions = (params.actions || []).map((action: ActionConfig) => ({
      ...action,
      permission: this.rbacService.has(action.permission || ''), // default to true
    }));
    
  }

  refresh(): boolean {
    return false;
  }

  onAction(action: ActionConfig): void {
    if (action.callback) {
      action.callback(this.params.data);
    }
  }
}
