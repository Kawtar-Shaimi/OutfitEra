import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GalleryItem {
  id: number;
  resultImageUrl: string;
  modelName: string;
  clothing?: {
    id: number;
    name: string;
    imageUrl: string;
  };
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = environment.apiUrl + '/tryon';

  constructor(private http: HttpClient) {}

  getMyGallery(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(this.apiUrl + '/my-results');
  }

  saveToGallery(image: string, modelName: string, clothingId?: number): Observable<GalleryItem> {
    return this.http.post<GalleryItem>(this.apiUrl + '/save-to-gallery', {
      image,
      modelName,
      clothingId
    });
  }

  deleteFromGallery(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/gallery/' + id);
  }
}
