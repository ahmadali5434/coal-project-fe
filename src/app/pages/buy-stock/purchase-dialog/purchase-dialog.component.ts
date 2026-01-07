// #region Angular Core & Forms
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
// #endregion

// #region Angular Material
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
// #endregion

// #region Services & Components
import { WarehouseService } from '../../warehouse/data-access/warehouse.service';
import { AddNewCustomerDialogComponent } from '../add-new-customer-dialog/add-new-customer-dialog.component';
import { BuyStockService } from '../data-access/buy-stock.service';
import {
  Customer,
  Driver,
  Purchase,
  Warehouse,
} from '../data-access/buy-stock.dto';
import { CustomerService } from '../data-access/customer.service';
import { AddNewDriverDialogComponent } from '../add-new-driver-dialog/add-new-driver-dialog.component';
import { DriverService } from '../data-access/driver.service';
import { toFormData } from '../../../shared/utils/form-utils';
import { toDateOnly } from '../../../shared/utils/toDateOnly';
// #endregion

@Component({
  selector: 'app-purchase-dialog',
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatIcon,
    MatCard,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './purchase-dialog.component.html',
})
export class PurchaseDialogComponent implements OnInit {
  readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PurchaseDialogComponent>);

  // #region Inputs
  @Input() purchaseData: Purchase | null = null;
  // #endregion

  // #region Services
  private readonly buyStockService = inject(BuyStockService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly customerService = inject(CustomerService);
  private readonly driverService = inject(DriverService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  // #endregion

  // #region Data Sources
  warehouses: Warehouse[] = [];
  customerList = signal<Customer[]>([]);
  drivers = signal<Driver[]>([]);
  isEdit = false; // remove it later on
  // #endregion

  // #region Form
  purchaseForm = new FormGroup({
    purchaseDate: new FormControl('', Validators.required),
    customerId: new FormControl('', Validators.required),
    placeOfPurchaseId: new FormControl('', Validators.required),
    stockDestinationId: new FormControl('', Validators.required),
    truckNo: new FormControl('', Validators.required),
    driverId: new FormControl('', Validators.required),
    metricTon: new FormControl<number | null>(null, Validators.required),
    builtyImage: new FormControl<File | null>(null),
    coalType: new FormControl<string | null>(null),
    ratePerTon: new FormControl<number | null>(null),
    totalPurchaseAmount: new FormControl<number | null>(null),
  });
  // #endregion

  // #region State
  selectedImage: string | null = null;
  selectedFile: File | null = null;
  // #endregion

  // #region Lifecycle
  ngOnInit(): void {
    this.loadCustomers();
    this.loadDrivers();
    this.warehouseService.fetchAllWarehousesDetail().subscribe({
      next: (res) => {
        this.warehouses = res.data;
      },
    });
    this.purchaseData = this.data?.purchaseData ?? null;
    if (this.purchaseData) {
      this.patchFormData(this.purchaseData);
      this.isEdit = true;
    }
    this.calculateTotalPurchase();
  }
  // #endregion

  // #region Form Helpers
  private patchFormData(data: Purchase) {
    const { builtyImage, ...rest } = data;
    this.purchaseForm.patchValue({
      ...rest,
      coalType: data.coalType ?? '',
      ratePerTon: data.ratePerTon ?? null,
      totalPurchaseAmount: data.totalPurchaseAmount ?? null,
    });

    if (builtyImage) {
      this.convertToFile(builtyImage, 'builty.jpg').then((file) => {
        this.purchaseForm.get('builtyImage')?.setValue(file);
        this.previewFile(file);
      });
    }
  }

  private resetForm() {
    this.purchaseForm.reset();
    this.selectedImage = null;
    this.selectedFile = null;
  }

  private loadCustomers() {
    this.customerService.fetchAllCustomers().subscribe({
      next: (customers) => this.customerList.set(customers),
    });
  }

  private loadDrivers() {
    this.driverService.fetchAllDrivers().subscribe({
      next: (drivers) => this.drivers.set(drivers),
    });
  }
  // #endregion

  // #region Save
  onSave() {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      this._snackBar.open('Please fill the form', undefined, {
        duration: 3000,
      });
      return;
    }

    const formValue = this.purchaseForm.getRawValue();
    const payload = {
      ...formValue,
      purchaseDate: formValue.purchaseDate
        ? toDateOnly(formValue.purchaseDate)
        : null,
      coalType: formValue.coalType ?? '',
      ratePerTon: formValue.ratePerTon ?? 0,
      totalPurchaseAmount: formValue.totalPurchaseAmount ?? 0,
    };
    const formData = toFormData(payload);
    const purchaseId = this.purchaseData?.id;
    purchaseId
      ? this.updatePurchaseById(purchaseId, formData)
      : this.saveNewPurchase(formData);
  }

  private saveNewPurchase(formData: FormData) {
    this.buyStockService.createPurchase(formData).subscribe({
      next: (res: any) => {
        this._snackBar.open('Purchase saved!', undefined, { duration: 3000 });
        this.resetForm();
        this.dialogRef.close(res.id);
      },
      error: (err) => {
        this._snackBar.open(
          'Error saving purchase. Please try again.',
          undefined,
          { duration: 3000 }
        );
      },
    });
  }

  private updatePurchaseById(id: string, formData: FormData) {
    this.buyStockService.updatePurchase(id, formData).subscribe({
      next: (res: any) => {
        this._snackBar.open('Purchase saved!', undefined, { duration: 3000 });
        this.resetForm();
        this.dialogRef.close(res.id);
      },
      error: (err) => {
        this._snackBar.open(
          'Error saving purchase. Please try again.',
          undefined,
          { duration: 3000 }
        );
      },
    });
  }

  private calculateTotalPurchase() {
    this.purchaseForm.valueChanges.subscribe(val => {
      const metricTon = Number(val.metricTon) || 0;
      const ratePerTon = Number(val.ratePerTon) || 0;
  
      const total = metricTon * ratePerTon;
  
      this.purchaseForm.get('totalPurchaseAmount')?.setValue(total, { emitEvent: false });
    });
  }
  // #endregion

  // #region File Handling
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.purchaseForm.get('builtyImage')?.setValue(file);
      this.previewFile(file);
    }
  }

  clearImage(event: Event): void {
    event.stopPropagation();
    this.selectedImage = null;
    this.selectedFile = null;
    this.purchaseForm.get('builtyImage')?.reset();
  }

  private previewFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.selectedImage = reader.result as string);
    reader.readAsDataURL(file);
  }

  private async convertToFile(url: string, fileName: string): Promise<File> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  }
  // #endregion

  // #region Dialogs
  openNewCustomerDialog() {
    this.dialog
      .open(AddNewCustomerDialogComponent, {
        panelClass: 'dialog-container-lg',
      })
      .afterClosed()
      .subscribe((customer) => {
        if (customer) this.loadCustomers();
      });
  }

  openNewDriverDialog() {
    this.dialog
      .open(AddNewDriverDialogComponent, { panelClass: 'dialog-container-lg' })
      .afterClosed()
      .subscribe((driver) => {
        if (driver) this.loadDrivers();
      });
  }
  // #endregion
}
