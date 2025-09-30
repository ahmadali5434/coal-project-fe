import { Component, inject, OnInit, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import type { ColDef, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ActionCellRendererComponent } from '../../shared/components/action-cell-renderer/action-cell-renderer.component';
import { CommonModule } from '@angular/common';
import {
  PurchaseDetail,
} from '../../shared/services/stock.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BuyStockService } from '../buy-stock/data-access/buy-stock.service';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatButtonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly buyStockService = inject(BuyStockService);
  private readonly router = inject(Router);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  purchaseStockData = signal<PurchaseDetail[]>([]);

  ngOnInit(): void {
    this.buyStockService.getPurchases().subscribe({
      next: (data) => {
        const purchaseData = this.mapToPurchaseData(data);
        this.purchaseStockData.set(purchaseData);
      },
      error: (err) => {
        this._snackBar.open('Error fetching purchase data', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  mapToPurchaseData(resp: any): PurchaseDetail[] {
    return resp.map((data: any, index: any) => ({
      id: data.id,
      purchaseDate: data.purchaseDate,
      customerName: data.customer.name,
      placeOfPurchaseName: data.placeOfPurchase.name,
      stockDestinationName: data.stockDestination.name,
      truckNo: data.truckNo,
      driverName: data.driver.name,
      metricTon: data.metricTon,
      freightPerTon: data.purchaseRate?.freightPerTon,
      expense: data.purchaseRate?.expense,
      advancePayment: data.purchaseRate?.advancePayment,
      amountAFN: data.purchaseRate?.amountAFN,
      exchangeRate: data.purchaseRate?.exchangeRate,
      amountPKR: data.purchaseRate?.amountPKR,
      builtyImage: data.builtyImage,
      status: data.status,
    }));
  }

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'Stock No', minWidth: 100, flex: 1 },
    {
      field: 'customerName',
      headerName: 'Customer Name',
      minWidth: 180,
      flex: 2,
    },
    {
      field: 'placeOfPurchaseName',
      headerName: 'Place of Buying',
      minWidth: 180,
      flex: 2,
    },
    {
      field: 'stockDestinationName',
      headerName: 'Destination',
      minWidth: 180,
      flex: 2,
    },
    {
      field: 'purchaseDate',
      headerName: 'Purchase Date',
      minWidth: 130,
      flex: 1,
    },
    { field: 'driverName', headerName: 'Driver', minWidth: 180, flex: 1 },
    { field: 'truckNo', headerName: 'Truck No', minWidth: 100, flex: 1 },
    { field: 'metricTon', headerName: 'Metric Ton', minWidth: 120, flex: 1 },
    {
      field: 'freightPerTon',
      headerName: 'Freight Per Ton',
      minWidth: 140,
      flex: 1,
    },
    { field: 'expense', headerName: 'Expenses', minWidth: 120, flex: 1 },
    {
      field: 'advancePayment',
      headerName: 'Advance Payment',
      minWidth: 150,
      flex: 1,
    },
    { field: 'amountAFN', headerName: 'Amount (AFN)', minWidth: 140, flex: 1 },
    { field: 'exchangeRate', headerName: 'Ex. Rate', minWidth: 120, flex: 1 },
    { field: 'amountPKR', headerName: 'Amount (PKR)', minWidth: 140, flex: 1 },
    //TODO: The following field with be included later when status feature is implemented
    // {
    //   field: 'status',
    //   headerName: 'Status',
    //   filter: true,
    //   minWidth: 130,
    //   flex: 1,
    //   cellRenderer: (params: any) => {
    //     const status = params.value;
    //     const color =
    //       status === 'Delivered'
    //         ? '#90ee90'
    //         : status === 'Loading'
    //         ? '#ffcc99'
    //         : '#e0e0e0';
    //     return `<span style="background:${color}; margin-top:4px; padding:2px; border-radius:8px; display:flex; width:80px; max-height:25px; justify-content:center; align-items:center;">${status}</span>`;
    //   },
    // },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: {
        actions: [
          {
            type: 'view',
            icon: 'visibility',
            label: 'View Purchase',
            permission: 'purchase:read',
            callback: (row: any) => this.onView(row),
          },
          {
            type: 'delete',
            icon: 'delete',
            label: 'Delete Purchase',
            permission: 'purchase:delete',
            callback: (row: any) => this.onDelete(row),
          }
        ],
      },
      pinned: 'right',
      minWidth: 120,
      maxWidth: 140,
      sortable: false,
      filter: false,
      resizable: false,
    },
  ];

  gridOptions: GridOptions = {
    rowHeight: 60,
    rowStyle: { paddingTop: '10px' },
    domLayout: 'normal',
    suppressHorizontalScroll: false,
  };

  frameworkComponents = {
    actionCellRenderer: ActionCellRendererComponent,
  };

  onBuyStock() {
    this.router.navigateByUrl('/buy-stock-form');
  }

  onView(rowData: any) {
    this.router.navigate(['/buy-stock-form', rowData]);
  }

  onDelete(rowData: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you wants to delete the selected Stock?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.buyStockService.deletePurchase(rowData.id).subscribe({
          next: () => {
            const updatedData = this.purchaseStockData().filter(
              (item) => item.id !== rowData.id
            );
            this.purchaseStockData.set(updatedData);
            this._snackBar.open('Stock deleted successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (err) => {
            this._snackBar.open('Error deleting stock', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }
}
