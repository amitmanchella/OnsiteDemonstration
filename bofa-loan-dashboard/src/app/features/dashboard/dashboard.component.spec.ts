import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../core/services/api.service';
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-loan-summary', standalone: true, template: '' })
class MockLoanSummaryComponent {}

@Component({ selector: 'app-recent-activity', standalone: true, template: '' })
class MockRecentActivityComponent {}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockStats = {
    totalLoans: 10,
    totalAmount: 500000,
    activeLoans: 4,
    pendingApplications: 3,
    averageRiskScore: 65.5
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getDashboardStats']);
    apiSpy.getDashboardStats.and.returnValue(of(mockStats));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .overrideComponent(DashboardComponent, {
      set: {
        imports: [MockLoanSummaryComponent, MockRecentActivityComponent]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getDashboardStats on creation', () => {
    expect(apiService.getDashboardStats).toHaveBeenCalled();
  });

  it('should set stats$ observable', (done) => {
    component.stats$.subscribe(stats => {
      expect(stats).toEqual(mockStats);
      done();
    });
  });

  it('should handle error gracefully', () => {
    apiService.getDashboardStats.and.returnValue(throwError(() => new Error('Server error')));
    const newFixture = TestBed.createComponent(DashboardComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.stats$.subscribe({
      next: (val) => {
        // catchError returns [] so this may emit empty
      },
      error: () => fail('should not propagate error')
    });
  });

  it('should render dashboard grid', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dashboard-grid')).toBeTruthy();
  });

  it('should render loan summary widget', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-loan-summary')).toBeTruthy();
  });

  it('should render recent activity widget', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-recent-activity')).toBeTruthy();
  });

  describe('onSearch', () => {
    it('should log search term', () => {
      spyOn(console, 'log');
      component.onSearch('test query');
      expect(console.log).toHaveBeenCalledWith('Search term:', 'test query');
    });
  });
});
