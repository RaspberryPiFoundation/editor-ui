import {
  quantisePixel,
  rotateInverse,
  rotate,
  rotationClockwise90degrees,
  rotationAnticlockwise90degrees,
} from "./senseHatUtils";

describe("quantisePixel", () => {
  test("quantises pixels", () => {
    expect(quantisePixel([255, 255, 255])).toEqual([248, 252, 248]);
    expect(quantisePixel([100, 150, 200])).toEqual([96, 148, 200]);
    expect(quantisePixel([7, 3, 7])).toEqual([0, 0, 0]);
  });
});

const R = [255, 0, 0];
const G = [0, 255, 0];
const X = [0, 0, 0];
// prettier-ignore
const image1 = [
  R, G, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
];
// prettier-ignore
const image2 = [
  X, X, X, X, X, X, X, R,
  X, X, X, X, X, X, X, G,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
];

// prettier-ignore
const image3 = [
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  X, X, X, X, X, X, X, X,
  G, X, X, X, X, X, X, X,
  R, X, X, X, X, X, X, X,
];

describe("rotate", () => {
  test("rotates correctly", () => {
    expect(rotate(rotationClockwise90degrees, image1)).toEqual(image2);
    expect(rotate(rotationAnticlockwise90degrees, image1)).toEqual(image3);
  });
});

describe("rotateInverse", () => {
  test("returns unrotated when no rotation indices provided", () => {
    expect(rotateInverse(null, image1)).toEqual(image1);
  });

  test("rotates correctly", () => {
    // because rotateInverse inverts the rotation, pass anticlockwise to go
    // rotate clockwise
    expect(rotateInverse(rotationAnticlockwise90degrees, image1)).toEqual(
      image2,
    );
    expect(rotateInverse(rotationClockwise90degrees, image1)).toEqual(image3);
  });
});
