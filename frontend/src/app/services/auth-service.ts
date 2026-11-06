import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  AuthUrl = environment.AUTH;
  accessToken = 'access_token';

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}${this.AuthUrl.LOGIN}`, { email, password })
      .pipe(
        tap((res) => {
          sessionStorage.setItem(this.accessToken, res.accessToken);
        }),
        catchError((error) => {
          console.log('Login failed', error);
          return throwError(() => new Error('Login failed. Please check credentials'));
        }),
      );
  }

  register(name: string, email: string, password: string) {
    sessionStorage.setItem('email', email);

    return this.http
      .post<RegisterResponse>(`${this.baseUrl}${this.AuthUrl.REGISTER}`, { name, email, password })
      .pipe(
        tap((res: any) => {

        }),
      );
  }

  logout(): void {
    sessionStorage.removeItem(this.accessToken);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.accessToken);
  }
}
