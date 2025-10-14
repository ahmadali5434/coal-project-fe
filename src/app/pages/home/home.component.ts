import { Component, inject, OnInit, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
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

  // --- Pagination ---
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRecords = signal<number>(0);
  totalPages = signal<number>(0);

  // --- Grid ---
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
    },
  ];

  gridOptions: GridOptions = {
    rowHeight: 60,
    rowStyle: { paddingTop: '10px' },
    domLayout: 'normal',
    suppressHorizontalScroll: false,
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loadStats();
    this.loadPurchases();
  }

  loadStats() {
    this.buyStockService.getPurchaseCountByStatus().subscribe({
      next: (data) => this.purchaseStats.set(this.mapToCardData(data)),
      error: () =>
        this.snackBar.open('Failed to load stats', 'Close', { duration: 3000 }),
    });
  }

  loadPurchases(status?: string) {
    this.loading.set(true);

    const params = {
      status,
      page: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.buyStockService.getPurchases(params).subscribe({
      next: (res) => {
        const purchaseData = this.mapToPurchaseData(res.data);
        this.purchaseList.set(purchaseData);
        this.totalRecords.set(res.pagination.total);
        this.totalPages.set(res.pagination.totalPages);
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

  filterByStatus(status: string | null) {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.loadPurchases(status || undefined);
  }

  resetFilter() {
    this.selectedStatus.set(null);
    this.currentPage.set(1);
    this.loadPurchases();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((v) => v + 1);
      this.loadPurchases(this.selectedStatus() ?? undefined);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((v) => v - 1);
      this.loadPurchases(this.selectedStatus() ?? undefined);
    }
  }

  mapToCardData(data: Record<string, number>) {
    return [
      {
        title: 'Initial Purchase',
        status: 'initial_purchase',
        count: data['initial_purchase'] || 0,
        color: '#216B96',
      },
      {
        title: 'Rate Added',
        status: 'rate_added',
        count: data['rate_added'] || 0,
        color: '#0B874B',
      },
      {
        title: 'Gumrak Added',
        status: 'gumrak_added',
        count: data['gumrak_added'] || 0,
        color: '#F59E0B',
      },
      {
        title: 'Custom Added',
        status: 'custom_added',
        count: data['custom_added'] || 0,
        color: '#8B5CF6',
      },
      {
        title: 'Complete',
        status: 'complete',
        count: data['complete'] || 0,
        color: '#1E293B',
      },
    ];
  }

  mapToPurchaseData(resp: any): PurchaseWithDetails[] {
    return resp.map((data: any) => ({
      id: data.id,
      purchaseDate: data.purchaseDate,
      customerName: data.customer?.name,
      placeOfPurchaseName: data.placeOfPurchase?.name,
      stockDestinationName: data.stockDestination?.name,
      truckNo: data.truckNo,
      driverName: data.driver?.name,
      metricTon: data.metricTon,
      freightPerTon: data.purchaseRate?.freightPerTon,
      expense: data.purchaseRate?.expense,
      advancePayment: data.purchaseRate?.advancePayment,
      amountAFN: data.purchaseRate?.amountAFN,
      exchangeRate: data.purchaseRate?.exchangeRate,
      amountPKR: data.purchaseRate?.amountPKR,
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
      data: { message: 'Are you sure you want to delete this Stock?' },
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
          error: () =>
            this.snackBar.open('Error deleting stock', 'Close', {
              duration: 3000,
            }),
        });
      }
    });
  }
}
