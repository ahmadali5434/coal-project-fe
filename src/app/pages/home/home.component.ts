import { Component, inject, OnInit, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import type { ColDef, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ActionCellRendererComponent, ActionConfig } from '../../shared/components/action-cell-renderer/action-cell-renderer.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BuyStockService } from '../buy-stock/data-access/buy-stock.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import {
  Purchase,
  PurchaseWithDetails,
} from '../buy-stock/data-access/buy-stock.dto';
import { PurchaseProgressService } from '../buy-stock/data-access/purchase-progress.service';
import { TempExchangeRateComponent } from '../exchange-rate/temp-exchange-rate/temp-exchange-rate.component';
import { FreightDialogComponent } from '../buy-stock/freight-dialog/freight-dialog.component';
import { GumrakFormComponent } from '../buy-stock/gumrak-form/gumrak-form.component';

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
    {
      field: 'purchase.purchaseDate',
      headerName: 'Purchase Date',
      minWidth: 130,
      flex: 1,
    },
    {
      field: 'purchase.truckNo',
      headerName: 'Truck No',
      minWidth: 100,
      flex: 1,
    },
    {
      field: 'purchase.metricTon',
      headerName: 'Metric Ton',
      minWidth: 120,
      flex: 1,
    },
    {
      field: 'purchase.temporaryExchangeRate',
      headerName: 'Temp. Exchange Rate',
      minWidth: 170,
      flex: 1,
    },
    {
      field: 'purchase.permanentRate',
      headerName: 'Fixed Ex. Rate',
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'purchase.totalPurchaseAmount',
      headerName: 'Purchase Amount (AFG)',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'purchase.totalPurchaseAmountInPak',
      headerName: 'Purchase Amount (PKR)',
      minWidth: 200,
      flex: 1,
    },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 90,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: (params: any) => ({
        actions: params.data.actions,
      }),
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

  // --- Define your ActionItem type ---

  // --- Map purchase data and include actions ---
  mapToPurchaseData(resp: any[]): PurchaseWithDetails[] {
    const calculateTotalInPak = (
      amount: string | number,
      permanentRate?: number | null,
      temporaryRate?: string | number | null
    ): number | undefined => {
      const amt = Number(amount);
      const tempRate =
        temporaryRate != null ? Number(temporaryRate) : undefined;
      if (permanentRate != null) return amt * permanentRate;
      if (tempRate != null) return amt * tempRate;
      return undefined;
    };

    return resp.map((data) => {
      const purchase: Purchase = {
        id: String(data.id),
        purchaseDate: data.purchaseDate,
        coalType: data.coalType,
        customerName: data.customer.name,
        placeOfPurchase: data.placeOfPurchase.name,
        stockDestination: data.stockDestination.name,
        truckNo: data.truckNo,
        driverName: data.driver.name,
        metricTon: Number(data.metricTon),
        ratePerTon: Number(data.ratePerTon),
        permanentRate: data.permanentRate,
        temporaryExchangeRate: data.temporaryExchangeRate
          ? Number(data.temporaryExchangeRate)
          : undefined,
        totalPurchaseAmount: Number(data.totalPurchaseAmount),
        totalPurchaseAmountInPak: calculateTotalInPak(
          data.totalPurchaseAmount,
          data.permanentRate,
          data.temporaryExchangeRate
        ),
        builtyImage: data.builtyImage,
      };

      const row: PurchaseWithDetails = {
        id: String(data.id),
        purchase,
        purchaseFreight: data.purchaseFreight ?? null,
        gumrakEntry: data.gumrakEntry ?? null,
        status: data.status,
        actions: [
          {
            type: 'view',
            icon: 'visibility',
            label: 'View Purchase',
            permission: 'purchase:read',
            callback: () => this.onView(row),
          },
          {
            type: 'addFreight',
            icon: 'local_shipping',
            label: 'Add Freight Detail',
            permission: 'purchaseFreight:create',
            callback: (row: any) => this.onAddFreight(row),
          },
          {
            type: 'addGumrak',
            icon: 'assignment',
            label: 'Afghan Gumrak Form',
            permission: 'gumrak:create',
            callback: (row: any) => this.openGumrakDialog(row),
            visible: (row: any) => !row?.gumrakEntry,
          },
          ...(purchase.permanentRate == null
            ? [
                {
                  type: 'addExchange',
                  icon: 'currency_exchange',
                  label: 'Add Exchange Rate',
                  permission: 'purchase:read',//TODO: write correct permission
                  callback: () => this.addTempExchangeRate(row),
                } as ActionConfig,
              ]
            : []),
          {
            type: 'delete',
            icon: 'delete',
            label: 'Delete Purchase',
            permission: 'purchase:delete',
            callback: () => this.onDelete(row),
          },
        ],
      };

      return row;
    });
  }

  onBuyStock() {
    this.router.navigateByUrl('/buy-stock-form');
  }

  onView(rowData: any) {
    this.router.navigate(['/buy-stock-form', rowData]);
  }

  onAddFreight(rowData: any) {
    this.dialog.open(FreightDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: {
        purchaseData: rowData,
      },
    });
  }

  openGumrakDialog(rowData: any) {
    this.dialog.open(GumrakFormComponent, {
      panelClass: 'dialog-container-lg',
      data: {
        purchaseData: rowData,
      },
    });
  }

  addTempExchangeRate(rowData: any) {
    const dialogRef = this.dialog.open(TempExchangeRateComponent, {
      width: '800px',
      data: rowData.purchase,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPurchases();
      }
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
