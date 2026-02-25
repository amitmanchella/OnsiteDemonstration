import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RecentActivityComponent } from './recent-activity.component';
import { ApiService } from '../../../../core/services/api.service';
import { Transaction } from '../../../../core/models/transaction.model';

describe('RecentActivityComponent', () => {
  let component: RecentActivityComponent;
  let fixture: ComponentFixture<RecentActivityComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockTransactions: Transaction[] = [
    { id: 'TXN-001', loanId: 'LN-001', amount: 2500, type: 'payment', date: '2024-02-01', description: 'Monthly payment', status: 'completed' },
    { id: 'TXN-002', loanId: 'LN-001', amount: 50000, type: 'disbursement', date: '2024-01-15', description: 'Loan disbursement', status: 'completed' },
    { id: 'TXN-003', loanId: 'LN-002', amount: 100, type: 'fee', date: '2024-03-01', description: 'Late fee', status: 'pending' },
    { id: 'TXN-004', loanId: 'LN-003', amount: 3000, type: 'payment', date: '2024-03-15', description: 'Monthly payment', status: 'completed' },
    { id: 'TXN-005', loanId: 'LN-003', amount: 75000, type: 'disbursement', date: '2024-02-15', description: 'Loan disbursement', status: 'completed' },
    { id: 'TXN-006', loanId: 'LN-004', amount: 500, type: 'fee', date: '2024-04-01', description: 'Processing fee', status: 'completed' }
  ];

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getTransactions']);
    apiServiceSpy.getTransactions.and.returnValue(of(mockTransactions));

    await TestBed.configureTestingModule({
      imports: [RecentActivityComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivityComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values before init', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
  });

  describe('ngOnInit', () => {
    it('should load recent transactions and slice to 5', () => {
      fixture.detectChanges();
      expect(apiServiceSpy.getTransactions).toHaveBeenCalled();
      expect(component.loading).toBe(false);

      // Verify the observable slices to 5
      component.recentTransactions$.subscribe(txs => {
        expect(txs.length).toBe(5);
        expect(txs[0].id).toBe('TXN-001');
        expect(txs[4].id).toBe('TXN-005');
      });
    });

    it('should handle error when loading transactions', () => {
      apiServiceSpy.getTransactions.and.returnValue(throwError(() => new Error('Server error')));

      // Recreate fixture since recentTransactions$ is set in constructor
      fixture = TestBed.createComponent(RecentActivityComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Server error');
    });

    it('should handle error without message', () => {
      apiServiceSpy.getTransactions.and.returnValue(throwError(() => ({})));

      fixture = TestBed.createComponent(RecentActivityComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.error).toBe('Failed to load transactions');
    });
  });

  describe('with fewer than 5 transactions', () => {
    it('should return all transactions when less than 5', () => {
      const fewTx = mockTransactions.slice(0, 2);
      apiServiceSpy.getTransactions.and.returnValue(of(fewTx));

      fixture = TestBed.createComponent(RecentActivityComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.recentTransactions$.subscribe(txs => {
        expect(txs.length).toBe(2);
      });
    });
  });
});
