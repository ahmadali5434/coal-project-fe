import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GridOptions, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from "@angular/material/input";
import { MatDividerModule } from "@angular/material/divider";
import { MatSelectModule } from "@angular/material/select";
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AddNewCustomerDialogComponent } from '../buy-stock/add-new-customer-dialog/add-new-customer-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CustomerService } from '../buy-stock/data-access/customer.service';
import { Customer } from '../buy-stock/data-access/buy-stock.dto';
import { ActionForDeleteEdit } from '../../shared/components/action-for-delte-edt/action-for-delte-edt';

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
],
  templateUrl: './customerDetails.component.html'
})
export class CdetailsComponent implements OnInit {
  [x: string]: any;
  private customerService = inject(CustomerService)
  private readonly router = inject(Router);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

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
 private wrapCell(params: any): string {
    const value = params.value ?? '';
    return `<div style="white-space: normal; word-break: break-word; line-height: 1.4;">
              ${value}
            </div>`;
  }
  CustomerCol: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 ,cellRenderer: this.wrapCell},
    {
      field: 'fullName',
      headerName: 'Customer Name',
      sortable: true,
      filter: true,
      width: 170,
      cellRenderer: this.wrapCell
    },
    {
      field: 'country.name',
      headerName: 'County ',
      filter: true,
      width: 150
      ,cellRenderer: this.wrapCell
    },
    { field: 'city.name', headerName: 'City', filter: true, width: 160 ,cellRenderer: this.wrapCell },
    {
      field: 'address',
      headerName: 'Area Address',
      filter: true,
      width: 150
      ,cellRenderer: this.wrapCell
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone No',
      filter: true,
      width: 180
      ,cellRenderer: this.wrapCell
    },
    
    {
      headerName: 'Actions',
      cellRenderer: ActionForDeleteEdit,
      cellRendererParams: {
        onEdit: this.onEdit.bind(this),
        onDelete: this.onDelete.bind(this),
      },
      pinned: 'right',
      maxWidth: 100,
      sortable: false,
      filter: false,
      resizable: false,
    },
  ];

  gridOptions: GridOptions = {
    rowHeight: 65,
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
          this._snackBar.open('Customer updated successfully!', 'Close', { duration: 3000 });

      }
    });
  }

  onDelete(rowData: any) {
     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this customer?' },
    });
      
     dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.customerService.deleteCustomer(String(rowData.id)).subscribe(() => {
          this._snackBar.open('Customer deleted successfully!', 'Close', { duration: 3000 });
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
        this._snackBar.open('Customer added successfully!', 'Close', { duration: 3000 });
        this.loadCustomers();
      }
    });
  }
}
