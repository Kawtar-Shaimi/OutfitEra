import { createReducer, on } from '@ngrx/store';
import * as TryOnActions from './tryon.actions';
import { ModelResult } from './tryon.actions';

export interface TryOnState {
  idmVtonResult: ModelResult;
  fashnResult: ModelResult;
  saving: boolean;
  saveError: string | null;
}

const initialModelResult: ModelResult = {
  modelName: '',
  image: null,
  error: null,
  durationMs: 0,
  success: false,
  loading: false,
  savedToGallery: false
};

export const initialState: TryOnState = {
  idmVtonResult: { ...initialModelResult, modelName: 'IDM-VTON' },
  fashnResult: { ...initialModelResult, modelName: 'FASHN AI' },
  saving: false,
  saveError: null
};

export const tryonReducer = createReducer(
  initialState,

  on(TryOnActions.setIdmVtonResult, (state, { result }) => ({
    ...state,
    idmVtonResult: result
  })),

  on(TryOnActions.setFashnResult, (state, { result }) => ({
    ...state,
    fashnResult: result
  })),

  on(TryOnActions.resetResults, () => ({
    ...initialState
  })),

  on(TryOnActions.saveToGallery, (state) => ({
    ...state,
    saving: true,
    saveError: null
  })),

  on(TryOnActions.saveToGallerySuccess, (state, { modelName }) => ({
    ...state,
    saving: false,
    idmVtonResult: modelName.includes('IDM') || modelName === state.idmVtonResult.modelName
      ? { ...state.idmVtonResult, savedToGallery: true }
      : state.idmVtonResult,
    fashnResult: modelName.includes('FASHN') || modelName === state.fashnResult.modelName
      ? { ...state.fashnResult, savedToGallery: true }
      : state.fashnResult
  })),

  on(TryOnActions.saveToGalleryFailure, (state, { error }) => ({
    ...state,
    saving: false,
    saveError: error
  }))
);
