import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TryOnState } from './tryon.reducer';

export const selectTryOnState = createFeatureSelector<TryOnState>('tryon');

export const selectIdmVtonResult = createSelector(
  selectTryOnState,
  (state) => state.idmVtonResult
);

export const selectFashnResult = createSelector(
  selectTryOnState,
  (state) => state.fashnResult
);

export const selectSaving = createSelector(
  selectTryOnState,
  (state) => state.saving
);

export const selectSaveError = createSelector(
  selectTryOnState,
  (state) => state.saveError
);

export const selectHasResults = createSelector(
  selectTryOnState,
  (state) =>
    state.idmVtonResult.loading || state.fashnResult.loading ||
    !!state.idmVtonResult.image || !!state.idmVtonResult.error ||
    !!state.fashnResult.image || !!state.fashnResult.error
);
