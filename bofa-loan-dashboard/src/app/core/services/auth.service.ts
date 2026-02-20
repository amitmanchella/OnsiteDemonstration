import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, pluck } from 'rxjs/operators';
import { User, LoginCredentials } from '../models/user.model';
import { ApiResponse } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.get<User[]>('assets/mock-data/users.json')
      .pipe(
        map(users => {
          const user = users[0];
          this.setCurrentUser(user);
          localStorage.setItem(this.tokenKey, 'mock-jwt-token');
          return user;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('current_user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem('current_user', JSON.stringify(user));
  }
}
