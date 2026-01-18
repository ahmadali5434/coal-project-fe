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

interface TempExchangeRateData {
  isGumrak: boolean;
  rowData: any; //change to proper type
}

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
  private readonly dialogRef = inject(MatDialogRef<TempExchangeRateComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly buyStockService = inject(BuyStockService);
  private readonly snackBar = inject(MatSnackBar);

  exchangeForm!: FormGroup;

  ngOnInit(): void {
    const isGumrak: boolean = this.data.isGumrak;
    const purchase: any = this.data.rowData.purchase; //Add proper type
    const gumrakEntry: any = this.data.rowData.gumrakEntry; //Add proper type

    this.exchangeForm = new FormGroup({
      entryDate: new FormControl({
        value: isGumrak
          ? toDateOnly(gumrakEntry.englishDate)
          : toDateOnly(purchase.purchaseDate),
        disabled: true,
      }),
      totalAmount: new FormControl({
        value: isGumrak
          ? gumrakEntry.totalGumrakAmount
          : purchase.totalPurchaseAmount,
        disabled: true,
      }),
      temporaryExchangeRate: new FormControl(
        isGumrak
          ? gumrakEntry?.temporaryExchangeRate
          : purchase?.temporaryExchangeRate ?? null,
        [Validators.required, Validators.min(0)]
      ),
    });
  }

  onSave(): void {
    if (this.exchangeForm.invalid) {
      this.exchangeForm.markAllAsTouched();
      return;
    }

    const temporaryExchangeRate = this.exchangeForm.value.temporaryExchangeRate;

    const rowData = this.data.rowData;
    const isGumrak = this.data.isGumrak === true;
    const purchaseId = rowData.id;
    const gumrakId = rowData.gumrakEntry?.id;

    if (isGumrak && !gumrakId) {
      this.snackBar.open('Gumrak entry not found for this record.', undefined, {
        duration: 3000,
      });
      return;
    }

    const type = isGumrak ? 'gumrak' : 'purchase';

    const request$ = this.buyStockService.updateExchangeRate(purchaseId, type, temporaryExchangeRate);

    request$.subscribe({
      next: (res) => {
        this.snackBar.open(
          purchaseId ? 'Exchange rate updated!' : 'Exchange rate saved!',
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
