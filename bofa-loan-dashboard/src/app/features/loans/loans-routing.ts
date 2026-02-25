import { Routes } from '@angular/router';
import { LoanListComponent } from './loan-list/loan-list.component';
import { LoanDetailComponent } from './loan-detail/loan-detail.component';
import { LoanApplicationComponent } from './loan-application/loan-application.component';

export const loansRoutes: Routes = [
  {
    path: '',
    component: LoanListComponent
  },
  {
    path: 'new',
    component: LoanApplicationComponent
  },
  {
    path: ':id',
    component: LoanDetailComponent
  }
];
