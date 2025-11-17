import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { BuyStockService } from './data-access/buy-stock.service';
import {
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { CustomEntry, GumrakEntry, PurchaseFreight } from './data-access/buy-stock.dto';
import { SummaryCardComponent } from '../../shared/components/summary-card/summary-card.component';
import { PurchaseDialogComponent } from './purchase-dialog/purchase-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HasPermissionDirective } from "../../core/directives/has-permission.directive";
import { GumrakFormComponent } from './gumrak-form/gumrak-form.component';
import { FreightDialogComponent } from './freight-dialog/freight-dialog.component';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-buy-stock-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    SummaryCardComponent,
    HasPermissionDirective
],
  templateUrl: './buy-stock.component.html',
})
export class BuyStockComponent implements OnInit {
  private readonly buyStockService = inject(BuyStockService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  purchaseFormEditMode = signal(false);

  purchaseData = signal<any | null>(null);
  purchaseFreightData = signal<PurchaseFreight | null>(null);
  gumrakData = signal<GumrakEntry | null>(null);
  pakCustomData = signal<CustomEntry | null>(null);

  ngOnInit(): void {
    const purchaseId = this.route.snapshot.paramMap.get('id');
    purchaseId ? this.refreshSummary(purchaseId) : this.openNewPurchaseDialog();
  }

  openNewPurchaseDialog() {
    const dialogRef = this.dialog.open(PurchaseDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: { purchaseData: null },
    });
  
    dialogRef.afterClosed().subscribe((purchaseId: string) => {
      if (purchaseId) {
        this.refreshSummary(purchaseId);
      } else {
        this.router.navigateByUrl('/home');
      }
    });
  }
  
  openEditPurchaseDialog(purchaseId: string) {
    this.buyStockService.getPurchase(purchaseId).subscribe({
      next: (res) => {
        const purchaseData = res;
  
        const dialogRef = this.dialog.open(PurchaseDialogComponent, {
          panelClass: 'dialog-container-lg',
          data: { purchaseData: purchaseData },
        });
  
        dialogRef.afterClosed().subscribe((updatedId: string) => {
          if (updatedId) {
            this.refreshSummary(updatedId);
          } else {
            this.router.navigateByUrl('/home');
          }
        });
      },
      error: (err) => {}
    });
  } 

  private refreshSummary(purchaseId: string) {
    this.buyStockService.getPurchase(purchaseId).subscribe({
      next: (data) => {
        if (data) {
          const mappedData = this.mapToPurchaseSummary(data);
          this.purchaseData.set(mappedData);
          console.log('Purchase Data:', data);
          console.log('Purchase Freight Data:', data.purchaseFreight);
          if (data.purchaseFreight?.id) {
            const freightData = this.mapToFreightSummary(data.purchaseFreight);
            this.purchaseFreightData.set(freightData);
          }
          if (data.gumrakEntry?.id) {
            const gumrakData = this.mapToGumrakSummary(data.gumrakEntry);
            this.gumrakData.set(gumrakData);
          }
        }
      },
      error: (err) => {},
    });
  }

  openFreightDialog() {
    const dialogRef = this.dialog.open(FreightDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: { purchaseData: this.purchaseData() },
    });

    dialogRef.afterClosed().subscribe((resp: PurchaseFreight) => {
      this.purchaseFreightData.set(resp);
    });
  }
  
  openEditFreightDialog(purchaseId: string) {
    this.buyStockService.getPurchase(purchaseId).subscribe({
      next: (res) => {
        const purchaseData = res;
  
        const dialogRef = this.dialog.open(FreightDialogComponent, {
          panelClass: 'dialog-container-lg',
          data: { purchaseData },
        });
  
        dialogRef.afterClosed().subscribe((updatedFreightId: string) => {
          if (updatedFreightId) {
            this.refreshFreightSummary(purchaseId);
          }
        });
      },
      error: (err) => {}
    });
  }
  
  private refreshFreightSummary(purchaseId: string) {
    this.buyStockService.getPurchaseFreight(purchaseId).subscribe((res) => {
      const mappedData = this.mapToFreightSummary(res);
      this.purchaseFreightData.set(mappedData);   // keep separate signal/store for freight
    });
  }

  openGumrakDialog() {
    const dialogRef = this.dialog.open(GumrakFormComponent, {
      panelClass: 'dialog-container-lg',
      data: { purchaseData: this.purchaseData() },
    });
    dialogRef.afterClosed().subscribe((resp: GumrakEntry) => {
      this.gumrakData.set(resp);
    });
  }

  openEditGumrakDialog(purchaseId: string) {
    this.buyStockService.getPurchase(purchaseId).subscribe({
      next: (res) => {
        const purchaseData = res;
  
        const dialogRef = this.dialog.open(GumrakFormComponent, {
          panelClass: 'dialog-container-lg',
          data: { purchaseData },
        });
  
        dialogRef.afterClosed().subscribe((updatedGumrakId: string) => {
          if (updatedGumrakId) {
            this.refreshGumrakSummary(purchaseId);
          }
        });
      },
      error: (err) => {}
    });
  }
  
  private refreshGumrakSummary(purchaseId: string) {
    this.buyStockService.getGumrakEntry(purchaseId).subscribe((res) => {
      const mappedData = this.mapToGumrakSummary(res);
      this.gumrakData.set(mappedData);
    });
  }

  openPakCustomDialog() {
    const dialogRef = this.dialog.open(CustomDialogComponent, {
      panelClass: 'dialog-container-md',
      data: { type: 'pakistan' },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  editPurchaseForm() {
    this.purchaseFormEditMode.set(true);
  }

  private mapToPurchaseSummary(data: any) {
    return {
      id: data?.id ?? null,
      purchaseDate: data?.purchaseDate ?? '',
      customerName: data?.customer?.name ?? 'N/A',
      placeOfPurchase: data?.placeOfPurchase?.name ?? 'N/A',
      stockDestination: data?.stockDestination?.name ?? 'N/A',
      truckNo: data?.truckNo ?? 'N/A',
      driverName: data?.driver?.name ?? 'N/A',
      metricTon: data?.metricTon ?? 0,
      builtyImage: data?.builtyImage ?? null,
    };
  }

  private mapToFreightSummary(data: any) {
    return {
      id: data?.id ?? null,
      freightPerTon: data?.freightPerTon ?? 0,
      expense: data?.expense ?? '',
      advancePayment: data?.advancePayment ?? 0,
      amountAFN: data?.amountAFN ?? 0,
      exchangeRate: data?.exchangeRate ?? 0,
      amountPKR: data?.amountPKR ?? 0,
    };
  }

  private mapToGumrakSummary(data: any) {
    return {
      id: data?.id ?? null,
      purchaseEntryId: data?.purchaseEntryId ?? null,
      islamicDate: data?.islamicDate ?? '',
      englishDate: data?.englishDate ?? '',
      invoice: data?.invoice ?? '',
      spendAfg: data?.spendAfg ?? 0,
      product: data?.product ?? '',
      shTax: data?.shTax ?? 0,
      totalAmount: data?.totalAmount ?? 0,
      gumrakImage: data?.gumrakImage ?? null,
    };
  }
}
