import { describe, it, expect, vi, beforeEach } from "vitest";
import { drawMatches } from "../matcherVisualizer";
import type { MatchData } from "../matcherVisualizer";

let mockCtx: any;

beforeEach(() => {
  mockCtx = {
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
  };

  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "canvas") {
      return {
        width: 0,
        height: 0,
        getContext: (type: string) => (type === "2d" ? mockCtx : null),
      } as unknown as HTMLCanvasElement;
    }

    return document.createElement(tag);
  });

  global.Image = class {
    onload: () => void = () => {};
    onerror: () => void = () => {};
    set src(_: string) {
      setTimeout(() => this.onload(), 0);
    }
    get src(): string {
      return "";
    }
    naturalWidth = 100;
    naturalHeight = 100;
  } as any;
});

describe("drawMatches", () => {
  it("creates a canvas with correct dimensions and draws top-k matches", async () => {
    const matchData: MatchData = {
      kptsA: [
        [10, 10],
        [20, 20],
        [30, 30],
      ],
      kptsB: [
        [15, 15],
        [25, 25],
        [35, 35],
      ],
      H_A: 100,
      W_A: 100,
      H_B: 100,
      W_B: 100,
    };

    const canvas = await drawMatches("imgA.png", "imgB.png", matchData, 2);

    expect(canvas).toBeDefined();
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);

    expect(mockCtx.drawImage).toHaveBeenCalledTimes(2);
    expect(mockCtx.moveTo).toHaveBeenCalledTimes(2);
    expect(mockCtx.lineTo).toHaveBeenCalledTimes(2);
    expect(mockCtx.arc).toHaveBeenCalledTimes(4); // 2 for A, 2 for B
  });

  it("throws if 2D context is unavailable", async () => {
    vi.restoreAllMocks();

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      return {
        getContext: () => null,
      } as any;
    });

    const matchData: MatchData = {
      kptsA: [[0, 0]],
      kptsB: [[0, 0]],
      H_A: 100,
      W_A: 100,
      H_B: 100,
      W_B: 100,
    };

    await expect(drawMatches("a.png", "b.png", matchData)).rejects.toThrow(
      "Unable to get 2D context"
    );
  });
});
