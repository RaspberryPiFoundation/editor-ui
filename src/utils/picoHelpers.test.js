import {
  downloadMicroPython,
  runOnPico,
  writeFileToPico,
  writeAllFilesToPico,
} from "./picoHelpers";

import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

const encoder = new TextEncoder();

const writerMock = {
  write: jest.fn(),
  releaseLock: jest.fn(),
};

const portMock = {
  open: true,
  writable: {
    getWriter: jest.fn(() => writerMock),
  },
};

const projectMock = {
  components: [
    {
      name: "main",
      content: "print('Hello, Pico!')",
    },
    {
      name: "blink",
      content:
        "from machine import Pin\nled = Pin(25, Pin.OUT)\n\nled.toggle()\n",
    },
    {
      name: "blink",
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
  // it("should run code on Pico", async () => {
  //   const encodedText = encoder.encode("print('Hello, Pico!')\r\r");

  //   await runOnPico(portMock, projectMock);

  //   expect(writerMock.write).toHaveBeenCalledWith(encodedText);
  // });

  it("should not run code on Pico if the port is missing", async () => {
    const portMock = null;

    await expect(runOnPico(portMock, projectMock)).rejects.toThrow(
      "Port is missing"
    );
  });

  describe("writeFileToPico", () => {
    const carriageReturn = encoder.encode("\r");

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
        const helloWorldCommand = encoder.encode(
          `    file.write('${code}\\n')`
        );

        await writeFileToPico(portMock, writerMock, file);

        expect(writerMock.write.mock.calls[0][0]).toEqual(openFileCommand);
        expect(writerMock.write.mock.calls[1][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[2][0]).toEqual(helloWorldCommand);
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
        const importStatement = encoder.encode(
          `    file.write('${codeLineOne}\\n')`
        );
        const codeLineTwo = "led = Pin(25, Pin.OUT)";
        const assignLed = encoder.encode(`    file.write('${codeLineTwo}\\n')`);
        const codeLineThree = "";
        const blankLine = encoder.encode(
          `    file.write('${codeLineThree}\\n')`
        );

        const codeLineFour = "led.toggle()";
        const toggleLed = encoder.encode(
          `    file.write('${codeLineFour}\\n')`
        );

        await writeFileToPico(portMock, writerMock, file);

        expect(writerMock.write.mock.calls[0][0]).toEqual(openFileCommand);
        expect(writerMock.write.mock.calls[1][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[2][0]).toEqual(importStatement);
        expect(writerMock.write.mock.calls[3][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[4][0]).toEqual(assignLed);
        expect(writerMock.write.mock.calls[5][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[6][0]).toEqual(blankLine);
        expect(writerMock.write.mock.calls[7][0]).toEqual(carriageReturn);
        expect(writerMock.write.mock.calls[8][0]).toEqual(toggleLed);
      });
    });
  });

  // describe("writeAllFilesToPico", () => {
  //   it("should writeFileToPico for each file in a project", async () => {
  //     const writeFileToPicoSpy = jest.spyOn(picoHelpers, "writeFileToPico");

  //     await writeAllFilesToPico(portMock, writerMock, projectMock);

  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     expect(writeFileToPicoSpy).toHaveBeenCalledTimes(
  //       projectMock.components.length
  //     );
  //   });
  // });
});
