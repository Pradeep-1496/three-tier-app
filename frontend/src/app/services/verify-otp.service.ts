import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VerifyOtpService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  otpUrl = environment.AUTH.OTP;

  verify(email: string, otp: string) {
    const url = `${this.baseUrl}${this.otpUrl}`;
    const payload = { email, otp };
    console.log('[VerifyOtpService] POSTing to', url, 'with payload', payload);

    return this.http.post(url, payload, { responseType: 'text' });
  }
}
