import { apiClient } from './axios.ts';
import type { DepthCurrentModelResponse, DepthSelectRequest, DepthPredictResponse, DepthSelectModelResponse } from './depthTypes';

/**
 * Select a Depth model by name
 */
export function selectDepthModel(
  payload: DepthSelectRequest
): Promise<DepthSelectModelResponse> {
  return apiClient
    .post<DepthSelectModelResponse>('/depth-anything-v2/select', payload)
    .then(res => res.data);
}

/**
 * Get currently selected Depth model
 */
export function getCurrentDepthModel(): Promise<DepthCurrentModelResponse> {
  return apiClient
    .get<DepthCurrentModelResponse>('/depth-anything-v2/current')
    .then(res => res.data);
}

/**
 * Run depth estimation on an image
 */
export function predictDepth(file: File): Promise<DepthPredictResponse> {
  const form = new FormData();
  form.append('file', file);
  return apiClient
    .post<DepthPredictResponse>('/depth-anything-v2/predict', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(res => res.data);
}
