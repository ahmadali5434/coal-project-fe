import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { City } from '../../../shared/model';
import { CityService } from '../city and country data accses/city.service';

@Component({
  selector: 'app-add-new-city-dialog',
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
  templateUrl: './add-new-city-dialog.component.html'
})
export class AddNewCityDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<AddNewCityDialogComponent>);
  private fb = inject(FormBuilder);
  private cityService = inject(CityService);
  private _snackBar = inject(MatSnackBar);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { countryId: number; city?: City }
  ) {}

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  ngOnInit() {
    if (this.data?.city) {
      this.form.patchValue({
        name: this.data.city.name
      });
    }
  }

  onSave() {
    if (this.form.invalid) return;

    const payload = {
      name: this.form.getRawValue().name,
      countryId: this.data.countryId
    };

    if (this.data?.city) {
      this.cityService.updateCity(Number(this.data.city.id), payload).subscribe({
        next: (city: City) => {
          this._snackBar.open('City updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(city);
        },
        error: (err) => {
          console.error('Error updating city:', err);
          this._snackBar.open('Error updating city', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.cityService.createCity(payload).subscribe({
        next: (city: City) => {
          this._snackBar.open('City created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(city);
        },
        error: (err) => {
          console.error('Error creating city:', err);
          this._snackBar.open('Error creating city', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
