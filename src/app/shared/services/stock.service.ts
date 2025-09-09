import { Injectable, signal } from '@angular/core';

export interface PurchaseDetail {
  id: number;
  purchaseDate: string;
  customerName: string;
  placeOfPurchaseName: string;
  stockDestinationName: string;
  truckNo: string;
  driverName: string;
  metricTon: string;
  builtyImage?: string;
  status: string;
  freightPerTon: string;
  expense: string;
  advancePayment: string;
  amountAFN: string;
  exchangeRate: string;
  amountPKR: string;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  // Get readonly access to the signal
  // Replace the full array
  // Delete by sno
}
