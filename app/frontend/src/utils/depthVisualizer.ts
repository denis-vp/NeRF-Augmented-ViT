import colormap from "colormap";

export type ColormapMode =
  | "magma"
  | "inferno"
  | "plasma"
  | "jet"
  | "bone"
  | "hot";

export const colormapModes: ColormapMode[] = [
  "magma",
  "inferno",
  "plasma",
  "jet",
  "bone",
  "hot",
];

const colormapNameMap: Record<ColormapMode, string> = {
  magma: "magma",
  inferno: "inferno",
  plasma: "plasma",
  jet: "jet",
  bone: "bone",
  hot: "hot",
};

/**
 * Converts a normalized depth map (values in [0, 1]) into a colored canvas.
 */
export function depthToColormap(
  depth: number[][],
  mode: ColormapMode = "magma"
): HTMLCanvasElement {
  const rows = depth.length;
  const cols = depth[0]?.length ?? 0;

  if (rows === 0 || cols === 0) {
    throw new Error("Empty depth array");
  }

  // Flatten and sanitize depth data
  const flat = depth.flat().map((v) => (Number.isFinite(v) ? v : 0));

  // Normalize to [0, 1]
  const min = flat.reduce((a, b) => Math.min(a, b), Infinity);
  const max = flat.reduce((a, b) => Math.max(a, b), -Infinity);
  const normalized = flat.map((v) => (max > min ? (v - min) / (max - min) : 0));

  const colors = colormap({
    colormap: colormapNameMap[mode],
    nshades: 256,
    format: "rgba",
    alpha: 1,
  });

  // Create image buffer
  const imageData = new Uint8ClampedArray(rows * cols * 4);
  for (let i = 0; i < normalized.length; i++) {
    const colorIdx = Math.max(
      0,
      Math.min(255, Math.round(normalized[i] * 255))
    );
    const [r, g, b, a] = colors[colorIdx];
    imageData[i * 4 + 0] = r;
    imageData[i * 4 + 1] = g;
    imageData[i * 4 + 2] = b;
    imageData[i * 4 + 3] = Math.round(a * 255);
  }

  // Create canvas and draw
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context");

  ctx.putImageData(new ImageData(imageData, cols, rows), 0, 0);
  return canvas;
}
