import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);

  LoginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['dashboard']);
    }
  }

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  login() {
    if (this.LoginForm.invalid) {
      this.LoginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(this.LoginForm.value.email || '', this.LoginForm.value.password || '')
      .subscribe({
        next: (res) => {
          console.log(res);
          this.isLoading.set(false);
          this.router.navigate(['dashboard']);
        },
        error: (err: any) => {
          console.error(err);
          this.isLoading.set(false);
          const message = err?.error?.message || err?.message || 'Login failed. Please try again.';
          this.errorMessage.set(message);
        },
      });
  }
}
