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

export function rotate(rotation, arr) {
  const buffer = new Array(arr.length);
  rotation.forEach((rotated_i, i) => {
    buffer[rotated_i] = arr[i];
  });
  return buffer;
}
