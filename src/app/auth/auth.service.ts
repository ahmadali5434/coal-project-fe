import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { AuthResponse, User } from './models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
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

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(email: string, password: string) {
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/register`,
      { email, password }
    );
  }

  /** ✅ Admin-only create user (with role) */
  adminCreateUser(
    username: string,
    password: string,
    role: 'user' | 'admin'
  ) {
    const token = localStorage.getItem('accessToken');
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/admin/create`,
      { email: username, password, role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  logout() {
    return this.clearSession();
  }

  refreshToken() {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res)));
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('accessToken', res.accessToken);
    this.userSubject.next(res.user);
  }

  private clearSession() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    this.userSubject.next(null);
  }

  get accessToken() {
    return localStorage.getItem('accessToken');
  }

  get currentUser() {
    return this.userSubject.value;
  }

  isLoggedIn() {
    return !!this.accessToken;
  }
}
