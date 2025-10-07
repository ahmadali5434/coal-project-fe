import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, Subscription, timer } from 'rxjs';
import { AuthResponse, User } from './models/user.model';
import { environment } from '../../environments/environment';
import { RbacService } from '../core/rbac.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly rbacService = inject(RbacService);
  private apiUrl = environment.apiBaseUrl + '/auth';

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private refreshTimerSub?: Subscription;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.userSubject.next(JSON.parse(savedUser));
        this.scheduleTokenRefresh(); // 🔹 Auto-refresh if token exists
        this.restorePermissions();   // 🔹 Restore cached permissions
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  // ------------------- AUTH APIS -------------------

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res) => {
          this.setSession(res);
          this.loadPermissions(); // 🔹 Load fresh perms after login
        })
      );
  }

  register(username: string, password: string) {
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/register`,
      { username, password }
    );
  }

  adminCreateUser(username: string, password: string, role: 'user' | 'admin') {
    const token = localStorage.getItem('accessToken');
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/admin/create`,
      { username: username, password, role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  logout(): void {
    this.rbacService.clearPermissions();
    this.clearSession();
    this.clearRefreshTimer();
  }

  refreshToken() {
    const token = localStorage.getItem('refreshToken');
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken: token })
      .pipe(
        tap((res) => {
          this.setSession(res);
          this.scheduleTokenRefresh(); 
          this.loadPermissions(); // 🔹 Refresh permissions automatically
        })
      );
  }

  // ------------------- PERMISSIONS -------------------

  loadPermissions() {
    const token = this.accessToken;
    if (!token) return;

    this.http
      .get<{ success: boolean; data: string[] }>(`${this.apiUrl}/me/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          this.rbacService.setPermissions(res.data);
          localStorage.setItem('permissions', JSON.stringify(res.data));
        },
        error: () => {
          this.rbacService.clearPermissions();
          localStorage.removeItem('permissions');
        },
      });
  }

  restorePermissions() {
    const perms = localStorage.getItem('permissions');
    if (perms) {
      try {
        this.rbacService.setPermissions(JSON.parse(perms));
      } catch {
        localStorage.removeItem('permissions');
      }
    }
  }

  // ------------------- SESSION MANAGEMENT -------------------

  private setSession(res: AuthResponse) {
    const { id, username, role, accessToken, refreshToken } = res.data;
    const user: User = { id, username, role };

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    this.userSubject.next(user);

    this.scheduleTokenRefresh();
  }

  private clearSession(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('permissions');
    this.userSubject.next(null);
  }

  // ------------------- SILENT REFRESH -------------------

  private scheduleTokenRefresh() {
    this.clearRefreshTimer();

    const token = this.accessToken;
    if (!token) return;

    const expiry = this.getTokenExpiry(token);
    if (!expiry) return;

    const now = Date.now();
    const refreshAt = expiry - 60_000; // 🔹 refresh 1 min before expiry
    const delay = refreshAt - now;

    if (delay > 0) {
      this.refreshTimerSub = timer(delay).subscribe(() => {
        this.refreshToken().subscribe({
          next: () => console.log('Silent token & permissions refresh ✅'),
          error: () => console.warn('Silent refresh failed ❌'),
        });
      });
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimerSub) {
      this.refreshTimerSub.unsubscribe();
      this.refreshTimerSub = undefined;
    }
  }

  private getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null; // exp is in seconds
    } catch {
      return null;
    }
  }

  // ------------------- HELPERS -------------------

  get accessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isAdmin():boolean{
    return this.userSubject.value?.role === 'admin';
  }
  isLoggedIn(): boolean {
    return !!this.accessToken;
  }
}
