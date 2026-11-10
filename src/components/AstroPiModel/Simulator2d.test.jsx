import Sk from "skulpt";
import { render } from "@testing-library/react";
import Simulator2d from "./Simulator2d";
import { act } from "react";
import { SenseHatEmitContextProvider } from "./SenseHatEmitContext";

describe("Simulator2d", () => {
  beforeEach(() => {
    Sk.sense_hat = {
      pixels: Array(64).fill([0, 0, 0]),
    };
  });
  const renderSimulator2d = async () => {
    const container = render(
      <SenseHatEmitContextProvider>
        <Simulator2d />
      </SenseHatEmitContextProvider>,
    );

    return { container };
  };

  test("2D model loads and renders", async () => {
    await renderSimulator2d();
  });

  test("setpixel event quantises pixel to RGB565", async () => {
    await renderSimulator2d();

    act(() => {
      Sk.sense_hat.pixels[0] = [255, 255, 255];
      Sk.sense_hat_emit("setpixel", 0);
    });

    // R: 255 & ~7 = 248, G: 255 & ~3 = 252, B: 255 & ~7 = 248
    expect(Sk.sense_hat.pixels[0]).toEqual([248, 252, 248]);
  });

  test("setpixels event quantises all pixels", async () => {
    await renderSimulator2d();

    act(() => {
      Sk.sense_hat.pixels[0] = [255, 255, 255];
      Sk.sense_hat.pixels[1] = [100, 150, 200];
      Sk.sense_hat.pixels[2] = [7, 3, 7];
      Sk.sense_hat_emit("setpixels", null);
    });
    expect(Sk.sense_hat.pixels[0]).toEqual([248, 252, 248]);
    // R: 100 & ~7 = 96, G: 150 & ~3 = 148, B: 200 & ~7 = 200
    expect(Sk.sense_hat.pixels[1]).toEqual([96, 148, 200]);
    // R: 7 & ~7 = 0, G: 3 & ~3 = 0, B: 7 & ~7 = 0
    expect(Sk.sense_hat.pixels[2]).toEqual([0, 0, 0]);
  });

  test("quantisation preserves RGB565 format boundaries", async () => {
    await renderSimulator2d();

    act(() => {
      Sk.sense_hat.pixels[0] = [1, 1, 1];
      Sk.sense_hat.pixels[1] = [8, 4, 8];
      Sk.sense_hat.pixels[2] = [15, 7, 15];

      Sk.sense_hat_emit("setpixels", null);
    });

    expect(Sk.sense_hat.pixels[0]).toEqual([0, 0, 0]);
    expect(Sk.sense_hat.pixels[1]).toEqual([8, 4, 8]);
    expect(Sk.sense_hat.pixels[2]).toEqual([8, 4, 8]);
  });

  test("rotates clockwise 90 degrees relative to pixels state", async () => {
    const { container } = await renderSimulator2d();
    const R = [255, 0, 0];

    for (let i = 0; i < 64; i++) {
      const led = container.getByTestId(`led-${i}-bulb`);
      expect(led).toHaveStyle("background-color: rgb(0, 0, 0)");
    }

    const ledIndex = 0;
    Sk.sense_hat.pixels[ledIndex] = R;

    // Causes a re-render
    act(() => {
      Sk.sense_hat_emit("setpixel", ledIndex);
    });

    const led0 = container.getByTestId("led-0-bulb");
    expect(led0).toHaveStyle("background-color: rgb(0, 0, 0)");

    const led7 = container.getByTestId("led-7-bulb");
    expect(led7).toHaveStyle("background-color: rgb(248, 0, 0)");
  });
});
