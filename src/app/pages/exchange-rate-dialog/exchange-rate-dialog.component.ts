import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
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
import { ExchangeRate } from '../buy-stock/data-access/buy-stock.dto';
import { ExchangeRateService } from './exchange-rate.service';

@Component({
  selector: 'app-exchange-rate-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  templateUrl: './exchange-rate-dialog.component.html',
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
export class ExchangeRateDialogComponent implements OnInit {
  private readonly dialogRef = inject(
    MatDialogRef<ExchangeRateDialogComponent>
  );
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly exchangeRateService = inject(ExchangeRateService);
  private readonly snackBar = inject(MatSnackBar);

  exchangeForm!: FormGroup;

  ngOnInit(): void {
    const existing: ExchangeRate | undefined = this.data?.exchangeRate;

    this.exchangeForm = new FormGroup(
      {
        startDate: new FormControl(
          existing ? new Date(existing.startDate) : null,
          Validators.required
        ),
        endDate: new FormControl(
          existing ? new Date(existing.endDate) : null,
          Validators.required
        ),
        rate: new FormControl(existing?.permanentRate ?? null, [Validators.required, Validators.min(0)]),
      },
      { validators: this.dateRangeValidator }
    );
  }

  onRateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = input.value === '' ? null : Number(input.value);
    this.exchangeForm.get('rate')?.setValue(parsed, { emitEvent: true });
  }

  private dateRangeValidator(
    group: AbstractControl
  ): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;
    return end >= start ? null : { dateRange: true };
  }

  onSave(): void {
    if (this.exchangeForm.invalid) {
      this.exchangeForm.markAllAsTouched();
      return;
    }

    const raw = this.exchangeForm.value;

    const payload: ExchangeRate = {
      startDate: this.toIsoDate(raw.startDate),
      endDate: this.toIsoDate(raw.endDate),
      permanentRate: Number(raw.rate),
    };

    const id = this.data?.exchangeRate?.id;

    const request$ = id
      ? this.exchangeRateService.updateExchangeRate(id, payload)
      : this.exchangeRateService.createExchangeRate(payload);

    request$.subscribe({
      next: (res) => {
        this.snackBar.open(
          id ? 'Exchange rate updated!' : 'Exchange rate saved!',
          undefined,
          { duration: 3000 }
        );
        this.dialogRef.close(res);
      },
      error: () => {
        this.snackBar.open('Something went wrong', undefined, {
          duration: 3000,
        });
      },
    });
  }

  private toIsoDate(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }
}
