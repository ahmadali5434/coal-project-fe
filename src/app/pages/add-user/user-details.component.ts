import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridOptions,
  ModuleRegistry,
} from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ActionCellRendererComponent } from '../../shared/components/action-cell-renderer/action-cell-renderer.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

import { AddUserComponent } from '../add-user/add-user.component';

import { UserService } from './user.service';
import { User } from '../buy-stock/data-access/buy-stock.dto';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    MatButtonModule,
    MatIconModule,
    HasPermissionDirective,
  ],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  Users: User[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.fetchAllUsers().subscribe({
      next: (users) => {
        this.Users = users;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      },
    });
  }
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'username', headerName: 'Username', sortable: true, filter: true, width: 200 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 180 },
    {
      headerName: 'Actions',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: {
        actions: [
          {
            type: 'delete',
            icon: 'delete',
            label: 'Delete User',
            permission: 'users:delete',
            callback: (row: User) => this.onDelete(row),
          },
        ],
      },
      pinned: 'right',
      width: 120,
    },
  ];

  gridOptions: GridOptions = { rowHeight: 55 };


  openNewUserDialog() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '800px',
      height: '600px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadUsers();
    });
  }
  onEdit(user: User) {
    const dialogRef = this.dialog.open(AddUserComponent, {
      panelClass: 'dialog-container-lg',
      data: { ...user, isEdit: true },
    });
  }
  onDelete(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        },
      });
    });
  }
}
