import type { palette } from "../data/palette";

// Extract the palette key names ("source" | "vice" | "colodore" | ...).
type PaletteKey = keyof typeof palette;

// Derive the array type from the palette data structure.
// This will be string[] (an array of hex color strings).
export type PaletteArray = (typeof palette)[PaletteKey];
