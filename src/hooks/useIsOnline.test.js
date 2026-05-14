import { act, renderHook } from "@testing-library/react";
import useIsOnline from "./useIsOnline";

const dispatchWindowEvent = (type) => {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
};

describe("useIsOnline", () => {
  let swEventTarget;
  let mockPostMessage;

  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => true,
    });

    mockPostMessage = jest.fn();
    swEventTarget = new EventTarget();
    swEventTarget.ready = Promise.resolve({
      active: { postMessage: mockPostMessage },
    });

    // jsdom doesn't implement navigator.serviceWorker so provide a minimal stub
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
    dispatchWindowEvent("offline");
    expect(result.current).toBe(false);
  });

  test("updates to true when the online window event fires", () => {
    const { result } = renderHook(() => useIsOnline());
    dispatchWindowEvent("offline");
    dispatchWindowEvent("online");
    expect(result.current).toBe(true);
  });

  test("updates to false when the service worker broadcasts OFFLINE", () => {
    const { result } = renderHook(() => useIsOnline());
    dispatchSWMessage({ type: "OFFLINE" });
    expect(result.current).toBe(false);
  });

  test("updates to true when the service worker broadcasts ONLINE", () => {
    const { result } = renderHook(() => useIsOnline());
    dispatchSWMessage({ type: "OFFLINE" });
    dispatchSWMessage({ type: "ONLINE" });
    expect(result.current).toBe(true);
  });

  test("ignores service worker messages with a different type", () => {
    const { result } = renderHook(() => useIsOnline());
    dispatchSWMessage({ type: "OTHER" });
    expect(result.current).toBe(true);
  });

  describe("connectivity polling", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("does not poll while online", async () => {
      renderHook(() => useIsOnline());
      await act(async () => {
        jest.advanceTimersByTime(6000);
      });
      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    test("sends CHECK_ONLINE to the service worker every 3 seconds while offline", async () => {
      const { result } = renderHook(() => useIsOnline());
      dispatchSWMessage({ type: "OFFLINE" });
      expect(result.current).toBe(false);

      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({ type: "CHECK_ONLINE" });

      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      expect(mockPostMessage).toHaveBeenCalledTimes(2);
    });

    test("stops polling when the service worker broadcasts ONLINE", async () => {
      const { result } = renderHook(() => useIsOnline());
      dispatchSWMessage({ type: "OFFLINE" });
      dispatchSWMessage({ type: "ONLINE" });
      expect(result.current).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(6000);
      });
      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    test("stops polling on unmount", async () => {
      const { result, unmount } = renderHook(() => useIsOnline());
      dispatchSWMessage({ type: "OFFLINE" });
      expect(result.current).toBe(false);

      unmount();

      await act(async () => {
        jest.advanceTimersByTime(6000);
      });
      expect(mockPostMessage).not.toHaveBeenCalled();
    });
  });
});
