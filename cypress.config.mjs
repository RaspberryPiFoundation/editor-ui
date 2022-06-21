import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    supportFile: false,
    defaultCommandTimeout: 10000,
    screenshotOnRunFailure: false
  }
})
