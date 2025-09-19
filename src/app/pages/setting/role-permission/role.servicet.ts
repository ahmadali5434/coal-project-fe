import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role } from './role.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private baseUrl = `${environment.apiBaseUrl}/roles`;
  constructor(private http: HttpClient) {}

  createRole(payload: Role): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, payload);
  }
  updateRole(id: string, payload: Role): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}`, payload);
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
