export interface RomaModelSpec {
  model_name: string;
}

export interface RomaSelectRequest {
  model_name: string;
}

export interface RomaSelectModelResponse {
  status: 'ok';
  current: RomaModelSpec;
}

export interface RomaCurrentModelResponse {
  status: 'ok' | 'none';
  current?: RomaModelSpec;
}

export interface RomaPredictionResponse {
  F: number[][];         // Fundamental matrix
  kptsA: number[][];     // Keypoints in image A
  kptsB: number[][];     // Keypoints in image B
  matches: number[][];   // Matched feature vectors
  certainty: number[];   // Certainty per match
  H_A: number;
  W_A: number;
  H_B: number;
  W_B: number;
}
