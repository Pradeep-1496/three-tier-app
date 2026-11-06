import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);

  RegisterForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['dashboard']);
    }
  }

  register() {
    if (this.RegisterForm.invalid) {
      this.RegisterForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .register(
        this.RegisterForm.value.name || '',
        this.RegisterForm.value.email || '',
        this.RegisterForm.value.password || '',
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.isLoading.set(false);
          this.router.navigate(['verify', this.RegisterForm.value.email]);
        },
        error: (err: any) => {
          console.error(err);
          this.isLoading.set(false);
          const message =
            err?.error?.message || err?.message || 'Registration failed. Please try again.';
          this.errorMessage.set(message);
        },
      });
  }
}
