import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { PurchaseFreight } from '../data-access/buy-stock.dto';
import { BuyStockService } from '../data-access/buy-stock.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-freight-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatInputModule,
    MatDialogActions,
    MatSelectModule,
    MatButtonModule,
    MatDialogClose,
  ],
  templateUrl: './freight-dialog.component.html',
})
export class FreightDialogComponent implements OnInit {
  readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FreightDialogComponent>);
  private readonly buyStockService = inject(BuyStockService);
  private readonly _snackBar = inject(MatSnackBar);

  freightForm!: FormGroup;

  ngOnInit(): void {
    console.log('Dialog Data:', this.data);
    const purchase = this.data?.purchaseData;
    const freightData = purchase?.purchaseFreight;
    this.freightForm = new FormGroup({
      truckNo: new FormControl({
        value: purchase?.truckNo ?? '',
        disabled: true,
      }),
      driverName: new FormControl({
        value: freightData ? purchase?.driver?.name : purchase?.driverName ?? '',
        disabled: true,
      }),
      metricTon: new FormControl({
        value: purchase?.metricTon ?? 0,
        disabled: true,
      }),
      freightPerTon: new FormControl(freightData?.freightPerTon ?? 0),
      expense: new FormControl(freightData?.expense ?? 0),
      advancePayment: new FormControl(freightData?.advancePayment ?? 0),
      amountAFN: new FormControl(freightData?.amountAFN ?? 0),
      exchangeRate: new FormControl(freightData?.exchangeRate ?? 0),
    totalAmount: new FormControl(freightData?.totalAmount ?? 0),
    });

    this.setupAmountPKRCalculation();
  }

  setupAmountPKRCalculation() {
    this.freightForm.get('amountAFN')?.valueChanges.subscribe(() => {
      this.updateAmountPKR();
    });

    this.freightForm.get('exchangeRate')?.valueChanges.subscribe(() => {
      this.updateAmountPKR();
    });
  }

  updateAmountPKR() {
    const afn = Number(this.freightForm.get('amountAFN')?.value) || 0;
    const rate = Number(this.freightForm.get('exchangeRate')?.value) || 0;
    const pkr = afn * rate;

    this.freightForm
      .get('amountPKR')
      ?.setValue(pkr.toString(), { emitEvent: false });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    if (this.freightForm.valid) {
      const formData = this.freightForm.value;

      const data: PurchaseFreight = {
        freightPerTon: formData.freightPerTon ?? 0,
        expense: formData.expense ?? '',
        advancePayment: formData.advancePayment ?? 0,
        amountAFN: Number(formData.amountAFN ?? 0),
        exchangeRate: Number(formData.exchangeRate ?? 0),
        amountPKR: Number(formData.amountPKR ?? 0),
      };

      const purchaseFreightId = this.data?.purchaseData?.purchaseFreight?.id;
      purchaseFreightId
        ? this.updatePurchaseFreight(data)
        : this.saveNewPurchaseFreight(data);
    } else {
      this.freightForm.markAllAsTouched();
    }
  }

  private saveNewPurchaseFreight(formData: PurchaseFreight) {
    this.buyStockService
      .createPurchaseFreight(this.data?.purchaseData?.id, formData)
      .subscribe({
        next: (res) => {
          this._snackBar.open('Purchase Freight saved!', undefined, {
            duration: 3000,
          });
          this.dialogRef.close(formData);
        },
        error: (err) => {
          this._snackBar.open(
            'Error saving Purchase Freight. Please try again.',
            undefined,
            { duration: 3000 }
          );
        },
      });
  }

  private updatePurchaseFreight(formData: PurchaseFreight) {
    const purchaseId = this.data?.purchaseData?.id;
    this.buyStockService
      .updatePurchaseFreight(purchaseId, formData)
      .subscribe({
        next: (res) => {
          this._snackBar.open('Purchase Freight updated!', undefined, {
            duration: 3000,
          });
          this.dialogRef.close(formData);
        },
        error: (err) => {
          this._snackBar.open(
            'Error updating Purchase Freight. Please try again.',
            undefined,
            { duration: 3000 }
          );
        },
      });
  }
}
