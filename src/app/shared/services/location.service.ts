import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { Country } from '../model';

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
}
