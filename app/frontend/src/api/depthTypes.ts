export interface DepthSelectRequest {
  model_name: string;
}

export interface DepthModelSpec {
  model_name: string;
}

export interface DepthSelectModelResponse {
  status: 'ok';
  current: DepthModelSpec;
}

export interface DepthCurrentModelResponse {
  status: 'none' | 'ok';
  current?: DepthModelSpec;
}

export interface DepthPredictResponse {
  height: number;
  width: number;
  depth: number[][];
}