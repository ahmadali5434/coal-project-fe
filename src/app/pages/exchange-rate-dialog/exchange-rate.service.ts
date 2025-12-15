import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExchangeRate } from '../buy-stock/data-access/buy-stock.dto';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private base = '/api/exchange-rates'; 

  constructor(private http: HttpClient) {}

  createExchangeRate(payload: ExchangeRate): Observable<ExchangeRate> {
    return this.http.post<ExchangeRate>(`${this.base}`, payload);
  }

  updateExchangeRate(id: number, payload: ExchangeRate): Observable<ExchangeRate> {
    return this.http.put<ExchangeRate>(`${this.base}/${id}`, payload);
  }

  getExchangeRate(id: number) {
    return this.http.get<ExchangeRate>(`${this.base}/${id}`);
  }
}
