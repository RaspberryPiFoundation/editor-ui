import Sk from "skulpt";
import { render } from "@testing-library/react";
import Simulator2d, { REGISTRY_ID } from "./Simulator2d";
import { act } from "react";

describe("Simulator2d", () => {
  beforeEach(() => {
    Sk.sense_hat = {
      pixels: Array(64).fill([0, 0, 0]),
    };
  });
  const renderSimulator2d = async () => {
    const senseHatEmitRegistryRef = {
      current: {},
    };

    const container = render(
      <Simulator2d senseHatEmitRegistryRef={senseHatEmitRegistryRef} />,
    );

    return { senseHatEmitRegistryRef, container };
  };

  test("2D model loads and renders", async () => {
    await renderSimulator2d();
  });

  test("2D model registers sense_hat_emit listener", async () => {
    const { senseHatEmitRegistryRef } = await renderSimulator2d();
    expect(senseHatEmitRegistryRef.current).toHaveProperty(REGISTRY_ID);
  });

  test("setpixel event quantises pixel to RGB565", async () => {
    const { senseHatEmitRegistryRef } = await renderSimulator2d();

    act(() => {
      Sk.sense_hat.pixels[0] = [255, 255, 255];
      const registeredSenseHatEmit =
        senseHatEmitRegistryRef.current[REGISTRY_ID];
      registeredSenseHatEmit("setpixel", 0);
    });

    // R: 255 & ~7 = 248, G: 255 & ~3 = 252, B: 255 & ~7 = 248
    expect(Sk.sense_hat.pixels[0]).toEqual([248, 252, 248]);
  });

  test("setpixels event quantises all pixels", async () => {
    const { senseHatEmitRegistryRef } = await renderSimulator2d();

    act(() => {
      Sk.sense_hat.pixels[0] = [255, 255, 255];
      Sk.sense_hat.pixels[1] = [100, 150, 200];
      Sk.sense_hat.pixels[2] = [7, 3, 7];
      const registeredSenseHatEmit =
        senseHatEmitRegistryRef.current[REGISTRY_ID];
      registeredSenseHatEmit("setpixels", null);
    });
    expect(Sk.sense_hat.pixels[0]).toEqual([248, 252, 248]);
    // R: 100 & ~7 = 96, G: 150 & ~3 = 148, B: 200 & ~7 = 200
    expect(Sk.sense_hat.pixels[1]).toEqual([96, 148, 200]);
    // R: 7 & ~7 = 0, G: 3 & ~3 = 0, B: 7 & ~7 = 0
    expect(Sk.sense_hat.pixels[2]).toEqual([0, 0, 0]);
  });

  test("quantisation preserves RGB565 format boundaries", async () => {
    const { senseHatEmitRegistryRef } = await renderSimulator2d();

    act(() => {
      Sk.sense_hat.pixels[0] = [1, 1, 1];
      Sk.sense_hat.pixels[1] = [8, 4, 8];
      Sk.sense_hat.pixels[2] = [15, 7, 15];

      const registeredSenseHatEmit =
        senseHatEmitRegistryRef.current[REGISTRY_ID];

      registeredSenseHatEmit("setpixels", null);
    });

    expect(Sk.sense_hat.pixels[0]).toEqual([0, 0, 0]);
    expect(Sk.sense_hat.pixels[1]).toEqual([8, 4, 8]);
    expect(Sk.sense_hat.pixels[2]).toEqual([8, 4, 8]);
  });
});
