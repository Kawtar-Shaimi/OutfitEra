import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Clothing {
  id: number;
  name: string;
  description: string;
  category: string;
  gender: string;
  garmentType: string;
  price: number;
  stock: number;
  availableSizes: string[];
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = environment.apiUrl + '/favorites';

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Clothing[]> {
    return this.http.get<Clothing[]>(this.apiUrl);
  }

  getFavoriteIds(): Observable<number[]> {
    return this.http.get<number[]>(this.apiUrl + '/ids');
  }

  addFavorite(clothingId: number): Observable<any> {
    return this.http.post(this.apiUrl + '/' + clothingId, {});
  }

  removeFavorite(clothingId: number): Observable<any> {
    return this.http.delete(this.apiUrl + '/' + clothingId);
  }

  checkFavorite(clothingId: number): Observable<boolean> {
    return this.http.get<boolean>(this.apiUrl + '/check/' + clothingId);
  }
}
