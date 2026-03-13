import { defineConfig } from "cypress";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

dotenv.config();

const downloadsFolder = path.join(process.cwd(), "cypress", "downloads");

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    video: false,
    defaultBrowser: "chrome",
    testIsolation: true,
    downloadsFolder: "cypress/downloads",
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message);

          return null;
        },
        resetDownloads() {
          if (fs.existsSync(downloadsFolder)) {
            const files = fs.readdirSync(downloadsFolder);
            for (const file of files) {
              fs.unlinkSync(path.join(downloadsFolder, file));
            }
          } else {
            fs.mkdirSync(downloadsFolder, { recursive: true });
          }

          return null;
        },
        getNewestSb3() {
          if (!fs.existsSync(downloadsFolder)) {
            throw new Error("Downloads folder not found");
          }
          const files = fs.readdirSync(downloadsFolder);
          const sb3Files = files
            .filter((f) => f.endsWith(".sb3"))
            .map((f) => ({
              name: f,
              path: path.join(downloadsFolder, f),
              mtime: fs.statSync(path.join(downloadsFolder, f)).mtimeMs,
            }))
            .sort((a, b) => b.mtime - a.mtime);

          if (sb3Files.length === 0) {
            throw new Error("No .sb3 file found in downloads folder");
          }
          return sb3Files[0].path;
        },
        async readSb3(filePath) {
          const buf = fs.readFileSync(filePath);
          const zip = await JSZip.loadAsync(buf);
          const fileNames = Object.keys(zip.files);
          const projectJsonFile = zip.file("project.json");
          const projectJson = projectJsonFile
            ? JSON.parse(await projectJsonFile.async("string"))
            : null;

          return { fileNames, projectJson };
        },
      });
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.name === "chrome") {
          console.log("Applying Chrome launch options");
          launchOptions.args.push("--enable-features=SharedArrayBuffer");
          launchOptions.args.push("--disable-site-isolation-trials");
          launchOptions.args.push("--enable-unsafe-swiftshader");
          launchOptions.preferences = {
            ...launchOptions.preferences,
            "download.default_directory": downloadsFolder,
          };
        }
        return launchOptions;
      });
    },
    retries: {
      runMode: 3,
      openMode: 0,
    },
  },
  env: {
    REACT_APP_API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT,
  },
});
