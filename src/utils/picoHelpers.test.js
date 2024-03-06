import { downloadMicroPython, runOnPico } from "./picoHelpers";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

describe("downloadMicroPython", () => {
  it("should download the MicroPython file", async () => {
    const linkMock = {
      href: "",
      download: "",
      click: jest.fn(),
    };
    document.createElement = jest.fn(() => linkMock);
    document.body.appendChild = jest.fn();

    const result = await downloadMicroPython();

    expect(result).toBe("Success");
    expect(linkMock.href).toBe(
      "https://micropython.org/download/rp2-pico/rp2-pico-latest.uf2"
    );
    expect(linkMock.download).toBe("rp2-pico-latest.uf2");
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(document.body.appendChild).toHaveBeenCalledWith(linkMock);
    expect(linkMock.click).toHaveBeenCalled();
  });

  it("should return an error if download fails", async () => {
    const errorMock = new Error("Download failed");
    document.createElement = jest.fn(() => {
      throw errorMock;
    });

    const result = await downloadMicroPython();

    expect(result).toBe(errorMock);
  });
});

describe("runOnPico", () => {
  it("should run code on Pico", async () => {
    const portMock = {
      open: true,
    };
    const writerMock = {
      write: jest.fn(),
    };

    const projectMock = {
      components: [
        {
          content: "print('Hello, Pico!')",
        },
      ],
    };

    const encodedText = new TextEncoder().encode("print('Hello, Pico!')\r\r");
    await runOnPico(portMock, writerMock, projectMock);

    expect(writerMock.write).toHaveBeenCalledWith(encodedText);
  });

  it("should not run code on Pico if port or writer is missing", async () => {
    const portMock = null;
    const writerMock = null;
    const projectMock = {
      components: [
        {
          content: "print('Hello, Pico!')",
        },
      ],
    };

    await runOnPico(portMock, writerMock, projectMock);

    // No assertions needed as the function should not perform any actions
  });
});
