// src/app/user-mang/role.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Role } from './role.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/roles';

  getRoles(): Observable<Role[]> {
    return this.http
      .get<{ success: boolean; data: Role[] }>(this.baseUrl)
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('Failed to load roles:', err);
          return throwError(() => err);
        })
      );
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}`, role);
  }

  deleteRole(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
