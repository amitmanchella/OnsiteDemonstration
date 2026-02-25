import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 'U001',
    username: 'admin',
    email: 'admin@bofa.com',
    role: 'loan_officer',
    firstName: 'John',
    lastName: 'Doe'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send GET request to users.json and return user', () => {
      service.login({ username: 'admin', password: 'password' }).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('assets/mock-data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush([mockUser]);
    });

    it('should set current user and token on successful login', () => {
      service.login({ username: 'admin', password: 'password' }).subscribe(() => {
        expect(service.getCurrentUser()).toEqual(mockUser);
        expect(service.getToken()).toBe('mock-jwt-token');
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne('assets/mock-data/users.json');
      req.flush([mockUser]);
    });

    it('should store token in localStorage', () => {
      service.login({ username: 'admin', password: 'password' }).subscribe(() => {
        expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
      });

      const req = httpMock.expectOne('assets/mock-data/users.json');
      req.flush([mockUser]);
    });

    it('should store current_user in localStorage', () => {
      service.login({ username: 'admin', password: 'password' }).subscribe(() => {
        const stored = localStorage.getItem('current_user');
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored!)).toEqual(mockUser);
      });

      const req = httpMock.expectOne('assets/mock-data/users.json');
      req.flush([mockUser]);
    });

    it('should propagate HTTP errors', () => {
      service.login({ username: 'admin', password: 'password' }).subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('assets/mock-data/users.json');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('logout', () => {
    it('should clear currentUser', () => {
      service.setCurrentUser(mockUser);
      service.logout();
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should remove auth_token from localStorage', () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      service.logout();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should remove current_user from localStorage', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      service.logout();
      expect(localStorage.getItem('current_user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token exists in localStorage', () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getToken', () => {
    it('should return null when no token is set', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });
  });

  describe('getCurrentUser / setCurrentUser', () => {
    it('should return null initially', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return user after setCurrentUser', () => {
      service.setCurrentUser(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should persist user to localStorage on setCurrentUser', () => {
      service.setCurrentUser(mockUser);
      const stored = JSON.parse(localStorage.getItem('current_user')!);
      expect(stored).toEqual(mockUser);
    });
  });
});
