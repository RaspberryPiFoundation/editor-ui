import { defineConfig } from "cypress";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

dotenv.config();

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    video: false,
    defaultBrowser: "chrome",
    testIsolation: true,
    downloadsFolder: "cypress/downloads",
    setupNodeEvents(on, config) {
      const projectRoot = config.projectRoot ?? process.cwd();
      const downloadsFolder = path.resolve(
        projectRoot,
        config.downloadsFolder || "cypress/downloads",
      );
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
        async getNewestSb3() {
          const pollMs = 100;
          const timeoutMs = 1500;
          const deadline = Date.now() + timeoutMs;

          while (Date.now() < deadline) {
            if (!fs.existsSync(downloadsFolder)) {
              await new Promise((r) => setTimeout(r, pollMs));
              continue;
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

            if (sb3Files.length > 0) {
              return sb3Files[0].path;
            }
            await new Promise((r) => setTimeout(r, pollMs));
          }

          if (!fs.existsSync(downloadsFolder)) {
            throw new Error("Downloads folder not found");
          }
          throw new Error("No .sb3 file found in downloads folder");
        },
        async readSb3(filePath) {
          const buf = fs.readFileSync(filePath);
          const zip = await JSZip.loadAsync(buf);
          const fileNames = Object.keys(zip.files);
          const projectJsonFile = zip.file("project.json");

          if (!projectJsonFile) {
            throw new Error("Invalid .sb3 file: missing project.json");
          }

          const projectJson = JSON.parse(await projectJsonFile.async("string"));

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
