import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { BuyStockService } from '../../../buy-stock/data-access/buy-stock.service';
import { PakCustomEntry, ApiResponse, Driver } from '../../../buy-stock/data-access/buy-stock.dto';
import { DriverService } from '../../../buy-stock/data-access/driver.service';
import { AddNewDriverDialogComponent } from '../../../buy-stock/add-new-driver-dialog/add-new-driver-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-custom-form',
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDividerModule,
    MatIcon,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './custom-entry-dialog.component.html',
})
export class CustomEntryDialogComponent implements OnInit {
  private readonly _snackBar = inject(MatSnackBar);
  private readonly buyStockService = inject(BuyStockService);
  private readonly driverService = inject(DriverService);
  private readonly dialog = inject(MatDialog);

  form!: FormGroup;
  isEdit = false;
  drivers = signal<Driver[]>([]);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.isEdit = !!this.data?.customEntry;

    this.form = this.fb.group({
      gdNumber: ['', Validators.required],
      gdDate: ['', Validators.required],
      importerType: ['', Validators.required],
      month: ['', Validators.required],
      head: ['', Validators.required],
      grossWeight: [0, Validators.required],
      netWeight: [0, Validators.required],
      currency: ['', Validators.required],
      hsCode: ['', Validators.required],
      exchangeRate: [0, Validators.required],
      importValue: [0, Validators.required],
      //psidAmount: [0],
      packages: [0],
      //stockOut: [0],
      //stockBalance: [{ value: 0, disabled: true }],
      //sales: [0],
      //balance: [{ value: 0, disabled: true }],
      //taxPerVehicle: [{ value: 0, disabled: true }],
      //driverIds: [[], Validators.required],
    });
    this.loadDrivers();
    if (this.isEdit) {
      this.form.patchValue(this.data.customEntry);
    }

    this.calculateFields();
  }

  private loadDrivers() {
    this.driverService.fetchAllDrivers().subscribe({
      next: (drivers) => this.drivers.set(drivers),
    });
  }

  openNewDriverDialog() {
    this.dialog
      .open(AddNewDriverDialogComponent, {
        panelClass: 'dialog-container-lg',
      })
      .afterClosed()
      .subscribe((driver) => {
        if (driver) this.loadDrivers();
      });
  }

  private calculateFields() {
    this.form.valueChanges.subscribe((val) => {
      const netWeight = Number(val.netWeight) || 0;
      //const stockOut = Number(val.stockOut) || 0;
      //const sales = Number(val.sales) || 0;
      const importValue = Number(val.importValue) || 0;
      const exchangeRate = Number(val.exchangeRate) || 0;

      //const stockBalance = netWeight - stockOut;
      //const balance = stockBalance - sales;
      //const taxPerVehicle = importValue * exchangeRate;

      // this.form.patchValue(
      //   { stockBalance, balance, taxPerVehicle },
      //   { emitEvent: false }
      // );
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._snackBar.open('Please fill all required fields', undefined, {
        duration: 3000,
      });
      return;
    }

    const payload: PakCustomEntry = this.form.getRawValue();
    const purchaseId = this.data?.purchase?.id as string;
    const customId = this.data?.customEntry?.id;

    customId
      ? this.updateCustomData(purchaseId, payload)
      : this.saveNewCustomData(payload);
  }

  private saveNewCustomData(payload: PakCustomEntry) {
    this.buyStockService.createCustomEntry(payload).subscribe({
      next: (res: ApiResponse<PakCustomEntry>) => {
        this._snackBar.open('Custom entry saved!', undefined, {
          duration: 3000,
        });
        this.resetForm();
        this.dialogRef.close(res.data);
      },
      error: () => {
        this._snackBar.open('Error saving Custom entry.', undefined, {
          duration: 3000,
        });
      },
    });
  }

  private updateCustomData(purchaseId: string, payload: PakCustomEntry) {
    this.buyStockService.updateCustomEntry(purchaseId, payload).subscribe({
      next: (res: ApiResponse<PakCustomEntry>) => {
        this._snackBar.open('Custom entry updated!', undefined, {
          duration: 3000,
        });
        this.resetForm();
        this.dialogRef.close(res.data);
      },
      error: () => {
        this._snackBar.open('Error updating Custom entry.', undefined, {
          duration: 3000,
        });
      },
    });
  }

  private resetForm() {
    this.form.reset();
  }

  onCancel() {
    this.dialogRef.close();
  }
}
