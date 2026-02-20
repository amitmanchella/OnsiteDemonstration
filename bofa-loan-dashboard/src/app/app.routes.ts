import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Application route configuration (Angular 18 standalone pattern).
//
// All feature routes use `loadComponent` for lazy loading — each component is
// loaded on demand, which keeps the initial bundle small. This replaces the
// previous NgModule-based `loadChildren` pattern used prior to Angular 18.
//
// Guards:
//   - authGuard: Redirects unauthenticated users to /login.
//   - roleGuard: Checks the user's role against `data.role`. Redirects to
//                /unauthorized on mismatch.
//
// Route structure:
//   /              → redirects to /dashboard
//   /login         → public, login page
//   /unauthorized  → public, shown when role check fails
//   /dashboard     → protected, requires authentication
//   /loans/*       → protected, requires authentication + 'loan_officer' role
//   /transactions/* → protected, requires authentication
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Public routes — no guard required
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Dashboard — lazy-loaded, requires authentication
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // Loans — lazy-loaded children, requires authentication + loan_officer role
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

  // Transactions — lazy-loaded children, requires authentication
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

  // Wildcard — catch-all redirect
  { path: '**', redirectTo: '/dashboard' }
];
