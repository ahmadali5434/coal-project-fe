import { Component, inject, OnInit, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import type { ColDef, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import {
  ActionCellRendererComponent,
  ActionConfig,
} from '../../shared/components/action-cell-renderer/action-cell-renderer.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BuyStockService } from '../buy-stock/data-access/buy-stock.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import {
  CustomEntry,
  GumrakEntry,
  PakCustomEntry,
  Purchase,
  PurchaseFreight,
  PurchaseWithDetails,
} from '../buy-stock/data-access/buy-stock.dto';
import { PurchaseProgressService } from '../buy-stock/data-access/purchase-progress.service';
import { TempExchangeRateComponent } from '../exchange-rate/temp-exchange-rate/temp-exchange-rate.component';
import { FreightDialogComponent } from '../buy-stock/freight-dialog/freight-dialog.component';
import { GumrakFormComponent } from '../buy-stock/gumrak-form/gumrak-form.component';
import { CustomEntryDialogComponent } from '../custom/components/custom-entry-dialog/custom-entry-dialog.component';

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

  defaultColDef: ColDef = {
    flex: 1,
    wrapText: true,
    autoHeight: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    cellStyle: {
      whiteSpace: 'normal',
      lineHeight: '1.5',
    },
  };

  // --- Grid ---
  colDefs: ColDef[] = [
    {
      field: 'purchase.coalType',
      headerName: 'Maal',
      minWidth: 140,
    },
    {
      field: 'purchase.customerName',
      headerName: 'Broker',
      minWidth: 140,
    },
    {
      field: 'purchase.placeOfPurchase',
      headerName: 'loading',
      minWidth: 140,
    },
    {
      field: 'purchase.stockDestination',
      headerName: 'Unloading',
      minWidth: 140,
    },
    {
      field: 'purchase.purchaseDate',
      headerName: 'Purchase Date',
      minWidth: 130,
    },
    {
      field: 'purchase.truckNo',
      headerName: 'Vehicle No',
      minWidth: 120,
    },
    {
      field: 'purchase.metricTon',
      headerName: 'MT',
      minWidth: 80,
    },
    {
      field: 'purchase.temporaryExchangeRate',
      headerName: 'Temp. Exchange Rate (P)',
      minWidth: 120,
    },
    {
      field: 'purchase.permanentExchangeRate',
      headerName: 'Fixed Ex. Rate (P)',
      minWidth: 100,
    },
    {
      field: 'purchase.totalPurchaseAmount',
      headerName: 'Purchase Amount (AFG)',
      minWidth: 110,
    },
    {
      field: 'purchase.totalPurchaseAmountInPak',
      headerName: 'Purchase Amount (PKR)',
      minWidth: 110,
      valueFormatter: (params) => {
        const value = params.value;
        return value != null ? Number(value).toFixed(2) : '';
      },
    },
    {
      field: 'purchaseFreight.totalFreightAmount',
      headerName: 'Freight',
      minWidth: 110,
    },
    {
      field: 'gumrakEntry.temporaryExchangeRate',
      headerName: 'Temp. Exchange Rate (G)',
      minWidth: 120,
    },
    {
      field: 'gumrakEntry.permanentExchangeRate',
      headerName: 'Fixed Ex. Rate (G)',
      minWidth: 100,
    },
    {
      field: 'gumrakEntry.totalGumrakAmount',
      headerName: 'Gumrak (AFG)',
      minWidth: 110,
      valueFormatter: (params) => {
        const value = params.value;
        return value != null ? Number(value).toFixed(2) : '';
      },
    },
    {
      field: 'gumrakEntry.totalGumrakAmountInPak',
      headerName: 'Gumrak (PKR)',
      minWidth: 110,
      valueFormatter: (params) => {
        const value = params.value;
        return value != null ? Number(value).toFixed(2) : '';
      },
    },
    {
      field: 'customEntry.importValue',
      headerName: 'Custom',
      minWidth: 110,
    },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 82,
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
      permanentExchangeRate?: number | null,
      temporaryRate?: string | number | null
    ): number | undefined => {
      const amt = Number(amount);
      const tempRate =
        temporaryRate != null ? Number(temporaryRate) : undefined;
      if (permanentExchangeRate != null) return amt / permanentExchangeRate;
      if (tempRate != null) return amt / tempRate;
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
        permanentExchangeRate: data.permanentExchangeRate,
        temporaryExchangeRate: data.temporaryExchangeRate
          ? Number(data.temporaryExchangeRate)
          : undefined,
        totalPurchaseAmount: Number(data.totalPurchaseAmount),
        totalPurchaseAmountInPak: calculateTotalInPak(
          data.totalPurchaseAmount,
          data.permanentExchangeRate,
          data.temporaryExchangeRate
        ),
        builtyImage: data.builtyImage,
      };

      const purchaseFreight: PurchaseFreight = {
        id: data.purchaseFreight?.id,
        freightPerTon: data.purchaseFreight?.freightPerTon,
        expense: data.purchaseFreight?.expense,
        advancePayment: data.purchaseFreight?.advancePayment,
        totalFreightAmount: data.purchaseFreight?.totalFreightAmount,
      };

      const gumrakEntry: GumrakEntry = {
        id: data.gumrakEntry?.id,
        islamicDate: data.gumrakEntry?.islamicDate,
        englishDate: data.gumrakEntry?.englishDate,
        invoiceExpense: data.gumrakEntry?.invoiceExpense,
        otherExpense: data.gumrakEntry?.otherExpense,
        afghanTax: data.gumrakEntry?.afghanTax,
        commission: data.gumrakEntry?.commission,
        permanentExchangeRate: data.gumrakEntry?.permanentExchangeRate,
        temporaryExchangeRate: data.gumrakEntry?.temporaryExchangeRate
          ? Number(data.gumrakEntry?.temporaryExchangeRate)
          : undefined,
        totalGumrakAmount: data.gumrakEntry?.totalGumrakAmount,
        totalGumrakAmountInPak: calculateTotalInPak(
          data.gumrakEntry?.totalGumrakAmount,
          data.gumrakEntry?.permanentExchangeRate,
          data.gumrakEntry?.temporaryExchangeRate
        ),
      };
      const customEntry: PakCustomEntry = {
        gdNumber: data.customEntry?.gdNumber,
        gdDate: data.customEntry?.gdDate,
        importerType: data.customEntry?.importerType,
        month: data.customEntry?.month,
        head: data.customEntry?.head,
        grossWeight: data.customEntry?.grossWeight,
        netWeight: data.customEntry?.netWeight,
        currency: data.customEntry?.currency,
        hsCode: data.customEntry?.hsCode,
        exchangeRate: data.customEntry?.exchangeRate,
        importValue: data.customEntry?.importValue,
        psidAmount: data.customEntry?.psidAmount,
        packages: data.customEntry?.packages,
        stockOut: data.customEntry?.stockOut,
        stockBalance: data.customEntry?.stockBalance,
        sales: data.customEntry?.sales,
        balance: data.customEntry?.balance,
        taxPerVehicle: data.customEntry?.taxPerVehicle,
      };
      const row: PurchaseWithDetails = {
        id: String(data.id),
        purchase,
        purchaseFreight,
        gumrakEntry,
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
            label: purchaseFreight.id
              ? 'Update Freight Detail'
              : 'Add Freight Detail',
            permission: 'purchaseFreight:create',
            callback: (row: any) => this.onAddFreight(row),
          },
          {
            type: 'addGumrak',
            icon: 'assignment',
            label: gumrakEntry.id
              ? 'Update Gumrak Detail'
              : 'Add Gumrak Detail',
            permission: 'gumrak:create',
            callback: (row: any) => this.openGumrakDialog(row),
          },
          {
            type: 'addCustom',
            icon: 'assignment',
            label: customEntry.id
              ? 'Update Custom Detail'
              : 'Add Custom Detail',
            permission: 'custom:create',
            callback: (row: any) => this.openCustomDialog(row),
          },
          ...(purchase.permanentExchangeRate == null
            ? [
                {
                  type: 'addExchange',
                  icon: 'currency_exchange',
                  label: 'Add Purchase Exchange Rate',
                  permission: 'purchase:read', //TODO: write correct permission
                  callback: () => this.addTempExchangeRate(row),
                } as ActionConfig,
              ]
            : []),
          ...(gumrakEntry.permanentExchangeRate == null &&
          gumrakEntry.id !== undefined
            ? [
                {
                  type: 'addExchange',
                  icon: 'currency_exchange',
                  label: 'Add Gumrak Exchange Rate',
                  permission: 'purchase:read', //TODO: write correct permission
                  callback: () => this.addTempGumrakExchangeRate(row),
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
    const dialogRef = this.dialog.open(FreightDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((resp: PurchaseFreight) => {
      if (resp) this.loadDashboard();
    });
  }

  openGumrakDialog(rowData: any) {
    const dialogRef = this.dialog.open(GumrakFormComponent, {
      panelClass: 'dialog-container-lg',
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((resp: GumrakEntry) => {
      if (resp) this.loadDashboard();
    });
  }

  openCustomDialog(rowData: any) {
    const dialogRef = this.dialog.open(CustomEntryDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        this.loadPurchases();
      }
    });
  }

  addTempExchangeRate(rowData: any) {
    const dialogRef = this.dialog.open(TempExchangeRateComponent, {
      width: '800px',
      data: {
        isGumrak: false,
        rowData,
      },
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        this.loadPurchases();
      }
    });
  }

  addTempGumrakExchangeRate(rowData: any) {
    console.log('Adding temp exchange rate for row:', rowData);
    const dialogRef = this.dialog.open(TempExchangeRateComponent, {
      width: '800px',
      data: {
        isGumrak: true,
        rowData,
      },
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
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
            this.loadDashboard();
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
