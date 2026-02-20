import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: 'loans',
    loadChildren: () => import('./features/loans/loans.module').then(m => m.LoansModule),
    canActivate: [authGuard, roleGuard],
    data: { role: 'loan_officer' }
  },
  {
    path: 'transactions',
    loadChildren: () => import('./features/transactions/transactions.module').then(m => m.TransactionsModule),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
