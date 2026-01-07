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

  isEdit = false;

  freightForm!: FormGroup;

  ngOnInit(): void {
    const purchase = this.data?.purchase;
    const freightData = this.data?.purchaseFreight;
    this.isEdit = freightData.id ? true : false;
    this.freightForm = new FormGroup({
      truckNo: new FormControl({
        value: purchase?.truckNo ?? '',
        disabled: true,
      }),
      driverName: new FormControl({
        value: purchase?.driverName ?? '',
        disabled: true,
      }),
      metricTon: new FormControl({
        value: purchase?.metricTon ?? 0,
        disabled: true,
      }),
      freightPerTon: new FormControl(freightData?.freightPerTon ?? 0),
      expense: new FormControl(freightData?.expense ?? 0),
      advancePayment: new FormControl(freightData?.advancePayment ?? 0),
      totalFreightAmount: new FormControl(freightData?.totalFreightAmount ?? 0),
    });

    this.calculateTotalFreight();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    if (this.freightForm.valid) {
      const formData = this.freightForm.value;

      const data: PurchaseFreight = {
        freightPerTon: Number(formData.freightPerTon),
        expense: Number(formData.expense),
        advancePayment: Number(formData.advancePayment),
        totalFreightAmount: Number(formData.totalFreightAmount)
      };      

      const purchaseFreightId = this.data?.purchaseFreight?.id;
      purchaseFreightId
        ? this.updatePurchaseFreight(data)
        : this.saveNewPurchaseFreight(data);
    } else {
      this.freightForm.markAllAsTouched();
    }
  }

  private saveNewPurchaseFreight(formData: PurchaseFreight) {
    this.buyStockService
      .createPurchaseFreight(this.data?.purchase?.id, formData)
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
    const purchaseId = this.data?.purchase?.id;
    this.buyStockService.updatePurchaseFreight(purchaseId, formData).subscribe({
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

  private calculateTotalFreight() {
    this.freightForm.valueChanges.subscribe(val => {
      const metricTon = Number(this.freightForm.get('metricTon')?.value) || 0;
      const freightPerTon = Number(val.freightPerTon) || 0;
      const expense = Number(val.expense) || 0;
      const advancePayment = Number(val.advancePayment) || 0;
  
      const total = (metricTon * freightPerTon) + expense - advancePayment;
  
      this.freightForm.get('totalFreightAmount')?.setValue(total, { emitEvent: false });
    });
  }

}
