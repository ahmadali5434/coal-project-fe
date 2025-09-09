// #region Imports
import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LocationService } from '../../../shared/services/location.service';
import { DriverService } from '../data-access/driver.service';
import { City, Country } from '../../../shared/model';
import {
  CreateOrUpdateDriverPayload,
  Driver,
} from '../data-access/buy-stock.dto';
// #endregion

@Component({
  selector: 'app-add-new-driver-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSnackBarModule,
    NgIf,
  ],
  templateUrl: './add-new-driver-dialog.component.html',
})
export class AddNewDriverDialogComponent implements OnInit {
  // #region Injected Services
  private readonly dialogRef = inject(
    MatDialogRef<AddNewDriverDialogComponent>
  );
  private readonly driverService = inject(DriverService);
  private readonly _snackBar = inject(MatSnackBar);
  locationService = inject(LocationService);
  // #endregion

  // #region State
  countries: Country[] = [];
  citiesByCountry: City[] = [];
  provinces: { value: string; label: string }[] = [];
  isEdit = false;
  // #endregion

  // #region Form
  addDriverForm = new FormGroup({
    id: new FormControl<string | null>({ value: null, disabled: true }),
    idCardNo: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    driverFatherName: new FormControl<string>(''),
    province: new FormControl<string>(''),
    areaAddress: new FormControl<string>(''),
    afghanContactNo: new FormControl<string>(''),
    pakistanContactNo: new FormControl<string>(''),
    countryId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    cityId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
  });
  // #endregion

  // #region Constructor
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: (Partial<Driver> & { isEdit?: boolean }) | null
  ) {}
  // #endregion

  // #region Lifecycle
  ngOnInit(): void {
    this.loadCountries();
    this.handleCountryChanges();
  }
  // #endregion

  // #region Methods
  private loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        if (this.data?.isEdit) {
          this.isEdit = true;
          this.patchFormForEdit();
        }
      },
      error: (err) => console.error('Error fetching countries', err),
    });
  }

  private handleCountryChanges(): void {
    this.addDriverForm.get('countryId')?.valueChanges.subscribe((countryId) => {
      if (!countryId) {
        this.citiesByCountry = [];
        this.addDriverForm.get('cityId')?.setValue(null);
        return;
      }
      this.loadCities(countryId);
    });
  }

  private loadCities(countryId: string): void {
    this.locationService.getCitiesByCountry(countryId).subscribe({
      next: (cities) => {
        this.citiesByCountry = cities;
        const selectedCity = this.addDriverForm.get('cityId')?.value;
        if (!cities.some((c) => c.id === selectedCity)) {
          this.addDriverForm.get('cityId')?.setValue(null);
        }
      },
      error: (err) => console.error('Error fetching cities', err),
    });
  }

  private patchFormForEdit(): void {
    this.addDriverForm.patchValue({
      id: this.data?.id ?? null,
      idCardNo: this.data?.idCardNo ?? '',
      name: this.data?.name ?? '',
      driverFatherName: this.data?.driverFatherName ?? '',
      province: this.data?.province ?? '',
      areaAddress: this.data?.areaAddress ?? '',
      afghanContactNo: this.data?.afghanContactNo ?? '',
      pakistanContactNo: this.data?.pakistanContactNo ?? '',
      countryId: this.data?.country?.id ?? null,
      cityId: this.data?.city?.id ?? null,
    });

    const countryId = this.addDriverForm.get('countryId')?.value;
    if (countryId) {
      this.loadCities(countryId);
    }
  }

  onSave(): void {
    if (this.addDriverForm.invalid) {
      this.addDriverForm.markAllAsTouched();
      this._snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = this.mapDriverFormToPayload(
      this.addDriverForm.getRawValue()
    );

    const action$ =
      this.isEdit && this.data?.id
        ? this.driverService.updateDriver(this.data.id, payload)
        : this.driverService.createDriver(payload);

    action$.subscribe({
      next: () => {
        this._snackBar.open(
          this.isEdit
            ? 'Driver updated successfully!'
            : 'Driver added successfully!',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this._snackBar.open(
          this.isEdit ? 'Failed to update driver' : 'Failed to add driver',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }
  // #endregion

  // #region Helpers
  private mapDriverFormToPayload(form: any): CreateOrUpdateDriverPayload {
    return {
      idCardNo: form.idCardNo!.trim(),
      name: form.name!.trim(),
      driverFatherName: form.driverFatherName?.trim() ?? '',
      province: form.province?.trim() ?? '',
      areaAddress: form.areaAddress?.trim() ?? '',
      afghanContactNo: form.afghanContactNo?.trim() ?? '',
      pakistanContactNo: form.pakistanContactNo?.trim() ?? '',
      countryId: form.countryId!,
      cityId: form.cityId!,
    };
  }
  // #endregion
}
