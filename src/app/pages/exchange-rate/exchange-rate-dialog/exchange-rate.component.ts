import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
} from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExchangeRateDialogComponent } from './exchange-rate-dialog.component';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRate } from '../../buy-stock/data-access/buy-stock.dto';
import { ActionCellRendererComponent } from '../../../shared/components/action-cell-renderer/action-cell-renderer.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-exchange-rate',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './exchange-rate.component.html',
})
export class ExchangeRateComponent implements OnInit {
  private exchangeRateService = inject(ExchangeRateService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  permanentExchangeRates: ExchangeRate[] = [];
  gridApi: any;

  ngOnInit(): void {
    this.loadExchangeRates();
  }

  loadExchangeRates() {
    this.exchangeRateService.getAllExchangeRates().subscribe({
      next: (res) => {
        this.permanentExchangeRates = res.data.map(rate => ({
          ...rate,
          permanentExchangeRate: Number(rate.permanentExchangeRate),
        }));
        if (this.gridApi) this.gridApi.setRowData(this.permanentExchangeRates);
      },
      error: (err) => console.error('Failed to load exchange rates', err),
    });
  }

  ExchangeRateCols: ColDef[] = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 1 },
    { field: 'startDate', headerName: 'Start Date', minWidth: 150, flex: 1 },
    { field: 'endDate', headerName: 'End Date', minWidth: 150, flex: 1 },
    { field: 'permanentExchangeRate', headerName: 'Rate', minWidth: 100, flex: 1 },
    {
      headerName: 'Actions',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: {
        actions: [
          {
            type: 'edit',
            icon: 'edit',
            label: 'Edit Rate',
            permission: 'exchangeRate:update', //TODO: Replace with correct permission
            callback: (row: any) => this.openDialog(row),
          },
          {
            type: 'delete',
            icon: 'delete',
            label: 'Delete Rate',
            permission: 'exchangeRate:delete',//TODO: Replace with correct permission
            callback: (row: any) => this.onDelete(row),
          },
        ],
      },
      pinned: 'right',
      maxWidth: 100,
      sortable: false,
      filter: false,
    },
  ];

  gridOptions: GridOptions = { rowHeight: 60 };

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.permanentExchangeRates);
  }

  openDialog(rate?: ExchangeRate) {
    const dialogRef = this.dialog.open(ExchangeRateDialogComponent, {
      width: '800px',
      data: { permanentExchangeRate: rate },
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Exchange rate saved successfully!', 'Close', {
          duration: 3000,
        });
        this.loadExchangeRates();
      }
    });
  }

  onDelete(rate: ExchangeRate) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete the Exchange Rate?' },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.exchangeRateService.deleteExchangeRate(rate.id!).subscribe({
          next: () => {
            this.snackBar.open('Exchange rate deleted!', 'Close', { duration: 3000 });
            this.loadExchangeRates();
          },
          error: (err) => {
            console.error('Failed to delete exchange rate', err);
            this.snackBar.open('Failed to delete exchange rate', 'Close', { duration: 3000 });
          }
        }); // <-- closing parenthesis for subscribe
      }
    });
  }  
}
