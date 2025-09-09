import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, map, of, tap, Observable, switchMap } from 'rxjs';
import {
  ApiResponse,
  CreateOrUpdateDriverPayload,
  Driver,
} from './buy-stock.dto';

// @Injectable({
//   providedIn: 'root',
// })
// export class DriverService {
//   private readonly http = inject(HttpClient);
//   private readonly apiBaseUrl = environment.apiBaseUrl;
//   readonly drivers = signal<Driver[]>([]);

//   fetchDriverById(id: string): Observable<Driver> {
//     return this.http
//       .get<ApiResponse<Driver>>(`${this.apiBaseUrl}/drivers/${id}`)
//       .pipe(map((res) => res.data));
//   }

//   fetchAllDrivers(): Observable<Driver[]> {
//     return this.http
//       .get<ApiResponse<Driver[]>>(`${this.apiBaseUrl}/drivers`)
//       .pipe(
//         map((res) => res?.data ?? []),
//         tap((list) => this.drivers.set(list)),
//         catchError((err) => {
//           console.error('Error fetching drivers', err);
//           this.drivers.set([]);
//           return of([]);
//         })
//       );
//   }

//   createDriver(
//     payload: CreateOrUpdateDriverPayload
//   ): Observable<Driver> {
//     return this.http
//       .post<ApiResponse<Driver>>(`${this.apiBaseUrl}/drivers`, payload)
//       .pipe(
//         map((res) => res.data),
//         switchMap((driver) => this.fetchAllDrivers().pipe(map(() => driver))),
//         catchError((err) => {
//           console.error('Error creating driver', err);
//           throw err;
//         })
//       );
//   }

//   updateDriver(
//     id: string,
//     payload: CreateOrUpdateDriverPayload
//   ): Observable<Driver> {
//     return this.http
//       .put<ApiResponse<Driver>>(
//         `${this.apiBaseUrl}/drivers/${id}`,
//         payload
//       )
//       .pipe(
//         map((res) => res.data),
//         switchMap((driver) => this.fetchAllDrivers().pipe(map(() => driver))),
//         catchError((err) => {
//           console.error('Error updating driver', err);
//           throw err;
//         })
//       );
//   }

//   deleteDriver(id: string): Observable<void> {
//     return this.http
//       .delete<ApiResponse<unknown>>(`${this.apiBaseUrl}/drivers/${id}`)
//       .pipe(
//         switchMap(() => this.fetchAllDrivers().pipe(map(() => void 0))),
//         catchError((err) => {
//           console.error('Error deleting driver', err);
//           throw err;
//         })
//       );
//   }

//   constructor() {}
// }

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  fetchDriverById(id: string): Observable<Driver> {
    return this.http
      .get<ApiResponse<Driver>>(`${this.apiBaseUrl}/drivers/${id}`)
      .pipe(map((res) => res.data));
  }

  fetchAllDrivers(): Observable<Driver[]> {
    return this.http
      .get<ApiResponse<Driver[]>>(`${this.apiBaseUrl}/drivers`)
      .pipe(
        map((res) => res?.data ?? []),
        catchError((err) => {
          console.error('Error fetching drivers', err);
          return of([]);
        })
      );
  }

  createDriver(payload: CreateOrUpdateDriverPayload): Observable<Driver> {
    return this.http
      .post<ApiResponse<Driver>>(`${this.apiBaseUrl}/drivers`, payload)
      .pipe(map((res) => res.data));
  }

  updateDriver(id: string, payload: CreateOrUpdateDriverPayload): Observable<Driver> {
    return this.http
      .put<ApiResponse<Driver>>(`${this.apiBaseUrl}/drivers/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteDriver(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.apiBaseUrl}/drivers/${id}`)
      .pipe(map(() => void 0));
  }
}

