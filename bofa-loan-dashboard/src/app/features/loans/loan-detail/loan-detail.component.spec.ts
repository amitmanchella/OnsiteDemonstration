import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { LoanDetailComponent } from './loan-detail.component';
import { ApiService } from '../../../core/services/api.service';
import { Loan } from '../../../core/models/loan.model';
import { Transaction } from '../../../core/models/transaction.model';

describe('LoanDetailComponent', () => {
  let component: LoanDetailComponent;
  let fixture: ComponentFixture<LoanDetailComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let paramsSubject: BehaviorSubject<any>;

  const mockLoan: Loan = {
    id: 'LN-001', applicantName: 'John Doe', amount: 50000, interestRate: 5.5,
    term: 60, status: 'pending', applicationDate: '2024-01-15', riskScore: 72, type: 'personal'
  };

  const mockTransactions: Transaction[] = [
    {
      id: 'TXN-001', loanId: 'LN-001', amount: 2500, type: 'payment',
      date: '2024-02-01', description: 'Monthly payment', status: 'completed'
    },
    {
      id: 'TXN-002', loanId: 'LN-001', amount: 50000, type: 'disbursement',
      date: '2024-01-15', description: 'Loan disbursement', status: 'completed'
    }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getLoanById', 'getTransactions', 'updateLoanStatus']);
    apiSpy.getLoanById.and.returnValue(of(mockLoan));
    apiSpy.getTransactions.and.returnValue(of(mockTransactions));
    apiSpy.updateLoanStatus.and.returnValue(of({ ...mockLoan, status: 'approved' as const, approvedBy: 'Current User' }));

    paramsSubject = new BehaviorSubject({ id: 'LN-001' });

    await TestBed.configureTestingModule({
      imports: [LoanDetailComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loan).toBeNull();
    expect(component.transactions).toEqual([]);
    expect(component.loading).toBe(true);
  });

  describe('ngOnInit', () => {
    it('should load loan when route params emit', () => {
      fixture.detectChanges();
      expect(apiService.getLoanById).toHaveBeenCalledWith('LN-001');
      expect(component.loan).toEqual(mockLoan);
      expect(component.loading).toBe(false);
    });

    it('should load transactions after loan loads', () => {
      fixture.detectChanges();
      expect(apiService.getTransactions).toHaveBeenCalledWith('LN-001');
      expect(component.transactions).toEqual(mockTransactions);
    });

    it('should handle error when loading loan', () => {
      apiService.getLoanById.and.returnValue(throwError(() => new Error('Not found')));
      spyOn(console, 'error');
      fixture.detectChanges();
      expect(component.loading).toBe(false);
      expect(component.loan).toBeNull();
    });
  });

  describe('loadTransactions', () => {
    it('should load transactions for given loanId', () => {
      component.loadTransactions('LN-001');
      expect(apiService.getTransactions).toHaveBeenCalledWith('LN-001');
      expect(component.transactions).toEqual(mockTransactions);
    });

    it('should handle error when loading transactions', () => {
      apiService.getTransactions.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');
      component.loadTransactions('LN-001');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update loan status', () => {
      component.updateStatus('approved');
      expect(apiService.updateLoanStatus).toHaveBeenCalledWith('LN-001', 'approved');
      expect(component.loan?.status).toBe('approved');
    });

    it('should do nothing if no loan is loaded', () => {
      component.loan = null;
      apiService.updateLoanStatus.calls.reset();
      component.updateStatus('approved');
      expect(apiService.updateLoanStatus).not.toHaveBeenCalled();
    });

    it('should handle error when updating status', () => {
      apiService.updateLoanStatus.and.returnValue(throwError(() => new Error('Update failed')));
      spyOn(console, 'error');
      component.updateStatus('rejected');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should show loan details after loading', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loan-detail-page')).toBeTruthy();
      expect(compiled.textContent).toContain('John Doe');
    });

    it('should show no transactions message when empty', () => {
      apiService.getTransactions.and.returnValue(of([]));
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.no-data')).toBeTruthy();
    });

    it('should have loading state before init', () => {
      // Before detectChanges, loading is true
      expect(component.loading).toBe(true);
      expect(component.loan).toBeNull();
    });
  });
});
