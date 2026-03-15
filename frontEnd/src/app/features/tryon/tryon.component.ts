import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as TryOnActions from '../../store/tryon/tryon.actions';
import { ModelResult } from '../../store/tryon/tryon.actions';
import { selectIdmVtonResult, selectFashnResult, selectSaving } from '../../store/tryon/tryon.selectors';

interface Clothing {
  id: number;
  name: string;
  category: string;
  gender: string;
  garmentType: string;
  price: number;
  imageUrl: string;
}

interface SingleModelResponse {
  modelName: string;
  image?: string;
  error?: string;
  durationMs: number;
  success: boolean;
}

@Component({
  selector: 'app-tryon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tryon.component.html',
  styleUrls: ['./tryon.component.css']
})
export class TryonComponent implements OnInit, OnDestroy {
  @ViewChild('personInput') personInputRef!: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();

  // Articles
  tops: Clothing[] = [];
  bottoms: Clothing[] = [];

  // Filtres genre
  topGenderFilter: 'FEMME' | 'HOMME' = 'FEMME';
  bottomGenderFilter: 'FEMME' | 'HOMME' = 'FEMME';

  // Sélections
  selectedTop: Clothing | null = null;
  selectedBottom: Clothing | null = null;

  // Photo utilisateur
  personImage: File | null = null;
  personPreview: string | null = null;

  // État
  loading = false;
  loadingArticles = true;
  error: string | null = null;
  saving = false;

  // Résultats des deux modèles (from NgRx store)
  idmVtonResult: ModelResult = {
    modelName: 'IDM-VTON',
    image: null,
    error: null,
    durationMs: 0,
    success: false,
    loading: false,
    savedToGallery: false
  };

  fashnResult: ModelResult = {
    modelName: 'FASHN AI',
    image: null,
    error: null,
    durationMs: 0,
    success: false,
    loading: false,
    savedToGallery: false
  };

  // Lightbox
  showLightbox = false;
  lightboxImage: string | null = null;

  private idmVtonUrl = environment.apiUrl + '/tryon/test/idm-vton';
  private fashnUrl = environment.apiUrl + '/tryon/test/fashn';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {}

