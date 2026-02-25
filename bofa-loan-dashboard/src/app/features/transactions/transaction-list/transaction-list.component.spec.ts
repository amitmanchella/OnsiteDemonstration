import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { of, throwError } from 'rxjs';
import { TransactionListComponent } from './transaction-list.component';
import { ApiService } from '../../../core/services/api.service';
import { Transaction } from '../../../core/models/transaction.model';
import { DataTableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: '<div class="mock-data-table"><table><tbody><tr *ngFor="let row of data"><td>{{row.id}}</td></tr></tbody></table></div>',
  imports: [NgIf]
})
class MockDataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: DataTableColumn[] = [];
  @Input() pageSize: number = 10;
}

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockTransactions: Transaction[] = [
    {
      id: 'TXN-001', loanId: 'LN-001', amount: 2500, type: 'payment',
      date: '2024-02-01', description: 'Monthly payment', status: 'completed'
    },
    {
      id: 'TXN-002', loanId: 'LN-001', amount: 50000, type: 'disbursement',
      date: '2024-01-15', description: 'Loan disbursement', status: 'completed'
    },
    {
      id: 'TXN-003', loanId: 'LN-002', amount: 100, type: 'fee',
      date: '2024-03-01', description: 'Late fee', status: 'pending'
    }
  ];

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getTransactions']);
    apiServiceSpy.getTransactions.and.returnValue(of(mockTransactions));

    await TestBed.configureTestingModule({
      imports: [TransactionListComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .overrideComponent(TransactionListComponent, {
      set: {
        imports: [NgIf, FormsModule, MockDataTableComponent]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.transactions).toEqual([]);
    expect(component.loading).toBe(true);
    expect(component.dateFilter.start).toBe('');
    expect(component.dateFilter.end).toBe('');
  });

  it('should have correct column definitions', () => {
    expect(component.columns.length).toBe(6);
    expect(component.columns[0].key).toBe('date');
    expect(component.columns[4].key).toBe('amount');
    expect(component.columns[4].type).toBe('currency');
  });

  describe('ngOnInit', () => {
    it('should load transactions on init', () => {
      fixture.detectChanges();
      expect(apiServiceSpy.getTransactions).toHaveBeenCalled();
      expect(component.transactions).toEqual(mockTransactions);
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading transactions', () => {
      apiServiceSpy.getTransactions.and.returnValue(throwError(() => new Error('Server error')));
      spyOn(console, 'error');
      fixture.detectChanges();
      expect(component.loading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to load transactions', jasmine.any(Error));
    });
  });

  describe('applyDateFilter', () => {
    beforeEach(() => {
      fixture.detectChanges();
      apiServiceSpy.getTransactions.calls.reset();
      apiServiceSpy.getTransactions.and.returnValue(of(mockTransactions));
    });

    it('should reload all transactions when no dates specified', () => {
      component.dateFilter = { start: '', end: '' };
      component.applyDateFilter();
      expect(apiServiceSpy.getTransactions).toHaveBeenCalled();
    });

    it('should filter transactions by start date', () => {
      component.dateFilter = { start: '2024-02-01', end: '' };
      component.applyDateFilter();
      expect(apiServiceSpy.getTransactions).toHaveBeenCalled();
      // Only TXN-001 (2024-02-01) and TXN-003 (2024-03-01) should pass
      expect(component.transactions.length).toBe(2);
    });

    it('should filter transactions by end date', () => {
      component.dateFilter = { start: '', end: '2024-02-01' };
      component.applyDateFilter();
      expect(apiServiceSpy.getTransactions).toHaveBeenCalled();
      // TXN-001 (2024-02-01) and TXN-002 (2024-01-15) should pass
      expect(component.transactions.length).toBe(2);
    });

    it('should filter transactions by both start and end date', () => {
      component.dateFilter = { start: '2024-01-20', end: '2024-02-15' };
      component.applyDateFilter();
      expect(apiServiceSpy.getTransactions).toHaveBeenCalled();
      // Only TXN-001 (2024-02-01) should pass
      expect(component.transactions.length).toBe(1);
      expect(component.transactions[0].id).toBe('TXN-001');
    });

    it('should handle error when filtering transactions', () => {
      apiServiceSpy.getTransactions.and.returnValue(throwError(() => new Error('Filter error')));
      spyOn(console, 'error');
      component.dateFilter = { start: '2024-01-01', end: '2024-12-31' };
      component.applyDateFilter();
      expect(console.error).toHaveBeenCalledWith('Failed to filter transactions', jasmine.any(Error));
    });
  });

  describe('template', () => {
    it('should have loading state before init', () => {
      // Before detectChanges triggers ngOnInit, loading is true
      expect(component.loading).toBe(true);
      expect(component.transactions).toEqual([]);
    });

    it('should show data table after loading', () => {
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector('app-data-table');
      expect(table).toBeTruthy();
    });

    it('should render page header', () => {
      fixture.detectChanges();
      const header = fixture.nativeElement.querySelector('.page-header h2');
      expect(header.textContent).toContain('Transactions');
    });

    it('should render date filter inputs', () => {
      fixture.detectChanges();
      const inputs = fixture.nativeElement.querySelectorAll('input[type="date"]');
      expect(inputs.length).toBe(2);
    });

    it('should render filter button', () => {
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('.btn-filter');
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Apply');
    });
  });
});
