import { Component, inject, OnInit, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import type { ColDef, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ActionCellRendererComponent } from '../../shared/components/action-cell-renderer/action-cell-renderer.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BuyStockService } from '../buy-stock/data-access/buy-stock.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { PurchaseWithDetails } from '../buy-stock/data-access/buy-stock.dto';
import { PurchaseProgressService } from '../buy-stock/data-access/purchase-progress.service';
import { TempExchangeRateComponent } from '../exchange-rate/temp-exchange-rate/temp-exchange-rate.component';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    MatButtonModule,
    HasPermissionDirective,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly buyStockService = inject(BuyStockService);
  private readonly purchaseProgressService = inject(PurchaseProgressService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // --- Signals ---
  purchaseStats = signal<
    { status: string; title: string; count: number; color: string }[]
  >([]);
  purchaseList = signal<PurchaseWithDetails[]>([]);
  selectedStatus = signal<string | null>(null);
  loading = signal<boolean>(false);

  // --- Grid ---
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'Stock No', minWidth: 100, flex: 1 },
    {
      field: 'purchaseDate',
      headerName: 'Purchase Date',
      minWidth: 130,
      flex: 1,
    },
    { field: 'truckNo', headerName: 'Truck No', minWidth: 100, flex: 1 },
    { field: 'metricTon', headerName: 'Metric Ton', minWidth: 120, flex: 1 },
    { field: 'temporaryExchangeRate', headerName: 'Temp. Exchange Rate', minWidth: 170, flex: 1 },
    { field: 'permanentRate', headerName: 'Fixed Ex. Rate', minWidth: 150, flex: 1 },
    { field: 'totalPurchaseAmount', headerName: 'Purchase Amount (AFG)', minWidth: 200, flex: 1 },
    { field: 'totalPurchaseAmountInPak', headerName: 'Purchase Amount (PKR)', minWidth: 200, flex: 1 },
    {
      field: 'freightPerTon',
      headerName: 'Freight Per Ton',
      minWidth: 140,
      flex: 1,
    },
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
            type: 'view',
            icon: 'currency_exchange',
            label: 'Add Exchange Rate',
            permission: 'purchase:read',//TODO: change permission
            callback: (row: any) => this.addTempExchangeRate(row),
          },
          {
            type: 'delete',
            icon: 'delete',
            label: 'Delete Purchase',
            permission: 'purchase:delete',
            callback: (row: any) => this.onDelete(row),
          },
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

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loadStats();
    this.loadPurchases();
  }

  // --- Load stats for all statuses ---
  loadStats() {
    this.purchaseProgressService.getAllPurchasesProgress().subscribe({
      next: (data) => {
        this.purchaseStats.set(this.mapToCardData(data));
      },
      error: () => {
        this.snackBar.open('Failed to load stats', 'Close', { duration: 3000 });
      },
    });
  }

  // --- Load purchase entries ---
  loadPurchases(status?: string) {
    this.loading.set(true);
    this.buyStockService.getPurchases(status ? { status } : {}).subscribe({
      next: (data) => {
        const purchaseData = this.mapToPurchaseData(data);
        this.purchaseList.set(purchaseData);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error fetching purchases', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // --- Card click handler ---
  filterByStatus(status: string | null) {
    this.selectedStatus.set(status);
    this.loadPurchases(status || undefined);
  }

  // --- Reset filter ---
  resetFilter() {
    this.selectedStatus.set(null);
    this.loadPurchases();
  }

  // --- Card data mapping ---
  private mapToCardData(data: Record<string, number>) {
    return [
      {
        title: 'Add Freight',
        status: 'add_freight',
        count: data['addFreight'] || 0,
        color: '#1E293B',
      },
      {
        title: 'Add Gumrak',
        status: 'add_gumrak',
        count: data['addGumrak'] || 0,
        color: '#F59E0B',
      },
      {
        title: 'Add Custom',
        status: 'add_custom',
        count: data['addCustom'] || 0,
        color: '#8B5CF6',
      },
      {
        title: 'Completed',
        status: 'complete',
        count: data['complete'] || 0,
        color: '#0B874B',
      },
    ];
  }

  mapToPurchaseData(resp: any): PurchaseWithDetails[] {
    return resp.map((data: any, index: any) => ({
      id: data.id,
      purchaseDate: data.purchaseDate,
      coalType: data.coalType,
      customerName: data.customer.name,
      placeOfPurchaseName: data.placeOfPurchase.name,
      stockDestinationName: data.stockDestination.name,
      truckNo: data.truckNo,
      driverName: data.driver.name,
      metricTon: data.metricTon,
      ratePerTon: data.ratePerTon,
      temporaryExchangeRate: data.temporaryExchangeRate,
      permanentRate: data.permanentRate,
      totalPurchaseAmount: data.totalPurchaseAmount,
      totalPurchaseAmountInPak: data.permanentRate ? (data.totalPurchaseAmount * data.permanentRate) : null,
      freightPerTon: data.purchaseFreight?.freightPerTon,
      expense: data.purchaseFreight?.expense,
      advancePayment: data.purchaseFreight?.advancePayment,
      totalFreightAmount: data.purchaseFreight?.totalFreightAmount,
      builtyImage: data.builtyImage,
      status: data.status,
    }));
  }

  onBuyStock() {
    this.router.navigateByUrl('/buy-stock-form');
  }

  onView(rowData: any) {
    this.router.navigate(['/buy-stock-form', rowData]);
  }


  addTempExchangeRate(purchaseData: any) {
    this.dialog.open(TempExchangeRateComponent, {
      width: '800px',
      data: purchaseData ,
    });
  }

  onDelete(rowData: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you wants to delete the selected Stock?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.buyStockService.deletePurchase(rowData.id).subscribe({
          next: () => {
            const updatedData = this.purchaseList().filter(
              (item) => item.id !== rowData.id
            );
            this.purchaseList.set(updatedData);
            this.snackBar.open('Stock deleted successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (err) => {
            this.snackBar.open('Error deleting stock', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }
}
