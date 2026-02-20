import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  loading: boolean = true;
  dateFilter = {
    start: '',
    end: ''
  };

  columns = [
    { key: 'date', label: 'Date', type: 'date' as const },
    { key: 'loanId', label: 'Loan ID', type: 'text' as const },
    { key: 'type', label: 'Type', type: 'status' as const },
    { key: 'description', label: 'Description', type: 'text' as const },
    { key: 'amount', label: 'Amount', type: 'currency' as const },
    { key: 'status', label: 'Status', type: 'status' as const }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load transactions', error);
        this.loading = false;
      }
    });
  }

  applyDateFilter(): void {
    if (!this.dateFilter.start && !this.dateFilter.end) {
      this.ngOnInit();
      return;
    }

    this.apiService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          const start = this.dateFilter.start ? new Date(this.dateFilter.start) : null;
          const end = this.dateFilter.end ? new Date(this.dateFilter.end) : null;

          if (start && txDate < start) return false;
          if (end && txDate > end) return false;
          return true;
        });
      },
      error: (error) => {
        console.error('Failed to filter transactions', error);
      }
    });
  }
}
