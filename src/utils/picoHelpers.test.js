import { downloadMicroPython, runOnPico, writeFileToPico } from "./picoHelpers";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

const projectMock = {
  components: [
    {
      name: "main",
      content: "print('Hello, Pico!')",
    },
    {
      name: "anotherFile",
      content:
        "from machine import Pin\nled = Pin(25, Pin.OUT)\n\nled.toggle()\n",
    },
  ],
};

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
    const encodedText = new TextEncoder().encode("print('Hello, Pico!')\r\r");
    await runOnPico(portMock, writerMock, projectMock);

    expect(writerMock.write).toHaveBeenCalledWith(encodedText);
  });

  it("should not run code on Pico if the port is missing", async () => {
    const portMock = null;
    const writerMock = {
      write: jest.fn(),
    };
    await expect(runOnPico(portMock, writerMock, projectMock)).rejects.toThrow(
      "No port or writer available"
    );
  });

  it("should not run code on Pico if the writer is missing", async () => {
    const portMock = {
      open: true,
    };
    const writerMock = null;
    await expect(runOnPico(portMock, writerMock, projectMock)).rejects.toThrow(
      "No port or writer available"
    );
  });

  describe("writeFileToPico", () => {
    const portMock = {
      open: true,
    };
    const writerMock = {
      write: jest.fn(),
    };
    const encoder = new TextEncoder();
    it("should send the command to open the file with the correct name", async () => {
      const encodedText = encoder.encode("with open('main.py', 'w') as file:");

      await writeFileToPico(portMock, writerMock, projectMock.components[0]);

      expect(writerMock.write).toHaveBeenCalledWith(encodedText);
    });
    it("should send the code for a simple, single-line file", async () => {
      const line = `    file.write('print('Hello, Pico!')\\n')`;
      const encodedText = encoder.encode(line);

      await writeFileToPico(portMock, writerMock, projectMock.components[0]);

      expect(writerMock.write).toHaveBeenCalledWith(encodedText);
    });
  });
});
