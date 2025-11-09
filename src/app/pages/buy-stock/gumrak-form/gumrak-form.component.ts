// #region Angular Core & Forms
import { Component, OnInit, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
// #endregion

// #region Angular Material
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
// #endregion

// #region Services & DTOs
import { BuyStockService } from '../data-access/buy-stock.service';
import { GumrakEntry } from '../data-access/buy-stock.dto';
import { toFormData } from '../../../shared/utils/form-utils';
// #endregion

@Component({
  selector: 'app-gumrak-form',
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
    MatIcon,
    MatCard,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './gumrak-form.component.html',
})
export class GumrakFormComponent implements OnInit {
  // #region Injections
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<GumrakFormComponent>);
  private readonly buyStockService = inject(BuyStockService);
  private readonly _snackBar = inject(MatSnackBar);
  // #endregion

  // #region Form
  gumrakForm = new FormGroup({
    truckNo: new FormControl({ value: '', disabled: true }),
    driverName: new FormControl({ value: '', disabled: true }),
    metricTon: new FormControl({ value: 0, disabled: true }),
    islamicDate: new FormControl('', Validators.required),
    englishDate: new FormControl('', Validators.required),
    invoice: new FormControl('', Validators.required),
    spendAfg: new FormControl('', Validators.required),
    product: new FormControl('', Validators.required),
    shTax: new FormControl('', Validators.required),
    totalAmount: new FormControl('', Validators.required),
    gumrakImage: new FormControl<File | null>(null),
  });
  // #endregion

  // #region State
  selectedImage: string | null = null;
  selectedFile: File | null = null;
  // #endregion

  // #region Lifecycle
  ngOnInit(): void {
    const purchase = this.data?.purchaseData;
    console.log('Purchase Data:', purchase);
    const gumrakData = purchase?.gumrakEntry;

    if (!gumrakData) {
      this.gumrakForm.patchValue({
        truckNo: purchase?.truckNo ?? '',
        driverName: purchase?.driver?.name ?? '',
        metricTon: purchase?.metricTon ?? 0,
      });
    } else {
      
    }

    this.gumrakForm.patchValue({
      truckNo: purchase?.truckNo ?? '',
      driverName: gumrakData ? purchase?.driver?.name : purchase?.driverName ?? '',
      metricTon: purchase?.metricTon ?? 0,
      islamicDate: gumrakData?.islamicDate ?? '',
      englishDate: gumrakData?.englishDate ?? '',
      invoice: gumrakData?.invoice ?? '',
      spendAfg: gumrakData?.spendAfg ?? '',
      product: gumrakData?.product ?? '',
      shTax: gumrakData?.shTax ?? '',
      totalAmount: gumrakData?.totalAmount ?? '',
    });

    if (gumrakData?.gumrakImage) {
      this.convertToFile(gumrakData.gumrakImage, 'gumrak.jpg').then((file) => {
        this.gumrakForm.get('gumrakImage')?.setValue(file);
        this.previewFile(file);
      });
    }
  }
  // #endregion

  // #region Save
  onSave(): void {
    if (this.gumrakForm.invalid) {
      this.gumrakForm.markAllAsTouched();
      this._snackBar.open('Please fill all required fields', undefined, {
        duration: 3000,
      });
      return;
    }
  
    const formValue = this.gumrakForm.getRawValue();
  
    // ✅ Build payload cleanly
    const payload: Partial<GumrakEntry> = {
      islamicDate: formValue.islamicDate ? new Date(formValue.islamicDate).toISOString() : '',
      englishDate: formValue.englishDate ? new Date(formValue.englishDate).toISOString() : '',
      invoice: formValue.invoice ?? '',
      spendAfg: formValue.spendAfg ?? '',
      product: formValue.product ?? '',
      shTax: formValue.shTax ?? '',
      totalAmount: formValue.totalAmount ?? '',
    };
  
    // ✅ Only include gumrakImage if user actually selected a file
    if (this.selectedFile) {
      payload.gumrakImage = this.selectedFile;
    }
  
    const formData = toFormData(payload);
    const gumrakId = this.data?.purchaseData?.gumrakEntry?.id;
  
    gumrakId
      ? this.updateGumrakData(formData)
      : this.saveNewGumrakData(formData);
  }
  

  private saveNewGumrakData(formData: FormData) {
    const purchaseId = this.data?.purchaseData?.id;
    this.buyStockService.createGumrakEntry(purchaseId, formData).subscribe({
      next: (res) => {
        this._snackBar.open('Gumrak entry saved!', undefined, { duration: 3000 });
        this.resetForm();
        this.dialogRef.close();
        //this.dialogRef.close(res.id);
      },
      error: () => {
        this._snackBar.open('Error saving Gumrak entry.', undefined, {
          duration: 3000,
        });
      },
    });
  }

  private updateGumrakData(formData: FormData) {
    const purchaseId = this.data?.purchaseData?.id;
    this.buyStockService.updateGumrakEntry(purchaseId, formData).subscribe({
      next: (res) => {
        this._snackBar.open('Gumrak entry updated!', undefined, { duration: 3000 });
        this.resetForm();
        this.dialogRef.close(res);
        //this.dialogRef.close(res.id);
      },
      error: () => {
        this._snackBar.open('Error updating Gumrak entry.', undefined, {
          duration: 3000,
        });
      },
    });
  }
  // #endregion

  // #region File Handling
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.gumrakForm.get('gumrakImage')?.setValue(file);
      this.previewFile(file);
    }
  }

  clearImage(event: Event): void {
    event.stopPropagation();
    this.selectedImage = null;
    this.selectedFile = null;
    this.gumrakForm.get('gumrakImage')?.reset();
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

  // #region Helpers
  private resetForm() {
    this.gumrakForm.reset();
    this.selectedImage = null;
    this.selectedFile = null;
  }
  // #endregion
}
