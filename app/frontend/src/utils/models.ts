export type DepthModel =
  | "base_vitb"
  | "base_vitl"
  | "0097_vitb"
  | "0097_vitl"
  | "fire"
  | "fire_nerf";

export const depthModels: DepthModel[] = [
  "base_vitb",
  "base_vitl",
  "0097_vitb",
  "0097_vitl",
  "fire",
  "fire_nerf",
];

export type RomaModel = "base" | "0080" | "fire" | "fire_nerf";

export const romaModels: RomaModel[] = ["base", "0080", "fire", "fire_nerf"];
