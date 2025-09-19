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
import { CustomEntry, PurchaseRate } from './data-access/buy-stock.dto';
import { SummaryCardComponent } from '../../shared/components/summary-card/summary-card.component';
import { RateDialogComponent } from './rate-dialog/rate-dialog.component';
import { PurchaseDialogComponent } from './purchase-dialog/purchase-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

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
  purchaseRateData = signal<PurchaseRate | null>(null);
  afghanGumrakData: Signal<CustomEntry | null> =
    this.buyStockService.afghanGumrakData;
  pakCustomData: Signal<CustomEntry | null> =
    this.buyStockService.pakCustomData;

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
          console.log('Purchase Rate Data:', data.purchaseRate);
          if (data.purchaseRate?.id) {
            const rateData = this.mapToRateSummary(data.purchaseRate);
            this.purchaseRateData.set(rateData);
          }
        }
      },
      error: (err) => {},
    });
  }

  openRateDialog() {
    const dialogRef = this.dialog.open(RateDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: { purchaseData: this.purchaseData() },
    });

    dialogRef.afterClosed().subscribe((resp: PurchaseRate) => {
      this.purchaseRateData.set(resp);
    });
  }
  
  openEditRateDialog(purchaseId: string) {
    this.buyStockService.getPurchase(purchaseId).subscribe({
      next: (res) => {
        const purchaseData = res;
  
        const dialogRef = this.dialog.open(RateDialogComponent, {
          panelClass: 'dialog-container-lg',
          data: { purchaseData },
        });
  
        dialogRef.afterClosed().subscribe((updatedRateId: string) => {
          if (updatedRateId) {
            this.refreshRateSummary(purchaseId);
          }
        });
      },
      error: (err) => {}
    });
  }
  
  private refreshRateSummary(purchaseId: string) {
    this.buyStockService.getPurchaseRate(purchaseId).subscribe((res) => {
      const mappedData = this.mapToRateSummary(res);
      this.purchaseRateData.set(mappedData);   // keep separate signal/store for rate
    });
  }
  

  openAfghanGumrakDialog() {
    const dialogRef = this.dialog.open(CustomDialogComponent, {
      panelClass: 'dialog-container-md',
      data: {type: 'afghan'},
    });
    dialogRef.afterClosed().subscribe((result) => {});
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

  private mapToRateSummary(data: any) {
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
}
