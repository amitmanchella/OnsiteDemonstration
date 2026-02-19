import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$$ = new BehaviorSubject<AppNotification[]>([]);

  getNotifications(): Observable<AppNotification[]> {
    return this.notifications$$.asObservable()
      .pipe(
        map((n: AppNotification[]) => n.filter((x: AppNotification) => !x.read))
      );
  }

  addNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const notification: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    const current = this.notifications$$.getValue();
    this.notifications$$.next([...current, notification]);
  }

  markAsRead(id: string): void {
    const current = this.notifications$$.getValue();
    const updated = current.map((n: AppNotification) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications$$.next(updated);
  }

  getUnreadCount(): Observable<number> {
    return this.notifications$$.asObservable()
      .pipe(
        map((notifications: AppNotification[]) =>
          notifications.filter((n: AppNotification) => !n.read).length
        ),
        startWith(0)
      );
  }
}
