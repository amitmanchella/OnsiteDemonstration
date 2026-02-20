import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';
import { Loan } from '../models/loan.model';
import { Transaction, ApiResponse } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private mockDataPath = 'assets/mock-data';

  constructor(private http: HttpClient) {}

  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.mockDataPath}/loans.json`)
      .pipe(
        map(loans => loans),
        catchError(this.handleError)
      );
  }

  getLoanById(id: string): Observable<Loan> {
    return this.http.get<Loan[]>(`${this.mockDataPath}/loans.json`)
      .pipe(
        map(loans => {
          const loan = loans.find(l => l.id === id);
          if (!loan) {
            throw new Error('Loan not found');
          }
          return loan;
        }),
        catchError(this.handleError)
      );
  }

  createLoan(loan: Partial<Loan>): Observable<Loan> {
    return of({
      id: `LN-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      applicantName: loan.applicantName || '',
      amount: loan.amount || 0,
      interestRate: loan.interestRate || 0,
      term: loan.term || 0,
      status: 'pending',
      applicationDate: new Date().toISOString().split('T')[0],
      riskScore: loan.riskScore || 50,
      type: loan.type || 'personal'
    } as Loan);
  }

  updateLoanStatus(id: string, status: string): Observable<Loan> {
    return this.getLoanById(id).pipe(
      map(loan => {
        loan.status = status as any;
        if (status === 'approved') {
          loan.approvedBy = 'Current User';
        }
        return loan;
      })
    );
  }

  getTransactions(loanId?: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.mockDataPath}/transactions.json`)
      .pipe(
        map(transactions => {
          if (loanId) {
            return transactions.filter(t => t.loanId === loanId);
          }
          return transactions;
        }),
        catchError(this.handleError)
      );
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction[]>(`${this.mockDataPath}/transactions.json`)
      .pipe(
        map(transactions => {
          const transaction = transactions.find(t => t.id === id);
          if (!transaction) {
            throw new Error('Transaction not found');
          }
          return transaction;
        }),
        catchError(this.handleError)
      );
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<Loan[]>(`${this.mockDataPath}/loans.json`)
      .pipe(
        map(loans => {
          const totalLoans = loans.length;
          const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
          const activeLoans = loans.filter(l => l.status === 'active').length;
          const pendingApplications = loans.filter(l => l.status === 'pending').length;
          const averageRiskScore = loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loans.length;

          return {
            totalLoans,
            totalAmount,
            activeLoans,
            pendingApplications,
            averageRiskScore: Math.round(averageRiskScore * 10) / 10
          };
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    return throwError(() => error.message || 'Server error');
  }
}
