import { Customer } from './buy-stock.dto';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ApiResponse,
  CreateOrUpdateCustomerPayload,
} from './buy-stock.dto';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  readonly customers = signal<Customer[]>([]);

  fetchCustomerById(id: number): Observable<Customer> {
    return this.http.get<ApiResponse<Customer>>(`${this.apiBaseUrl}/customers/${id}`)
      .pipe(map(res => res?.data));
  }

  fetchAllCustomers(): Observable<Customer[]> {
    return this.http
      .get<ApiResponse<Customer[]>>(`${this.apiBaseUrl}/customers`)
      .pipe(
        map((res) => res?.data ?? []),
        catchError((err) => {
          console.error('Error fetching customers', err);
          return of([]);
        })
      );
  }
  createCustomer(payload: CreateOrUpdateCustomerPayload): Observable<Customer> {
    return this.http
      .post<ApiResponse<Customer>>(`${this.apiBaseUrl}/customers`, payload)
      .pipe(map((res) => res.data));
  }


  
  
 updateCustomer(id: string, payload: CreateOrUpdateCustomerPayload): Observable<Customer> {
    return this.http
      .put<ApiResponse<Customer>>(`${this.apiBaseUrl}/customers/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.apiBaseUrl}/customers/${id}`)
      .pipe(map(() => void 0));
  }
}