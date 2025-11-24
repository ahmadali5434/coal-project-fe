import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Environment } from 'ag-grid-community';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ApiResponse } from './buy-stock.dto';

export interface SinglePurchaseProgress {
  initialPurchase: boolean;
  addFreight: boolean;
  addGumrak: boolean;
  addCustom: boolean;
  complete: boolean;
}

export interface AllPurchasesProgress {
  initialPurchase: number;
  addFreight: number;
  addGumrak: number;
  addCustom: number;
  complete: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseProgressService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  // SIGNALS FOR STATE MANAGEMENT
  singlePurchaseProgress = signal<SinglePurchaseProgress | null>(null);
  allPurchasesProgress = signal<AllPurchasesProgress | null>(null);

  constructor(private http: HttpClient) {}

  /** 🔹 Get the progress of a single purchase */
  getSinglePurchaseProgress(purchaseId: number) {
    this.http
      .get<{ success: boolean; data: SinglePurchaseProgress }>(
        `${this.apiBaseUrl}/purchase-entries/purchase-progress/status/${purchaseId}`
      )
      .subscribe({
        next: (res) => this.singlePurchaseProgress.set(res.data),
        error: (err) => console.error('Error loading single progress', err),
      });
  }

  /** 🔹 Get step counts of all purchases */
  getAllPurchasesProgress(): Observable<Record<string, number>> {
    return this.http
      .get<ApiResponse<Record<string, number>>>(
        `${this.apiBaseUrl}/purchase-entries/purchase-progress/progress-count`
      )
      .pipe(map((res) => res.data ?? {}));
  }
}
