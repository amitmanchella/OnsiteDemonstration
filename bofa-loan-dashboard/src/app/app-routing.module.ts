import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard-routing').then(m => m.dashboardRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'loans',
    loadChildren: () => import('./features/loans/loans-routing').then(m => m.loansRoutes),
    canActivate: [authGuard, roleGuard],
    data: { role: 'loan_officer' }
  },
  {
    path: 'transactions',
    loadChildren: () => import('./features/transactions/transactions-routing').then(m => m.transactionsRoutes),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
