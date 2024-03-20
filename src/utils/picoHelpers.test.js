import { downloadMicroPython, runOnPico, writeFileToPico } from "./picoHelpers";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

const encoder = new TextEncoder();

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

    const micropythonUrl =
      "https://micropython.org/download/rp2-pico/rp2-pico-latest.uf2";

    document.createElement = jest.fn(() => linkMock);
    document.body.appendChild = jest.fn();

    const result = await downloadMicroPython();

    expect(result).toBe("Success");
    expect(linkMock.href).toBe(micropythonUrl);
    expect(linkMock.download).toBe("rp2-pico-latest.uf2");
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(document.body.appendChild).toHaveBeenCalledWith(linkMock);
    expect(linkMock.click).toHaveBeenCalled();
  });

  it("should return an error if the download fails", async () => {
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
    const encodedText = encoder.encode("print('Hello, Pico!')\r\r");
    await runOnPico(portMock, writerMock, projectMock);

    expect(writerMock.write).toHaveBeenCalledWith(encodedText);
  });

  it("should not run code on Pico if the port is missing", async () => {
    const portMock = null;
    const writerMock = {
      write: jest.fn(),
    };
    await expect(runOnPico(portMock, writerMock, projectMock)).rejects.toThrow(
      "Port is missing"
    );
  });

  it("should not run code on Pico if the writer is missing", async () => {
    const portMock = {
      open: true,
    };
    const writerMock = null;
    await expect(runOnPico(portMock, writerMock, projectMock)).rejects.toThrow(
      "Writer is missing"
    );
  });

  describe("writeFileToPico", () => {
    const portMock = {
      open: true,
    };

    const writerMock = {
      write: jest.fn(),
    };

    const carriageReturn = encoder.encode("\r");
    const newLine = encoder.encode("\n");

    describe("for a single-line file", () => {
      const file = {
        name: "main",
        content: `print("Hello Pico")`,
      };

      it("should send the correct sequence of encoded MicroPython commands", async () => {
        const openFileCommand = encoder.encode(
          "with open('main.py', 'w') as file:"
        );
        const code = `print("Hello Pico")`;
        const writeCommand = encoder.encode(`    file.write('${code}\\n')`);

        await writeFileToPico(portMock, writerMock, file);

        expect(writerMock.write.mock.calls[0][0]).toEqual(openFileCommand);
        expect(writerMock.write.mock.calls[1][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[2][0]).toEqual(writeCommand);
        expect(writerMock.write.mock.calls[3][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[4][0]).toEqual(carriageReturn);
      });
    });

    describe("for a multi-line file", () => {
      const file = {
        name: "blink",
        content:
          "from machine import Pin\nled = Pin(25, Pin.OUT)\n\nled.toggle()\n",
      };

      it("should send the correct sequence of encoded MicroPython commands", async () => {
        const openFileCommand = encoder.encode(
          "with open('blink.py', 'w') as file:"
        );
        const codeLineOne = "from machine import Pin";
        const writeCommandOne = encoder.encode(
          `    file.write('${codeLineOne}\\n')`
        );
        const codeLineTwo = "led = Pin(25, Pin.OUT)";
        const writeCommandTwo = encoder.encode(
          `    file.write('${codeLineTwo}\\n')`
        );
        const codeLineThree = "";
        const writeCommandThree = encoder.encode(
          `    file.write('${codeLineThree}\\n')`
        );

        const codeLineFour = "led.toggle()";
        const writeCommandFour = encoder.encode(
          `    file.write('${codeLineFour}\\n')`
        );

        await writeFileToPico(portMock, writerMock, file);

        expect(writerMock.write.mock.calls[0][0]).toEqual(openFileCommand);
        expect(writerMock.write.mock.calls[1][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[2][0]).toEqual(writeCommandOne);
        expect(writerMock.write.mock.calls[3][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[4][0]).toEqual(writeCommandTwo);
        expect(writerMock.write.mock.calls[5][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[6][0]).toEqual(writeCommandThree);
        expect(writerMock.write.mock.calls[7][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[8][0]).toEqual(writeCommandFour);
      });
    });
  });
});
