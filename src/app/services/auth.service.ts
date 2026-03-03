import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>
      (`${this.apiUrl}/register`, data).pipe(
        tap((response: AuthResponse) => {
          if (response.token) {
            this.saveAuthData(response.token,
              response.refreshToken, {
              fullName: response.fullName || '',
              email: response.email
            });
          }
        })
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>
      (`${this.apiUrl}/login`, data).pipe(
        tap((response: AuthResponse) => {
          if (response.token) {
            this.saveAuthData(response.token,
              response.refreshToken, {
              fullName: response.fullName || '',
              email: response.email || data.email
            });
          }
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>
      (`${this.apiUrl}/refresh`,
        { refreshToken }).pipe(
        tap((response: AuthResponse) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`,
        { refreshToken }).subscribe();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post<any>
      (`${this.apiUrl}/forgotPassword`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post<any>
      (`${this.apiUrl}/resetPassword`, data);
  }

  saveAuthData(token: string, refreshToken: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}