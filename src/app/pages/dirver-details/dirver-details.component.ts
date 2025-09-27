import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DriverService } from '../buy-stock/data-access/driver.service';
import { AddNewDriverDialogComponent } from '../buy-stock/add-new-driver-dialog/add-new-driver-dialog.component';
import { ActionCellRendererComponent } from '../../shared/components/action-cell-renderer/action-cell-renderer.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Driver } from '../buy-stock/data-access/buy-stock.dto';
import { ActionForDeleteEdit } from '../../shared/components/action-for-delte-edt/action-for-delte-edt';
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-dirver-details',
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
  templateUrl: './dirver-details.component.html',
})
export class DirverDetailsComponent implements OnInit {
  private dirverService = inject(DriverService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly _snackBar = inject(MatSnackBar);

  drivers: Driver[] = [];

  ngOnInit(): void {
    this.dirverService.fetchAllDrivers().subscribe((list) => {
      this.drivers = list;
    });
  }
private wrapCell(params: any): string {
    const value = params.value ?? '';
    return `<div style="white-space: normal; word-break: break-word; line-height: 1.4;">
              ${value}
            </div>`;
  }
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 ,cellRenderer: this.wrapCell},
    {
      field: 'idCardNo',
      headerName: 'Id Card No',
      sortable: true,
      filter: true,
      width: 160,
      cellRenderer: this.wrapCell
    },
    { field: 'name', headerName: 'Driver Name', filter: true, width: 170 , cellRenderer: this.wrapCell},
    {
      field: 'driverFatherName',
      headerName: 'Dirver Father Name',
      filter: true,
      width: 180,
      cellRenderer: this.wrapCell
    },
    { field: 'country.name', headerName: 'Country', filter: true, width: 110 ,cellRenderer: this.wrapCell},
    { field: 'province', headerName: 'Province', filter: true, width: 160 , cellRenderer: this.wrapCell},
    { field: 'city.name', headerName: 'City', filter: true, width: 130 , cellRenderer: this.wrapCell},
    {
      field: 'areaAddress',
      headerName: 'Area Address',
      filter: true,
      width: 170,
      cellRenderer: this.wrapCell
    },
    {
      field: 'afghanContactNo',
      headerName: 'Afghan Contact No',
      filter: true,
      width: 180,
      cellRenderer: this.wrapCell
    },
    {
      field: 'pakistanContactNo',
      headerName: 'Pakistan Contact No',
      filter: true,
      width: 180,
      cellRenderer: this.wrapCell
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionForDeleteEdit,
      cellRendererParams: {
        onEdit: this.openEditDriverDialog.bind(this),
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
    rowHeight: 66,
    rowStyle: { paddingTop: '10px' },
  };

  frameworkComponents = {
    actionCellRenderer: ActionCellRendererComponent,
  };

  onEdit(rowData: any) {
    this.router.navigateByUrl('/buy-', {
      state: { stockData: rowData },
    });
  }

  onDelete(rowData: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you wants to delete the selected Dirver?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dirverService.deleteDriver(rowData.id).subscribe({
          next: () => {
            this._snackBar.open('Driver deleted successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.dirverService.fetchAllDrivers().subscribe((list) => {
              this.drivers = list;
            });
          },
          error: () =>
            this._snackBar.open('Failed to delete driver', 'Close', {
              duration: 3000,
            }),
        });
      }
    });
  }

  openNewDriverDialog() {
    const dialogRef = this.dialog.open(AddNewDriverDialogComponent, {
      panelClass: 'dialog-container-lg',
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
         this.dirverService.fetchAllDrivers().subscribe(list => {
        this.drivers = list;
        });
      }
    });
  }

  openEditDriverDialog(data: Driver) {
    const dialogRef = this.dialog.open(AddNewDriverDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: { ...data, isEdit: true },
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
       this.dirverService.fetchAllDrivers().subscribe(list => {
        this.drivers = list;
        });
      }
    });
  }
}
