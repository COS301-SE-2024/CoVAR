const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3050",
    setupNodeEvents(on, config) {
      on('task', {
        logDOM(domString) {
          console.log(domString);
          return null;
        }
      });
    },
  },
});
