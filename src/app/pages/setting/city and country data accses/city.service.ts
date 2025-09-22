import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { City } from '../../../shared/model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CityService {
  private apiUrl = `${environment.apiBaseUrl}/locations/cities`;

  constructor(private http: HttpClient) {}

  createCity(payload: { name: string; countryId: number }): Observable<City> {
    return this.http.post<{ success: boolean; data: City }>(this.apiUrl, payload)
      .pipe(map(res => res.data));
  }

  fetchCitiesByCountry(countryId: number): Observable<City[]> {
    return this.http
      .get<{ success: boolean; data: City[] }>(
        `${this.apiUrl}?countryId=${countryId}`
      )
      .pipe(map((res) => res.data));
  }

  updateCity(id: number, payload: { name: string; countryId: number }): Observable<City> {
    return this.http.put<{ success: boolean; data: City }>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  deleteCity(id: number): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(map(() => void 0));
  }
}
