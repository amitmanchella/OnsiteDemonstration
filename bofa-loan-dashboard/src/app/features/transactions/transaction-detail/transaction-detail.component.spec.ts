import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { TransactionDetailComponent } from './transaction-detail.component';
import { ApiService } from '../../../core/services/api.service';
import { Transaction } from '../../../core/models/transaction.model';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let paramsSubject: BehaviorSubject<any>;

  const mockTransaction: Transaction = {
    id: 'TXN-001', loanId: 'LN-001', amount: 2500, type: 'payment',
    date: '2024-02-01', description: 'Monthly payment', status: 'completed'
  };

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getTransactionById']);
    apiServiceSpy.getTransactionById.and.returnValue(of(mockTransaction));
    paramsSubject = new BehaviorSubject({ id: 'TXN-001' });

    await TestBed.configureTestingModule({
      imports: [TransactionDetailComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.transaction).toBeNull();
    expect(component.loading).toBe(true);
  });

  describe('ngOnInit', () => {
    it('should load transaction from route params', () => {
      fixture.detectChanges();
      expect(apiServiceSpy.getTransactionById).toHaveBeenCalledWith('TXN-001');
      expect(component.transaction).toEqual(mockTransaction);
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading transaction', () => {
      apiServiceSpy.getTransactionById.and.returnValue(throwError(() => new Error('Not found')));
      spyOn(console, 'error');
      fixture.detectChanges();
      expect(component.loading).toBe(false);
      expect(component.transaction).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Failed to load transaction', jasmine.any(Error));
    });

    it('should reload when route params change', () => {
      fixture.detectChanges();
      expect(apiServiceSpy.getTransactionById).toHaveBeenCalledWith('TXN-001');

      const otherTx: Transaction = { ...mockTransaction, id: 'TXN-002', amount: 5000 };
      apiServiceSpy.getTransactionById.and.returnValue(of(otherTx));
      paramsSubject.next({ id: 'TXN-002' });
      expect(apiServiceSpy.getTransactionById).toHaveBeenCalledWith('TXN-002');
      expect(component.transaction).toEqual(otherTx);
    });
  });

  describe('template', () => {
    it('should show loading when loading', () => {
      // Before detectChanges, loading is true
      expect(component.loading).toBe(true);
    });

    it('should show transaction details after loading', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.transaction-detail-page')).toBeTruthy();
      expect(compiled.textContent).toContain('TXN-001');
      expect(compiled.textContent).toContain('LN-001');
    });

    it('should show transaction type badge', () => {
      fixture.detectChanges();
      const typeBadge = fixture.nativeElement.querySelector('.transaction-type');
      expect(typeBadge).toBeTruthy();
      expect(typeBadge.textContent.trim()).toBe('payment');
    });

    it('should show transaction status badge', () => {
      fixture.detectChanges();
      const statusBadge = fixture.nativeElement.querySelector('.transaction-status');
      expect(statusBadge).toBeTruthy();
      expect(statusBadge.textContent.trim()).toBe('completed');
    });

    it('should show back link', () => {
      fixture.detectChanges();
      const backLink = fixture.nativeElement.querySelector('.back-link');
      expect(backLink).toBeTruthy();
      expect(backLink.textContent).toContain('Back to Transactions');
    });

    it('should show description', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Monthly payment');
    });
  });
});
