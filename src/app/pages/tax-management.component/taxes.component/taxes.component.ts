import { Component, inject, OnInit } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaxService } from './taxes.service';
import { Tax } from '../../buy-stock/data-access/buy-stock.dto';
import { TaxFormComponent } from '../taxForm.component/taxForm.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ActionCellRendererComponent } from '../../../shared/components/action-cell-renderer/action-cell-renderer.component';


ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-taxes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './taxes.component.html',
})
export class TaxesComponent implements OnInit {
  private readonly taxService = inject(TaxService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  taxes: Tax[] = [];

  ngOnInit(): void {
    this.loadTaxes();
  }

  loadTaxes() {
    this.taxService.fetchAllTaxes().subscribe(list => {
      this.taxes = list;
    });
  }

  colDefs: ColDef[] = [
    { field: 'id', width: 70 },
    { field: 'taxName', headerName: 'Tax Name', filter: true },
    { field: 'taxCode', headerName: 'Tax Code', filter: true },
    { field: 'description', headerName: 'Description' },
    {
      headerName: 'Actions',
      cellRenderer: ActionCellRendererComponent,
      cellRendererParams: {
        actions: [
          {
            type: 'edit',
            icon: 'edit',
            label: 'Edit Tax',
            permission: 'tax:update',
            callback: (row: Tax) => this.openEditTax(row),
          },
          {
            type: 'delete',
            icon: 'delete',
            label: 'Delete Tax',
            permission: 'tax:delete',
            callback: (row: Tax) => this.onDelete(row),
          },
        ],
      },
      pinned: 'right',
      maxWidth: 100,
    },
  ];

  gridOptions: GridOptions = {
    rowHeight: 60,
    rowStyle: { paddingTop: '10px' },
  };

  openNewTaxDialog() {
    const ref = this.dialog.open(TaxFormComponent, {
      panelClass: 'dialog-container-lg',
    });

    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadTaxes();
    });
  }

  openEditTax(tax: Tax) {
    const ref = this.dialog.open(TaxFormComponent, {
      panelClass: 'dialog-container-lg',
      data: { ...tax, isEdit: true },
    });

    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadTaxes();
    });
  }

  onDelete(tax: Tax) {
    const taxId = tax.id;
    if (taxId == null) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Do you want to delete this tax?' },
    });

    ref.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.taxService.deleteTax(taxId).subscribe(() => {
          this.snackBar.open('Tax deleted', 'Close', { duration: 3000 });
          this.loadTaxes();
        });
      }
    });
  }


}
