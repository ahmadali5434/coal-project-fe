import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TaxService } from '../../../custom/services/tax.service';
import { TaxRuleService } from '../../../custom/services/tax-rule.service';
import { ImporterType } from '../../../custom/models/tax-rule.model';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tax-rules-dialog',
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatDialogActions,
    MatIcon,
    MatDialogClose,
  ],
  templateUrl: './tax-rules-dialog.component.html',
})
export class TaxRulesDialogComponent {
  private fb = inject(FormBuilder);
  private taxService = inject(TaxService);
  private taxRuleService = inject(TaxRuleService);

  private dialogRef = inject(MatDialogRef<TaxRulesDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data = inject(MAT_DIALOG_DATA, { optional: true });

  taxes: any[] = [];

  form = this.fb.group({
    taxId: ['', Validators.required],
    importerType: ['INDIVIDUAL' as ImporterType, Validators.required],
    rate: [''],
    effectiveFrom: ['', Validators.required],
    effectiveTo: [''],
  });

  constructor() {
    this.loadTaxes();

    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  loadTaxes() {
    this.taxService.fetchAllTaxes().subscribe((res) => {
      this.taxes = res;
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload = {
      taxId: raw.taxId!,
      importerType: raw.importerType!,
      rate: raw.rate || undefined,
      effectiveFrom: raw.effectiveFrom!,
      effectiveTo: raw.effectiveTo || undefined,
    };

    const request$ = this.data?.id
      ? this.taxRuleService.updateRule(this.data.id, payload)
      : this.taxRuleService.createRule(payload);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        const message =
          err?.error?.message || err?.message || 'Operation failed';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }
}
