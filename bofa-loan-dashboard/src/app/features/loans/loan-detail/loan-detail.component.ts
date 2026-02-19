import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Loan } from '../../../core/models/loan.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan | null = null;
  transactions: Transaction[] = [];
  loading: boolean = true;

  @ViewChild('statusSelect') statusSelect!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => this.apiService.getLoanById(params['id']))
    ).subscribe(
      (loan) => {
        this.loan = loan;
        this.loading = false;
        this.loadTransactions(loan.id);
      },
      (error) => {
        console.error('Failed to load loan', error);
        this.loading = false;
      }
    );
  }

  loadTransactions(loanId: string): void {
    this.apiService.getTransactions(loanId).subscribe(
      (transactions) => {
        this.transactions = transactions;
      },
      (error) => {
        console.error('Failed to load transactions', error);
      }
    );
  }

  updateStatus(newStatus: string): void {
    if (!this.loan) return;
    this.apiService.updateLoanStatus(this.loan.id, newStatus).subscribe(
      (updatedLoan) => {
        this.loan = updatedLoan;
      },
      (error) => {
        console.error('Failed to update status', error);
      }
    );
  }
}
