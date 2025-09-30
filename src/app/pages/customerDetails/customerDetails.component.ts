import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
} from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AddNewCustomerDialogComponent } from '../buy-stock/add-new-customer-dialog/add-new-customer-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CustomerService } from '../buy-stock/data-access/customer.service';
import { Customer } from '../buy-stock/data-access/buy-stock.dto';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { RbacService } from '../../core/rbac.service';
import { ActionCellRendererComponent } from '../../shared/components/action-cell-renderer/action-cell-renderer.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-CustomerDetails',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    MatButtonModule,
    MatInputModule,
    MatDividerModule,
    MatSelectModule,
    MatIconModule,
    HasPermissionDirective,
  ],
  templateUrl: './customerDetails.component.html',
})
export class CdetailsComponent implements OnInit {
  [x: string]: any;
  private customerService = inject(CustomerService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly rbacService = inject(RbacService);

  private readonly hasEditPermission = this.rbacService.has('customer:update');
  private readonly hasDeletePermission =
    this.rbacService.has('customer:delete');

  customerDetails: Customer[] = [];

  gridApi: any;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.fetchAllCustomers().subscribe({
      next: (customers: Customer[]) => {
        this.customerDetails = customers;
        if (this.gridApi) {
          this.gridApi.setRowData(this.customerDetails);
        }
      },
      error: (err) => console.error('Error fetching customers', err),
    });
  }

  CustomerCol: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'fullName',
      headerName: 'Customer Name',
      sortable: true,
      filter: true,
      width: 180,
    },
    {
      field: 'country.name',
      headerName: 'County ',
      filter: true,
      width: 180,
    },
    { field: 'city.name', headerName: 'City', filter: true, width: 160 },
    {
      field: 'address',
      headerName: 'Area Address',
      filter: true,
      width: 190,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone No',
      filter: true,
      width: 180,
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: {
        actions: [
          {
            type: 'edit',
            icon: 'edit',
            label: 'Edit Customer',
            permission: 'customer:update',
            callback: (row: any) => this.onEdit(row),
          },
          {
            type: 'delete',
            icon: 'delete',
            label: 'Delete Customer',
            permission: 'customer:delete',
            callback: (row: any) => this.onDelete(row),
          },
        ],
      },
      pinned: 'right',
      maxWidth: 100,
      sortable: false,
      filter: false,
      resizable: false,
    },
  ];

  gridOptions: GridOptions = {
    rowHeight: 60,
    rowStyle: {
      paddingTop: '10px',
    },
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.customerDetails);
  }

  onEdit(rowData: any) {
    const dialogRef = this.dialog.open(AddNewCustomerDialogComponent, {
      panelClass: 'dialog-container-lg',
      width: '800px',
      data: { ...rowData, isEdit: true },
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadCustomers();
        this._snackBar.open('Customer updated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onDelete(rowData: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this customer?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.customerService
          .deleteCustomer(String(rowData.id))
          .subscribe(() => {
            this._snackBar.open('Customer deleted successfully!', 'Close', {
              duration: 3000,
            });
            this.loadCustomers();
          });
      }
    });
  }

  openNewCustomerDialog() {
    const dialogRef = this.dialog.open(AddNewCustomerDialogComponent, {
      panelClass: 'dialog-container-lg',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this._snackBar.open('Customer added successfully!', 'Close', {
          duration: 3000,
        });
        this.loadCustomers();
      }
    });
  }
}
