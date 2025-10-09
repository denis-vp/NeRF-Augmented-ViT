import { apiClient } from "./axios.ts";
import type {
  RomaSelectRequest,
  RomaSelectModelResponse,
  RomaCurrentModelResponse,
  RomaPredictionResponse,
} from "./romaTypes.ts";

/**
 * Select a ROMA model by name
 */
export function selectRomaModel(
  payload: RomaSelectRequest
): Promise<RomaSelectModelResponse> {
  return apiClient
    .post<RomaSelectModelResponse>("/tiny-roma/select", payload)
    .then((res) => res.data);
}

/**
 * Get currently selected ROMA model
 */
export function getCurrentRomaModel(): Promise<RomaCurrentModelResponse> {
  return apiClient
    .get<RomaCurrentModelResponse>("/tiny-roma/current")
    .then((res) => res.data);
}

/**
 * Run matching between two images
 */
export function predictRomaMatch(
  file1: File,
  file2: File
): Promise<RomaPredictionResponse> {
  const form = new FormData();
  form.append("file1", file1);
  form.append("file2", file2);

  return apiClient
    .post<RomaPredictionResponse>("/tiny-roma/predict", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}
