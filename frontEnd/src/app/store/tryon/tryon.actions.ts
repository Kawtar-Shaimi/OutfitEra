import { createAction, props } from '@ngrx/store';

export interface ModelResult {
  modelName: string;
  image: string | null;
  error: string | null;
  durationMs: number;
  success: boolean;
  loading: boolean;
  clothingId?: number;
  savedToGallery?: boolean;
}

// Set results (persist between navigation)
export const setIdmVtonResult = createAction(
  '[TryOn] Set IDM-VTON Result',
  props<{ result: ModelResult }>()
);

export const setFashnResult = createAction(
  '[TryOn] Set FASHN Result',
  props<{ result: ModelResult }>()
);

// Reset results
export const resetResults = createAction('[TryOn] Reset Results');

// Save to gallery
export const saveToGallery = createAction(
  '[TryOn] Save To Gallery',
  props<{ image: string; modelName: string; clothingId?: number }>()
);

export const saveToGallerySuccess = createAction(
  '[TryOn] Save To Gallery Success',
  props<{ modelName: string }>()
);

export const saveToGalleryFailure = createAction(
  '[TryOn] Save To Gallery Failure',
  props<{ error: string }>()
);
