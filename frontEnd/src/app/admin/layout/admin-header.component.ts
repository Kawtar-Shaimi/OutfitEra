import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, NotificationResponse } from '../../core/services/notification.service';
import { Subscription, interval } from 'rxjs';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div class="flex items-center justify-between h-16 px-4">

        <!-- Left: Menu + Logo -->
        <div class="flex items-center gap-4">
          <!-- Mobile menu button -->
          <button
            (click)="toggleSidebar.emit()"
            class="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Logo -->
          <a routerLink="/admin" class="flex items-center">
            <span class="text-2xl font-bold text-blue-600">Outfitera</span>
          </a>
        </div>

        <!-- Center: Search bar -->
        <div class="hidden md:flex flex-1 max-w-xl mx-8">
          <div class="relative w-full">
            <input
              type="text"
              placeholder="Rechercher..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              (input)="onSearch($event)"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Navigation buttons -->
        <nav class="hidden lg:flex items-center gap-1">
          <a
            routerLink="/admin"
            routerLinkActive="bg-blue-50 text-blue-600"
            [routerLinkActiveOptions]="{exact: true}"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Dashboard
          </a>
          <a
            routerLink="/admin/articles"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Articles
          </a>
          <a
            routerLink="/admin/commandes"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Commandes
          </a>
        </nav>

        <!-- Right: Icons -->
        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <div class="relative">
            <button 
              (click)="toggleNotifications()"
              class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              @if (notificationCount > 0) {
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              }
            </button>

            <!-- Notifications Dropdown -->
            @if (showNotifications) {
              <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <h3 class="font-bold text-gray-800">Notifications Admin</h3>
                  @if (notificationCount > 0) {
                    <button (click)="markAllAsRead()" class="text-xs text-blue-600 hover:underline">
                      Tout marquer comme lu
                    </button>
                  }
                </div>
                <div class="max-h-96 overflow-y-auto">
                  @if (notifications.length === 0) {
                    <div class="p-4 text-center text-gray-500 text-sm">
                      Aucune notification
                    </div>
                  } @else {
                    @for (notif of notifications; track notif.id) {
                      <div 
                        (click)="markAsRead(notif)"
                        class="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition"
                        [class.bg-blue-50]="!notif.read"
                        [class.border-blue-100]="!notif.read"
                      >
                        <p class="text-sm text-gray-800" [class.font-semibold]="!notif.read">
                          {{ notif.message }}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ notif.createdAt | date:'dd/MM/yyyy HH:mm' }}
                        </p>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>

          <!-- Profile / Logout -->
          <button
            (click)="logout()"
            class="hidden sm:flex items-center gap-2 ml-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Deconnexion
          </button>
        </div>
      </div>

      <!-- Mobile navigation -->
      <div class="lg:hidden border-t border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto">
        <a
          routerLink="/admin"
          routerLinkActive="bg-blue-50 text-blue-600"
          [routerLinkActiveOptions]="{exact: true}"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Dashboard
        </a>
        <a
          routerLink="/admin/articles"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Articles
        </a>
        <a
          routerLink="/admin/commandes"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Commandes
        </a>
      </div>
    </header>

    <!-- Spacer for fixed header -->
    <div class="h-16 lg:h-16"></div>
    <div class="lg:hidden h-12"></div>
  `
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  @Input() sidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  notificationCount = 0;
  notifications: NotificationResponse[] = [];
  showNotifications = false;
  private pollingSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private searchService: SearchService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.notificationService.loadAdminNotifications();
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs || [];
      this.notificationCount = this.notifications.filter(n => !n.read).length;
      this.cdr.detectChanges();
    });

    // Simple polling every 30 seconds
    this.pollingSubscription = interval(30000).subscribe(() => {
      this.notificationService.loadAdminNotifications();
    });
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.loadAdminNotifications();
      if (this.notificationCount > 0) {
        this.markAllAsRead();
      }
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(target.value);
  }

  markAsRead(notification: NotificationResponse) {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      this.showNotifications = false;
      const navExtras = notification.targetId ? { queryParams: { orderId: notification.targetId } } : {};
      this.router.navigate(['/admin/commandes'], navExtras);
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsReadAdmin().subscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
