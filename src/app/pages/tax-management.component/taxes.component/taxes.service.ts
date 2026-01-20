import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tax } from '../../buy-stock/data-access/buy-stock.dto';

@Injectable({ providedIn: 'root' })
export class TaxService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/taxes';

  fetchAllTaxes(): Observable<Tax[]> {
    return this.http.get<Tax[]>(this.baseUrl);
  }

  createTax(payload: Partial<Tax>): Observable<Tax> {
    return this.http.post<Tax>(this.baseUrl, payload);
  }

  updateTax(id: number, payload: Partial<Tax>): Observable<Tax> {
    return this.http.put<Tax>(`${this.baseUrl}/${id}`, payload);
  }

  deleteTax(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
