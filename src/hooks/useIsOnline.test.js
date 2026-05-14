import { act, renderHook } from "@testing-library/react";
import useIsOnline from "./useIsOnline";

const dispatchWindowEvent = (type) => {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
};

describe("useIsOnline", () => {
  let swEventTarget;

  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => true,
    });

    // jsdom doesn't implement navigator.serviceWorker so provide a minimal stub
    swEventTarget = new EventTarget();
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: swEventTarget,
    });
  });

  const dispatchSWMessage = (data) => {
    act(() => {
      swEventTarget.dispatchEvent(new MessageEvent("message", { data }));
    });
  };

  test("returns true when navigator.onLine is true", () => {
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });

  test("returns false when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(false);
  });

  test("updates to false when the offline window event fires", () => {
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
    dispatchWindowEvent("offline");
    expect(result.current).toBe(false);
  });

  test("updates to true when the online window event fires", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(false);
    dispatchWindowEvent("online");
    expect(result.current).toBe(true);
  });

  test("updates to false when the service worker broadcasts OFFLINE", () => {
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
    dispatchSWMessage({ type: "OFFLINE" });
    expect(result.current).toBe(false);
  });

  test("ignores service worker messages with a different type", () => {
    const { result } = renderHook(() => useIsOnline());
    dispatchSWMessage({ type: "OTHER" });
    expect(result.current).toBe(true);
  });
});
