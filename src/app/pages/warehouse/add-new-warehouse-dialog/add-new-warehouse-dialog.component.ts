import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { LocationService } from '../../../shared/services/location.service';
import { City, Country } from '../../../shared/model';
import { Warehouse } from '../../buy-stock/data-access/buy-stock.dto';

@Component({
  selector: 'app-add-new-warehouse-dialog',
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
  ],
  templateUrl: './add-new-warehouse-dialog.component.html',
})
export class AddNewWarehouseDialogComponent implements OnInit {
   warehouseForm!: FormGroup;
    isEditMode = false;
 
  locationService = inject(LocationService);
countries: Country[] = [];
  citiesByCountry: City[] = [];
 
constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddNewWarehouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: (Warehouse & { isEdit?: boolean }) | null
  ) {}

  ngOnInit() {
        this.isEditMode = !!this.data;

         this.warehouseForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      countryId: [this.data?.countryId || '', Validators.required],
      cityId: [this.data?.cityId || '', Validators.required],
      warehouseLocation: ['',Validators.required,],
    });

    this.locationService.getCountries().subscribe({
      next: (countries) => {  this.countries = countries ;
           if (this.isEditMode) {
          this.patchFormForEdit();
        }
      },
      error: (err) => console.error('Error fetching countries', err),
    });
   
    //this.citiesByCountry = this.locationService.getCitiesByCountry();
   this.warehouseForm.get('countryId')?.valueChanges.subscribe((countryId) => {
      if (!countryId) {
        this.citiesByCountry = [];
        this.warehouseForm.get('cityId')?.setValue(null);
        return;
      }
this.loadCities(countryId);

  });
  }
  private patchFormForEdit(): void {
    this.warehouseForm.patchValue({
      name: this.data?.name ?? '',
      warehouseLocation: this.data?.warehouseLocation ?? '',
      countryId: this.data?.country?.id ?? String(this.data?.countryId ?? ''), 
      cityId: this.data?.city?.id ?? String(this.data?.cityId ?? ''),
    });

    const countryId = this.warehouseForm.get('countryId')?.value;
    if (countryId) {
      this.loadCities(countryId);
    }
  }

  private loadCities(countryId: string, selectedCityId?: string) {
    this.locationService.getCitiesByCountry(countryId).subscribe({
      next: (cities) => {
        this.citiesByCountry = cities;
        if (this.isEditMode) {
          const cityId = this.warehouseForm.get('cityId')?.value;
          if (!cities.some((c) => String(c.id) === String(cityId))) {
            this.warehouseForm.get('cityId')?.setValue(null);
          }
        }

        if (selectedCityId) {
          this.warehouseForm.get('cityId')?.setValue(selectedCityId);
        }
      },
      error: (err) => console.error('Error fetching cities', err),
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveWarehouse() {
  if (this.warehouseForm.valid) {
    const formData = this.warehouseForm.value;

    const payload = {
      name: formData.name!,
      countryId: formData.countryId!,  
      cityId: formData.cityId!,        
      warehouseLocation: formData.warehouseLocation || '',
    };

    this.dialogRef.close(payload);  
  } else {
    this.warehouseForm.markAllAsTouched();
  }
}

}


