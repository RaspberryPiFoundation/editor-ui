import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    supportFile: false,
    defaultCommandTimeout: 150000,
    screenshotOnRunFailure: (process.env.CI !== 'true')
  }
})
