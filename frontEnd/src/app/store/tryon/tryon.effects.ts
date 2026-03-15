import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { GalleryService } from '../../core/services/gallery.service';
import * as TryOnActions from './tryon.actions';

@Injectable()
export class TryOnEffects {
  private actions$ = inject(Actions);
  private galleryService = inject(GalleryService);

  saveToGallery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TryOnActions.saveToGallery),
      mergeMap(({ image, modelName, clothingId }) =>
        this.galleryService.saveToGallery(image, modelName, clothingId).pipe(
          map(() => TryOnActions.saveToGallerySuccess({ modelName })),
          catchError(error => of(TryOnActions.saveToGalleryFailure({ error: error.message })))
        )
      )
    )
  );
}
