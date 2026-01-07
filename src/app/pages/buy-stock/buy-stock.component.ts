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
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import {
  CustomEntry,
  GumrakEntry,
  Purchase,
  PurchaseFreight,
  PurchaseWithDetails,
} from './data-access/buy-stock.dto';
import { SummaryCardComponent } from '../../shared/components/summary-card/summary-card.component';
import { PurchaseDialogComponent } from './purchase-dialog/purchase-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { GumrakFormComponent } from './gumrak-form/gumrak-form.component';
import { FreightDialogComponent } from './freight-dialog/freight-dialog.component';
import { PurchaseProgressService } from './data-access/purchase-progress.service';
import { map, Observable } from 'rxjs';

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
    HasPermissionDirective,
  ],
  templateUrl: './buy-stock.component.html',
})
export class BuyStockComponent implements OnInit {
  private readonly buyStockService = inject(BuyStockService);
  private readonly purchaseProgressService = inject(PurchaseProgressService);
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
    this.purchaseProgressService.getAllPurchasesProgress();
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
          data: { purchaseData },
        });

        dialogRef.afterClosed().subscribe((updatedId: string) => {
          if (updatedId) {
            this.refreshSummary(updatedId);
          } else {
            this.router.navigateByUrl('/home');
          }
        });
      },
      error: (err) => {},
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
    this.mapPurchaseData().subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(FreightDialogComponent, {
          panelClass: 'dialog-container-lg',
          data,
        });
    
        dialogRef.afterClosed().subscribe((resp: PurchaseFreight) => {
          this.purchaseFreightData.set(resp);
        });
        return data;
      },
      error: (err) => {
        console.error('Error mapping purchase data for freight dialog:', err);
      },
    });
  }

  openEditFreightDialog(purchaseId: string) {
    this.mapPurchaseData().subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(FreightDialogComponent, {
          panelClass: 'dialog-container-lg',
          data,
        });
    
        dialogRef.afterClosed().subscribe((updatedFreightId: string) => {
          if (updatedFreightId) {
            this.refreshFreightSummary(purchaseId);
          }
        });
        return data;
      },
      error: (err) => {
        console.error('Error mapping purchase data for freight dialog:', err);
      },
    });
  }

  private refreshFreightSummary(purchaseId: string) {
    this.buyStockService.getPurchaseFreight(purchaseId).subscribe((res) => {
      const mappedData = this.mapToFreightSummary(res);
      this.purchaseFreightData.set(mappedData);
    });
  }

  openGumrakDialog() {
    this.mapPurchaseData().subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(GumrakFormComponent, {
          panelClass: 'dialog-container-lg',
          data,
        });
    
        dialogRef.afterClosed().subscribe((resp: GumrakEntry) => {
          this.gumrakData.set(resp);
        });
        return data;
      },
      error: (err) => {
        console.error('Error mapping purchase data for freight dialog:', err);
      },
    });
  }

  openEditGumrakDialog(purchaseId: string) {
    this.mapPurchaseData().subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(GumrakFormComponent, {
          panelClass: 'dialog-container-lg',
          data,
        });
    
        dialogRef.afterClosed().subscribe((updatedGumrakId: string) => {
          if (updatedGumrakId) {
            this.refreshGumrakSummary(purchaseId);
          }
        });
        return data;
      },
      error: (err) => {
        console.error('Error mapping purchase data for freight dialog:', err);
      },
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
      coalType: data?.coalType ?? 'N/A',
      customerName: data?.customer?.name ?? 'N/A',
      placeOfPurchase: data?.placeOfPurchase?.name ?? 'N/A',
      stockDestination: data?.stockDestination?.name ?? 'N/A',
      truckNo: data?.truckNo ?? 'N/A',
      driverName: data?.driver?.name ?? 'N/A',
      metricTon: data?.metricTon ?? 0,
      ratePerTon: data?.ratePerTon ?? 0,
      totalPurchaseAmount: data?.totalPurchaseAmount ?? 0,
      builtyImage: data?.builtyImage ?? null,
    };
  }

  private mapToFreightSummary(data: any) {
    return {
      freightPerTon: data?.freightPerTon ?? 0,
      expense: data?.expense ?? '',
      advancePayment: data?.advancePayment ?? 0,
      totalFreightAmount: data?.totalFreightAmount ?? 0,
    };
  }

  private mapToGumrakSummary(data: any) {
    return {
      islamicDate: data?.islamicDate ?? '',
      englishDate: data?.englishDate ?? '',
      invoiceExpense: data?.invoiceExpense ?? 0,
      otherExpense: data?.otherExpense ?? 0,
      afghanTax: data?.afghanTax ?? 0,
      commission: data?.commission ?? 0,
      totalGumrakAmount: data?.totalGumrakAmount ?? 0,
      gumrakImage: data?.gumrakImage ?? null,
    };
  }

  mapPurchaseData(): Observable<PurchaseWithDetails> {
    return this.buyStockService
      .getPurchase(this.purchaseData().id)
      .pipe(
        map((data) => {
          const calculateTotalInPak = (
            amount: string | number,
            permanentRate?: number | null,
            temporaryRate?: string | number | null
          ): number | undefined => {
            const amt = Number(amount);
            const tempRate =
              temporaryRate != null ? Number(temporaryRate) : undefined;
  
            if (permanentRate != null) return amt / permanentRate;
            if (tempRate != null) return amt / tempRate;
            return undefined;
          };
          
          console.log('Mapping Purchase Data:', data);
          return {
            id: String(data?.id),
            purchase: {
              id: String(data?.id),
              purchaseDate: data?.purchaseDate,
              coalType: data?.coalType,
              customerName: data?.customer?.name,
              placeOfPurchase: data?.placeOfPurchase?.name,
              stockDestination: data?.stockDestination?.name,
              truckNo: data?.truckNo,
              driverName: data?.driver?.name,
              metricTon: Number(data?.metricTon),
              ratePerTon: Number(data?.ratePerTon),
              permanentRate: data?.permanentRate,
              temporaryExchangeRate: data?.temporaryExchangeRate
                ? Number(data?.temporaryExchangeRate)
                : undefined,
              totalPurchaseAmount: Number(data?.totalPurchaseAmount),
              totalPurchaseAmountInPak: calculateTotalInPak(
                data?.totalPurchaseAmount?? 0,
                data?.permanentRate,
                data?.temporaryExchangeRate
              ),
              builtyImage: data?.builtyImage,
            },
            purchaseFreight: {
              id: data?.purchaseFreight?.id,
              freightPerTon: data?.purchaseFreight?.freightPerTon,
              expense: data?.purchaseFreight?.expense,
              advancePayment: data?.purchaseFreight?.advancePayment,
              totalFreightAmount: data?.purchaseFreight?.totalFreightAmount,
            },
            gumrakEntry: {
              id: data?.gumrakEntry?.id,
              islamicDate: data?.gumrakEntry?.islamicDate,
              englishDate: data?.gumrakEntry?.englishDate,
              invoiceExpense: data?.gumrakEntry?.invoiceExpense,
              otherExpense: data?.gumrakEntry?.otherExpense,
              afghanTax: data?.gumrakEntry?.afghanTax,
              commission: data?.gumrakEntry?.commission,
              totalGumrakAmount: data?.gumrakEntry?.totalGumrakAmount,
            },
            status: data?.status,
          } as PurchaseWithDetails;
        })
      );
  }
  
  
}
