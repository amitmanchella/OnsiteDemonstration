import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { Loan } from '../../../../core/models/loan.model';

@Component({
  selector: 'app-loan-summary',
  templateUrl: './loan-summary.component.html',
  styleUrls: ['./loan-summary.component.scss']
})
export class LoanSummaryComponent implements OnInit {
  loans$: Observable<Loan[]>;
  totalActive: number = 0;
  totalPending: number = 0;
  totalAmount: number = 0;
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService) {
    this.loans$ = this.apiService.getLoans().pipe(
      map((loans: Loan[]) => {
        this.calculateStats(loans);
        this.loading = false;
        return loans;
      }),
      catchError((error) => {
        this.error = error.message || 'Failed to load loans';
        this.loading = false;
        return throwError(() => error);
      })
    );
  }

  ngOnInit(): void {
    this.loans$.subscribe({
      next: (loans) => {},
      error: (error) => {}
    });
  }

  private calculateStats(loans: Loan[]): void {
    this.totalActive = loans.filter(l => l.status === 'active').length;
    this.totalPending = loans.filter(l => l.status === 'pending').length;
    this.totalAmount = loans
      .filter(l => l.status === 'active' || l.status === 'approved')
      .reduce((sum, loan) => sum + loan.amount, 0);
  }
}
