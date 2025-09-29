import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;

  let authReq = req;
  if (token && !isAuthEndpoint(req.url)) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((err) => {
      // Skip refresh logic for login/register/refresh endpoints
      if (isAuthEndpoint(req.url)) {
        return throwError(() => err);
      }

      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.accessToken;
            if (!newToken) {
              return throwError(() => err); // no retry if refresh failed
            }
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          })
        );
      }

      return throwError(() => err);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  );
}
