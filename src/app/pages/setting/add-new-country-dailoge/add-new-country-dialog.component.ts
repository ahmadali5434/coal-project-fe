import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogActions, MatDialogContent, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Country } from '../../../shared/model';
import { CountryService } from '../city and country data accses/country.service';

@Component({
  selector: 'app-add-new-country-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIconModule
  ],
  templateUrl: './add-new-country-dialog.component.html'
})
export class AddNewCountryDialogComponent {
  private dialogRef = inject(MatDialogRef<AddNewCountryDialogComponent>);
  private fb = inject(FormBuilder);
  private countryService = inject(CountryService);
  private _snackBar = inject(MatSnackBar);
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { country?: Country }
  ) { }

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(3)]],
  });
  ngOnInit() {
    if (this.data?.country) {
      this.form.patchValue(this.data.country);
    }
  }
  onSave() {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    if (this.data?.country) {
      this.countryService.updateCountry(Number(this.data.country.id), payload).subscribe({
        next: (country) => {
          this._snackBar.open('Country updated successfully', undefined, { duration: 3000 });
          this.dialogRef.close(country);
        },
        error: () => this._snackBar.open('Error updating country', undefined, { duration: 3000 }),
      });
    } else {
      this.countryService.createCountry(payload).subscribe({
        next: (country) => {
          this._snackBar.open('Country created successfully', undefined, { duration: 3000 });
          this.dialogRef.close(country);
        },
        error: () => this._snackBar.open('Error creating country', undefined, { duration: 3000 }),
      });
    }
  }
}
