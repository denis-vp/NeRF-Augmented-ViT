import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  selectDepthModel,
  getCurrentDepthModel,
  predictDepth,
} from "../depthApi";
import { apiClient } from "../axios";
import type {
  DepthSelectRequest,
  DepthSelectModelResponse,
  DepthCurrentModelResponse,
  DepthPredictResponse,
} from "../depthTypes";

vi.mock("../axios", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("depthApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selectDepthModel should POST to /depth-anything-v2/select with correct payload", async () => {
    const payload: DepthSelectRequest = { model_name: "base_vitb" };
    const response: DepthSelectModelResponse = {
      status: "ok",
      current: { model_name: "base_vitb" },
    };

    (apiClient.post as vi.Mock).mockResolvedValue({ data: response });

    const result = await selectDepthModel(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/depth-anything-v2/select", payload);
    expect(result).toEqual(response);
  });

  it("getCurrentDepthModel should GET from /depth-anything-v2/current and return model info", async () => {
    const response: DepthCurrentModelResponse = {
      status: "ok",
      current: { model_name: "base_vitb" },
    };

    (apiClient.get as vi.Mock).mockResolvedValue({ data: response });

    const result = await getCurrentDepthModel();

    expect(apiClient.get).toHaveBeenCalledWith("/depth-anything-v2/current");
    expect(result).toEqual(response);
  });

  it("predictDepth should POST image file to /depth-anything-v2/predict and return depth prediction", async () => {
    const file = new File(["dummy"], "image.png", { type: "image/png" });

    const response: DepthPredictResponse = {
      height: 480,
      width: 640,
      depth: [
        [1.0, 1.1],
        [1.2, 1.3],
      ],
    };

    (apiClient.post as vi.Mock).mockResolvedValue({ data: response });

    const result = await predictDepth(file);

    expect(apiClient.post).toHaveBeenCalled();
    const [url, formData, config] = (apiClient.post as vi.Mock).mock.calls[0];

    expect(url).toBe("/depth-anything-v2/predict");
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
    });

    expect(result).toEqual(response);
  });
});
