import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    supportFile: false,
    defaultCommandTimeout: 10000,
    video: false,
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message);

          return null;
        },
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
