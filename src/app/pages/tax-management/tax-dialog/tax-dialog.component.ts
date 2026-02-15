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
import { TaxService } from '../../custom/services/tax.service';
import { MatSelectModule } from '@angular/material/select';
import { CalculationType, Tax } from '../../custom/models/tax.model';


@Component({
  selector: 'app-tax-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './tax-dialog.component.html',
})
export class TaxFormComponent {
  private readonly dialogRef = inject(MatDialogRef<TaxFormComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly taxService = inject(TaxService);
  private readonly data = inject(MAT_DIALOG_DATA);
  calculationTypes = Object.values(CalculationType);

  isEdit = false;

  taxForm = new FormGroup({
    name: new FormControl('', Validators.required),
    code: new FormControl('', Validators.required),
    calculationType: new FormControl<CalculationType | null>(null, Validators.required),
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
      name: this.taxForm.value.name!,
      code: this.taxForm.value.code!,
      calculationType: this.taxForm.value.calculationType!,
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
