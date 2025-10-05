import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { RoleService } from './role.servicet';
import { ActionKey, ResourcePermission, Role } from './role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resources = [
    { key: 'user', label: 'User' },
    { key: 'customer', label: 'Customer' },
    { key: 'driver', label: 'Driver' },
    { key: 'warehouse', label: 'Warehouse' },
    { key: 'purchase', label: 'Purchase' },
    { key: 'purchaseRate', label: 'Purchase Rate' },
    { key: 'custom', label: 'Custom' },
    { key: 'expense', label: 'Expense' },
    { key: 'stock', label: 'Stock' },
  ];

  actions: { key: ActionKey; icon: string; title: string }[] = [
    { key: 'create', icon: 'add_circle', title: 'Create' },
    { key: 'read', icon: 'visibility', title: 'Read' },
    { key: 'update', icon: 'edit', title: 'Update' },
    { key: 'delete', icon: 'delete', title: 'Delete' },
    // { key: 'export', icon: 'file_download', title: 'Export' },
    // { key: 'uploadPicture', icon: 'image', title: 'Upload picture' },
  ];

  displayedColumns: string[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    resources: this.fb.array([]),
  });

  isEdit = false;
  private editingId?: string;

  ngOnInit(): void {
    const arr = this.form.controls['resources'] as FormArray;
    this.resources.forEach(() => {
      const group: any = {};
      this.actions.forEach((a) => (group[a.key] = new FormControl(false)));
      arr.push(this.fb.group(group));
    });
    this.displayedColumns = ['resource', ...this.actions.map(a => a.key)];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editingId = id;
      this.roleService.getRole(id).subscribe((role) => this.patchForm(role));
    }
  }

  patchForm(role: Role) {
    this.form.controls['name'].setValue(role.name);
    const arr = this.form.controls['resources'] as FormArray;
    this.resources.forEach((r, idx) => {
      const permission = role.permissions.find((p) => p.resource === r.key);
      if (permission) {
        this.actions.forEach((a) => {
          arr.at(idx).get(a.key)?.setValue(permission.actions[a.key] ?? false);
        });
      }
    });
  }

  controlAt(rowIndex: number, actionKey: ActionKey) {
    const arr = this.form.controls['resources'] as FormArray;
    return arr.at(rowIndex).get(actionKey) as FormControl;
  }

onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const payload: Role = {
    name: this.form.get('name')?.value ?? '',
    permissions: this.resources.map((r, idx) => {
      const row = (this.form.controls['resources'] as FormArray).at(idx).value;
      return { resource: r.key, actions: row } as ResourcePermission;
    }),
  };

  const op =
    this.isEdit && this.editingId
      ? this.roleService.updateRole(this.editingId, payload)
      : this.roleService.createRole(payload);

  op.subscribe({
    next: () => this.router.navigateByUrl('/user-mang/roles'),
    error: (err) => console.error('Failed to save role', err), 
  });
}


  onCancel() {
    this.router.navigateByUrl('/user-mang/roles');
  }
}
