import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LocationService } from '../../../shared/services/location.service';
import { CustomerService } from '../data-access/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import {
  Customer,
  CreateOrUpdateCustomerPayload,
} from '../data-access/buy-stock.dto';
import { City, Country } from '../../../shared/model';

@Component({
  selector: 'app-add-new-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './add-new-customer-dialog.component.html',
})
export class AddNewCustomerDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<AddNewCustomerDialogComponent>);
  private readonly customerService = inject(CustomerService);
  private readonly _snackBar = inject(MatSnackBar);
  locationService = inject(LocationService);
  countries: Country[] = [];
  citiesByCountry: City[] = [];
  isEdit = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: (Partial<Customer> & { isEdit?: boolean })| null) {}
  addCustomerForm = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    fullName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phoneNumber: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    countryId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    cityId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
     address: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit() {
   this.loadCountries();
    this.handleCountryChanges();
  }

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
    this.addCustomerForm.get('countryId')?.valueChanges.subscribe((countryId) => {
      if (!countryId) {
        this.citiesByCountry = [];
        this.addCustomerForm.get('cityId')?.setValue(null);
        return;
      }
      this.loadCities(countryId);
    });
  }

  private loadCities(countryId: string): void {
    this.locationService.getCitiesByCountry(countryId).subscribe({
      next: (cities) => {
        this.citiesByCountry = cities;
        const selectedCity = this.addCustomerForm.get('cityId')?.value;
        if (!cities.some((c) => c.id === selectedCity)) {
          this.addCustomerForm.get('cityId')?.setValue(null);
        }
      },
      error: (err) => console.error('Error fetching cities', err),
    });
  }

   private patchFormForEdit(): void {
    this.addCustomerForm.patchValue({
      id: this.data?.id ?? null,
      fullName: this.data?.fullName ?? '',
      phoneNumber: this.data?.phoneNumber ?? '',

      address: (this.data as any)?.address ?? (this.data as any)?.areaAddress ?? '',

      countryId: (this.data as any)?.country?.id ?? this.data?.countryId ?? null,
      cityId: (this.data as any)?.city?.id ?? this.data?.cityId ?? null,
    });

    const countryId = this.addCustomerForm.get('countryId')?.value;
    if (countryId) {
      this.loadCities(countryId);
    }
  }
  
  onSave(): void {
    if (this.addCustomerForm.invalid) {
      this.addCustomerForm.markAllAsTouched();
      this._snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = this.mapCustomerFormToPayload(
      this.addCustomerForm.getRawValue()
    );

    const action$ =
     this.isEdit && this.data?.id
  ? this.customerService.updateCustomer(String(this.data.id), payload)
  : this.customerService.createCustomer(payload);
  
    action$.subscribe({
      next: () => {
        this._snackBar.open(
          this.isEdit
            ? 'Customer updated successfully!'
            : 'Customer added successfully!',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this._snackBar.open(
          this.isEdit ? 'Failed to update customer' : 'Failed to add customer',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }
  private mapCustomerFormToPayload(
    form: any
  ): CreateOrUpdateCustomerPayload {
    return {
      fullName: form.fullName!.trim(),
      phoneNumber: form.phoneNumber!.trim(),
      address: form.address?.trim() ?? '',
      countryId: form.countryId!,
      cityId: form.cityId!,
    };
  }
}
