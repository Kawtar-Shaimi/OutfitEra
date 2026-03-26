import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationResponse {
  id: number;
  message: string;
  read: boolean;
  targetId?: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private notificationsSubject = new BehaviorSubject<NotificationResponse[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadUserNotifications() {
    this.http.get<NotificationResponse[]>(this.apiUrl).subscribe({
      next: (notifs) => this.notificationsSubject.next(notifs),
      error: (err) => console.error('Erreur chargement notifications', err)
    });
  }

  loadAdminNotifications() {
    this.http.get<NotificationResponse[]>(`${this.apiUrl}/admin`).subscribe({
      next: (notifs) => this.notificationsSubject.next(notifs),
      error: (err) => console.error('Erreur chargement notifications admin', err)
    });
  }

  markAsRead(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const notifs = this.notificationsSubject.value;
        const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
        this.notificationsSubject.next(updated);
      })
    );
  }

  markAllAsReadUser() {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.loadUserNotifications())
    );
  }

  markAllAsReadAdmin() {
    return this.http.put(`${this.apiUrl}/admin/read-all`, {}).pipe(
      tap(() => this.loadAdminNotifications())
    );
  }
}
