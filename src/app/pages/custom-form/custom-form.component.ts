import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { BuyStockService } from '../buy-stock/data-access/buy-stock.service';
import { ApiResponse, PakCustomEntry } from '../buy-stock/data-access/buy-stock.dto';

@Component({
  selector: 'app-custom-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './custom-form.component.html',
})
export class CustomFormComponent implements OnInit {
  private readonly _snackBar = inject(MatSnackBar);
  private readonly buyStockService = inject(BuyStockService);

  form!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.isEdit = !!this.data?.customEntry;

    this.form = this.fb.group({
      gdNumber: ['', Validators.required],
      month: ['', Validators.required],
      head: ['', Validators.required],
      grossWeight: [0, Validators.required],
      netWeight: [0, Validators.required],
      currency: ['', Validators.required],
      hsCode: ['', Validators.required],
      exchangeRate: [0, Validators.required],
      importValue: [0, Validators.required],
      psidAmount: [0],
      packages: [0],
      stockOut: [0],
      stockBalance: [{ value: 0, disabled: true }],
      sales: [0],
      balance: [{ value: 0, disabled: true }],
      taxPerVehicle: [{ value: 0, disabled: true }],
    });

    if (this.isEdit) {
      this.form.patchValue(this.data.customEntry);
    }

    this.calculateFields();
  }

  private calculateFields() {
    this.form.valueChanges.subscribe((val) => {
      const netWeight = Number(val.netWeight) || 0;
      const stockOut = Number(val.stockOut) || 0;
      const sales = Number(val.sales) || 0;
      const importValue = Number(val.importValue) || 0;
      const exchangeRate = Number(val.exchangeRate) || 0;

      const stockBalance = netWeight - stockOut;
      const balance = stockBalance - sales;
      const taxPerVehicle = importValue * exchangeRate;

      this.form.patchValue(
        { stockBalance, balance, taxPerVehicle },
        { emitEvent: false }
      );
    });
  }
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._snackBar.open('Please fill all required fields', undefined, {
        duration: 3000,
      });
      return;
    }

    const payload: PakCustomEntry = this.form.getRawValue();
    const purchaseId = this.data?.purchase?.id as string;
    const customId = this.data?.customEntry?.id;

    customId
      ? this.updateCustomData(purchaseId, payload)
      : this.saveNewCustomData(purchaseId, payload);
  }


  private saveNewCustomData(purchaseId: string, payload: PakCustomEntry) {
    this.buyStockService.createCustomEntry(purchaseId, payload).subscribe({
      next: (res: ApiResponse<PakCustomEntry>) => {
        this._snackBar.open('Custom entry saved!', undefined, {
          duration: 3000,
        });
        this.resetForm();
        this.dialogRef.close(res.data);
      },
      error: () => {
        this._snackBar.open('Error saving Custom entry.', undefined, {
          duration: 3000,
        });
      },
    });
  }

  private updateCustomData(purchaseId: string, payload: PakCustomEntry) {
    this.buyStockService.updateCustomEntry(purchaseId, payload).subscribe({
      next: (res: ApiResponse<PakCustomEntry>) => {
        this._snackBar.open('Custom entry updated!', undefined, {
          duration: 3000,
        });
        this.resetForm();
        this.dialogRef.close(res.data);
      },
      error: () => {
        this._snackBar.open('Error updating Custom entry.', undefined, {
          duration: 3000,
        });
      },
    });
  }

  private resetForm() {
    this.form.reset();
  }

  onCancel() {
    this.dialogRef.close();
  }
}
