import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockLoanOfficer: User = {
    id: 'U001', username: 'admin', email: 'admin@bofa.com',
    role: 'loan_officer', firstName: 'John', lastName: 'Doe'
  };

  const mockManager: User = {
    id: 'U002', username: 'manager', email: 'manager@bofa.com',
    role: 'manager', firstName: 'Jane', lastName: 'Smith'
  };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access when user has the expected role', () => {
    authService.getCurrentUser.and.returnValue(mockLoanOfficer);
    const route = { data: { role: 'loan_officer' } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/loans' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(true);
  });

  it('should deny access and redirect when user has wrong role', () => {
    authService.getCurrentUser.and.returnValue(mockManager);
    const route = { data: { role: 'loan_officer' } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/loans' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should deny access and redirect when no user is logged in', () => {
    authService.getCurrentUser.and.returnValue(null);
    const route = { data: { role: 'loan_officer' } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/loans' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should not navigate when user has correct role', () => {
    authService.getCurrentUser.and.returnValue(mockLoanOfficer);
    const route = { data: { role: 'loan_officer' } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/loans' } as RouterStateSnapshot;
    TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should check admin role correctly', () => {
    const adminUser: User = {
      id: 'U003', username: 'admin2', email: 'admin2@bofa.com',
      role: 'admin', firstName: 'Admin', lastName: 'User'
    };
    authService.getCurrentUser.and.returnValue(adminUser);
    const route = { data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBe(true);
  });
});
