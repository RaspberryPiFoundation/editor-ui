import {
  quantisePixel,
  rotateInverse,
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

describe("rotateInverse", () => {
  // prettier-ignore
  const image = [
    R, G, X, X, X, X, X, X,
    X, X, X, X, X, X, X, X,
    X, X, X, X, X, X, X, X,
    X, X, X, X, X, X, X, X,
    X, X, X, X, X, X, X, X,
    X, X, X, X, X, X, X, X,
    X, X, X, X, X, X, X, X,
    X, X, X, X, X, X, X, X,
  ];

  test("returns unrotated when no rotation indices provided", () => {
    expect(rotateInverse(null, image)).toEqual(image);
  });

  test("rotates correctly", () => {
    // because rotateInverse inverts the rotation, pass anticlockwise to go
    // clockwise

    // prettier-ignore
    expect(rotateInverse(rotationAnticlockwise90degrees, image)).toEqual([
      X, X, X, X, X, X, X, R,
      X, X, X, X, X, X, X, G,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
    ]);

    // prettier-ignore
    expect(rotateInverse(rotationClockwise90degrees, image)).toEqual([
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      X, X, X, X, X, X, X, X,
      G, X, X, X, X, X, X, X,
      R, X, X, X, X, X, X, X,
    ]);


  });
});
