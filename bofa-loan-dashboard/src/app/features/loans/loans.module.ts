import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { LoansRoutingModule } from './loans-routing.module';

import { LoanListComponent } from './loan-list/loan-list.component';
import { LoanDetailComponent } from './loan-detail/loan-detail.component';
import { LoanApplicationComponent } from './loan-application/loan-application.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    LoansRoutingModule
  ],
  declarations: [
    LoanListComponent,
    LoanDetailComponent,
    LoanApplicationComponent
  ]
})
export class LoansModule {}
