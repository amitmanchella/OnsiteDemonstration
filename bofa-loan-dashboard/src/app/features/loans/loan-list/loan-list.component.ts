import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Loan } from '../../../core/models/loan.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, DataTableComponent],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss']
})
export class LoanListComponent implements OnInit {
  loans: Loan[] = [];
  loading: boolean = true;
  filterStatus: string = 'all';

  columns = [
    { key: 'applicantName', label: 'Applicant', type: 'text' as const },
    { key: 'amount', label: 'Amount', type: 'currency' as const },
    { key: 'type', label: 'Type', type: 'text' as const },
    { key: 'status', label: 'Status', type: 'status' as const },
    { key: 'applicationDate', label: 'Date', type: 'date' as const }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.getLoans().subscribe({
      next: (loans) => {
        this.loans = loans;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load loans', error);
        this.loading = false;
      }
    });
  }

  get filteredLoans(): Loan[] {
    if (this.filterStatus === 'all') {
      return this.loans;
    }
    return this.loans.filter(loan => loan.status === this.filterStatus);
  }

  viewLoan(id: string): void {
    this.router.navigate(['/loans', id]);
  }
}
