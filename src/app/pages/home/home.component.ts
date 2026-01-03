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
  private readonly purhcaseProgressService = inject(PurchaseProgressService);
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
    {
      field: 'freightPerTon',
      headerName: 'Freight Per Ton',
      minWidth: 140,
      flex: 1,
    },
    { field: 'exchangeRate', headerName: 'Ex. Rate', minWidth: 120, flex: 1 },

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
    this.purhcaseProgressService.getAllPurchasesProgress().subscribe({
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
      // {
      //   title: 'Initial Purchase',
      //   status: 'initial_purchase',
      //   count: data['initialPurchase'] || 0,
      //   color: '#216B96',
      // },
      {
        title: 'Add Freight',
        status: 'add_freight',
        count: data['addFreight'] || 0,
        color: '#0B1F33',
      },
      {
        title: 'Add Gumrak',
        status: 'add_gumrak',
        count: data['addGumrak'] || 0,
        color: '#1F3A5F',
      },
      {
        title: 'Add Custom',
        status: 'add_custom',
        count: data['addCustom'] || 0,
        color: '#0E5A5A',
      },
      {
        title: 'Completed',
        status: 'complete',
        count: data['complete'] || 0,
        color: '#3A3F45',
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
      totalPurchaseAmount: data.totalPurchaseAmount,
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
