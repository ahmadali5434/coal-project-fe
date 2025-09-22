import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Country } from '../../../shared/model';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private apiUrl = `${environment.apiBaseUrl}/locations/countries`;

  constructor(private http: HttpClient) {}

  fetchAllCountries(): Observable<Country[]> {
    return this.http.get<{ success: boolean; data: Country[] }>(this.apiUrl)
      .pipe(map(res => res.data));
  }
  createCountry(payload: { name: string; code: string }): Observable<Country> {
    return this.http.post<{ success: boolean; data: Country }>(this.apiUrl, payload).pipe(map(res => res.data));
  }
   updateCountry(id: number, payload: { name: string; code: string }): Observable<Country> {
    return this.http.put<{ success: boolean; data: Country }>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  deleteCountry(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.success));
  }
}