  ngOnInit() {
    this.loadArticles();

    // Subscribe to store for persistent results
    this.store.select(selectIdmVtonResult).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.idmVtonResult = result;
      this.cdr.detectChanges();
    });

    this.store.select(selectFashnResult).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.fashnResult = result;
      this.cdr.detectChanges();
    });

    this.store.select(selectSaving).pipe(takeUntil(this.destroy$)).subscribe(saving => {
      this.saving = saving;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadArticles() {
    this.loadingArticles = true;
    this.http.get<Clothing[]>(environment.apiUrl + '/clothing').subscribe({
      next: (data) => {
        this.tops = data.filter(item => item.category === 'TOP');
        this.bottoms = data.filter(item => item.category === 'BOTTOM' || item.category === 'DRESS');
        this.loadingArticles = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingArticles = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredTops(): Clothing[] {
    return this.tops.filter(item => item.gender === this.topGenderFilter);
  }

  get filteredBottoms(): Clothing[] {
    return this.bottoms.filter(item => item.gender === this.bottomGenderFilter);
  }

  selectTop(item: Clothing) {
    this.selectedTop = this.selectedTop?.id === item.id ? null : item;
  }

  selectBottom(item: Clothing) {
    this.selectedBottom = this.selectedBottom?.id === item.id ? null : item;
  }

  onPersonImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.personImage = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.personPreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removePersonImage() {
    this.personImage = null;
    this.personPreview = null;
    if (this.personInputRef) {
      this.personInputRef.nativeElement.value = '';
    }
  }

  getImageUrl(url: string): string {
    if (!url) return 'assets/placeholder.png';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + url;
  }

  canTryOn(): boolean {
    return !!this.personImage && (!!this.selectedTop || !!this.selectedBottom);
  }

  getValidationMessage(): string {
    if (!this.personImage) {
      return 'Veuillez ajouter votre photo';
    }
    if (!this.selectedTop && !this.selectedBottom) {
      return 'Veuillez sélectionner au moins un vêtement (haut ou bas)';
    }
    return '';
  }

  async tryOn() {
    const validationMessage = this.getValidationMessage();
    if (validationMessage) {
      this.error = validationMessage;
      return;
    }

    this.loading = true;
    this.error = null;

    const garmentToTry = this.selectedTop || this.selectedBottom;
    if (!garmentToTry) return;

    // Reset results in store
    const resetIdm: ModelResult = {
      modelName: 'IDM-VTON',
      image: null,
      error: null,
      durationMs: 0,
      success: false,
      loading: true,
      clothingId: garmentToTry.id,
      savedToGallery: false
    };
    const resetFashn: ModelResult = {
      modelName: 'FASHN AI',
      image: null,
      error: null,
      durationMs: 0,
      success: false,
      loading: true,
      clothingId: garmentToTry.id,
      savedToGallery: false
    };
    this.store.dispatch(TryOnActions.setIdmVtonResult({ result: resetIdm }));
    this.store.dispatch(TryOnActions.setFashnResult({ result: resetFashn }));

    try {
      const garmentImageUrl = this.getImageUrl(garmentToTry.imageUrl);
      const garmentBlob = await this.fetchImageAsBlob(garmentImageUrl);
      const garmentFile = new File([garmentBlob], 'garment.jpg', { type: 'image/jpeg' });

      // FormData pour IDM-VTON
      const formDataIdm = new FormData();
      formDataIdm.append('personImage', this.personImage!);
      formDataIdm.append('garmentImage', garmentFile);

      // FormData pour FASHN
      const formDataFashn = new FormData();
      formDataFashn.append('personImage', this.personImage!);
      formDataFashn.append('garmentImage', garmentFile);

      // Lancer IDM-VTON
      this.http.post<SingleModelResponse>(this.idmVtonUrl, formDataIdm).subscribe({
        next: (response) => {
          const result: ModelResult = {
            modelName: response.modelName || 'IDM-VTON',
            image: response.image ? 'data:image/png;base64,' + response.image : null,
            error: response.error || null,
            durationMs: response.durationMs,
            success: response.success,
            loading: false,
            clothingId: garmentToTry.id,
            savedToGallery: false
          };
          this.store.dispatch(TryOnActions.setIdmVtonResult({ result }));
          this.checkAllComplete();
        },
        error: () => {
          const result: ModelResult = {
            ...resetIdm,
            error: 'Erreur IDM-VTON',
            loading: false
          };
          this.store.dispatch(TryOnActions.setIdmVtonResult({ result }));
          this.checkAllComplete();
        }
      });

      // Lancer FASHN AI
      this.http.post<SingleModelResponse>(this.fashnUrl, formDataFashn).subscribe({
        next: (response) => {
          const result: ModelResult = {
            modelName: response.modelName || 'FASHN AI',
            image: response.image ? 'data:image/png;base64,' + response.image : null,
            error: response.error || null,
            durationMs: response.durationMs,
            success: response.success,
            loading: false,
            clothingId: garmentToTry.id,
            savedToGallery: false
          };
          this.store.dispatch(TryOnActions.setFashnResult({ result }));
          this.checkAllComplete();
        },
        error: () => {
          const result: ModelResult = {
            ...resetFashn,
            error: 'Erreur FASHN AI',
            loading: false
          };
          this.store.dispatch(TryOnActions.setFashnResult({ result }));
          this.checkAllComplete();
        }
      });
    } catch {
      this.error = 'Erreur lors du chargement de l\'image du vêtement';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private checkAllComplete() {
    if (!this.idmVtonResult.loading && !this.fashnResult.loading) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async fetchImageAsBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return response.blob();
  }

  hasResults(): boolean {
    return this.loading ||
           this.idmVtonResult.loading || this.fashnResult.loading ||
           !!this.idmVtonResult.image || !!this.idmVtonResult.error ||
           !!this.fashnResult.image || !!this.fashnResult.error;
  }

  saveToGallery(modelResult: ModelResult) {
    if (!modelResult.image || modelResult.savedToGallery) return;

    this.store.dispatch(TryOnActions.saveToGallery({
      image: modelResult.image,
      modelName: modelResult.modelName,
      clothingId: modelResult.clothingId
    }));
  }

  openLightbox(imageUrl: string) {
    this.lightboxImage = imageUrl;
    this.showLightbox = true;
  }

  closeLightbox() {
    this.showLightbox = false;
    this.lightboxImage = null;
  }

  formatDuration(ms: number): string {
    return (ms / 1000).toFixed(1) + 's';
  }

  reset() {
    this.selectedTop = null;
    this.selectedBottom = null;
    this.personImage = null;
    this.personPreview = null;
    this.error = null;
    this.store.dispatch(TryOnActions.resetResults());
    if (this.personInputRef) {
      this.personInputRef.nativeElement.value = '';
    }
  }
}
