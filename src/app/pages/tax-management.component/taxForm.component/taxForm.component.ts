import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TaxService } from '../taxes.component/taxes.service';
import { Tax } from '../../buy-stock/data-access/buy-stock.dto';


@Component({
  selector: 'app-tax-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './taxForm.component.html',
})
export class TaxFormComponent {
  private readonly dialogRef = inject(MatDialogRef<TaxFormComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly taxService = inject(TaxService);
  private readonly data = inject(MAT_DIALOG_DATA);

  isEdit = false;

  taxForm = new FormGroup({
    taxName: new FormControl('', Validators.required),
    taxCode: new FormControl('', Validators.required),
    description: new FormControl(''),
  });

  constructor() {
    if (this.data?.isEdit) {
      this.isEdit = true;
      this.taxForm.patchValue(this.data);
    }
  }
  onSave(): void {
    if (this.taxForm.invalid) {
      this.taxForm.markAllAsTouched();
      return;
    }

    const payload: Partial<Tax> = {
      taxName: this.taxForm.value.taxName!,
      taxCode: this.taxForm.value.taxCode!,
      description: this.taxForm.value.description ?? undefined,
    };

    if (this.isEdit && !this.data?.id) return;

    const request$ = this.isEdit
      ? this.taxService.updateTax(this.data.id, payload)
      : this.taxService.createTax(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Tax updated successfully' : 'Tax added successfully',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: () =>
        this.snackBar.open('Operation failed', 'Close', { duration: 3000 }),
    });
  }

}
