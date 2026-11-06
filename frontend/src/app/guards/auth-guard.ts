import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('access_token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);

      // check expiration
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        this.router.navigate(['/login']);
        return false;
      }

      return true;
    } catch (err) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
