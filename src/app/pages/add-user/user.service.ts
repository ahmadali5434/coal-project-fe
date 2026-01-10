import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../buy-stock/data-access/buy-stock.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  fetchAllUsers(): Observable<User[]> {
    const token = localStorage.getItem('accessToken'); 
    if (!token) {
      console.error('No access token found');
      return of([]);
    }

    return this.http
      .get<{ success: boolean; data: User[] }>(`${this.apiBaseUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map(res => res.data ?? []),
        catchError(err => {
          console.error('Error fetching users', err);
          return of([]);
        })
      );
  }

  deleteUser(id: string): Observable<void> {
    const token = localStorage.getItem('accessToken');
    return this.http
      .delete(`${this.apiBaseUrl}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(map(() => void 0));
  }
}
