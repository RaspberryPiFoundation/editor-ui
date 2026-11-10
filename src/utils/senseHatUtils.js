/**
 * Quantise RGB components to RGB565 step sizes
 */
export function quantisePixel(pixel) {
  return [pixel[0] & ~7, pixel[1] & ~3, pixel[2] & ~7];
}

// Rotation relative to an array of ascending indices.
// prettier-ignore
export const rotationClockwise90degrees = [
  56, 48, 40, 32, 24, 16, 8,  0,
  57, 49, 41, 33, 25, 17, 9,  1,
  58, 50, 42, 34, 26, 18, 10, 2,
  59, 51, 43, 35, 27, 19, 11, 3,
  60, 52, 44, 36, 28, 20, 12, 4,
  61, 53, 45, 37, 29, 21, 13, 5,
  62, 54, 46, 38, 30, 22, 14, 6,
  63, 55, 47, 39, 31, 23, 15, 7
];

// prettier-ignore
export const rotationAnticlockwise90degrees = [
  7, 15, 23, 31, 39, 47, 55, 63,
  6, 14, 22, 30, 38, 46, 54, 62,
  5, 13, 21, 29, 37, 45, 53, 61,
  4, 12, 20, 28, 36, 44, 52, 60,
  3, 11, 19, 27, 35, 43, 51, 59,
  2, 10, 18, 26, 34, 42, 50, 58,
  1,  9, 17, 25, 33, 41, 49, 57,
  0,  8, 16, 24, 32, 40, 48, 56,
];

export function rotate(rotation, arr) {
  if (!rotation) return [...arr];
  return rotation.map((i) => arr[i]);
}

export function rotateInverse(rotation, arr) {
  if (!rotation) return [...arr];
  const buffer = new Array(arr.length);
  rotation.forEach((rotated_i, i) => {
    buffer[rotated_i] = arr[i];
  });
  return buffer;
}
