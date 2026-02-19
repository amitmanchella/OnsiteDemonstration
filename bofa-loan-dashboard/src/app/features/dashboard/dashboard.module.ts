import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { DashboardComponent } from './dashboard.component';
import { LoanSummaryComponent } from './widgets/loan-summary/loan-summary.component';
import { RecentActivityComponent } from './widgets/recent-activity/recent-activity.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    DashboardComponent,
    LoanSummaryComponent,
    RecentActivityComponent
  ]
})
export class DashboardModule {}
