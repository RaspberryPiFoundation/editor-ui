import React from "react";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import Sk from "skulpt";

import FlightCase from "./FlightCase";

// Mock @react-three/drei to return a scene synchronously. This is necessary
// because the FlightCase component relies on useGLTF to load a 3D model, and
// useGLTF throws a Promise on first render. Without this mock, the component
// body never reaches the `Sk.sense_hat_emit = ...` assignment, which means the
// event handlers are never registered. This would cause the tests to fail with
// "TypeError: Sk.sense_hat_emit is not a function" when trying to emit events.
// By mocking @react-three/drei to return a scene synchronously, we ensure that
// the event handlers are properly registered and the tests can run as
// expected.
jest.mock("@react-three/drei", () => ({
  useGLTF: () => ({
    scene: {
      getObjectByName: () => ({ material: null }),
    },
  }),
}));

describe("FlightCase", () => {
  beforeEach(() => {
    Sk.sense_hat = {
      pixels: Array(64).fill([0, 0, 0]),
    };
  });

  test("3D model loads and renders", async () => {
    await ReactThreeTestRenderer.create(<FlightCase />);
  });

  test("setpixel event quantises pixel to RGB565", async () => {
    await ReactThreeTestRenderer.create(<FlightCase />);

    Sk.sense_hat.pixels[0] = [255, 255, 255];
    Sk.sense_hat_emit("setpixel", 0);

    // R: 255 & ~7 = 248, G: 255 & ~3 = 252, B: 255 & ~7 = 248
    expect(Sk.sense_hat.pixels[0]).toEqual([248, 252, 248]);
  });

  test("setpixel event quantises partial RGB values", async () => {
    await ReactThreeTestRenderer.create(<FlightCase />);

    Sk.sense_hat.pixels[5] = [123, 234, 67];
    Sk.sense_hat_emit("setpixel", 5);

    // R: 123 & ~7 = 120, G: 234 & ~3 = 232, B: 67 & ~7 = 64
    expect(Sk.sense_hat.pixels[5]).toEqual([120, 232, 64]);
  });

  test("setpixels event quantises all pixels", async () => {
    await ReactThreeTestRenderer.create(<FlightCase />);

    Sk.sense_hat.pixels[0] = [255, 255, 255];
    Sk.sense_hat.pixels[1] = [100, 150, 200];
    Sk.sense_hat.pixels[2] = [7, 3, 7];
    Sk.sense_hat_emit("setpixels", null);

    expect(Sk.sense_hat.pixels[0]).toEqual([248, 252, 248]);
    // R: 100 & ~7 = 96, G: 150 & ~3 = 148, B: 200 & ~7 = 200
    expect(Sk.sense_hat.pixels[1]).toEqual([96, 148, 200]);
    // R: 7 & ~7 = 0, G: 3 & ~3 = 0, B: 7 & ~7 = 0
    expect(Sk.sense_hat.pixels[2]).toEqual([0, 0, 0]);
  });

  test("quantisation preserves RGB565 format boundaries", async () => {
    await ReactThreeTestRenderer.create(<FlightCase />);

    // Red/Blue: 5-bit precision (mask ~7 clears lower 3 bits)
    // Green: 6-bit precision (mask ~3 clears lower 2 bits)

    Sk.sense_hat.pixels[0] = [1, 1, 1];
    Sk.sense_hat_emit("setpixel", 0);
    expect(Sk.sense_hat.pixels[0]).toEqual([0, 0, 0]);

    Sk.sense_hat.pixels[1] = [8, 4, 8];
    Sk.sense_hat_emit("setpixel", 1);
    expect(Sk.sense_hat.pixels[1]).toEqual([8, 4, 8]);

    Sk.sense_hat.pixels[2] = [15, 7, 15];
    Sk.sense_hat_emit("setpixel", 2);
    expect(Sk.sense_hat.pixels[2]).toEqual([8, 4, 8]);
  });
});
