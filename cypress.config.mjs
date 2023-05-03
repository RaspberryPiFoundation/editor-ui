import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    supportFile: false,
    defaultCommandTimeout: 10000,
    screenshotOnRunFailure: (process.env.CI !== 'true'),
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)

          return null
        },
      })
    }
  }
})
