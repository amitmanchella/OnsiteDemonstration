import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Loan } from '../models/loan.model';
import { Transaction } from '../models/transaction.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const mockLoans: Loan[] = [
    {
      id: 'LN-001', applicantName: 'John Doe', amount: 50000, interestRate: 5.5,
      term: 60, status: 'active', applicationDate: '2024-01-15', riskScore: 72, type: 'personal'
    },
    {
      id: 'LN-002', applicantName: 'Jane Smith', amount: 450000, interestRate: 3.5,
      term: 360, status: 'pending', applicationDate: '2024-02-20', riskScore: 55, type: 'mortgage'
    },
    {
      id: 'LN-003', applicantName: 'Bob Wilson', amount: 28000, interestRate: 4.2,
      term: 48, status: 'approved', applicationDate: '2024-01-28', riskScore: 80, type: 'auto'
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'TXN-001', loanId: 'LN-001', amount: 2500, type: 'payment',
      date: '2024-02-01', description: 'Monthly payment', status: 'completed'
    },
    {
      id: 'TXN-002', loanId: 'LN-001', amount: 450000, type: 'disbursement',
      date: '2024-01-15', description: 'Loan disbursement', status: 'completed'
    },
    {
      id: 'TXN-003', loanId: 'LN-002', amount: 350, type: 'fee',
      date: '2024-02-20', description: 'Application fee', status: 'completed'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLoans', () => {
    it('should return all loans', () => {
      service.getLoans().subscribe(loans => {
        expect(loans.length).toBe(3);
        expect(loans).toEqual(mockLoans);
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockLoans);
    });

    it('should handle HTTP error', () => {
      service.getLoans().subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getLoanById', () => {
    it('should return a specific loan by id', () => {
      service.getLoanById('LN-001').subscribe(loan => {
        expect(loan.id).toBe('LN-001');
        expect(loan.applicantName).toBe('John Doe');
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      req.flush(mockLoans);
    });

    it('should throw error when loan not found', () => {
      service.getLoanById('INVALID').subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      req.flush(mockLoans);
    });
  });

  describe('createLoan', () => {
    it('should return a new loan with pending status', () => {
      service.createLoan({
        applicantName: 'New Applicant',
        amount: 100000,
        interestRate: 6.0,
        term: 120,
        type: 'business'
      }).subscribe(loan => {
        expect(loan.applicantName).toBe('New Applicant');
        expect(loan.amount).toBe(100000);
        expect(loan.status).toBe('pending');
        expect(loan.type).toBe('business');
        expect(loan.id).toMatch(/^LN-2024-/);
      });
    });

    it('should use defaults for missing fields', () => {
      service.createLoan({}).subscribe(loan => {
        expect(loan.applicantName).toBe('');
        expect(loan.amount).toBe(0);
        expect(loan.riskScore).toBe(50);
        expect(loan.type).toBe('personal');
      });
    });
  });

  describe('updateLoanStatus', () => {
    it('should update loan status', () => {
      service.updateLoanStatus('LN-002', 'approved').subscribe(loan => {
        expect(loan.status).toBe('approved');
        expect(loan.approvedBy).toBe('Current User');
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      req.flush(JSON.parse(JSON.stringify(mockLoans)));
    });

    it('should not set approvedBy for non-approved status', () => {
      service.updateLoanStatus('LN-002', 'rejected').subscribe(loan => {
        expect(loan.status).toBe('rejected');
        expect(loan.approvedBy).toBeUndefined();
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      req.flush(JSON.parse(JSON.stringify(mockLoans)));
    });
  });

  describe('getTransactions', () => {
    it('should return all transactions when no loanId provided', () => {
      service.getTransactions().subscribe(transactions => {
        expect(transactions.length).toBe(3);
      });

      const req = httpMock.expectOne('assets/mock-data/transactions.json');
      req.flush(mockTransactions);
    });

    it('should filter transactions by loanId', () => {
      service.getTransactions('LN-001').subscribe(transactions => {
        expect(transactions.length).toBe(2);
        transactions.forEach(t => expect(t.loanId).toBe('LN-001'));
      });

      const req = httpMock.expectOne('assets/mock-data/transactions.json');
      req.flush(mockTransactions);
    });

    it('should return empty array for non-existent loanId', () => {
      service.getTransactions('INVALID').subscribe(transactions => {
        expect(transactions.length).toBe(0);
      });

      const req = httpMock.expectOne('assets/mock-data/transactions.json');
      req.flush(mockTransactions);
    });
  });

  describe('getTransactionById', () => {
    it('should return a specific transaction', () => {
      service.getTransactionById('TXN-001').subscribe(transaction => {
        expect(transaction.id).toBe('TXN-001');
        expect(transaction.amount).toBe(2500);
      });

      const req = httpMock.expectOne('assets/mock-data/transactions.json');
      req.flush(mockTransactions);
    });

    it('should throw error when transaction not found', () => {
      service.getTransactionById('INVALID').subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('assets/mock-data/transactions.json');
      req.flush(mockTransactions);
    });
  });

  describe('getDashboardStats', () => {
    it('should compute correct dashboard statistics', () => {
      service.getDashboardStats().subscribe(stats => {
        expect(stats.totalLoans).toBe(3);
        expect(stats.totalAmount).toBe(528000);
        expect(stats.activeLoans).toBe(1);
        expect(stats.pendingApplications).toBe(1);
        expect(stats.averageRiskScore).toBe(69);
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      req.flush(JSON.parse(JSON.stringify(mockLoans)));
    });

    it('should handle HTTP error for dashboard stats', () => {
      service.getDashboardStats().subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('assets/mock-data/loans.json');
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
