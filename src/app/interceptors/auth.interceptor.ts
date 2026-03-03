import { HttpInterceptorFn, HttpRequest, 
         HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

 
  const authRequest = token ? request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  }) : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {

     
      if (error.status === 401) {
        const refreshToken = authService.getRefreshToken();

   
        if (!refreshToken) {
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        // Try to refresh
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Got new token → retry original request
            const newReq = request.clone({
              headers: request.headers.set(
                'Authorization', `Bearer ${response.token}`)
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // Refresh failed → logout
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};