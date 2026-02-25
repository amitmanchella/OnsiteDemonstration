import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoanSummaryComponent } from './loan-summary.component';
import { ApiService } from '../../../../core/services/api.service';
import { Loan } from '../../../../core/models/loan.model';

describe('LoanSummaryComponent', () => {
  let component: LoanSummaryComponent;
  let fixture: ComponentFixture<LoanSummaryComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockLoans: Loan[] = [
    {
      id: 'LN-001', applicantName: 'John Doe', amount: 50000, interestRate: 5.5,
      term: 60, status: 'active', applicationDate: '2024-01-15', riskScore: 72, type: 'personal'
    },
    {
      id: 'LN-002', applicantName: 'Jane Smith', amount: 200000, interestRate: 4.2,
      term: 360, status: 'pending', applicationDate: '2024-02-01', riskScore: 85, type: 'mortgage'
    },
    {
      id: 'LN-003', applicantName: 'Bob Wilson', amount: 75000, interestRate: 6.0,
      term: 48, status: 'approved', applicationDate: '2024-02-15', riskScore: 60, type: 'business'
    }
  ];

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getLoans']);
    apiServiceSpy.getLoans.and.returnValue(of(mockLoans));

    await TestBed.configureTestingModule({
      imports: [LoanSummaryComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values before init', () => {
    // loans$ is set in constructor so getLoans was already called
    expect(component.totalActive).toBe(0);
    expect(component.totalPending).toBe(0);
    expect(component.totalAmount).toBe(0);
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
  });

  describe('ngOnInit', () => {
    it('should load loans and calculate stats', () => {
      fixture.detectChanges();
      expect(apiServiceSpy.getLoans).toHaveBeenCalled();
      expect(component.loading).toBe(false);
      expect(component.totalActive).toBe(1); // LN-001 is active
      expect(component.totalPending).toBe(1); // LN-002 is pending
      // totalAmount = active + approved = 50000 + 75000 = 125000
      expect(component.totalAmount).toBe(125000);
    });

    it('should handle error when loading loans', () => {
      apiServiceSpy.getLoans.and.returnValue(throwError(() => new Error('Server error')));

      // Recreate fixture since loans$ is set in constructor
      fixture = TestBed.createComponent(LoanSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Server error');
    });

    it('should handle error without message', () => {
      apiServiceSpy.getLoans.and.returnValue(throwError(() => ({})));

      fixture = TestBed.createComponent(LoanSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.error).toBe('Failed to load loans');
    });
  });

  describe('calculateStats', () => {
    it('should calculate zero stats for empty loans', () => {
      apiServiceSpy.getLoans.and.returnValue(of([]));

      fixture = TestBed.createComponent(LoanSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.totalActive).toBe(0);
      expect(component.totalPending).toBe(0);
      expect(component.totalAmount).toBe(0);
    });

    it('should only count active and approved amounts in totalAmount', () => {
      fixture.detectChanges();
      // active: 50000, approved: 75000, pending: not counted
      expect(component.totalAmount).toBe(125000);
    });
  });
});
