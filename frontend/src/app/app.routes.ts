import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-up',
    pathMatch: 'full',
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
  },

  {
    path: 'verify/:email',
    loadComponent: () => import('./pages/auth/verify-otp/verify-otp').then((m) => m.VerifyOtp),
  },

  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'logs',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/logs/logs').then((m) => m.Logs),
  },
];
