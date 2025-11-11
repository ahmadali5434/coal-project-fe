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

  rateForm!: FormGroup;

  ngOnInit(): void {
    console.log('Dialog Data:', this.data);
    const purchase = this.data?.purchaseData;
    const rateData = purchase?.purchaseFreight;
    this.rateForm = new FormGroup({
      truckNo: new FormControl({
        value: purchase?.truckNo ?? '',
        disabled: true,
      }),
      driverName: new FormControl({
        value: rateData ? purchase?.driver?.name : purchase?.driverName ?? '',
        disabled: true,
      }),
      metricTon: new FormControl({
        value: purchase?.metricTon ?? 0,
        disabled: true,
      }),
      freightPerTon: new FormControl(rateData?.freightPerTon ?? 0),
      expense: new FormControl(rateData?.expense ?? 0),
      advancePayment: new FormControl(rateData?.advancePayment ?? 0),
      amountAFN: new FormControl(rateData?.amountAFN ?? 0),
      exchangeRate: new FormControl(rateData?.exchangeRate ?? 0),
      amountPKR: new FormControl(rateData?.amountPKR ?? 0),
    });

    this.setupAmountPKRCalculation();
  }

  setupAmountPKRCalculation() {
    this.rateForm.get('amountAFN')?.valueChanges.subscribe(() => {
      this.updateAmountPKR();
    });

    this.rateForm.get('exchangeRate')?.valueChanges.subscribe(() => {
      this.updateAmountPKR();
    });
  }

  updateAmountPKR() {
    const afn = Number(this.rateForm.get('amountAFN')?.value) || 0;
    const rate = Number(this.rateForm.get('exchangeRate')?.value) || 0;
    const pkr = afn * rate;

    this.rateForm
      .get('amountPKR')
      ?.setValue(pkr.toString(), { emitEvent: false });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    if (this.rateForm.valid) {
      const formData = this.rateForm.value;

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
      this.rateForm.markAllAsTouched();
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
