import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: User = {
    id: 'U001', username: 'admin', email: 'admin@bofa.com',
    role: 'loan_officer', firstName: 'John', lastName: 'Doe'
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideRouter([{ path: 'dashboard', component: LoginComponent }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty fields', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.loading).toBe(false);
  });

  describe('onLogin', () => {
    it('should show error when username is empty', () => {
      component.username = '';
      component.password = 'password';
      component.onLogin();
      expect(component.errorMessage).toBe('Please enter both username and password');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', () => {
      component.username = 'admin';
      component.password = '';
      component.onLogin();
      expect(component.errorMessage).toBe('Please enter both username and password');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show error when both fields are empty', () => {
      component.username = '';
      component.password = '';
      component.onLogin();
      expect(component.errorMessage).toBe('Please enter both username and password');
    });

    it('should set loading to true and clear error on valid submit', () => {
      authService.login.and.returnValue(of(mockUser));
      component.username = 'admin';
      component.password = 'password';
      component.onLogin();
      expect(authService.login).toHaveBeenCalledWith({ username: 'admin', password: 'password' });
    });

    it('should navigate to dashboard on successful login', fakeAsync(() => {
      authService.login.and.returnValue(of(mockUser));
      spyOn(router, 'navigate');
      component.username = 'admin';
      component.password = 'password';
      component.onLogin();
      tick();
      expect(component.loading).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should show error message on login failure', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => ({ message: 'Invalid credentials' })));
      component.username = 'admin';
      component.password = 'wrong';
      component.onLogin();
      tick();
      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('Invalid credentials');
    }));

    it('should show default error message when error has no message', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => ({})));
      component.username = 'admin';
      component.password = 'wrong';
      component.onLogin();
      tick();
      expect(component.errorMessage).toBe('Login failed. Please try again.');
    }));
  });

  describe('template', () => {
    it('should render login form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('form')).toBeTruthy();
      expect(compiled.querySelector('input#username')).toBeTruthy();
      expect(compiled.querySelector('input#password')).toBeTruthy();
      expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    });

    it('should display title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent).toContain('BofA Loan Operations');
    });

    it('should show error message when present', () => {
      component.errorMessage = 'Test error';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.error-message')?.textContent).toContain('Test error');
    });

    it('should disable button when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBe(true);
      expect(button.textContent).toContain('Signing in...');
    });

    it('should show Sign In text when not loading', () => {
      component.loading = false;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.textContent).toContain('Sign In');
    });
  });
});
