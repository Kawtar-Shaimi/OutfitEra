import { createReducer, on } from '@ngrx/store';
import * as FavoritesActions from './favorites.actions';

export interface FavoritesState {
  favoriteIds: number[];
  loading: boolean;
  error: string | null;
}

export const initialState: FavoritesState = {
  favoriteIds: [],
  loading: false,
  error: null
};

export const favoritesReducer = createReducer(
  initialState,

  on(FavoritesActions.loadFavorites, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(FavoritesActions.loadFavoritesSuccess, (state, { favoriteIds }) => ({
    ...state,
    favoriteIds,
    loading: false
  })),

  on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(FavoritesActions.addFavoriteSuccess, (state, { clothingId }) => ({
    ...state,
    favoriteIds: [...state.favoriteIds, clothingId]
  })),

  on(FavoritesActions.removeFavoriteSuccess, (state, { clothingId }) => ({
    ...state,
    favoriteIds: state.favoriteIds.filter(id => id !== clothingId)
  }))
);
