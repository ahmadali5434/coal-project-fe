import { inject, Injectable, signal } from '@angular/core';
import {
  CustomEntry,
  PurchaseRate,
  PurchaseWithDetails,
} from './buy-stock.dto';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from './buy-stock.dto'; // using the unified ApiResponse<T>
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuyStockService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  private purchaseEntries: PurchaseWithDetails[] = [];

  // ----------------- PURCHASE ENTRIES -----------------

  createPurchase(formData: FormData) {
    return this.http.post<ApiResponse<PurchaseWithDetails>>(
      `${this.apiBaseUrl}/purchase-entries`,
      formData
    );
  }

  updatePurchase(purchaseId: string, formData: FormData) {
    return this.http.put<ApiResponse<PurchaseWithDetails>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}`,
      formData
    );
  }

  getPurchases(): Observable<PurchaseWithDetails[]> {
    return this.http
      .get<ApiResponse<PurchaseWithDetails[]>>(
        `${this.apiBaseUrl}/purchase-entries`
      )
      .pipe(map((res) => res.data ?? []));
  }

  getPurchase(purchaseId: string): Observable<PurchaseWithDetails | null> {
    return this.http
      .get<ApiResponse<PurchaseWithDetails>>(
        `${this.apiBaseUrl}/purchase-entries/${purchaseId}`
      )
      .pipe(map((res) => res.data ?? null));
  }

  deletePurchase(purchaseId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}`
    );
  }

  // ----------------- PURCHASE RATE (1:1) -----------------

  getPurchaseRate(purchaseId: string): Observable<PurchaseRate | null> {
    return this.http
      .get<ApiResponse<PurchaseRate>>(
        `${this.apiBaseUrl}/purchase-entries/${purchaseId}/rate`
      )
      .pipe(map((res) => res.data ?? null));
  }

  createPurchaseRate(purchaseId: string, rateData: PurchaseRate) {
    return this.http.post<ApiResponse<PurchaseRate>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/rate`,
      rateData
    );
  }

  updatePurchaseRate(purchaseId: string, rateData: PurchaseRate) {
    return this.http.put<ApiResponse<PurchaseRate>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/rate`,
      rateData
    );
  }

  deletePurchaseRate(purchaseId: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/rate`
    );
  }

  // ----------------- HELPERS -----------------

  getCompletedPurchases(): PurchaseWithDetails[] {
    return this.purchaseEntries.filter((e) => e.status === 'complete');
  }

  getIncompletePurchases(): PurchaseWithDetails[] {
    return this.purchaseEntries.filter((e) => e.status === 'initial_purchase');
  }

  // ----------------- CUSTOM ENTRIES -----------------

  afghanGumrakData = signal<CustomEntry | null>(null);
  pakCustomData = signal<CustomEntry | null>(null);

  setAfghanGumrakData(data: CustomEntry) {
    this.afghanGumrakData.set(data);
  }

  setPakCustomData(data: CustomEntry) {
    this.pakCustomData.set(data);
  }
}
