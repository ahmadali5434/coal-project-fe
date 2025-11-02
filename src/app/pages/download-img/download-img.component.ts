import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-download-img',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './download-img.component.html',

})
export class DownloadImgComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; fileName?: string },
    private dialogRef: MatDialogRef<DownloadImgComponent>
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
  async downloadImage() {
    try {
      const response = await fetch(this.data.imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const mime = blob.type || '';
      let extension = '';
      if (mime) {
        const m = mime.split('/')[1];
        if (m) extension = '.' + m.split(';')[0];
      }

      const fileName = (this.data.fileName || 'download-img') + extension;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
    }
  }
}
