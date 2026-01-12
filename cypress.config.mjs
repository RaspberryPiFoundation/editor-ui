import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    video: false,
    defaultBrowser: "chrome",
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message);

          return null;
        },
      });
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.name === "chrome") {
          console.log("Applying Chrome launch options");
          launchOptions.args.push("--enable-features=SharedArrayBuffer");
          launchOptions.args.push("--disable-site-isolation-trials");
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
