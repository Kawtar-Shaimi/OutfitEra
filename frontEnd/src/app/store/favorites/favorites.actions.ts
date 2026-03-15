import { createAction, props } from '@ngrx/store';

export const loadFavorites = createAction('[Favorites] Load Favorites');

export const loadFavoritesSuccess = createAction(
  '[Favorites] Load Favorites Success',
  props<{ favoriteIds: number[] }>()
);

export const loadFavoritesFailure = createAction(
  '[Favorites] Load Favorites Failure',
  props<{ error: string }>()
);

export const addFavorite = createAction(
  '[Favorites] Add Favorite',
  props<{ clothingId: number }>()
);

export const addFavoriteSuccess = createAction(
  '[Favorites] Add Favorite Success',
  props<{ clothingId: number }>()
);

export const addFavoriteFailure = createAction(
  '[Favorites] Add Favorite Failure',
  props<{ error: string }>()
);

export const removeFavorite = createAction(
  '[Favorites] Remove Favorite',
  props<{ clothingId: number }>()
);

export const removeFavoriteSuccess = createAction(
  '[Favorites] Remove Favorite Success',
  props<{ clothingId: number }>()
);

export const removeFavoriteFailure = createAction(
  '[Favorites] Remove Favorite Failure',
  props<{ error: string }>()
);

export const toggleFavorite = createAction(
  '[Favorites] Toggle Favorite',
  props<{ clothingId: number }>()
);
