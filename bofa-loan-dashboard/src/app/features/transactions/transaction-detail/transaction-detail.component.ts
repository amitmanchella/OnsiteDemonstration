import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transaction | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => {
        this.apiService.getTransactionById(params['id']).subscribe({
          next: (transaction) => {
            this.transaction = transaction;
            this.loading = false;
          },
          error: (error) => {
            console.error('Failed to load transaction', error);
            this.loading = false;
          }
        });
      }
    });
  }
}
