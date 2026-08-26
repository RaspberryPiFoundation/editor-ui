import { describe, expect, test } from "vitest";

import { selectPreviewMode } from "./usePreviewMode";

describe("selectPreviewMode", () => {
  test("returns true when preview is on and readOnly is off", () => {
    expect(
      selectPreviewMode({ editor: { preview: true, readOnly: false } }),
    ).toBe(true);
  });

  test("returns false when preview is off", () => {
    expect(
      selectPreviewMode({ editor: { preview: false, readOnly: false } }),
    ).toBe(false);
  });

  test("returns false when readOnly overrides preview", () => {
    expect(
      selectPreviewMode({ editor: { preview: true, readOnly: true } }),
    ).toBe(false);
  });
});
