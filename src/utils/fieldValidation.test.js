import { existsValidation, urlValidation } from "./fieldValidation";

describe("existsValidation", () => {
  describe("when a field does not exist", () => {
    test("it flags the field name", () => {
      expect(
        existsValidation({
          stepData: {
            address_line_1: "",
          },
          fieldName: "address_line_1",
        }),
      ).toEqual("address_line_1");
    });
  });

  describe("when a field does exist", () => {
    test("it returns false", () => {
      expect(
        existsValidation({
          stepData: {
            address_line_1: "example",
          },
          fieldName: "address_line_1",
        }),
      ).toEqual(false);
    });
  });
});

describe("urlValidation", () => {
  describe("when a field does not contain a valid URL", () => {
    test("it flags the field name", () => {
      expect(
        urlValidation({
          stepData: {
            url: "google",
          },
          fieldName: "url",
        }),
      ).toEqual("url");
    });
  });

  describe("when a field contains a valid URL", () => {
    test("it returns false", () => {
      expect(
        urlValidation({
          stepData: {
            url: "google.com",
          },
          fieldName: "url",
        }),
      ).toEqual(false);
    });
  });
});
