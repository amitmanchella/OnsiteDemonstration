import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('notificationPanel') notificationPanel!: ElementRef;

  showNotifications: boolean = false;
  unreadCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  ngAfterViewInit(): void {
    // No search input to focus anymore
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.notificationPanel && this.notificationPanel.nativeElement) {
      this.notificationPanel.nativeElement.style.display = this.showNotifications ? 'block' : 'none';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
