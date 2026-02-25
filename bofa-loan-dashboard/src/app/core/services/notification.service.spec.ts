import { TestBed } from '@angular/core/testing';
import { NotificationService, AppNotification } from './notification.service';
import { first, skip } from 'rxjs/operators';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotifications', () => {
    it('should return empty array initially', (done) => {
      service.getNotifications().pipe(first()).subscribe(notifications => {
        expect(notifications).toEqual([]);
        done();
      });
    });

    it('should return only unread notifications', (done) => {
      service.addNotification('Test 1', 'info');
      service.addNotification('Test 2', 'success');

      service.getNotifications().pipe(first()).subscribe(notifications => {
        expect(notifications.length).toBe(2);
        expect(notifications.every(n => !n.read)).toBe(true);
        done();
      });
    });

    it('should exclude read notifications', (done) => {
      service.addNotification('Test 1', 'info');
      service.addNotification('Test 2', 'success');

      service.getNotifications().pipe(first()).subscribe(notifications => {
        const firstId = notifications[0].id;
        service.markAsRead(firstId);

        service.getNotifications().pipe(first()).subscribe(updated => {
          expect(updated.length).toBe(1);
          expect(updated[0].message).toBe('Test 2');
          done();
        });
      });
    });
  });

  describe('addNotification', () => {
    it('should add a notification with correct properties', (done) => {
      service.addNotification('Test message', 'error');

      service.getNotifications().pipe(first()).subscribe(notifications => {
        expect(notifications.length).toBe(1);
        const n = notifications[0];
        expect(n.message).toBe('Test message');
        expect(n.type).toBe('error');
        expect(n.read).toBe(false);
        expect(n.id).toBeTruthy();
        expect(n.timestamp).toBeTruthy();
        done();
      });
    });

    it('should add multiple notifications', (done) => {
      service.addNotification('First', 'info');
      service.addNotification('Second', 'warning');
      service.addNotification('Third', 'success');

      service.getNotifications().pipe(first()).subscribe(notifications => {
        expect(notifications.length).toBe(3);
        done();
      });
    });

    it('should support all notification types', () => {
      const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info'];
      types.forEach(type => {
        service.addNotification(`${type} msg`, type);
      });

      service.getNotifications().pipe(first()).subscribe(notifications => {
        expect(notifications.length).toBe(4);
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', (done) => {
      service.addNotification('To be read', 'info');

      service.getNotifications().pipe(first()).subscribe(notifications => {
        const id = notifications[0].id;
        service.markAsRead(id);

        service.getNotifications().pipe(first()).subscribe(updated => {
          expect(updated.length).toBe(0);
          done();
        });
      });
    });

    it('should not affect other notifications when marking one as read', (done) => {
      service.addNotification('Keep unread', 'info');
      service.addNotification('Mark read', 'warning');

      service.getNotifications().pipe(first()).subscribe(notifications => {
        const secondId = notifications[1].id;
        service.markAsRead(secondId);

        service.getNotifications().pipe(first()).subscribe(updated => {
          expect(updated.length).toBe(1);
          expect(updated[0].message).toBe('Keep unread');
          done();
        });
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should start with 0', (done) => {
      service.getUnreadCount().pipe(first()).subscribe(count => {
        expect(count).toBe(0);
        done();
      });
    });

    it('should return correct count after adding notifications', (done) => {
      service.addNotification('One', 'info');
      service.addNotification('Two', 'info');

      // startWith(0) emits first, then BehaviorSubject value - skip the startWith
      service.getUnreadCount().pipe(skip(1), first()).subscribe(count => {
        expect(count).toBe(2);
        done();
      });
    });

    it('should decrease count after marking as read', (done) => {
      service.addNotification('Read me', 'info');
      service.addNotification('Keep me', 'info');

      service.getNotifications().pipe(first()).subscribe(notifications => {
        service.markAsRead(notifications[0].id);

        // startWith(0) emits first, then BehaviorSubject value - skip the startWith
        service.getUnreadCount().pipe(skip(1), first()).subscribe(count => {
          expect(count).toBe(1);
          done();
        });
      });
    });
  });
});
