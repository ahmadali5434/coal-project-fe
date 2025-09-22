import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { Country ,City } from '../model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  constructor() {}

  getCountries(): Observable<Country[]> {
    return this.http
      .get<{ success: boolean; data: any[] }>(
        `${this.apiBaseUrl}/locations/countries`
      )
      .pipe(
        map((res) =>
          res.success
            ? res.data.map((country) => ({
                id: country.id,
                name: country.name,
                code: country.code,
              }))
            : []
        ),
        catchError((error: any) => {
          console.error('API Error fetching countries', error);
          return of([]); // return empty list if error
        })
      );
  }
createCountry(payload: { name: string; code: string }): Observable<Country> {
    return this.http
      .post<{ success: boolean; data: Country }>(
        `${this.apiBaseUrl}/locations/countries`,
        payload
      )
      .pipe(map((res) => res.data));
  }

  updateCountry(
    id: number,
    payload: { name: string; code: string }
  ): Observable<Country> {
    return this.http
      .put<{ success: boolean; data: Country }>(
        `${this.apiBaseUrl}/locations/countries/${id}`,
        payload
      )
      .pipe(map((res) => res.data));
  }

  deleteCountry(id: number): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(
        `${this.apiBaseUrl}/locations/countries/${id}`
      )
      .pipe(map((res) => res.success));
  }
  getCitiesByCountry(countryId: string) {
    return this.http
      .get<{ success: boolean; data: any[] }>(
        `${this.apiBaseUrl}/locations/cities`,
        { params: { countryId } }
      )
      .pipe(
        map((res) =>
          res.success
            ? res.data.map((city) => ({
                id: city.id,
                name: city.name,
              }))
            : []
        ),
        catchError((error: any) => {
          console.error('API Error fetching cities', error);
          return of([]); // return empty list if error
        })
      );
  }
    createCity(payload: { name: string; countryId: number }): Observable<City> {
    return this.http
      .post<{ success: boolean; data: City }>(
        `${this.apiBaseUrl}/locations/cities`,
        payload
      )
      .pipe(map((res) => res.data));
  }

  updateCity(
    id: number,
    payload: { name: string; countryId: number }
  ): Observable<City> {
    return this.http
      .put<{ success: boolean; data: City }>(
        `${this.apiBaseUrl}/locations/cities/${id}`,
        payload
      )
      .pipe(map((res) => res.data));
  }

  deleteCity(id: number): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${this.apiBaseUrl}/locations/cities/${id}`)
      .pipe(map(() => void 0));
  }
}
