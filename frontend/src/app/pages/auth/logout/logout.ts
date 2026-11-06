import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout {
  router = inject(Router);
  authService = inject(AuthService);

  isLoading = signal(false);

  logout() {
    this.isLoading.set(true);
    this.authService.logout();
    // Short delay to show the loading state
    setTimeout(() => {
      this.router.navigate(['login']);
    }, 300);
  }
}
