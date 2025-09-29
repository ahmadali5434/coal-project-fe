import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { AuthResponse, User } from './models/user.model';
import { environment } from '../../environments/environment';
import { RbacService } from '../core/rbac.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly rbacService = inject(RbacService);
  private apiUrl = environment.apiBaseUrl + '/auth';

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        this.userSubject.next(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  fetchPermissions() {
    const token = this.accessToken;
    return this.http
      .get<{ success: boolean; data: string[] }>(
        `${this.apiUrl}/me/permissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(
        map((res) => res.data) // return the array of permissions
      );
  }

  register(email: string, password: string) {
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/register`,
      { email, password }
    );
  }

  adminCreateUser(username: string, password: string, role: 'user' | 'admin') {
    const token = localStorage.getItem('accessToken');
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/admin/create`,
      { email: username, password, role },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  logout(): void {
    this.rbacService.clearPermissions();
    this.clearSession();
  }

  refreshToken() {
    const token = localStorage.getItem('refreshToken');
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken: token })
      .pipe(tap((res) => this.setSession(res)));
  }

  private setSession(res: AuthResponse) {
    const { id, email, role, accessToken, refreshToken } = res.data;

    const user: User = { id, email, role };

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    this.userSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('permissions');
    this.userSubject.next(null);
  }

  get accessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }
}
