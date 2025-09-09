import { inject, Injectable, signal } from '@angular/core';
import {
  CustomEntry,
  FullPurchaseEntry,
  PurchaseRate,
} from './buy-stock.dto';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from './api-response.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuyStockService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  
  private purchaseEntries: FullPurchaseEntry[] = [];

  savePartialPurchase(formData: FormData) {
    return this.http.post<ApiResponse<FullPurchaseEntry>>(
      `${this.apiBaseUrl}/purchase-entries`,
      formData
    );
  }

  updatePartialPurchaseById(purchaseId: string, formData: FormData) {
    return this.http.put<ApiResponse<FullPurchaseEntry>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}`,
      formData
    );
  }

  attachRateToPurchase(purchaseId: string, rate: PurchaseRate) {
    return this.http.post<ApiResponse<FullPurchaseEntry>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/rates`,
      rate
    );
  }

  getAllPurchases(): Observable<FullPurchaseEntry[]> {
    return this.http
      .get<ApiResponse<FullPurchaseEntry[]>>(`${this.apiBaseUrl}/purchase-entries`)
      .pipe(map((res) => res.data ?? []));
  }

  getFullPurchaseDataById(purchaseId: string): Observable<FullPurchaseEntry[]> {
    return this.http
      .get<ApiResponse<FullPurchaseEntry[]>>(`${this.apiBaseUrl}/purchase-entries`, { params: { purchaseId } })
      .pipe(map((res) => res.data ?? []));
  }

  getPurchaseById(purchaseId: string): Observable<FullPurchaseEntry[]> {
    return this.http
      .get<ApiResponse<FullPurchaseEntry[]>>(`${this.apiBaseUrl}/purchase-entries`,
        { params: { purchaseId } }
      ).pipe(map((res) => res.data ?? ''));
  }

  deletePurchaseById(purchaseId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiBaseUrl}/purchase-entries/${purchaseId}`);
  }

  getRateById(purchaseId: string, rateId: string): Observable<PurchaseRate[]> {
    return this.http
      .get<ApiResponse<PurchaseRate[]>>(`${this.apiBaseUrl}/purchase-entries/${purchaseId}/rates/${rateId}`,
        { params: { rateId } }
      ).pipe(map((res) => res.data ?? ''));
  }

  getCompletedPurchases(): FullPurchaseEntry[] {
    return this.purchaseEntries.filter((e) => e.status === 'complete');
  }

  getIncompletePurchases(): FullPurchaseEntry[] {
    return this.purchaseEntries.filter((e) => e.status === 'partial');
  }

  afghanGumrakData = signal<CustomEntry | null>(null);
  pakCustomData = signal<CustomEntry | null>(null);

  saveAfghanGumrakData(data: CustomEntry) {
    this.afghanGumrakData.set(data);
  }

  savePakCustomData(data: CustomEntry) {
    this.pakCustomData.set(data);
  }
}
