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
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'loans',
    canActivate: [authGuard, roleGuard],
    data: { role: 'loan_officer' },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/loans/loan-list/loan-list.component').then(m => m.LoanListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/loans/loan-application/loan-application.component').then(m => m.LoanApplicationComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/loans/loan-detail/loan-detail.component').then(m => m.LoanDetailComponent)
      }
    ]
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/transactions/transaction-detail/transaction-detail.component').then(m => m.TransactionDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
