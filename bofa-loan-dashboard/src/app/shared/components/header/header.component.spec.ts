import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['getUnreadCount']);
    notificationServiceSpy.getUnreadCount.and.returnValue(of(3));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showNotifications).toBe(false);
  });

  it('should get unread count from notification service', () => {
    expect(notificationServiceSpy.getUnreadCount).toHaveBeenCalled();
    expect(component.unreadCount$).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should execute without error', () => {
      fixture.detectChanges();
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });
  });

  describe('toggleNotifications', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle showNotifications from false to true', () => {
      component.showNotifications = false;
      component.toggleNotifications();
      expect(component.showNotifications).toBe(true);
    });

    it('should toggle showNotifications from true to false', () => {
      component.showNotifications = true;
      component.toggleNotifications();
      expect(component.showNotifications).toBe(false);
    });

    it('should set notification panel display to block when shown', () => {
      component.showNotifications = false;
      component.toggleNotifications();
      const panel = fixture.nativeElement.querySelector('.notification-panel');
      expect(panel.style.display).toBe('block');
    });

    it('should set notification panel display to none when hidden', () => {
      component.showNotifications = true;
      component.toggleNotifications();
      const panel = fixture.nativeElement.querySelector('.notification-panel');
      expect(panel.style.display).toBe('none');
    });
  });

  describe('logout', () => {
    it('should call authService.logout', () => {
      component.logout();
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should navigate to login page', () => {
      component.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render header element', () => {
      const header = fixture.nativeElement.querySelector('.header');
      expect(header).toBeTruthy();
    });

    it('should render logo', () => {
      const logo = fixture.nativeElement.querySelector('.logo h1');
      expect(logo.textContent).toContain('BofA Loan Operations');
    });

    it('should render notification button', () => {
      const notifBtn = fixture.nativeElement.querySelector('.notification-button');
      expect(notifBtn).toBeTruthy();
    });

    it('should render logout button', () => {
      const logoutBtn = fixture.nativeElement.querySelector('.user-button');
      expect(logoutBtn).toBeTruthy();
      expect(logoutBtn.textContent).toContain('Logout');
    });

    it('should call toggleNotifications when notification button clicked', () => {
      spyOn(component, 'toggleNotifications');
      const notifBtn = fixture.nativeElement.querySelector('.notification-button');
      notifBtn.click();
      expect(component.toggleNotifications).toHaveBeenCalled();
    });

    it('should call logout when logout button clicked', () => {
      spyOn(component, 'logout');
      const logoutBtn = fixture.nativeElement.querySelector('.user-button');
      logoutBtn.click();
      expect(component.logout).toHaveBeenCalled();
    });
  });
});
