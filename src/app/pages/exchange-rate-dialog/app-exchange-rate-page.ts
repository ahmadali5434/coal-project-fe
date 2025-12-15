import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExchangeRateDialogComponent } from '../exchange-rate-dialog/exchange-rate-dialog.component';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-exchange-rate-page',
  templateUrl: './exchange-rate-page.component.html',
  imports: [MatIcon],
})
export class ExchangeRatePageComponent {
  private readonly dialog = inject(MatDialog);

  openExchangeDialog(exchangeRate?: any): void {
    this.dialog.open(ExchangeRateDialogComponent, {
      width: '800px',
      data: {
        exchangeRate, 
      },
    });
  }
}
