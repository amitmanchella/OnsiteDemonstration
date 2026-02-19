import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { Transaction } from '../../../../core/models/transaction.model';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent implements OnInit {
  recentTransactions$: Observable<Transaction[]>;
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService) {
    this.recentTransactions$ = this.apiService.getTransactions().pipe(
      map((transactions: Transaction[]) => {
        this.loading = false;
        return transactions.slice(0, 5);
      })
    );
  }

  ngOnInit(): void {
    this.recentTransactions$.subscribe(
      (transactions) => {},
      (error) => {
        this.error = error.message || 'Failed to load transactions';
        this.loading = false;
      }
    );
  }
}
