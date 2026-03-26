import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItemResponse {
  id: number;
  clothingId: number;
  clothingName: string;
  imageUrl: string;
  size: string;
  quantity: number;
  priceAtOrder: number;
  subTotal: number;
}

export interface OrderResponse {
  id: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItemResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  getUserOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.apiUrl);
  }
}
