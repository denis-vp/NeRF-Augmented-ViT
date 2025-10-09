import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  selectRomaModel,
  getCurrentRomaModel,
  predictRomaMatch,
} from "../romaApi";
import { apiClient } from "../axios";
import type {
  RomaSelectRequest,
  RomaSelectModelResponse,
  RomaCurrentModelResponse,
  RomaPredictionResponse,
} from "../romaTypes";

vi.mock("../axios", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("romaApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selectRomaModel should POST to /tiny-roma/select with correct payload", async () => {
    const payload: RomaSelectRequest = { model_name: "base" };
    const response: RomaSelectModelResponse = {
      status: "ok",
      current: { model_name: "base" },
    };

    (apiClient.post as vi.Mock).mockResolvedValue({ data: response });

    const result = await selectRomaModel(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/tiny-roma/select", payload);
    expect(result).toEqual(response);
  });

  it("getCurrentRomaModel should return current model when available", async () => {
    const response: RomaCurrentModelResponse = {
      status: "ok",
      current: { model_name: "base" },
    };

    (apiClient.get as vi.Mock).mockResolvedValue({ data: response });

    const result = await getCurrentRomaModel();

    expect(apiClient.get).toHaveBeenCalledWith("/tiny-roma/current");
    expect(result).toEqual(response);
  });

  it("predictRomaMatch should POST FormData with two image files", async () => {
    const file1 = new File(["imageA"], "img1.png", { type: "image/png" });
    const file2 = new File(["imageB"], "img2.png", { type: "image/png" });

    const response: RomaPredictionResponse = {
      F: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      kptsA: [[10, 20]],
      kptsB: [[10, 20]],
      matches: [[0, 0]],
      certainty: [1.0],
      H_A: 480,
      W_A: 640,
      H_B: 480,
      W_B: 640,
    };

    (apiClient.post as vi.Mock).mockResolvedValue({ data: response });

    const result = await predictRomaMatch(file1, file2);

    expect(apiClient.post).toHaveBeenCalled();
    const [url, formData, config] = (apiClient.post as vi.Mock).mock.calls[0];

    expect(url).toBe("/tiny-roma/predict");
    expect(formData.get("file1")).toBe(file1);
    expect(formData.get("file2")).toBe(file2);
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
    });

    expect(result).toEqual(response);
  });
});
