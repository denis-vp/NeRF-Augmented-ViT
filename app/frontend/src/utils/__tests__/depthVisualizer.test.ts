import { describe, it, expect, vi, beforeAll } from "vitest";
import { depthToColormap } from "../depthVisualizer";

beforeAll(() => {
  const mockCtx = {
    putImageData: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(16),
    })),
  };

  vi.stubGlobal("ImageData", class {
    constructor(public data: Uint8ClampedArray, public width: number, public height: number) {}
  });

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
});

describe("depthToColormap", () => {
  it("throws error for empty array", () => {
    expect(() => depthToColormap([])).toThrow("Empty depth array");
  });

  it("returns a canvas of correct size", () => {
    const depth = [
      [0.1, 0.2],
      [0.3, 0.4],
    ];

    const canvas = depthToColormap(depth, "plasma");

    expect(canvas).toBeDefined();
    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(2);
  });

  it("handles non-finite values by zeroing them", () => {
    const depth = [
      [0.1, NaN],
      [Infinity, -Infinity],
    ];

    const canvas = depthToColormap(depth, "jet");

    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(2);
  });

  it("renders identical values with same color", () => {
    const depth = [
      [1, 1],
      [1, 1],
    ];

    const canvas = depthToColormap(depth);

    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(2);
  });
});
