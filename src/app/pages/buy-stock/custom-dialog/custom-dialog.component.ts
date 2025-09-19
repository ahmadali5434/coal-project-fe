import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { BuyStockService } from '../data-access/buy-stock.service';
import { CustomEntry } from '../data-access/buy-stock.dto';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-dialog',
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatIcon,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
],
  templateUrl: './custom-dialog.component.html',
})
export class CustomDialogComponent implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CustomDialogComponent>);
  private readonly buyStockService = inject(BuyStockService);
  private readonly _snackBar = inject(MatSnackBar);

  type: 'afghan' | 'pakistan' = 'afghan';
  customForm = new FormGroup({
    paymentDate: new FormControl(''),
    customAmount: new FormControl(''),
    customImage: new FormControl<File | null>(null),
  });

  selectedImage: string | null = null;
  selectedFile: File | null = null;

  ngOnInit() {
    this.type = this.data.type;
  }

  onSave() {
    if (this.customForm.valid) {
      const form = this.customForm.value;
      let imageURL = '';

      if (this.selectedImage) {
        imageURL = this.selectedImage;
      }

      const entry: CustomEntry = {
        paymentDate: form.paymentDate ?? '',
        customAmount: Number(form.customAmount ?? 0),
        customImage: this.selectedImage ?? '',
      };

      if (this.type === 'afghan') {
        //this.buyStockService.saveAfghanGumrakData(entry); 
        this._snackBar.open('Gumrak Record added successfully!', undefined, { duration: 3000 });
      } else {
        //this.buyStockService.savePakCustomData(entry);
        this._snackBar.open('Custom Record added successfully!', undefined, { duration: 3000 });
      }

      this.customForm.reset();
      this.selectedImage = null;
      this.selectedFile = null;
      this.dialogRef.close();
    } else {
      this.customForm.markAllAsTouched();
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.customForm.get('customImage')?.setValue(file);
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(event: Event): void {
    event.stopPropagation();
    this.selectedImage = null;
    this.selectedFile = null;
    this.customForm.get('customImage')?.reset();
  }
}

