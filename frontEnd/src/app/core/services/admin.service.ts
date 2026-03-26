import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface AdminOrderItem {
  id: number;
  clothing: { name: string, price: number };
  size: string;
  quantity: number;
  subTotal: number;
}

export interface AdminOrder {
  id: number;
  user: { id: number, email: string, firstName: string, lastName: string };
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  items: AdminOrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${this.apiUrl}/orders`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.apiUrl}/orders/${orderId}/status?status=${status}`, {});
  }
}

