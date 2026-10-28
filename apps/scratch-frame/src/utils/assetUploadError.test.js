import { describe, expect, it } from "vitest";
import {
  ASSET_TOO_LARGE,
  PROJECT_TOO_LARGE,
  createAssetUploadErrorTracker,
  getErrorType,
} from "./assetUploadError.js";

describe("isAssetTooLargeError", () => {
  it("matches the status codes scratch-storage rejects with", () => {
    expect(getErrorType(413)).toBe(ASSET_TOO_LARGE);
    expect(getErrorType(422)).toBe(PROJECT_TOO_LARGE);
  });

  it("does not match other statuses", () => {
    expect(getErrorType(500)).toBe(null);
    expect(getErrorType(409)).toBe(null);
  });
});

describe("createAssetUploadErrorTracker", () => {
  it("returns no reason before anything is recorded", () => {
    expect(createAssetUploadErrorTracker().consume()).toBeNull();
  });

  it("records a too-large error", () => {
    const tracker = createAssetUploadErrorTracker();
    tracker.record(413);

    expect(tracker.consume()).toBe(ASSET_TOO_LARGE);
  });

  it("ignores unrelated errors", () => {
    const tracker = createAssetUploadErrorTracker();
    tracker.record(500);

    expect(tracker.consume()).toBeNull();
  });

  it("clears the reason once consumed", () => {
    const tracker = createAssetUploadErrorTracker();
    tracker.record(413);
    tracker.consume();

    expect(tracker.consume()).toBeNull();
  });

  it("clears the reason on demand", () => {
    const tracker = createAssetUploadErrorTracker();
    tracker.record(413);
    tracker.clear();

    expect(tracker.consume()).toBeNull();
  });
});
