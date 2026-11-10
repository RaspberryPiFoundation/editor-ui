import { render } from "@testing-library/react";
import { describe } from "vitest";
import Sk from "skulpt";
import {
  SenseHatEmitContext,
  SenseHatEmitContextProvider,
} from "./SenseHatEmitContext";
import { act, useContext, useEffect } from "react";
import { rotationAnticlockwise90degrees } from "../../utils/senseHatUtils";
import { invalidate } from "@react-three/fiber";

vi.mock("@react-three/fiber", () => ({
  invalidate: vi.fn(),
}));

function TestConsumer({ toSubscribe }) {
  const subscribe = useContext(SenseHatEmitContext);

  useEffect(() => {
    if (toSubscribe) {
      return subscribe(toSubscribe);
    }
  }, [subscribe, toSubscribe]);
  return <div />;
}

describe("SenseHatEmitContextProvider", () => {
  beforeEach(() => {
    Sk.sense_hat = {
      pixels: Array(64).fill([0, 0, 0]),
    };
  });

  afterEach(() => {
    delete Sk.sense_hat;
  });

  test("registers Sk.sense_hat_emit on mount", () => {
    expect(Sk.sense_hat_emit).toBeUndefined();

    render(<SenseHatEmitContextProvider />);

    expect(Sk.sense_hat_emit).not.toBeUndefined();
  });

  test("unsubscribes subscriber when teardown function is executed", () => {
    const mockSetPixel = vi.fn();
    const toSubscribe = { setPixel: mockSetPixel };

    const { unmount } = render(
      <SenseHatEmitContextProvider>
        <TestConsumer toSubscribe={toSubscribe} />
      </SenseHatEmitContextProvider>,
    );
    unmount();

    act(() => {
      Sk.sense_hat_emit("setpixel", 0);
    });

    expect(mockSetPixel).not.toHaveBeenCalled();
  });

  describe("On setpixel event", () => {
    test("test quantises pixel, mutates Sk.sense_hat.pixels, and notifies subscribers", () => {
      const mockSetPixel = vi.fn();
      const toSubscribe = { setPixel: mockSetPixel };
      render(
        <SenseHatEmitContextProvider>
          <TestConsumer toSubscribe={toSubscribe} />
        </SenseHatEmitContextProvider>,
      );
      Sk.sense_hat.pixels = Array(64).fill([0, 0, 0]);
      Sk.sense_hat.pixels[0] = [255, 0, 0];

      const ledIndex = 0;
      act(() => {
        Sk.sense_hat_emit("setpixel", ledIndex);
      });

      // then
      const expectedLedValue = [248, 0, 0];
      expect(Sk.sense_hat.pixels[0]).toEqual(expectedLedValue);
      expect(toSubscribe.setPixel).toHaveBeenCalledWith(
        ledIndex,
        expectedLedValue,
      );
      expect(mockSetPixel).toHaveBeenCalledOnce();
      expect(mockSetPixel).toHaveBeenCalledWith(ledIndex, expectedLedValue);
    });
  });

  describe("On setpixels event", () => {
    test("test rotates, quantises, and mutates Sk.sense_hat.pixels, and notifies subscribers", () => {
      const mockSetPixels = vi.fn();
      const toSubscribe = { setPixels: mockSetPixels };
      render(
        <SenseHatEmitContextProvider>
          <TestConsumer toSubscribe={toSubscribe} />
        </SenseHatEmitContextProvider>,
      );
      const blankImage = Array(64).fill([0, 0, 0]);
      Sk.sense_hat.pixels = [...blankImage];
      Sk.sense_hat.pixels[0] = [255, 0, 0];

      const rotation = rotationAnticlockwise90degrees;
      act(() => {
        Sk.sense_hat_emit("setpixels", rotation);
      });

      // then
      const quantisedRed = [248, 0, 0];
      const rotatedImage = blankImage;
      rotatedImage[7] = quantisedRed;
      expect(Sk.sense_hat.pixels[0]).toEqual([0, 0, 0]);
      expect(Sk.sense_hat.pixels[7]).toEqual(quantisedRed);
      expect(mockSetPixels).toHaveBeenCalledOnce();
      expect(mockSetPixels).toHaveBeenCalledWith(rotatedImage);
    });
  });

  describe("is3d prop handling", () => {
    test("calls invalidate() when is3d is true", () => {
      render(<SenseHatEmitContextProvider is3d={true} />);

      expect(invalidate).toHaveBeenCalledTimes(1);
    });

    test("invalidate() not called when not 3d", () => {
      render(<SenseHatEmitContextProvider is3d={false} />);
      expect(invalidate).not.toHaveBeenCalled();
    });
  });
});
