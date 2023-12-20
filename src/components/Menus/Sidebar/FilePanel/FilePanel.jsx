import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import FileMenu from "../../FileMenu/FileMenu";
import NewComponentButton from "../../../Editor/NewComponentButton/NewComponentButton";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import {
  openFile,
  setFocussedFileIndex,
  hideSidebar,
} from "../../../../redux/EditorSlice";

import "../../../../assets/stylesheets/FilePanel.scss";
import "../../../../assets/stylesheets/Sidebar.scss";
import SidebarPanel from "../SidebarPanel";
import FileIcon from "../../../../utils/FileIcon";
import DuplicateIcon from "../../../../assets/icons/duplicate.svg";
import { syncWithPico } from "../../../../utils/apiCallHandler";

const FilePanel = ({ isMobile }) => {
  const project = useSelector((state) => state.editor.project);
  const openFiles = useSelector((state) => state.editor.openFiles);
  const dispatch = useDispatch();

  const switchToFileTab = (panelIndex, fileIndex) => {
    dispatch(setFocussedFileIndex({ panelIndex, fileIndex }));
  };

  const openFileTab = (fileName) => {
    if (openFiles.flat().includes(fileName)) {
      const panelIndex = openFiles
        .map((fileNames) => fileNames.includes(fileName))
        .indexOf(true);
      const fileIndex = openFiles[panelIndex].indexOf(fileName);
      switchToFileTab(panelIndex, fileIndex);
    } else {
      dispatch(openFile(fileName));
      switchToFileTab(0, openFiles[0].length);
    }
    if (isMobile) {
      dispatch(hideSidebar());
    }
  };
  const { t } = useTranslation();

  const syncProjectWithPico = () => {
    // use this to sync all files???
    syncWithPico(project.components);
  };

  const connectToPicoWebSerial = async () => {
    let port = await navigator.serial.requestPort();
    console.log(port);
    await port.open({ baudRate: 115200 }); // this is the Pico Baud Rate?

    const code = "f = open('from_editor.py', 'w')";
    const encoder = new TextEncoder();
    const message = encoder.encode(code);
    const portWriter = port.writable.getWriter(); // get the writer
    try {
      const result = await portWriter.write(message);
      console.log("Successfully written");
      console.log({ result });
    } catch (error) {
      console.log(`Error writing ${error}`);
    } finally {
      portWriter.releaseLock();
    }
    const reader = port.readable.getReader();

    let utf8decoder = new TextDecoder();

    while (port.readable) {
      console.log("Trying to read");
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            console.log(`Completed ${done}`);
            break;
          }
          console.log("VALUE");
          console.log(utf8decoder.decode(value));
        }
      } catch (error) {
        console.log(`Reading error ${error}`);
        // Handle |error|...
      } finally {
        reader.releaseLock();
      }
    }

    // Allow the serial port to be closed later.
    portWriter.close();
    await port.close();
  };

  async function connectAndOpenREPL() {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    const writer = port.writable.getWriter();

    // Send a command to start the MicroPython REPL
    await writer.write(new TextEncoder().encode("\x03")); // Send Ctrl+C to interrupt any running code
    await writer.write(new TextEncoder().encode("\r"));
    await writer.write(new TextEncoder().encode("\r"));
    await writer.write(new TextEncoder().encode("from machine import Pin"));
    await writer.write(new TextEncoder().encode("\r"));
    await writer.write(new TextEncoder().encode("led = Pin(25, Pin.OUT)"));
    await writer.write(new TextEncoder().encode("\r"));
    await writer.write(new TextEncoder().encode("led.toggle()"));
    await writer.write(new TextEncoder().encode("\r"));

    // Send Enter to start REPL
    // Send Enter to start REPL

    // Read data from the MicroPython board (REPL)
    const reader = port.readable.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      console.log(new TextDecoder().decode(value));
    }
  }

  // Call the connectAndOpenREPL function to establish a connection and start the REPL
  connectAndOpenREPL();
  const initialisePicoWebUSB = async () => {
    const device = await navigator.usb.requestDevice({ filters: [{}] });
    await device.open();
    await device.selectConfiguration(1); // Select the configuration number appropriate for your device
    await device.claimInterface(1); // Claim the interface(s) needed for communication
    console.log(device);
    const setupPacket = {
      requestType: "class", // must be "standard", "class" or "vendor"
      recipient: "interface", // ""
      request: 0x22,
      value: 0x01,
      index: 0x01, // the interface number of the recipient
    };

    try {
      const result = await device.controlTransferOut(setupPacket);
      console.log("controlTransferIn");
      console.log(result);
    } catch (error) {
      console.log(`controlTransferOut failed ${error}`);
    }
    await device.releaseInterface(1);
    await device.close();
  };

  const connectToPicoWebUSB = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [{}] });
      await device.open();
      await device.selectConfiguration(1); // Select the configuration number appropriate for your device
      await device.claimInterface(1); // Claim the interface(s) needed for communication
      console.log(device);

      //   // Now you can use device.transferOut() or other methods to send data
      const encoder = new TextEncoder();
      const data = encoder.encode(
        "from machine import Pin\nled = Pin(25, Pin.OUT)\n\nled.toggle()\n",
      );

      const endPointOut = 2;
      const result = await device.transferOut(endPointOut, data); // looks like 2 is the endpoint for TransferIn TransferOut
      console.log("Data sent successfully");
      console.log(result);
    } catch (error) {
      console.log(`Error writing ${error}`);
    }

    //   console.log("Trying to read!");
    //   // Use transferIn to read data
    //   const endPointIn = 2;
    //   const maxPacketSize = 64;
    //   let result;
    //   try {
    //     debugger;
    //     result = await device.transferIn(endPointIn, maxPacketSize);
    //     // Extract the data from the result
    //     console.log("Never reaches here?");
    //     const receivedData = new Uint8Array(result.data.buffer);

    //     // Now you can work with the receivedData array

    //     console.log("Data received:", receivedData);
    //   } catch (error) {
    //     console.error("Error reading RP2040:", error);
    //   }
    //   // Max packet size

    //   //   // Don't forget to release the interface and close the device when done
    //   await device.releaseInterface(1);
    //   await device.close();
    // } catch (error) {
    //   console.error("Error connecting to RP2040:", error);
    // }
  };

  return (
    <SidebarPanel heading={t("filePanel.files")} Button={NewComponentButton}>
      {project.components.map((file, i) => (
        <div className="files-list-item-wrapper" key={i}>
          <DesignSystemButton
            className="files-list-item"
            onClick={() => openFileTab(`${file.name}.${file.extension}`)}
            text={`${file.name}.${file.extension}`}
            icon={<FileIcon ext={file.extension} />}
            type="tertiary"
            textAlways
            small
          />
          {(file.name === "main" && file.extension === "py") ||
          (file.name === "index" && file.extension === "html") ? null : (
            <div className="files-list-item__menu">
              <FileMenu
                fileKey={i}
                name={file.name}
                ext={file.extension}
                content={file.content}
              />
            </div>
          )}
        </div>
      ))}
      <DesignSystemButton
        className="files-list-item"
        onClick={syncProjectWithPico}
        text="Sync Pico"
        icon={<DuplicateIcon />}
        textAlways
      />
      <DesignSystemButton
        className="files-list-item"
        onClick={connectAndOpenREPL}
        text="Connect"
        icon={<DuplicateIcon />}
        textAlways
      />
    </SidebarPanel>
  );
};

export default FilePanel;
