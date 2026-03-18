import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItemResponse {
  id: number;
  clothingId: number;
  clothingName: string;
  imageUrl: string;
  size: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadCart(): void {
    this.http.get<CartResponse>(this.apiUrl).subscribe({
      next: (cart) => this.cartSubject.next(cart),
      error: (err) => console.error('Erreur chargement panier', err)
    });
  }

  addToCart(clothingId: number, size: string, quantity: number): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/add`, {
      clothingId: clothingId,
      size,
      quantity
    }).pipe(
      tap(updatedCart => this.cartSubject.next(updatedCart))
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.apiUrl}/update/${itemId}`, null, {
      params: { quantity: quantity.toString() }
    }).pipe(
      tap(updatedCart => this.cartSubject.next(updatedCart))
    );
  }

  removeFromCart(itemId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/remove/${itemId}`).pipe(
      tap(updatedCart => this.cartSubject.next(updatedCart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }
}
