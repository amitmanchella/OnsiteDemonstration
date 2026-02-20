import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { LoanSummaryComponent } from './widgets/loan-summary/loan-summary.component';
import { RecentActivityComponent } from './widgets/recent-activity/recent-activity.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LoanSummaryComponent, RecentActivityComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats$: Observable<any>;

  constructor(private apiService: ApiService) {
    this.stats$ = this.apiService.getDashboardStats().pipe(
      map(stats => stats),
      catchError(error => {
        console.error('Failed to load dashboard stats', error);
        return [];
      })
    );
  }

  ngOnInit(): void {}

  onSearch(term: string): void {
    console.log('Search term:', term);
  }
}
