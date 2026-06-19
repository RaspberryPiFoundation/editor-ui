import { act, renderHook } from "@testing-library/react";

import { useContainerMinWidth } from "./useContainerMinWidth";

const originalResizeObserver = window.ResizeObserver;
let observers;

class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    observers.push(this);
  }
}

const makeElement = (width) => ({
  getBoundingClientRect: jest.fn(() => ({ width })),
});

const renderObservedHook = (width) => {
  const hook = renderHook(() => useContainerMinWidth(720));
  const element = makeElement(width);

  act(() => {
    hook.result.current[1](element);
  });

  return { ...hook, element };
};

describe("useContainerMinWidth", () => {
  beforeEach(() => {
    observers = [];
    window.ResizeObserver = MockResizeObserver;
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  test("reports whether the container is at least the minimum width", () => {
    const { result } = renderObservedHook(600);

    expect(result.current[0]).toBe(false);
    expect(observers[0].observe).toHaveBeenCalled();

    act(() => {
      observers[0].callback([{ contentRect: { width: 720 } }]);
    });

    expect(result.current[0]).toBe(true);
  });

  test("uses contentBoxSize when available", () => {
    const { result } = renderObservedHook(600);

    act(() => {
      observers[0].callback([
        { contentBoxSize: [{ inlineSize: 721 }], contentRect: { width: 600 } },
      ]);
    });

    expect(result.current[0]).toBe(true);
  });

  test("disconnects the observer on unmount", () => {
    const { unmount } = renderObservedHook(800);
    const observer = observers[0];

    unmount();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  test("falls back to a one-time measurement without ResizeObserver", () => {
    window.ResizeObserver = undefined;

    const { result } = renderObservedHook(800);

    expect(result.current[0]).toBe(true);
    expect(observers).toEqual([]);
  });
});
