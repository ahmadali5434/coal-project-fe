import { inject, Injectable, signal } from '@angular/core';
import {
  CustomEntry,
  PurchaseFreight,
  PurchaseWithDetails,
  ApiResponse,
  GumrakEntry,
  PakCustomEntry,
} from './buy-stock.dto';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PurchaseApiResponse } from './buy-stock.api.dto';

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

  updateExchangeRate(
    purchaseId: number,
    type: 'purchase' | 'gumrak',
    rate: number
  ) {
    return this.http.patch(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/exchange-rate`,
      { type, exchangeRate:  rate }
    );
  }

  updatePurchase(purchaseId: string, formData: FormData) {
    return this.http.put<ApiResponse<PurchaseWithDetails>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}`,
      formData
    );
  }

  getPurchases(filters?: { status?: string }): Observable<PurchaseApiResponse[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const url = `${this.apiBaseUrl}/purchase-entries?${params.toString()}`;

    return this.http
      .get<ApiResponse<PurchaseApiResponse[]>>(url)
      .pipe(map((res) => res.data ?? []));
  }


  getPurchase(purchaseId: string): Observable<PurchaseApiResponse | null> {
    return this.http
      .get<ApiResponse<PurchaseApiResponse>>(
        `${this.apiBaseUrl}/purchase-entries/${purchaseId}`
      )
      .pipe(map((res) => res.data ?? null));
  }

  deletePurchase(purchaseId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}`
    );
  }

  // ----------------- PURCHASE COUNT -----------------

  getPurchaseCount(filters?: {
    warehouseId?: number;
    vendorId?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
  }): Observable<number> {
    const params = new URLSearchParams();

    if (filters?.warehouseId)
      params.append('warehouseId', filters.warehouseId.toString());
    if (filters?.vendorId)
      params.append('vendorId', filters.vendorId.toString());
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.status) params.append('status', filters.status);

    const url = `${
      this.apiBaseUrl
    }/purchase-entries/count?${params.toString()}`;

    return this.http
      .get<ApiResponse<{ count: number }>>(url)
      .pipe(map((res) => res.data?.count ?? 0));
  }

  getPurchaseCountByStatus(): Observable<Record<string, number>> {
    return this.http
      .get<ApiResponse<Record<string, number>>>(
        `${this.apiBaseUrl}/purchase-entries/purchase-progress/progress-count`
      )
      .pipe(map((res) => res.data ?? {}));
  }

  // ----------------- PURCHASE FREIGHT (1:1) -----------------

  getPurchaseFreight(purchaseId: string): Observable<PurchaseFreight | null> {
    return this.http
      .get<ApiResponse<PurchaseFreight>>(
        `${this.apiBaseUrl}/purchase-entries/${purchaseId}/freight`
      )
      .pipe(map((res) => res.data ?? null));
  }

  createPurchaseFreight(purchaseId: string, freightData: PurchaseFreight) {
    return this.http.post<ApiResponse<PurchaseFreight>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/freight`,
      freightData
    );
  }

  updatePurchaseFreight(purchaseId: string, freightData: PurchaseFreight) {
    return this.http.put<ApiResponse<PurchaseFreight>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/freight`,
      freightData
    );
  }

  deletePurchaseFreight(purchaseId: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/freight`
    );
  }

  // ----------------- GUMRAK ENTRY (1:1 with File Upload) -----------------

  /**
   * GET /purchase-entries/:purchaseId/gumrak
   * Retrieves the Gumrak entry for a specific purchase.
   */
  getGumrakEntry(purchaseId: string): Observable<GumrakEntry | null> {
    return this.http
      .get<ApiResponse<GumrakEntry>>(
        `${this.apiBaseUrl}/purchase-entries/${purchaseId}/gumrak`
      )
      .pipe(map((res) => res.data ?? null));
  }

  /**
   * POST /purchase-entries/:purchaseId/gumrak
   * Creates a new Gumrak entry. Requires FormData because of the potential 'gumrakImage' file.
   *
   * @param purchaseId The ID of the parent purchase entry.
   * @param gumrakData A FormData object containing the fields and the 'gumrakImage' file.
   */
  createGumrakEntry(purchaseId: string, gumrakData: FormData) {
    return this.http.post<ApiResponse<GumrakEntry>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/gumrak`,
      gumrakData
    );
  }

  /**
   * PUT /purchase-entries/:purchaseId/gumrak
   * Updates an existing Gumrak entry. Requires FormData because of the potential 'gumrakImage' file.
   *
   * @param purchaseId The ID of the parent purchase entry.
   * @param gumrakData A FormData object containing the fields and the optional new 'gumrakImage' file.
   */
  updateGumrakEntry(purchaseId: string, gumrakData: FormData) {
    return this.http.put<ApiResponse<GumrakEntry>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/gumrak`,
      gumrakData
    );
  }

  /**
   * DELETE /purchase-entries/:purchaseId/gumrak
   * Deletes the Gumrak entry for a specific purchase.
   */
  deleteGumrakEntry(purchaseId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/gumrak`
    );
  }

  getCustomEntry(purchaseId: string): Observable<PakCustomEntry | null> {
    return this.http
      .get<ApiResponse<PakCustomEntry>>(
        `${this.apiBaseUrl}/purchase-entries/${purchaseId}/custom`
      )
      .pipe(map(res => res.data ?? null));
  }

  createCustomEntry(payload: PakCustomEntry) {
    return this.http.post<ApiResponse<PakCustomEntry>>(
      `${this.apiBaseUrl}/custom-entries`,
      payload
    );
  }

  updateCustomEntry(purchaseId: string, payload: PakCustomEntry) {
    return this.http.put<ApiResponse<PakCustomEntry>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/custom`,
      payload
    );
  }

  deleteCustomEntry(purchaseId: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiBaseUrl}/purchase-entries/${purchaseId}/custom`
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

}
