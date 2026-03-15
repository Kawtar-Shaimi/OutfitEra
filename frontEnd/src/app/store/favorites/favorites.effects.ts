import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FavoritesService } from '../../core/services/favorites.service';
import * as FavoritesActions from './favorites.actions';
import { selectFavoriteIds } from './favorites.selectors';

@Injectable()
export class FavoritesEffects {
  private actions$ = inject(Actions);
  private favoritesService = inject(FavoritesService);
  private store = inject(Store);

  loadFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadFavorites),
      mergeMap(() =>
        this.favoritesService.getFavoriteIds().pipe(
          map(favoriteIds => FavoritesActions.loadFavoritesSuccess({ favoriteIds })),
          catchError(error => of(FavoritesActions.loadFavoritesFailure({ error: error.message })))
        )
      )
    )
  );

  addFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addFavorite),
      mergeMap(({ clothingId }) =>
        this.favoritesService.addFavorite(clothingId).pipe(
          map(() => FavoritesActions.addFavoriteSuccess({ clothingId })),
          catchError(error => of(FavoritesActions.addFavoriteFailure({ error: error.message })))
        )
      )
    )
  );

  removeFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFavorite),
      mergeMap(({ clothingId }) =>
        this.favoritesService.removeFavorite(clothingId).pipe(
          map(() => FavoritesActions.removeFavoriteSuccess({ clothingId })),
          catchError(error => of(FavoritesActions.removeFavoriteFailure({ error: error.message })))
        )
      )
    )
  );

  toggleFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.toggleFavorite),
      withLatestFrom(this.store.select(selectFavoriteIds)),
      mergeMap(([{ clothingId }, favoriteIds]) => {
        if (favoriteIds.includes(clothingId)) {
          return of(FavoritesActions.removeFavorite({ clothingId }));
        } else {
          return of(FavoritesActions.addFavorite({ clothingId }));
        }
      })
    )
  );
}
