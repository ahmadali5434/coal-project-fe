import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExchangeRate } from '../buy-stock/data-access/buy-stock.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  createExchangeRate(payload: ExchangeRate): Observable<ExchangeRate> {
    return this.http.post<ExchangeRate>(`${this.apiBaseUrl}/exchange-rates`, payload);
  }

  updateExchangeRate(id: number, payload: ExchangeRate): Observable<ExchangeRate> {
    return this.http.put<ExchangeRate>(`${this.apiBaseUrl}/exchange-rates/${id}`, payload);
  }

  getExchangeRate(id: number) {
    return this.http.get<ExchangeRate>(`${this.apiBaseUrl}/exchange-rates/${id}`);
  }
}
