import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent, DataTableColumn } from './data-table.component';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  const mockColumns: DataTableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  const mockData = [
    { name: 'Item 1', amount: 1000, date: '2024-01-15', status: 'active' },
    { name: 'Item 2', amount: 2000, date: '2024-02-15', status: 'pending' },
    { name: 'Item 3', amount: 3000, date: '2024-03-15', status: 'approved' },
    { name: 'Item 4', amount: 4000, date: '2024-04-15', status: 'rejected' },
    { name: 'Item 5', amount: 5000, date: '2024-05-15', status: 'closed' },
    { name: 'Item 6', amount: 6000, date: '2024-06-15', status: 'completed' },
    { name: 'Item 7', amount: 7000, date: '2024-07-15', status: 'failed' },
    { name: 'Item 8', amount: 8000, date: '2024-08-15', status: 'active' },
    { name: 'Item 9', amount: 9000, date: '2024-09-15', status: 'pending' },
    { name: 'Item 10', amount: 10000, date: '2024-10-15', status: 'active' },
    { name: 'Item 11', amount: 11000, date: '2024-11-15', status: 'pending' },
    { name: 'Item 12', amount: 12000, date: '2024-12-15', status: 'approved' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.data).toEqual([]);
    expect(component.columns).toEqual([]);
    expect(component.pageSize).toBe(10);
    expect(component.currentPage).toBe(1);
  });

  describe('ngAfterViewInit', () => {
    it('should set max height on table container', () => {
      component.columns = mockColumns;
      component.data = mockData;
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.table-container');
      expect(container.style.maxHeight).toBe('600px');
      expect(container.style.overflow).toBe('auto');
    });
  });

  describe('ngAfterContentInit', () => {
    it('should warn if no rowActions template provided', () => {
      spyOn(console, 'warn');
      component.ngAfterContentInit();
      expect(console.warn).toHaveBeenCalledWith(jasmine.stringContaining('No rowActions template provided'));
    });
  });

  describe('paginatedData', () => {
    it('should return first page of data', () => {
      component.data = mockData;
      component.pageSize = 10;
      component.currentPage = 1;
      expect(component.paginatedData.length).toBe(10);
      expect(component.paginatedData[0]).toEqual(mockData[0]);
    });

    it('should return second page of data', () => {
      component.data = mockData;
      component.pageSize = 10;
      component.currentPage = 2;
      expect(component.paginatedData.length).toBe(2);
      expect(component.paginatedData[0]).toEqual(mockData[10]);
    });

    it('should return empty array for empty data', () => {
      component.data = [];
      expect(component.paginatedData).toEqual([]);
    });
  });

  describe('totalPages', () => {
    it('should calculate total pages', () => {
      component.data = mockData;
      component.pageSize = 10;
      expect(component.totalPages).toBe(2);
    });

    it('should return 1 for empty data', () => {
      component.data = [];
      component.pageSize = 10;
      expect(component.totalPages).toBe(1);
    });

    it('should handle exact page size', () => {
      component.data = mockData.slice(0, 10);
      component.pageSize = 10;
      expect(component.totalPages).toBe(1);
    });
  });

  describe('nextPage', () => {
    it('should go to next page', () => {
      component.data = mockData;
      component.pageSize = 5;
      component.currentPage = 1;
      component.nextPage();
      expect(component.currentPage).toBe(2);
    });

    it('should not go past last page', () => {
      component.data = mockData;
      component.pageSize = 5;
      component.currentPage = 3; // last page (12 items / 5 = 3 pages)
      component.nextPage();
      expect(component.currentPage).toBe(3);
    });
  });

  describe('prevPage', () => {
    it('should go to previous page', () => {
      component.data = mockData;
      component.currentPage = 2;
      component.prevPage();
      expect(component.currentPage).toBe(1);
    });

    it('should not go before first page', () => {
      component.data = mockData;
      component.currentPage = 1;
      component.prevPage();
      expect(component.currentPage).toBe(1);
    });
  });

  describe('formatValue', () => {
    it('should format date values', () => {
      const result = component.formatValue('2024-01-15', 'date');
      expect(result).toContain('2024');
    });

    it('should format currency values', () => {
      const result = component.formatValue(1000, 'currency');
      expect(result).toContain('1,000');
      expect(result).toContain('$');
    });

    it('should return string for default type', () => {
      expect(component.formatValue('hello')).toBe('hello');
      expect(component.formatValue(42)).toBe('42');
    });

    it('should return dash for null values', () => {
      expect(component.formatValue(null)).toBe('-');
      expect(component.formatValue(undefined)).toBe('-');
    });
  });

  describe('getStatusClass', () => {
    it('should return correct class for each status', () => {
      expect(component.getStatusClass('pending')).toBe('status-pending');
      expect(component.getStatusClass('approved')).toBe('status-approved');
      expect(component.getStatusClass('rejected')).toBe('status-rejected');
      expect(component.getStatusClass('active')).toBe('status-active');
      expect(component.getStatusClass('closed')).toBe('status-closed');
      expect(component.getStatusClass('completed')).toBe('status-completed');
      expect(component.getStatusClass('failed')).toBe('status-failed');
    });

    it('should return default class for unknown status', () => {
      expect(component.getStatusClass('unknown')).toBe('status-default');
    });

    it('should handle case-insensitive status', () => {
      expect(component.getStatusClass('PENDING')).toBe('status-pending');
      expect(component.getStatusClass('Active')).toBe('status-active');
    });
  });

  describe('template', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.data = mockData;
      fixture.detectChanges();
    });

    it('should render table headers', () => {
      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBe(4);
      expect(headers[0].textContent.trim()).toBe('Name');
      expect(headers[1].textContent.trim()).toBe('Amount');
    });

    it('should render data rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(10); // pageSize is 10
    });

    it('should show pagination when data exceeds pageSize', () => {
      const pagination = fixture.nativeElement.querySelector('.pagination');
      expect(pagination).toBeTruthy();
    });

    it('should show no data message when empty', () => {
      component.data = [];
      fixture.detectChanges();
      const noData = fixture.nativeElement.querySelector('.no-data');
      expect(noData).toBeTruthy();
      expect(noData.textContent.trim()).toBe('No data available');
    });

    it('should show status badges for status columns', () => {
      const badges = fixture.nativeElement.querySelectorAll('.status-badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
