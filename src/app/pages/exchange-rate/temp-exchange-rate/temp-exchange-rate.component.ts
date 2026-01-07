import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Purchase } from '../../buy-stock/data-access/buy-stock.dto';
import { toDateOnly } from '../../../shared/utils/toDateOnly';
import { BuyStockService } from '../../buy-stock/data-access/buy-stock.service';

@Component({
  selector: 'app-temp-exchange-rate',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  templateUrl: './temp-exchange-rate.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogContent,
  ],
})
export class TempExchangeRateComponent implements OnInit {
  private readonly dialogRef = inject(
    MatDialogRef<TempExchangeRateComponent>
  );
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly buyStockService = inject(BuyStockService);
  private readonly snackBar = inject(MatSnackBar);

  exchangeForm!: FormGroup;

  ngOnInit(): void {
    
    const purchaseData: Purchase | undefined = this.data;
    this.exchangeForm = new FormGroup(
      {
        purchaseDate: new FormControl({
            value: purchaseData ? toDateOnly(purchaseData.purchaseDate) : null,
            disabled: true,
        }),
        totalPurchaseAmount: new FormControl({
          value: purchaseData ? purchaseData.totalPurchaseAmount : null,
          disabled: true,
        }),
        temporaryExchangeRate: new FormControl(purchaseData?.temporaryExchangeRate ?? null, [
          Validators.required,
          Validators.min(0),
        ]),
      },
    );
  }

  onSave(): void {
    if (this.exchangeForm.invalid) {
      this.exchangeForm.markAllAsTouched();
      return;
    }

    const temporaryExchangeRate = this.exchangeForm.value.temporaryExchangeRate;

    const id = this.data?.id;

    const request$ = this.buyStockService.updateExchangeRate(id, temporaryExchangeRate);

    request$.subscribe({
      next: (res) => {
        this.snackBar.open(
          id ? 'Exchange rate updated!' : 'Exchange rate saved!',
          undefined,
          { duration: 3000 }
        );
        this.dialogRef.close(res);
      },
      error: (err) => {
        const message =
          err?.error?.message || 'Something went wrong. Please try again.';

        this.snackBar.open(message, undefined, {
          duration: 4000,
        });
      },
    });
  }
}

