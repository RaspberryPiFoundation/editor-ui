import { render, screen } from "@testing-library/react";
import FileDropzone from "./FileDropzone";

describe("When there sre fewer files than the maximum", () => {
  beforeEach(() => {
    render(
      <FileDropzone
        hintText="drag and drop your files here"
        files={[]}
        maxFiles={1}
      />,
    );
  });

  test("renders the dropzone", () => {
    expect(
      screen.queryByText("drag and drop your files here"),
    ).toBeInTheDocument();
  });
});

describe("When there are the maximum number of files", () => {
  beforeEach(() => {
    render(
      <FileDropzone
        hintText="drag and drop your files here"
        successText="file uploaded successfully"
        maxFiles={1}
        files={[{ path: "file1.csv" }]}
      />,
    );
  });
  test("it renders the success text", () => {
    expect(
      screen.queryByText("file uploaded successfully"),
    ).toBeInTheDocument();
  });

  test("renders the file", () => {
    expect(screen.queryByText("file1.csv")).toBeInTheDocument();
  });
});
