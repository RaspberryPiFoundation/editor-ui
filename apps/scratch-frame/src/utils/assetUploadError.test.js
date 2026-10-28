import { describe, expect, it } from "vitest";
import {
  ASSET_TOO_LARGE,
  createAssetUploadErrorTracker,
  isAssetTooLargeError,
} from "./assetUploadError.js";

describe("isAssetTooLargeError", () => {
  it("matches the status code scratch-storage rejects with", () => {
    expect(isAssetTooLargeError(413)).toBe(true);
  });

  it("matches an error object carrying the status", () => {
    expect(isAssetTooLargeError({ status: 413 })).toBe(true);
  });

  it("does not match other statuses", () => {
    expect(isAssetTooLargeError(500)).toBe(false);
    expect(isAssetTooLargeError(409)).toBe(false);
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
