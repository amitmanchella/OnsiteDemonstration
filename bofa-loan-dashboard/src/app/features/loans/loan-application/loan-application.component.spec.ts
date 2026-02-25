import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoanApplicationComponent } from './loan-application.component';
import { ApiService } from '../../../core/services/api.service';
import { Loan } from '../../../core/models/loan.model';

describe('LoanApplicationComponent', () => {
  let component: LoanApplicationComponent;
  let fixture: ComponentFixture<LoanApplicationComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: Router;

  const mockCreatedLoan: Loan = {
    id: 'LN-2024-001', applicantName: 'New Applicant', amount: 100000,
    interestRate: 6.0, term: 120, status: 'pending',
    applicationDate: '2024-03-01', riskScore: 50, type: 'business'
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['createLoan']);
    apiSpy.createLoan.and.returnValue(of(mockCreatedLoan));

    await TestBed.configureTestingModule({
      imports: [LoanApplicationComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanApplicationComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.applicationForm).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should create form with all required controls', () => {
      expect(component.applicationForm.contains('applicantName')).toBe(true);
      expect(component.applicationForm.contains('amount')).toBe(true);
      expect(component.applicationForm.contains('interestRate')).toBe(true);
      expect(component.applicationForm.contains('term')).toBe(true);
      expect(component.applicationForm.contains('type')).toBe(true);
      expect(component.applicationForm.contains('riskScore')).toBe(true);
    });

    it('should have empty initial values', () => {
      expect(component.f['applicantName'].value).toBe('');
      expect(component.f['amount'].value).toBeNull();
      expect(component.f['interestRate'].value).toBeNull();
      expect(component.f['term'].value).toBeNull();
      expect(component.f['type'].value).toBe('');
      expect(component.f['riskScore'].value).toBe(50);
    });

    it('should be invalid initially', () => {
      expect(component.applicationForm.valid).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should be invalid when applicantName is too short', () => {
      component.f['applicantName'].setValue('A');
      expect(component.f['applicantName'].valid).toBe(false);
    });

    it('should be valid when applicantName has 2+ characters', () => {
      component.f['applicantName'].setValue('AB');
      expect(component.f['applicantName'].valid).toBe(true);
    });

    it('should reject amount below 1000', () => {
      component.f['amount'].setValue(500);
      expect(component.f['amount'].valid).toBe(false);
    });

    it('should reject amount above 10000000', () => {
      component.f['amount'].setValue(20000000);
      expect(component.f['amount'].valid).toBe(false);
    });

    it('should accept valid amount', () => {
      component.f['amount'].setValue(50000);
      expect(component.f['amount'].valid).toBe(true);
    });

    it('should reject interest rate above 30', () => {
      component.f['interestRate'].setValue(35);
      expect(component.f['interestRate'].valid).toBe(false);
    });

    it('should reject negative interest rate', () => {
      component.f['interestRate'].setValue(-1);
      expect(component.f['interestRate'].valid).toBe(false);
    });

    it('should accept valid interest rate', () => {
      component.f['interestRate'].setValue(5.5);
      expect(component.f['interestRate'].valid).toBe(true);
    });

    it('should reject term below 6 months', () => {
      component.f['term'].setValue(3);
      expect(component.f['term'].valid).toBe(false);
    });

    it('should reject term above 360 months', () => {
      component.f['term'].setValue(400);
      expect(component.f['term'].valid).toBe(false);
    });

    it('should accept valid term', () => {
      component.f['term'].setValue(60);
      expect(component.f['term'].valid).toBe(true);
    });

    it('should reject risk score above 100', () => {
      component.f['riskScore'].setValue(150);
      expect(component.f['riskScore'].valid).toBe(false);
    });

    it('should reject negative risk score', () => {
      component.f['riskScore'].setValue(-5);
      expect(component.f['riskScore'].valid).toBe(false);
    });

    it('should be valid with all correct values', () => {
      component.applicationForm.patchValue({
        applicantName: 'John Doe',
        amount: 50000,
        interestRate: 5.5,
        term: 60,
        type: 'personal',
        riskScore: 72
      });
      expect(component.applicationForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not call createLoan if form is invalid', () => {
      component.onSubmit();
      expect(apiService.createLoan).not.toHaveBeenCalled();
    });

    it('should call createLoan with form values when valid', () => {
      component.applicationForm.patchValue({
        applicantName: 'John Doe',
        amount: 50000,
        interestRate: 5.5,
        term: 60,
        type: 'personal',
        riskScore: 72
      });
      component.onSubmit();
      expect(apiService.createLoan).toHaveBeenCalledWith({
        applicantName: 'John Doe',
        amount: 50000,
        interestRate: 5.5,
        term: 60,
        type: 'personal',
        riskScore: 72
      });
    });

    it('should navigate to loan detail on success', fakeAsync(() => {
      spyOn(router, 'navigate');
      component.applicationForm.patchValue({
        applicantName: 'John Doe',
        amount: 50000,
        interestRate: 5.5,
        term: 60,
        type: 'personal',
        riskScore: 72
      });
      component.onSubmit();
      tick();
      expect(component.loading).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/loans', 'LN-2024-001']);
    }));

    it('should show error message on failure', fakeAsync(() => {
      apiService.createLoan.and.returnValue(throwError(() => ({ message: 'Create failed' })));
      component.applicationForm.patchValue({
        applicantName: 'John Doe',
        amount: 50000,
        interestRate: 5.5,
        term: 60,
        type: 'personal',
        riskScore: 72
      });
      component.onSubmit();
      tick();
      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('Create failed');
    }));

    it('should show default error message when no message property', fakeAsync(() => {
      apiService.createLoan.and.returnValue(throwError(() => ({})));
      component.applicationForm.patchValue({
        applicantName: 'John Doe',
        amount: 50000,
        interestRate: 5.5,
        term: 60,
        type: 'personal',
        riskScore: 72
      });
      component.onSubmit();
      tick();
      expect(component.errorMessage).toBe('Failed to create loan application');
    }));
  });

  describe('loanTypes', () => {
    it('should have 4 loan types', () => {
      expect(component.loanTypes.length).toBe(4);
    });

    it('should include personal, mortgage, auto, business', () => {
      const values = component.loanTypes.map(t => t.value);
      expect(values).toEqual(['personal', 'mortgage', 'auto', 'business']);
    });
  });

  describe('f getter', () => {
    it('should return form controls', () => {
      const controls = component.f;
      expect(controls['applicantName']).toBeTruthy();
      expect(controls['amount']).toBeTruthy();
    });
  });

  describe('template', () => {
    it('should render form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('form')).toBeTruthy();
    });

    it('should render page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h2')?.textContent).toContain('New Loan Application');
    });

    it('should show error message when present', () => {
      component.errorMessage = 'Test error';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.error-message')?.textContent).toContain('Test error');
    });

    it('should disable submit button when form is invalid', () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBe(true);
    });
  });
});
