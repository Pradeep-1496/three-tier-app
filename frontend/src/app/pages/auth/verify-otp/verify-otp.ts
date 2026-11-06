import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerifyOtpService } from '../../../services/verify-otp.service';

@Component({
  selector: 'app-verify-otp',
  imports: [CommonModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp implements OnInit {
  private otpService = inject(VerifyOtpService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentEmail = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.currentEmail = params['email'];

      if (!this.currentEmail) {
        this.router.navigate(['sign-up']);
      }
    });
  }

  onVerify(otp: string) {
    const trimmed = (otp || '').trim();
    if (!this.currentEmail || !trimmed) {
      this.errorMessage.set('Email and OTP are required');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.otpService.verify(this.currentEmail, trimmed).subscribe({
      next: (raw) => {
        console.log('[VerifyOtp] success raw:', raw);
        this.isLoading.set(false);
        this.router.navigate(['/login']).catch((err) => console.error('[VerifyOtp] router error', err));
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('[VerifyOtp] http error', err);
        console.error('[VerifyOtp] http error body', err?.error);
        const body = err?.error;
        let message = 'OTP verification failed';
        if (typeof body === 'string' && body.trim()) message = body;
        else if (body && typeof body === 'object') message = body.message || body.error || message;
        else if (typeof err === 'string') message = err;
        this.errorMessage.set(message);
      },
    });
  }
}
